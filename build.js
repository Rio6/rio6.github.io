var fs = require('fs');
var path = require('path');
var glob = require('glob');

var {JSDOM} = require('jsdom');
var showdown = require('showdown');
require('showdown-highlightjs-extension');

const READ_DIR = './blog';
const WRITE_DIR = './dist';
const TEMPLATE = './template.html';

if(!fs.existsSync(WRITE_DIR)) {
    fs.mkdirSync(WRITE_DIR);
}

let converter = new showdown.Converter({
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

    let data = fs.readFileSync(file, 'utf-8');
    let name = path.basename(file).replace(/.md$/, '');
    let target = path.join(WRITE_DIR, name + '.html');

    let fstat = fs.existsSync(file) && fs.statSync(file) || {};
    let tstat = fs.existsSync(target) && fs.statSync(target) || {};
    if(Math.max(fstat.mtime, tempStat.mtime, progStat.mtime) < tstat.mtime) {
        console.log("skip", file);
        continue;
    }
    changed = true;

    let content = converter.makeHtml(data)

    let postDom = new JSDOM(content).window.document;
    let title = postDom.getElementById('title').innerHTML;
    let date = postDom.getElementById('date').innerHTML;
    let image = postDom.getElementsByTagName('img')[0]?.src;

    posts.push({
        name: name,
        title: title,
        image: image,
        date: date
    });

    let htmlDom = new JSDOM(template).window.document;
    htmlDom.getElementById('title').innerHTML = title;
    htmlDom.getElementById('content').innerHTML = content;

    fs.writeFile(target, htmlDom.documentElement.outerHTML, err => {
        if(err) throw(err);
        console.log(file, "->", target);
    });
}

// Main page
if(changed) {
    let content = "";

    for(let post of posts.reverse()) { // File with bigger filename comes first
        content += `
            <div class="post">
                <a href="${post.name + '.html'}">
                    <h1>${post.title}</h1>
                    <h2>${post.date}</h2>
                    ${post.image && `<img src="${post.image}" />` || ''}
                </a>
            </div>
        `;
    }

    let htmlDom = new JSDOM(template).window.document;
    htmlDom.getElementById('title').innerHTML = "Rio's Blog";
    htmlDom.getElementById('content').innerHTML = content;

    let target = path.join(WRITE_DIR, 'index.html');
    fs.writeFile(target, htmlDom.documentElement.outerHTML, err => {
        if(err) throw(err);
        console.log("index ->", target);
    });
} else console.log("skip index");
