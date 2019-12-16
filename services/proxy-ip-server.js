// "use strict"

import IpModel from "../model/proxy-ip-model"
import request from "request"
// import db from "../model/db-connect"
// import "../prototype/string-prototype"

class IpServer {

    constructor() {
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    getRandomIp() {
        return new Promise((resolve, reject) => {
            IpModel.find({}, async (err, docs) => {
                if (err) {
                    console.log('出错' + err);
                    reject(err)
                }
                // console.info(!docs.length) //用来判断array是空的
                if (docs.length) {
                    let id = this.getRandomInt(docs.length)
                    let ip = docs[id]['ip']
                    // try
                    await this.check(ip)
                    resolve(ip)
                }else{
                    reject("代理IP数据为空")
                }
            });
        })
    }

    async check(ip) {
        let option = {
            proxy: 'http://' + ip,
        }
        request('http://httpbin.org/ip', option, async(error, response, body) => {
            // console.log(response)
            // console.log(body)
            if (!error && response.statusCode == 200) {
                // console.log(response)
                console.log(`${ip} 代理IP Check通过，可用`)
            } else {
                try {
                   await this.delIpData(ip)
                   await this.getRandomIp()
                } catch (error) {
                    console.log(error)
                }

            }
        })
    }

    async delIpData(ip) {
        return new Promise((resolve, reject) => {
            IpModel.deleteOne({ ip: ip }, (err) => {
                if (err) {
                    console.log('出错' + err);
                    reject(err)
                }
                resolve("success")
            });
        })
    }

}

export default IpServer


// (async ()=>{
//     let ip = new IpServer()
//     try {
//         const ips =  await ip.getRandomIp()
//     } catch (error) {
//         console.log(error)
//     }
//     // console.log(ips)
// })()


// let option = {
//     proxy: 'http://114.249.119.71:9000'
// }

// request('http://httpbin.org/ip',option,(error,response,body)=>{
//         console.log(error)
//         console.log(response)
//         console.log(body)
//     //   if(response.statusCode==200){
//     //     console.log(response)
//     //   }else{
//     //     console.log(200)
//     //     try {
//     //         this.delIpData(ip)
//     //         this.getRandomIp()
//     //     } catch (error) {

//         // }

//     //   }
// })