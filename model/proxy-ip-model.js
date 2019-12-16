'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ipListSchema = new Schema({
    ip: String,
});

const IpModel = mongoose.model('proxy_ips',ipListSchema);

export default IpModel;