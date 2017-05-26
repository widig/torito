var global = {};

var toInclude = JSON.parse( require("fs").readFileSync("./meta/javascript/server/includes/index.json","utf8") );
for(i in toInclude) {
	console.log("[["+i+"]]");
	global[i] = require(toInclude[i]);
}

var routesDirectory = { get : "./meta/javascript/server/routes/get", post : "./meta/javascript/server/routes/post", static : "./meta/javascript/server/routes/static" };

var serverPort = 3001;
app = global.express();
global.app = app;
global.session.reset();

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000) .toString(16) .substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +  s4() + '-' + s4() + s4() + s4();
}

app.use(function (req, res, next) {
	console.log("------------------------------------------------------------------------------------------------");
	console.log('Request URL:', req.originalUrl);
	console.log('Request Type:', req.method);
	console.log('Request Params:', req.params);
	console.log('Request Query:', req.query);
	console.log("------------------------------------------------------------------------------------------------");
	
	var found = false;
	if("cookie" in req.headers) {
		req.cookies = global.cookie.parse(req.headers.cookie);
		if("session" in req.cookies) {
			var data = global.session.get( req.cookies.session );
			if(data != null) {
				req.session = data;
				data.date = new Date();
				found = true;
			}
		}
	}
	if(!found) {
		// find a available id
		var id = guid();
		while(true) {
			var data = global.session.get( id );
			if(data != null) {
				id = guid();
			} else {
				break;
			}
		}
		// create a new session
		var session = {
			logged : false,
			date : new Date()
		};
		global.session.set(id,session);
		res.setHeader('Set-Cookie', global.cookie.serialize("session",id));
		req.session = session;
	}
	next();
});




var builtin = {
	get : {},
	post : {},
	static : {}
};

function readdirrecSync(dir,top) {
	top = top || "";
	var files = global.fs.readdirSync(dir);
	var ret = [];
	for(var x in files) {
		if( global.fs.lstatSync(dir + "/" + files[x]).isDirectory() ) {
			var r = readdirrecSync(dir + "/" + files[x],files[x] + "/");
			ret = ret.concat(r);
		} else {
			ret.push(top + files[x]);
		}
	}
	return ret;
}
for(var dir in routesDirectory) {
	arrv = readdirrecSync(routesDirectory[dir]);
	for(var file in arrv) {
		if(dir == "get" || dir == "post") {
			if( arrv[file].lastIndexOf(".jsf") == arrv[file].length-4 ) {
				var name = arrv[file].substring(0,arrv[file].length-4);
				var names = name.split("/");
				for(var x = 0; x < names.length;x++) {
					if(names[x].indexOf("__param__")==0) {
						names[x] = unescape( names[x].substring("__param__".length) );
					}
				}
				name = names.join("/");
				try {
					eval("builtin."+dir+"[ \"/\" + name ] = " + global.fs.readFileSync(routesDirectory[dir] + "/"+arrv[file],"utf8"));
				} catch(e) {
					console.log( global.fs.readFileSync(routesDirectory[dir] + "/"+arrv[file],"utf8") );
					console.log("[["+e+"]]");
				}
			}
		} else if(dir == "static") {
			if( arrv[file].lastIndexOf(".json") == arrv[file].length-5 ) {
				var name = arrv[file].substring(0,arrv[file].length-5);
				var data = global.fs.readFileSync(routesDirectory[dir] + "/"+arrv[file],"utf8");
				var json = JSON.parse(data);
				builtin.static[json.path] = json;
				//json.path,json.target
			}
		}
	}
	if(dir == "get" || dir == "post") {
		for(var r in builtin[dir]) {
			app[dir](r,builtin[dir][r]);
		}
	} else if(dir == "static") {
		for(var r in builtin[dir]) {
			var i = builtin[dir][r];
			app.use(i.path,global.express.static(i.target));
		}
	}
}

app.listen(serverPort,function() {
	console.log("server at "+serverPort+"!");
});