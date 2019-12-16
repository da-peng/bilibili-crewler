'use strict';
import mongoose from 'mongoose';
import configlite from 'config-lite';
import chalk from 'chalk';

const config = configlite(__dirname );
mongoose.connect(config.url,{ useNewUrlParser: true ,useCreateIndex:true} );
mongoose.Promise = global.Promise;

const db = mongoose.connection;

// mongodb 数据库连接日志
db.once('open' ,() => {
	console.log(
    chalk.green('连接数据库成功')
  );
})

db.on('error', function(error) {
    console.error(
      chalk.red('Error in MongoDb connection: ' + error)
    );
    mongoose.disconnect();
});

db.on('close', function() {
    console.log(
      chalk.red('数据库断开，重新连接数据库')
    );
    mongoose.connect(config.url, {server:{auto_reconnect:true}});
});

export default db;