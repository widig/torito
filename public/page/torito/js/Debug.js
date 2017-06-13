
var debug = {};
debug.keys = function(obj) {
    var r = [];
    for(var k in obj) {
        r.push(k);
    }
    console.log(JSON.stringify(r));
}
