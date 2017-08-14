/*
    specification:
        record every n seconds
        send record to a analyser
*/
//var size = [window.innerWidth,window.innerHeight];
var size = [640,480];
var p = UI.Body.elementSetPacket(
    "<div id='editor'></div>"+
    "<div id='message'></div>"+
    "<WithDOMElements2 id='audio'></WithDOMElements2>"+
    "<div id='display' style='display:block;position:relative;width:"+size[0]+"px;height:"+size[1]+"px;'>"+
        "<div id='panelCamera' style='position:absolute;left:0px;top:0px;'>"+
            "<video id='video' width='"+size[0]+"' height='"+size[1]+"' autoplay></video>"+
        "</div>"+
        "<div id='panelEdition' style='position:absolute;left:0px;top:0px;'>"+
            "<canvas id='canvas' width='"+size[0]+"' height='"+size[1]+"'></canvas>"+
        "</div>"+
    "</div>"
    
);
var app = {
    video : {
        config : { video : true },
        video : null,
        canvas : null,
        context : null,
        errorHandler : null,
        buffer : [],
        frame : 0
    },
    audio : {
        config : { audio : true },
        state : 0,
        loaded : false,
        blob : null,
        audio : null,
        context : null,
        input : null,
        inputGain : null,
        processor : null,
        outputGain : null,
        errorHandler : null,
        worker2 : null        
    },
    editor : {
        main : null
    }
}
p.el.display.style.border = "solid 1px #000";

