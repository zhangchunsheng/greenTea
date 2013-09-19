var redisclient = module.exports;
var _pool = null;
var NND = {};
var log = require('../logger/logger').getLogger(__filename);
NND.init = function() {
	if(!_pool) {
		_pool = require('./dao-pool').createRedisPool();
	}
}
NND.command = function(func) {
	if(typeof func != "function") {
		return;
	}
	_pool.acquire(function(err, client) {
		if(!!err) {
			log.error('[redisCommandErr]'+err.stack);
			return;
		}
		func.call(null,client,function() {
            _pool.release(client);
        });
	});
}
NND.shutdown = function() {
	_pool.destroyAllNow();
}
NND.transaction = function(args,endfunc) {
	_pool.acquire(function(err, client) {
		if(!!err) {
			log.error('[redisCommandErr]'+err.stack);
			return;
		}	
		if(typeof args == "function") {
			client = client.multi();
			clinet = args(client);
			client.exec(NND.End(endfunc));	
		}else{
			client.multi(args).exec(NND.End(endfunc));
		}
		
	});
}
NND.End = function(callback) {
	var endfunc = function(err,res) {
		if(err){
			log.error(err);
			return;
		}
		if(typeof callback == "function") {
			callback.apply(null,err,res);
		}
	}
	return endfunc;
}
var init = function() {
	if(!_pool) {
		NND.init();
		redisclient.command = NND.command;
		redisclient.shutdown = NND.shutdown;
		redisclient.transaction = NND.transaction;
	}
}
init();