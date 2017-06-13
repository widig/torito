if(!this.init) {
    this.init = this.init || true;
    var app = {};
    // frame for tests
    UI.Body.elementsClear();
    var p = UI.Body.elementPushPacket("<UserContainer id='userContainer' teste='ok'></UserContainer>");// userContainer","UserContainer"); // 2
    app.userContainer = this.userContainer = { $: p.$.userContainer, el : p.el.userContainer };
    app.mask = this.mask = UI.Body.elementPush("mask","Mask"); // 1
    app.userMenu = this.userMenu = UI.Body.elementPush("userMenu","UserMenu"); // 0
    this.app = app;
    this.userMenu.$.load(app);

}
var app = this.app;
app.args = args;
if(!("system" in args)) {
    History.go("#home:system=files");
    return;
}

if("system" in args) {
    if(args.system == "files") {
        if(!("files" in app)) {
            app.files = {};
        }
        if(!("server" in args)) {
            History.go("#home:system=files&server=.");
            return;
        }
        app.files.server = args.server;
        this.userContainer.$.load(this.app,"fileManager");
    }
}