function startAudioConnection() {
    console.log("AUDIO");
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    app.audio.audio = p.$.audio;
    console.log("audio audio defined.");
    app.audio.context = new AudioContext();
    function gotStream(stream) {
        console.log("AUDIO GOT STREAM",stream);
        
        app.audio.input = app.audio.context.createMediaStreamSource(stream);
        app.audio.inputGain = app.audio.context.createGain();
        app.audio.input.connect(app.audio.inputGain);
        app.audio.outputGain = app.audio.context.createGain();
        app.audio.outputGain.gain.value = 0.0;

        var processorNode = null;
        var bufferLen = 4096;

        if(!app.audio.inputGain.context.createScriptProcessor){
            processorNode = app.audio.inputGain.context.createJavaScriptNode(bufferLen, 2, 2);
        } else {
            processorNode = app.audio.inputGain.context.createScriptProcessor(bufferLen, 2, 2);
        }
        console.log("AUDIO PROCESSOR");
        var __workerInstance_id = 0;
        function WorkerInstance(url) {
            var t = this;
            this.id = __workerInstance_id++;
            this.instance = new Worker(url);
            this.data = {};
            var __request_id = 0;
            this.instance.onmessage = function(e) {
                t.data[ e.data.path + ":" + e.data.id ].callback.apply(null,[e.data.value]);
                delete t.data[ e.data.path + ":" + e.data.id ];
            }
            this.request = function(path,args,callback) {
                var id = __request_id++;
                t.data[path + ":" + id] = { callback : callback }
                t.instance.postMessage.apply(t.instance,[{id:id, path:path,args:args}]);
            }
        }
        var blob = new Blob(["(" + 
            function(self) {
                //self.importScripts("/public/control/lamejs/lame.all.js");
                // [modified from] https://webaudiodemos.appspot.com/AudioRecorder/index.html 
                var sampleRate = 0;
                var recLength = 0;
                var recBuffersL = [];
                var recBuffersR = [];
                var storage = {
                    "init" : function(opt) {
                        console.log("WORKER SAMPLE RATE:",opt.sampleRate);
                        sampleRate = opt.sampleRate;
                        
                        return "buffer init";
                    },
                    "clear" : function() {
                        recLength = 0;
                        recBuffersL = [];
                        recBuffersR = [];
                        return "buffer cleared.";
                    },
                    "record" : function(data) {
                        recBuffersL.push(data.left);
                        recBuffersR.push(data.right);
                        recLength += data.left.length;
                        return "recorded.";
                    },
                    "save" : function() {
                        console.log("size of save:",recLength);
                        var type = "audio/wav";
                        if(0) { // stereo
                            var bufferL = mergeBuffers(recBuffersL, recLength);
                            var bufferR = mergeBuffers(recBuffersR, recLength);
                            var interleaved = interleave(bufferL, bufferR);
                            var buffer = encodeWAV(interleaved);
                            var audioBlob = new Blob([buffer], { type: type });
                            return [audioBlob,buffer];
                        } else { // mono ?
                            var bufferL = mergeBuffers(recBuffersL, recLength);
                            var bufferR = mergeBuffers(recBuffersL, recLength);
                            var interleaved = interleave(bufferL, bufferR);
                            var buffer = encodeWAV(interleaved);
                            var audioBlob = new Blob([buffer], { type: type });
                            return [audioBlob,buffer];
                        }
                        //return [audioBlob,dataview];
                    },
                    "echo" : function(msg) {
                        return msg;
                    },
                    "close" : function() {
                        self.close();
                    }
                }
                function resolve(path) {
                    path = path.split("/");
                    if(!(path[0] in storage)) { return function() { return 0; } }
                    var p = storage[path[0]];
                    for(var x = 1; x < path.length;x++) { if(!(path[x] in p)) { return function() { return 0; } } else { p = p[ path[x] ]; } }
                    return p;
                }
                self.addEventListener('message', function(e) {
                    var id = e.data.id, path = e.data.path, args = e.data.args;
                    var result = resolve(path).apply(null,args);
                    self.postMessage({ id : id, path : path, value : result });
                }, false);
                function exportMonoWAV(type){
                    var bufferL = mergeBuffers(recBuffersL, recLength);
                    var dataview = encodeWAV(bufferL, true);
                    var audioBlob = new Blob([dataview], { type: type });
                    this.postMessage(audioBlob);
                }
                function getBuffers() {
                    var buffers = [];
                    buffers.push( mergeBuffers(recBuffersL, recLength) );
                    buffers.push( mergeBuffers(recBuffersR, recLength) );
                    this.postMessage(buffers);
                }
                function clear(){
                    recLength = 0;
                    recBuffersL = [];
                    recBuffersR = [];
                }
                function mergeBuffers(recBuffers, recLength){
                    var result = new Float32Array(recLength);
                    var offset = 0;
                    for (var i = 0; i < recBuffers.length; i++){
                        result.set(recBuffers[i], offset);
                        offset += recBuffers[i].length;
                    }
                    return result;
                }

                function interleave(inputL, inputR){
                    var length = inputL.length + inputR.length;
                    var result = new Float32Array(length);

                    var index = 0,
                        inputIndex = 0;

                    while (index < length){
                        result[index++] = inputL[inputIndex];
                        result[index++] = inputR[inputIndex];
                        inputIndex++;
                    }
                    return result;
                }

                function floatTo16BitPCM(output, offset, input){
                    for (var i = 0; i < input.length; i++, offset+=2){
                        var s1 = Math.max(-1, Math.min(1, input[i]));
                        var s2 = Math.max(-1, Math.min(1, input[i+1]));
                        output.setInt16(offset, s1 < 0 ? s1 * 0x8000 : s1 * 0x7FFF, true);
                        output.setInt16(offset, s2 < 0 ? s2 * 0x8000 : s2 * 0x7FFF, true);
                    }
                }

                function writeString(view, offset, string){
                    for (var i = 0; i < string.length; i++){
                        view.setUint8(offset + i, string.charCodeAt(i));
                    }
                }

                function encodeWAV(samples, mono){
                    var sl = samples.length;
                    var buffer = new ArrayBuffer(44 + ( sl* 2 ) );
                    var view = new DataView(buffer);

                    /* RIFF identifier */
                    writeString(view, 0, 'RIFF');
                    /* file length */
                    view.setUint32(4, 32 + sl * 4, true); // *2 cause its 16bit sample
                    /* RIFF type */
                    writeString(view, 8, 'WAVE');
                    /* format chunk identifier */
                    writeString(view, 12, 'fmt ');
                    /* format chunk length */
                    view.setUint32(16, 16, true);
                    /* sample format (raw) */
                    view.setUint16(20, 1, true);
                    /* channel count */
                    view.setUint16(22, mono?1:2, true);
                    /* sample rate */
                    view.setUint32(24, sampleRate, true);
                    /* byte rate (sample rate * block align) */
                    view.setUint32(28, sampleRate * 4, true);
                    /* block align (channel count * bytes per sample) */
                    view.setUint16(32, 4, true);
                    /* bits per sample */
                    view.setUint16(34, 16, true);
                    /* data chunk identifier */
                    writeString(view, 36, 'data');
                    /* data chunk length */
                    view.setUint32(40, sl, true);
                    floatTo16BitPCM(view, 44, samples);

                    return buffer;
                }


            }.toString()
        + ")(self);"], {type: "text/javascript"});
        var blobURL = URL.createObjectURL(blob);
        app.audio.worker2 = new WorkerInstance(blobURL);
        URL.revokeObjectURL(blobURL);
        console.log("AUDIO WORKER");
        function init(callback) {
            alert( app.audio.inputGain.context.sampleRate );
            app.audio.worker2.request("init",[{sampleRate:app.audio.inputGain.context.sampleRate}],function(file){
                console.log("r->init:",file);    
                callback&&callback();
            });
        }
        function clear(callback) {
            app.audio.worker2.request("clear",[],function(res) {
                console.log("r->clear:",res);
                app.audio.state = 1; // ready
                callback&&callback();
            });
        }
        function record(data,callback) {
            app.audio.worker2.request("record",[data],function(res) {
                console.log("r->record:",res);
                callback&&callback();
            });
        }

        function encodeMono(channels, sampleRate, samples) {
            var buffer = [];
            var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
            var remaining = samples.length;
            console.log("remaining",remaining);
            var maxSamples = 1152;
            console.log("max samples",maxSamples);
            console.log("encoding");

            for (var i = 0; remaining >= maxSamples; i += maxSamples) {

                var audio = samples.subarray(i, i + maxSamples);
                var left = new Int16Array(audio.length/2);
                var right = new Int16Array(audio.length/2);
                for(var j = 0; j < audio.length/2;j++) {
                    left[j] = audio[j*2];
                    right[j] = audio[j*2];
                }
                //left = audio;
                //right = audio;
                // create an array with even of left
                var mp3buf = mp3enc.encodeBuffer(left,right);
                if (mp3buf.length > 0) buffer.push(new Int8Array(mp3buf));
                remaining -= maxSamples;
            }
            var d = mp3enc.flush();
            if(d.length > 0){ buffer.push(new Int8Array(d)); }
            console.log('done encoding, size=', buffer.length);
            var blob = new Blob(buffer, {type: 'audio/mp3'});
            //var bUrl = window.URL.createObjectURL(blob);
            //console.log('MP3 Blob created, URL:', bUrl);
            
            /*
            window.myAudioPlayer = document.createElement('audio');
            window.myAudioPlayer.src = bUrl;
            window.myAudioPlayer.setAttribute('controls', '');
            window.myAudioPlayer.play();
            */
            return [blob,new Int8Array( buffer )];

        }

        function save() {
            // convert to WAVE
            // may use blob to <audio>
            
            console.log("SAVING?");
            // setup download just to test that we have something
            app.audio.worker2.request("save",[],function(res) {
                // res is file to blob download
                console.log(res[0]);
                Download.go(res[0],"test.wav");
                console.log(res[1]);
                console.log("got blob",res);
                var wav = lamejs.WavHeader.readHeader(new DataView(res[1]));
                console.log('wav:', wav);
                console.log("data offset",wav.dataOffset);
                console.log("wav.dataLen",wav.dataLen);
                var samples = new Int16Array(res[1], wav.dataOffset, wav.dataLen);
                console.log("samples",samples);
                console.log(wav.channels,wav.sampleRate);
                var res2 = encodeMono(wav.channels, wav.sampleRate, samples);
                console.log(res2[0]);
                //Download.go(res2[0],"test2.mp3");

                console.log("set app.audio.blob");
                app.audio.blob = res2[0];//res[0];
                clear(function() {
                    console.log("ready.");
                    //app.audio.loaded = false;
                });

                /*
                var wav = lamejs.WavHeader.readHeader(res[1]);
                console.log(">LAME:",wav);
                var samples = new Int16Array(res[1], wav.dataOffset, wav.dataLen / 2);
                var buffer = encodeMono(wav.channels, wav.sampleRate, samples);
                

                //Download.go(res,"test.wav");
                var blob = new Blob(buffer, {type: 'audio/mp3'});
                Download.go(blob,"test.mp3");

                


                
                // don't download save
                // now we have to sync Play(from,to) with audio start of playing
                // before we are starting recording by Audio()

                

                */
            });
        }
        app.audio.save = save;
        init(function() {
            clear(function() {
                // start
                processorNode.onaudioprocess = function(e){
                    if( app.audio.loaded ) {
                        console.log(e.inputBuffer.getChannelData(0));
                        record({
                            left:e.inputBuffer.getChannelData(0),
                            right:e.inputBuffer.getChannelData(1)
                        },function() {
                            console.log("SLICE CONSOLIDATION");
                        });
                    }
                }
                app.audio.inputGain.connect(processorNode);
                processorNode.connect(app.audio.inputGain.context.destination);
                app.audio.inputGain.connect( app.audio.outputGain );
                //app.audio.loaded = true;
                app.audio.outputGain.connect( app.audio.context.destination );
                // load finished
                // onload =
            });
        });

    }
    app.audio.errorHandler = function(e) {
        alert('Error getting audio');
        alert(e.message);
    }
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("AUDIO REQUEST 1");
        navigator.mediaDevices.getUserMedia(app.audio.config).then(gotStream).catch(app.audio.errorHandler);
    } else if (navigator.getUserMedia) {
        console.log("AUDIO REQUEST 2");
        navigator.getUserMedia(app.audio.config, gotStream, app.audio.errorHandler);
    } else if(navigator.webkitGetUserMedia) {
        console.log("AUDIO REQUEST 3");
        navigator.webkitGetUserMedia(app.audio.config, gotStream, app.audio.errorHandler);
    } else if(navigator.mozGetUserMedia) {
        console.log("AUDIO REQUEST 4");
        navigator.mozGetUserMedia(app.audio.config, gotStream, app.audio.errorHandler);
    } else {
        alert("what else to start microphone?");
    }
}


