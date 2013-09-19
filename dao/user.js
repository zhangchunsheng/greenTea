var redispool = require('../redis/redis');
var mysqlpool = require('../mysql/mysql');
var lua = require('../lua/lua');
var log = require('../logger/logger').getLogger(__filename);
function ei(key,callback) {
    redispool.transaction(function(client) {
        client.select('1',function(err,res){}).hgetall(key,function(err,res){
            if(err){log.error(err);callback(err);return;}
            var list = getDataList(key,res);
            var sql = 'insert into seaking_character2 ('+keyStr+') values ('+list.join(",")+');';
            lua.importMysqlTime(key,callback,[sql]);
        });
    });
}
var keys = [    "cId","nickname","currentScene","positionX","positionY","hp","maxHp","anger","attack","defense","focus","speed","dodge","criticalHit","critDamage","block","counter","experience","activeSkills","passiveSkills","equipments","package","formation","weapons","currentMainTask","currentBranchTask","currentDayTask","currentExerciseTask","gift","partners","money","gameCurrency","induInfo","level","playerId","date"
];
var otherKeys = [
    "uc_userId","serverId","registerType","loginName","characterId"
];
var keyStr = keys.join(',')+','+otherKeys.join(',');
function getDataList(key,res) {
    var list =[];
    keys.forEach(function(k) {
       var value = res[k] || defaultMap[k];
        if(parseFloat(value) == value || value == "?") {
            list.push(value);
        }else{
            list.push('\''+value+'\'');
        }
    });    
    list.push(res['userId'] || 0 );
    var reg = /S([0-9]+)_T([0-9]+)_([a-zA-Z0-9]+)_C([0-9]+)/ig;
    var regres = reg.exec(key);
    list.push(regres[1]);
    list.push('\''+regres[2]+'\'');
    list.push('\''+regres[3]+'\'');
    list.push(regres[4]);
    return list;
}
var defaultMap = {
    userId:0,cId:0,nickname:"", positionX:0, positionY:0, hp:0,maxhp:0,anger:0,attack:0,defense:0,focus:0,speed:0,dodge:0,criticalHit:0,critDamage:0,block:0,counter:0,activeSkills:"",passiveSkills:"",equipments:"",package:"",formation:"",weapons:"",currentMainTask:"",currentBranchTask:"",currentDayTask:"",currentExerciseTask:"",gift:"",partners:"",money:"",gameCurrency:0,induInfo:"",level:0,serverId:0,playerId:0,date:"?"
};
var createSql ="CREATE TABLE `seaking_character2` (\
  `id` int(10) NOT NULL AUTO_INCREMENT,\
  `uc_userId` varchar(60) NOT NULL DEFAULT '' COMMENT 'uc_userId',\
  `mongoDbId` varchar(60) NOT NULL DEFAULT '' COMMENT 'mongoDbId',\
  `registerType` varchar(60) NOT NULL DEFAULT '' COMMENT 'registerType',\
  `loginName` varchar(60) NOT NULL DEFAULT '' COMMENT 'loginName',\
  `characterId` int(10) NOT NULL DEFAULT '0' COMMENT 'redis中生成characterId',\
  `cId` int(10) NOT NULL DEFAULT '0' COMMENT '選擇角色Id',\
  `nickname` varchar(60) NOT NULL DEFAULT '' COMMENT '角色名称',\
  `currentScene` int(10) NOT NULL DEFAULT '0' COMMENT '當前所在场景Id',\
  `positionX` decimal(10,6) NOT NULL DEFAULT '0.000000' COMMENT '角色所在x軸坐標',\
  `positionY` decimal(10,6) NOT NULL DEFAULT '0.000000' COMMENT '角色所在y軸坐標',\
  `hp` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'HP',\
  `maxHp` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'maxHp',\
  `anger` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'anger',\
  `attack` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'attack',\
  `defense` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'defense',\
  `focus` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'focus',\
  `speed` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'speed',\
  `dodge` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'dodge',\
  `criticalHit` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'criticalHit',\
  `critDamage` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'critDamage',\
  `block` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'block',\
  `counter` decimal(16,6) NOT NULL DEFAULT '0.000000' COMMENT 'counter',\
  `experience` int(10) NOT NULL DEFAULT '0' COMMENT '已获取的经验值',\
  `activeSkills` varchar(1000) NOT NULL DEFAULT '' COMMENT '主动技能{\"activeSkills\":[]}',\
  `passiveSkills` varchar(1000) NOT NULL DEFAULT '' COMMENT '被动技能',\
  `equipments` text COMMENT '裝備{\"equipments\":[]}',\
  `package` text COMMENT '包裹{\"package\":[]}',\
  `formation` text COMMENT '陣型{\"formation\":[]}',\
  `weapons` varchar(100) NOT NULL DEFAULT '' COMMENT '武器',\
  `currentMainTask` varchar(100) NOT NULL DEFAULT '' COMMENT '{\"taskId\": 10100, \"status\": 0}',\
  `currentBranchTask` varchar(100) NOT NULL DEFAULT '' COMMENT '{\"taskId\": 10100, \"status\": 0}',\
  `currentDayTask` varchar(600) NOT NULL DEFAULT '' COMMENT '[{\"taskId\": 30201,\"status\":\ 2},30202,30203]',\
  `currentExerciseTask` varchar(100) NOT NULL DEFAULT '' COMMENT '{\"taskId\": 10100, \"status\": 0}',\
  `gift` text COMMENT '{\"gift\":[]}',\
  `partners` text COMMENT '{\"partners\":[]}',\
  `date` int(10) NOT NULL DEFAULT '0' COMMENT '日期',\
  `bz` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 - 可用 2 - 不可用',\
  `updateBz` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 - 新增 2 - 已更新到mysql',\
  `money` int(10) NOT NULL DEFAULT '0' COMMENT '金幣',\
  `gameCurrency` int(10) NOT NULL DEFAULT '0' COMMENT '游戏币',\
  `induInfo` text NOT NULL COMMENT '用户副本数据',\
  `level` int(10) NOT NULL DEFAULT '0' COMMENT 'level',\
  `serverId` int(10) NOT NULL DEFAULT '0' COMMENT '服务器Id',\
  `playerId` varchar(100) NOT NULL DEFAULT '0' COMMENT 'playerId',\
  PRIMARY KEY (`id`),\
  KEY `index_uc_userId` (`uc_userId`),\
  KEY `index_mongoDbId` (`mongoDbId`),\
  KEY `index_bz` (`bz`),\
  KEY `index_updateBz` (`updateBz`)\
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='角色信息表'";
var deleteSql = "drop table seaking_character";
var deleteSql2 = "drop table seaking_character2";
var renameSql = "alter table seaking_character2 rename  seaking_character";
module.exports = {
    ei:ei,
    createSql:createSql,
    deleteSql:deleteSql,
    deleteSql2:deleteSql2,
    renameSql:renameSql
}