const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const readFile = require("util").promisify(fs.readFile);

const CONFIG = {
    file: 'test.txt',
    url: 'https://translate.google.cn/#en/zh-CN/',
};

let filePath = path.join(__dirname,CONFIG.file);

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(CONFIG.url,{waitUntil: 'networkidle2'});
    let fr = await readFile(filePath,"utf-8");
    const tmpArr = fr.split('\n');

    for(let i=0; i<tmpArr.length; i++){
        await page.type('#source', tmpArr[i], {delay: 100});
        page.click('#src-translit');
        await page.waitFor(1000);
        let targetLink = await page.evaluate(() => {
            let text =  document.querySelector('#result_box span').innerText;
            return text;
        });
        console.log(i,tmpArr[i]);
        console.log(targetLink);
        page.click('#gt-clear');
        await page.waitFor(1000);
    }
    await page.waitFor(1000);
    browser.close();
})();