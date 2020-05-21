var fs = require('fs');
var path = require('path');
var glob = require('glob');

var {Converter} = require('showdown');
var plates = require('plates');

const READ_DIR = './blog';
const WRITE_DIR = './dist';
const TEMPLATE = './template.html';

if(fs.existsSync(WRITE_DIR)) {
} else {
    fs.mkdirSync(WRITE_DIR);
}

let converter = new Converter({
    parseImgDimensions: true
});

let template = fs.readFileSync(TEMPLATE, 'utf-8');
let posts = [];

// Blog posts
let files = glob.sync(path.join(READ_DIR, '*.md'));
for(let file of files) {
    let data = fs.readFileSync(file, 'utf-8');

    let name = path.basename(file).replace(/.md$/, '');
    let [_, date, title, image] = data.match(/\[([0-9\-]+)\]::.*# (.*?)\n.*!\[.*\]\((.*)\)/s);
    console.log(image);
    posts.push({
        name: name,
        title: title,
        image: image,
        date: date
    });

    let html = plates.bind(template, {
        title: title,
        content: converter.makeHtml(data)
    });
    let target = path.join(WRITE_DIR, name + '.html');
    fs.writeFile(target, html, err => {
        if(err) throw(err);
        console.log(file, "=>", target);
    });
}

// Main page
let content = `
# Rio's Blog
`

for(let post of posts.reverse()) { // File with bigger filename comes first
    content += `
<a href="${post.name + '.html'}">
## ${post.title}
<span class=date>${post.date}</span>

![image](${post.image})
</a>
    `;
}

let html = plates.bind(template, {
    title: "Rio's Blog",
    content: converter.makeHtml(content)
});
let target = path.join(WRITE_DIR, 'index.html');
fs.writeFile(target, html, err => {
    if(err) throw(err);
    console.log("index =>", target);
});
