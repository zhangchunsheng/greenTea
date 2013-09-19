var redispool = require('../redis/redis');
var mysqlpool = require('../mysql/mysql');
var lua = require('../lua/lua');
var log = require('../logger/logger').getLogger(__filename);
function ei(key,callback){
    redispool.transaction(function(client) {
        client.select('1',function(err,res) {}).
        lrange(key,0,-1,function(err,res){
            if(err) {logger.info(err);callback(err);return;}
            var sqls = [];
            var serverId=key.split('_')[0].slice(1);
            log.error(res);
            res.forEach(function(re) {
                var json = JSON.parse(re);
                var list = getDataList(json);
                list.push(serverId);
                list.push('\''+JSON.stringify(json.induData)+'\'');
                var sql='insert into seaking_character_indu2 ('+sqlStr+') values ('+list.join(',')+');';
                sqls.push(sql);
            });
            lua.importMysql(key,callback,sqls);
        });
    });
}
function getDataList(res) {
    var list = [];
    keys.forEach(function(k) {
       var value = res[k] || defaultMap[k];
        if(parseFloat(value) == value || value == "?" ) {
            list.push(value);
        }else{
            list.push('\''+value+'\'');
        }
    });
    return list;
}
var keys =[   
    "registerType","loginName","characterId","induId","enterDate","finishDate","isFinished","date"
];
var otherKeys =[
    "serverId","induData"
];
var sqlStr = keys.join(",")+","+otherKeys.join(",");
var createSql = "CREATE TABLE `seaking_character_indu2` (\
  `id` int(10) NOT NULL AUTO_INCREMENT,\
  `registerType` int(1) NOT NULL DEFAULT '0' COMMENT 'registerType',\
  `loginName` varchar(60) NOT NULL DEFAULT '' COMMENT 'loginName',\
  `characterId` int(10) NOT NULL DEFAULT '0' COMMENT '角色Id',\
  `induId` varchar(60) NOT NULL DEFAULT '' COMMENT '副本Id',\
  `induData` text NOT NULL,\
  `date` bigint(16) NOT NULL DEFAULT '0' COMMENT '日期',\
  `enterDate` bigint(16) NOT NULL DEFAULT '0' COMMENT '初次进入副本日期',\
  `finishDate` bigint(16) NOT NULL DEFAULT '0' COMMENT '完成副本日期',\
  `isFinished` int(1) NOT NULL DEFAULT '0' COMMENT '1 - 已完成',\
  `serverId` int(1) NOT NULL DEFAULT '0' COMMENT 'serverId',\
  PRIMARY KEY (`id`)\
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='玩家副本表'";
var deleteSql = "drop table seaking_character_indu";
var renameSql = "alter table seaking_character_indu2 rename  seaking_character_indu";
module.exports = {
    ei:ei,
    createSql:createSql,
    deleteSql:deleteSql,
    renameSql:renameSql
}