


function TypeInstance() { 
	this.name="";this.raw="";this.primitive=false;
	this.object=false;this.dom=false;this.reference=false; 
}
Type = (function() {
	var ar = ["Boolean]","String]","Number]","Array]","Object]","RegExp]","Date]" ,"Function]","Error]","Event]","MouseEvent]","KeyboardEvent]","global]"], f = Object.prototype.toString, s = "[object ";
	Type = function() {
		if(arguments.length==0) throw "must pass something";
		var ret = new TypeInstance(), a = arguments[0];
		if (a==undefined||a==null) { ret.name = "undefined"; ret.primitive = true; return ret; }
		var str = f.call(a);
		ret.raw = str;
		if (a != undefined && a != null && typeof(a) == typeof({}) && "tagName" in a) {
			var tag = a.tagName.toString().toLowerCase();
			ret.object = true; ret.dom = true; ret.name = "html_" + tag;
			return ret;
		} else for(var x = 0; x < ar.length;x++) {
			if(str == (s+ar[x])) {
				var n = ar[x].substring(0,ar[x].length-1);
				ret[n] = true; ret.name = n; ret.primitive = true;
				return ret;
			}
		}
		console.log("Unkown Type:"+str);
		return ret;
	};
	var t = Type, f0 = function(g) { return function(val) { return f.apply(val) == (s+g); } };
	t.isBoolean = f0(ar[0]); t.isString = f0(ar[1]);
	t.isNumber = f0(ar[2]); t.isArray = f0(ar[3]); 
	t.isObject = f0(ar[4]);t.isRegExp = f0(ar[5]);
	t.isDate = f0(ar[6]); t.isFunction = f0(ar[7]);
	t.isError = f0(ar[8]);
	return t;
})();



var BrowserTools = {};

BrowserTools.setStyle = function(target,opt,inner) {
	if("dispose" in opt) {
		
		if("events" in opt) for(var key in opt.events) {
			if( Object.prototype.toString.apply(opt.events[key]) == "[object Array]" ) {
				for(var x = 0; x < opt.events[key].length;x++ ) {
					target.removeEventListener(key,opt.events[key][x]);
				}
			} else {
				target.removeEventListener(key,opt.events[key]);	
			}
		}
		console.log("disposing.");
		
	} else {
		if("class" in opt) {
			if("add" in opt.class) {
				var t = Object.prototype.toString.apply(opt.class.add);
				if(t == "[object Array]") {
					for(var x = 0; x < opt.class.add.length;x++) {
						target.classList.add( opt.class.add[x] );
					}
				} else {
					target.classList.add( opt.class.add );
				}
			}
			if("remove" in opt.class) {
				var t = Object.prototype.toString.apply(opt.class.remove);
				if(t == "[object Array]") {
					for(var x = 0; x < opt.class.remove.length;x++) {
						target.classList.remove(opt.class.remove[x]);
					}
				} else {
					target.classList.remove( opt.class.remove );
				}
			}
		}
		if("style" in opt) {
			for(var key in opt.style) { target.style[key] = opt.style[key]; } 	
		}
		if("events" in opt) for(var key in opt.events) {
			if( Object.prototype.toString.apply(opt.events[key]) == "[object Array]" ) {
				if( opt.events[key].length > 1 && Object.prototype.toString.apply( opt.events[key][ 1 ] ) == "[object Boolean]" ) {
					for(var x = 0; x < opt.events[key].length;x+=2 ) {
						target.addEventListener(key,opt.events[key][x],opt.events[key][x+1]);
					}
				} else {
					if( Object.prototype.toString.apply( opt.events[key][ opt.events[key].length -1 ] ) == "[object Boolean]" ) {
						for(var x = 0; x < opt.events[key].length;x++ ) {
							target.addEventListener(key,opt.events[key][x],opt.events[key][ opt.events[key].length -1 ]);
						}
					} else { // default
						for(var x = 0; x < opt.events[key].length;x++ ) {
							target.addEventListener(key,opt.events[key][x]);
						}	
					}
				}
			} else {
				target.addEventListener(key,opt.events[key]);	
			}
		}
		if("attribs" in opt) for(var key in opt.attribs) target.setAttribute(key,"" + opt.attribs[key]);
		if("props" in opt) {
			for(var key in opt.props) {
				if(key == "innerHTML") {
					if("_component" in target) {
						target._component.elementsClear();
						if(opt.props[key] != "") {
							target._component.elementPushPacket(opt.props[key]);
						}
					} else {
						target[key] = opt.props[key];
					}
				} else {
					target[key] = opt.props[key];
				}
			}
		}
	}
}

BrowserTools.arraySetStyle = function(target,opt) { 
	for(var key in opt) if(key !="events" && key !="attribs" && key != "value") for(var x = 0; x < target.length;x++) target[x].style[key] = opt[key];
	if(inner) for(var x = 0; x < target.length;x++) target[x].innerHTML = inner;
	if("events" in opt) for(var key in opt.events) for(var x = 0; x < target.length;x++) target[x].addEventListener(key, opt.events[key]);
	if("attribs" in opt) for(var key in opt.attribs) for(var x = 0; x < target.length;x++) target[x].setAttribute(key, "" + opt.attribs[key]);
	if("value" in opt) for(var x = 0; x < target.length;x++) target[x].value = opt.value;
}

BrowserTools.inoutStyle = function(a,b) {
	var self = this;
	this.addEventListener("mouseover",function() { for(var key in a) self.style[key] = a[key]; });
	this.addEventListener("mouseout",function() { for(var key in b) self.style[key] = b[key]; });
}
BrowserTools.inIframe = function() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
BrowserTools.decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

var JSONTools = {};
JSONTools.pretty_stringfy = function(json) {
	var debug = false;
	var cache = {};
	function tabs(n) {
		if(n in cache) return cache[n];
		cache[0] = "";
		cache[1] = "\t";
		for(var x = 2; x <= n;x++) cache[x] = cache[x-1] + "\t";
		return cache[n];
	}
	function str_format(str) {
		var ret = [];
		for(var x = 0; x < str.length;x++) {
			if(str.charAt(x) == 9 ) {
				ret.push("\\t");
			} else if(str.charAt(x) == 10 ) {
				ret.push("\\n");
			} else if(str.charAt(x) == 13 ) {
				ret.push("\\r")
			} else {
				ret.push(str.charAt(x));
			}
		}
		return "\"" + ret.join("") + "\"";
	}
	function json_obj(builder,target,level) {
		if(level==0) builder.push(tabs(level) + "{");
		var keys = [];
		for(var key in target) {
			
			keys.push(key);
		}
		keys.sort();
		for(var x = 0; x < keys.length;x++) {
			var key = keys[x];
			var val = target[ key ];
			var type = Object.prototype.toString.apply(val);
			var comma = (x>0) ? "," : " ";
			if(type == "[object String]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : " + str_format(val) );
			} else if(type == "[object Number]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : " + val );
			} else if(type == "[object Array]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : [");
				json_arr( builder, val, level+1);
			} else if(type == "[object Object]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : {");
				json_obj( builder, val, level+1);
			} else {
				throw "not implemented."
			}
		}
		if(level==0) builder.push(tabs(level) + "}");
		else builder.push(tabs(level) + "}");
	}
	function json_arr(builder,target,level) {
		
		if(level==0) builder.push(tabs(level) + "[");
		var keys = [];
		for(var key in target) keys.push(key);
		keys.sort();
		for(var x = 0; x < keys.length;x++) {
			var key = keys[x];
			var val = target[ key ];
			var type = Object.prototype.toString.apply(val);
			var comma = (x>0) ? "," : " ";
			if(type == "[object String]") {
				builder.push(tabs(level+1) + comma + str_format(val) );
			} else if(type == "[object Number]") {
				builder.push(tabs(level+1) + comma + val );
			} else if(type == "[object Array]") {
				builder.push(tabs(level+1) + comma + "[");
				json_arr( builder, val, level+1);
			} else if(type == "[object Object]") {
				builder.push(tabs(level+1) + comma + "{");
				json_obj( builder, val, level+1);
			} else {
				throw "not implemented."
			}
		}
		if(level==0) builder.push(tabs(level) + "]");
		else builder.push(tabs(level) + "]");
	}
	var build = [];
	json_obj(build,json,0);
	return build.join("\r\n");
}


if("localStorage" in window) {
	// front-end developer level protect against unawareness
	var save = window.localStorage.setItem;
	var load = window.localStorage.getItem;
	// reserved keys
	var reserved = ["index"];
	
	Object.defineProperty( window.localStorage, "setItem", { 
		configurable : false,
		get : function() { 
			return function(key,value) {
				if( reserved.indexOf( key ) > -1 ) {
					throw "use setReservedItem, be carefull.";
				} else {
					return save.apply(window.localStorage,[key,value]);
				}
			}
		}
	});
	Object.defineProperty( window.localStorage, "setReservedItem", { 
		configurable : false,
		get : function() { 
			return function(key,value) {
				if( reserved.indexOf( key) > -1 ) {
					return save.apply(window.localStorage,[key,value]);	
				} else {
					throw "use setItem";
				}
			}
		}
	});
	Object.defineProperty( window.localStorage, "getItem", {
		configurable : false,
		get : function() {
			return function(key) {
				if( reserved.indexOf( key ) > -1 ) {
					throw "use getReservedItem, be careful.";
				} else {
					return load.apply(window.localStorage,[key]);
				}
			};
		}
	});
	Object.defineProperty( window.localStorage, "getReservedItem",{
		configurable : false,
		get : function() {
			return function(key) {
				if( reserved.indexOf( key) > -1 ) {
					return load.apply(window.localStorage,[key]);
				} else {
					throw "use setItem";
				}
			};
		}
	});
	
}



ClassDefinition = function(full_name,constructor,destructor) {
	Object.defineProperty(this,"fullName",{value : full_name, writeable : false, configurable : false, enumberable : true });
	
	var _ctor = function(){};
	Object.defineProperty(this,"constructor",{value : _ctor, writeable : false, configurable : false, enumberable : true });
	
	var _dtor = function(){};
	Object.defineProperty(this,"destructor",{value : _ctor, writeable : false, configurable : false, enumberable : true });
	
	
	var _load = [constructor];
	Object.defineProperty(this,"load",{value : _load, writeable : false, configurable : false, enumerable : true } );
	
	var _unload = [destructor];
	Object.defineProperty(this,"unload",{value : _unload, writeable : false, configurable : false, enumerable : true } );
	
	var _inherits = [];
	Object.defineProperty(this,"inherits",{value : _inherits , writeable : false, configurable : false, enumberable : true });
	
	var _share = [];
	Object.defineProperty(this,"share",{value : _share , writeable : false, configurable : false, enumberable : true });
	
	var _sealed = { data : false };
	Object.defineProperty(this,"sealed",{
		get : function() { return _sealed.data; },
		set : function(value) { if(value===true || value===false) _sealed.data = value; },
		writeable : true, 
		configurable : false, 
		enumberable : true
	});
	
	var _childClasses = {};
	Object.defineProperty(this,"childClasses",{value : _childClasses , writeable : false, configurable : false, enumberable : true });
	
	var _behaves = [];
	Object.defineProperty(this,"behaves",{value : _behaves , writeable : false, configurable : false, enumberable : true });
	var _properties = [];
	
	Object.defineProperty(this,"properties",{value : _properties, writable : false, configurable : false, enumerable : true });
	
	var _revision = 1;
	Object.defineProperty(this,"revision",{ value : _revision, writeable : true, configurable : false, enumerable : true } );
	
	var _structpointer = {
		data : 0
	};
	Object.defineProperty(this,"struct",{value : _structpointer, writeable : false, configurable: false, enumerable : true } );
	
};
Class = function() {
	(function(self) {
		var data = {};
		Object.defineProperty(self,"data",{
			get : function() { return data; },
			writeable : false,
			configurable : false
		});
		
	})(this);
	
};
Class.prototype.define = function(name,options) {
	// deprecated (name,inherits,constructor,predef)
	console.log("Class define",name);
	
	var meta = null
		, constructor = null
		, destructor = null
		, predef = null;
		
	if(arguments.length==1) {
		// (name)
		name = arguments[0];
	} else if(arguments.length==2) {
		// (name,prototype (aka predef) )
		name = arguments[0];
		options = arguments[1];
		//console.log("opening works");
		// throw "Class.define does not have a '5 arguments or more' constructor.";
	}
	
	options = options || {};
	
	
	if("ctor" in options) {
		constructor = options.ctor;
	}
	if("dtor"  in options) {
		destructor = options.dtor;
	}
	if("from" in options) {
		meta = options.from;
		
	}
	
	if("proto" in options) {
		predef = options.proto;
	}
	
	
	if( ! Type.isString(name) ) throw "Class.define name must be a string.";
	
	
	
	if( meta != null && ! Type.isObject(meta) && ! Type.isArray(meta) ) throw "Class.define meta must be an object or an array.";
	if( meta == null ) meta = [];
	if( constructor != null && ! Type.isFunction( constructor ) ) throw "Class.define constructor must be an function.";
	if( constructor == null ) constructor = function(){};
	if( destructor != null && ! Type.isFunction( destructor ) ) throw "Class.define destructor must be an function.";
	if( destructor == null ) destructor = function(){};
	
	if( predef != null && ! Type.isObject(predef) ) throw "Class.define prototype must be an object.";
	if( predef == null ) predef = {};
	
	var behaves = [];
	if( "from" in options && Type.isArray(options.from) ) {
		behaves = options.from;
	}
	
	var pathName = name.split(".");
	var target = this.data; // childClasses
	var last_name = null;
	
	while(pathName.length>0) {
		var cur = pathName.shift();
		if(cur.length>256) {
			throw "Class.define name '"+cur+"' too long in '"+name+"'.";
		}
		last_name = cur;
		if(pathName.length==0) break;
		if(!(cur in target)) {
			throw "Class.define '"+name+"' has a invalid path name at '"+cur+"'.";
		}
		target = target[cur].childClasses;
	}
	
	if(last_name in target) console.log("warning: '" + name + "' redefined.","color:#ff0000");

	var cd = target[last_name] = new ClassDefinition(name,constructor,destructor);
	
	if( Type.isObject(options) ) {
		if("struct" in options) {
			cd.struct.data = options.struct;
		}
	}
	
	for(var x = 0; x < behaves.length;x++) {
		//console.log(name);
		Class.behaveLike(name,behaves[x]);
	}
	
	var self_class = this;
	var ret = function(){};
	
	ret.prototype.fullName = name;
	ret.prototype.set = function(key,value) {
		var type = Type(key);
		if(type.name == "String") {
			var proto = cd.constructor.prototype;
			proto[key] = value;
			return this;
		} else if(type.name == "Object") {
			var proto = cd.constructor.prototype;
			for(var k in key) {
				if(Type.isObject(key[k])) {
					var check = false;
					var count = 0;
					var format = false;
					for(var k1 in key[k]) {
						if(Object.prototype.hasOwnProperty.apply(key[k],[k1])) {
							check = true;
							if(k1=="initProperty" && Type.isFunction(key[k][k1]) ) {
								format = true;
							}
							count++;
						}
					}
					format = format && (count==1);
					if(!check) {
						cd.properties.push([ k, key[k], 0 ]);
					} else if( format ){
						cd.properties.push([ k, key[k], 1 ]);
					} else {
						proto[k] = Object.create(key[k]); // make a copy
					}
				} else {
					proto[k] = key[k];
				}
			}
		}
	};
	ret.prototype.create = function(opt) {
		return Class.create.apply(Class,[name,opt]);
	};
	ret = new ret;
	if(predef!=undefined && predef!=null && Object.prototype.toString.apply(predef) == "[object Object]") {
		ret.set(predef);
	}
	return ret;
};

