'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const VLogInfoSchema = new Schema({
    title: String,// 视频标题
    video_link: {type:String,unique:true,dropDups: true},//唯一性, //视频链接
    video_slink: String,//唯一性, //视频链接
    tag_name: String,// 视频分类标签
    watch_num: Number, // 观看人数
    barrages: Number,//弹幕数
    upload_time: Date, //上传时间
    author: String,// up主名字
    author_home_link: String, //up主直播间地址
    updata_time: {
        type: Date,
        default: Date.now
    },
});

const tableName = 'vlog_info'

function vLogInfoSchema(arg=''){
    const data = new Date()
    const name = tableName+arg+('_'+data.getFullYear()+'-'+(data.getMonth()+1)+'-'+data.getDate())
    const vLogInfoSchema = mongoose.model(name, VLogInfoSchema);
    return vLogInfoSchema
}

export default vLogInfoSchema;