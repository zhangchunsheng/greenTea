var log4js = require('log4js');
var fs = require('fs');

function getLogger(categoryName) {
	if(typeof categoryName === 'string') {
		categoryName = categoryName.replace(process.cwd(),'');
	}
    return log4js.getLogger(categoryName);
}
function concat(array1,array2) {
	array1 = array1 || [];
	array2 = array2 || [];
	var all = {};
	array1.forEach(function(obj) {
		all[obj]=true;	
	});
	array2.forEach(function(obj) {
		all[obj]=true;
	});
	return OtoA(all);
}
function OtoA(os){
	var array = [],i;
	for(i in os) {
		if(lang.hasOwnProperty(os,i)) {
			array.push(i);
		}
	}
	return array;
}
function configure(config, opts) {
	config = config || process.env.LOG4JS_CONFIG;
	opts = opts || {};
	if(typeof config === 'string' ) {
        if(config.indexOf('.json') != -1){
            config = JSON.parse(fs.readFileSync(config,"utf8"));    
        }else{
            config = JSON.parse(fs.readFileSync(config+'.json',"utf8")); 
        }
	}
	
	if(config) {
		config = filterAppenders(config,opts);
	}
    
	log4js.configure(config,opts);
}
function filterAppenders(configObj,opts) {
	var appenders = configObj.appenders;
	if(!appenders) {
		return configObj;
	}	
	var res = [];
	//设置模式
	var patterns = configObj.patterns || [];
	if(opts.patterns) {
		if(typeof opts.patterns == "string") {
			pattern.push(opts.patterns);
		}else if(opts.patterns instanceof Array) {
			patterns = concat(patterns,opts.patterns);
		}
	}
	
	appenders.forEach(function(appender) {
		if(appender.disabled == true ) {
			return;
		}
		if(appender.pattern) {
			for(var i = 0,len = patterns.length ; i < len ;i++) {
				if(appender.pattern == patterns[i]) {
					res = addAppender(res,appender,opts);
					return;
				}
			}
			return;
		}
		res = addAppender(res,appender,opts);
	});
	configObj.appenders = res;
	return configObj;
}
function replaceDate(str,date) {
	if(str == null) {
		return "";
	}
	for(var o in replaceMap) {
		str = str.replace(o,replaceMap[o](date));
	}
	return str;
}
		
function addAppender(res,appender,opts) {
	var regdate = /\${([\s\S]*)}/igm;
	if('file' == appender.type  && appender.filename !=null && (resreg=regdate.exec(appender.filename))) {
		var time = new Date();
		var datestr = replaceDate(resreg[1],time);
		setTimeConfig(appender,opts,time);
		appender.filename = appender.filename.replace(resreg[0],datestr);
	}
	res.push(appender);
	return res;
}
function setTimeConfig(appender,opts){
	var time = getTime(appender.filename);
	var cloneappender = clone(appender);
	setTimeout(function(){
		configure({appenders:[cloneappender]},opts);	
	},time);
}
function getTime(filename) {
    var date = new Date();
    if(filename.indexOf("ss") != -1){
        return Date.parse(new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds()+1))-Date.parse(date);
    }else if(filename.indexOf("mm") != -1){
        return Date.parse(new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes()+1))-Date.parse(date);
    }else if(filename.indexOf("HH") != -1){
        return Date.parse(new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours()+1))-Date.parse(date);
    }else if(filename.indexOf("dd")!= -1) {
        return Date.parse(new Date(date.getFullYear(),date.getMonth(),date.getDate()+1))-Date.parse(date);    
    }else if(filename.indexOf("MM") != -1) {
        return Date.parse(new Date(date.getFullYear(),date.getMonth()+1))-Date.parse(date);
    }else if(filename.indexOf("yyyy") != -1) {
        return Date.parse(new Date(date.getFullYear()+1))-Date.parse(date);
    }
}
function clone(obj) {
	var objClone;
    if (obj.constructor == Object){
        objClone = new obj.constructor(); 
    }else{
        objClone = new obj.constructor(obj.valueOf()); 
    }
    for(var key in obj){
        if ( objClone[key] != obj[key] ){ 
            if ( typeof(obj[key]) == 'object' ){ 
                objClone[key] = clone(obj[key]);
            }else{
                objClone[key] = obj[key];
            }
        }
    }
    return objClone; 
}
module.exports = {
	getLogger:getLogger,
	getDefaultLogger: log4js.getDefaultLogger,

	addAppender: log4js.addAppender,
	loadAppender: log4js.loadAppender,
	clearAppenders: log4js.clearAppenders,
	replaceConsole: log4js.replaceConsole,
	restoreConsole: log4js.restoreConsole,

	levels: log4js.levels,
	setGlobalLogLevel: log4js.setGlobalLogLevel,

	layouts: log4js.layouts,
	appenderMakers: log4js.appenderMakers,
	connectLogger: log4js.connectLogger ,
  	update:log4js.update,
	configure:configure
};
var replaceMap={
    "yyyy":function(date) {
        return date.getFullYear();
    },
    "MM":function(date) {
        return parseInt( date.getMonth())+1;
    },
    "dd":function(date) {
        return date.getDate();
    },
    "HH":function(date) {
        return date.getHours();
    },
    "mm":function(date) {
        return date.getMinutes();
    },
    "ss":function(date) {
        return date.getSeconds();
    }
}	
configure();