function startVideoConnection() {
    app.video.canvas = p.el.canvas;
    app.video.canvas.style.width = size[0] + "px";
    app.video.canvas.style.height = size[1] + "px";
    app.video.context = app.video.canvas.getContext('2d');
    app.video.video = p.el.video;
    app.video.errorHandler = function(e) {
        console.log('An error has occurred!', e)
    };

    // Put video listeners into place
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        //alert("ok1");
        navigator.mediaDevices.getUserMedia(app.video.config).then(function(stream) {
            app.video.video.src = window.URL.createObjectURL(stream); 
            app.video.video.onloadedmetadata = function(e) { app.video.video.play(); };
            copyVideoPictureToBuffer();
        })
        .catch(app.video.errorHandler);
    }
    else if(navigator.getUserMedia) { // Standard
        //alert("ok2");
        navigator.getUserMedia(app.video.config, function(stream) {
            app.video.video.src = stream, app.video.video.play();
            copyVideoPictureToBuffer();
        }, app.video.errorHandler);
    } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
        //alert("ok3");
        navigator.webkitGetUserMedia(app.video.config, function(stream){
            app.video.video.src = window.webkitURL.createObjectURL(stream), app.video.video.play();
            copyVideoPictureToBuffer();
        }, app.video.errorHandler);
    } else if(navigator.mozGetUserMedia) { // Mozilla-prefixed
        //alert("ok4");
        navigator.mozGetUserMedia(app.video.config, function(stream){
            app.video.video.src = window.URL.createObjectURL(stream), app.video.video.play();
            copyVideoPictureToBuffer();
        }, app.video.errorHandler);
    } else {
        alert("what else to start camera?");
    }
}


