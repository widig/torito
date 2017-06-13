// view=manage
//      notes opened
//            _______________________________________
//            | username - note title - note date    | SCROLL
//            | users online                         |
//            | total users                          |
//            |[close note][view note]               |
//            |______________________________________|
//
//      create note
//             _______________________________
//            |                               |
//            | reference                     |
//            | title                         |
//            | record                        |
//            |                           [GO]|
//            |_______________________________|
//
// view=interact&note=id&start=id
// 
//      reference: url
//      talk :
//               ______________________
//              |user did that at 0000|
//              |content              |
//              |reply                |
//              |_____________________|
//
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
                        //alert("/notes/listRoot\r\n" + data);
                        data = JSON.parse(data);
                        if(data.result) {
                            p.$.dir.elementsClear();
                            for(var x = 0; x < data.value.length;x++) {
                                var p2 = p.$.dir.elementPushPacket(
                                    "<div style='background-color:white;color:black;border:solid 1px #000;padding:20px;margin-bottom:10px;'>"+
                                        // "<div>id : "+data.value[x].id+"</div>"+
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
                        alert("/note/create\r\n" + data);
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
                            /*
                            "<div style='display:flex'>"+
                                "<div id='btnTXT' style='background-color:black;color:white;border-radius:5px;padding:5px;margin:5px;'>TXT</div>"+
                                "<div id='btnRTF' style='background-color:black;color:white;border-radius:5px;padding:5px;margin:5px;'>RTF</div>"+
                                "<div id='btnCANVAS' style='background-color:black;color:white;border-radius:5px;padding:5px;margin:5px;'>CANVAS</div>" +
                                "<div id='btnMIC' style='background-color:black;color:white;border-radius:5px;padding:5px;margin:5px;'>MIC</div>" +
                                "<div id='btnCAM' style='background-color:black;color:white;border-radius:5px;padding:5px;margin:5px;'>CAM</div>" +
                                "<div id='btnFILE' style='background-color:black;color:white;border-radius:5px;padding:5px;margin:5px;'>FILE</div>" +
                            "</div>"+
                            */
                            "<div style='display:flex;margin-bottom:10px;'>"+
                                "<textarea id='txtMessage' style='flex:1;height:60px;'></textarea>"+
                                "<input id='btnSend' type='button' value='send' style='height:67px;'/>"+
                            "</div>"+
                            "<div>"+
                                "<div>Title : <span id='lblTitle' style='font-size:30px;'></span></div>"+
                                "<div>Reference : <span id='lblReference' style='font-weight:bold;text-decoration:underline;'></span></div>"+
                                "<br/>"+
                                "<WithDOMElements2 id='dir'></WithDOMElements2>"+
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
                p.el.btnSend.addEventListener("click",function() {

                    var str = p.el.txtMessage.value;
                    var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
                    var sb = [];
                    for(var x = 0; x < str.length;x++) {
                        var code = str.charCodeAt(x);
                        sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
                    }

                    Import({url:"/notes/push",method:"post",data : { id : context.args.id, message : sb.join("") } })
                    .done(function(data){
                        p.el.txtMessage.value = "";
                        data = JSON.parse(data);
                        if(data.result) {
                            refresh_notes();
                        }
                    })
                    .send();
                });
                function setReply(p,item,id,path) {
                    /*
                    p.el.btnInsert.style.backgroundColor = "#ccc";
                    p.el.btnInsert.style.height = "2px";
                    p.el.btnInsert.addEventListener("mouseover",function() {
                        p.el.btnInsert.style.backgroundColor = "red";
                        
                    });
                    p.el.btnInsert.addEventListener("mouseout",function() {
                        p.el.btnInsert.style.backgroundColor = "#ccc";
                        
                    });
                    */
                    p.el.btnReply.addEventListener("click",function() {
                        var p2 = p.$.reply_control.elementSetPacket(
                            "<div style='display:flex;margin-bottom:10px;'>"+
                                "<textarea id='txtMessage' style='flex:1;height:60px;'></textarea>"+
                                "<input id='btnSend' type='button' value='send' style='height:67px;'/>"+
                            "</div>"
                        );
                        p2.el.btnSend.addEventListener("click",function() {
                            var str = p2.el.txtMessage.value;
                            var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
                            var sb = [];
                            for(var x = 0; x < str.length;x++) {
                                var code = str.charCodeAt(x);
                                sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
                            }
                            
                            Import({
                                url:"/notes/push",
                                method:"post",
                                data : {
                                    id: id,
                                    message : sb.join(""),
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
                            setReply(p3,arr[x],id,JSON.stringify(path));
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

                            for(var x = 0; x < arr.length;x++) {
                                console.log("--------------------------------------------------------------------------");
                                if(arr[x].enabled) {
                                    (function(x){
                                        var path = [x];
                                        var date = new Date(arr[x].date);
                                        var date_str = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
                                        var p2 = p.$.dir.elementUnshiftPacket(
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
                                        setReply(p2,arr[x],context.args.id,JSON.stringify([x]));
                                        fill_replies(p2,arr[x].replies,context.args.id,JSON.stringify([x]));
                                    })(x);
                                }
                            }
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
            }

            

            this.hide = function() {
                self.components.$.app_notes_manage.elementsClear();
                self.components.$.app_notes_interact.elementsClear();
                //p.el.app_notes.style.display = "none";
            }
            this.show = function(context) {
                
                if( context.args.view == "manage") {
                    load_manage();
                } else if(context.args.view == "interact") {
                    load_interact();
                }

                //alert(JSON.stringify(context.notes)+JSON.stringify(context.args));
                //p.el.app_notes.style.display = "";
            }
            this.show(context);

        }
    }
});