Class.prototype.getDefinition = function(name) {
	var pathName = name.split(".");
	var target = this.data;
	while(pathName.length>0) {
		var cur = pathName.shift();
		if(cur.length>512) throw "Class.getDefinition name too long.";
		if(pathName.length==0) {
			if(cur in target) {
				// make a secure copy, translate pointers to names
				target = target[cur];
				console.log("Class.getDefinition is for debug purposes.");
				return target;
			}
			break;
		}
		target = target[cur].childClasses;
	}
	return null;
};

Class.prototype.getPrototypeOf = function(name) {
	var pathName = name.split(".");
	var target = this.data;
	while(pathName.length>0) {
		var cur = pathName.shift();
		if(cur.length>256) throw "Class.getDefinition name too long.";
		if(pathName.length==0) {
			if(cur in target) {
				target = target[cur];
				if(!target.sealed)  return target.constructor.prototype;
				throw "Class.getPrototypeOf '"+name+"' is a sealed class.";			
			}
			break;
		}
		target = target[cur].childClasses;
	}
	throw "Class.getPrototypeOf '"+name+"' does not exists.";
};

Class.prototype.behaveLike = function(destiny,source) {
	if(destiny == source) return;
	//console.log("behaveLike",destiny,source);
	
	var source_name = source;
	var destiny_name = destiny;
	
	var pathName = destiny.split(".");
	var target = this.data;
	var check = false;
	while(pathName.length>0) {
		var cur = pathName.shift();
		if(pathName.length==0) {
			if(cur in target) {
				check = true;
				target = target[cur];
				
			}
			break;
		}
		target = target[cur].childClasses;
	}
	if(!check) {
		throw "Class.extend where destiny '" + destiny + "' was not found.";
	}
	destiny = target;
	if(destiny.sealed) {
		throw "Class.extend where destiny '" + destiny + "' is sealed.";
	}
	
	pathName = source.split(".");
	target = this.data;
	check = false;
	while(pathName.length>0) {
		var cur = pathName.shift();
		//console.log(" _ : ", cur);
		if(pathName.length==0) {
			if(cur in target) {
				check = true;
				target = target[cur];
			}
			break;
		}
		target = target[cur].childClasses;
	}
	if(!check) {
		throw "Class.extend where source '" + destiny + "' was not found.";
	}
	source = target;
	
	for(var x = 0; x < destiny.behaves.length;x++) {
		if(destiny.behaves[x] == source) {
			return;
		}
	
	}
	// just a mark to not insert twice
	destiny.behaves.push( source );
	
	for(var x = 0; x < source.behaves.length;x++) {
		//console.log(">>",destiny_name,source.behaves[x].fullName)
		Class.behaveLike(destiny_name,source.behaves[x].fullName);
	}
	
	// reorder behaviours cause its need to instanciate correct order and correct unordered marks
	// check dependency
	var count = 0;
	while(true) {
		var check = false;
		for(var x = destiny.behaves.length-1; x >= 0;x--) {
			for(var y = x-1; y >= 0; y--) {
				// find x in y, if found change place
				var itemA = destiny.behaves[x];
				var itemB = destiny.behaves[y];
				var used = [];
				var stack = [itemB];
				while(stack.length>0) {
					var b = stack.pop();
					used.push(b);
					for(var z = 0; z < b.behaves.length;z++) {
						if( b.behaves[z] == itemA ) {
							// found
							check = true;
							break;
						} else {
							var check2 = false;
							for(var w = 0; w < used.length;w++) {
								if(used[w] == b.behaves[z]) {
									check2 = true;
									break;
								}
							}
							if(!check2) stack.push( b.behaves[z] );
						}
					}
					if(check) break;
					
				}
				if(check) {
					// swap
					count++;
					if(count > ( destiny.behaves.length * destiny.behaves.length + 1) ) {
						throw "Class.define can not resolve references, bad project, past depends on future so async must be a queue with check over time or something better.";
					}
					destiny.behaves[y] = itemA;
					destiny.behaves[x] = itemB;
					break;
				}
			}
			if(check) {
				break;	
			}
		}
		if(!check) break;
	}
	
	for (var k in source.constructor.prototype) {
		destiny.constructor.prototype[k] = source.constructor.prototype[k];
	}
	
	
	destiny.revision += 1;
	
	return destiny; 
	
};

Class.prototype.create = function(c,opt,mode) {
	mode = mode || {debug:true};
	//if(mode && "debug" in mode) console.log("Class create",c);
	
	if(
		!(
			Type.isString(c) &&
			( opt==null || opt == undefined || Type.isObject(opt) )
		)
	) {
		throw "Class.create bad arguments.";
	}
	
	var pathName = c.split(".");
	var target = this.data;
	var check = false;
	while(pathName.length>0) {
		var cur = pathName.shift();
		if(pathName.length==0) {
			if(cur in target) {
				check = true;
				target = target[cur];
			}
			break;
		}
		if(cur in target && "childClasses" in target[cur]) {
			target = target[cur].childClasses;
		} else {
			
			throw "Class '"+c+"' is not defined.";
		}
	}
	if(!check) {
		throw "Class.create '" + c + "' was not found.";
	}
	
	c = target;
	//console.log(c);
	opt = opt || {};
	
	var ret_instance = null;
	var new_obj = function() { return {}; }
	var obj_def = function() {
		
		var _internal = new_obj();
		Object.defineProperty(this,"internal",{
			get : function() { return _internal; }
		});
		
		var _type = c.fullName;
		Object.defineProperty(_internal,"type",{
			get : function() { return _type; }
		});
		
		
		var _data = null;
		
		if(c.struct.data != 0) {
			_data = new c.struct.data;
		} else {
			_data = {};
		}
		
		Object.defineProperty(_internal,c.fullName,{
			get : function() { return _data; }
		});
		
		var _rev = c.revision;
		Object.defineProperty(_data,"revision",{
			get : function() { return _rev; }
		});
		
		
		for( var x = 0; x < c.behaves.length;x++) {
			(function(x,c,opt,self) {
				//console.log(">> Class.create [behaves] ", c.fullName, c.behaves[x].fullName);
				
				if( c.behaves[x].fullName in opt) {
					if(Type.isArray( opt[ c.behaves[x].fullName  ] ) ) {
						bargs = opt[ c.behaves[x].fullName ];
					} else {
						throw "Class.create arguments of type '"  + c.behaves[x].fullName + "' must be in array format";
					}
					bargs = opt[ c.behaves[x].fullName ];
				} else {
					bargs = [];
				}
				
				var _inline = new new_obj;
				if( c.behaves[x].struct.data != 0 ) {
					_inline = new c.behaves[x].struct.data;
				}
				
				Object.defineProperty(_internal,c.behaves[x].fullName,{
					get : function() { return _inline; }
				});
				
				var _cur_rev = c.behaves[x].revision;
				Object.defineProperty(_inline, "revision",{
					get : function() { return _cur_rev; }
				});
				
				for(var y = 0; y < c.behaves[x].load.length;y++) {
					c.behaves[x].load[y].apply(self, bargs );
				}
				
				
			})(x,c,opt,this);
		}
		

		var aargs = [];
		if( c.fullName in opt) {
			if(Type.isArray(opt[ c.fullName])) {
				aargs = opt[ c.fullName ];
			} else {
				throw "Class.create arguments of type '"  + c.fullName + "' must be in array format";
			}
		}
		for(var x = 0; x < c.load.length;x++) {
			c.load[x].apply(this,aargs);
		}
		
	};
	obj_def.prototype = Object.create(c.constructor.prototype);
	
	ret_instance = new obj_def();
	
	for(var x = 0; x < c.properties.length;x++) {
		
		var prop_name = c.properties[x][0];
		var prop_desc = c.properties[x][1];
		var prop_type = c.properties[x][2];
		if(prop_type == 0) {
		
			Object.defineProperty( 
				ret_instance,
				prop_name,
				{ get : function() { return proc_desc; } }
			);

		} else if(prop_type == 1) {
			Object.defineProperty( 
				ret_instance,
				prop_name,
				prop_desc.initProperty()
			);
		}
		
	}
	
	return ret_instance;
	
};
Class.prototype.finish = function(instance,opt) {
	var name = instance.internal.type;
	var pathName = name.split(".");
	var target = this.data;
	while(pathName.length>0) {
		var cur = pathName.shift();
		if(cur.length>256) throw "Class.finish name too long.";
		if(pathName.length==0) {
			if(cur in target) {
				target = target[cur];
				break;
			} else {
				throw "Class.finish name not found.";
			}
		}
		target = target[cur].childClasses;
	}
	
	var aargs = [];
	if( name in opt) {
		if(Type.isArray(opt[ name ])) {
			aargs = opt[ name ];
		} else {
			throw "Class.create arguments of type '"  + c.fullName + "' must be in array format";
		}
	}
	
	for(var x = target.unload.length-1; x >=0;x--) {
		target.load[x].apply(instance,aargs);
	}
	
	for( var x = target.behaves.length-1; x >=0;x--) {
		(function(x,c,opt,self) {
			//console.log(">> Class.create [behaves] ", c.fullName, c.behaves[x].fullName);
			
			if( c.behaves[x].fullName in opt) {
				if(Type.isArray( opt[ c.behaves[x].fullName  ] ) ) {
					bargs = opt[ c.behaves[x].fullName ];
				} else {
					throw "Class.create arguments of type '"  + c.behaves[x].fullName + "' must be in array format";
				}
				bargs = opt[ c.behaves[x].fullName ];
			} else {
				bargs = [];
			}
			for(var y = c.behaves[x].unload.length; y >=0; y--) {
				c.behaves[x].unload[y].apply(self, bargs );
			}
			
		})(x,target,opt,instance);
	}
	
	
};
Class.prototype.instanceCheck = function(a) {
	if("internal" in a) {
		if("_typeName"  in a.internal) {
			var type = a.internal._typeName;
			
			var pathName = a.split(".");
			var inner_target = this.data;
			var check = false;
			while(pathName.length>0) {
				var cur = pathName.shift();
				if(pathName.length==0) {
					if(cur in inner_target) {
						check = true;
						inner_target = inner_target[cur];
						
					}
					break;
				}
				inner_target = inner_target[cur].childClasses;
			}
			if(!check) {
				throw "Class.instance parent '" + bname + "' was not found.";
			}
			var a_def = inner_target;
			
			if(a.internal._revision < a_def.revision) {
				return false;
			}
			// now check behaves
			
			return true;
		}
	}
	throw "not event from Class.";
};
Class.prototype.instanceOf = function(a,b) {

	// find original
	if(
		!(
			Object.prototype.toString.apply(a) == "[object Object]" &&
			Object.prototype.toString.apply(b) == "[object String]"
		)
	) {
		throw "Class.instance bad arguments.";
	}
	var bname = b;
	var pathName = b.split(".");
	var inner_target = this.data;
	var check = false;
	while(pathName.length>0) {
		var cur = pathName.shift();
		if(pathName.length==0) {
			if(cur in inner_target) {
				check = true;
				inner_target = inner_target[cur];
				
			}
			break;
		}
		inner_target = inner_target[cur].childClasses;
	}
	if(!check) {
		throw "Class.instance parent '" + bname + "' was not found.";
	}
	b = inner_target;
	
	if("internal" in a) {
		if(b.fullName in a.internal) return true;
	}
	
	return false;
	
};


