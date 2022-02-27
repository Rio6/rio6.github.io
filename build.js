const fs = require('fs');
const path = require('path');
const glob = require('glob');

const {JSDOM} = require('jsdom');
const showdown = require('showdown');
require('showdown-highlightjs-extension');

const READ_DIR = './blog';
const WRITE_DIR = './dist';
const TEMPLATE = './template.html';

const langName = {
    en: "English",
    'zh-TW': "繁體中文"
};

const makeHTML = (template, name, title, content, langs, lang) => {
    const jsdom = new JSDOM(template);
    const document = jsdom.window.document;

    document.getElementById('title').innerHTML = title;
    document.getElementById('content').innerHTML = content;

    document.getElementById('lang-select').innerHTML =
        `<li>${langName[lang] || lang}</li>` +
        langs.map(l => l && l !== lang && `
            <li>
                <a href="${name}.${l}.html">
                    ${langName[l] || l}
                </a>
            </li>
        ` || '').reduce((a,c) => a+c, '');

    if(process.env.NODE_ENV === 'development') {
        const livejs = document.createElement('script');
        livejs.src = 'https://livejs.com/live.js';
        document.getElementsByTagName('head')[0].appendChild(livejs);
    }

    return jsdom.serialize();
};

if(!fs.existsSync(WRITE_DIR)) {
    fs.mkdirSync(WRITE_DIR);
}

const converter = new showdown.Converter({
    customizedHeaderId: true,
    parseImgDimensions: true,
    openLinksInNewWindow: true,
    tables: true,
    extensions: ['highlightjs']
});

let template = fs.readFileSync(TEMPLATE, 'utf-8');
let tempStat = fs.statSync(TEMPLATE);
let progStat = fs.statSync(process.argv[1]);

let posts = [];
let changed = false;

// Blog posts
let files = glob.sync(path.join(READ_DIR, '*.md'));
for(let file of files) {

    let name = path.basename(file).replace(/(\.[^.]+)*\.md$/, '');

    let data = fs.readFileSync(file, 'utf-8');
    let content = converter.makeHtml(data)

    let getLang = file => file.match(/(\.([^.]+))*\.md$/)[2];
    let lang = getLang(file);
    let langs = glob.sync(file.replace(/\.[^.]+\.md$/, '.*.md')).map(getLang);

    let target = path.join(WRITE_DIR, path.relative(READ_DIR, file.replace(/\.md$/, '.html')));

    let postDom = new JSDOM(content).window.document;
    let title = postDom.getElementById('title')?.innerHTML;
    let date = postDom.getElementById('date')?.innerHTML;
    let image = postDom.getElementsByTagName('img')[0]?.src;

    posts.push({
        name: name,
        title: title,
        image: image,
        date: date,
        lang: lang
    });

    // Only update file when the last modify time is older
    let fstat = fs.existsSync(file) && fs.statSync(file) || {};
    let tstat = fs.existsSync(target) && fs.statSync(target) || {};
    if(Math.max(fstat.mtime, tempStat.mtime, progStat.mtime) < tstat.mtime) {
        console.log("skip", file);
        continue;
    }
    changed = true;

    // write file
    fs.writeFile(target, makeHTML(template, name, title, content, langs, lang), err => {
        if(err) throw(err);
        console.log(file, "->", target);
    });
}

// Main page
if(changed) {
    let langs = posts.map(p => p.lang);
    langs = langs.filter((l,i) => langs.indexOf(l) === i);

    for(let lang of langs) {
        if(!lang) continue;

        let content = "";

        for(let post of posts.filter(p => !p.lang || p.lang === lang).reverse()) { // File with bigger filename comes first
            content += `
                <div class="post">
                    <a href="${post.name}.${post.lang}.html">
                        <h1>${post.title}</h1>
                        <h2>${post.date}</h2>
                        ${post.image && `<img src="${post.image}" loading="lazy" />` || ''}
                    </a>
                </div>
            `;
        }

        let target = path.join(WRITE_DIR, `index.${lang}.html`);
        fs.writeFile(target, makeHTML(template, 'index', "Rio's Blog", content, langs, lang), err => {
            if(err) throw(err);
            console.log("index ->", target);
        });
    }
} else console.log("skip index");
