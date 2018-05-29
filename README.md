# 用JS搞了一个自动翻译，从此不再头疼看英文书了

小记：作为一个有追求的码农，“懒”，不一定是一个贬义词。有时候“懒”，才是进步的动力！
 
 ## 背景
 经常遇到这样的情况，发现一本眼馋的技术书📚，却发现只有英文版。慢慢啃吗？真的很痛苦。于是灵光一闪，我需要这样一个小工具，点击运行可以批量的完成翻译任务。于是，去吧皮卡丘！
 
 ## 技术选型
 - 翻译一直信任某歌（科学上网）；
 - 作为一名小前端，希望用JS一桶天下；
 
 ## 辛路例程
 ### 尝试一：
 用某歌翻译的API，翻山越岭，翻江倒海的查到了API的用法，确实很好用。但是在尝试过程中发现，还需要VISA注册。于是扑街😈！
 ### 尝试二：
 用cheerio做个爬虫？做了一半才想起来，翻译出的数据是JS嵌入的，cheerio是无法抓取到的，被自己蠢哭😭！
 ### 尝试三：
 祭出大招，使用无头浏览器，模拟人工翻译过程，啥过程？英文输入->翻译->将中文输入拷贝到指定文档😝。
 
 ## Show Me the CODE！
```
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const util = require('util');

const appendFile = util.promisify(fs.appendFile);

const CONFIG = {
    input: 'React/ch09.txt',
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
            console.log(i,tmpInput);
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

```
 
 ## 娓娓道来
 - 无头浏览器选用的是puppeteer，因为想接触一下这个PhantomJS的继承者。
 - 作为脚本运行在node环境中，当然充分利用Node的原生API了（fs,util,path）。
 - 使用了async/await, 让异步代码看着更优雅一点。
 - 将异步的fs.appendFile Promise化。
 - Puppeteer的API，就简单用了几个：
    - puppeteer.launch 打开浏览器
    - browser.newPage 新建页面
    - page.goto 跳转到制定网址
    - page.type 模拟用户输入
    - page.click 模拟点击事件，参数为被点击元素的选择器
    - page.waitFor 等待，为什么要等待？JS单线程，你懂得，慢，拖拉机一样慢！
    - browser.close 关闭浏览器，点击红叉退出。
    - 最重要的就是page.evaluate了，通过回调函数，轻松操作返回页面的dom。
    
> 大概就这些，欢迎各位过路大神拍砖。