if (typeof module !== 'undefined' && module.exports) {
	(function(self){
		var c = null;
		//module.exports = 
		c = new Class();
		Object.defineProperty(self,"Class",{
			get : function() {
				return c;
			}
		});
		Object.preventExtensions(c);
		Object.seal(c);

	})(global);
	
} else {
	
	(function(self){
		var c = new Class();
		Object.defineProperty(this,"Class",{
			get : function() {
				return c;
			}
		});
		
		Object.preventExtensions(c);
		Object.seal(c);

	})(window);
	
}

Class.define("WithEvents",{
	ctor : function() {
		// default struct constructor
		var self = this;
		this.internal.WithEvents.data = {};
		this.internal.WithEvents.preCheck = function(event,callback,capture) {
			var mode = capture ? "capture" : "bubble";
			if("on" in self.internal.WithEvents.data) {
				for(var x = 0; x < self.internal.WithEvents.data.on[mode].length;x++) {
					if(!self.internal.WithEvents.data.on[mode][x]( event, callback )) {
						console.log("event blocked");
						return false;
					}
				}
			}
			if(event in self.internal.WithEvents.data) {
				for(var x = 0; x < self.internal.WithEvents.data[event][mode].length;x++) {
					if( self.internal.WithEvents.data[event][mode][x] == callback ) {
						console.log("found same event pointer");
						return false;
					}
				}
			} else {
				self.internal.WithEvents.data[event] = {
					capture : [],
					bubble : []
				};
			}
			return true;
		}
		this.addEventListener = function(a,b,c) {
			return this.on(a,b,c);
		}
		this.removeEventListener = function(a,b,c) {
			return this.off(a,b,c);
		}
	}
	, proto : {
		on : function(event, callback,capture) {
			
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			i.data[event][mode].push(callback);
			return true;
		},
		onQueue : function(event,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			i.data[event][mode].unshift(callback);
			return true;
		},
		onPush : function(event,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			if(capture) {
				i.data[event][mode].push(callback);
			} else {
				i.data[event][mode].unshift(callback);
			}
			return true;
		},
		onAfter : function(event,callback_reference,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			// find it
			var check = false;
			if(capture) {
				for(var x = 0; x < i.data[event][mode].length;x++) {
					if(i.data[event][mode][x] == callback_reference) {
						// insert after
						check = true;
						i.data[event][mode].splice(x+1,0,callback);
						break;
					}
				}
			} else {
				for(var x = i.data[event][mode].length;x>=0;x--) {
					if(i.data[event][mode][x] == callback_reference) {
						check = true;
						i.data[event][mode].splice(x,0,callback);
						break;
					}
				}
			}
			return check;
		},
		onBefore : function(event,callback_reference,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback])) return false;
			
			// find it
			var check = false;
			if(capture) {
				for(var x = 0; x < i.data[event][mode].length;x++) {
					if(i.data[event][mode][x] == callback_reference) {
						// insert after
						check = true;
						i.data[event].splice(x,0,callback);
						break;
					}
				}
			} else {
				for(var x = i.data[event][mode].length-1;x>=0;x--) {
					if(i.data[event][mode][x] == callback_reference) {
						// insert after
						check = true;
						i.data[event].splice(x+1,0,callback);
						break;
					}
				}
			}
			return check;
		},
		off : function(event,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if("off" in i.data) {
				for(var x = 0; x < i.data.off[mode].length;x++) {
					if(!i.data.off[mode][x]( event, callback )) {
						return false;
					}
				}
			}
			if(!(event in i.data)) {
				return true;
			}
			for(var x = 0; x < i.data[event][mode].length;x++) {
				if( i.data[event][mode][x] == callback ) {
					i.data[event][mode].splice(x,1);
					return true;
				}
			}
			return false;
		},
		clearEvents : function(event,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if("off" in i.data) {
				for(var x = 0; x < i.data.off[mode].length;x++) {
					if(!i.data.off[mode][x]( event, callback )) {
						return false;
					}
				}
			}
			if(!(event in i.data)) {
				return true;
			}
			i.data[event][mode].splice(0,i.data[event][mode].length);
			return true;
		},
		emit : function(event, args) {
			//console.log("emit0",this);
			//console.log("emit",event,args);
			
			var i = this.internal["WithEvents"];
			//console.log(i.data);
			if(event in i.data) {
				for(var x = 0; x < i.data[event].capture.length;x++) {
					if(Object.prototype.toString.apply(i.data[event].capture[x]) != "[object Function]") {
						console.log(i.data[event].capture[x]);
					}
					if(!i.data[event].capture[x].apply(this,args)) {
						return false;
					}
				}
			}
			// emit bottomHit
			if(("bottomHit"+event) in i.data) {
				for(var x = 0; x < i.data["bottomHit"+event].capture.length;x++) {
					if(!i.data["bottomHit"+event].capture[x].apply(this,args)) {
						return false;
					}
				}
				for(var x = i.data["bottomHit"+event].bubble.length-1;x>=0;x--) {
					if(!i.data["bottomHit"+event].bubble[x].apply(this,args)) {
						return false;
					}
				}
			}
			if(event in i.data) {
				for(var x = i.data[event].bubble.length-1;x>=0;x--) {
					if(!i.data[event].bubble[x].apply(this,args)) {
						return false;
					}
				}
			}
			return true;
		}
	}
});

Class.define("WithArray",{ 
	ctor : function() {
		this.internal.WithArray.data = [];
	}
	, from :["WithEvents"]
	, proto: {
		itemPush : function(item) {

			var last = this.internal.WithArray.data.length;
			if(!this.emit("itemInputFilter",[last,null,item])) return false;
			if(!this.emit("itemInputPushFilter",[last,null,item])) return false;
			this.internal.WithArray.data.push(item);
			this.emit("itemInsertPush",[last]);
			this.emit("itemInsert",[last]);
			return true;
		}
		, itemPop : function() {
			if(this.internal.WithArray.data.length>0) {
				var last = this.internal.WithArray.data.length-1;
				if(!this.emit("itemOutputFilter",[last,this.internal.WithArray.data[last]])) return null;
				if(!this.emit("itemOutoutPopFilter",[last,this.internal.WithArray.data[last]])) return null;
				var ret = this.internal.WithArray.data.pop();
				this.emit("itemRemovePop",[last]);
				this.emit("itemRemove",[last]);
				return ret;
			}
			return null;
		}
		, itemUnshift : function(item) {
			if(!this.emit("itemInputFilter",[0,null,item])) return false;
			if(!this.emit("itemInputUnshiftFilter",[0,null,item])) return false;
			this.internal.WithArray.data.unshift(item);
			
			this.emit("itemInsertUnshift",[0]);
			this.emit("itemInsert",[0]);
			return true;
		}
		, itemShift : function() {
			if(this.internal.WithArray.data.length>0) {
				if(!this.emit("itemOutputFilter",[0,this.internal.WithArray.data[0]])) return null;
				if(!this.emit("itemOutputShiftFilter",[0,this.internal.WithArray.data[0]])) return null;
				var ret = this.internal.WithArray.data.shift();
				this.emit("itemRemoveShift",[0]);
				this.emit("itemRemove",[0]);
				return ret;
			}
			return null;
		}
		, itemPeekTop : function() {
			if(this.internal.WithArray.data.length>0) return this.internal.WithArray.data[this.internal.WithArray.data.length-1];
			return null;
		}
		, itemPeekFirst : function() {
			if(this.internal.WithArray.data.length>0) return this.internal.WithArray.data[0];
			return null;
		}
		, itemRemove : function(item) {
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				if(this.internal.WithArray.data[x]==item) {
					if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
					var ret = this.internal.WithArray.data.splice(x,1);
					this.emit("itemRemove",[x]);
					return ret;
				}
			}
			return null;
		}
		, itemRemoveComplex : function(callback) {
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				if(callback(x,this.internal.WithArray.data[x])) {
					if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
					var ret = this.internal.WithArray.data.splice(x,1);
					this.emit("itemRemove",[x]);
					return ret;
				}
			}
			return null;
		}
		, itemRemoveAll : function(item) {
			var check1 = false;
			var check2 = false;
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					if(this.internal.WithArray.data[x]==item) {
						if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
						mark.push(x);
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				var ret = [];
				for(var x = mark.length-1; x >= 0;x--) {
					ret = ret.concat(this.internal.WithArray.data.splice(mark[x],1));
					this.emit("itemRemove",[mark[x]]);
				}
				return ret;
			}
			return false;
		}
		, itemRemoveAllComplex : function(callback) {
			
			var check1 = false;
			var check2 = false;
			
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					if(callback(x,this.internal.WithArray.data[x])) {
						if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
						mark.push(x);
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				var ret = [];
				for(var x = mark.length-1;x>=0;x--) {
					ret.concat(this.internal.WithArray.data.splice(mark[x],1));
					this.emit("itemRemove",[mark[x]]);
				}
				return ret;
			}
			return false;
			
		}
		, itemFindFirstIndex : function(start,item) {
			for(var x = start; x < this.internal.WithArray.data.length;x++) {
				if(this.internal.WithArray.data[x]==item)
					return x;
			}
			return -1;
		}
		// callback(index,value)
		, itemFindFirstIndexComplex : function(start,callback) {
			for(var x = start; x < this.internal.WithArray.data.length;x++) {
				if(callback(x,this.internal.WithArray.data[x])) {
					return x;
				}
			}
			return -1;
		}
		// for replaceAllComplex, use itemMap
		, itemReplaceAll : function(item,replacement) { // commit style
			var check1 = false;
			var check2 = false;
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					if(this.internal.WithArray.data[x]==item) {
						if(!this.emit("itemInputFilter",[x,this.internal.WithArray.data[x],replacement])) return false;
						mark.push(x);
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				for(var x = 0; x < mark.length;x++) {
					var oldvalue = this.internal.WithArray.data[mark[x]];
					var newvalue = this.internal.WithArray.data[mark[x]] = replacement;
					this.emit("itemChange",[mark[x],oldvalue,newvalue]);
				}
				return true;
			}
			return false;
		}
		, itemReplaceAllComplex : function(callback) { // commit style
			var check1 = false;
			var check2 = false;
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					var oldvalue = this.internal.WithArray.data[x];
					throw "do not return new value?";
					var r = callback(this.internal.WithArray.data[x]);
					if(r==null) {
						if(!this.emit("itemInputFilter",[x,oldvalue,r])) return false;
						mark.push([x,r]); // here using null
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				for(var x = mark.length-1;x>=0;x--) {
					var oldvalue = this.internal.WithArray.data[ mark[x][0] ];
					var newvalue = this.internal.WithArray.data[ mark[x][0] ] = mark[x][1];
					this.emit("itemChange",[mark[x],oldvalue,newvalue]);
				}
				return true;
			}
			return false;
		}
		, itemReplaceAt : function(index,value) {
			if(index >=0 && index < this.internal.WithArray.data.length) {
				if(!this.emit("itemInputFilter",[index,this.internal.WithArray.data[index],value])) return false;
				var oldvalue = this.internal.WithArray.data[index]
				this.internal.WithArray.data[index] = value;
				this.emit("itemChange",[index,oldvalue,value]);
			} else {
				throw "WithArray.itemAt index out of bounds.";
			}
		}
		, itemGetAt : function(index) {
			if(index >=0 && index < this.internal.WithArray.data.length) {
				return this.internal.WithArray.data[index];
			} else {
				throw "WithArray.itemAt index out of bounds.";
			}
		}
		, itemRemoveAt : function(index) {
			if(index >=0 && index < this.internal.WithArray.data.length) {
				if(!this.emit("itemOutputFilter",[index,this.internal.WithArray.data[index]])) return null;
				var r = this.internal.WithArray.data.splice(index);
				this.emit("itemRemove",[index]);
				return r;
			} else {
				throw "WithArray.itemRemoveAt index out of bounds.";
			}
		}
		, itemFindValue : function(callback) {
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				if( callback(x,this.internal.WithArray.data[x]) ) {
					return this.internal.WithArray.data[x];
				}
			}
			return null;
		}
		, itemMap : function(callback) { // commit style
			var mark = [];
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				var nvalue = callback(x,this.internal.WithArray.data[x]);
				if(!this.emit("itemInputFilter",[x,this.internal.WithArray.data[x],nvalue])) return false;
				mark.push([x,nvalue]);
			}
			for(var x = 0; x < mark.length;x++) {
				var oldvalue = this.internal.WithArray.data[ mark[x][0] ];
				var newvalue = this.internal.WithArray.data[ mark[x][0] ] = mark[x][1];
				this.emit("itemChange",[mark[x][0],oldvalue,newvalue]);
			}
			return false;
		}
		, itemClear : function() { // remove all no check except for output_filter, commit style
			
			for(var y = 0; y < this.internal.WithArray.data.length;y++) {
				//console.log("remove",this.internal.WithArray.data[y]);
				if(!this.emit("itemOutputFilter",[y,this.internal.WithArray.data[y]])) return false;
			}
			var ret = [];
			while(this.internal.WithArray.data.length>0) {
				ret.push( this.internal.WithArray.data.shift() );
				var i = this.internal.WithArray.data.length;
				this.emit("itemRemove",[i]);
			}
			return ret;
		}
		, itemAmount : function() {
			return this.internal.WithArray.data.length;
		}
		, itemSplice : function() {
			return this.internal.WithArray.data.splice.apply( this.internal.WithArray.data, Array.prototype.slice(arguments,0) );
		}
	}
});

