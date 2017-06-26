webfile.import('/public/page/torito/js/import.js','js');
webfile.import('/public/page/torito/js/querystring.js','js');
webfile.import('/public/page/torito/js/Class.js','js');
//webfile.import(__dirname + '/parts/Example.js','js');
webfile.page('home',__dirname);
webfile.start(__dirname + '/window.load.js');