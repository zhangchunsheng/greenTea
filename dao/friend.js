var redis = require('../redis/redis');
var mysql = require('../mysql/mysql');
var lua = "\
redis.call('select','1');\
local all = redis.call('zrange',KEYS[1],0,-1);\
local serverId = string.match(KEYS[1],'S(%d+)');\
local registerType = string.match(KEYS[1],'T(%d+)');\
local loginName = string.match(KEYS[1],'_(%w+)_C');\
local characterId = string.match(KEYS[1],'C(%d+)');\
local userId = redis.call('hget','S'..serverId..'_T'..registerType..'_'..loginName..'_C'..characterId,'userId');\
local sqls={};\
for key,value in pairs(all) do \
    local fullname = redis.call('get',value);\
    if fullname then \
        local fuserId = redis.call('hget',fullname,'userId');\
        local fRegisterType = string.match(fullname,'T(%d+)');\
        local fLoginName = string.match(fullname,'_(%w+)_C');\
        local fCharacterId = string.match(fullname,'C(%d+)');\
        local sql = 'insert into seaking_character_friends2 (serverId,userId,registerType,loginName,characterId,fuserId,fRegisterType,fLoginName,fCharacterId,date) values ('..serverId..','..userId..','..registerType..',\"'..loginName..'\",'..characterId..','..fuserId..','..fRegisterType..',\"'..fLoginName..'\",'..fCharacterId..',?);';\
        sqls[key] = sql; \
    end \
end \
return sqls;\
";
var luaRedis = require('../lua/lua');
function ei(key,callback){
    luaRedis.exportRedisTime(lua,key,callback);
}
var createSql="CREATE TABLE `seaking_character_friends2` (\
  `id` int(10) NOT NULL AUTO_INCREMENT,\
  `serverId` int(10) NOT NULL DEFAULT '0' COMMENT 'serverId',\
  `userId` int(10) NOT NULL DEFAULT '0' COMMENT 'userId',\
  `registerType` int(10) NOT NULL DEFAULT '0' COMMENT 'registerType',\
  `loginName` varchar(60) NOT NULL DEFAULT '' COMMENT 'loginName',\
  `characterId` int(10) NOT NULL DEFAULT '0' COMMENT 'characterId',\
  `fuserId` int(10) NOT NULL DEFAULT '0' COMMENT 'fuserId',\
  `fRegisterType` int(10) NOT NULL DEFAULT '0' COMMENT 'fRegisterType',\
  `fLoginName` varchar(60) NOT NULL DEFAULT '' COMMENT 'fLoginName',\
  `fCharacterId` int(10) NOT NULL DEFAULT '0' COMMENT 'fCharacterId',\
  `date` int(10) NOT NULL DEFAULT '0' COMMENT '日期',\
  `bz` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 - 可用 2 - 不可用',\
  `updateBz` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 - 新增 2 - 已更新到mysql',\
  PRIMARY KEY (`id`)\
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8";
var deleteSql = "drop table seaking_character_friends";
var deleteSql2 = "drop table seaking_character_friends2";
var renameSql="alter table seaking_character_friends2 rename  seaking_character_friends";
module.exports = {
    ei:ei,
    createSql:createSql,
    deleteSql:deleteSql,
    deleteSql2:deleteSql2,
    renameSql:renameSql
}