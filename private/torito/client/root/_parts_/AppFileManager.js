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
									visibility : true
								}
								
							},
							editor : {
								fileSelected : "",
								loaded : false,
								main : null
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
								editor.style.position = "absolute";
								editor.style.left = "0px";
								editor.style.top = titleHeight+20 + "px";
								editor.style.width = (window.innerWidth - (menu_width + 30))  + "px";
								editor.style.height = (window.innerHeight - 40 - titleHeight-70-50) + "px";

								
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

								if(!app.notes.active) {

								} else {

								}

								if(app.editor.loaded) { app.editor.main.layout(); }
							}
						};
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
								Import({url:"/file/rmdir", method:"post", data : { dir : file } })
								.done(function(data) {
									data = JSON.parse(data);
									if(data.result) {
										alert("directory:'" + file + "' removed!");
										refresh_server_files();
									} else {
										alert(data.msg);
									}
								})
								.send();
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
								var str = app.editor.main.getValue();
								var dict = { 0 : "0", 1 : "1", 2 : "2", 3 : "3", 4 : "4", 5 : "5", 6 : "6", 7 : "7", 8: "8", 9 : "9", 10 : "A", 11 : "B", 12 : "C" , 13 : "D", 14 : "E", 15 : "F" };
								var sb = [];
								for(var x = 0; x < str.length;x++) {
									var code = str.charCodeAt(x);
									sb.push( dict[ (0xF0 & code) >> 4 ] + dict[ 0xF & code ]  );
								}
								alert("save");
								Import({method:"post",url:"/file/update", data:{ data : sb.join(""), file : escape(app.editor.fileSelected) } })
									.done(function(response) {
										
										
										alert(response);
										UI.Window.keyboard.ctrl = false;
									})
									.send();
							}
						};
						function refresh_all_files() {
							refresh_server_files();
							

						}
						p.el.notesTitle.addEventListener("click",function() {
							if(!app.notes.active) {
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
							} else {
								p.el.notesContainer.style.top = (window.innerHeight - 57) + "px";
								p.el.notesContainer.style.height = "38px";
								p.$.notesData.elementsClear();
								p.el.notesData.style.display = "none";
								app.notes.active = false;
							}
							
						});
						function loadNotes(path) {
							if(!(path in app.notes.cache)) {
								Import({url:"/notes/create",method:"post",data:{
									title : "file",
									reference : path
								}})
								.done(function(data) {
									alert("/note/create\r\n" + data);
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
							} else {
								var id = app.notes.cache[path];
								app.notes.id = id;

								var context = {
									args : {
										view : "interact",
										id : id
									}
								};
								p.$.appNotes.elementsClear();
								p.$.appNotes.init(context);

							}
						}
						function loadFileOnEditor(path) {
							Import({url:"/load",data:{file:escape(path)}})
							.done(function(data) {
								
								
								p.$.title.elementSetPacket(path);
								
								if(app.editor.main) {
									
									var ext = path.split(".").pop();
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

									if(ext == "xml") {
										var newModel = monaco.editor.createModel(data, "xml");
										app.editor.main.setModel(newModel);
									} else if(ext == "html") {
										var newModel = monaco.editor.createModel(data, "html");
										app.editor.main.setModel(newModel);
									} else if(ext == "js") {
										var newModel = monaco.editor.createModel(data, "javascript");
										app.editor.main.setModel(newModel);
									} else if(ext == "json") {
										var newModel = monaco.editor.createModel(data, "json");
										app.editor.main.setModel(newModel);
									} else if(ext == "php") {
										var newModel = monaco.editor.createModel(data, "php");
										app.editor.main.setModel(newModel);
									} else {
										var newModel = monaco.editor.createModel(data, "plaintext");
										app.editor.main.setModel(newModel);
									}
									
									if (oldModel) {
										oldModel.dispose();
									}
									
								}
								
							})
							.send();
							
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
							td.$.elementSetPacket("Server");
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
							
							
							var folders = [];
							var nfolders = [];
							for(var file in data) {
								if(data[file] == 0) folders.push(file);
								if(data[file] != 0) nfolders.push(file);
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
										app.editor.main.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
											saveFile();
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
								.send();
							}
						
						}
						
						
						refresh_all_files();
						this.hide = function() {
							p.el.app_filemanager.style.display = "none";
						}
						this.show = function(context) {
							//alert("SHOW");
							p.el.app_filemanager.style.display = "";
							refresh_server_files();
						}
						
					}
				}
			});