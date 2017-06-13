

var name = "torito";

module.exports = {
    "server" : {
        "acl" : "./private/"+name+"/acl",
        "includes" : "./private/"+name+"/includes",
        "notes" : "./private/"+name + "/notes",
        "routes" : {
		    "_" : "./private/"+name+"/routes",
		    "get" : "./private/"+name+"/routes/get",
		    "post" : "./private/"+name+"/routes/post",
		    "static" : "./private/"+name+"/routes/static"
        },
	"meta" : {
		"_" : "./private/"+name+"/meta",
		"file" : "./private/"+name+"/meta/file"
	}
    },
    "clientPrivate" : "./private/"+name+"/client",
    "clientPublic" : "./public/page/" + name
}