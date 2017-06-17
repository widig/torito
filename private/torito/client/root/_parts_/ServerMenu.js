
Class.define("ServerMenu",{
    from : ["WithDOMElements2"],
    ctor : function() {
        this.on("nodeBuild",function() {
            var p = this.elementPushPacket(
                "<div id='menu' class='menu' style='font-size:20px;text-align:right;'>" +
                    "<div style='padding:20px;'>" +
                        "<table style='float:right'>" +
                            "<tr>"+
                                "<td id='menuFiles' class='global-menu-item' align='right' style='font-size:30px;'>Server</td>" +
                            "</tr>"+
                            "<tr>"+ 
                                "<td id='menuFiles' class='global-menu-item clickable' align='right'>Files</td>" +
                            "</tr>"+
                            "<tr>"+
                                "<td id='menuRoutes' class='global-menu-item clickable' align='right'>Routes</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='menuAccounts' class='global-menu-item clickable' align='right'>Accounts</td>"+
                            "</tr>"+
                            /*
                            "<tr>"+
                                "<td id='menuUserView' class='global-menu-item clickable' align='right'>User View</td>"+
                            "</tr>"+
                            */
                            "<tr>"+
                                "<td id='menuNotes' class='global-menu-item clickable' align='right'>Notes</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='menuLogout' class='global-menu-item clickable' align='right'>Logout</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='menuHelp' class='global-menu-item clickable' align='right'>Help</td>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"+
                "</div>"
            );
            this.menu = { $ : p.$.menu, el: p.el.menu };
            var self = this;
            p.el.menuFiles.addEventListener("click",function() {
                var p = localStorage.getItem("manage.files.last");
                if(p!=null) {
                    History.go(p);
                } else {
                    History.go("#manage:system=files");
                }
                self.hide();
            });
            p.el.menuRoutes.addEventListener("click",function() {
                History.go("#manage:system=router");
                self.hide();
            });
            p.el.menuAccounts.addEventListener("click",function() {
                History.go("#manage:system=accounts");
                self.hide();
            });
            p.el.menuLogout.addEventListener("click",function() {
                History.go("#manage:system=logout");
                self.hide();
            });
            /*
            p.el.menuUserView.addEventListener("click",function() {
                History.go("#home:system=files");
                self.hide();

            });
            */
            p.el.menuNotes.addEventListener("click",function() {
                History.go("#manage:system=notes");
                self.hide();
            })
        });
    }, proto : {
        load : function(context) {
            function menu() {}
            menu.prototype.open = function() {
                context.mask.$.elementGetRaw("main").classList.add("menuActivated");
                context.serverMenu.$.menu.el.classList.add("menuActivated");
                context.serverContainer.$.main_element.el.classList.add("menuActivated");
                document.body.classList.add("menuActivated");
            }
            menu.prototype.close = function() {
                context.mask.$.elementGetRaw("main").classList.remove("menuActivated");
                context.serverMenu.$.menu.el.classList.remove("menuActivated");
                context.serverContainer.$.main_element.el.classList.remove("menuActivated");
                setTimeout(function() {
                    document.body.classList.remove("menuActivated");
                },400);
            }
            var _menu = new menu();
            
            context.mask.$.elementGetRaw("main").addEventListener("click",function() {
                _menu.close();
            });
            this.show = function() {
                _menu.open();
            }
            this.hide = function() {
                _menu.close();
            }
        }
    }
});
