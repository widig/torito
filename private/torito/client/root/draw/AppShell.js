Class.define("AppShell",{
    from : ["WithDOMElements2"],
    ctor : function() {
        this.on("nodeBuild",function() {
            // create a monaco editor
            var app = {
                editor : {
                    main : null
                }
            }
            var p = this.elementSetPacket("<div id='editor' style='width:640px;height:100px;'></div>");
            require(['vs/editor/editor.main'], function() {
                app.editor.main = monaco.editor.create(p.el.editor, {
                    value: "",
                    language: "javascript"
                });
            });
        });
    },
    proto : {
        
    }
});
