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
                    "<div id='panelAddRoute' class='panelAddRoute'>"+
                        "<table width='200' border=0 style=''>"+
                            "<tr>"+
                                "<td colspan=2 style='font-size:20px;'>Add Route</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td align='right' width='80'>route path: </td><td><input id='txtRoutePath' type='text' style='width:100px;'/></td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td colspan='2'>get <input id='rRouteMethod1' name='method' type='radio' checked/> post <input id='rRouteMethod2' name='method' type='radio'/> static <input id='rRouteMethod3' name='method' type='radio'/></td>"+
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
                placeholders : {}
            };
            var cache = {};
            var selected = {};
            var codeEditor = null;
            
            function saveRoute() {
                if(selected.path!="") {
                    var str = codeEditor.getValue();
                    var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
                    var sb = [];
                    for(var x = 0; x < str.length;x++) {
                        var code = str.charCodeAt(x);
                        sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
                    }
                    Import({url:"/route/install",method:"post",data:{method:selected.method,path:selected.path,code:sb.join("")}})
                        .done(function(data) {
                            alert(data);
                            var json = JSON.parse(data);
                            if( json.result ) {
                                cache[ selected.method][ selected.path ] = codeEditor.getValue();
                            }
                        })
                        .send();
                }
            };
            
            function openRoute(method,path) {
                selected.method = method;
                selected.path = path;
                Import({url:"/route/get",method:"post",data: {method: method, path : path }})
                .done(function(data){
                    data = JSON.parse(data);
                    if(data.result) {
                        
                        selected.method = method;
                        selected.path = path;
                        localStorage.setItem("manage.routes.lastRoute","#manage:system=router&method="+method+"&path=" + path);
                        p.$.title.elementSetPacket(method + ":" + path);
                        cache[ selected.method][ selected.path ] = data.value[path].code;
                        codeEditor.setValue(data.value[path].code);
                        codeEditor.focus();

                    } else {
                        
                        selected.method = "";
                        selected.path = "";
                        alert("can't get route '" + path + "'.");
                    }
                })
                .send();

                
            }
            function deleteRoute() {
                var path = selected.path;
                var method = selected.method;
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
                                    selected.target.tr.removeChild( selected.target.td );
                                    selected.target.table.removeChild( selected.target.tr );
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
                
                containerRoutesEditor.style.width = (window.innerWidth - 280) + "px";
                containerRoutesEditor.style.height = (window.innerHeight - 20-70) + "px";
                
                var titleHeight = 25;
                var title = p.el.title;
                title.style.position = "absolute";
                title.style.left = "0px";
                title.style.top = "0px";
                title.style.width = (window.innerWidth - 300) + "px";
                title.style.height = titleHeight + "px";
                title.style.fontSize = "20px";
                title.style.padding = "10px";
                title.style.backgroundColor = "blue";
                title.style.color = "white";
                
                
                
                var editor = p.el.editor;
                editor.style.position = "absolute";
                editor.style.left = "0px";
                editor.style.top = titleHeight+20 + "px";
                editor.style.width = (window.innerWidth - 280)  + "px";
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
                if(method == "static") {
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
                            
                            
                            selected.method = method;
                            selected.path = path;
                            selected.target = {
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