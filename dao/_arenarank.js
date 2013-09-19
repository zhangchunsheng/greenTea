function ei(key,callback) {
    exportRedis(key,callback);
}
var redispool = require('../redis/redis');
var mysqlpool = require('../mysql/mysql');
var log = require('../logger/logger').getLogger(__filename);
var lua = "\
redis.call('select','1');\
local all = redis.call('zrange',KEYS[1],0,-1);\
local sqls = {};\
for key,value in pairs(all) do \
    local fullname = redis.call('get',value);\
    if fullname then\
        local userId = redis.call('hget',fullname,'userId');\
        local serverId = string.match(fullname,'S(%d+)');\
        local registerType = string.match(fullname,'T(%d+)');\
        local loginName = string.match(fullname,'_(%w+)_C');\
        local characterId = string.match(fullname,'C(%d+)');\
        local sql = 'insert into seaking_character_arenarank2 (serverId,userId,registerType,loginName,characterId,rank,date) values ('..serverId..','..userId..','..registerType..',\"'..loginName..'\",'..characterId..','..key..',?)';\
        sqls[key]=sql;\
    end \
end \
return sqls"
;
function exportRedis(key,callback){
    //通过lua查询,eval已经包含了evalsha
    redispool.command(function(client,cb) {
        client.eval(lua,1,key,function(err,res){
            if(err) {
                log.log(err);
                callback(err,res);
               
            }else{
                importMysql(key,callback,res);
            }
            cb();
        });
    });  
}
function _exportRedis(key,callback){
    //手动一条条查询

}
function importMysql(key,callback,res){
    mysqlpool.transaction(res,[Date.parse(new Date())/1000],function() {
        callback(null,key);  
    });
   // callback(null,key);   
}
var  createSql=
    "CREATE TABLE `seaking_character_arenarank2` (\
  `id` int(10) NOT NULL AUTO_INCREMENT,\
  `serverId` int(10) NOT NULL DEFAULT '0' COMMENT 'serverId',\
  `userId` int(10) NOT NULL DEFAULT '0' COMMENT 'userId',\
  `registerType` int(10) NOT NULL DEFAULT '0' COMMENT 'registerType',\
  `loginName` varchar(60) NOT NULL DEFAULT '' COMMENT 'loginName',\
  `characterId` int(10) NOT NULL DEFAULT '0' COMMENT 'characterId',\
  `rank` int(10) NOT NULL DEFAULT '0' COMMENT 'rank',\
  `date` int(10) NOT NULL DEFAULT '0' COMMENT '日期',\
  `bz` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 - 可用 2 - 不可用',\
  `updateBz` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 - 新增 2 - 已更新到mysql',\
  PRIMARY KEY (`id`)\
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8";
var deleteSql="drop table seaking_character_arenarank";
var deleteSql2="drop table seaking_character_arenarank2";
var renameSql = "alter table seaking_character_arenarank2 rename  seaking_character_arenarank";
module.exports = {
    ei:ei,
    createSql:createSql,
    deleteSql:deleteSql,
    deleteSql2:deleteSql2,
    renameSql:renameSql
}