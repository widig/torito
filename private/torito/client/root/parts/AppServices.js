/*
	services :
		what to list?
			clean temporary files
			active on () -> ping
			...
	macro:
		vm -> start an array
	default view (on click services contextmenu):
	services:
		-> home
			-> ping of how many loops it is in.
			-> services running
		-> install service

		-> start service
		-> stop service
		-> configuere (click)
			interval
			code 
				stable (lock code)
				notes
		-> uninstall
	macro:
		-> new script
		-> delete script
	routes:
		/service/list
		/service/install (name,interval,code)
		/service/uninstall
		/service/configure (interval, code)
		/service/start
		/service/stop
*/
Class.define("AppServicesIntervalInput",{
	from : ["WithDOMElements2"],
	ctor : function() {
		var self = this;
		self.value = [0,1,0,0];
		this.on("nodeBuild",function() {
			var p = this.elementSetPacket("<div id='select' style='width:200px;padding:10px;background-color:white;color:black;border:solid 1px #000;'>1min</div><div id='contextMenu' style='position:relative;'></div>");
			this.container = p;
			p.el.select.addEventListener("click",function() {
				var _value = [0,0,0,0];
				var p2 = p.$.contextMenu.elementSetPacket(
					"<div id='contextMenuContainer' style='position:absolute;left:0px;top:5px;padding:10px;border:solid 1px #000;width:300px;z-index:1000;background-color:white;'>" + 
						"<div style='display:flex;'>"+
							"<div id='btn1sec' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 1sec</div>"+
							"<div id='btn5sec' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 5sec</div>"+
							"<div id='btn10sec' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 10sec</div>"+
						"</div>"+
						"<div style='display:flex;'>"+
							"<div id='btn1min' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 1min</div>"+
							"<div id='btn5min' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 5min</div>"+
							"<div id='btn10min' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 10min</div>"+
						"</div>"+
						"<div style='display:flex;'>"+
							"<div id='btn1h' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 1h</div>"+
							"<div id='btn2h' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 2h</div>"+
							"<div id='btn6h' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 6h</div>"+
						"</div>"+
						"<div style='display:flex;'>"+
							"<div id='btn1d' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 1d</div>"+
							"<div id='btn2d' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 2d</div>"+
							"<div id='btn7d' style='width:80px;margin:5px;border:solid 1px #000;padding:5px;'>+ 7d</div>"+
						"</div>" +
						"<div style='display:flex;justify-content:flex-end;'>"+
							"<div id='btnreset' style='margin:5px;border:solid 1px #000;padding:5px;'>reset</div>"+
							"<div id='btnok' style='margin:5px;border:solid 1px #000;padding:5px;'>ok</div>"+
						"</div>"+
					"</div>"
				);
				function reset() {
					p.$.select.elementSetPacket("0 sec");
					_value = [0,0,0,0];
				}
				function _set() {
					if( _value[0] != 0 || _value[1] != 0 || _value[2] != 0 || _value[3] != 0) {
						var sb = [];
						if(_value[3] != 0) {
							sb.push( _value[3] + "d");
						}
						if(_value[2] != 0) {
							sb.push( _value[2] + "h");
						}
						if(_value[1] != 0) {
							sb.push( _value[1] + "min");
						}
						if(_value[0] != 0) {
							sb.push( _value[0] + "sec");
						}
						p.$.select.elementSetPacket(sb.join(" "));
					} else {
						p.$.select.elementSetPacket("0 sec");
					}
				}
				var state = 0;
				p2.el.contextMenuContainer.addEventListener("mouseenter",function() {
					state = 1;
				});
				p2.el.contextMenuContainer.addEventListener("mouseleave",function() {
					if(state == 1) {
						_value = self.value;
						_set();
						p2.el.contextMenuContainer.style.display = "none";
					}
				});
				p2.el.btnok.addEventListener("click",function() {
					self.value = _value;
					_set();
					p2.el.contextMenuContainer.style.display = "none";
				});
				p2.el.btnreset.addEventListener("click",function() {
					_value = [0,0,0,0];
					_set();
				});
				function setBtn(t) {
					t.addEventListener("mouseover",function() {
						t.style.cursor = "pointer";
						t.style.backgroundColor = "black";
						t.style.color = "white";
					});
					t.addEventListener("mouseout",function() {
						t.style.backgroundColor = "white";
						t.style.color = "black";
					});
				}
				for(var i in p2.el) {
					if( i.indexOf("btn") == 0) {
						setBtn(p2.el[i]);
					}
				}
				p2.el.btn1sec.addEventListener("click",function() { _value[0] += 1; _set(); });
				p2.el.btn5sec.addEventListener("click",function() { _value[0] += 5; _set(); });
				p2.el.btn10sec.addEventListener("click",function() { _value[0] += 10; _set(); });

				p2.el.btn1min.addEventListener("click",function() { _value[1] += 1; _set(); });
				p2.el.btn5min.addEventListener("click",function() { _value[1] += 5; _set(); });
				p2.el.btn10min.addEventListener("click",function() { _value[1] += 10; _set(); });

				p2.el.btn1h.addEventListener("click",function() { _value[2] += 1; _set(); });
				p2.el.btn2h.addEventListener("click",function() { _value[2] += 2; _set(); });
				p2.el.btn6h.addEventListener("click",function() { _value[2] += 6; _set(); });

				p2.el.btn1d.addEventListener("click",function() { _value[3] += 1; _set(); });
				p2.el.btn2d.addEventListener("click",function() { _value[3] += 2; _set(); });
				p2.el.btn7d.addEventListener("click",function() { _value[3] += 7; _set(); });
			});

		});
	}, proto : {
		setValue : function(sec) {
			var s = sec % 60;
			var m1 = ( sec - s ) / 60;
			var m2 = m1 % 60;
			var h1 = ( m1 - m2 ) / 60;
			var h2 = h1 % 24;
			var d1 = ( h1 - h2 ) / 24;
			var _value = this.value = [ s , m2, h2, d1];
			if( _value[0] != 0 || _value[1] != 0 || _value[2] != 0 || _value[3] != 0) {
				var sb = [];
				if(_value[3] != 0) {
					sb.push( _value[3] + "d");
				}
				if(_value[2] != 0) {
					sb.push( _value[2] + "h");
				}
				if(_value[1] != 0) {
					sb.push( _value[1] + "min");
				}
				if(_value[0] != 0) {
					sb.push( _value[0] + "sec");
				}
				this.container.$.select.elementSetPacket(sb.join(" "));
			} else {
				this.container.$.select.elementSetPacket("0 sec");
			}

		},
		valueOf : function() {
			var v = this.value;
			return v[0] + v[1]*60 + v[2]*60*60 + v[3]*60*60*24;
		}
	}
});


