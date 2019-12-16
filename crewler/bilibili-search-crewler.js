import puppeteer from 'puppeteer';
import IpServer from '../services/proxy-ip-server';
import db from "../model/db-connect"
import range from '../prototype/string-prototype';
import path from 'path'

// 'https://search.bilibili.com/all?keyword='

const test_url = 'http://search.bilibili.com/all?keyword='

class BilibliSearchCrewler {

    constructor(search_keyword) {
        if (search_keyword) {
            this.search_keyword = search_keyword
        } else {
            throw "search_keyword null"
        }

    }

    async run(...args) {
        /*
        * args
        0 true isHeadless 是否开启浏览器 
        1 综合排序 最多点击 最新发布 最多弹幕 最多收藏
        2 mongo 表后缀名控制 tableSuffix
        3 pageNum
        */
        // console.log(args[0])
        await this.init(args[0])
        this.url = test_url + this.search_keyword
        console.log(this.url)
        await this.start(this.url)
        // console.log(args[1])
        await this.parse(args[1], args[2],args[3])
        // await this.storeData(result)
        await this.tearDwown()
        // process.kill(args[3])
    }

    timeout(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(1);
                } catch (e) {
                    reject(0)
                }
            }, delay);
        });
    }

    async init(isHeadless) {
        // '--proxy-server=socks5://127.0.0.1:1088'
        let ipServer = new IpServer()
        let ip = ''
        let proxy = ''
        try {
            ip = await ipServer.getRandomIp();
            // let proxy = '--proxy-server=http://' + ip
            proxy = '--proxy-server=' + ip
        } catch (error) {
            console.log(error)
        }
        let retry = 0
        while (retry < 2) {
            try {
                await this.config(isHeadless, proxy)
                break
            } catch (error) {
                if (retry == 1) {
                    console.log(error)
                }
                retry += 1
            } finally {
                // console.log(retry)
                if (retry == 1) {
                    console.log('重试启动Chromium；仅一次')
                    continue
                } else {
                    break
                }
            }
        }

    }
    async config(isHeadless, proxy) {

        this.browser = await puppeteer.launch({
            headless: isHeadless,
            ignoreHTTPSErrors: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "–disable-gpu",
                "–disable-dev-shm-usage",
                "–disable-setuid-sandbox",
                "–no-first-run",
                "–no-zygote",
                "–single-process"
                // proxy
            ]
        });
        this.page = await this.browser.newPage();
        // set a timeout of 8 minutes
        await this.page.setDefaultNavigationTimeout(480000)
        await this.page.setViewport({ width: 1300, height: 1500 })
    }

    async start(path) {
        try {
            let page = this.page
            await page.goto(path)
            const dimensions = await page.evaluate(() => {
                return {
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.clientHeight,
                    deviceScaleFactor: window.devicePixelRatio
                };
            });
            // console.log('Dimensions:', dimensions);
        } catch (error) {
            console.log(error)
            console.log("start error");
        }


    }

    async parse(...args) {
        // this.page.type()
        
    }

    async storeData(...args) {

    }

    async screenshot(customStr) {
        try {
            let filePrefix = test_url.split('/').reverse()[1]
            let fileName = filePrefix + '_' + (new Date()).toLocaleString().replace(/ /g, '').replace(/\//g, '-')
                .replace(',', '_').replace(/:/g, '.')+customStr+ '.png'
            // console.log(filename)
            const filePath = path.join(__dirname, '../screen_shot/')
            await this.page.screenshot({ path: filePath + fileName });
        } catch (error) {
            console.log('截图失败')
        }
    }

    async tearDwown() {
        try {
            await this.screenshot('')
            await this.browser.close();
            console.log('teardown success')
        } catch (error) {
            console.log(error)
            console.log("teardown error")
        }

    }
}

export default BilibliSearchCrewler


// let a = new BilibliSearchCrewler('11')
// a.run()

// a.run()