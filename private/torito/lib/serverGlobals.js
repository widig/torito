
var globalsettings_file = "./private/torito/global.json";

var data = {
	value : {}
};

exports.set = function(key,val) {
	data.value[key] = val;
};
exports.get = function(key) {
	if(key in data.value) {
		return data.value[key];
	}
	return null;
};
exports.remove = function(key) {
	if(key in data.value) {
		delete data.value[key];
	}
};
exports.list = function() {
	return data.value;
};
exports.backup = function() {
	var fs = require("fs");
	fs.writeFileSync(globalsettings_file,JSON.stringify(data.value),"utf8");
};
exports.restore = function() {
	var fs = require("fs");
	if(fs.existsSync(globalsettings_file)) {
		var str = fs.readFileSync(globalsettings_file,"utf8");
		var session = JSON.parse(str);
		data.value = session;
	} else { // reset
		data.value = {};
	}
	return false;
};


