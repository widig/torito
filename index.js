

mod = {};
// load paths
mod.torito = {
	paths : require("./paths.js")
};

var toInclude = JSON.parse( require("fs").readFileSync(mod.torito.paths.server.includes + "/index.json","utf8") );
for(i in toInclude) {
	console.log("[["+i+"]]");
	mod[i] = require(toInclude[i]);
}

if("services" in mod) { // DANGER DANGER DANGER
	console.log("----------------------------------------------------------------------------------------------------")
	console.log("SERVICES STARTED");
	console.log("----------------------------------------------------------------------------------------------------")
	mod.services.start();
	
}

var routesDirectory = { get : mod.torito.paths.server.routes.get, post : mod.torito.paths.server.routes.post, static : mod.torito.paths.server.routes.static };


app = mod.express();
mod.app = app;
app.set("port",process.env.PORT || 3002);



function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000) .toString(16) .substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +  s4() + '-' + s4() + s4() + s4();
}

app.use(function(req,res,next){
	console.log("------------------------------------------------------------------------------------------------");
	console.log('Request URL:', req.originalUrl,'Request Type:', req.method,'Request Params:', req.params,'Request Query:', req.query);
	console.log("------------------------------------------------------------------------------------------------");
	next();
})

if("session" in mod) {
	mod.session.reset();
	app.use(function (req, res, next) {
		//mod.session.print();
		var found = false;
		//console.log(req.headers);
		if("cookie" in req.headers) {
			console.log("req.headers.cookie:",req.headers.cookie);
			req.cookies = mod.cookie.parse(req.headers.cookie);
			console.log("req.cookies:",req.cookies);
			if("session" in req.cookies) {
				var data = mod.session.get( req.cookies.session );
				if(data != null) {

					var ip;
					if (req.headers['x-forwarded-for']) {
						ip = req.headers['x-forwarded-for'].split(",")[0];
					} else if (req.connection && req.connection.remoteAddress) {
						ip = req.connection.remoteAddress;
					} else {
						ip = req.ip;
					}
					req.session = data;
					if( req.session.ip == ip ) {
						// not found
						
						req.session.id = req.cookies.session;
						console.log("SESSION:",req.session.id);
						//data.date = new Date();
						found = true;
						
					}

				}
			}
		}
		if(!found) {
			// find a available id
			var id = guid();
			while(true) {
				var data = mod.session.get( id );
				if(data != null) {
					id = guid();
				} else {
					break;
				}
			}
			// create a new session

			var ip;
			if (req.headers['x-forwarded-for']) {
				ip = req.headers['x-forwarded-for'].split(",")[0];
			} else if (req.connection && req.connection.remoteAddress) {
				ip = req.connection.remoteAddress;
			} else {
				ip = req.ip;
			}

			var session = {
				id : id,
				ip : ip,
				logged : false,
				date : new Date()
			};
			console.log("NEW SESSION:",id);
			var d1 = new Date (),
			d2 = new Date ( d1 );
			d2.setMinutes ( d1.getMinutes() + 60*24*365 );
			var d0 = new Date(0);
			mod.session.set(id,session);
			var cookie_str = mod.cookie.serialize("session",id,{
				httpOnly : true,
				path : "/",
				expires : d2,
				sameSite : true,
				SameSite : "strict"
			});
			console.log("cookie:",cookie_str);
			res.setHeader('Set-Cookie', cookie_str);
			req.session = session;
		}
		next();
	});

}


var builtin = {
	get : {},
	post : {},
	static : {}
};

function readdirrecSync(dir,top) {
	
	top = top || "";
	var files = mod.fs.readdirSync(dir);
	var ret = [];
	for(var x in files) {
		if( mod.fs.lstatSync(dir + "/" + files[x]).isDirectory() ) {
			var r = readdirrecSync(dir + "/" + files[x], top  + files[x] + "/");
			ret = ret.concat(r);
			console.log("DIR:"+dir+" TOP:" + top, JSON.stringify(ret));
		} else {
			ret.push(top + files[x]);
			console.log("DIR:"+dir+" TOP:" + top, JSON.stringify(ret));
		}
	}
	return ret;
}
for(var dir in routesDirectory) {
	console.log("DIR:",routesDirectory[dir]);
	arrv = readdirrecSync(routesDirectory[dir]);
	for(var file in arrv) {
		if(dir == "get" || dir == "post") {
			console.log("@:",arrv[file]);
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
					eval("builtin."+dir+"[ \"/\" + name ] = " + mod.fs.readFileSync(routesDirectory[dir] + "/"+arrv[file],"utf8"));
				} catch(e) {
					console.log( mod.fs.readFileSync(routesDirectory[dir] + "/"+arrv[file],"utf8") );
					console.log("[["+e+"]]");
				}
			}
		} else if(dir == "static") {
			if( arrv[file].lastIndexOf(".json") == arrv[file].length-5 ) {
				console.log(arrv[file]);
				var name = arrv[file].substring(0,arrv[file].length-5);
				var data = mod.fs.readFileSync(routesDirectory[dir] + "/"+arrv[file],"utf8");
				var json = JSON.parse(data);
				builtin.static[json.path] = json;
				//json.path,json.target
			}
		}
	}
	if(dir == "get" || dir == "post") {
		for(var r in builtin[dir]) {
			console.log(dir + ":" + r);
			app[dir](r,builtin[dir][r]);
		}
	} else if(dir == "static") {
		for(var r in builtin[dir]) {
			var i = builtin[dir][r];
			console.log(dir + ":" + i.path);
			app.use(i.path,mod.express.static(i.target));
		}
	}
}

app.listen(app.set("port"), function() {
	console.log("server at "+app.set("port")+"!");
});