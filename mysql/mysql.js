var sqlclient = module.exports;
var _pool = null;
var NND = {};
var colors = ['\u001b[31m','\u001b[34m','\u001b[0m']
NND.init = function(){
	if(!_pool){
		_pool = require('./dao-pool').createMysqlPool();
    }
};
NND.command = function(callback) {
	if(typeof callback != "function") {
		return;
	}
	_pool.acquire(function(err,client) {
		if(!!err) {
			log.error('[mysqlCommandError]'+err.stack);
			return;
		}
		callback(client,function() {
            _pool.release(client);
        });
	});	
};
var queues = require('mysql-queues');
const DEBUG = true;
var async = require('async');
var log = require('../logger/logger').getLogger(__filename);
NND.transaction = function(sqls,args,callback) {
	_pool.acquire(function(err,client) {
		var trans = NND.getTransaction(err,client);
		if(!trans){return;}
		var funcs = [];
		sqls.forEach(function(sql){
			if(typeof sql == "string" ||  ( sql && (typeof sql.substr == 'function'))) {
				funcs.push(function(callback) {
					//添加参数
					trans.query(sql,args||[],function(err,res) {
						callback(err,res);	
					});
				});			
			}else{
				funcs.push(function(callback){
					trans.query(sql.sql,sql.agrs||[],function(err,res) {
						//这里是否需要把callback传到func需要之后看需求
						if(sql.func != null && typeof sql.func == 'function') {
							sql.func(err,res);
						}
						callback(err,res);
					});
				});			   
			}
		});
		NND.runTransaction(trans,funcs,client,callback);
	});
};
NND.runTransaction = function(trans,funcs,client,callback) {
	async.series(funcs,function(err,res) {
		if(!!err) {
			trans.rollback();		
		}else{
			trans.commit();
		}
        if(callback && typeof callback == "function"){callback(err,res);}
        _pool.release(client);
	});
	trans.execute();
};
NND.shutdown = function() {
	_pool.destroyAllNow();
};
NND.getTransaction = function(err,client) {
	if(!!err) {
		log.error('[mysqlCommandError]'+err.stack);
		return null;
	}
	queues(client,DEBUG);
	var trans = client.startTransaction();	
	return trans;
};
NND.batch = function(sql,array) {
	_pool.acquire(function(err,client) {
		var trans = NND.getTransaction(err,client);
		if(!trans){return;}
		var funcs = [];
		array.forEach(function(args){
			funcs.push(function(callback) {
				//添加参数
				trans.query(sql,args || [],function(err,res) {
					callback(err,res);	
				});
			});				
		});
		NND.runTransaction(trans,funcs,client);
	});
}
var init = function() {
	if(!_pool) {
		NND.init();
		sqlclient.command  = NND.command;
		sqlclient.transaction = NND.transaction;
		sqlclient.batch = NND.batch;
		sqlclient.shutdown = NND.shutdown;
	}
};
init();
