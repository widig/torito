Class.define("AppLogout",{
    from : ["WithDOMElements2"],
    ctor : function() {
        
    },
    proto : {
        init : function(context) {
            window.location = "/logout";
        }
    }
});
