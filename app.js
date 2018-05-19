const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const util = require('util');

const appendFile = util.promisify(fs.appendFile);

const CONFIG = {
    input: 'test.txt',
    out:'out.txt',
    url: 'https://translate.google.cn/#en/zh-CN/'
};

const inputPath = path.join(__dirname,CONFIG.input);
const outPath = path.join(__dirname,CONFIG.out);

const trans = async ()=>{
    try {
        //打开浏览器，进入谷歌翻译网页
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(CONFIG.url);

        fs.writeFileSync(outPath,'');
        //读取文档
        let fr = fs.readFileSync(inputPath,"utf-8");
        let tmpArr = [];
        fr.split('\n').forEach((line,index)=>{
            let tmp = line.trim();
            tmp.length > 0 && tmpArr.push(' '+tmp)
        });

        for(let i=0; i<tmpArr.length; i++){
            let tmpInput = tmpArr[i];
            await page.type('#source', tmpInput,{delay: 10});
            page.click('#src-translit');
            await page.waitFor(1500);
            let transOutput = await page.evaluate(() => {
                let text='';
                if(document.querySelector('#result_box span')){
                    [...document.querySelectorAll('#result_box span')].forEach((nod)=>{
                        text+=nod.innerText;
                    })
                }
                return text;
            });
            await appendFile(outPath,tmpInput+'\n');
            await appendFile(outPath,transOutput+'\n');
            await page.waitFor(500);
            page.click('#gt-clear');
        }
        await page.waitFor(1000);
        browser.close();
    }catch (e) {
        console.log(e);
    }

};

trans();