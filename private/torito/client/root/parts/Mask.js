Class.define("Mask",{
    from : ["WithDOMElements2"],
    ctor : function() {
        this.on("nodeBuild",function() {
            this.elementPush("main","div",{
                class : { add : "mask" }
            });
        });
    }, proto : {
    }
});
