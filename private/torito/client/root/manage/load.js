console.log("MANAGE",args);

if(!("system" in args)) {
    History.go("#manage:system=files");
    return;
}

if(!this.init) {
    this.init = this.init || true;
    var app = {};
    this.history = [];
    // frame for tests
    UI.Body.elementsClear();
    var p = UI.Body.elementPushPacket("<ServerContainer id='serverContainer'></ServerContainer>");
    app.serverContainer = this.serverContainer = { $: p.$.serverContainer, el : p.el.serverContainer };
    app.mask = this.mask = UI.Body.elementPush("mask","Mask"); // 1
    app.serverMenu = this.serverMenu = UI.Body.elementPush("serverMenu","ServerMenu"); // 0
    this.app = app;
    this.serverMenu.$.load(app);
    app.args = args;

    var hash = History.getHash();
    var obj = {
        hash : hash,
        state : History.parse_state(hash),
        args : History.parse_args(hash)
    };
    this.history.push( obj );

} else {
    this.app.args = args;
    // make a history of urls here
    var hash = History.getHash();
    var obj = {
        hash : hash,
        state : History.parse_state(hash),
        args : History.parse_args(hash)
    };

    // to know that that are a history we must analyse the other branch. (what you don't know may hurt you)
    var last = this.history[this.history.length-1];
    if(last.args.system != obj.args.system ) {
        alert("changed from " + last.hash + " to " + obj.hash);

        // if old system=file and there is a server then save
        // if new system=file replace server with saved one and reload with history.go

    }

    this.history.push( obj );

}
var app = this.app;

if("system" in args) {
    if(args.system == "router") {
        this.serverContainer.$.load(this.app,"router");
    } else if(args.system == "files") {
        if(!("files" in app)) {
            app.files = {};
        }
        if(!("server" in args)) {
            History.go("#manage:system=files&server=.");
            return;
        }
        app.files.server = args.server;
        this.serverContainer.$.load(this.app,"fileManager");
    } else if(args.system == "accounts") {
        if(!("accounts" in app)) {
            app.accounts = {};
        }
        if(!("view" in args)) {
            History.go("#manage:system=accounts&view=global");
            return;
        }
        app.accounts.view = args.view;
        this.serverContainer.$.load(this.app,"accounts");
    } else if(args.system == "logout") {
        this.serverContainer.$.load(this.app,"logout");
    } else if(args.system == "notes") {
        if(!("notes" in app)) {
            app.notes = {};
        }
        if(!("view" in args)) {
            History.go("#manage:system=notes&view=manage");
            return;
        }
        app.notes.view = "manage";
        this.serverContainer.$.load(this.app,"notes");
    }
}