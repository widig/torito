

var spec = function(x) { return x; }


function node() {
    return {
        //mock : [null,null],
        //to : [],
        value : 0,
        type : 0 // 0 logic, 1 external function (memory)
    }
}
function make_layers(spec) {
    var nodes_in = (spec.input.length + spec.input.length%2) / 2;
    var nodes_out = (spec.output.length + spec.output.length%2) / 2;
    console.log("nodes_in:",nodes_in,"nodes_out:",nodes_out);
    var layers = [];
    if(!("layers" in spec)) spec.layers = 2;
    for(var x = 0; x < spec.layers;x++) {
        var arr = [];
        for(var y = 0; y < nodes_out;y++) {
            arr.push(node());
        }
        layers.push(arr);
    }
    while( layers[0].length < nodes_in ) {
        layers[0].push( node() );
    }
    nodes_in = layers[0].length;
    var ramp = (nodes_out - nodes_in) / layers.length;
    for(var x = 1; x < layers.length;x++ ) {
        var amount = parseInt( Math.floor( nodes_in + x*ramp ) );
        if(layers[x].length < amount) {
            layers[x].push(node());
        }
    }
    // now we have enough nodes based on input output specs
    //console.log(JSON.stringify(layers));
    return layers;
}
function make_program(layers,spec) {
    var conn = [[]];
    var cc = 0;
    var used_inputs = [];

    for(var x = 0; x < spec.input;x++) {
        conn[0].push({
            type : 0,
            index : x,
            node : ( cc-(cc%2) )/2,
            time : 0,
            port : cc%2
        });
        used_inputs.push([0, (cc-(cc%2))/2, cc%2 ]);
        cc++;
    }
    // complete input with random source or gnd
    var left = layers[0].length*2 - spec.input.length;
    for(var x = 0; x < left;x++) {
        var i = Math.random() >= 0.5 ? 1 : 0;
        conn[0].push({
            type : 1,
            value : i,
            node : (cc -(cc%2))/2,
            time : 0,
            port : cc%2
        });
        used_inputs.push([0, (cc-(cc%2))/2, cc%2 ]);
        cc++;
    }
    // front input is connected.
    for(var x = 1; x < layers.length;x++) {
        cc = 0;
        conn.push([]);
        var layer = layers[x-1]; // input nodes
        for(var y = 0; y < layer.length;y++) {

            

            conn[ conn.length-1 ].push({
                    type : 2,
                    from : {
                        node : (cc-(cc%2))/2,
                        port : cc%2
                    },
                    to : {

                    }
            });
            cc++;
        }
    }
    return conn;
}
function eval_program(layers,conn,spec) {
    var ret = [];

    return ret;
}
function assert_program(result,expected) {
    var count = 0;
    for(var x = 0; x < result.length;x++) {
        if( result[x] == expected[x] ) {
            count += 1;
        }
    }
    return count/result.length;
}
var data = spec({
    input : [1,1],
    output : [1],
    layers : 2
});

var layers = make_layers(data);
var found = [];
while(true) {
    var conn = make_program(layers,data);
    var ret = eval_program(layers,conn,data);
    var res = assert_program(ret,data.output);
    // store instance layers, conn
    res = 1;
    if( res < 1 ) {
        continue;
    } else {
        found.push({
            layers : layers,
            connections : conn,
            spec : data
        });
        break;
    }
}
console.log(JSON.stringify(found));
