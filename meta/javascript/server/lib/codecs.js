

module.exports = {
	hex2bin : function(data) {
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
			sb.push( c );
			
		}
		return sb;
	},
	hex2str : function(data) {
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
	},
	str2hex : function(data) {
		var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
		var sb = [];
		for(var x = 0; x < str.length;x++) {
			var code = str.charCodeAt(x);
			sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
		}
		return sb.join("");
	},
	hex2json : function(data) {
		return JSON.parse(this.hex2str(data));
	}
}