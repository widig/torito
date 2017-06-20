/*
	Import
*/

function ImportInstanceHeader() {
	this.url = "";
	this.method = "get";
	this.data = {};
	this.json = false;
	this.headers = [];
};
ImportInstanceHeader.prototype.formatArguments = function() {
	var arr = [], str;
	for(var name in this.data) {
		arr.push(name + '=' + encodeURIComponent(this.data[name]));
	}
	str = arr.join('&');
	if(str != '') {
		return this.method == "get" ? 
			(this.url.indexOf('?') < 0 ? '?' + str : '&' + str) : 
			str;
	}
	return '';
}
function Import(opt) {
	if(!( this instanceof Import )) return new Import(opt);
	this.host = {};
	this.doneCallback = null;
	this.failCallback = null;
	this.xhr = null;
	this.info = new ImportInstanceHeader;
	if(Object.prototype.toString.apply(opt)=="[object String]") {
		this.info.url = opt;
	}
	if(Object.prototype.toString.apply(opt)=="[object Object]") {
		if("url" in opt) this.info.url = opt.url;
		if("method" in opt) this.info.method = opt.method;
		if("data" in opt) this.info.data = opt.data;
		if("json" in opt) this.info.json = opt.json;
	}
}
Import.prototype.done = function(callback) { this.doneCallback = callback; return this; };
Import.prototype.fail = function(callback) { this.failCallback = callback; return this; };
Import.prototype.always = function(callback) { this.alwaysCallback = callback; return this; };
Import.prototype.setHeaders = function(headers) {
	this.info.headers = headers;
	for(var name in this.info.headers) { this.xhr && this.xhr.setRequestHeader(name, this.info.headers[name]); }
	return this;
};
Import.prototype.send = function() {
	var self = this;
	if(window.ActiveXObject) { 
		this.xhr = new ActiveXObject('Microsoft.XMLHTTP'); 
	} else if(window.XMLHttpRequest) { 
		this.xhr = new XMLHttpRequest();
	}
	if(!this.xhr) throw "xhr can't initiate.";
	this.xhr.onreadystatechange = function() {
		if(self.xhr.readyState == 4 && self.xhr.status == 200) {
			var result = self.xhr.responseText;
			if(self.info.json === true && typeof JSON != 'undefined') {
				result = JSON.parse(result);
			}
			self.doneCallback && self.doneCallback.apply(self.host, [result, self.info]);
		} else if(self.xhr.readyState == 4 && self.xhr.status == 0) {
			self.failCallback && self.failCallback.apply(self.host, [self.info]);
		} else {
			//console.log(self.xhr.readyState + ":" + self.xhr.status);
		}
		self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.info]);
	}
	this._send = function() {
		if(this.info.method == 'get') {
			this.xhr.open("GET", this.info.url + this.info.formatArguments(), true);
		} else if(this.info.method=="post"){
			this.xhr.open("POST", this.info.url, true);
			this.setHeaders({
				'X-Requested-With': 'XMLHttpRequest',
				'Content-type': 'application/x-www-form-urlencoded'
			});
		} else {
			this.xhr.open("GET", this.info.url + this.info.formatArguments(), true);
		}
		if(this.info.headers && typeof this.info.headers == 'object') {
			for(var name in this.info.headers) this.xhr && this.xhr.setRequestHeader(name, this.info.headers[name]);
		}
		if(this.info.method=="post") {
			var str = this.info.formatArguments();
			self.xhr.send(this.info.formatArguments());
		} else {
			self.xhr.send();
		}
	}
	this._send(); 
	return this;
};

function Export() {

}
Export.Codec = {};
Export.Codec.Hex = function(str) {
	var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
	var sb = [];
	for(var x = 0; x < str.length;x++) {
		var code = str.charCodeAt(x);
		sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
	}
	return sb.join("");
}