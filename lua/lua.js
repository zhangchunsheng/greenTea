var crypto = require('crypto');
var redis = require('redis/lib/to_array');
var redispool = require('../redis/redis');
var mysqlpool = require('../mysql/mysql');
var log = require('../logger/logger').getLogger(__filename);
function exportRedis(lua,key,callback){
    //通过lua查询,eval已经包含了evalsha
    redispool.command(function(client,cb) {
        client.eval(lua,1,key,function(err,res){
            if(err) {
                log.info(err);
                callback(err,res);
            }else{
                importMysql(key,callback,res);
            }
            cb();
        });
    });  
}
function exportRedisTime(lua,key,callback){
    //通过lua查询,eval已经包含了evalsha
    redispool.command(function(client,cb) {
        client.eval(lua,1,key,function(err,res){
            if(err) {
                log.info(err);
                callback(err,res);
                
            }else{
                importMysqlTime(key,callback,res);
            }
            cb();
        });
    });  
}
function importMysql(key,callback,res){
    mysqlpool.transaction(res,[],function() {
        callback(null,key);  
    });  
}
function importMysqlTime(key,callback,res){
    mysqlpool.transaction(res,[Date.parse(new Date())/1000],function(err,res) {
        callback(null,key);  
    });
}
module.exports = {
    exportRedis:exportRedis,
    exportRedisTime:exportRedisTime,
    importMysql:importMysql,
    importMysqlTime:importMysqlTime
}