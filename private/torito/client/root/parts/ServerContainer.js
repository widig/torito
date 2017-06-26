
Class.define("ServerContainer",{
    from : ["WithDOMElements2"],
    ctor : function() {
        this.state = 0;
        this.on("nodeBuild",function() {
            //this.main_element = this.elementPush("main_element","div",{ class : { add : "container" } });
            var p = this.elementPushPacket(
                "<div id='container' class='container'>" +
                    "<div id='top' style=''>"+
                        "<table width='100%'>"+
                            "<tr>"+
                                "<td align='left'>"+
                                    "<img id='btnMenu' src='public/page/torito/img/icon.gif' width='64'/>"+
                                "</td>"+
                                "<td align='center'>"+
                                "</td>"+
                                "<td align='right'>"+
                                "</td>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"+
                "</div>"
            );
            p.el.container.style.width = (window.innerWidth-20) + "px";
            this.main_element = { $: p.$.container, el : p.el.container };
            this.btnMenu = { $ : p.$.btnMenu,  el : p.el.btnMenu };
            UI.Window.on("resize",function() {
                p.el.container.style.width = (window.innerWidth-20) + "px";
            });
        });
    }, 
    proto: {
        load : function(context,app) {
            //console.log("## USER CONTAINER LOAD");
            if(this.state == 0) {
                this.btnMenu.el.addEventListener("click",function() {
                    context.serverMenu.$.show();
                });
            }
            
            var self = this;
            var arr = [
                ["fileManager","accounts","router","notes","logout","services"], // input name
                ["appFileManager","appAccounts","appRouter","appNotes","appLogout","appServices"], // variable of 
                ["AppFileManager","AppAccounts","AppRouter","AppNotes","AppLogout","AppServices"] // class
            ];
            
            /*
            at files
            if(!("files" in app)) {
                app.files = {};
            }
            if(!("server" in args)) {
                History.go("#manage:system=files&server=.");
            }
            */
                
            //alert("load " + app + " begin");
            for(var x = 0; x < arr[0].length;x++) {
                if(app == arr[0][x]) {
                    for(var y = 0; y < arr[0].length;y++) {
                        if(x!=y) {
                            if(arr[1][y] in self) {
                                //alert("HIDE:"+arr[1][y]);
                                self[arr[1][y]].$.hide();
                            } else {
                                //alert(arr[1][y] + " is not loaded");
                            }
                        }
                    }
                    if(arr[1][x] in self) {
                        self[arr[1][x]].$.show(context);
                    } else {
                        var _app = self.main_element.$.elementPush(arr[2][x]);
                        _app.$.init(context);
                        self[arr[1][x]] = _app;
                    }
                    self.state = x+1;
                }
            }
            //alert("load " + app + " end");
        }
    }
});