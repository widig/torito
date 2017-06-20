

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


webfile.import(__dirname + "/parts/AppAccounts.js","js");
webfile.import(__dirname + "/parts/AppFileManager.js","js");
webfile.import(__dirname + "/parts/AppLogout.js","js");
webfile.import(__dirname + "/parts/AppRouter.js","js");
webfile.import(__dirname + "/parts/AppTerminal.js","js");
webfile.import(__dirname + "/parts/AppNotes.js","js");
webfile.import(__dirname + "/parts/Mask.js","js");
webfile.import(__dirname + "/parts/ServerContainer.js","js");
webfile.import(__dirname + "/parts/ServerMenu.js","js");
webfile.import(__dirname + "/parts/UserContainer.js","js");
webfile.import(__dirname + "/parts/UserMenu.js","js");


webfile.page("manage",__dirname);


webfile.start(__dirname + "/main.js");



