var _poolModule = require("generic-pool"),
	redisConfig = require('../config/redis');
var createRedisPool = function() {
	return _poolModule.Pool({
		name:'redis',
		create : function(callback) {
			var redis = require('redis');
			var client = redis.createClient(redisConfig.port,redisConfig.host);
			callback(null,client);
		},
		destroy : function(client) {
			client.quit();
		},
		max:1000,
		idleTimeoutMillis:30000,
		log:false
	});
}
exports.createRedisPool = createRedisPool;