Class.define("WithAlias",{
	from : ["WithEvents"]
	, ctor :function() { // map reduce requires event tracking, so this is alpha
		this.internal.WithAlias.data = {};
	}
	, proto : {
		varEach : function(map) {
			for(var key in this.internal.WithAlias.data) {
				this.internal.WithAlias.data[key] = map(key,this.internal.WithAlias.data[key]);
			}
		},
		varKeys : function(map) {
			for(var key in this.internal.WithAlias.data) {
				map(key);
			}
		},
		varValues : function(map) {
			for(var key in this.internal.WithAlias.data) {
				map(this.internal.WithAlias.data[key]);
			}
		},
		varSet : function(key,value) {
			this.internal.WithAlias.data[key] = value;
		},
		varExists : function(key) {
			if( key in this.internal.WithAlias.data ) return true;
			return false;
		},
		varNamesByValue : function(value) {
			var ret = [];
			for(var key in this.internal.WithAlias.data) {
				if( this.internal.WithAlias.data[key] == value ) {
					ret.push(key);
				}
			}
			return ret;
		},
		varGet : function(key) {
			if( key in this.internal.WithAlias.data ) {
				return this.internal.WithAlias.data[key];
			} else {
				return null;
			}
		},
		varRename : function(oldkey,newkey) {
			if( oldkey in this.internal.WithAlias.data ) {
				if( newkey in this.internal.WithAlias.data ) {
					return false;
				} else {
					this.internal.WithAlias.data[newkey] = this.internal.WithAlias.data[oldkey];
					this.varUnset(oldkey);
					this.emit("varRename",[oldkey,newkey]);
					return true;
				}
			} else {
				return false;
			}
		},
		varUnset : function(key) {
			if( key in this.internal.WithAlias.data) {
				this.internal.WithAlias.data[key] = null;
				delete this.internal.WithAlias.data[key];
			}
		},
		varClear : function() {
			var keys = [];
			for(var key in this.internal.WithAlias.data)
				keys.push(key);
			while(keys.length>0) {
				var key = keys.pop();
				this.internal.WithAlias.data[key] = null;
				delete this.internal.WithAlias.data[key];
			}
			
		}
	}
});




Class.define("XMath");
Class.define("XMath.UnitCounter",{
	ctor : function() {
		this.value = 0;
	},
	proto : {

		inc : function() {
			this.value += 1;
		},
		dec : function() {
			this.value -= 1;
		},
		get : function() {
			return this.value;
		},
		getInc : function() {
			var r = this.value;
			this.value += 1;
			return r;
		},
		getDec : function() {
			var r = this.value;
			this.value -= 1;
			return r;
		},
		incGet : function() {
			this.value += 1;
			return this.value;
		},
		reset : function(start) {
			if(start==undefined || start==null)
				this.value = 0;
			else
				this.value = start;
		},
		decGet : function() {
			this.value -= 1;
			return this.value;
		},
		str : function() {
			
		}
	}
});


DOMElementCount = Class.create("XMath.UnitCounter");

TabIndexCount = Class.create("XMath.UnitCounter");



var ____HtmlTags2 = [
	"a","abbr","acronym","address","applet","area","article","aside","audio","b","base","basefont",
	"bdi","bdo","big","blockquote","body","br","button","canvas","center","cite","code","col",
	"colgroup","datalist","dd","del","details","dfn","dialog","dir","div","dl","dt","em","embed",
	"fieldset","figcaption","figure","font","footer","form","frame","frameset","h1","h2","h3",
	"h4","h5","h6","head","header","hr","html","i","iframe","img","input","ins","kbd","keygen","label",
	"legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noframes","noscript",
	"object","ol","opgroup","option","output","p","param","pre","progress","q","rp","rt","ruby",
	"s","samp","script","section","select","small","source","span","strike","strong","style","sub",
	"summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","u","ul",
	"var","video","wbr",
	
	"svg","path"
];
var ____SvgTags2 = [
	"svg",
	"a",
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animate",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"circle",
	"clipPath",
	"color-profile",
	"cursor",
	"defs",
	"desc",
	"ellipse",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"filter",
	"font",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignObject",
	"feMorphology",
	"g",
	"glyph",
	"glyphRef",
	"hkern",
	"image",
	"line",
	"linearGradient",
	"marker",
	"mask",
	"metadata",
	"missing-glyph",
	"mpath",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"radialGradient",
	"rect",
	"script",
	"set",
	"stop",
	"style",
	"switch",
	"symbol",
	"text",
	"textPath",
	"title",
	"tref",
	"tspan",
	"use",
	"view",
	"vkern"
]
____HtmlTags2.reverse();
Object.defineProperty(this, "____HtmlTags",{
	value : ____HtmlTags2,
	writable : false,
	configurable : false,
	enumerable : false
});
____SvgTags2.reverse();
Object.defineProperty(this,"____SvgTags",{
	value : ____SvgTags2,
	writable : false,
	configurable : false,
	enumerable : false
});

Class.define("UI");
UI = {}; // UI.init and UI.load are the main



Class.define("WithDOMNode", {
	from : ["WithArray","WithAlias"]
	,ctor : function() {
		this.internal.WithDOMNode.parent = null;
		this.internal.WithDOMNode.parent_component = null;
	},
	proto : {
		nodeBuild : function(parent,parent_component) {
			this.elementDefineParent(parent,parent_component);
			this.emit("nodeBuild");
			return true;
		},
		elementDefineParent : function(parent,parent_component) {
			if( this.internal.WithDOMNode.parent == null ) {
				var p = parent;
				if(parent === undefined || parent === null) {
					p = document.body;
				}
				Object.defineProperty(this.internal.WithDOMNode,"parent",{
					get : function() { return p; }
				});
				
				var p2 = parent_component;
				if(parent_component == undefined || parent_component == null) {
					p2 = null;
				}
				Object.defineProperty(this.internal.WithDOMNode,"parent_component",{
					get : function() { return p2; }
				});
				
			} else {
				if(parent==this.internal.WithDOMNode.parent) {
					// same, do nothing
				} else {
					throw "WithDOMNode.elementSetParent parent already defined";
				}
			}
		},
		nodeDispose : function() {
			this.itemClear();
			this.varClear();
			this.emit("nodeDispose");
			return true;
		}
	}
});