function copy(source,destiny) {
    if(source.length == destiny.length) {
        for(var x = 0; x < source.length;x+=4) {
            destiny[x] = source[x];
            destiny[x+1] = source[x+1];
            destiny[x+2] = source[x+2];
            destiny[x+3] = source[x+3];
        }
    }
}
function copyVideoPictureToBuffer() {
    app.video.context.drawImage(app.video.video, 0, 0, size[0], size[1]);
    var current = app.video.context.getImageData(0,0,size[0],size[1]);
    var imgData = app.video.context.createImageData(size[0],size[1]);
    copy(current.data,imgData.data);
    app.video.buffer.push({ 
        frame : app.video.frame++, 
        ImageData : imgData
    });
    app.video.frame = app.video.buffer.length;
}
function RecordVideoLoop(n,timeframe,callback) {
    timeframe = timeframe || 0;
    console.log("frame length:",timeframe,"ms");
    console.log("recording ",n);
    setTimeout(function() {
        copyVideoPictureToBuffer()
        if(timeframe * n < 50) {
            app.audio.loaded = false;
        }
        if(n > 0) {
            RecordVideoLoop(n-1,timeframe,callback);
        } else {
            
            app.audio.save&&app.audio.save();
            callback && callback();
        }
    },timeframe);
}

