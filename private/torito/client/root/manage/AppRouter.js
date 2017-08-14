Class.define("AppRequest",{
    from : ["WithDOMElements2"],
    ctor : function() {

    },
    proto : {
        init : function(context) {
            if("route" in context) {
                
                var method = context.route.method;
                var path = context.route.path;
                var args = [];
                
                var p = this.elementSetPacket(
                    "<div style='display:flex;'>"+
                        "<div style='font-size:30px;padding:10px;background-color:#ddd;border-bottom:solid 1px #000;'>" + method + "</div>"+
                        "<div style='font-size:30px;flex:1;padding:10px;border-bottom:solid 1px #000;'>" + path + "</div>"+
                    "</div>"+
                    "<div style='padding:10px;border-bottom:solid 1px #000;'>" +
                    "<table width='100%' cellpadding='0' cellspacing='0'>"+
                        "<tr><td>Name</td><td>Method</td><td>Value</td><td></td></tr>" +
                        "<WithDOMElements2 id='rows'></WithDOMElements2>"+
                        "<tr><td colspan='4' align='right'><input id='btnAddArgument' type='button' value='add argument'/></td></tr>"+
                        "<tr><td colspan='4' align='right'><input id='btnSend' type='button' value='send'/></td></tr>"+
                    "</table>" +
                    "</div>" +
                    "<div style='padding:10px;'>"+
                        "<div style='display:flex;'>"+
                            "<div style='flex:1;'>History</div>"+
                            "<div>"+
                                "<input id='btnClear' type='button' value='clear'/><br/>"+
                                "<input id='btnRunAll' type='button' value='run all'/>"+
                            "</div>"+
                        "</div>"+
                        "<table cellpadding='0' cellspacing='0' width='100%' style='border:solid 1px #000;'>"+
                            "<tr>"+
                                "<td style='border-right:solid 1px #000;border-bottom:solid 1px #000;background-color:#338;color:white;'>Id</td>"+
                                "<td style='border-right:solid 1px #000;border-bottom:solid 1px #000;background-color:#338;color:white;'>Username</td>"+
                                "<td style='border-right:solid 1px #000;border-bottom:solid 1px #000;background-color:#338;color:white;'>Instance</td>"+
                                "<td style='border-right:solid 1px #000;border-bottom:solid 1px #000;background-color:#338;color:white;'>Should</td>"+
                                "<td style='border-right:solid 1px #000;border-bottom:solid 1px #000;background-color:#338;color:white;'>Confirm</td>"+
                            "</tr>" +
                            "<WithDOMElements2 id='results'><WithDOMElements2>" +
                        "</table>"+
                    "</div>"+
                    "<div id='contextRequest' class='contextRoute' style='display:none;'>"+
                        "<table width='100%'>"+
                            "<tr>"+
                                "<td id='contextRequestRemove' class='button'>remove request</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='contextRequestCopyInput' class='button'>copy input</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='contextRequestCopyOutput' class='button'>copy output</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='contextRequestRunOnce' class='button'>run once</td>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"
                );
                var app = {
                    history : {
                        items : []
                    },
                    selected : {
                        pointer : null
                    }
                };
                function addArgument(name) {
                    name = name || "";
                    var p2 = p.$.rows.elementPushPacket(
                        "<tr>"+
                            "<td><input id='txtName' type='text' style='width:100%;'/></td>"+
                            "<td>" + 
                                "<select id='txtType' style='width:100%;'>"+
                                    "<option value='raw'>raw</option>" +
                                    "<option value='hex'>hex</option>" +
                                    "<option value='jsjson_hex'>jsjson_hex</option>" +
                                "</select>"+
                            "</td>"+
                            "<td><input id='txtValue' type='text' style='width:100%;'/></td>"+
                            "<td><input type='button' value='x'/></td>"+
                        "</tr>"
                    )
                    p2.el.txtName.value = name;
                    args.push({
                        name : function() {
                            return p2.el.txtName.value;
                        },
                        mode : function() {
                            return p2.el.txtType.value;
                        },
                        value : function() {
                            return p2.el.txtValue.value;
                        },
                        eval : function(obj) {
                            if(this.name() != "") {
                                var m = this.mode();
                                if( m == "hex") {
                                    obj[ this.name() ] = Export.Codec.Hex( this.value() );
                                } else if( m == "raw") {
                                    obj[ this.name() ] = this.value();
                                } else if( m == "jsjson_hex" ) {
                                    eval("x = " + this.value());
                                    obj[ this.name() ] = Export.Codec.Hex( JSON.stringify(x) );
                                }
                            }
                        },
                        delete : function() {
                            var sel = -1;
                            for(var x = 0; x < args.length;x++) if(args[x] == this) { sel = x; break; }
                            if(sel!=-1) args.splice(sel,1);
                        }
                    });
                }
                p.el.btnAddArgument.addEventListener("click",function() {
                    addArgument();
                });
                var check = false;
                if("input"  in context.route) {
                    
                    if("post"  in context.route.input) {
                        for(var key in context.route.input.post) {
                            check = true;
                            addArgument(key);
                        }
                    }
                }
                if(!check) {
                    addArgument();
                }

                p.el.btnRunAll.addEventListener("click",function() {
                    for(var x = 0; x < app.history.items.length;x++) {
                        var item = app.history.items[x];
                        alert(item.method + ":" + item.path);
                    }
                });
                p.el.btnClear.addEventListener("click",function() {
                    var itemsToCheck = 0;
                    var itemsChecked = 0;
                    function remove(item) {
                        Import({url:"/route/instance/remove",method:"post",data:{method:item.method,path:item.path,index : item.index }})
                        .done(function(data) {
                            data = JSON.parse(data);
                            if(data.result) {
                                //p.$.results.elementRemove(app.selected.pointer.name);
                                itemsChecked+=1;
                                //refresh_results();

                            } else {
                                alert("fail to remove route instance");
                            }
                        })
                        .fail(function(data) {
                            alert("fail to remove route instance");
                        })
                        .send();
                    }
                    
                    for(var x = 0; x < app.history.items.length;x++) {
                        var item = app.history.items[x];
                        itemsToCheck+=1;
                        remove(item);
                    }
                    var checkLoop = setInterval(function() {
                        if(itemsToCheck == itemsChecked) {
                            clearInterval(checkLoop);
                            refresh_results();
                        }
                    },100);
                });
                p.el.contextRequestRemove.addEventListener("click",function() {
                    if( app.selected.pointer!=null ) {
                        // remove on server
                        var item = app.selected.pointer;
                        Import({url:"/route/instance/remove",method:"post",data:{method:item.method,path:item.path,index : item.index }})
                        .done(function(data) {
                            alert(data);
                            data = JSON.parse(data);
                            if(data.result) {
                                //p.$.results.elementRemove(app.selected.pointer.name);
                                refresh_results();
                            } else {
                                alert("fail to remove route instance");
                            }
                        })
                        .fail(function(data) {
                            alert("fail to remove route instance");
                        })
                        .send();
                    }
                });
                p.el.contextRequestCopyInput.addEventListener("click",function() {
                    //alert("copy input");
                    if( app.selected.pointer!= null) {
                        var item = app.selected.pointer;
                        UI.Window.copyToClipboard(
                            "Import({url:\"" + item.path + "\",method:\"" + item.method + "\",data:"+JSON.stringify(item.value.input)+"})\r\n.done(f1)\r\n.fail(f2)\r\n.send();"
                        );
                    }
                });
                p.el.contextRequestCopyOutput.addEventListener("click",function() {
                    if( app.selected.pointer!= null) {
                        var item = app.selected.pointer;
                        UI.Window.copyToClipboard(
                            JSON.stringify(item.value.output)
                        );
                    }
                });
                function setContext(target) {
                    
                    var t = target.component;
                    var v = target.value;
                    t.el.line.addEventListener("mouseover",function() {
                        for(var x = 0; x < app.history.items.length;x++) {
                            if( app.history.items[x].component == target.component ) {
                                app.history.items[x].component.el.line.style.backgroundColor = "#ccc";
                                app.history.items[x].component.el.line.style.color = "black";
                            } else {
                                app.history.items[x].component.el.line.style.backgroundColor = "white";
                                app.history.items[x].component.el.line.style.color = "black";
                            }
                        }
                    });
                    t.el.line.addEventListener("mouseup",function(event) {
                        app.selected.pointer = target;
                        if(event.button == 0) {
                            for(var x = 0; x < app.history.items.length;x++) {
                                if( app.history.items[x].component == target.component ) {
                                    app.history.items[x].component.el.line.style.backgroundColor = "black";
                                    app.history.items[x].component.el.line.style.color = "white";
                                } else {
                                    app.history.items[x].component.el.line.style.backgroundColor = "white";
                                    app.history.items[x].component.el.line.style.color = "black";
                                }
                            }
                        }
                        if(event.button == 2) {
                            console.log(event);
                            var obj = p.el.contextRequest;
                            obj.style.position = "absolute";
                            obj.style.left = (event.layerX-10) + "px";
                            obj.style.top = (event.layerY+20) + "px";
                            obj.style.display = "none";
                            obj.style.display = "";
                            cancelCmnu = 1;

                            function track_click() {
                                obj.style.display = "none";
                                cancelCmnu = 0;
                                UI.Window.off("click",track_click);
                                UI.Window.off("keydown",track_keyboard);
                            }
                            function track_keyboard(e) {
                                if(e.keyCode == 27) {
                                    obj.style.display = "none";
                                    cancelCmnu = 0;
                                    UI.Window.off("click",track_click);
                                    UI.Window.off("keydown",track_keyboard);
                                }
                            }
                            UI.Window.on("click",track_click);
                            UI.Window.on("keydown",track_keyboard);

                        }
                    });

                }
                
                p.el.btnSend.addEventListener("click",function() {
                    var _args = {};
                    for(var x = 0; x < args.length;x++) args[x].eval(_args);
                    Import({url:path,method:method,data:_args})
                    .done(function(data) {
                        alert(data);
                        data = JSON.parse(data);
                        // now register the response
                        Import({url:"/route/instance/create",method:"post",data :
                            {
                                path : path,
                                method : method,
                                input : Export.Codec.Hex( JSON.stringify(_args) ),
                                output : Export.Codec.Hex( JSON.stringify( data ))
                            }
                        })
                        .done(function(data2) {
                            alert(data2);
                            data2 = JSON.parse(data2);
                            if(data2.result) {
                                // refresh results
                                refresh_results();
                            } else {
                                alert("fail to register request");
                            }
                        })
                        .fail(function() {
                            alert("fail to register request");
                        })
                        .send();
                    })
                    .fail(function() {
                        alert("request fail.");
                    })
                    .send();
                });
                

                function refresh_results() {
                    
                    Import({url:"/route/instance/list",method:"post",data :{
                        path : path,
                        method : method
                    }})
                    .done(function(data) {
                        
                        data = JSON.parse(data);
                        if(data.result) {
                            p.$.results.elementsClear();
                            app.history.items.splice(0,app.history.items.length);

                            var items = data.value;
                            for(var x = 0; x < items.length;x++) {
                                if( items[x].removed ) {

                                } else {
                                    var name = "namedPacket"+x;
                                    var p2 = p.$.results.elementPushPacket(name,
                                        "<tr id='line' style='cursor:default;'>"+
                                            "<td style='border-bottom:solid 1px #000;border-right:solid 1px #000;'>"+x+"</td>"+
                                            "<td style='border-bottom:solid 1px #000;border-right:solid 1px #000;'>"+items[x].username+"</td>"+
                                            "<td style='border-bottom:solid 1px #000;font-size:12px;border-right:solid 1px #000;'>"+
                                                "<table>"+
                                                    "<tr><td>Input</td><td>"+JSON.stringify(items[x].input)+"</td></tr>"+
                                                    "<tr><td>Result</td><td>"+JSON.stringify(items[x].output)+"</td></tr>"+
                                                "</table>"+
                                            "</td>"+
                                            "<td style='border-bottom:solid 1px #000;border-right:solid 1px #000;'>"+items[x].should+"</td>"+
                                            "<td style='border-bottom:solid 1px #000;border-right:solid 1px #000;'>"+true+"</td>"+
                                        "</tr>"
                                    );
                                    var obj = {
                                        path : path,
                                        index : x,
                                        method : method,
                                        name : name,
                                        component : p2,
                                        value : items[x]
                                    };
                                    app.history.items.push(obj);
                                    setContext(obj);
                                }
                            }
                        } else {
                            // empty
                            // just clear
                            p.$.results.elementsClear();
                            //alert("request list fail.");
                        }
                    })
                    .fail(function() {
                        alert("request list fail.");
                    })
                    .send();
                }
                refresh_results();

                // load previous results
                
            } else {
                this.elementSetPacket("");
            }
        }
    }
});
Class.define("AppRouter",{
    from : ["WithDOMElements2"],
    ctor : function() {
        
    },
    proto : {
        init : function(context) {
            var i = this.internal.AppRouter.data = {};
            var p = context.serverContainer.$.main_element.$.elementPushPacket("all",
                "<div id='app_router'>"+
                    "<div id='menuRoutes' class='menuRoutes'>"+
                        "<div class='menuRoutesTitle'>Routes</div>"+
                        "<div id='menuRoutesContents' class='menuRoutesContents'>"+
                            "<div id='dir' style='font-size:14px;'></div>"+
                        "</div>"+
                    "</div>"+
                    "<div id='containerRoutesEditor' class='containerRoutesEditor'>"+
                        "<div id='title' style='background-color:#008;'></div>"+
                        "<div id='editor'></div>"+
                    "</div>"+
                    "<div id='toolsContainer' style='display:flex;flex-direction:column;background-color:#fff;'>"+
						"<div id='toolsTitle' style='padding:10px;background-color:#338;color:white;'>Tools</div>"+
						"<div id='toolsData' style='display:none;'><AppRequest id='appRequest'></AppRequest></div>" +
					"</div>"+
                    "<div id='notesContainer' style='display:flex;flex-direction:column;background-color:#fff;'>"+
						"<div id='notesTitle' style='padding:10px;background-color:#338;color:white;'>Notes</div>"+
						"<div id='notesData' style='display:none;'><AppNotes id='appNotes'></AppNotes></div>" +
					"</div>"+
                    "<div id='panelAddRoute' class='panelAddRoute'>"+
                        "<table width='200' border=0 style=''>"+
                            "<tr>"+
                                "<td colspan=2 style='font-size:20px;'>Add Route</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td align='right' width='80'>route path: </td><td><input id='txtRoutePath' type='text' style='width:100px;'/></td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td colspan='2'>"+
                                    "get <input id='rRouteMethod1' name='method' type='radio' checked/> "+
                                    "post <input id='rRouteMethod2' name='method' type='radio'/><br/>"+
                                    "websocket <input id='rRouteMethod4' name='method' type='radio'/> "+
                                    "static <input id='rRouteMethod3' name='method' type='radio'/></td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td align='right'>static path:</td><td><input id='txtStaticPath' type='text' style='width:100px;'/></td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td></td><td><input id='btnAddRoute' type='button' value='add'/></td>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"+
                    "<div id='contextRoute' class='contextRoute' style='display:none;'>"+
                        "<table width='100%'>"+
                            "<tr>"+
                                "<td id='contextRouteRemove' class='button'>remove route</td>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"+
                "</div>"
            );
            
            var app = {
                placeholders : {},
                selected : {
                    method : "",
                    path : "",
                    target : {}
                },
                editor : {

                },
                notes : {
					active : false,
					loaded : false,
					cache : {},
					id : ""
				},
                tools : {
					active : false,
					loaded : false,
					cache : {},
					id : ""
				},
            };
            var cache = {};
            
            var codeEditor = null;
            
            function saveRoute() {
                if(app.selected.path!="") {
                    var str = codeEditor.getValue();
                    var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
                    var sb = [];
                    for(var x = 0; x < str.length;x++) {
                        var code = str.charCodeAt(x);
                        sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
                    }
                    Import({url:"/route/install",method:"post",data:{method:app.selected.method,path:app.selected.path,code:sb.join("")}})
                        .done(function(data) {
                            alert(data);
                            var json = JSON.parse(data);
                            if( json.result ) {
                                cache[ app.selected.method][ app.selected.path ] = codeEditor.getValue();
                            }
                        })
                        .send();
                }
            };
            function getRouteArguments(code) {
                var syntax = window.esprima.parse(code, { raw: true, tokens: true, range: true, comment: true });
                // check if post var is querystring of body
                console.log(syntax);
                var ret = {
                };
                var post_arguments = {};
                for(var x = 0; x < syntax.tokens.length;x++) {
                    // identify check of argument in post var    
                    if( 
                        ( x + 2 < syntax.tokens.length ) &&
                        syntax.tokens[x].type == "String" &&
                        syntax.tokens[x+1].type == "Keyword" &&
                        syntax.tokens[x+1].value == "in" &&
                        syntax.tokens[x+2].type == "Identifier" &&
                        syntax.tokens[x+2].value == "post"
                    ) {
                        var name = JSON.parse(syntax.tokens[x].value);
                        if(!(name in post_arguments)) {
                            post_arguments[ name ] = {
                                checks : 1,
                                uses : 0
                            };
                        } else {
                            post_arguments[ name ].checks += 1;
                        }
                    }
                    // identify use of arguments in post var
                    if(
                        ( x + 2 < syntax.tokens.length ) &&
                        syntax.tokens[x].type == "Identifier" &&
                        syntax.tokens[x].value == "post" &&
                        syntax.tokens[x+1].type == "Punctuator" &&
                        syntax.tokens[x+1].value == "." &&
                        syntax.tokens[x+2].type == "Identifier"
                    ) {
                        var name = syntax.tokens[x+2].value;
                        if(!(name in post_arguments)) {
                            post_arguments[ name ] = {
                                checks : 0,
                                uses : 1
                            };
                        } else {
                            post_arguments[ name ].uses += 1;
                        }
                    }
                }
                ret.post = post_arguments;
                return ret;
            }
            function openRoute(method,path) {
                //alert("open "+method+":"+path)
                app.selected.method = method;
                app.selected.path = path;
                Import({url:"/route/get",method:"post",data: {method: method, path : path }})
                .done(function(data){
                    data = JSON.parse(data);
                    if(data.result) {
                        app.editor.fileSelected = "./private/torito/routes/" + method + path + ".jsf";
                        loadNotes(app.editor.fileSelected);
                        

                        
                        localStorage.setItem("manage.routes.lastRoute","#manage:system=router&method="+method+"&path=" + path);
                        p.$.title.elementSetPacket(method + ":" + path);
                        cache[ app.selected.method][ app.selected.path ] = data.value[path].code;


                        var rargs = getRouteArguments(data.value[path].code);
                        //alert( JSON.stringify(rargs) );
                        // now we have "arguments of request"
                        
                        
                        loadTools({
                            route : {
                                method : app.selected.method,
                                path : app.selected.path,
                                input : rargs
                            }
                        });

                        codeEditor.setValue(data.value[path].code);
                        codeEditor.focus();

                    } else {
                        
                        app.selected.method = "";
                        app.selected.path = "";
                        alert("can't get route '" + path + "'.");
                    }
                })
                .send();

                
            }
            function deleteRoute() {
                var path = app.selected.path;
                var method = app.selected.method;
                if(
                    path == "/" || 
                    path == "/route/install" || 
                    path == "/route/list" || 
                    path == "/route/remove" || 
                    path == "/file/dir" || 
                    path == "/file/touch" || 
                    path == "/file/mkdir" || 
                    path == "/file/rm" || 
                    path == "/file/rmdir" || 
                    path == "/load" || 
                    path =="/login" || 
                    path == "/logout" || 
                    
                    path == "/public"
                ) {
                    alert("you can't delete route '"+path+"'. it's native.");
                } else {
                    if( confirm("are you sure to remove '" + path + "'?") ) {
                        Import({url:"/route/remove",method:"post",data: { path:path,method:method}})
                            .done(function(data) {
                                alert(data);
                                var data = JSON.parse(data);
                                if(data.result) {
                                    // remove button
                                    app.selected.target.tr.removeChild( app.selected.target.td );
                                    app.selected.target.table.removeChild( app.selected.target.tr );
                                    //window.location.reload();
                                    openRoute("get","/");
                                }
                            })
                            .send();
                    }
                }
            }
            i.resize = function() {
                
                var menuRoutes = p.el.menuRoutes;
                menuRoutes.style.height = (window.innerHeight-20-170-60) + "px";
                var menuRoutesContents = p.el.menuRoutesContents;
                menuRoutesContents.style.overflow = "auto";
                menuRoutesContents.style.height = (window.innerHeight-65-170-60) + "px";
                
                var containerRoutesEditor = p.el.containerRoutesEditor;
                
                containerRoutesEditor.style.width = (window.innerWidth - 260) + "px";
                containerRoutesEditor.style.height = (window.innerHeight - 20-70) + "px";
                
                var titleHeight = 25;
                
                var title = p.el.title;
                title.style.position = "absolute";
                title.style.left = "0px";
                title.style.top = "0px";
                title.style.width = (window.innerWidth - 280) + "px";
                title.style.height = titleHeight + "px";
                title.style.fontSize = "20px";
                title.style.padding = "10px";
                title.style.backgroundColor = "blue";
                title.style.color = "white";
                
                var menu_width = 230;

                var height2 = (38 + ((window.innerHeight - 40 - titleHeight-70-21)) - adjust );


                p.el.toolsContainer.style.position = "absolute";
                p.el.toolsContainer.style.border = "solid 1px #000";
                p.el.toolsContainer.style.top = app.tools.active ? (window.innerHeight - 57 - ((window.innerHeight - 40 - titleHeight-70-20)) + adjust ) : (window.innerHeight - 58) + "px";
                p.el.toolsContainer.style.left = (menu_width+20) + "px";
                p.el.toolsContainer.style.width = parseInt( (window.innerWidth-(menu_width+40))/2 ) + "px";
                p.el.toolsContainer.style.height = app.tools.active ? height2 + "px" : 38 + "px";

                var notes_width = parseInt( (window.innerWidth-(menu_width+40))/2 );

                p.el.notesContainer.style.position = "absolute";
                p.el.notesContainer.style.opacity = 0.95;
                p.el.notesContainer.style.border = "solid 1px #000";
                var left_of_halpwidth = (window.innerWidth - (menu_width+30))/2;
                var adjust = 16;
                
                var noteState1 = [
                    menu_width+20+notes_width+10,
                    app.notes.active? (window.innerHeight - 57 - ((window.innerHeight - 40 - titleHeight-70-20)) + adjust ) : (window.innerHeight - 58),
                    notes_width,
                    app.notes.active ? height2 : 38
                ];
                var arr = [
                    "left","top","width","height"
                ];
                for(var x = 0; x < arr.length;x++) p.el.notesContainer.style[arr[x]] = noteState1[x] + "px";

                
                var editor = p.el.editor;
                editor.style.position = "absolute";
                editor.style.left = "0px";
                editor.style.top = titleHeight+20 + "px";
                editor.style.width = (window.innerWidth - 260)  + "px";
                editor.style.height = (window.innerHeight - 40 - titleHeight-70) + "px";
                
                var panelAddRoute = p.el.panelAddRoute;
                panelAddRoute.style.top = (window.innerHeight - 175) + "px";
                
                if(codeEditor) {
                    codeEditor.layout();
                }
            }
            
            UI.Window.on("resize",i.resize);
            this.on("nodeDispose",function() {
                var i = this.internal.AppRouter.data;
                UI.Window.off("resize",i.resize);
            });
            i.resize();
            
            
            UI.Document.defaultContextMenu(false);
            document.body.style.overflow = "hidden";
            
            p.el.contextRouteRemove.addEventListener("click",function(){
                var obj = p.el.contextRoute;
                obj.style.display = "none";
                deleteRoute();
            });
            
            p.el.btnAddRoute.addEventListener("click",function() {
                var path = p.el.txtRoutePath.value;
                var code = "(function(){\r\n\treturn function(req,res){ res.send(\""+path+"\");};\r\n})();";
                var method = p.el.rRouteMethod1.checked == true ? "get" : "";
                if(method == "") method = p.el.rRouteMethod2.checked == true ? "post" : "";
                if(method == "") method = p.el.rRouteMethod3.checked == true ? "static" : "";
                if(method == "") method = p.el.rRouteMethod4.checked == true ? "websocket" : "";
                if(method == "") method = "get";

                if(method == "post") {
                    
                } else if(method == "websocket") {

                } else if(method == "static") {
                    code = JSON.stringify({
                        path : path,
                        target : p.el.txtStaticPath.value
                    });
                }
                var str = code;
                var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
                var sb = [];
                for(var x = 0; x < str.length;x++) {
                    var code = str.charCodeAt(x);
                    sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
                }
                
                Import({ url:"/route/install", method:"post",data:{path:path,method:method,code:sb.join("")}})
                    .done(function(result) {
                        alert(result);
                        window.location.reload();
                    })
                    .send();
            });
            function openTools() {
                /*
                "<div id='toolsContainer' style='display:flex;flex-direction:column;background-color:#fff;'>"+
						"<div id='toolsTitle' style='padding:10px;background-color:#338;color:white;'>Tools</div>"+
						"<div id='toolsData' style='display:none;'><AppRequest id='appRequest'></AppRequest></div>" +
					"</div>"+
                */
                var titleHeight = 0;
				var adjust = 16;
				p.el.toolsContainer.style.top = (window.innerHeight - 57 - ((window.innerHeight - 40 - titleHeight-70-45)) + adjust ) + "px";
				var height = (38 + ((window.innerHeight - 40 - titleHeight-70-46)) - adjust );
				p.el.toolsContainer.style.height = height + "px";
				p.el.toolsData.style.height = (height-45)+"px";
				p.el.toolsData.style.border = "solid 1px #f00";
				p.el.toolsData.style.overflowY = "auto";
				p.el.toolsData.style.display = "";
                app.tools.active = true;
                
                if(app.selected.method != "" && app.selected.path != "") {

                    
                        
                        
                        
                    loadTools({
                        route : {
                            method : app.selected.method,
                            path : app.selected.path,
                            input : getRouteArguments(codeEditor.getValue())
                        }
                    });

                        

                } else {
                    var context = {

                    };
                    p.$.appRequest.elementsClear();
                    p.$.appRequest.init(context);
                }
            }
            function closeTools() {
				p.el.toolsContainer.style.top = (window.innerHeight - 57) + "px";
				p.el.toolsContainer.style.height = "38px";
				p.$.toolsData.elementsClear();
				p.el.toolsData.style.display = "none";
				app.tools.active = false;
			}

            function openNotes() {
				var titleHeight = 0;
				var adjust = 16;
				p.el.notesContainer.style.top = (window.innerHeight - 57 - ((window.innerHeight - 40 - titleHeight-70-45)) + adjust ) + "px";
				var height = (38 + ((window.innerHeight - 40 - titleHeight-70-46)) - adjust );
				p.el.notesContainer.style.height = height + "px";
				p.el.notesData.style.height = (height-45)+"px";
				p.el.notesData.style.border = "solid 1px #f00";
				p.el.notesData.style.overflowY = "auto";
				p.el.notesData.style.display = "";

				if(app.notes.id == "") {
					if(app.editor.fileSelected !="") {
						loadNotes(app.editor.fileSelected);
					}
				} else {
					var context = {
						args : {
							view : "interact",
							id : app.notes.id
						}
					};
					p.$.appNotes.elementsClear();
					p.$.appNotes.init(context);
				}
				// load notes
				app.notes.active = true;
			}
			function closeNotes() {
				p.el.notesContainer.style.top = (window.innerHeight - 57) + "px";
				p.el.notesContainer.style.height = "38px";
				p.$.notesData.elementsClear();
				p.el.notesData.style.display = "none";
				app.notes.active = false;
			}
            p.el.toolsTitle.addEventListener("click",function() {
				if(!app.tools.active) {
					openTools();
				} else {
					closeTools();
				}
			});
			p.el.notesTitle.addEventListener("click",function() {
				if(!app.notes.active) {
					openNotes();
				} else {
					closeNotes();
				}
			});
            function loadTools(args) {
                p.$.appRequest.elementsClear();
                p.$.appRequest.init(args);
            }
			function loadNotes(path) {
				Import({url:"/notes/create",method:"post",data:{
					title : "file",
					reference : path
				}})
				.done(function(data) {
					data = JSON.parse(data);
					if(data.result) {

						app.notes.id = data.id;
						app.notes.cache[path] = data.id;
						var context = {
							args : {
								view : "interact",
								id : data.id
							}
						};
						p.$.appNotes.elementsClear();
						p.$.appNotes.init(context);

					} else {
						alert("failed to create a note.");
					}
				})
				.send();
			}
            
            function load_route_method_path_from_cache(method,path) {

                if(!app["table_title_"+method + "_" + path]) {
                    var tr = app.placeholders[method].$.elementPush("tr_"+method+"_"+path,"tr");
                    var td = tr.$.elementPush("td_"+method+"_"+path,"td",{
                        class : { add : ["button","borderBottom"] }
                    });
                    td.$.elementSetPacket(path);
                    app["table_title_"+method + "_" + path] = {
                        tr : tr,
                        td : td
                    };
                    td.el.addEventListener("click",function() {
                        History.go("#manage:system=router&method=" + method + "&path=" + path);
                        return;
                        //openRoute(method,path);
                    });
                    td.el.addEventListener("mouseup",function(event) {
                        if(event.button == 2) {
                            
                            var obj = p.el.contextRoute;
                            
                            
                            app.selected.method = method;
                            app.selected.path = path;
                            app.selected.target = {
                                td : td.el,
                                tr: tr.el,
                                table : app.table
                            };
                            obj.style.position = "absolute";
                            obj.style.left = (window.mousePos.x-10) + "px";
                            obj.style.top = (window.mousePos.y-10) + "px";
                            obj.style.display = "none";
                            obj.style.display = "";
                            cancelCmnu = 1;

                            function track_click() {
                                obj.style.display = "none";
                                cancelCmnu = 0;
                                UI.Window.off("click",track_click);
                                UI.Window.off("keydown",track_keyboard);
                            }
                            function track_keyboard(e) {
                                if(e.keyCode == 27) {
                                    obj.style.display = "none";
                                    cancelCmnu = 0;
                                    UI.Window.off("click",track_click);
                                    UI.Window.off("keydown",track_keyboard);
                                }
                            }
                            UI.Window.on("click",track_click);
                            UI.Window.on("keydown",track_keyboard);

                        }
                    });
                }
                
            }
            function load_route_method_list_from_cache(method) {
                if(!app["table_title_"+method]) {
                    var tr = app.table.$.elementPush("tr_"+method,"tr");
                    var td = tr.$.elementPush("td_"+method,"td",{
                        class : { add : ["groupDir","borderBottom"] }
                    });
                    td.$.elementSetPacket(method);
                    
                    var placeholder = app.table.$.elementPush("WithDOMElements2");
                    app["table_title_"+method] = {
                        tr : tr,
                        td : td,
                        placeholder : placeholder,
                        visible : true
                    };
                    app.placeholders[method] = placeholder;
                    
                    td.el.addEventListener("click",function() {
                        if(app["table_title_"+method].visible) {
                            placeholder.$.elementsClear();
                            app["table_title_"+method].visible = false;
                        } else {
                            var list = [];
                            for(var path in cache[method]) {
                                list.push(path);
                            }
                            list.sort();
                            for(var x = 0; x < list.length;x++) {
                                load_route_method_path_from_cache(method,list[x]);
                            }
                            app["table_title_"+method].visible = true;
                        }
                        
                    });
                }
                var list = [];
                for(var path in cache[method]) {
                    list.push(path);
                }
                list.sort();
                for(var x = 0; x < list.length;x++) {
                    load_route_method_path_from_cache(method,list[x]);
                }
            }
            function load_route_list_from_cache() {
                if(!app.table) {
                    var t = p.$.dir.elementPush("dir_table","table",{
                        attribs : {
                            width : "100%",
                            cellpadding : "0",
                            cellspacing : "0"
                        }
                    });
                    app.table = t;
                } else {
                    //p.$.dir.elementsClear();
                }
                for(var method in cache) {
                    load_route_method_list_from_cache(method);
                }
            }
            function load_route_list_from_server() {
                Import({url:"/route/list",method:"post"})
                .done(function(response) {
                    var data = JSON.parse(response);
                    
                    cache = data;
                    load_route_list_from_cache();
                    if(codeEditor == null) {
                        require(['vs/editor/editor.main'], function() {
                            var editorContainer = p.el.editor;
                            codeEditor = monaco.editor.create(editorContainer, {
                                value: "",
                                language: "javascript"
                            });
                            codeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
                                saveRoute();
                            });
                            //alert("method:" + context.routes.method + ",path:'"+context.routes.path+"'");
                            openRoute(context.routes.method,context.routes.path);	
                            i.resize();
                        });
                    } else {
                        openRoute(context.routes.method,context.routes.path);	
                        i.resize();
                    }
                })
                .send();
            }
            load_route_list_from_server();
            this.hide = function() {
                p.el.app_router.style.display = "none";
            }
            this.show = function(context) {
                load_route_list_from_server();
                p.el.app_router.style.display = "";
            }
        }
    }
});