Class.define("WithDOMElements2",{
	from : ["WithDOMNode"]
	, ctor : function() {
		var self = this;
		this.internal.WithDOMElements2.data = {};
		this.internal.WithDOMElements2.parent = null;
		this.internal.WithDOMElements2.localId = 0;
		this.internal.WithDOMElements2.default_itemInputFilter_lock = function(index,oldvalue,newvalue) {
			return false;
		};
		this.internal.WithDOMElements2.default_itemInputPushFilter = function(index,oldvalue,newvalue) {
			
			return true;
		};
		this.on("itemInputPushFilter",this.internal.WithDOMElements2.default_itemInputPushFilter);
		this.internal.WithDOMElements2.default_itemInsertPush = function(index) {
			
			var newvalue = self.internal.WithArray.data[index];
			if(newvalue.tag=="complex_element") {
				
				var id = "_" + DOMElementCount.getInc();
				newvalue.id = id;
				newvalue.complex.internal.WithDOMElements2.id = id;
				if( !newvalue.complex.nodeBuild(newvalue.parent,self) ) {
					throw "error on build " + newvalue.name;
				}
				
				
			} else {
				
				
				var el, id;
				var isSvg = ____SvgTags.indexOf(newvalue.tag)!=-1;
				var isHtml = ____HtmlTags.indexOf(newvalue.tag)!=-1;
				if(isSvg) {
					el = document.createElementNS("http://www.w3.org/2000/svg",newvalue.tag);
					el.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
				} else if(isHtml) {
					
					el = document.createElement(newvalue.tag);
				}
				id = "_" + DOMElementCount.getInc();
				newvalue.id = id;
				el.setAttribute("id",id);
				newvalue.el = el;
				var _parent = self.internal.WithDOMNode.parent_component;
				//console.log("PARENT:",_parent);
				if(!_parent) {
					newvalue.parent.appendChild(el);
					//throw "must have a container except for UI.Body";
				} else {
					
					// find first non complex_element
					
					//	find pos at parent
					var _self = self;
					var found = false;
					
					while(_parent!=null) {
						//console.log(">1");
						var pos = -1;
						var arr = _parent.internal.WithArray.data;
						for(var x = 0; x < arr.length;x++) {
							if( arr[x].tag == "complex_element" && arr[x].complex == _self ) {
								pos = x;
								break;
							} else if(arr[x].component == _self) {
								// inside a non complex_element, so push here
								if( arr[x].el == newvalue.parent ) {
									found = true;
									newvalue.parent.appendChild(newvalue.el);
								} else {
									throw "what is this alignment?";
								}
								break;
							}
						}
						if(!found) {
							//console.log(">2");
							//console.log("A3");
							for(var x = pos+1;x < arr.length;x++) {
								//console.log(">4");
								if( arr[x].tag != "complex_element" ) { // found
									//console.log(">5");
									if( newvalue.parent == arr[x].parent ) {
										//console.log(el,arr[x].el);
										newvalue.parent.insertBefore( el, arr[x].el );
										found = true;
										break;
									} else {
										throw "what is this alignment?";
									}
								} else {
									//console.log(">6");
									// run throught complex_element (recursive);
									var stack = [[arr[x].complex,0]];
									while(stack.length>0) {
										var item = stack.pop();
										var pos = item[1];
										var node = item[0];
										var _arr = node.internal.WithArray.data;
										for(var y = pos;y < _arr.length;y++) {
											if(_arr[y].tag != "complex_element") {
												if(newvalue.parent == _arr[y].parent) {
													//console.log("@@@",newvalue.parent, newvalue.el, _arr[y].el);
													//console.log("@@",el,_arr[y].el,newvalue.parent);
													newvalue.parent.insertBefore(newvalue.el, _arr[y].el);
													newvalue.parent.insertBefore(newvalue.el, _arr[y].el);
													found = true;
													break;
												}
											} else {
												stack.push([ node, pos +1]);
												stack.push([ _arr[y].complex, 0]);
												break;
											}
										}
										if(found) break;
									}
									//console.log(">found",found);
									
								}
							}
						}
						if(!found) {
							//console.log(">3");
							_self = _parent;
							_parent = _parent.internal.WithDOMNode.parent_component;
							if(_parent == null) { // not found at all, so its the last
								newvalue.parent.appendChild(newvalue.el);
							}
						} else {
							break;
						}
					}
					
				}
				
				newvalue.component = Class.create("WithDOMElements2");	
				newvalue.el._component = newvalue.component;
				newvalue.component.elementDefineParent( newvalue.el );
				
			}
		};
		
		this.on("itemInsertPush",this.internal.WithDOMElements2.default_itemInsertPush);
		this.internal.WithDOMElements2.default_itemInputUnshiftFilter = function(index,oldvalue,newvalue) {
			return true;
		};
		this.internal.WithDOMElements2.default_itemInsertUnshift = function(index) {
			var newvalue = this.internal.WithArray.data[index];
			if(newvalue.tag=="complex_element") {
				var id = "_" + DOMElementCount.getInc();
				newvalue.id = id;
				newvalue.complex.internal.WithDOMElements2.id = id;
				if( !newvalue.complex.nodeBuild(newvalue.parent,self) ) {
					throw "error on build " + newvalue.name;
				}
				// unshift here just build component, its the same of push
				
			} else {
				
				var el, id;
				var isSvg = ____SvgTags.indexOf(newvalue.tag)!=-1;
				var isHtml = ____HtmlTags.indexOf(newvalue.tag)!=-1;
				console.log("UNSHIFT",newvalue.tag);
				if(isSvg) {
					el = document.createElementNS("http://www.w3.org/2000/svg",newvalue.tag);
					el.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
				} else if(isHtml) {
				
					el = document.createElement(newvalue.tag);
				}
				id = "_" + DOMElementCount.getInc();
				newvalue.id = id;
				el.setAttribute("id",id);
				
				
				// reverse find last newvalue.tag!=complex_element to 'insertAfter' (1)
				// to 'insertAfter' we get the next of that one and insertBefore, 
				// if there is no newvalue.tag!=complex_element after that we found in (1) or the next is 'this' or end of search then we append.
				
				var _parent = self.internal.WithDOMNode.parent_component;
				
				if(!_parent) {
					console.log("found body");
					if(newvalue.parent.childNodes.length>0)
						newvalue.parent.insertBefore(el,newvalue.parent.childNodes[0]);
					else
						newvalue.parent.appendChild(el);
				} else {
					var _self = self;
					var found = false;
					while(_parent!=null) {
						var arr = _parent.internal.WithArray.data;
						var pos = _parent.internal.WithArray.data.length-1;
						for(var x = pos; x >= 0; x--) {
							
							if( arr[x].tag == "complex_element" && arr[x].complex == _self ) { //test
								pos = x;
								break;
							} else if(arr[x].component == _self) {
								// inside a non complex_element, so unshift here
								if( arr[x].el == newvalue.parent ) {
									found = true;
									if(newvalue.parent.childNodes.length>0)
										newvalue.parent.insertBefore(el,newvalue.parent.childNodes[0]);
									else
										newvalue.parent.appendChild(el);
								} else {
									throw "what is this alignment?";
								}
								break;
							}
							
						}
						if(!found) { // current _self is the component that holds the pointer
							for(var x = pos-1;x >= 0; x--) {
								if( arr[x].tag != "complex_element" ) { // found
									var _p = -1;
									for(var y = 0; y < newvalue.parent.childNodes.length;y++) {
										if(newvalue.parent.childNodes[y] == arr[x].el) {
											console.log("##########A");
											_p = y;
											break;
										}
									}
									if(_p!=-1) {
										if(_p+1 < newvalue.parent.childNodes.length) {
											found = true;
											newvalue.parent.insertBefore(el, newvalue.parent.childNodes[_p+1]);
										} else {
											found = true;
											newvalue.parent.appendChild(el);
										}
									} else { // last
										found = true;
										newvalue.parent.appendChild(el);
									}
									break;
								} else {
									
									var stack = [[arr[x].complex, arr[x].complex.internal.WithArray.data.length-1 ]];
									
									while(stack.length>0) {
										var item = stack.pop();
										var pos = item[1];
										var node = item[0];
										var _arr = node.internal.WithArray.data;
										for(var y = pos;y >= 0; y--) {
											if(_arr[y].tag != "complex_element") {
												if(newvalue.parent == _arr[y].parent) {
													var _p = -1;
													for(var z = 0; z < newvalue.parent.childNodes.length;z++) {
														if(newvalue.parent.childNodes[z] == _arr[y].el) {
															_p = z;
															break;
														}
													}
													if(_p!=-1) {
														if(_p+1 < newvalue.parent.childNodes.length) {
															newvalue.parent.insertBefore(el, newvalue.parent.childNodes[_p+1]);
														} else {
															newvalue.parent.appendChild(el);
														}
													} else {
														newvalue.parent.appendChild(el);
													}
													found = true;
													break;
												}
											} else {
												stack.push([ node, pos-1]);
												stack.push([ _arr[y].complex, _arr[y].complex.internal.WithArray.data.length-1]);
												break;
											}
											if(found) break;
										}
									}
									
								}
							}
						}
						if(!found) {
							console.log("y");
							_self = _parent;
							_parent = _parent.internal.WithDOMNode.parent_component;
							if(_parent == null) { // not found at all, so its the last
								if(newvalue.parent.childNodes.length>0)
									newvalue.parent.insertBefore(el,newvalue.parent.childNodes[0]);
								else
									newvalue.parent.appendChild(el);
							}
						} else {
							break;
						}
					}
				}
				newvalue.el = el;
				newvalue.component = Class.create("WithDOMElements2");	
				newvalue.el._component = newvalue.component;
				newvalue.component.elementDefineParent( newvalue.el );
			}
		};
		
		this.internal.WithDOMElements2.default_itemInputReplaceFilter = function(index,oldvalue,newvalue) {
			if(oldvalue != null ) {
				// must dispose oldvalue
				
			}
		};
		
		
		this.on("itemInputUnshiftFilter",this.internal.WithDOMElements2.default_itemInputUnshiftFilter);
		this.on("itemInsertUnshift",this.internal.WithDOMElements2.default_itemInsertUnshift);
		
		this.internal.WithDOMElements2.default_itemOutputPopFilter = function(index,value){
		};
		this.internal.WithDOMElements2.default_itemOutputShiftFilter = function(index,value){
		};
		this.internal.WithDOMElements2.default_itemOutputFilter = function(index,value){
			if("component" in value) {
				value.component.nodeDispose();
			}
			if(value.tag=="complex_element") {
				value.complex.nodeDispose();
			} else {
				try {
					value.component.nodeDispose();
					value.parent.removeChild( value.el );
					this.varUnset( value.name );
				} catch(e) {
					console.log(value.name,e);
					console.log("!!",value.parent,value.el);
					var b = [];
					for(var x = 0; x < value.parent.childNodes.length;x++) {
						b.push( x, value.parent.childNodes[x] );
					}
					console.log( b.join(","));
				}
			}
			return true;
		};
		this.on("itemOutputFilter",this.internal.WithDOMElements2.default_itemOutputFilter);
		
		var elementNew = function() {
			self.internal.WithDOMElements2.localId += 1;	
			if(arguments.length == 1) {
				var tag, name, type,complex;
				var isSvg = ____SvgTags.indexOf(arguments[0])!=-1;
				var isHtml = ____HtmlTags.indexOf(arguments[0])!=-1;
				if(isSvg || isHtml) {
					name = "(anonymous)";
					tag = arguments[0];
					type = "";
				} else {
					name = "(anonymous)";
					tag = "complex_element";
					var _class_args = {};
					_class_args[arguments[0]] = [];
					complex = Class.create(arguments[0],_class_args);
					type = arguments[0];
				}
				name = "elem_" + self.internal.WithDOMElements2.localId;
				value = {
					id : self.internal.WithDOMElements2.localId,
					name : name,
					tag : tag,
					el : null,
					type : type,
					complex : complex,
					parent : self.internal.WithDOMNode.parent,
					self : self,
					args : {},
					array : false
				};
				return value;
			} else if(arguments.length==2) {

				var tag, name, type, complex;
				var isSvg = ____SvgTags.indexOf(arguments[1])!=-1;
				var isHtml = ____HtmlTags.indexOf(arguments[1])!=-1;
				if(isSvg || isHtml) {
					name = arguments[0];
					tag = arguments[1];
					type = "";
				} else {
					name = arguments[0];
					tag = "complex_element";
					var _class_args = {};
					_class_args[arguments[1]] = [];
					complex = Class.create(arguments[1],_class_args);
					
					type = arguments[1];
				}
				value = {
					id : self.internal.WithDOMElements2.localId,
					name : name,
					tag : tag,
					el : null,
					type : type,
					self : self,
					complex : complex,
					parent : self.internal.WithDOMNode.parent,
					args : {},
					array : false
				};
				return value;
			} else if(arguments.length ==3) {
				var tag, name, type;
				var isSvg = ____SvgTags.indexOf(arguments[1])!=-1;
				var isHtml = ____HtmlTags.indexOf(arguments[1])!=-1;
				if(isSvg || isHtml) {
					name = arguments[0];
					tag = arguments[1];
					type = "";
				} else {
					
					name = arguments[0];
					tag = "complex_element";
					complex = Class.create(arguments[1],arguments[2]);
					type = arguments[1];
				}
				value = {
					id : self.internal.WithDOMElements2.localId,
					name : name,
					tag : tag,
					el : null,
					self : self,
					type : type,
					complex : complex,
					parent : self.internal.WithDOMNode.parent,
					args : {},
					array : false
				};
				return value;
			
			}
		}
		this.elementPush = function() {
			
			//	1 -> type:string (anonymous)
			//	2 -> name:string, type:string
			
			//	must have elementPushPacket
			//	2 -> xml:string, options:object (anonymouse)
			//	3 -> name:string, xml:string, options: object
			//	find first and last real element to add elementInsertBefore(name) elementInsertAfter(name)
			
			
			//	3 -> name:string, type:string, options:object
			
			//	may have elementPushPacketAjax
			//	3 -> ajax:object, options:object, callback:function (anonymous)
			//	4 -> name:string, ajax:object, options:object, callback:function
			//	find is async
			
			if(this.internal.WithDOMNode.parent==null) {
				throw "WithDOMElements2.elementPush has no parent defined. Use WithDOMNode.elementDefineParent before.";
			}
			
			if(arguments.length == 3) {
				var t = Object.prototype.toString.apply(arguments[2]);
				if(t == "[object Object]") {
					var value = elementNew(arguments[0],arguments[1],arguments[2]);
					//console.log("1>>>>>>>>",value.name,arguments[1]);
					this.varSet(value.name,value);
					this.itemPush(value);
					
					if(value.tag != "complex_element") {
						BrowserTools.setStyle(value.el,arguments[2]);
					}
					if(value.tag == "complex_element") {
						return {
							$ : value.complex
						}
					} else {
						return {
							el : value.el,
							$ : value.component
						}
					}
				} else {
					throw "WithDOMElements2.elementPush : third argument must be object.";
				}
			} else if(arguments.length == 2) {
				var t = Object.prototype.toString.apply(arguments[1]);
				if(t == "[object String]") {
					// (name,type)
					
					var value = elementNew(arguments[0],arguments[1]);
					//console.log("2>>>>>>>>",value.name,arguments[1]);
					this.itemPush(value);
					
					this.varSet(value.name,value);
					
					if(value.tag == "complex_element") {
						return {
							$ : value.complex
						}
					} else {
						return {
							el : value.el,
							$ : value.component
						}
					}
				} else {
					throw "WithDOMElements2.elementPush : second argument must be string.";
				}
			} else if(arguments.length == 1) {
				var value = elementNew(arguments[0]);
				// this.varSet(name,value); // no name, so can't refer to this object directly
				this.itemPush(value);
				if(value.tag == "complex_element") {
					return {
						$ : value.complex
					}
				} else {
					return {
						el : value.el,
						$ : value.component
					}
				}
			} else {
				throw "elementPush : invalid call, must have 1, 2 or 3 arguments";
			}
		};
		this.elementUnshift = function() {
			
			//	1 -> name:string (tag or component)
			//	2 -> name:string, type:string
			//	2 -> xml:string, options:object
			//	3 -> name:string, type:string, options:object
			//	3 -> ajax:object, options:object, callback:function
			
			if(this.internal.WithDOMNode.parent==null) {
				throw "WithDOMElements2.elementUnshift has no parent defined. Use WithDOMNode.elementDefineParent before.";
				
			}
			
			if(arguments.length == 3) {
				var t = Object.prototype.toString.apply(arguments[2]);
				if(t == "[object Object]") {
					var value = elementNew(arguments[0],arguments[1],arguments[2]);
					this.varSet(value.name,value);
					this.itemUnshift(value);
					
					if(value.tag != "complex_element") {
						BrowserTools.setStyle(value.el,arguments[2]);
					}
					
					if(value.tag == "complex_element") {
						return {
							$ : value.complex
						}
					} else {
						return {
							el : value.el,
							$ : value.component
						}
					}
				} else {
					throw "WithDOMElements2.elementPush : third argument must be object.";
				}
			} else if(arguments.length == 2) {
				// (name,type)
				var t = Object.prototype.toString.apply(arguments[1]);
				if(t == "[object Object]") {
				
				} else if(t == "[object String]") {
					// (name,type)
					var value = elementNew(arguments[0],arguments[1]);
					this.varSet(value.name,value);
					this.itemUnshift(value);
					if(value.tag == "complex_element") {
						return {
							$ : value.complex
						}
					} else {
						return {
							el : value.el,
							$ : value.component
						}
					}
				}
			} else if(arguments.length == 1) {
				var value = elementNew(arguments[0]);
				// this.varSet(name,value); // no name, so can't refer to this object directly
				this.itemUnshift(value);
				if(value.tag == "complex_element") {
					return {
						$ : value.complex
					}
				} else {
					return {
						el : value.el,
						$ : value.component
					}
				}
			} else {
				throw "elementPush : invalid call, must have 1, 2 or 3 arguments";
			}
		};
		
		var newPacket = function(parent,pattern,options) {
			pattern = pattern.split("\r").join("").split("\n").join("").split("\t").join(" ");
			var ret = {
				el : {},
				$ : {},
				conv : {}
			};
			var intag = false;
			var intagname = false;
			var intagattrib = false;
			var intagattrib_key = false;
			var intagattrib_val = false;
			var intagattrib_string = false;
			var intagattrib_string2 = false;
			var stack = [];
			var pointer = [{
				element : parent.internal.WithDOMNode.parent,
				container : parent,
			}];
			var text = "";
			var attributes_to_delete = [];
			var ret_pointer = ret;
			var current = {};
			var current_attribute = null;
			var count = 0;
			var later_attribs = [];
			/*
			function ask(stream_clue,partial) {
				if("ask" in options) {
					//console.log("asking");
					var extra_args = [stream_clue, partial];
					return options.ask.apply(options.ask_owner,options.ask_args.concat(extra_args));
				}
			}
			*/
			function tag_handle(tag) {
				//console.log(tag);
				if(tag.endTag) {
					if(stack[stack.length-1].tagName == tag.tagName) {
						stack.pop();
						pointer.pop();
					} else {
						while(stack.length>0) {
							stack.pop();
							pointer.pop();
							if( stack.length >0 && stack[stack.length-1].tagName == tag.tagName ) {
								return;
							}
						}
						throw "odd tag " + tag.tagName;
					}
				} else {
					if(tag.soleTag) {
						function create_ask_obj(x) {
							return { type : "attribute", key : tag.attributes[x].name, value : tag.attributes[x].value};
						}
						var id = [""];
						var check = false;
						var value = "";
						var has_src = false;
						var src = "";
						for(var x = 0; x < tag.attributes.length;x++) {
							if(tag.attributes[x].name=="id") {
								check = true;
								if( tag.attributes[x].value == "") throw "tag with identification must have a name";
								
								id.push( tag.attributes[x].value );
							} else if(tag.attributes[x].name=="src") {
								
								has_src = true;
								src = tag.attributes[x].value;
								
							}
							if(tag.tagName == "text" && tag.attributes[x].name=="value") {
								value = BrowserTools.decodeEntities(tag.attributes[x].value);
							}
						}
						var tmp = attributes_to_delete.length;
						while(tmp>0) { tmp-=1; attributes_to_delete.pop(); }
						if(!check) { id.push( "_" + count ); }
						id = id.join("");
						if(tag.tagName == "text") {
							if(has_src) {
								// load file from localStorage
								var data = localStorage.getItem(src);
								var el = pointer[pointer.length-1].container.elementPush( id, "span" ).el;
								el.appendChild( document.createTextNode(""+value) );
							} else {
								
								var el = pointer[pointer.length-1].container.elementPush( id, "span" ).el;
								el.appendChild( document.createTextNode(""+value) );	
							}
						} else {
							var el = pointer[pointer.length-1].container.elementPush( id, tag.tagName ).el;
							var iv = self.varGet(id);
							
							var convert_id = id;
							var direct = false;
							
							var toremove = [];
							var elc = pointer[pointer.length-1].container.elementGetContents( id );
							if(!check) {
								convert_id = el ? el.getAttribute("id") : elc.getAttribute(id);
								direct = true;
							}
							
							if(check) {
								ret.el[id] = el;
								ret.$[id] = elc;
								ret.conv[id] = el ? el.getAttribute("id") : elc.getAttribute(id);
							}
							
							var skip = false;
							for(var x = 0; x < tag.attributes.length;x++) {
								skip = false;
								var ask_obj = { 
									type : "attribute", 
									key : tag.attributes[x].name, 
									value : tag.attributes[x].value, 
									id : convert_id, 
									element : el
								};
								/*
								if(options) {
									if( "attributes" in options ) {
										//console.log(tag.attributes[x].name,options.attributes,"ask" in options);
									}
								}
								if(options && "attributes" in options && options.attributes.indexOf( tag.attributes[x].name ) != -1) {
									//console.log("[here1 ***]");
									if(options && "ask" in options) {
										//console.log("[here2]");
										//console.log("[here3]");
										//console.log(ask_obj);
										var r = ask(ask_obj,ret);
										//console.log("#attrib."+tag.attributes[x].name+":",r);
										if(r==100) { // do not set element
											var info = { 
												nc_id : convert_id,
												el : el,
												direct : direct,
												tagName : tag.tagName,
												tagAttribName : tag.attributes[x].name,
												tagAttribHasValue : tag.attributes[x].has_value,
											};
											if(info.tagAttribHasValue) info.tagAttribValue = tag.attributes[x].value;
											later_attribs.push(info);
											
										}
										//console.log("[here4]");
										skip = true;
										//console.log("[here6 SE]",x);
									}
								}
								*/
								//console.log("SOLE TAG",tag.tagName);
								var t = tag.attributes[x];
								if((!skip) && (t.name != "id")) {
									if(t.value.charAt(0) == "\"" && t.value.charAt( t.value.length-1 ) == "\"") {
										t.value = t.value.substring( 1, t.value.length-1 );
									}
									el ? el.setAttribute( t.name, t.value ) : elc.setAttribute( t.name, t.value );
								}
							}
							if(!check) {
								count += 1;
							}
						}
					} else {
						stack.push(tag);
						var id = "";
						var check = false;
						for(var x = 0; x < tag.attributes.length;x++) {
							if(tag.attributes[x].name=="id") {
								check = true;
								if( tag.attributes[x].value == "") throw "tag with identification must have a name";
								id += tag.attributes[x].value;
								break;
							}
						}
						if(!check) {
							id += "_" + count;
						}
						//console.log(">>>>>>@@",id);
						var pel = pointer[pointer.length-1].container.elementPush( id, tag.tagName );
						//console.log(">>>>>>@@",id);
						var el = pel.el;
						for(var x = 0;x< self.internal.WithArray.data.length;x++) {
							var item = self.internal.WithArray.data[x];
							//console.log(item);
						}
						var iv = self.varGet(id);
						
						var convert_id = id;
						var direct = false;
						if(!check) {
							//convert_id = el.getAttribute("id");
							//direct = true;
						}
						var elc = pointer[pointer.length-1].container.elementGetContents( id );
						pointer.push({
							element : el,
							container : elc
						});
						if(check) {
							//console.log("##",id);
							ret.el[id] = el;
							ret.$[id] = elc;
							ret.conv[id] = el ? el.getAttribute("id") : elc.getAttribute("id");
						}
						var skip = false;	
						for(var x = 0; x < tag.attributes.length;x++) {
							skip = false;
							/*
								var ask_obj = { 
									type : "attribute", 
									key : tag.attributes[x].name, 
									value : tag.attributes[x].value, 
									id : convert_id, 
									element : el
								};
								if(options) {
									if( "attributes" in options ) {
										//console.log(tag.attributes[x].name,options.attributes,"ask" in options);
									}
								}
								if(options && "attributes" in options && options.attributes.indexOf( tag.attributes[x].name ) != -1) {
									//console.log("[here1 ***]");
									if(options && "ask" in options) {
										//console.log("[here2]");
										//console.log("[here3]");
										console.log(ask_obj);
										var r = ask(ask_obj,ret);
										console.log("#attrib."+tag.attributes[x].name+":",r);
										//console.log("[here4]");
										if(r==100) { // later attribs
											var info = { 
												nc_id : convert_id,
												el : el,
												direct : direct,
												tagName : tag.tagName,
												tagAttribName : tag.attributes[x].name,
												tagAttribHasValue : tag.attributes[x].has_value,
											};
											if(info.tagAttribHasValue) info.tagAttribValue = tag.attributes[x].value;
											later_attribs.push(info);
											
										}
										skip = true;
										console.log("[here6 SE]",x);
										
										
									}
								}
							*/
							var t = tag.attributes[x];
							if((!skip) && t.name != "id") {
								if(t.value.charAt(0) == "\"" && t.value.charAt( t.value.length-1 ) == "\"") {
									t.value = t.value.substring( 1, t.value.length-1 );
								}
								el ? el.setAttribute( t.name, t.value ) : elc.setAttribute(t.name, t.value);
							}
						}
						if(!check) {
							count += 1;
						}
					}
				}
			}
			function clear_flags() {
				intag = false;
				intagname = false;
				intagattrib = false;
				intagattrib_key = false;
				intagattrib_val = false;
				intagattrib_string = false;
				intagattrib_string2 = false;
			}
			if( Object.prototype.toString.apply(pattern) == "[object String]" ) {
				for(var x = 0; x < pattern.length;x++) {
					var ch = pattern.charAt(x);
					//console.log(ch);
					/*
					console.log(x,ch,pattern.substring(x),
						"intag",intag,
						"intagname",intagname,
						"intagattrib",intagattrib,
						"intagattrib_key",intagattrib_key,
						"intagattrib_val",intagattrib_val,
						"intagattrib_string",intagattrib_string
					);
					*/
					if(!intag) {
						if( ch == "<" ) {
							if(text!="") {
								text = text.split("\r").join("").split("\n").join(" ");
								current = { tagName : "text", endTag: false, soleTag : true, attributes : [ { name : "value", value : text, has_value : true } ] };
								clear_flags(); tag_handle(current);
							}
							if(pattern.indexOf("<!",x)==x) {
							} else if(pattern.indexOf("<!-",x)==x) {
							} else if(pattern.indexOf("<!--",x)==x) {
								var end = pattern.indexOf("-->");
								if(end!=-1) x = end;
								else x = pattern.length;
								continue;
							} else if(pattern.indexOf("<![CDATA[",x)==x) {
								throw "CDATA not implemented.";
							} else {
								// find comments
								intag = true;
								intagname = true;
								intagattrib = false;
								while(x+1 < pattern.length && pattern.charAt(x+1) == " ") x += 1;
								if( x + 1 < pattern.length && pattern.charAt(x+1) == "/" ) {
									//console.log("mark end tag",pattern.substring(x));
									x += 1;
									current = { tagName : "", endTag : true, soleTag : false, attributes : [] };
								} else {
									//console.log("mark tag start",pattern.substring(x));
									current = { tagName : "", endTag : false, soleTag : false, attributes : [] };
								}
							}
							text = "";
						} else {
							text += ch;
						}
					} else {
						if(intagname) {
							if(ch == "/") {
								while(x+1 < pattern.length && pattern.charCodeAt(x+1) == " ") x+= 1;
								if(x + 1 < pattern.length && pattern.charAt(x+1) == ">" ) {
									clear_flags(); current.soleTag = true; tag_handle(current);
									x++;
								} else {
									console.log(x,pattern.substring(x));
									throw "unexpected tag end";
								}
							} else if( ch == ">") {
								clear_flags(); tag_handle(current);
							} else if( ch == " ") {
								intagname = false;
								intagattrib = false;
							} else {
								current.tagName += ch;
							}
						} else if(intagattrib) {
							if(intagattrib_key) {
								if(ch == " ") {
									intagattrib = false;
									current_attribute = null;
								} else if(ch == ">") {
									clear_flags(); tag_handle(current);
								} else if(ch == "/") {
									while(x+1 < pattern.length && pattern.charCodeAt(x+1) == " ") x+= 1;
									if(x + 1 < pattern.length && pattern.charAt(x+1) == ">" ) {
										clear_flags(); current.soleTag = true; tag_handle(current);
										x++;
									} else throw "unexpected tag end";
								} else if( ch == "=" ) {
									intagattrib_key = false;
									intagattrib_val = true;
								} else {
									current_attribute.name += ch;
								}
								
							} else if(intagattrib_val) {
								if( intagattrib_string ) {
									if(ch == "\"") {
										current_attribute = null;
										intagattrib = false;
										intagattrib_key = false;
										intagattrib_val = false;
										intagattrib_string = false;
									} else {
										current_attribute.has_value = true;
										current_attribute.value += ch;
									}
								} else if( intagattrib_string2 ) {
									if(ch == "'") {
										current_attribute = null;
										intagattrib = false;
										intagattrib_key = false;
										intagattrib_val = false;
										intagattrib_string2 = false;
									} else {
										current_attribute.has_value = true;
										current_attribute.value += ch;
									}
								} else {
									if( current_attribute.value == "" && ch == "\"" ) {
										intagattrib_string = true;
									} else if(current_attribute.value == "" && ch == "'") {
										intagattrib_string2 = true;
									} else if(ch == "/") {
										while(x+1 < pattern.length && pattern.charCodeAt(x+1) == " ") x+= 1;
										if(x + 1 < pattern.length && pattern.charAt(x+1) == ">" ) {
											clear_flags(); current.soleTag = true; tag_handle(current);
											x++;
										} else throw "unexpected tag end";
									} else if(ch == ">") {
										clear_flags();
										tag_handle(current);
									} else if(ch != " ") {
										current_attribute.has_value = true;
										current_attribute.value += ch;
									} else {
										intagattrib = false;
										intagattrib_key = false;
										intagattrib_val = false;
										intagattrib_string = false;
										current_attribute = null;
									}
								}
							} else {
								while(pattern.charAt(x) == " " && x < pattern.length) x+=1;
								if(x == pattern.length) throw "unexpected tag end";
								ch = pattern.charAt(x);
								if( ch == "/") {
									while(x+1 < pattern.length && pattern.charCodeAt(x+1) == " ") x+= 1;
									if(x + 1 < pattern.length && pattern.charAt(x+1) == ">" ) {
										clear_flags(); current.soleTag = true; tag_handle(current);
										x++;
									} else {
										throw "unexpected tag end";
									}
								} else if(ch == ">") {
									clear_flags(); tag_handle(current);
								} else {
									intagattrib = true;
									intagattrib_key = true;
									intagattrib_val = false;
									var attrib = {};
									attrib.name = ch;
									attrib.value = "";
									attrib.has_value = false;
									current.attributes.push(attrib);
									current_attribute = attrib;
								}
							}
						} else {
							if( ch == " ") continue;
							else if(ch == "/") { // sole tag
								while(x+1 < pattern.length && pattern.charCodeAt(x+1) == " ") x+= 1;
								if(x + 1 < pattern.length && pattern.charAt(x+1) == ">" ) {
									clear_flags(); current.soleTag = true; tag_handle(current);
									x++;
								} else {
									throw "unexpected tag end";
								}
							} else if(ch == ">") {
								clear_flags(); tag_handle(current);
							} else { // attrib init
								intagname = false;
								intagattrib = true;
								intagattrib_key = true;
								intagattrib_val = false;
								var attrib = {};
								attrib.has_value = false;
								attrib.name = ch;
								attrib.value = "";
								current.attributes.push(attrib);
								current_attribute = attrib;
							}
						} 
					}
				}
				if(text != "") {
					text = text.split("\r").join("").split("\n").join(" ");
					current = { tagName : "text", endTag: false, soleTag : true, attributes : [ { name : "value", value : text, has_value : true } ] };
					clear_flags(); tag_handle(current);
				}
			}
			/*
			console.log("LATER ATTRIBS:",later_attribs.length);
			for(var x = 0; x < later_attribs.length;x++) {
				console.log(later_attribs[x].tagName);
				var info = { type : "later_attribute", key : later_attribs[x].tagAttribName };
				if( later_attribs[x].tagAttribHasValue ) {
					info.value = later_attribs[x].tagAttribValue;
				}
				console.log(ret);
				var r = ask(info,ret);
				console.log( later_attribs[x], r.key, r.value );
				if(r.key==null && r.value==null) {
					
				} else {
					if("svg" in r && r.svg) {
						if(later_attribs[x].direct) {
							document.getElementById( later_attribs[x].nc_id ).setAttributeNS( 'http://www.w3.org/1999/xlink',r.key, r.value );
						} else {
							ret.el[later_attribs[x].nc_id].setAttributeNS( 'http://www.w3.org/1999/xlink',r.key,r.value );
						}
					} else {
						if(later_attribs[x].direct) {
							document.getElementById( later_attribs[x].nc_id ).setAttribute( r.key, r.value );
						} else {
							ret.el[later_attribs[x].nc_id].setAttribute( r.key,r.value );
						}
					}
				}
			}
			*/
			return ret;
		}
		
		this.elementPushPacket = function() {
			var parent;
			if(arguments.length == 1) { // doc
				parent = this.elementPush("WithDOMElements2");
				return newPacket(parent.$,arguments[0]);
			} else if(arguments.length == 2) { // name,doc
				parent = this.elementPush(arguments[0],"WithDOMElements2");
				return newPacket(parent.$,arguments[1]);
			}
		};
		this.elementUnshiftPacket = function() {
			var parent;
			if(arguments.length == 1) {
				parent = this.elementUnshift("WithDOMElements2");
				return newPacket(parent.$,arguments[0]);
			} else if(arguments.length == 2) {
				parent = this.elementUnshift(arguments[0],"WithDOMElements2");
				return newPacket(parent.$,arguments[1]);
			}
		};
		
	}
	, proto : {
		getAttribute : function(key) {
			if(key in  this.internal.WithDOMElements2) {
				return this.internal.WithDOMElements2[key];
			}
			return null;
		},
		setAttribute : function(key,value) {
			this.internal.WithDOMElements2[key] = value;
		},
		elementPop : function() {
			var p = this.itemPop();
			var names = this.varNamesByValue(p);
			if(names.length>0) {
				for(var x = 0; x < names.length;x++) {
					this.varUnset(names[x]);
				}
			}
			return p;
		},
		elementShift : function() {
			var p = this.itemShift();
			var names = this.varNamesByValues(p);
			if(names.length>0) {
				for(var x = 0; x < names.length;x++) {
					this.varUnset(names[x]);
				}
			}
			return p;
		},
		elementSetPacket : function() { // = -> means replace
			this.elementsClear();
			return this.elementPushPacket(arguments[0]);
		},
		elementRemove : function(name) {
			var itemA = this.varGet(name);
			//console.log("element remove called ",name,itemA.id);
			//console.log(itemA,name);
			this.itemRemoveComplex(function(x,itemB) {
				//console.log(itemA,itemB);
				return (itemB.id == itemA.id);
			});
			this.varUnset(name);
		},
		elementRename : function(oldname,newname) {
			var val = this.varGet(oldname);
			this.elementRemove(oldname);
			this.varSet(newname,val);
			this.itemPush(val);
		},
		elementIsComplex : function(name) {
			var ret = this.varGet(name);
			if(ret!=null) {
				if(ret.tag == "complex_element") {
					return true;
				}
			}
			return false;
		},
		elementGetContents : function(name) {
			var ret = this.varGet(name);
			if(ret==null) return null;
			if(ret.tag=="complex_element") {
				return ret.complex;
			} else {
				return ret.component;
			}
		},
		elementGetRaw : function(name) {
			var ret = this.varGet(name);
			if(ret==null) return null;
			if(ret.tag=="complex_element") {
				throw "'"+name+"' element do not have raw. may have.";
			} else {
				return ret.el;
			}
		},
		elementsClear : function() {
			var items = this.itemClear();
			this.varClear();
			delete items;
		},
		elementAddEvent : function(name,event,callback) {
			var target = this.varGet(name);
			if(target!=null) {
				if( target.tag != "complex_element" ) {
					target.el.addEventListener(event,callback);
					return true;
				} else {
					if("WithEvents" in target.complex.internal) {
						target.complex.on(event,callback);
						return true;
					}
					return false;
				}
			}
			return false;
		},
		elementRemoveEvent : function(name,event,callback) {
			var target = this.varGet(name);
			if(target!=null) {
				if(target.tag != "complex_element") {
					target.el.removeEventListener(event,callback);
					return true;
				} else {
					if("WithEvents" in target.complex.internal) {
						target.complex.off(event,callback);
						return true;
					}
					return false;
				}
			}
		},
		elementLock : function() {
			this.on("itemInputFilter",this.internal.WithDOMElements2.default_itemInputFilter_lock);
		},
		elementUnlock : function() {
			this.off("itemInputFilter",this.internal.WithDOMElements2.default_itemInputFilter_lock);
		},
		elementRender : function(time) {
			return;
		}
	}
});







