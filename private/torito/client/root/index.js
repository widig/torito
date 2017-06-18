console.log("OK?");

webfile.import(__dirname + "/default.css","css");

webfile.import("/public/page/torito/js/Debug.js","js");
webfile.import("/public/page/torito/js/import.js","js");
webfile.import("/public/page/torito/js/querystring.js","js");
webfile.import("/public/page/torito/js/SHA1.js","js");
webfile.import("/public/page/torito/js/Class.js","js");
webfile.import("/public/page/torito/js/Download.js","js");

webfile.import("/public/control/jszip/dist/jszip.min.js");


webfile.import("/public/control/monaco/dev/vs/editor/editor.main.css","css");

webfile.import("/public/control/jquery/1.9.1/jquery.min.js","js");
webfile.import("/public/control/bootstrap/2.3.1/bootstrap.min.js","js");

webfile.script("var require={ paths : { vs : '/public/control/monaco/dev/vs'} }; ");
webfile.import("/public/control/monaco/dev/vs/loader.js","js");


webfile.import(__dirname + "/_parts_/AppAccounts.js","js");
webfile.import(__dirname + "/_parts_/AppFileManager.js","js");
webfile.import(__dirname + "/_parts_/AppLogout.js","js");
webfile.import(__dirname + "/_parts_/AppRouter.js","js");
webfile.import(__dirname + "/_parts_/AppTerminal.js","js");
webfile.import(__dirname + "/_parts_/AppNotes.js","js");
webfile.import(__dirname + "/_parts_/Mask.js","js");
webfile.import(__dirname + "/_parts_/ServerContainer.js","js");
webfile.import(__dirname + "/_parts_/ServerMenu.js","js");
webfile.import(__dirname + "/_parts_/UserContainer.js","js");
webfile.import(__dirname + "/_parts_/UserMenu.js","js");
// best use of this is to static map, part can be replaced by import

webfile.page("manage",__dirname);

/*
webfile.page("home",__dirname);
webfile.page("store",__dirname);
webfile.page("profile",__dirname);
*/


// page and imports can be componentized, just like bower

webfile.start(__dirname + "/main.js");



