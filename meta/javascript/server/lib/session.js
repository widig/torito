

var data = {};

exports.reset = function() {
	for(var x in data) {
		data[x] = null;
	}
};
exports.set = function(key,val) {
	data[key] = val;
};
exports.get = function(key) {
	if(key in data) {
		return data[key];
	}
	return null;
};

