import SearchVlog from "./crewler/search-vlog"
import cluster from "cluster"
import os from "os"
let worker_pid = new Array()
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    let cpuCount = os.cpus().length
    // console.log(cpuCount)
    // for (const id in cluster.workers) {
    //     cluster.workers[id].kill()
    // }
    for (let i = 0; i < cpuCount - 3; ++i) {
        var worker = cluster.fork();
        let array = new Array()
        array = ['composite', 'most_clickrate', 'new_publish', 'most_dm', 'most_collect']
        worker.send({
            //综合排序 最多点击 最新发布 最多弹幕 最多收藏
            isHeadeless: true, // 无头浏览器
            filterTypeNum: i + 1, // filter 过滤类型
            tableSuffix: "_" + array[i], // mongodb 表 后缀
            pageNum:10,// 分页
            wpid: worker.process.pid // worker pid
        });//msg
    }

    // 创建进程完成后输出提示信息
    cluster.on('online', (worker) => {
        worker_pid.push(worker.process.pid)
        console.log('Create worker-' + worker.process.pid)
    })

    // for (const id in cluster.workers) {
    //     cluster.workers[id].on('message',(msg)=>{
    //         console.log(msg)
    //         // cluster.workers[msg].kill()
    //     })
    // }
    cluster.on('exit', (worker, code, signal) => {
        if (signal) {
            console.log(`worker was killed by signal: ${signal}`);
        } else if (code !== 0) {
            console.log(`worker exited with error code: ${code}`);
        } else {
            console.log('worker success!');
        }
        console.log(`worker ${worker.process.pid} died`);
        // console.log('[Master] worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
    })
} else if (cluster.isWorker) {
    const keyword = 'VLog'
    console.log(`Worker ${process.pid} started`);
    process.on('message', (msg) => {
        console.table(msg)
        let vlog = new SearchVlog(keyword)
        //从top发现 这种方式kill 不干净 多出来4个
        // vlog.run(msg['isHeadeless'], msg['filterTypeNum'], msg['tableSuffix'],msg['wpid'])
        vlog.run(msg['isHeadeless'], msg['filterTypeNum'], msg['tableSuffix'],msg['pageNum'])
        
    });
    /*
    * args
    0 true isHeadless 是否开启浏览器 
    1 综合排序composite 最多点击most_clickrate 最新发布new_publish 最多弹幕most_dm 最多收藏most_collect
    2 mongo 表后缀名控制
    */
    //多进程起爬虫
    // 
}
// 太坑了！！ 这里有空在改吧～这种方式不行
setTimeout(()=>{
    console.log(worker_pid)
    for(const i in worker_pid){
        process.kill(i)
    }
},5*60*1000)