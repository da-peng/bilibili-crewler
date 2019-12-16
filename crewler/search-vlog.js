import puppeteer from 'puppeteer';
import IpServer from '../services/proxy-ip-server';
// import db from "../model/db-connect"
import BilibliSearchCrewler from "./bilibili-search-crewler"
import range from '../prototype/string-prototype'
import VLogInfoSchema from '../model/vlog-info-model'

// const keyword = 'Vlog'


const delays = 5000
class SearchVlog extends BilibliSearchCrewler {

    constructor(...args) {
        super(...args)

    }

    async run(...args) {
        super.run(...args)
    }


    async parse(filterTypeNum, tableSuffix, nextPageNum) {
        // 1综合排序 2最多点击 3最新发布 4最多弹幕 5最多收藏
        await this.page.waitFor(delays)
        const order_css = 'div.filter-wrap >ul.filter-type.clearfix.order > li:nth-child(' + filterTypeNum + ') >a'
        // console.log(order_css)
        // console.log(this.page)
        try {
            let content = await this.page.evaluate((order_css, filterTypeNum) => {
                let el = document.querySelector(order_css)
                if (filterTypeNum > 1) {
                    el.click();
                }
                return el.innerText
            }, order_css, filterTypeNum);
            // let content = await this.page.$eval(order_css, el => el.innerText, { delay: delays })
            if (filterTypeNum > 1) {
                //考虑在至少500毫秒内没有超过networkidle0 2个网络连接时完成导航。
                // await this.page.waitForNavigation({timeout: 480000})
                await this.page.waitForNavigation({ waitUntil: 'networkidle0' })
            }
            console.log(content)
        } catch (error) {
            console.log(error)
            console.log("error 1")
        }
        let pageNum = nextPageNum
        // console.log(pageNum)
        for (let i = 0; i < pageNum; i++) {
            // 单页，每页存一次
            let result = await this.parseVideoList()
            await this.storeData(tableSuffix, result)
            // console.log(tableSuffix + '_page_' + (i + 1))
            // await this.screenshot(tableSuffix + '_page_' + (i + 1))
            // 页面切换, 第二页index 从3开始
            let index = 1
            if (i==1){
                index=i+2// 1->3 
            }else if(i==(pageNum-1)){ //最后一次不用再去下一页了，去了也不parseVideoList
                break 
            }else if(i>=5){
                index=8//  6之后的第7页index =8 
                //index = 8
            }else{
                index=i+3
            }
            try {
                let page_index = 'div.page-wrap > div > ul > li:nth-child(' + index + ')'
                await this.page.click(page_index)
                await this.page.waitForNavigation({ waitUntil: 'networkidle0' })
            } catch (error) {
                console.log("换页报错")
                console.log(error)
                break
            }
        }

    }

    async parseVideoList() {
        // 取前limit-1个, 1页有20个,然后换页
        const limit = 21
        // 视频列表
        let result = new Array()
        for (let i of range(1, limit)) {
            try {
                const video_list = 'ul.video-contain.clearfix > li:nth-child(' + i + ')'
                // console.log(video_list)
                // let  video = await this.page.$ (video_list,el => el.outerHTML)
                    let video = await this.page.$(video_list)
                //解析视频信息
                // console.log(video)
                result[i - 1] = await this.parseVideoInfo(video)
            } catch (error) {
                console.log(error)
                console.log("error 2")
            }

        }
        return result
        // console.table(result)
    }

    async parseVideoInfo(videoEle) {
        // this.page.$eval( video_list,e=>console.log(e),{delay:10000})
        // title/视频链接 
        const title_and_href = 'a'
        let title_and_hrefElem = await videoEle.$(title_and_href)
        let href = await (await title_and_hrefElem.getProperty('href')).jsonValue()
        let title = await (await title_and_hrefElem.getProperty('title')).jsonValue()
        // console.log(title)

        // 视频信息
        const info = '.info'
        const videoInfoEle = await videoEle.$(info)
        // headline 视频类型标签
        const video_info = 'div.headline.clearfix > span:nth-child(2)'
        const video_tag = await videoInfoEle.$(video_info)
        let tag_name = await (await video_tag.getProperty('textContent')).jsonValue()
        // console.log(tag_name)
        // tags 1观看 2弹幕  3上传时间  4up主(名字/链接)
        let tagsContent = new Array()
        let name
        let live_href
        for (let index of range(1, 5)) {
            const tag = '.tags > span:nth-child(' + index + ')'
            if (index == 4) {
                let tagsB = await videoInfoEle.$(tag + '> a')
                name = await (await tagsB.getProperty('innerText')).jsonValue()
                live_href = await (await tagsB.getProperty('href')).jsonValue()
                // console.log(name,live_href)
            }
            // let s = (await video_tag.getProperty('outerHTML')).toString()
            // console.log(s)
            let tagsA = await videoInfoEle.$(tag)
            // console.log(tagsA)
            let str = (await (await tagsA.getProperty('textContent')).jsonValue()).replace("\\n", "").trim()
            if (str.search("万") != -1) {
                let num = parseFloat(str.replace(/万/g, "")* 10000) >> 0
                tagsContent[index - 1] = (num) //浮点型
            } else {
                tagsContent[index - 1] = str
            }

            // console.log(tagsContent)
        }
        return {
            title: title,// 视频标题
            video_link: href.split('?')[0], //视频链接
            video_slink: href, //视频链接 带seid
            tag_name: tag_name,// 视频分类标签
            watch_num: tagsContent[0], // 观看人数
            barrages: tagsContent[1] >> 0,//弹幕数
            upload_time: new Date(tagsContent[2].replace(/-/g, "/")), //上传时间
            author: name,// up主名字
            author_home_link: live_href.split('?')[0] //up主直播间地址
        }
    }

    async storeData(index, arrayData) {
        // console.log(arrayData)
        var options = {
            // Return the document after updates are applied
            // new: true,
            // Create a document if one isn't found. Required
            // for `setDefaultsOnInsert`
            upsert: true,
            // setDefaultsOnInsert: true
        };
        VLogInfoSchema(index).insertMany(arrayData, options,function (err,data) {
            if (err) {
                // console.log(err)
                console.log("重复数据")
            }
        });
    }

}

export default SearchVlog
// let vlog = new SearchVlog(keyword)
// vlog.run(true, 1)


// nodemon --exec babel-node ./model/mongodbConnect.js