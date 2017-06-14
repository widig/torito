
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
                "<WithDOMElements2 id='app_notes_interact'></WithDOMElements2>"
            );
            function load_manage() {
                self.components.$.app_notes_interact.elementsClear();
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
                    p.el.btnViewNote.addEventListener("click",function() {
                        History.go("#manage:system=notes&view=interact&id=" + note.id);
                        return;
                    });
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
                                        "<div style='display:flex;width:100%;'><input type='button' id='btnCloseNote' value='close this notes'/><input type='button' id='btnViewNote' value='view notes'/></div>" +
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
            function load_interact() {
                
                self.components.$.app_notes_manage.elementsClear();
                var p = self.components.$.app_notes_interact.elementSetPacket(
                    
                    "<div id='app_notes' style='border:solid 1px #fff;overflow:auto;background-color:white;'>"+
                        "<div style='padding:10px;margin:10px;border:solid 1px #000;'>"+
                            "<div>"+
                                "<div>Title : <span id='lblTitle' style='font-size:30px;'></span></div>"+
                                "<div>Reference : <span id='lblReference' style='font-weight:bold;text-decoration:underline;'></span></div>"+
                                "<br/>"+
                                "<div style='display:flex;margin-bottom:10px;'>"+ // sender control
                                    "<textarea id='txtMessage' style='flex:1;height:60px;'></textarea>"+
                                    "<input id='btnSend' type='button' value='send' style='height:67px;'/>"+
                                "</div>"+
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
                function Send(id,path,str,done,error) {
                    var args = { id : id, message : Export.Codec.Hex(str)};
                    if(path) args.path = path;
                    Import({url:"/notes/push",method:"post",data : args })
                    .done(function(data){
                        data = JSON.parse(data);
                        if(data.result) {
                            done&&done(data);
                        } else {
                            error&error(data);
                        }
                    })
                    .send();
                }
                p.el.btnSend.addEventListener("click",function() {
                    Send(context.args.id,null,p.el.txtMessage.value,function() {
                        p.el.txtMessage.value = "";
                        refresh_notes();
                    },function(data) {
                        alert(error + "\r\n" + JSON.stringify(data));
                        p.el.txtMessage.value = "";
                    })
                });
                function setReply(p,id,path) {
                    p.el.btnReply.addEventListener("click",function() {
                        var p2 = p.$.reply_control.elementSetPacket(
                            "<div style='display:flex;margin-bottom:10px;'>"+
                                "<textarea id='txtMessage' style='flex:1;height:60px;'></textarea>"+
                                "<input id='btnSend' type='button' value='send' style='height:67px;'/>"+
                            "</div>"
                        );
                        p2.el.btnSend.addEventListener("click",function() {
                            Send(id,path,p2.el.txtMessage.value,function() {
                                refresh_notes();
                            },function(data) {
                                alert(error + "\r\n" + JSON.stringify(data));
                            })
                            p.$.reply_control.elementsClear();
                        });
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
                            var p3 = control.$.reply_area.elementUnshiftPacket(
                                "<div style='flex:1;background-color:white;color:black;padding-left:10px;'>"+
                                    "<div style='font-size:12px;'>"+
                                        "<span>"+ JSON.stringify(path) + ":</span>"+
                                        "<span style='font-weight:bold;'>"+arr[x].user+"</span>"+
                                        "<span> at </span>"+
                                        "<span style='font-weight:bold;'>"+date_str+"</span>"+
                                        "<span> | </span>"+
                                        "<span id='btnReply' style='font-family:Courier New;font-size:12px;'> Reply </span>"+
                                        "<span> | </span>"+
                                        "<span id='btnClose' style='font-family:Courier New;font-size:12px;'> Close </span>"+
                                    "</div>"+
                                    "<div style='font-size:16px;'>"+arr[x].message.value+"</div>"+
                                    "<WithDOMElements2 id='reply_control'></WithDOMElements2>" +
                                    "<WithDOMElements2 id='reply_area'></WithDOMElements2>" +
                                "</div>"+
                                "<div id='btnInsert'>"+
                                "</div>"
                            )
                            setReply(p3,id,JSON.stringify(path));
                            fill_replies(p3,arr[x].replies,id,JSON.stringify(path));
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
            
            this.hide = function() {
                self.components.$.app_notes_manage.elementsClear();
                self.components.$.app_notes_interact.elementsClear();
            }
            this.show = function(context) {
                
                if( context.args.view == "manage") {
                    load_manage();
                } else if(context.args.view == "interact") {
                    load_interact();
                }

            }
            this.show(context);

        }
    }
});