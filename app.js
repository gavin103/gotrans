const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const readFile = require("util").promisify(fs.readFile);

const CONFIG = {
    file: 'test.txt',
    url: 'https://translate.google.cn/#en/zh-CN/',
};

let filePath = path.join(__dirname,'test.txt');

async function read(filePath) {
    try {
        const fr = await readFile(filePath,"utf-8");
        return fr;
    } catch (err) {
        console.log('Error', err);
    }
}

async function run(origin) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = CONFIG.url;
    let str = encodeURIComponent(origin);
    await page.goto(url+str);
    const USER_SELECTOR = '#result_box > span';
    let result = await page.evaluate((sel) => {
        return document.querySelector(sel).innerHTML;
    }, USER_SELECTOR);
    browser.close();
    return result;
}

async function main(){
    let test = await read(filePath);
    const tmpArr = test.split('\n');
    tmpArr.forEach(async value =>{
        let res = await run(value)
        console.log(res);
    })
}

main();