function _Struct_UIWindow() {}
_Struct_UIWindow.prototype.data = window;
_Struct_UIWindow.prototype.loaded = false;
_Struct_UIWindow.prototype.keyboard = {};

Class.define("UI.Window", { 
	from : ["WithEvents"]
	, struct: _Struct_UIWindow
	, ctor : function() {
	
		var self = this.internal["UI.Window"];
		
		self.keyboard.enabled = true;
		self.keyboard.shift = false;
		self.keyboard.capslock = false;
		self.keyboard.alt = false;
		self.keyboard.ctrl = false;
		self.keyboard.keys = {};
		this.on("on", function(event,callback) {
			if(event=="load") {
				if(self.loaded) {
					callback();
				} else {
					self.data.addEventListener(event,callback);
				}
			} else {
				self.data.addEventListener(event,callback);
			}
			return true;
		});
		this.on("off",function(event,callback) {
			self.data.removeEventListener(event,callback);
			return true;
		});
		
		Object.defineProperty(this,"keyboard",{
			get : function() {
				return this.internal["UI.Window"].keyboard;
			}
		});
		
		this.on("keydown",function(e) {
			self.keyboard.keys[e.keyCode] = true;
			if(e.keyCode == 16) {
				self.keyboard.shift = true;
			}
			if(e.keyCode == 17) {
				self.keyboard.ctrl = true;
			}
			if(e.keyCode == 18) {
				self.keyboard.alt = true;
			}
		});
		this.on("keyup",function(e) {
			self.keyboard.keys[e.keyCode] = false;
			if(e.keyCode == 16) {
				self.keyboard.shift = false;
			}
			if(e.keyCode == 17) {
				self.keyboard.ctrl = false;
			}
			if(e.keyCode == 18) {
				self.keyboard.alt = false;
			}
		});
		if("onorientationchange" in window) {
			this.on("orientationchange", function() {
			}, false);
		}
	}
	,proto : {
		get : function() {
			
		},
		getStringSize : function(str,style) {
			var s = document.createElement("span");
			//s.style.position = "relative";
			s.style.visibility = "hidden";
			
			BrowserTools.setStyle(s,style);
			s.style.padding = "0px";
			s.style.margin = "0px";
			s.innerHTML = str;
			UI.Body.get().appendChild(s);
			
			var w = s.offsetWidth;
			var h = s.offsetHeight;
			
			UI.Body.get().removeChild(s);
			//getStringSize
			
			return [w,h];
		},
		getBounds : function() {
			var window_width = window.innerWidth || document.documentElement.clientWidth || body.clientWidth,
			window_height = window.innerHeight|| document.documentElement.clientHeight|| body.clientHeight;
			return [ window_width, window_height ];
		}
	}
});


