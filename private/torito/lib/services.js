
var app = {
    first : true,
    run : false,
    services : []
};

function _install(name,interval,enabled,callback) {
    console.log("install ",name,interval);
    var sel = -1;
    for(var x = 0; x < app.services.length;x++) {
        if(app.services[x].name == name) {
            sel = x;
            break;
        }
    }
    if(sel != -1) {

        var s = app.services[sel];
        s.date = new Date();
        s.interval = interval;
        s.code = callback;
        s.callback = box(callback);

    } else {
        app.services.push({
            name : name,
            enabled : enabled,
            date : new Date(),
            interval : interval,
            code : callback,
            callback : box(callback)
        });
    }
    return true;
}

function _uninstall(name) {
    app.block = true;
    for(var x = 0; x < app.services.length;x++) {
        if(app.services[x].name == name) {
            app.services.splice(x,1);
            break;
        }
    }
    app.block = false;
}

function box(code) {
    var _f = function(){};
    var vm = require("vm");
    var print = function() {
        console.log("print!");
        var args = [];
        for(var x = 0; x < arguments.length;x++) args.push(arguments[x]);
        console.log.apply(console,args);
    }
    var sandbox = { 
        $ : function(f) {
            if(Object.prototype.toString.apply(f) == "[object Function]") {
                _f = f;
            }
        },
        console : {
            log : print
        }
    };
    var script = new vm.Script("var f = "+code+"; $(f);");
    var context = new vm.createContext(sandbox);
    try {
        script.runInContext(context);
    } catch(e) {
        throw e;
    }
    return _f;
}
function boot() {
    console.log("boot");
    // read all files on private/torito/services and load it.
    var fs = require("fs");
	if(!fs.existsSync("./private/torito/services")) {
		fs.mkdirSync("./private/torito/services");
	}
    var files = fs.readdirSync("./private/torito/services");

    for(var i in files) {
        var file = files[i];
        console.log("loading ",file);
        var str = fs.readFileSync("./private/torito/services/" + file,"utf8");
        var json = JSON.parse(str);
		console.log(json.code);
        _install( json.name, json.interval, json.enabled, json.code );
    }
}
function main() {
    if(!app.run) return;
    console.log("loop main");
    // do stuff
    if(!app.block) {
        for(var x = 0; x < app.services.length;x++) {
            if(app.block) break;
            if(app.services[x].enabled) {
                var s = app.services[x];
                var d = new Date(s.date);
                console.log("-----------------------");
                console.log(s.date.getMinutes());
                d.setSeconds( s.date.getSeconds() + s.interval );
                console.log(s.name,s.interval);
                var nd = new Date();
                console.log(s.date,d,nd);
                if( nd > d) {
                    console.log("--------------------------------------------------------------------------------");
                    console.log("running " + s.name);
                    console.log("--------------------------------------------------------------------------------");
                    s.callback();
                    s.date = nd;
                }
            }
        }
    }
    setTimeout(function() {
        main();
    },5000);
}

function _startService(name) {
    for(var x = 0; x < app.services.length;x++) {
        if(app.services[x].name == name) {
            app.services[x].enabled = true;
            break;
        }
    }
}

function _stopService(name) {
    for(var x = 0; x < app.services.length;x++) {
        if(app.services[x].name == name) {
            app.services[x].enabled = false;
            break;
        }
    }
}

function _start() {
    if(!app.run) {
        if(app.first) boot();
	    app.first = false;
        app.run = true;
        main();
    }
}

function _stop() {
    app.run = false;
}

function _register(args) {
    var file = "./private/torito/services/" + args.name + ".json";
    mod.fs.writeFileSync(file,JSON.stringify({
        name : args.name,
        interval : args.interval,
        enabled : true,
        last : new Date(0),
        code : args.code,
        enabled : true,
        file : file
    }),"utf8");
}
function _unregister(name) {
    // delete file
    mod.fs.unlinkSync("./private/torito/services/" + args.name + ".json");
}

function _list() {
    var ret = {};
    for(var x = 0; x < app.services.length;x++) {
        ret[
            app.services[x].name
        ] = {
            enabled : app.services[x].enabled
        }
    }
    return ret;
}
function _get(name) {
    for(var x = 0; x < app.services.length;x++) {
        if(app.services[x].name == name) {
            return app.services[x];
        }
    }
    return null;
}
function _set(name,args) {
    for(var x = 0; x < app.services.length;x++) {
        if(app.services[x].name == name) {
            var file = "./private/torito/services/" + name + ".json";
            var s = {
                name : name,
                file : file
            };
            if("interval"  in args) {
                s.interval = args.interval;
                app.services[x].interval = args.interval;
            } else {
                s.interval = app.services[x].interval;
            }

            if("enabled" in args) {
                s.enabled = args.enabled;
                app.services[x].enabled = args.enabled;
            } else {
                s.enabled = app.services[x].enabled;
            }

            if("last" in args) {
                s.last = args.last;
                app.services[x].last = args.last;
            } else {
                s.last = app.services[x].last;
            }

            if("code" in args) {
                s.code = args.code;
                app.services[x].code = args.code;
            } else {
                var str = mod.fs.readFileSync(file,"utf8");
                var json = JSON.parse(str);
                s.code = json.code;
            }
            // write to file
            mod.fs.writeFileSync(file,JSON.stringify(s),"utf8");
            return;
        }
    }
}

module.exports = {
    start : _start,
    stop : _stop,
    startService : _startService,
    stopService : _stopService,
    install : _install,
    uninstall : _uninstall,
    register : _register,
    unregister : _unregister,
    list : _list,
    get : _get,
    set : _set
};
