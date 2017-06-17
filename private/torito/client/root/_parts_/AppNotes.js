
Class.define("AppNotesInput",{
    from : ["WithDOMElements2"],
    ctor : function() {
        var self = this;
        this.on("nodeBuild",function() {
            var app = {};
            app.TYPE_TEXT = "text/plain";
            app.TYPE_JSONURL = "text/json-url";

            app.type = "text/plain";
            app.mode = {};
            app.mode.text = {
                value : ""
            };
            var p = this.elementSetPacket(
                "<div style='display:flex;margin-bottom:2px;'>" +
                    "<div id='setText' style='padding:5px;background-color:white;color:black;border:solid 1px #f00;cursor:pointer;margin-right:5px;'>text</div>" +
                    "<div id='setUrl' style='padding:5px;background-color:white;color:black;border:solid 1px #000;cursor:pointer;'>url</div>" +
                "</div>"+
                "<WithDOMElements2 id='editor'>" +
                    "<div style='display:flex;margin-bottom:10px;'>"+ // sender control
                        "<textarea id='txtMessage' style='flex:1;height:60px;'></textarea>"+
                        "<input id='btnSend' type='button' value='send' style='height:67px;'/>"+
                    "</div>" +
                "</WithDOMElements2>"
            );
            var arr = [ p.el.setText, p.el.setUrl ];
            var opt = [ "text/plain", "text/json-url" ];
            function _set(target,type) {
                target.addEventListener("mouseover",function() {
                    target.style.backgroundColor = "black";
                    target.style.color = "white";
                });
                target.addEventListener("mouseout",function() {
                    target.style.backgroundColor = "white";
                    target.style.color = "black";
                });
                target.addEventListener("click",function() {
                    app.type = type;
                    if(type == "text/json-url") {
                        p.el.txtMessage.value = "{\r\n\t\"url\" : \"\",\r\n\t\"caption\" : \"\"\r\n}";
                    } else {
                        p.el.txtMessage.value = "";
                    }
                });
            }
            for(var x = 0; x < arr.length;x++) _set(arr[x],opt[x]);

            self.clear = function() {
                p.el.txtMessage.value = "";
            }
            self.focus = function() {
                p.el.txtMessage.focus();
            }
            self.setData = function(data) {
                if(data.type == app.TYPE_TEXT) {
                    app.type = app.TYPE_TEXT;
                    p.el.txtMessage.value = data.value;
                } else if(data.type == app.TYPE_JSONURL) {
                    app.type = app.TYPE_JSONURL;
                    p.el.txtMessage.value = data.value;
                }
            }
            self.getData = function() {
                if(app.type == app.TYPE_TEXT) {
                    return {
                        type : app.type,
                        value : p.el.txtMessage.value
                    };
                } else if(app.type == app.TYPE_JSONURL) {
                    try {
                        var obj = JSON.parse(p.el.txtMessage.value);
                        if(!("url" in obj)) {
                            throw "no url attribute.";
                        }
                        if(!("caption" in obj)) {
                            obj.caption = obj.url;
                        }
                        if(!("url" in obj)) {
                            return {
                                type : app.TYPE_TEXT,
                                value : ""
                            };
                        }
                        if( obj.url.indexOf("#")!=0 ) {
                            return {
                                type : app.TYPE_TEXT,
                                value : ""
                            };
                        }
                        var data = JSON.stringify( obj );
                        return {
                            type : app.type,
                            value : data
                        };
                    } catch(e) {
                        alert("JSON URL IS NOT IN CORRECT FORMAT");
                    }
                } else {
                    return {
                        type : app.TYPE_TEXT,
                        value : p.el.txtMessage.value
                    };
                }
            }
            p.el.txtMessage.addEventListener("keydown",function(e) {
                if(e.keyCode == 27) {
                    self.emit("cancel");
                }
            });
            p.el.btnSend.addEventListener("click",function() {
                self.emit("send");
            });
        });
    },
    proto : {


    }
});
Class.define("AppNotes",{
    from : ["WithDOMElements2"],
    ctor : function() {

    },
    proto : {
        init : function(context) {
            var i = this.internal.AppNotes.data = {};
            var self = this;
            // get view
            this.components = this.elementPushPacket(
                "<WithDOMElements2 id='app_notes_manage'></WithDOMElements2>"+
                "<WithDOMElements2 id='app_notes_interact'></WithDOMElements2>"+
                "<WithDOMElements2 id='app_notes_render'></WithDOMElements2>"
            );
            

            function load_interact() {
                self.components.$.app_notes_render.elementsClear();
                self.components.$.app_notes_manage.elementsClear();
                var p = self.components.$.app_notes_interact.elementSetPacket(
                    
                    "<div id='app_notes' style='border:solid 1px #fff;overflow:auto;background-color:white;'>"+
                        "<div style='padding:10px;margin:10px;border:solid 1px #000;'>"+
                            "<div>"+
                                "<div>Title : <span id='lblTitle' style='font-size:30px;'></span></div>"+
                                "<div>Reference : <span id='lblReference' style='font-weight:bold;text-decoration:underline;'></span></div>"+
                                "<br/>"+
                                "<AppNotesInput id='inputNotes'/>"+
                                "<br/>"+
                                "<WithDOMElements2 id='dir'>"+
                                    
                                "</WithDOMElements2>"+
                            "</div>" +
                        "</div>"+
                    "</div>"
                );
                
                this.holder = p;
                var app = {
                    loaded : false
                };

                if(!("id" in context.args)) {
                    alert("must have an id to access interact.");
                    return;
                }
                function Send2(id,path,data_message,done,error) {
                    var args = { 
                        id : id, 
                        message : Export.Codec.Hex(JSON.stringify(data_message))
                    };
                    if(path) args.path = path;
                    Import({url:"/notes/push",method:"post",data : args })
                    .done(function(data){
                        data = JSON.parse(data);
                        if(data.result) {
                            done&&done(data);
                        } else {
                            if( data.msg == "C" ) {
                                alert("file was deleted.");
                                self.components.$.app_notes_interact.elementsClear();
                            } else {
                                error&error(data);
                            }
                        }
                    })
                    .send();
                }
                p.$.inputNotes.on("send",function() {
                    Send2(context.args.id,null,p.$.inputNotes.getData(),function() {
                        p.$.inputNotes.clear();
                        refresh_notes();
                    },function(data) {
                        p.$.inputNotes.clear();
                        alert("\r\n" + JSON.stringify(data));
                    });
                });

                function Update(id,path,data_message,done,error) {
                    var args = { 
                        id : id, 
                        message : Export.Codec.Hex(JSON.stringify(data_message))
                    };
                    if(path) args.path = path;
                    Import({url:"/notes/edit",method:"post",data : args })
                    .done(function(data){
                        data = JSON.parse(data);
                        if(data.result) {
                            done&&done(data);
                        } else {
                            if( data.msg == "C" ) {
                                alert("file was deleted.");
                                self.components.$.app_notes_interact.elementsClear();
                            } else {
                                error&error(data);
                            }
                        }
                    })
                    .send();
                }
               
                function setReply(p,id,path,data) {
                    if(p.el.btnUrl) {
                        var url_obj = JSON.parse( data.message.value );   
                        p.el.btnUrl.addEventListener("click",function() {
                            History.go(url_obj.url);
                        });
                    }
                    p.el.btnReply.addEventListener("click",function() {
                        var p2 = p.$.reply_control.elementSetPacket(
                            "<AppNotesInput id='inputNotes'/>"
                        );
                        p2.$.inputNotes.focus();
                        p2.$.inputNotes.on("send",function() {
                            Send2(context.args.id,path,p2.$.inputNotes.getData(),function() {
                                refresh_notes();
                            },function(data) {
                                p2.$.inputNotes.clear();
                                alert("\r\n" + JSON.stringify(data));
                            });
                        });
                        p2.$.inputNotes.on("cancel",function() {
                            p.$.reply_control.elementsClear();
                        });
                    });
                    p.el.btnEdit.addEventListener("click",function() {
                        p.$.lblMessage.elementsClear();
                        p2 = p.$.lblMessage.elementSetPacket(
                            "<AppNotesInput id='inputNotes'/>"
                        );
                        p2.$.inputNotes.setData({
                            type : "text/plain",
                            value : data.message.raw
                        });
                        p2.$.inputNotes.on("send",function() {
                            Update(id,path,p2.$.inputNotes.getData(),function() {
                                refresh_notes();
                            },function(data) {
                                alert("\r\n" + JSON.stringify(data));
                            })
                        });
                        p2.$.inputNotes.on("cancel",function() {
                            p.$.lblMessage.elementsClear();
                            if( data.message.type == "text/plain" ) {
                                p.$.lblMessage.elementSetPacket(
                                    "<div style='font-size:16px;'>"+data.message.value+"</div>"
                                );
                            } else if( data.message.type == "text/json-url" ) {
                                var url_obj = JSON.parse( data.message.value );
                                var p3 = p.$.lblMessage.elementSetPacket(
                                    "<div id='btnUrl' style='font-size:16px;color:blue;text-decoration:underline;cursor:pointer'><pre>"+
                                        url_obj.caption+
                                    "</pre></div>"
                                );
                                p3.el.btnUrl.addEventListener("click",function() {
                                    History.go(url_obj.url);
                                });
                            }
                        });
                        p2.$.inputNotes.focus();
                    });
                    p.el.btnClose.addEventListener("click",function() {
                        Import({
                            url : "/notes/destroy",
                            method : "post",
                            data : {
                                id : id,
                                path : path
                            }
                        })
                        .done(function(data) {
                            data = JSON.parse(data);
                            if(data.result) {
                                refresh_notes();
                            }
                        })
                        .send();
                    });
                }
                function fill_replies(control,data,id,path) {
                    path = JSON.parse(path);
                    for(var x = 0; x < data.length;x++) {
                        path.push(x);
                        var arr = data;
                        if( arr[x].enabled ) {
                            var date = new Date(arr[x].date);
                            var date_str = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();

                            if( arr[x].message.type == "text/plain" ) {
                                var p3 = control.$.reply_area.elementUnshiftPacket(
                                    "<div style='flex:1;background-color:white;color:black;padding-left:10px;'>"+
                                        "<div style='font-size:12px;'>"+
                                            "<span>"+ JSON.stringify(path) + ":</span>"+
                                            "<span style='font-weight:bold;'>"+arr[x].user+"</span>"+
                                            "<span> at </span>"+
                                            "<span style='font-weight:bold;'>"+date_str+"</span>"+
                                            "<span> | </span>"+
                                            "<span id='btnReply' style='font-family:Courier New;font-size:12px;cursor:pointer;'> Reply </span>"+
                                            "<span> | </span>"+
                                            "<span id='btnEdit' style='font-family:Courier New;font-size:12px;cursor:pointer;'> Edit </span>"+
                                            "<span> | </span>"+
                                            "<span id='btnClose' style='font-family:Courier New;font-size:12px;cursor:pointer;'> Close </span>"+
                                        "</div>"+
                                        "<WithDOMElements2 id='lblMessage'><div style='font-size:16px;'>"+arr[x].message.value+"</div></WithDOMElements2>"+
                                        "<WithDOMElements2 id='reply_control'></WithDOMElements2>" +
                                        "<WithDOMElements2 id='reply_area'></WithDOMElements2>" +
                                    "</div>"+
                                    "<div id='btnInsert'>"+
                                    "</div>"
                                )
                                setReply(p3,id,JSON.stringify(path),arr[x]);
                                fill_replies(p3,arr[x].replies,id,JSON.stringify(path));
                            } else if(arr[x].message.type == "text/json-url") {
                                var url_obj = JSON.parse( arr[x].message.value );
                                var p3 = control.$.reply_area.elementUnshiftPacket(
                                    "<div style='flex:1;background-color:white;color:black;padding-left:10px;'>"+
                                        "<div style='font-size:12px;'>"+
                                            "<span>"+ JSON.stringify(path) + ":</span>"+
                                            "<span style='font-weight:bold;'>"+arr[x].user+"</span>"+
                                            "<span> at </span>"+
                                            "<span style='font-weight:bold;'>"+date_str+"</span>"+
                                            "<span> | </span>"+
                                            "<span id='btnReply' style='font-family:Courier New;font-size:12px;cursor:pointer;'> Reply </span>"+
                                            "<span> | </span>"+
                                            "<span id='btnEdit' style='font-family:Courier New;font-size:12px;cursor:pointer;'> Edit </span>"+
                                            "<span> | </span>"+
                                            "<span id='btnClose' style='font-family:Courier New;font-size:12px;cursor:pointer;'> Close </span>"+
                                        "</div>"+
                                        "<WithDOMElements2 id='lblMessage'>"+
                                            "<div id='btnUrl' style='font-size:16px;color:blue;text-decoration:underline;cursor:pointer'><pre>"+
                                                url_obj.caption+
                                            "</pre></div>"+
                                        "</WithDOMElements2>"+
                                        "<WithDOMElements2 id='reply_control'></WithDOMElements2>" +
                                        "<WithDOMElements2 id='reply_area'></WithDOMElements2>" +
                                    "</div>"+
                                    "<div id='btnInsert'>"+
                                    "</div>"
                                )
                                setReply(p3,id,JSON.stringify(path),arr[x]);
                                fill_replies(p3,arr[x].replies,id,JSON.stringify(path));
                            }
                        }
                        path.pop();
                    }
                }
                function refresh_notes() {
                    Import({url:"/notes/list",method:"post", data:{id:context.args.id}})
                    .done(function(data) {
                        data = JSON.parse(data);
                        if(data.result) {
                            app.version = data.version;
                            app.id = context.args.id;
                            p.$.lblTitle.elementSetPacket(data.title);
                            p.$.lblReference.elementSetPacket(data.reference);
                            var arr = data.value;
                            p.$.dir.elementsClear();
                            var p2 = p.$.dir.elementPushPacket(
                                "<WithDOMElements2 id='reply_area'></WithDOMElements2>"
                            )
                            p.$.dir.$ = {
                                reply_area : p2.$.reply_area,
                            };
                            fill_replies(p.$.dir,arr,context.args.id,JSON.stringify([]));
                            app.loaded = true;
                        } else {
                            
                            alert(JSON.stringify(data));
                        }
                    })
                    .send();
                }
                refresh_notes();
                function service() {
                    setInterval(function() {
                        if(app.loaded) {
                            Import({url:"/notes/version",method:"post",data:{id:app.id}})
                            .done(function(data) {
                                data = JSON.parse(data);
                                if(data.result) {
                                    if( app.version < data.value ) {
                                        app.loaded = false;
                                        refresh_notes();
                                    }
                                }
                            })
                            .send();
                        }
                    },2000);
                }
                service();
                
            }
            function load_manage() {
                self.components.$.app_notes_interact.elementsClear();
                self.components.$.app_notes_render.elementsClear();
                var p = self.components.$.app_notes_manage.elementSetPacket(
                    "<div id='app_notes'>"+
                        "<div style='padding:20px;'>"+
                            "<div style='background-color:white;padding:20px;border:solid 1px #000;'>"+
                                "<div>Create Notes on:</div>"+
                                "<table>"+
                                    "<tr>"+
                                        "<td>title</td>"+
                                        "<td><input id='txtNoteTitle' type='text'/></td>"+
                                    "</tr>"+
                                    "<tr>"+
                                        "<td>reference</td>"+
                                        "<td><input id='txtNoteReference' type='text'/></td>"+
                                    "</tr>"+
                                    "<tr>"+
                                        "<td></td>"+
                                        "<td><input id='btnNoteCreate' type='button' value='create'/></td>"+
                                    "</tr>"+
                                "</table>"+
                            "</div>"+
                            "<div id='notesDirContainer' style='overflow:auto;height:500px;border:solid 1px #000;'>"+
                                "<div id='dir'>"+
                                "</div>"+
                            "</div>"+
                        "</div>"+
                    "</div>"
                );
                this.holder = p;
                p.el.notesDirContainer.style.height = (window.innerHeight-250) + "px";
                function setNote(p,note) {
                    p.el.btnCloseNote.addEventListener("click",function() {
                        Import({url:"/notes/close",method:"post",data:{id:note.id}})
                        .done(function(data){
                            refresh_notes();
                        })
                        .send();
                    });
                    p.el.btnViewInteract.addEventListener("click",function() {
                        History.go("#manage:system=notes&view=interact&id=" + note.id);
                        return;
                    });
                    /*
                    p.el.btnViewRender.addEventListener("click",function() {
                        History.go("#manage:system=notes&view=render&id=" + note.id);
                        return;
                    });
                    */
                }
                function refresh_notes() {
                    Import({url:"/notes/listRoot",method:"post",data:{}})
                    .done(function(data) {
                        data = JSON.parse(data);
                        if(data.result) {
                            p.$.dir.elementsClear();
                            for(var x = 0; x < data.value.length;x++) {
                                var p2 = p.$.dir.elementPushPacket(
                                    "<div style='background-color:white;color:black;border:solid 1px #000;padding:20px;margin-bottom:10px;'>"+
                                        "<div>title : "+data.value[x].title+"</div>"+
                                        "<div>reference : "+data.value[x].reference+"</div>"+
                                        "<div style='display:flex;width:100%;'>"+
                                            "<input type='button' id='btnCloseNote' value='close this notes'/>"+
                                            "<input type='button' id='btnViewInteract' value='view notes'/>"+
                                            /*
                                            "<input type='button' id='btnViewRender' value='render notes'/>"+
                                            */
                                        "</div>" +
                                    "</div>"
                                );
                                setNote(p2,data.value[x]);
                            }
                        }
                    })
                    .send();
                }
                refresh_notes();
                p.el.btnNoteCreate.addEventListener("click",function() {
                    Import({url:"/notes/create",method:"post",data:{
                        title : p.el.txtNoteTitle.value,
                        reference : p.el.txtNoteReference.value
                    }})
                    .done(function(data) {
                        
                        data = JSON.parse(data);
                        refresh_notes();

                    })
                    .send();
                });

            }
            function load_render() {
                self.components.$.app_notes_manage.elementsClear();
                self.components.$.app_notes_interact.elementsClear();
                var p = self.components.$.app_notes_render.elementSetPacket(
                    "<div id='app_notes' style='height:100%;'>"+
                        "<div style='height:100%;'>"+
                            "<textarea id='txtRender' style='width:100%;height:100%;'></textarea>"+
                        "</div>" +
                    "</div>"
                );

                if(!("id" in context.args)) {
                    alert("must have an id to access interact.");
                    return;
                }
                function refresh() {
                    Import({url:"/notes/render",method:"post", data:{id:context.args.id}})
                    .done(function(data) {
                        data = JSON.parse(data);
                        if(data.result) {
                            p.el.txtRender.value = data.value;
                        } else {
                            alert(JSON.stringify(data));
                        }
                    })
                    .send();
                }
                refresh();

            }
            this.hide = function() {
                self.components.$.app_notes_manage.elementsClear();
                self.components.$.app_notes_interact.elementsClear();
                self.components.$.app_notes_render.elementsClear();
            }
            this.show = function(context) {
                if( context.args.view == "manage") {
                    load_manage();
                } else if(context.args.view == "interact") {
                    load_interact();
                } else if(context.args.view == "render") {
                    load_render();
                }

            }
            this.show(context);

        }
    }
});