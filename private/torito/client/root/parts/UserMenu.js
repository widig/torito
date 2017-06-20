

Class.define("UserMenu",{
    from : ["WithDOMElements2"],
    ctor : function() {
        this.on("nodeBuild",function() {
            var p = this.elementPushPacket(
                "<div id='menu' class='menu' style='font-size:20px;text-align:right;'>" +
                    "<div style='padding:20px;'>" +
                        "<table style='float:right'>" +
                            "<tr>"+
                                "<td id='menuFiles' class='global-menu-item' align='right' style='font-size:30px;'>User</td>" +
                            "</tr>"+
                            "<tr>"+
                                "<td id='menuFiles' class='global-menu-item clickable' align='right'>Files</td>" +
                            "</tr>"+
                            "<tr>"+
                                "<td id='menuServerView' class='global-menu-item clickable' align='right'>Switch to Server View</td>"+
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
                alert("files");
                self.hide();
            });
            p.el.menuLogout.addEventListener("click",function() {
                alert("logout");
                self.hide();
            });
            p.el.menuServerView.addEventListener("click",function() {
                History.go("#manage:system=files");
                self.hide();
            });
        });
    }, proto : {
        load : function(context) {
            function menu() {}
            menu.prototype.open = function() {
                context.mask.$.elementGetRaw("main").classList.add("menuActivated");
                context.userMenu.$.menu.el.classList.add("menuActivated");
                context.userContainer.$.main_element.el.classList.add("menuActivated");
                document.body.classList.add("menuActivated");
            }
            menu.prototype.close = function() {
                context.mask.$.elementGetRaw("main").classList.remove("menuActivated");
                context.userMenu.$.menu.el.classList.remove("menuActivated");
                context.userContainer.$.main_element.el.classList.remove("menuActivated");
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