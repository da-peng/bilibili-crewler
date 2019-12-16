// import { expect } from "chai"
// import sayHello from "./index"
// import db from "../model/db-connect"
// import IpModel from "../model/ip-model"

// function getRandomInt(max) {
//     return Math.floor(Math.random() * Math.floor(max));
// }

// describe("index test", () => {
//     describe("sayHello function", () => {
//         it("should say Hello guys!", () => {
//             const str = sayHello();
            
//             new Promise((resolve,reject)=>{
//                 IpModel.find({},(err,docs)=>{
//                     if (err) {
//                         console.log('出错'+ err);
//                         reject
//                     }
//                     resolve(docs)
//                 });
//             }).then((docs)=>{
//                 let index = getRandomInt(docs.length)
//                 console.log(docs[index]['ip'])
//             })
//             expect(str).to.equal("Hello guys!")
            
//         })
//     })
// })