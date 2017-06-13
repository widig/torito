
var session_file = "./private/torito/session.json";
var data = {
	value : {}
};

exports.reset = function() {
	for(var x in data.value) {
		data.value[x] = null;
	}
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
	fs.writeFileSync(session_file,JSON.stringify(data.value),"utf8");
};
exports.restore = function() {
	var fs = require("fs");
	if(fs.existsSync(session_file)) {
		var str = fs.readFileSync(session_file,"utf8");
		var session = JSON.parse(str);
		data.value = session;
	} else { // reset
		data.value = {};
	}
	return false;
};

exports.print = function() {
	console.log( JSON.stringify(data.value) );
}

