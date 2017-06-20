Class.define("AppTerminal",{
    from : ["WithDOMElements2"],
    ctor : function() {
        
    },
    proto : {
        init : function(context) {
            var i = this.internal.AppTerminal.data = {};
            var self = this;
            var p = context.serverContainer.$.main_element.$.elementPushPacket("app_terminal",
                "<div id='app_terminal' class='app_terminal'>"+
                "<div>terminal</div>"+
                "</div>"
            );
            UI.Document.defaultContextMenu(false);
            this.hide = function() {
                p.el.app_terminal.style.display = "none";
            }
            this.show = function() {
                p.el.app_terminal.style.display = "";
            }
        }
    }
});