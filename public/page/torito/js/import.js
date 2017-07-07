/*
	Import
*/
function ImportInstanceHeader() {
	this.url = "";
	this.method = "GET";
	this.data = {};
	this.query = {};
	this.json = false;
	this.type = "application/x-www-form-urlencoded";
	this.headers = {};
};
ImportInstanceHeader.prototype.formatQuery = function() {
	var arr = [], str;
	for(var name in this.query) {
		arr.push(name + '=' + encodeURIComponent(this.query[name]));
	}
	str = arr.join('&');
	if(str != '') {
		if( this.url.indexOf('?') < 0 ) {
			return "?" + str;
		} else {
			return "&" + str;
		}
	} else {
		return "";
	}
}
ImportInstanceHeader.prototype.formatBody = function() {
	if(this.type == "application/x-www-form-urlencoded") {
		var arr = [], str;
		for(var name in this.data) {
			arr.push(name + '=' + encodeURIComponent(this.data[name]));
		}
		str = arr.join('&');
		if(str != '') {
			return this.method == "GET" ? 
				(this.url.indexOf('?') < 0 ? '?' + str : '&' + str) : 
				str;
		}
		return '';
	} else if(this.type == "application/json") {
		return JSON.stringify(this.data);
	} else {
		if(Object.prototype.toString.apply(data) == "[object String]") {
			return this.data;
		} else {
			throw "body on import is raw but not string.";
		}
	}
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
		if("method" in opt) this.info.method = opt.method.toUpperCase();
		if("query" in opt) this.info.query = opt.query;
		if("data" in opt) {
			this.info.data = opt.data;
			if("body" in opt) this.info.data = opt.body;
		} else {
			if("body" in opt) this.info.data = opt.body;
		}
		if("json" in opt) this.info.json = opt.json;
		if("type" in opt) this.info.type = opt.type;
	}
}
Import.Form = "application/x-www-form-urlencoded";
Import.Json = "application/json";
Import.Js = "application/javascript";
Import.Raw = "text/plain";
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
		var debug = false;
		if(debug) console.log("IMPORT",this.info.method,this.info.url + this.info.formatQuery(),this.info.type);
		this.xhr.open(this.info.method, this.info.url + this.info.formatQuery(), true);
		this.setHeaders({
			'X-Requested-With': 'XMLHttpRequest'
		});
		if(this.info.headers && typeof this.info.headers == 'object') {
			for(var name in this.info.headers) this.xhr && this.xhr.setRequestHeader(name, this.info.headers[name]);
		}
		var data = this.info.formatBody();
		if(debug) console.log("BODY",data);
		if(data !="") {
			this.setHeaders({
				'Content-type' : this.info.type
			});
			self.xhr.send(data);
		} else {
			self.xhr.send();	
		}
	}
	this._send(); 
	return this;
};
Import.Codec = {};
Import.Codec.Hex = function(str) {
	var dict = {
		"0" : 0, "1" : 1, "2" : 2, "3" : 3, "4" : 4, "5" : 5, "6" : 6, "7" : 7, "8" : 8, "9" : 9, "A" : 10, "a" : 10, "B" : 11, "b" : 11, "C" : 12, "c" : 12, "D" : 13, "d" : 13, "E" : 14, "e" : 14, "F" : 15, "f" : 15 
	};
	var sb = [];
	for(var x = 0; x < data.length;x+=2) {
		var a = data.charAt(x);
		var b = data.charAt(x+1);
		if(a in dict) {
			a = dict[a];
		} else {
			throw "not hex";
		}
		if(b in dict) {
			b = dict[b];
		} else {
			throw "not hex";
		}
		var c = (a << 4) + b;
		sb.push( String.fromCharCode(c) );
		
	}
	return sb.join("");
}
Import.Codec.Base64 = function(str) {
	return window.atob(str);
}
function Export() {}
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
Export.Codec.Base64 = function(str) {
	return window.btoa(str);
}