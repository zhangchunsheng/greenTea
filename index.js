var mysqlpool = require('./mysql/mysql');
var redispool = require('./redis/redis');
var log ;
var async = require('async');
function loggerInit() {
    var logger = require('./logger/logger');
    logger.configure('./config/log4js',{cwd:'logs'}); 
    log = logger.getLogger(__filename);
}
function main(){
    //先将输入导入数据库,完成之后再进行删除表以及修改表名
    loggerInit();   
	async.series([
		function(callback) {
			createTable(callback);
		},
		function(callback) {
			redispool.transaction(function(client) {
				client.select("1",function(err,res) {
                
                }).keys('*',function(err,res) {
                    route(err,res,callback);
                });	
			});
		},function(callback) {
            deleteTable(callback);   
        }
	],function(err,res) {
		if(err) {
			log.log(err);
			return;
		}
		renameTable();
	});
}
function _main() {
    //考虑是否先删除数据之后再创建表,可以节省很多顺序执行步骤
}
function _main_() {
    //查询分类是通过keys 格式来实现
}
function route(err,res,callback) {
   if(err) {
    log.info(err);
    callback(err);
    return;
   } 
    //这里异步导入到数据库
    var funcs = [];
    res.forEach(function(re) {
        var func = function(callback) {
            var splits = re.split("_");
            NND[splits.length](splits,re,callback);
        }
        funcs.push(func);
    });
    async.parallel(funcs,function(err,res) {
        if(err){
            log.error(err);
            return;
        }
        callback();
    });
}
var NND = {};
NND[1] = function(splits,key,callback) {
    callback(null,key);
};
var arenarank = require('./dao/arenarank');
NND[2] = function(splits,key,callback) {
    if(splits[1] == "ARENA") {
        arenarank.ei(key,callback);
    } else {
        callback(null,key);
    }
};
NND[3] = function(splits,key,callback) {
    callback(null,key);    
};
var user = require('./dao/user');
NND[4] = function(splits,key,callback) {
    var reg = /C([0-9]+)([a-zA-Z]+)/ig;
    if(reg.exec(splits[3]) != null) {
        callback(null,key);    
    } else {
        user.ei(key,callback);
    }
}
var friend = require('./dao/friend');
var mail = require('./dao/mail');
NND[5] = function(splits,key,callback){
    switch(splits[4]){
        case  "Friends":
            friend.ei(key,callback);
            break;
        case "ES":
            mail.ei(key,callback);
            break;
        default:
            callback(null,key);
            break;
    }
};

function createTable(callback) {
    log.info("start");
    mysqlpool.transaction([
        arenarank.createSql,
        friend.createSql,
        mail.createSql,
        user.createSql
    ],[],function(err,res) {
        if(err){log.error(err);callback(err);return;}
        callback();
    });
}
function deleteTable(callback) {
    mysqlpool.transaction([
        arenarank.deleteSql,
        friend.deleteSql,
        mail.deleteSql,
        user.deleteSql
    ],[],function(err,res) {
        callback(); 
    });
}
function renameTable() {
    mysqlpool.transaction([
        arenarank.renameSql,
        friend.renameSql,
        mail.renameSql,
        user.renameSql
    ],[],function(err,res){
        log.error(err);
        log.warn('end');
    });
   
}
main();