Class.define("AppServices",{
	from : ["WithDOMElements2"],
	ctor : function() {
	},
	proto : {
		init : function(context) {
			var i = this.internal.AppServices.data = {};
			this.table = null;
			var self = this;
			var p = context.serverContainer.$.main_element.$.elementPushPacket("all",
				"<div id='app_services' class='app_filemanager'>"+
					"<div id='menuServices' class='menuServices'>"+
						"<div class='menuServicesTitle'>Services</div>"+
						"<div id='menuServicesContents' class='menuServicesContents'>"+
							"<div id='dir' style='font-size:14px;'></div>"+
						"</div>"+
					"</div>"+
					"<div id='containerServicesEditor' class='containerServicesEditor'>"+
						"<div id='title' style='background-color:#008;padding:10px;'>teste</div>"+
						"<div id='editor' style='background-color:#fff;color:#000;'></div>"+
						"<div id='view' style='background-color:black;display:none;'></div>" +
					"</div>"+
					"<div id='contextActiveServices' class='contextFile' style='display:none;'>"+
						"<table width='100%'>"+
							"<tr>"+
								"<td id='contextActiveServicesStopAll' class='button'>Stop All</td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
					"<div id='contextInactiveServices' class='contextFile' style='display:none;'>"+
						"<table width='100%'>"+
							"<tr>"+
								"<td id='contextInactiveServicesStartAll' class='button'>StartAll</td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
					"<div id='contextActiveService' class='contextFile' style='display:none;'>"+
						"<table width='100%'>"+
							"<tr>"+
								"<td id='contextActiveServiceRunNow' class='button'>Run Now</td>"+
							"</tr>"+
							"<tr>"+
								"<td id='contextActiveServiceStop' class='button'>Stop</td>"+
							"</tr>"+
							"<tr>"+
								"<td id='contextActiveServiceRemove' class='button'>Remove</td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
					"<div id='contextInactiveService' class='contextFile' style='display:none;'>"+
						"<table width='100%'>"+
							"<tr>"+
								"<td id='contextInactiveServiceRunNow' class='button'>Run Now</td>"+
							"</tr>"+
							"<tr>"+
								"<td id='contextInactiveServiceStart' class='button'>Start</td>"+
							"</tr>"+
							"<tr>"+
								"<td id='contextInactiveServiceRemove' class='button'>Remove</td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
                "</div>"
            );
			UI.Document.defaultContextMenu(false);
			var app = {
				list : function(done,err) {
					Import({url:"/service/list",method:"post"}).done(done).fail(err).send();
				},
				remove : function(name,done,err) {
					Import({url:"/service/remove",method:"post",data:{name:name}}).done(done).fail(err).send();
				},
				menu : {

				},
				install : function(args,done,err) {
					Import({url:"/service/install",method:"post", data : args}).done(done).fail(err).send();
				},
				editor : {
					main : null
				},
				selected : {},
				resize : function() {
					var menu_width = 230;
					p.el.containerServicesEditor.style.width = (window.innerWidth - (menu_width+30)) + "px";
					p.el.containerServicesEditor.style.height = (window.innerHeight - 20-70-50) + "px";

					var editor = p.el.editor;
					var view = p.el.view;
					var titleHeight = 19;
					editor.style.position = view.style.position = "absolute";
					editor.style.left = view.style.left = "0px";
					editor.style.top = view.style.top = titleHeight+20 + "px";
					editor.style.width = view.style.width = (window.innerWidth - (menu_width + 30))  + "px";
					editor.style.height = view.style.height = (window.innerHeight - 40 - titleHeight-70-50) + "px";
				}
			};
			app.resize();
			UI.Window.on("resize",app.resize);
			function setContext(target,name,args) {
				target.el.addEventListener("click",function() {
					// open configure window
					app.selected = {};
					for(var key in args) {
						app.selected[key] = args[key];
					}
					var p2 = p.$.editor.elementSetPacket("<div style='padding:20px;'>"+
						"<div id='lblName' style='font-size:22px;font-weight:bold;'></div>"+
						"<div style='font-weight:bold;'>Interval:</div>"+
						"<AppServicesIntervalInput id='iInterval'/>"+
						"<div style='font-weight:bold;'>Function:</div>"+
						"<div id='editor' style='width:640px;height:480px;border:solid 1px #000;'></div><br/>"+
						"<div><input id='btnUpdate' type='button' value='update'/></div>"+
					"</div>");
					Import({url:"/service/get",method:"post",data : { name : args.name }})
					.done(function(data) {
						data = JSON.parse(data);
						if(data.result) {
							alert(JSON.stringify(data));
							p2.$.lblName.elementSetPacket(data.value.name);
							//alert(data.value.code);
							p2.$.iInterval.setValue( parseInt(data.value.interval) )
							var loaded = false;
							function loadEditor() {
								if(!loaded) {
									loaded = true;
									app.editor.main = monaco.editor.create(p2.el.editor, {
										value: "",
										language: "javascript"
									});
									app.editor.main.setValue( data.value.code );
								}
							}
							require(['vs/editor/editor.main'], function() {
								loadEditor();
							});

							p2.el.btnUpdate.addEventListener("click",function() {

								var name = data.value.name;
								var interval = p2.$.iInterval.valueOf();
								var code = app.editor.main.getValue();
								//alert(  );
								// why a burst?
								app.install({
									name : name,
									interval : interval,
									code : Export.Codec.Hex(code)
								},function(data) {
									alert(data);
									data = JSON.parse(data);
									if(data.result) {
										alert("OK UPDATED");
									} else {
										alert("ERROR");
									}
								},function() {
									console.log("ERROR");
								});
								
							});

						} else {
							alert("error");
						}
					})
					.send();

				});
				target.el.addEventListener("mouseup",function(event) {
					app.selected = {};
					for(var key in args) {
						app.selected[key] = args[key];
					}
					if(event.button == 0) {
						
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
			
			function removeService() {
				app.remove(app.selected.name,function(data){
					data = JSON.parse(data);
					if(data.result) {
						refresh_services();
					} else {
						alert("can't remove");
					}
				},function() {
					alert("can't remove");
				});
			}

			p.el.contextActiveServiceRemove.addEventListener("click",function() {
				app.menu.dispose();
				removeService();
			});
			p.el.contextInactiveServiceRemove.addEventListener("click",function() {
				app.menu.dispose();
				removeService();
			});
			p.el.contextActiveServiceStop.addEventListener("click",function() {
				app.menu.dispose();
				Import({url:"/service/stop",method:"post",data : { name : app.selected.name } })
				.done(function(data) {
					data = JSON.parse(data);
					if(data.result) {
						refresh_services();
					} else {
						alert("error");
					}

				})
				.send();

			});
			p.el.contextInactiveServiceStart.addEventListener("click",function() {
				app.menu.dispose();
				Import({url:"/service/start",method:"post",data : {name:app.selected.name}})
				.done(function(data){
					data = JSON.parse(data);
					if(data.result) {
						refresh_services();
					} else {
						alert("error");
					}
				})
				.send();
			});
			p.el.contextActiveServicesStopAll.addEventListener("click",function() {
				
				app.menu.dispose();
				var count = 0;
				var check = 0;
				var state = 0;
				function _stop(name) {
					Import({url:"/service/stop",method:"post",data : {name:name}})
					.done(function(data){
						data = JSON.parse(data);
						if(data.result) {
							count += 1;
							if(count == check) {
								refresh_services();
							}
						} else {
							alert("error: not all started.");
							refresh_services();
						}
					})
					.send();
				}
				app.list(function(data) {
					var data = JSON.parse(data);
					if(data.result) {
						for(var key in data.value ) {
							if(data.value[key].enabled) {
								check += 1;
							}
						}
						for(var key in data.value ) {
							if(data.value[key].enabled) {
								_stop(key);
							}
						}
					} else {
						alert("error");
					}
				},function() {
					alert("error");
				});

			});
			p.el.contextInactiveServicesStartAll.addEventListener("click",function() {
				app.menu.dispose();
				var count = 0;
				var check = 0;
				var state = 0;
				function _start(name) {
					Import({url:"/service/start",method:"post",data : {name:name}})
					.done(function(data){
						data = JSON.parse(data);
						if(data.result) {
							count += 1;
							if(count == check) {
								
								refresh_services();
							}
						} else {
							alert("error: not all started.");
							refresh_services();
						}
					})
					.send();
				}
				app.list(function(data) {
					var data = JSON.parse(data);
					if(data.result) {
						for(var key in data.value ) {
							if(!data.value[key].enabled) {
								check += 1;
							}
						}
						for(var key in data.value ) {
							if(!data.value[key].enabled) {
								_start(key);
							}
						}
					} else {
						alert("error");
					}
				},function() {
					alert("error");
				});
			});

			var p2 = p.$.dir.elementPushPacket(
				"<table width='100%' cellpadding='0' cellspacing='0'><WithDOMElements2 id='items'></WithDOMElements2></table>"
			);

			var tr = p2.$.items.elementPush("tr");
			var td = tr.$.elementPush("tdInfo","td",{
				class : { add : ["groupDir","borderBottom"] }
			});
			td.el.style.display = "flex";
			td.el.style.cursor = "default";
			td.$.elementSetPacket("<span style='flex:1;'>New Service</span>");

			td.el.addEventListener("click",function() {
				// new service dialog
				var p2 = p.$.editor.elementSetPacket(
						"<div style='padding:20px;'>"+
							"<div style='font-size:22px;font-weight:bold;'>Install New Service:</div><br/>"+
							"<div style='font-weight:bold;'>Name:</div>"+
							"<div><input id='txtName' type='text' style='padding:10px;width:198px;'/></div>"+
							"<div style='font-weight:bold;'>Interval:</div>"+
							"<AppServicesIntervalInput id='iInterval'/>"+
							"<div style='font-weight:bold;'>Function:</div>"+
							"<div id='editor' style='width:640px;height:480px;border:solid 1px #000;'></div><br/>"+
							"<div><input id='btnSend' type='button' value='install'/></div>"+
						"</div>"
				);
				p2.el.btnSend.addEventListener("click",function() {
					var name = p2.el.txtName.value;
					var interval = p2.$.iInterval.valueOf();
					var code = app.editor.main.getValue();
					//alert(  );
					// why a burst?
					app.install({
						name : name,
						interval : interval,
						code : Export.Codec.Hex(code)
					},function(data) {
						alert(data);
						data = JSON.parse(data);
						if(data.result) {
							refresh_services();
							alert("OK INSTALLED");
						} else {
							alert("ERROR");
						}
					},function() {
						console.log("ERROR");
					});

				});
				var loaded = false;
				function loadEditor() {
					if(!loaded) {
						p2.el.txtName.value = "hello";
						loaded = true;
						app.editor.main = monaco.editor.create(p2.el.editor, {
							value: "",
							language: "javascript"
						});
						var doc = [];
						doc.push("(function() {");
						doc.push("\treturn function() {");
						doc.push("\t\tconsole.log('hello service!');");
						doc.push("\t\treturn 0;");
						doc.push("\t}");
						doc.push("})();");
						app.editor.main.setValue( doc.join("\r\n") );
					}
				}
				
				require(['vs/editor/editor.main'], function() {
					loadEditor();
				});

			});

			var tr = p2.$.items.elementPush("tr");
			var td = tr.$.elementPush("tdInfo","td",{
				class : { add : ["groupDir","borderBottom"] }
			});
			td.el.style.display = "flex";
			td.el.style.cursor = "default";
			setContext({
				$ : td.$,
				el : td.el
			},"ActiveServices",{
			})
			td.$.elementSetPacket("<span style='flex:1;'>Active</span><span style='font-size:10px;'>(context menu)</span>");
			var active_placeholder = p2.$.items.elementPush("WithDOMElements2");

			var tr = p2.$.items.elementPush("tr");
			var td = tr.$.elementPush("tdInfo","td",{
				class : { add : ["groupDir","borderBottom"] }
			});
			setContext({
				$ : td.$,
				el : td.el
			},"InactiveServices",{
			})
			td.el.style.display = "flex";
			td.el.style.cursor = "default";
			td.$.elementSetPacket("<span style='flex:1;'>Inactive</span><span style='font-size:10px;'>(context menu)</span>");
			var inactive_placeholder = p2.$.items.elementPush("WithDOMElements2");

			function refresh_services() {
				active_placeholder.$.elementsClear();
				inactive_placeholder.$.elementsClear();
				app.list(function(data) {
					var data = JSON.parse(data);
					if(data.result) {
						for(var key in data.value ) {
							if(data.value[key].enabled) {
								var p3 = active_placeholder.$.elementPushPacket("<tr><td id='service'>"+key+"</td></tr>");
								BrowserTools.setStyle(p3.el.service,{
									class : { add : "button" }
								});
								setContext({
									$ : p3.$.service,
									el : p3.el.service
								},"ActiveService",{
									name : key
								});
							} else {
								var p3 = inactive_placeholder.$.elementPushPacket("<tr><td id='service'>"+key+"</td></tr>");
								BrowserTools.setStyle(p3.el.service,{
									class : { add : "button" }
								});
								setContext({
									$ : p3.$.service,
									el : p3.el.service
								},"InactiveService",{
									name : key
								});
							}
						}
					} else {

					}
				},function() {
					alert("error on app.list");
				})
			}
			refresh_services();
			

            this.hide = function() {
				p.el.app_services.style.display = "none";
			}
			this.show = function(context) {
				p.el.app_services.style.display = "";
			}
        }
    }
});
                