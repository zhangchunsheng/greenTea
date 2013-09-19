var redispool = require('../redis/redis');
var mysqlpool = require('../mysql/mysql');
var lua ="\
redis.call('select','1');\
local all = redis.call('lrange',KEYS[1],0,-1);\
local sqls = {};\
for key,value in pairs(all) do\
    local mail = cjson.decode(value);\
    local fromFullname = redis.call('get',mail['from']);\
    local toFullname = redis.call('get',mail['to']);\
    if fromFullname and toFullname then\
        local fromUserId = redis.call('hget',fromFullname,'userId');\
        local serverId = string.match(fromFullname,'S(%d+)');\
        local fromRegisterType = string.match(fromFullname,'T(%d+)');\
        local fromCharacterId = string.match(fromFullname,'C(%d+)');\
        local fromLoginName = mail['fromName'];\
        local toUserId = redis.call('hget',toFullname,'userId');\
        local toRegisterType = string.match(toFullname,'T(%d+)');\
        local toCharacterId = string.match(toFullname,'C(%d+)');\
        local toLoginName = mail['toName'];\
        local title = mail['title'];\
        local time = mail['time'];\
        local content = mail['content'];\
        local type = mail['type'];\
        local sql = 'insert into seaking_character_mail2 (serverId,fromUserId,fromRegisterType,fromLoginName,fromCharacterId,toUserId,toRegisterType,toLoginName,toCharacterId,title,time,content,type,mailId,date) values ('..serverId..','..fromUserId..','..fromRegisterType..',\"'..fromLoginName..'\",'..fromCharacterId..','..toUserId..','..toRegisterType..',\"'..toLoginName..'\",'..toCharacterId..',\"'..title..'\",'..time..',\"'..content..'\",'..type..','..mail['mailId']..',?)';\
        sqls[key]=sql;\
    end \
end \
return sqls;";
var luaRedis = require('../lua/lua');
function ei(key,callback){
    luaRedis.exportRedisTime(lua,key,callback);
}
var createSql = "CREATE TABLE `seaking_character_mail2` (\
  `id` int(10) NOT NULL AUTO_INCREMENT,\
  `serverId` int(10) NOT NULL DEFAULT '0' COMMENT 'serverId',\
  `fromUserId` int(10) NOT NULL DEFAULT '0' COMMENT 'fromUserId',\
  `fromRegisterType` int(10) NOT NULL DEFAULT '0' COMMENT 'fromRegisterType',\
  `fromLoginName` varchar(60) NOT NULL DEFAULT '' COMMENT 'fromLoginName',\
  `fromCharacterId` int(10) NOT NULL DEFAULT '0' COMMENT 'fromCharacterId',\
  `toUserId` int(10) NOT NULL DEFAULT '0' COMMENT 'toUserId',\
  `toRegisterType` int(10) NOT NULL DEFAULT '0' COMMENT 'toRegisterType',\
  `toLoginName` varchar(60) NOT NULL DEFAULT '' COMMENT 'toLoginName',\
  `toCharacterId` int(10) NOT NULL DEFAULT '0' COMMENT 'toCharacterId',\
  `title` varchar(60) NOT NULL DEFAULT '' COMMENT 'title',\
  `time` bigint(16) NOT NULL DEFAULT '0' COMMENT 'time',\
  `content` varchar(1000) NOT NULL DEFAULT '' COMMENT 'content',\
  `type` int(1) NOT NULL DEFAULT '0' COMMENT 'type',\
  `date` int(10) NOT NULL DEFAULT '0' COMMENT '日期',\
  `bz` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 - 可用 2 - 不可用',\
  `updateBz` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 - 新增 2 - 已更新到mysql',\
  `mailId` int(11) DEFAULT NULL,\
  PRIMARY KEY (`id`)\
) ENGINE=InnoDB DEFAULT CHARSET=utf8";
var deleteSql = "drop table seaking_character_mail";
var deleteSql2 = "drop table seaking_character_mail2";
var renameSql = "alter table seaking_character_mail2 rename  seaking_character_mail";
module.exports = {
    ei:ei,
    createSql:createSql,
    deleteSql:deleteSql,
    deleteSql2:deleteSql2,
    renameSql:renameSql
}