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
app.use(function (req, res, next) {
	console.log("------------------------------------------------------------------------------------------------");
	console.log('Request URL:', req.originalUrl);
	console.log('Request Type:', req.method);
	console.log('Request Params:', req.params);
	console.log('Request Query:', req.query);
	console.log("------------------------------------------------------------------------------------------------");
	next();
});

var builtin = {
	get : {},
	post : {},
	static : {}
};

for(var dir in routesDirectory) {
	arrv = global.fs.readdirSync(escape(routesDirectory[dir]));
	for(var file in arrv) {
		if(dir == "get" || dir == "post") {
			if( arrv[file].lastIndexOf(".jsf") == arrv[file].length-4 ) {
				var name = arrv[file].substring(0,arrv[file].length-4);
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