function ResetVideoBuffer() {
    app.video.buffer.splice(0,app.video.buffer.length);
}

function Record(n,timeframe,callback) {
    ResetVideoBuffer();
    RecordVideoLoop(n,timeframe,callback);
    app.audio.loaded = true;
}

function Camera() {
    p.el.panelCamera.style.display = "";
    p.el.panelEdition.style.display = "none";
}
function Edition() {
    p.el.panelCamera.style.display = "none";
    p.el.panelEdition.style.display = "";
}
function GotoFrame(n) {
    console.log("frame:",n% app.video.buffer.length);
    var current = app.video.context.getImageData(0,0,size[0],size[1]);
    copy(app.video.buffer[n%app.video.buffer.length].ImageData.data,current.data)
    app.video.context.putImageData(current,0,0);
}
function PlayLoop(from,to,pitch,callback) {
    
    pitch = pitch || 0;
    if(from < to) {
        setTimeout(function() {
            GotoFrame(from);
            console.log(".");
            PlayLoop(from+1,to,pitch,callback);
        },pitch)
    } else {
        callback && callback();
    }
}
function Play(from,to,pitch,callback) {
    AudioPlay();
    PlayLoop(from,to,pitch,callback);
}

function UploadAs(name) {

    // upload and treat images and treat audio process to create a single file after ffmpeg
    // stream
    var args = {};
    var image_type = "image/jpeg";
    // 
    // app.video.buffer[n%app.video.buffer.length].ImageData.data
    // app.audio.blob

    var __workerInstance_id = 0;

    function deleteFolder(path,callback) {
        // delete contents first
        var requests = [];
        var files_done = []; // to rollback (?) (must implement recycle bin)
        var deleteFolderThread = setInterval(function() {
            for(var x = 0; x < requests.length;x++) {
                if(requests[x].state >0) {
                    clearInterval( deleteFolderThread );
                    alert("error");
                    return;
                }
            }
            var check = 0;
            for(var x = 0; x < requests.length;x++) { if(requests[x].done < 3) { check++; } }
            if(check ==0) clearInterval( deleteFolderThread );
        },50);
        function deleteFolder(path,parent,callback) {
            Import({url:"/file/dir",method:"post",data:{dir:path}})
            .done(function(data2) {
                data2 = JSON.parse(data2);
                if(data2.result) {
                    var request = { checks : 0, state : 0, path : path, jobs : 0, done : 0 };
                    request.test = function() {
                        var s = this;
                        if(s.jobs == s.checks) {
                            s.done = 2;
                            // remain the folder itself
                            Import({url:"/file/rmdir", method:"post", data : { dir : s.path } })
                            .done(function(data) {
                                data = JSON.parse(data);
                                if(data.result) {
                                    files_done.push(s.path);
                                    s.callback();
                                    s.done = 3;
                                } else { s.state = 3.5; }
                            }).fail(function() { s.state = 4; }).send();
                        }
                    }
                    request.callback = function() { callback && callback(); }
                    // mini thread of deleting files
                    var dir = data2.value;
                    for(var file in dir) { request.checks++; }
                    if(request.checks ==0) { request.test(); } else {
                        requests.push(request);
                        for(var file in dir) {
                            if( dir[file] == 0 ) { // folder
                                deleteFolder(file,request,function() {
                                    files_done.push(path); request.jobs += 1; request.test();
                                },function() { request.state = 3; });
                            } else if( dir[file] == 1) {
                                deleteFile(file,function() {
                                    request.jobs += 1; request.test();
                                },function() { request.state = 2; });
                            }
                        }
                    } 
                } else { request.state = 1; }
            })
            .fail(function() {
                requests.push({ done : 1, state : 1000 })
            })
            .send();
        }
        function deleteFile(path,done,err) {
            Import({url:"/file/rm", method:"post", data : { dir : path } })
            .done(function(data) {
                data = JSON.parse(data); if(data.result) { files_done.push(path); done && done(); } else { err && err(); }
            }).fail(function() { err && err(); }) .send();
        }
        deleteFolder(path,null,function() {
            callback && callback();
        });
    }


    function WorkerInstance(url) {
        var t = this;
        this.id = __workerInstance_id++;
        this.instance = new Worker(url);
        this.data = {};
        var __request_id = 0;
        this.instance.onmessage = function(e) {
            t.data[ e.data.path + ":" + e.data.id ].callback.apply(null,[e.data.value]);
            delete t.data[ e.data.path + ":" + e.data.id ];
        }
        this.request = function(path,args,callback) {
            var id = __request_id++;
            t.data[path + ":" + id] = { callback : callback }
            t.instance.postMessage.apply(t.instance,[{id:id, path:path,args:args}]);
        }
    }
    var blob = new Blob(["(" + 
        function() {
            var storage = {
                "echo" : function(msg) {
                    var str = msg;
                    var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
                    var sb = [];
                    console.log("WAV WORKER SIZE:",str.length);
                    for(var x = 0; x < str.length;x++) {
                        var code = str[x];//.charCodeAt(x);
                        sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
                    }
                    return sb.join("");
                },
                "close" : function() {
                    self.close();
                }
            }
            function resolve(path) {
                path = path.split("/");
                if(!(path[0] in storage)) {
                    return function() {
                        return 0; // error
                    }
                }
                var p = storage[path[0]];
                for(var x = 1; x < path.length;x++) {
                    if(!(path[x] in p)) {
                        return function() {
                            return 0; // error
                        }
                    } else {
                        p = p[ path[x] ];
                    }
                }
                return p;
            }
            self.addEventListener('message', function(e) {
                var id = e.data.id;
                var path = e.data.path;
                var args = e.data.args;
                var result = resolve(path).apply(null,args);
                self.postMessage({
                    id : id,
                    path : path,
                    value : result
                });
            }, false);
        }.toString()
    + ")();"], {type: "text/javascript"});
    var blobURL = URL.createObjectURL(blob);
    var worker2 = new WorkerInstance(blobURL);
    URL.revokeObjectURL(blobURL);
    console.log( app.audio.blob);
    var fileReader     = new FileReader();
    fileReader.onload  = function(progressEvent) {
        uint8ArrayNew  = new Uint8Array(this.result);
        console.log(uint8ArrayNew);
        worker2.request("echo",[uint8ArrayNew],function(file){
            args.audio = file;
            args.images = [];

            // create a canvas to read imagedata
            var canvas = document.createElement("canvas");
            canvas.width = size[0];
            canvas.height = size[1];
            var context = canvas.getContext("2d");

            var n_max = app.video.buffer.length;
            var n = 0;
            var n_done = 0;
            function getImage(n,callback) {
                var current = context.getImageData(0,0,size[0],size[1]);
                copy(app.video.buffer[n%app.video.buffer.length].ImageData.data,current.data)
                context.putImageData(current,0,0);
                canvas.toBlob(function(blob) {
                    if(n < n_max) { setTimeout(function() { getImage(n+1,callback); },0); }
                    var fileReader     = new FileReader();
                    fileReader.onload  = function(progressEvent) {
                        uint8ArrayNew  = new Uint8Array(this.result);
                        worker2.request("echo",[uint8ArrayNew],function(file){
                            args.images[n] = file;
                            n_done += 1;
                            if(n_done == n_max-1) {
                                callback&&callback();
                            }
                        });
                    };
                    fileReader.readAsArrayBuffer(blob);
                },image_type,0.5);
            }
            getImage(0,function() {
                function write(filename,data,callback) {
                    Import({url:"/file/touch", method:"post", data : { dir : filename } })
                    .done(function(res) {
                        res = JSON.parse(res);
                        if(res.result) {
                            Import({url:"/file/update",method:"post",data:{ data : data, file : filename } })
                                .done(function(response) {
                                    callback&&callback();
                                })
                                .send();
                        } else {
                            alert(res.msg);
                        }
                    })
                    .fail(function(res) {
                        alert(res);
                    })
                    .send();
                }
                // choose name
                var data_folder = "./private/user/root/folder1";
                

                function process() {
                    Import({url:"/file/mkdir", method:"post", data : { dir : data_folder } })
                    .done(function(data) {
                        data = JSON.parse(data);
                        if(data.result) {
                            write(data_folder + "/test.mp3",args.audio,function() { alert("file:'test.mp3' uploaded!"); });
                            var count = 0;
                            function sendImage(n) {
                                var filename = data_folder + "/picture_"+n+"." + image_type.split("/").pop();
                                write(filename,args.images[n],function() {
                                    count += 1;
                                    if(count == n_max-1) {
                                        Import({url:"/compiler/media/ffmpeg",method:"post", data :{
                                            target : "folder1"
                                        }})
                                        .done(function(data) {
                                            alert("TERMINATED.");
                                            alert(data);
                                            // cleanup
                                            // remove folder of tmp data
                                            worker2.request("close",[],function() {
                                                console.log("end.");
                                            });
                                        })
                                        .fail(function(data) {
                                            alert(data);
                                        })
                                        .send();
                                    }
                                });
                            }
                            for(var x = 0; x < args.images.length;x++) sendImage(x);
                        } else {
                            alert(data.msg);
                        }
                    })
                    .fail(function(data) {
                        alert("FAIL 3");
                    })
                    .send();
                }
                Import({url:"/file/exists", method :"post", data : { path :  data_folder } })
                .done(function(data) {
                    data = JSON.parse(data);
                    if(data.result) {
                        if(data.value) {
                            deleteFolder(data_folder,function() {
                                process();
                            });
                        } else {
                            process();
                        }
                    } else {
                        alert("FAIL 1" + data.msg);
                    }
                })
                .fail(function(data) {
                    alert("FAIL 2");
                })
                .send();
                

                //
                
            });
        });
    };
    fileReader.readAsArrayBuffer(app.audio.blob);
}

