Class.define("AppFileManager",{
	from : ["WithDOMElements2"],
	ctor : function() {
	},
	proto : {
		init : function(context) {
			var i = this.internal.AppFileManager.data = {};
			this.table = null;
			var self = this;
			var p = context.serverContainer.$.main_element.$.elementPushPacket("all",
				"<div id='app_filemanager' class='app_filemanager'>"+
					"<div id='menuFileManager' class='menuFileManager'>"+
						"<div class='menuFilesTitle'>Files</div>"+
						"<div id='menuFilesContents' class='menuFilesContents'>"+
							"<div id='dir' style='font-size:14px;'></div>"+
						"</div>"+
					"</div>"+
					"<div id='pathFileManager' class='pathFileManager'>"+
						"<div style='font-weight:bold;font-size:12px;'>CurrentPath:</div>"+
						"<div style='display:table; width:100%;'>"+
							"<div id='pathFileManagerServer' style='font-size:20px;display:table-cell;width:50%;'></div>"+
						"</div>"+
					"</div>"+
					"<div id='containerFileManagerEditor' class='containerFileManagerEditor'>"+
						"<div id='title' style='background-color:#008;padding:10px;'></div>"+
						"<div id='editor'></div>"+
						"<div id='view' style='background-color:black;'></div>" +
					"</div>"+
					"<div id='notesContainer' style='display:flex;flex-direction:column;background-color:#fff;'>"+
						"<div id='notesTitle' style='padding:10px;background-color:#338;color:white;'>Notes</div>"+
						"<div id='notesData' style='display:none;'><AppNotes id='appNotes'></AppNotes></div>" +
					"</div>"+
					"<div id='contextServer' class='contextFile' style='display:none;'>"+
						"<table width='100%'>"+
							"<tr>"+
								"<td id='contextServerNewFile' class='button'>new file</td>"+
							"</tr>"+
							"<tr>"+
								"<td id='contextServerNewDirectory' class='button'>new directory</td>"+
							"</tr>"+
							"<tr>" +
								"<td id='contextServerInstallWebFile' class='button'>install webfile</td>"+
							"</tr>" + 
							"<tr>"+
								"<td id='contextServerZipBackup' class='button'>zip backup</td>"+
							"</tr>"+
							"<tr>"+
								"<td class='button' style='height:20px;'><div>zip restore</div><div style='height:0px;'><input id='contextServerZipRestore' type='file' style='position:relative;left:-20px;top:-20px; width:150px;opacity:0;'/></div></td>"+
							"</tr>"+
							"<tr>"+
								"<td class='button' style='height:20px;'><div>upload file</div><div style='height:0px;'><input id='contextServerUploadFile' type='file' style='position:relative;left:-20px;top:-20px; width:150px;opacity:0;'/></div></td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
					"<div id='contextServerDirectory' class='contextFile' style='display:none;'>"+
						"<table width='100%'>"+
							"<tr>"+
								"<td id='contextServerDirectoryDelete' class='button'>delete</td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
					"<div id='contextServerFile' class='contextFile' style='display:none;'>"+
						"<table width='100%'>"+
							"<tr>"+
								"<td id='contextServerFileDelete' class='button'>delete</td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
				"</div>" 
			);
			
			
			UI.Document.defaultContextMenu(false);
			var app = {
				selected : {},
				menu : {
					Server : {
						visibility : true,
						currentNames : []
					}
				},
				editor : {
					fileSelected : "",
					loaded : false,
					main : null,
					cachePositions : {},
					savePositions : function() {
						if( app.editor.fileSelected != "") {
							var cpos = app.editor.main.getPosition();
							app.editor.cachePositions[
								app.editor.fileSelected
							] = {
								cpos : cpos,
								spos : [
									app.editor.main.getScrollLeft(),
									app.editor.main.getScrollTop()
								]
							};
							localStorage.setItem("manage.files.cachePositions", JSON.stringify(app.editor.cachePositions));
						}
					},
					loadPositions : function() {
						var cp = localStorage.getItem("manage.files.cachePositions");
						if(cp!=null) {
							app.editor.cachePositions = JSON.parse(cp);
						}
						if( app.editor.fileSelected in app.editor.cachePositions) {
							var m = app.editor.cachePositions[app.editor.fileSelected];
							//alert("column:" + pos.column + ", lineNumber:" + pos.lineNumber);
							app.editor.main.setPosition( m.cpos );
							app.editor.main.setScrollLeft( m.spos[0] );
							app.editor.main.setScrollTop( m.spos[1] );
						}
					}
				},
				notes : {
					active : false,
					loaded : false,
					cache : {},
					id : ""
				},
				resize : function() {

					// architecture of notes right, editor in the center and menu on left
					// left of menu = window.innerWIdth - (each col-item)?
					// right of menu = padding + menu.width
					// top of menu = logo + 2*padding
					// bottom of menu = ?
					// left of editor = 2*padding + menu.width
					// right of editor = 2*padding + menu.width + editor.width
					// top of editor = ?
					// bottom of editor = ?
					// left of notes = 3*padding + menu.width + editor.width
					// right of notes = 3*padding + menu.width + editor.width + notes.width
					// top of notes = ?
					// bottom of notes = ?

					// -> menu.width + editor.width + notes.width be maxed by window.innerWidth - 3*padding
					// -> padding = 10px
					var menuFilesContents = p.el.menuFilesContents;
					menuFilesContents.style.overflow = "auto";
					menuFilesContents.style.height = (window.innerHeight-65-70) + "px";
					
					
					var right_block = notes_width+10;
					
					var menu_width = 230;
					
					p.el.pathFileManager.style.width = (window.innerWidth-(menu_width+40))+ "px";
					p.el.containerFileManagerEditor.style.width = (window.innerWidth - (menu_width+30)) + "px";
					p.el.containerFileManagerEditor.style.height = (window.innerHeight - 20-70-50) + "px";
					var notes_width = parseInt( (window.innerWidth-(menu_width+40))/2 );
					var titleHeight = 18;
					var editor = p.el.editor;
					var view = p.el.view;

					editor.style.position = view.style.position = "absolute";
					editor.style.left = view.style.left = "0px";
					editor.style.top = view.style.top = titleHeight+20 + "px";
					editor.style.width = view.style.width = (window.innerWidth - (menu_width + 30))  + "px";
					editor.style.height = view.style.height = (window.innerHeight - 40 - titleHeight-70-50) + "px";

					
					p.el.notesContainer.style.position = "absolute";
					p.el.notesContainer.style.opacity = 0.95;
					var left_of_halpwidth = (window.innerWidth - (menu_width+30))/2;
					var adjust = 16;
					var height2 = (38 + ((window.innerHeight - 40 - titleHeight-70-50)) - adjust );
					var noteState1 = [
						menu_width+20+notes_width+10,
						app.notes.active? (window.innerHeight - 57 - ((window.innerHeight - 40 - titleHeight-70-50)) + adjust ) : (window.innerHeight - 58),
						notes_width,
						app.notes.active ? height2 : 38
					];
					var arr = [
						"left","top","width","height"
					];
					for(var x = 0; x < arr.length;x++) p.el.notesContainer.style[arr[x]] = noteState1[x] + "px";

					p.el.notesContainer.style.border = "solid 1px #000";


					if(app.editor.loaded) { app.editor.main.layout(); }
				}
			};
			context.files.app = app;


			// TO REMOVE
			UI.Window.on("keydown",function(e) {
				if(UI.Window.keyboard.ctrl && UI.Window.keyboard.shift && e.keyCode == 80) { // ctrl+shift+P
					Import({url:"/cs/printscreen",method:"post"})
					.done(function(data) {
						data= JSON.parse(data);
						if(!data.result) {
							alert("can't");
						} else {
							alert("ok");
						}
					})
					.send();

					if(!e) var e = window.event;
					e.cancelBubble = true;
					e.returnValue = false;
					if ( e.stopPropagation ) e.stopPropagation();
					if ( e.preventDefault ) e.preventDefault();		
					return false;
				}
			});




			UI.Window.on("resize",app.resize);
			document.body.style.overflow = "hidden";
			app.resize();
			p.$.pathFileManagerServer.elementSetPacket("Server: " + context.files.server + "/");
			

			p.el.contextServerNewFile.addEventListener("click",function() {
				app.menu.dispose();
				var filename = prompt("New file name:","default");
				Import({url:"/file/touch", method:"post",data : { dir : context.files.server + "/" + filename } })
				.done(function(data) {
					data = JSON.parse(data);
					if(data.result) {
						alert("file:'" + filename + "' created!");
						refresh_server_files();
					} else {
						alert(data.msg);
					}
				})
				.send();
			});
			p.el.contextServerDirectoryDelete.addEventListener("click",function() {
				app.menu.dispose();
				var file = app.selected.path;
				if(confirm("delete directory '"+file+"'?")) {
					// delete contents first
					var requests = [];
					var files_done = []; // to rollback (?) (must implement recycle bin)
					var deleteFolderThread = setInterval(function() {
						// dispatcher
						for(var x = 0; x < requests.length;x++) {
							if(requests[x].state >0) {
								//
								clearInterval( deleteFolderThread );
								alert("error");
								// better to stop others from spawning, easier to recover
								return;
							}
						}
						var check = 0;
						for(var x = 0; x < requests.length;x++) {
							if(requests[x].done < 3) {
								check++;
							}
						}
						if(check ==0) {
							clearInterval( deleteFolderThread );
							alert("DONE from thread!");
						}
					},50);
					// easy
					function deleteFolder(path,parent,callback) {
						Import({url:"/file/dir",method:"post",data:{dir:path}})
						.done(function(data2) {
							data2 = JSON.parse(data2);
							if(data2.result) {
								var request = {};
								request.checks = 0;
								request.state = 0;
								request.path = path;
								request.jobs = 0;
								request.done = 0;
								request.test = function() {
									var s = this;
									if(s.jobs == s.checks) {
										s.done = 2;
										// remain the folder itself
										Import({url:"/file/rmdir", method:"post", data : { dir : s.path } })
										.done(function(data) {
											data = JSON.parse(data);
											if(data.result) {
												files_done.push(s.path);
												s.callback();
												s.done = 3;
											} else {
												alert(data.msg);
											}
										})
										.fail(function() {
											s.state = 4;
										})
										.send();
									}
								}
								request.callback = function() {
									callback && callback();
								}
								// mini thread of deleting files
								var dir = data2.value;
								for(var file in dir) {
									request.checks++;
								}
								if(request.checks ==0) {
									alert("directory is empty?");
									request.test();
								} else {
									requests.push(request);
									
									for(var file in dir) {
										if( dir[file] == 0 ) { // folder
											deleteFolder(file,request,function() {
												files_done.push(path);
												request.jobs += 1;
												request.test();
											},function() {
												request.state = 3;
											});
										} else if( dir[file] == 1) {
											deleteFile(file,function() {
												request.jobs += 1;
												request.test();
											},function() {
												request.state = 2;
											});
										}
									}
								} 
								
							} else {
								request.state = 1;
							}
						})
						.fail(function() {
							requests.push({
								done : 1,
								state : 1000
							})
						})
						.send();
						

					}
					function deleteFile(path,done,err) {
						Import({url:"/file/rm", method:"post", data : { dir : path } })
						.done(function(data) {
							data = JSON.parse(data);
							if(data.result) {
								files_done.push(path);
								done && done();
							} else {
								err && err();
							}
						})
						.fail(function() {
							err && err();
						})
						.send();
					}
					deleteFolder(app.selected.path,null,function() {
						alert("done from method");
						refresh_server_files();
					});
				}
			});
			p.el.contextServerFileDelete.addEventListener("click",function() {
				app.menu.dispose();
				var file = app.selected.path;
				if(confirm("delete file '"+file+"'?")) {
					Import({url:"/file/rm", method:"post", data : { dir : file } })
					.done(function(data) {
						data = JSON.parse(data);
						if(data.result) {
							// delete in use
							if( app.editor.fileSelected == file ) {
								app.editor.fileSelected = "";
								app.editor.main.setValue("");
								// disable notes too
								p.$.title.elementSetPacket("[temporary]");
								closeNotes();

							}
							alert("file:'" + unescape(file) + "' removed!");
							refresh_server_files();
						} else {
							alert(data.msg);
						}
					})
					.send();
				}
			});
			p.el.contextServerNewDirectory.addEventListener("click",function() {
				app.menu.dispose();
				var filename = prompt("New directory name:","default");
				Import({url:"/file/mkdir", method:"post", data : { dir : context.files.server + "/" + filename } })
				.done(function(data) {
					data = JSON.parse(data);
					if(data.result) {
						alert("directory:'" + filename + "' created!");
						refresh_server_files();
					} else {
						alert(data.msg);
					}
				})
				.send();
			});
			p.el.contextServerInstallWebFile.addEventListener("click",function() {
				app.menu.dispose();
				//
				// install web file -> <wizard:#webfile:path=PATH
				//		Step0: // automatically generated by system
				//			new .webfile
				//		Step1: // configure composition of js rendering
				//			new "index.js"
				//			code editor
				//		Step2: // configure window.load
				//			new "main.js"
				//			code editor
				//		Step3: // configure pages of the system
				//
				//			menu list of pages -> new <folder:page>
				//				page1	[ add page ] 
				//				page2	[ goto page file ]
				//				page3	
				//				page4
				//				page5	[ remove page ]
				//				...
				//			Step3.1 // render page with default tag which is Object JSON Path Scheme
				//

				// how to:
				//
				//		<Wizard> -> <div></div><div><WithDOMElements id='Steps'></WithDomElements></div>
				//			.add( field0, ask_string_of_file_path )
				//			.add( field1, ask_string_of_code )
				//			.add( field2, ask_string_of_date )
				//			.add( field3, ask_string_of_color)
				//			.add( field4, ask_string_of_hour )
				//			.add( field5, ask_number_of_labelled_percentage )
				//			.add( field6, ask_string_of_list )
				//			.add( field7, ask_string_of_model )
				//
				//			.submit( callback(all_data_named){ } )
				//
				//			.add( { name : "webfile:" }, { ask_string_of_file_path : 1 } )
				//			.add( { name : "window.load:" })
				//			.add( { name : "pages:" }, { ask_string_of_list } )
				//			.on(save==reload,function() {})
				//			
				//			.add( { })

				var name = prompt("app name(folder name):");
				if(name == null) return;
				var page = prompt("default page:","index");
				var fname = context.files.server + "/" + name;
				function mkdir(path,callback,err) {
					Import({ url : "/file/mkdir", method : "post", data : { dir: path } })
					.done(function(data){ data = JSON.parse(data); if(data.result) { callback&&callback(); } else { err&err(); } })
					.fail(function() { err&err(); }).send();
				}
				function touch(path,callback,err) {
					Import({ url : "/file/touch", method : "post", data : { dir: path } })
					.done(function(data){ data = JSON.parse(data); if(data.result) { callback&&callback(); } else { err&err(); } })
					.fail(function() { err&err(); }).send();
				}
				function update(path,data,callback,err) {
					Import({ url : "/file/update", method : "post", data : { file: path, data:Export.Codec.Hex(data) } })
					.done(function(data){ data = JSON.parse(data); if(data.result) { callback&&callback(); } else { err&err(); } })
					.fail(function() { err&err(); }).send();
				}
				var request = {};
				request.errors = 0;
				request.state = 0;
				function err() {
					request.errors += 1;
				}
				mkdir(fname,function() {
					mkdir(fname + "/parts",function() {
						touch(fname + "/parts/Example.js",function() {

							var _doc = [];
							_doc.push("/*");
							_doc.push("Class.define('Example',{");
							_doc.push("\tfrom : ['WithDOMElements2'],");
							_doc.push("\tctor : function() {");
							_doc.push("\t\tvar self = this;");
							_doc.push("\t\tthis.on('nodeBuild',function() {");
							_doc.push("\t\t});");
							_doc.push("\t},");
							_doc.push("\tproto: {");
							_doc.push("\t}");
							_doc.push("});");
							_doc.push("*/");
							update(fname + "/parts/Example.js",_doc.join("\r\n"),function() {
								request.state += 1;
							},err);

						});
					},err);
					mkdir(fname + "/" + page,function() {
						touch(fname + "/" + page + "/load.js",function() {
							var _doc = [];
							_doc.push("if(!this.init) {");
							_doc.push("\tthis.init = this.init || true;");
							_doc.push("\tvar app = {};");
							_doc.push("\tthis.app = app;");
							_doc.push("\tUI.Body.elementsClear();");
							_doc.push("\tvar p = app.schema = UI.Body.elementPushPacket('<div>default</div>');")
							_doc.push("} else {");
							_doc.push("}");
							update(fname + "/" + page + "/load.js",_doc.join("\r\n"),function() {
								request.state += 1;
							},err);
						},err);
						touch(fname + "/" + page + "/unload.js",function() {
							var _unload = "";
							update(fname + "/" + page + "/unload.js",_unload,function() {
								request.state += 1;
							},err);
						},err);
					},err);
					touch(fname + "/index.js",function() {
						var _load2 = [];
						_load2.push("webfile.import('/public/page/torito/js/import.js','js');");
						_load2.push("webfile.import('/public/page/torito/js/querystring.js','js');");
						_load2.push("webfile.import('/public/page/torito/js/Class.js','js');");
						_load2.push("//webfile.import(__dirname + '/parts/Example.js','js');");
						_load2.push("webfile.page('"+page+"',__dirname);");
						_load2.push("webfile.start(__dirname + '/window.load.js');");
						update(fname + "/index.js",_load2.join("\r\n"),function() {
							request.state += 1;
						},err);
					},err);
					touch(fname + "/window.load.js",function() {
						var _doc = [];
						_doc.push("//UI.Body.canSelect(false);");
						_doc.push("History.init('"+page+"');");
						update(fname + "/window.load.js",_doc.join("\r\n"),function() {
							request.state += 1;
						},err);
					},err);
				},err);
				var installWebfileThread = setInterval(function() {
					if(request.errors >0) {
						clearInterval(installWebfileThread);
						console.log("error");
						return;
					}
					if(request.state >= 5) {
						alert("done");
						refresh_server_files();
						clearInterval(installWebfileThread);
					}
					// installWebfileThread
				},500);

			});

			p.el.contextServerZipBackup.addEventListener("click",function() {
				app.menu.dispose();
				function zipFile(request) { // maybe can't download private, based on credentials
					Import({url:"/load",data:{file:request.file}})
					.done(function(data) {
						var name = request.file.split("/").pop();
						//console.log("file",request.file);
						request.zip.file(name,data);
						request.loaded = true;
						request.date2 = new Date();
					})
					.fail(function() {
						// error on zip
						request.state = 1;
					})
					.send();
				}
				var requests = [];
				var zip = new JSZip();
				var zipThread = setInterval(function() {
					for(var x = 0; x < requests.length;x++) {
						if(requests[x].state == 1) {
							// error on zip
							clearInterval(zipThread);
							requests.splice(0,requests.length);
							alert("error");
							return;
						}
					}
					for(var x = 0; x < requests.length;x++) {
						if(requests[x].loaded == false) {
							return;
						}
					}
					// ready to download
					// cancel Thread
					clearInterval(zipThread);
					zip.generateAsync({type:"blob"})
					.then(function(content) {
						// see FileSaver.js
						Download.go(content,"backup.zip");
						//saveAs(content, "example.zip");
					});
				},500);
				function zipFolder(request) {
					console.log(">>" + request.file);
					Import({url:"/file/dir",method:"post",data:{dir:escape(request.file)}})
					.done(function(data2) {
						data2 = JSON.parse(data2);
						if(data2.result) {
							for(var file in data2.value ) {
								if( data2.value[file] == 1 ) {
									var r = {
										zip : request.zip,
										file : file,
										state : 0,
										type : "file",
										loaded : false,
										date : new Date()
									};
									requests.push(r);
									zipFile(r);
								} else if(data2.value[file] == 0) {
									var name = file.split("/").pop();
									var f = request.zip.folder(name);
									var r = {
										zip : f,
										state : 0,
										file : file,
										type : "folder",
										loaded : false,
										date : new Date()
									};
									requests.push(r);
									zipFolder( r );
								}
							}
							request.loaded = true;
							request.date2 = new Date();
							//console.log("folder",request.file);
						} else {
							// error on zip
							request.state = 1;
						}
					})
					.fail(function() {
						alert("error 2 " + request.file);
						request.state = 1;
					})
					.send();
				}
				zipFolder({
					zip : zip,
					state : 0,
					file : context.files.server,
					type : "folder",
					loaded : false,
					date : new Date()
				});

			});
			p.el.contextServerZipRestore.addEventListener("change",function() {
				app.menu.dispose();
				input = p.el.contextServerZipRestore;
				if (!input) {
					alert("Um, couldn't find the fileinput element.");
				}
				else if (!input.files) {
					alert("This browser doesn't seem to support the `files` property of file inputs.");
				}
				else if (!input.files[0]) {
					alert("Please select a file before clicking 'Load'");
				}
				else {
					file = input.files[0];
					fr = new FileReader();
					/*
					console.log(" maybe folder iterating over", relativePath);
					Import({
						url : "/file/exists", method : "post", data : { path : "" }
					})
					.done(function(data) {
						data = JSON.parse(data);
						if(data.result) {
							if(data.value) {

							} else {
								// must create file
							}
						} else {

						}
					})
					.send();

					console.log(" maybe file iterating over", relativePath);
					file.async("string").then(function(data) {
						//console.log(data);
					});
					*/

					function createFolder(request,next) {
						/*
							path : relativePath,
							type : 0,
							file : file,
							checked : false
						*/
						var path = context.files.server + "/" + request.path;
						console.log("[1] folder:"+path)
						try {
							Import({
								url : "/file/exists", method : "post", data : { path : path }
							})
							.done(function(data1) {
								console.log("[2] folder:"+path)
								data1 = JSON.parse(data1);
								if(data1.result) {
									if(data1.value) {
										Import({
											url : "/file/isdirectory", method : "post", data : { path : path }
										})
										.done(function(data2){
											console.log("[3] folder:"+path)
											data2 = JSON.parse(data2);
											if(data2.result) {
												if(data2.value) {
													// ok
													alert("ok for "+path);
													request.checked = true;
													next();
												} else {
													request.state = 8;
												}
											} else {
												request.state = 7;
											}
										})
										.fail(function() {
											request.state = 6;
										})
										.send();
									} else {
										// must create file
										Import({
											url : "/file/mkdir", method : "post", data : { dir: path }
										})
										.done(function(data3){
											console.log("[4] folder:"+path)
											data3 = JSON.parse(data3);
											if(data3.result) {
												// ok
												alert("ok for "+path);
												request.checked = true;
												next();
											} else {
												request.state = 5;
											}
										})
										.fail(function() {
											request.state = 4;
										})
										.send();
									}
								} else {
									// fail
									request.state = 3;
								}
							})
							.fail(function() {
								request.state = 2;
								// fail
							})
							.send();
						} catch(e) {
							request.state = 1;
							console.log(e);
							console.log(e.stack);
						}

					}
					function createFile(request,next) {
						
						var path = context.files.server + "/" + request.path;
						console.log("[1] file:"+path)
						try {
							Import({
								url : "/file/exists", method : "post", data : { path : path }
							})
							.done(function(data1) {
								console.log("[2] file:"+path + ":"+data1)
								data1 = JSON.parse(data1);
								if(data1.result) {
									if(data1.value) {
										Import({
											url : "/file/isfile", method : "post", data : { path : path }
										})
										.done(function(data2){
											console.log("[3] path:"+path)
											data2 = JSON.parse(data2);
											if(data2.result) {
												request.file.async("string").then(function(data3) {

													Import({
														url : "/file/update", method : "post", data : { file : path, data : Export.Codec.Hex(data3) }
													})
													.done(function(data4){
														console.log("[4] file:"+path)
														data4 = JSON.parse(data4);
														if(data4.result) {
															// ok next
															alert("ok for "+path);
															request.checked = true;
															next();
														} else {
															// fail
															request.state = 11;
														}
													})
													.fail(function() {
														// fail
														request.state = 10;
													})
													.send();

												});
											} else {
												// fail
												request.state = 9;
											}
										})
										.fail(function() {
											// fail
											request.state = 8;
										})
										.send();
									} else {
										// must create file
										Import({
											url : "/file/touch", method : "post", data : { dir : path }
										})
										.done(function(data5){
											console.log("[5] file:"+path)
											data5 = JSON.parse(data5);
											if(data5.result) {

												request.file.async("string").then(function(data6) {

													Import({
														url : "/file/update", method : "post", data : { file : path, data : Export.Codec.Hex(data6) }
													})
													.done(function(data7){
														console.log("[6] file:"+path)
														data7 = JSON.parse(data7);
														if(data7.result) {
															// ok next
															alert("ok for "+path);
															request.checked = true;
															next();
														} else {
															// fail
															request.state = 7;
														}
													})
													.fail(function() {
														// fail
														request.state = 6;
													})
													.send();

												});

											} else {
												// fail
												request.state = 5;
											}
										})
										.fail(function() {
											// fail
											request.state = 4;
										})
										.send();
									}
								} else {
									// fail
									request.state = 3;
								}
							})
							.fail(function() {
								// fail
								request.state = 2;
							})
							.send();
						} catch(e) {
							request.state = 1;
							console.log(e);
							console.log(e.stack);
						}
					}
					var _ri = 0;
					var _requests = [];
					function startRestore(callback) {
						function next() {
							if(_ri < _requests.length) {
								var req = _requests[_ri++];
								if(req.type == 0) {
									createFolder(req,next);
								} else if(req.type == 1) {
									createFile(req,next);
								}
							} else {
								// finalized request,
								_requests.splice(0,_requests.length);
								_ri = 0;
								callback && callback();
							}
						}
						var restoreThread = setInterval(function() {
							console.log("restoreThred",_requests.length);
							for(var x = 0; x < _requests.length;x++) {
								if(_requests[x].state > 0) {
									console.log(_requests[x].state);
									clearInterval(restoreThread);
									alert("error " + _requests[x].state);
									return;
								}
							}
							for(var x = 0; x < _requests.length;x++) {
								if(!_requests[x].checked) {
									return;
								}
							}
							clearInterval(restoreThread);
							alert("restore is done.(1)");
						},1000);
						next();
					}
					fr.onload = function() {
						result = fr.result;
						try {
							var zip = new JSZip();
							zip
							.loadAsync(result)
							.then(function(zip) {
								zip.forEach(function (relativePath, file){
									if( relativePath.charAt(relativePath.length-1) == "/") {
										_requests.push({
											path : relativePath,
											type : 0,
											file : file,
											checked : false,
											state : 0,
										});
									} else {
										_requests.push( {
											path : relativePath,
											type : 1,
											file : file,
											checked : false,
											state : 0
										});
									}
								});
								startRestore(function() {
									refresh_server_files();
									alert("restore done!(2)");
								});
							});
						} catch(e) {
							console.log(e);
							console.log(e.stack);
						}
						p.el.contextServerZipRestore.value = "";
					}
					fr.readAsBinaryString(file);
				}
			});
			p.el.contextServerUploadFile.addEventListener("change",function() {
				app.menu.dispose();
				input = p.el.contextServerUploadFile;
				if (!input) {
					alert("Um, couldn't find the fileinput element.");
				}
				else if (!input.files) {
					alert("This browser doesn't seem to support the `files` property of file inputs.");
				}
				else if (!input.files[0]) {
					alert("Please select a file before clicking 'Load'");
				}
				else {
					file = input.files[0];
					var tryname = file.name;
					var oname = file.name;
					var DirectoryFiles = app.menu.Server.currentNames;
					var check = false;
					var code = 0;
					for(var x = 0; x < DirectoryFiles.length;x++) {
						if(DirectoryFiles[x] == tryname) {
							check = true;
							break;
						}
					}
					var renamed_alert = false;
					if(check) {
						var t = tryname.split(".");
						var ext = t.pop();
						t = t.join(".");
						while(check) {
							var check2 = false;
							for(var x = 0; x < DirectoryFiles.length;x++) {
								if(DirectoryFiles[x] == t + "(" + code + ")" + "." + ext) {
									check2 = true;
									break;
								}
							}
							if(check2) {
								code += 1;
								continue;
							}
							break;
						}
						renamed_alert = true;
						tryname = t + "(" + code + ")" + "." + ext;
						
					}
					alert(tryname);
					fr = new FileReader();
					fr.onload = function() {
						var markup, m2, result, n, aByte, byteStr;
						markup = [];
						m2 = [];
						result = fr.result;
						console.log(result.length);

						(function(result) {
							var __workerInstance_id = 0;
							
							function WorkerInstance(url) {
								var t = this;
								this.id = __workerInstance_id++;
								this.instance = new Worker(url);
								this.data = {};
								var __request_id = 0;
								this.instance.onmessage = function(e) {
									t.data[ e.data.path + ":" + e.data.id ].callback.apply(null,[e.data.value]);
									delete t.data[ e.data.path + ":" + e.data.id ];
								}
								this.request = function(path,args,callback) {
									var id = __request_id++;
									t.data[path + ":" + id] = { callback : callback }
									t.instance.postMessage.apply(t.instance,[{id:id, path:path,args:args}]);
								}
							}
							
							var blob = new Blob(["(" + 
								function() {
									var storage = {
										"echo" : function(msg) {

											var str = msg;
											var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
											var sb = [];
											for(var x = 0; x < str.length;x++) {
												var code = str.charCodeAt(x);
												sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
											}
											return sb.join("");

										},
										"close" : function() {
											self.close();
										}
									}
									function resolve(path) {
										path = path.split("/");
										if(!(path[0] in storage)) {
											return function() {
												return 0; // error
											}
										}
										var p = storage[path[0]];
										for(var x = 1; x < path.length;x++) {
											if(!(path[x] in p)) {
												return function() {
													return 0; // error
												}
											} else {
												p = p[ path[x] ];
											}
										}
										return p;
									}
									self.addEventListener('message', function(e) {
										var id = e.data.id;
										var path = e.data.path;
										var args = e.data.args;
										var result = resolve(path).apply(null,args);
										self.postMessage({
											id : id,
											path : path,
											value : result
										});
									}, false);

								}.toString()
							+ ")();"], {type: "text/javascript"});
							var blobURL = URL.createObjectURL(blob);
							var worker2 = new WorkerInstance(blobURL);
							URL.revokeObjectURL(blobURL);
							worker2.request("echo",[result],function(file){
								console.log("??",file.length);
								Import({url:"/file/touch", method:"post", data : { dir : context.files.server + "/" + tryname } })
									.done(function(data) {
										data = JSON.parse(data);
										if(data.result) {
											Import({url:"/file/update",method:"post",data:{ data : file, file : context.files.server + "/" + tryname } })
												.done(function(response) {
													if(renamed_alert) {
														alert("file:'" + oname + "' uploaded and renamed to '" + tryname + "' !");

													} else {
														alert("file:'" + tryname + "' uploaded!");
													}
													p.el.contextServerUploadFile.value = "";
													refresh_server_files();
													//window.location.reload();
												})
												.send();
										} else {
											alert(data.msg);
										}
									})
									.send();
								worker2.request("close",[],function() {
									console.log("end.");
								});
							});
						})(result);

					};
					fr.readAsBinaryString(file);
				}
			});
			function setContext(target,name,args) {
				target.addEventListener("mouseup",function(event) {
					app.selected = {};
					for(var key in args) {
						app.selected[key] = args[key];
					}
					if(event.button == 0) {
						if(UI.Window.keyboard.ctrl) {
							//window.open("/#manage:system=files","_blank");
						} else {
							if(name == "Server") {
								if(app.menu.Server.visibility) {
									self.server_files_innerplaceholder.$.elementsClear();
									app.menu.Server.visibility = false;
								} else {
									refresh_server_files();
									app.menu.Server.visibility = true;
								}
							} else if(name == "ServerFile") {
								
								
							} else if(name == "ServerDirectory") {
								
							}
						}
					}
					
					if(event.button == 2) {
						
						var obj = p.el["context" + name];
						obj.style.position = "absolute";
						obj.style.left = (mousePos.x-10) + "px";
						obj.style.top = (mousePos.y-10) + "px";
						obj.style.display = "";
						cancelCmnu = 1;
						app.menu.dispose = function() {
							obj.style.display = "none";
							cancelCmnu = 0;
						}
						obj.addEventListener("mouseleave",function() {
							app.menu.dispose();
						});

					}
				});
			}
			p.$.title.elementSetPacket("[temporary]");
			var t = p.$.dir.elementPush("dir_table","table",{
				attribs : {
					width : "100%",
					cellpadding : "0",
					cellspacing : "0"
				}
			});
			self.table = t;
			self.server_files_placeholder = t.$.elementPush("WithDOMElements2");
			function saveFile() {
				// fileSelected is used because app.selected.path confuse with context menu use.
				if(app.editor.fileSelected!="") {
					
					Import({method:"post",url:"/file/update", data:{ data : Export.Codec.Hex(app.editor.main.getValue()), file : escape(app.editor.fileSelected) } })
						.done(function(response) {
							alert(response);
							UI.Window.keyboard.ctrl = false;
						})
						.send();
				} else {
					// choose path to save
					alert("todo, save a temporary file.");
				}
			};
			function compileFile() { // createServerRoute on this code
				if(app.editor.fileSelected!="") {
					var ext = app.editor.fileSelected.split(".").pop();
					// uniform model is not possible due to compiler flags of each code
					// a json model to input is desireable
					function _result(data) {
						data = JSON.parse(data);
						if(data.result) {
							alert(data.msg);
							// a json model to output is desireable
						} else {
							alert("error");
							alert(data.msg);
						}
					}
					var _code = Export.Codec.Hex(app.editor.main.getValue());
					if( ext == "cs" ) {
						var _type = prompt("type (exe|winexe)","exe");
						Import({method:"post",url:"/compiler/cs", data : { data : _code, type : _type } }).done(_result).send();
					} else if(ext == "java") {
						Import({method:"post",url:"/compiler/java", data : { data : _code } }).done(_result).send();
					} else if(ext == "c") {
						Import({method:"post",url:"/compiler/c", data : { data : _code } }).done(_result).send();
					} else if(ext == "cpp") {
						Import({method:"post",url:"/compiler/cpp", data : { data : _code } }).done(_result).send();
					} else if(ext == "js") {
						Import({method:"post",url:"/compiler/node", data : { data : _code } }).done(_result).send();
					} else if(ext == "py") {
						Import({method:"post",url:"/compiler/py", data : { data : _code } }).done(_result).send();
					} else if(ext == "go") {
						Import({method:"post",url:"/compiler/go", data : { data : _code } }).done(_result).send();
					}
				}
			}
			function refresh_all_files() {
				refresh_server_files();
				

			}
			function openNotes() {
				var titleHeight = 0;
				var adjust = 16;
				p.el.notesContainer.style.top = (window.innerHeight - 57 - ((window.innerHeight - 40 - titleHeight-70-50)) + adjust ) + "px";
				var height = (38 + ((window.innerHeight - 40 - titleHeight-70-50)) - adjust );
				p.el.notesContainer.style.height = height + "px";
				p.el.notesData.style.height = (height-50)+"px";
				p.el.notesData.style.border = "solid 1px #f00";
				p.el.notesData.style.overflowY = "auto";
				p.el.notesData.style.display = "";

				if(app.notes.id == "") {
					if(app.editor.fileSelected !="") {
						loadNotes(app.editor.fileSelected);
					}
				} else {
					var context = {
						args : {
							view : "interact",
							id : app.notes.id
						}
					};
					p.$.appNotes.elementsClear();
					p.$.appNotes.init(context);
				}
				// load notes
				app.notes.active = true;
			}
			function closeNotes() {
				p.el.notesContainer.style.top = (window.innerHeight - 57) + "px";
				p.el.notesContainer.style.height = "38px";
				p.$.notesData.elementsClear();
				p.el.notesData.style.display = "none";
				app.notes.active = false;
			}
			p.el.notesTitle.addEventListener("click",function() {
				if(!app.notes.active) {
					openNotes();
				} else {
					closeNotes();
				}
			});
			function loadNotes(path) {
				
				Import({url:"/notes/create",method:"post",data:{
					title : "file",
					reference : path
				}})
				.done(function(data) {
					
					data = JSON.parse(data);
					if(data.result) {
						app.notes.id = data.id;
						app.notes.cache[path] = data.id;

						var context = {
							args : {
								view : "interact",
								id : data.id
							}
						};
						p.$.appNotes.elementsClear();
						p.$.appNotes.init(context);

					} else {
						alert("failed to create a note.");
					}
				})
				.send();
				
			}
			function loadFileOnEditor(path) {
				var ext = path.split(".").pop();
				p.$.title.elementSetPacket(path);
				// make view register of file format

				if(ext == "mp4") {
					
					p.el.editor.style.display = "none";
					p.el.view.style.backgroundColor = "#000";
					p.el.view.style.display = "flex";
					p.el.view.style.justifyContent = "center";
					p.el.view.style.alignItems = "center";
					p.el.view.style.overflow = "hidden";
					var p2 = p.$.view.elementSetPacket(
						"<div style='position:relative;border:solid 1px #000;margin:5px;width:100%;height:100%;'>"+
							"<video id='video' style='display:flex;width:100%;height:100%;' controls autoplay preload=\"auto\">"+
								"<source src='/load?file=" + escape(path) + "' type='video/mp4'/>"+
							"</video>"+
						"</div>"
					);
					loadNotes(path);

				} else if(ext == "mp3" || ext == "wav") {

					
					p.el.editor.style.display = "none";
					p.el.view.style.backgroundColor = "#000";
					p.el.view.style.display = "flex";
					p.el.view.style.justifyContent = "center";
					p.el.view.style.alignItems = "center";
					p.el.view.style.overflow = "hidden";
					
					var p2 = p.$.view.elementSetPacket(
						"<div style='position:relative;'><audio controls autoplay preload=\"auto\"><source src='/load?file=" + escape(path) + "' type='audio/mpeg'/></audio></div>"
					);
					var vw = parseInt( p.el.view.style.width );
					var vh = parseInt( p.el.view.style.height );
					loadNotes(path);
					
				} else if(ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "svg" || ext == "png") {

					//p.el.view.style.display = "";
					p.el.editor.style.display = "none";
					p.el.view.style.backgroundColor = "#000";
					p.el.view.style.display = "flex";
					p.el.view.style.justifyContent = "center";
					p.el.view.style.alignItems = "center";
					p.el.view.style.overflow = "hidden";
					// readme.innerHTML = "<center><img src='" + file + "' height="+parseInt(height)+"/></center>";
					var p2 = p.$.view.elementSetPacket(
						"<div style='position:relative;'><img id='image' src='/load?file="+escape(path)+"' style='cursor:move;'/></div>"+
						"<div id='controls' style='font-size:20px;'>"+
							"<div>fit to screen</div>"+
							"<div>"+
								"<div>zoom</div>"+
								"<div><input type='range' id='zoomRange' min='10' max='500' value='100'/></div>"+
							"</div>"+
						"</div>"
					);
					var vw = parseInt( p.el.view.style.width );
					var vh = parseInt( p.el.view.style.height );
					p2.el.controls.style.position = "absolute";
					p2.el.controls.style.left = "0px";
					p2.el.controls.style.top = (vh - 200) + "px";
					p2.el.controls.style.width = "200px";
					p2.el.controls.style.height = "200px";
					p2.el.controls.style.backgroundColor = "red";
					var offset = [0,0];
					var cursorStart = [-1,-1];
					p2.el.image.addEventListener("load",function() {
						var sz = [p2.el.image.width,p2.el.image.height];
						p2.el.zoomRange.addEventListener("change",function() {
							p2.el.image.setAttribute("width", parseInt( sz[0] * p2.el.zoomRange.value/ 100 ) );
							p2.el.image.setAttribute("height", parseInt( sz[1] * p2.el.zoomRange.value/ 100 ) );
						});
					});
					p2.el.image.addEventListener("mousedown",function(e) {

					});
					p2.el.image.addEventListener("mousemove",function(e) {

					});
					p2.el.image.addEventListener("mouseup",function(e) {

					});
					loadNotes(path);
				} else {
					p.el.editor.style.display = "";
					p.el.view.style.display = "none";
					
					Import({url:"/load",data:{file:escape(path)}})
					.done(function(data) {
						
						if(app.editor.main) {
							
							
							var MODES = (function() {
								var modesIds = monaco.languages.getLanguages().map(function(lang) { return lang.id; });
								modesIds.sort();

								return modesIds.map(function(modeId) {
									return {
										modeId: modeId,
									};
								});
							})();
							
							var oldModel = app.editor.main.getModel();
							app.editor.fileSelected = path;
							loadNotes(path);

							var arr = [
								["js","cs","py","xml","html","json","php","c","cpp","java","go"],
								["javascript","csharp","python"]
							]
							var p = arr[0].indexOf(ext);
							var _type = "plaintext"
							if(p != -1) _type = p < arr[1].length ? arr[1][p] : arr[0][p];
							var newModel = monaco.editor.createModel(data, _type);
							app.editor.main.setModel(newModel);

							
							if (oldModel) oldModel.dispose();
							app.editor.loadPositions();
							app.editor.main.focus();

							var url = "" + window.location;
							url = url.split("#");
							url.shift();
							url = url.join("#");
							localStorage.setItem("manage.files.lastFile","#" + url);

							// set file to load on main menu
							// add to recently used files
						}
						
					})
					.send();
				}
				
			}
			function refresh_server_file(placeholder,path,folder) {
				//var id = "__dir" + count;
				
				//arr[path] = id;
				var tr = placeholder.$.elementPush("tr_"+path,"tr");
				var td = tr.$.elementPush("td_"+path,"td",{
					class : { add : ["borderBottom"] }
				});
				if(folder) {
					td.$.elementSetPacket(unescape(path).substring(unescape(context.files.server).length+1));
					BrowserTools.setStyle(td.el,{
						class : { add : "button" },
						events : {
							click : function() {
								// change context.files.server to path
								if(UI.Window.keyboard.ctrl) {
									window.open("/#manage:system=files&server="+path,"_blank");
								} else {
									context.files.server = path;
									History.go("#manage:system=files&server="+path);
									return;
								}
								
							}
						}
					});
					setContext(td.el,"ServerDirectory",{ sourceType: "server", folder : true, path : path});
				} else {
					td.$.elementSetPacket(unescape(path).substring(unescape(context.files.server).length+1));
					BrowserTools.setStyle(td.el,{
						class : { add : "button2" },
						events : {
							click : function() {
								app.editor.savePositions();
								
								if(UI.Window.keyboard.ctrl) {
									console.clear();
									window.open("/#manage:system=files&server="+path,"_blank");
								} else {
									History.go("#manage:system=files&server="+path);
									return;
								}
							}
						}
					});
					setContext(td.el,"ServerFile",{ sourceType : "server", folder: false, path : path });
				}
			}
			function refresh_server_files_from_server(data) {
				var arr = {};
				var count = 1;
				self.server_files_placeholder.$.elementsClear();
				
				var links = [];
				for(var file in data) {
					var ext = file.split(".").pop();
					if(ext == "link") {
						var item = file.split(".");
						item.pop();
						links.push(item.join("."));
					}
				}
				for(var x = 0; x < links.length;x++) {
					data[links[x]] = 0;
				}
				var tr = self.server_files_placeholder.$.elementPush("tr_"+file,"tr");
				var td = tr.$.elementPush("td_"+file,"td",{
					class : { add : ["groupDir","borderBottom"] }
				});
				td.el.style.display = "flex";
				td.el.style.cursor = "default";
				td.$.elementSetPacket("<span style='flex:1;'>Server</span><span style='font-size:10px;'>(context menu)</span>");
				setContext(td.el,"Server",{ sourceType : "server", folder : true, path : "." });
				
				
				self.server_files_innerplaceholder = self.server_files_placeholder.$.elementPush("WithDOMElements2");
				
				//alert("@:"+context.files.server);
				if(context.files.server == "./") context.files.server = ".";
				//alert("@:"+context.files.server);
				var parts = context.files.server.split("/");
				

				

				if(parts.length > 1 && context.files.server!="./") {
					var tr = self.server_files_placeholder.$.elementPush("tr_"+file,"tr");
					var td = tr.$.elementPush("td_"+file,"td",{
						class : { add : ["button3","borderBottom"] },
						events : {
							click : function() {
								parts.pop();
								
								var npath = parts.join("/");
								context.files.server = npath;
								History.go("#manage:system=files&server="+npath);
								return;
								//p.$.pathFileManagerServer.elementSetPacket("Server: " + context.files.server + "/");
								//refresh_server_files();
								
							}
						}
					});
					td.$.elementSetPacket("..");
				}
				
				
				
				self.server_files_innerplaceholder = self.server_files_placeholder.$.elementPush("WithDOMElements2");
				
				// clear
				app.menu.Server.currentNames.splice(0,app.menu.Server.currentNames.length);

				var folders = [];
				var nfolders = [];
				for(var file in data) {
					if(data[file] == 0) folders.push(file);
					if(data[file] != 0) nfolders.push(file);

					app.menu.Server.currentNames.push(file.substring( context.files.server.length+1 ));
				}
				folders.sort();
				nfolders.sort();
				for(var file in folders) {
					refresh_server_file(self.server_files_innerplaceholder,folders[file], !!!data[file]);
					count += 1;
				}
				for(var file in nfolders) {
					
					refresh_server_file(self.server_files_innerplaceholder,nfolders[file], data[file]);
					count += 1;
				}
				
			}
			app.codeEditorLoading = false;
			function loadEditor(callback) {
				if(!app.editor.loaded) {
					//alert("LOAD EDITOR 1");
					if(!app.codeEditorLoading) {
						app.codeEditorLoading = true;
						require(['vs/editor/editor.main'], function() {
							app.editor.main = monaco.editor.create(p.el.editor, {
								value: "",
								language: "javascript"
							});
							// app.editor.main.getModel()._options.tabSize = 4;
							// app.editor.main.getModel().updateOptions({ tabSize: 4 })

							app.editor.main.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
								saveFile();
							});
							app.editor.main.addCommand(monaco.KeyCode.F5, function() {
								compileFile();
							});
							app.editor.main.onKeyDown(function() {
								app.editor.savePositions();
							});
							app.editor.main.onMouseDown(function() {
								app.editor.savePositions();
							});

							
							app.editor.loaded = true;
							app.resize();
							//alert("LOAD EDITOR 2");
							
							callback && callback();
							
						});
					}
				} else {
					
					callback && callback();
				}
			}
			
			var running = false;
			function refresh_server_files() {
				if(!running) {
					running = true;
					//alert("LOADING SERVER FILES AT :"+context.files.server);
					Import({url:"/file/dir", method:"post",data:{dir : context.files.server }})
					.done(function(data) {
						data = JSON.parse(data);
						
						if(data.result) {
							p.$.pathFileManagerServer.elementSetPacket("Server: " + context.files.server + "/");
							refresh_server_files_from_server(data.value);
							//alert("PRELOAD 1");
							loadEditor(function(){});
							running = false;
						} else {
							var original = context.files.server;
							var fpath = context.files.server;
							var parts = context.files.server.split("/");
							var filename = parts.pop();
							context.files.server = parts.join("/");
							if(context.files.server == "") context.files.server = ".";
							
							
							Import({url:"/file/dir",method:"post",data:{dir:context.files.server}})
							.done(function(data2) {
								data2 = JSON.parse(data2);
								if(data2.result) {

									p.$.pathFileManagerServer.elementSetPacket("Server: " + context.files.server + "/");
									refresh_server_files_from_server(data2.value);
									//alert("PRELOAD 2" + "\r\n" + original + "\r\n"  + context.files.server + "\r\n" + JSON.stringify(data));
									loadEditor(function() {
										if(fpath!="." && fpath!="") {
											
											app.selected = {};
											var args = { sourceType : "server", folder : false, path : fpath };
											for(var key in args) { app.selected[key] = args[key]; }
											loadFileOnEditor(fpath);
											running = false;
										}
									});
								} else {
									alert("NOT FOUND.");
									return;
								}
							})
							.send();
							
						}
					})
					.fail(function() {
						var original = context.files.server;
						var fpath = context.files.server;
						var parts = context.files.server.split("/");
						var filename = parts.pop();
						context.files.server = parts.join("/");
						if(context.files.server == "") context.files.server = ".";
						
						
						Import({url:"/file/dir",method:"post",data:{dir:context.files.server}})
						.done(function(data2) {
							data2 = JSON.parse(data2);
							if(data2.result) {

								p.$.pathFileManagerServer.elementSetPacket("Server: " + context.files.server + "/");
								refresh_server_files_from_server(data2.value);
								//alert("PRELOAD 2" + "\r\n" + original + "\r\n"  + context.files.server + "\r\n" + JSON.stringify(data));
								loadEditor(function() {
									if(fpath!="." && fpath!="") {
										
										app.selected = {};
										var args = { sourceType : "server", folder : false, path : fpath };
										for(var key in args) { app.selected[key] = args[key]; }
										loadFileOnEditor(fpath);
										running = false;
									}
								});
							} else {
								alert("NOT FOUND.");
								return;
							}
						})
						.send();
					})
					.send();
				}
			
			}
			
			
			refresh_all_files();
			this.hide = function() {
				p.el.app_filemanager.style.display = "none";
				//this.emit("hide");
				app.editor.savePositions();
			}
			this.show = function(context) {
				p.el.app_filemanager.style.display = "";
				refresh_server_files();
			}
			
		}
	}
});