Class.define("UI.Document", { 
	from : ["WithEvents"]
	, ctor : function() {
		var self = this.internal["UI.Document"];
		self.data = document;
		
		this.on("on", function(event,callback) {
			//console.log("set visibility change event");
			self.data.addEventListener(event,callback);
			return true;
		});
		this.on("off",function(event,callback) {
			self.data.removeEventListener(event,callback);
			return true;
		});
		self.context_menu = true;
		self.cancel_context_menu = function(event) {
			event = event || window.event;
			if (event.stopPropagation)
				event.stopPropagation();
				console.log(event.button);
			event.cancelBubble = true;
			return false;
		}
		
			
	}
	, proto : {
		get : function() {
			var self = this.internal["UI.Document"];
			return self.data;
		},
		trackMouse : function() {
		
			var mousePos = {
				x : 0,
				y : 0
			};
			this.mouse = mousePos;
			document.onmousemove = function handleMouseMove(event) {
				var dot, eventDoc, doc, body, pageX, pageY;
				event = event || window.event; // IE-ism
				console.log("move");
				if (event.pageX == null && event.clientX != null) {
					eventDoc = (event.target && event.target.ownerDocument) || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
					event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
				console.log(event.pageX,event.pageY);
				mousePos = {
				    x: event.pageX,
				    y: event.pageY
				};
			}
		
		
		},
		defaultContextMenu : function() {
			var self = this.internal["UI.Document"];
			if(arguments.length==0) {
				return self.context_menu;
			} else {
				var b = !!arguments[0];
				if(b) {
					if(!this.defaultContextMenu()) self.data.oncontextmenu = null;
					self.context_menu = true;
				} else {
					if(this.defaultContextMenu()) self.data.oncontextmenu = self.cancel_context_menu;
					self.context_menu = false;
				}
			}
		},
		mouse : function() { 
			return this._mouse;
		}
	}
});
Class.define("UI.Body",{ from : ["WithDOMElements2"] , ctor :
	function(){
		var i = this.internal["UI.Body"];
		this.debug = true;
		
		this.on( "on", function(event,callback) {
			document.body.addEventListener(event,callback);
			return true;
		});
		this.on("off",function(event,callback) {
			document.body.removeEventListener(event,callback);
			return true;
		});
		
		i.__selectstart_event = function(e) { e.preventDefault(); return false; };
		
	}, proto : {
		nodeDispose : function() {
			TabIndexCount.reset(1);
			//this.container.nodeDispose(); // remove all only inside div:container, which is permanent
			return true;
		},
		RenderLoop : function() {
			var time = window.performance.now();
			// check data ready
			
			// render
			UI.Body.elementRender(time);
			// the caller are in UI.load, UI.init -> so it's self calling if initialized
			
			if(UI.Body.debug) {
				//console.log("debug");
				setTimeout(UI.Body.RenderLoop,0);
			} else {
				requestAnimationFrame(UI.Body.RenderLoop);
			}
			
		},
		canSelect : function(value) {
			if(value===true) {
				this.off("selectstart",this.internal["UI.Body"].__selectstart_event);
			} else if(value===false) {
				this.on("selectstart",this.internal["UI.Body"].__selectstart_event);
			}
		}
	}
});





Class.define("History",{ 
	// behaves not WithEvents, custom on, off and emit
	// that have an extra argument 'state' besides event and callback
	ctor : function() {
		this.ready = false;
		this.construct();
	}
	, proto : {
		construct : function() {
			var self = this;
			if ( this.ready ) { return; } // singleton
			this.ready = true;
			this.last_state = "";
			this.state = "";
			this.last_args = [];
			this.args = [];
			this.handlers = { 
				load : { generic: [], specific: {} },
				unload : { generic : [], specific : {} }
			};
			this.extractHash = function ( url ) { return url .replace(/^[^#]*#/, '') .replace(/^#+|#+$/, '') ; };
			this.getArgs = function() { return self.args; };
			this.getState =  function ( ) { return self.state; };
			this.setState = function ( state, args ) { 
				self.last_args = self.args;
				self.last_state = self.state;
				//state = self.extractHash(state);
				//console.log("STATE SWITCH?");
				//console.log("FROM:" +  self.state + ":" + JSON.stringify(self.args));
				//console.log("TO:" +  state + ":" + JSON.stringify(args));
				self.args = args;
				self.state = state; 
				return self.state; 
			};
			this.getHash = function ( ) { return self.extractHash(window.location.hash || location.hash); };
			this.setHash = function ( hash ) {
				//console.log();
				//console.log("SET HASH");
				//console.log();
				hash = self.extractHash(hash);
				if ( typeof window.location.hash !== 'undefined' ) {
					if ( window.location.hash !== hash ) { window.location.hash = hash; }
				} else if ( location.hash !== hash ) {
					location.hash = hash;
				}
				return hash;
			};
			this.parse_state = function(query) {
				var data = query.split(":");
				return data.shift();
			};
			this.parse_args = function(query) {
				var data = query.split(":");
				data.shift();
				//var p = Object.prototype.toString.apply(data.join(":"));
				
				var args = data.join(":");
				var qs = {};
				var parts = args.split("&");
				for(var x = 0; x < parts.length;x++) {
					if(parts[x].indexOf("=")!=-1) {
						var m = parts[x].split("=");
						var key = m.shift();
						var val = m.join("=");
						qs[key] = val;
					}
				}
				return qs;
			};
			this.go = function ( to, opt ) {
				//console.log("history",to,opt);
				if(opt==undefined || opt==null || Object.prototype.toString.apply(opt) != "[object Object]") opt = {};
				
				var to_base = self.parse_state( self.extractHash(to) );
				var to_args = self.parse_args( self.extractHash(to) );
				var hash_base = self.parse_state( self.getHash() );
				var force = false;
				
				if("force" in opt && opt.force === true) {
					force = true;
					console.log("force true");
				}
				console.log( "HISTORY 1:",self.extractHash(to),this.getHash(),to_base,hash_base);
				if( to_base !== hash_base ) {
					//console.log("HISTORY 2");
					//console.log("target hash:",self.extractHash(to)," current hash:",this.getHash());
					//console.log("history A",opt);	
					
					self.emit("unload",this.getHash(),self.getArgs());
					
					//console.log(to_base,to_args);
					
					//self.emit("load",to_base,to_args); 
					
					self.setHash(to);
					self.setState(to_base, to_args );
					//this.go(to,opt);
					
				} else if(self.extractHash(to)!=this.getHash()) {
					self.setHash(to);
					self.setState(to_base, to_args );
				} else if(true || force) {
					console.log("HISTORY 4");
					//console.log("history C",to_base,opt);	
					
					if(self.last_state != to_base || force) {
						//console.log("HISTORY 5");
						//console.log("history: unload ", self.last_state);
						self.emit("unload",self.last_state, self.last_args);
					} else if(self.parse_state( self.getHash() ) != to_base ) {
						//console.log("HISTORY 6");
						//console.log("history: unload ", self.getState());
						self.emit("unload",self.getState(),self.getArgs() );
					}
					//console.log("history C2",to_base);	
					
					self.setState(to_base, to_args );
					
					//console.log("HISTORY 7");
					self.emit("load",to_base,to_args); 
					//console.log("HISTORY 8");
					
					
					//console.log("HISTORY 9");
					self.last_state = to_base;
					self.last_args = to_args;
					
					("callback"  in opt)&&opt.callback();
					//console.log("HISTORY 10");
				}
				
				return true;
			};
			this.where = function() {
				return self.last_state;
			};
			this.hashchange = function ( e ) { 
				//console.log("HASH CHANGE");
				//console.log(e);
				// at some point someone call history.go()
				// it executes the first part that is to change hash 
				// hashes changes then hash change event is called
				// then execute the second part that is after hash changed, and the base is equal to 
				//console.log("HISTORY 3.5");
				self.go( self.getHash() ); 
				return false;
			};
			this.on = function ( event, state, handler ) {
				//console.log("installing",event,state);
				
				var target = null;
				if(event=="load") { target = this.handlers.load; } 
				else if(event=="unload") { target = this.handlers.unload; } 
				else { throw "window.History event '"+event+"' unknown."; }
				if ( 
					handler != undefined && handler != null &&
					Object.prototype.toString.apply(handler) == "[object Function]"
				) {
					if ( typeof target.specific[state] === 'undefined' ) { target.specific[state] = []; }
					target.specific[state].push(handler);
				} else if( Object.prototype.toString.apply(state) == "[object Function]" ) {
					target.generic.push(state);
				} else { throw "window.History on called with bad arguments." }
				return true;
			};
			this.off = function(event, state,callback) {
				var target = null;
				
				if(event=="load") { target = this.handlers.load; } 
				else if(event=="unload") { target = this.handlers.unload; } 
				else { throw "window.History event '"+event+"' unknown."; }
				if ( 
					callback != undefined && callback != null &&
					Object.prototype.toString.apply(callback) == "[object Function]"
				) {
					if(state in target.specific) {
						for(var x = target.specific[state].length-1; x >= 0;x--) {
							if(target.specific[state][x]==callback) {
								target.specific[state].splice(x,1);
								return true;
							}
						}
					}
				} else if( Object.prototype.toString.apply(state) == "[object Function]" ) {
					for(var x = 0; x < target.generic.length;x++) {
						if(target.generic[x] == callback) { 
							target.generic.splice(x,1); 
							return true; 
						}
					}
				} else { throw "window.History off called with bad arguments." }
				return false;
			};
			
			this.emit = function ( event, state, args ) {
				var i, n, handler, list;
				var target = null;
				
				if(state==undefined||state==null) {
					state = self.getState();
					//console.log("state:",state);
					args = self.getArgs();
				}
				
				if(event=="load") { 
					
				
					target = self.handlers.load; 
					
					list = target.generic;
					for ( i = 0, n = list.length; i < n; ++i ) { 
						
						list[i](state);
					}
					//console.log("history.emit A",target.specific,state);
					
					if ( state in target.specific ) {
						
						list = target.specific[state];
						for ( i = 0, n = list.length; i < n; ++i ) { 
							list[i](state,args); 
						}
					}
					//console.log("LOADED??");
					
				}
				else if(event=="unload") { 
					//console.log("emit unload ["+state+"]");
					target = self.handlers.unload; 
					
					if ( state in target.specific ) {
						//console.log("specific unload");
						list = target.specific[state];
						for ( i = 0, n = list.length; i < n; ++i ) { list[i](state,args); }
					}
					list = target.generic;
					
					for ( i = 0, n = list.length; i < n; ++i ) {
						//console.log("global unload");
						list[i](state); 
					}
				
				} 
				else { throw "window.History event '"+event+"' unknown."; }
				
				return true;
			};
		},
		init : function(startPage) {
			
			var hash = this.getHash();
			this.setState( this.parse_state( hash ), this.parse_args ( hash ) );
			var self = this;
			window.addEventListener("hashchange",function(e) {
				return self.hashchange(e);
			});
			
			
			var hash = History.getHash();
			var hash_arr = hash.split(":");
			if(hash_arr.length>0) {
				if(hash_arr[0]=="") hash_arr[0] = startPage;
				hash = hash_arr.join(":");
			} else {
				hash = startPage;
			}
			console.log("BOOT:#"+hash);
			History.go("#"+hash);
		}
	}
});

function RouterRoute(options) {
	if(!(this instanceof RouterRoute)) {
		var ret = Object.create(RouterRoute.prototype);
		return RouterRoute.apply(ret,arguments);
	}
	options = options || {};
	this.name = options.name;
	this.parent = options.parent;
	return this;
}

function Router(target) {
	if(!(this instanceof Router)) {
		var ret = Object.create(Router.prototype);
		return Router.apply(ret,arguments);
	}
	this.target = target;
	return this;
}
Router.prototype.page = function(name,load_callback,unload_callback) {
	var p = RouterRoute({
		name:name,
		parent:this.target
	});
	History.on("load",name,function(state,args){
		//alert("LOAD");
		console.log("loading "+name);
		console.log("state:",JSON.stringify(state));
		console.log("args:",JSON.stringify(args));
		load_callback && load_callback.apply(p,[args]);
	});
	History.on("unload",name,function(state,args){
		console.log("unloading "+name);
		console.log("state:",JSON.stringify(state));
		console.log("args:",JSON.stringify(args));
		unload_callback && unload_callback.apply(p,[args]);
	});
	return p;
}
/*
//sample
window.addEventListener("load",function(args) {
	var r = Router(document.body);
	r.page("teste",function(args) {
		console.log(args);
		if(!this.init) {
			this.init = this.init || true;
			this.controls = [];
			var div = document.createElement("div");
			div.innerHTML = "TESTE";
			this.parent.appendChild(div);
			this.controls.push(div);
			var link = document.createElement("div");
			link.innerHTML = "teste2";
			link.addEventListener("click",function() {
				History.go("#teste2:b=2");
			});
			this.parent.appendChild(link);
			this.controls.push(link);
			var link = document.createElement("div");
			link.innerHTML = "teste1";
			link.addEventListener("click",function() {
				History.go("#teste:a=2");
			});
			this.parent.appendChild(link);
			this.controls.push(link);
			
			var div = document.createElement("div");
			div.innerHTML = JSON.stringify(args);
			this.parent.appendChild(div);
			this.controls.push(div);
			this.argholder = div;
			
		} else { // component change
			this.argholder.innerHTML = JSON.stringify(args);
		}
	},function() {
		console.log("UNLOAD TESTE");
		for(var x = 0; x < this.controls.length;x++) {
			this.parent.removeChild(this.controls[x]);
		}
		while(this.controls.length>0) this.controls.pop();
		this.init = false;
	});
	r.page("teste2",function(args) {
		console.log(args);
		if(!this.init) {
			this.init = this.init || true;
			this.controls = [];
			var div = document.createElement("div");
			div.innerHTML = "TESTE2";
			this.parent.appendChild(div);
			this.controls.push(div);
			var link = document.createElement("div");
			link.innerHTML = "teste1";
			link.addEventListener("click",function() {
				History.go("#teste:a=1");
			});
			this.parent.appendChild(link);
			this.controls.push(link);
			var link = document.createElement("div");
			link.innerHTML = "teste2";
			link.addEventListener("click",function() {
				History.go("#teste2:b=1");
			});
			this.parent.appendChild(link);
			this.controls.push(link);
			
			
			var div = document.createElement("div");
			div.innerHTML = JSON.stringify(args);
			this.parent.appendChild(div);
			this.controls.push(div);
			this.argholder = div;
			
		} else { // component change
			this.argholder.innerHTML = JSON.stringify(args);
		}
	},function() {
		console.log("UNLOAD TESTE2");
		for(var x = 0; x < this.controls.length;x++) {
			this.parent.removeChild(this.controls[x]);
		}
		while(this.controls.length>0) this.controls.pop();
		this.init = false;
	});
	
	History.init("teste");
	
	
});
			
*/
History = Class.create("History");
(function(self){
	

})(window);




UI.init = function(callback) {
	
	var self = this;
	
	self.Body = null;
	
	this.Window = Class.create("UI.Window");
	this.Window.on("load",function() {

		var c = new Router(document.body);
		Object.defineProperty(UI.Window,"Router",{
			get : function() {
				return c;
			}
		});
		Object.preventExtensions(c);
		Object.seal(c);
		console.log("OK");

		self.Document = Class.create("UI.Document");
		//console.log("focus");
		window.focus();
		
		// clear all previous html components, that might be saved with save file.
		var body = document.getElementsByTagName("body")[0];
		body.visited = false;
		var stack = [body];
		// remove leafs before
		var k = 0;
		while(stack.length>0) {
			var item = stack.pop();
			var pushed = false;
			if( item.childNodes.length > 0 && item.visited == false) {
				item.visited = true;
				stack.push(item);
				for(var x = 0; x < item.childNodes.length;x++) {
					item.childNodes[x].visited = false;
					stack.push( item.childNodes[x] );
				}
				pushed = true;
			}
			var removed = false;
			if(!pushed && stack.length>0 && item!= body) { // leaf
				if(item.parentNode!=null) {
					item.parentNode.removeChild( item );
				}
				removed = true;
			}
			if(item.visited && !removed && stack.length>0 && item != body) { // maybe not leaf but already used
				console.log("rm",item);
				item.parentNode.removeChild( item );
				removed = true;
			}
		}
		console.log("[UI.boot]");

		self.Body = Class.create("UI.Body");
		
		self.Body.nodeBuild(document.body,null);
		
		self.Window.internal["UI.Window"].loaded = true;
		
		self.Body.RenderLoop();
		
		callback && callback();
		
		
	});
	
	
	
};