function Audio() {
    startAudioConnection();
}

function AudioStart() {
    app.audio.loaded = true;
}
function AudioStop() {
    app.audio.loaded = false;
}
function AudioPlay() {
    
    if(app.audio.blob) {
        var url = (window.URL || window.webkitURL).createObjectURL(app.audio.blob);
        console.log(url);
        var p2 = app.audio.audio.elementSetPacket("<audio id='audio' controls preload='auto'><source src='"+url+"'/></audio>");
        p2.el.audio.addEventListener("canplay",function() {
            console.log(p2.el.audio.duration);
            p2.el.audio.play();

        });
        ////console.log(app.audio.audio);
    }
}
function AudioFlush() {
    // call save audio
    app.audio.save&&app.audio.save();
}
function AudioClear() {

}



function runCommand() {
    if(app.editor.main!=null) {
        var code = app.editor.main.getValue();
        eval(code);
    }
}
require(['vs/editor/editor.main'], function() {
    p.el.editor.style.width = window.innerWidth + "px";
    p.el.editor.style.height = "100px";
    app.editor.main = monaco.editor.create(p.el.editor, {
        value: "",
        language: "javascript"
    });

    app.editor.main.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
        runCommand();
    });
    app.editor.main.setValue("Record(200,50);");
});

setTimeout(function() { startVideoConnection(); startAudioConnection(); },0);





