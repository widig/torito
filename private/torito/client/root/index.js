

webfile.import(__dirname + "/default.css","css");

webfile.import("/public/page/torito/js/Debug.js","js");
webfile.import("/public/page/torito/js/import.js","js");
webfile.import("/public/page/torito/js/querystring.js","js");
webfile.import("/public/page/torito/js/SHA1.js","js");
webfile.import("/public/page/torito/js/Class.js","js");
webfile.import("/public/page/torito/js/Download.js","js");

webfile.import("/public/control/jszip/dist/jszip.min.js");
webfile.import("/public/control/esprima/esprima.js");
webfile.import("/public/control/escodegen/escodegen.js");
webfile.import("/public/control/lamejs/lame.all.js");


webfile.import("/public/control/monaco/dev/vs/editor/editor.main.css","css");

webfile.import("/public/control/jquery/1.9.1/jquery.min.js","js");
webfile.import("/public/control/bootstrap/2.3.1/bootstrap.min.js","js");

webfile.script("var require={ paths : { vs : '/public/control/monaco/dev/vs'} }; ");
webfile.import("/public/control/monaco/dev/vs/loader.js","js");


webfile.import(__dirname + "/manage/AppAccounts.js","js");
webfile.import(__dirname + "/manage/AppFileManager.js","js");
webfile.import(__dirname + "/manage/AppLogout.js","js");
webfile.import(__dirname + "/manage/AppRouter.js","js");
webfile.import(__dirname + "/manage/AppServices.js","js");
webfile.import(__dirname + "/manage/AppNotes.js","js");
webfile.import(__dirname + "/manage/Mask.js","js");
webfile.import(__dirname + "/manage/ServerContainer.js","js");
webfile.import(__dirname + "/manage/ServerMenu.js","js");
webfile.page("manage",__dirname);

webfile.import(__dirname + "/draw/AppShell.js","js");
webfile.page("draw",__dirname);

webfile.page("stream",__dirname);


webfile.start(__dirname + "/main.js");
