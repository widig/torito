Class.define("AppAccounts",{
    from : ["WithDOMElements2"],
    ctor : function() {
        
    },
    proto : {
        init : function(context) {
            var i = this.internal.AppAccounts.data = {};
            var self = this;
            var p = context.serverContainer.$.main_element.$.elementPushPacket("app_accounts",
                "<div id='app_accounts' class='app_accounts'>"+
                    "<div id='menuAccounts' class='menuAccounts'>"+
                        "<div class='menuAccountsTitle'>Accounts</div>"+
                        "<div id='menuAccountsContents' class='menuAccountsContents'>"+
                            "<div id='dir' style='font-size:14px;'></div>"+
                        "</div>"+
                    "</div>"+
                    "<div id='containerAccountsEditor' class='containerAccountsEditor'>"+
                        "<div id='title' style='background-color:#008;'>Accounts</div>"+
                        "<div id='editor' style='background-color:white;color:black;'></div>"+
                    "</div>"+
                    "<div id='contextUsers' class='contextFile' style='display:none;'>"+
                        "<table width='100%'>"+
                            "<tr>"+
                                "<td id='contextUsersNewUser' class='button'>new user</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='contextUsersGlobalView' class='button'>global view</td>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"+
                    "<div id='contextUser' class='contextFile' style='display:none;'>"+
                        "<table width='100%'>"+
                            "<tr>"+
                                "<td id='contextUserProfile' class='button'>profile</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='contextUserLog' class='button'>log</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td id='contextUserSettings' class='button'>settings</td>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"+
                "</div>"
            );
            UI.Document.defaultContextMenu(false);
            
            var app = {
                menu : {
                },
                selected : {
                },
                resize : function() {
                    p.el.containerAccountsEditor.style.width = (window.innerWidth - 260) + "px";
                    p.el.containerAccountsEditor.style.height = (window.innerHeight - 20-70-50) + "px";

                    titleHeight = 0;
                    var editor = p.el.editor;
                    editor.style.position = "absolute";
                    editor.style.left = "0px";
                    editor.style.top = titleHeight+20 + "px";
                    editor.style.width = (window.innerWidth - 260)  + "px";
                    editor.style.height = (window.innerHeight - 40 - titleHeight-70-50) + "px";
                    editor.style.overflow = "auto";
                }
            };
            UI.Window.on("resize",app.resize);
            app.resize();
            var t = p.$.dir.elementPush("dir_table","table",{
                attribs : {
                    width : "100%",
                    cellpadding : "0",
                    cellspacing : "0"
                }
            });
            self.table = t;
            
            p.el.contextUsersNewUser.addEventListener("click",function() {

                app.menu.dispose();

                // set view to new user form
                console.log(p.$.containerAccountsEditor)
                
                var pNewUser = p.$.editor.elementSetPacket(
                    "<br/><br/>"+
                    "<div id='lblError' style='display:none;'></div>"+
                    "<div>"+
                        "<center>"+
                        "<table style='background-color:white;color:black;padding:20px;border:solid 1px #000;'>"+
                            "<tr>"+
                                "<td colspan='2'>New User</td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td align='right'>username:</td>"+
                                "<td><input id='txtUsername' type='text'/></td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td align='right'>password:</td>"+
                                "<td><input id='txtPassword' type='password'/></td>"+
                            "</tr>"+
                            "<tr>" +
                                "<td align='right'>retype password:</td>"+
                                "<td><input id='txtPassword2' type='password'/></td>"+
                            "</tr>"+
                            "<tr>" +
                                "<td align='right'>level:</td>"+
                                "<td><input id='txtLevel' type='text'/></td>"+
                            "</tr>"+
                            "<tr>"+
                                "<td></td>"+
                                "<td><input id='btnAddNewUser' type='button' value='add new user'/>"+
                            "</tr>"+
                        "</table>"+
                        "</center>"+
                    "</div>"
                );
                pNewUser.el.btnAddNewUser.addEventListener("click",function() {
                    if(pNewUser.el.txtPassword.value != pNewUser.el.txtPassword2.value) {
                        alert("passwords must confirm.");
                        return;
                    }
                    var username = pNewUser.el.txtUsername.value;
                    alert(sha1(pNewUser.el.txtPassword.value));
                    Import({url:"/acl/register",method:"post",data:{
                            username : username,
                            password : sha1(pNewUser.el.txtPassword.value),
                            level : pNewUser.el.txtLevel.value
                        }
                    })
                    .done(function(data) {
                        data = JSON.parse(data);
                        if(data.result) {
                            alert(JSON.stringify(data));
                            // refresh user list
                            refresh_user_list();
                            // set panel to message account has been created.
                            p.$.editor.elementSetPacket("<div style='color:black;'>Account '"+username+"' has ben created.</div>");

                        } else {
                            // set class to active error
                            pNewUser.$.lblError.elementSetPacket(data.msg);
                        }
                    })
                    .send();
                });

            });
            
            function load_view_global() {
                // list session
                var pGlobalView = p.$.editor.elementSetPacket(
                    "<div>"+
                        "<div style='font-size:30px;padding-left:20px;'>Sessions</div>"+
                        "<center>"+
                            "<table class='appAccountsUsersGlobalView' border='0' cellpadding='0' cellspacing='0' width='400'>"+
                                "<WithDOMElements2 id='placeholder'></WithDOMElements2>"+
                            "</table>"+
                        "</center>"+
                    "</div>"
                );
                function refresh_sessions() {
                    Import({url:"/session/list",method:"post"})
                    .done(function(data){
                        
                        data = JSON.parse(data);
                        if(data.result) {
                            pGlobalView.$.placeholder.elementsClear();
                            var sessions = data.value;
                            for(var key in sessions) {
                                    if(sessions[key]!=null) {
                                        var p0 = pGlobalView.$.placeholder.elementPushPacket(
                                            "<tr>"+
                                                "<td colspan='2' style='background-color:black;color:white;font-weight:bold;'>"+key+"</td>"+
                                            "</tr>"+
                                            "<tr>"+
                                                "<td style='border-left:solid 1px #000;border-bottom:solid 1px #000;'>"+
                                                    "<b>date</b>:"+sessions[key].date+"<br/>"+
                                                    "<b>username</b> : " + sessions[key].level + "/" + sessions[key].username + "/" + sessions[key].ip + " "+
                                                    "<b>logged</b>:" + sessions[key].logged +
                                                "</td>"+
                                                "<td align='center' valign='middle' style='border-bottom:solid 1px #000;border-right:solid 1px #000;'>"+
                                                    "<input id='btnRemoveSession' type='button' value='remove'/>"+
                                                "</td>"+
                                            "</tr>"
                                        );
                                        // id, logged, username, date, level
                                        (function(key){
                                            p0.el.btnRemoveSession.addEventListener("click",function() {
                                                Import({url:"/session/remove",method:"post",data:{key:key}})
                                                .done(function(data){
                                                    data = JSON.parse(data);
                                                    if(data.result) {
                                                        alert(JSON.stringify(data));
                                                        refresh_sessions();
                                                    } else {
                                                        alert("can't remove session.");
                                                    }
                                                })
                                                .send();

                                            });
                                        })(key);
                                }
                            }
                        } else {
                            alert(JSON.stringify(data));
                        }
                    })
                    .send();
                }
                refresh_sessions();
            }
            if( context.accounts.view == "global") {
                load_view_global();
            }
            p.el.contextUsersGlobalView.addEventListener("click",function() {
                load_view_global();
                app.menu.dispose();
            });
            p.el.contextUserProfile.addEventListener("click",function() {
                alert("user profile");
                app.menu.dispose();
            });
            p.el.contextUserLog.addEventListener("click",function() {
                
                alert("user log");
                app.menu.dispose();
                // open log file for that user
                var p2 = p.$.editor.elementSetPacket(
                   "<table width='100%'><WithDOMElements id='rows'/></table>"
                );
                Import({url:"/acl/statistics",method:"post"})
                .done(function(data) {
                    var table = data.value;
                    var p3 = p2.$.elementPushPacket("<tr><WithDOMElements id='cols'/></td>")
                    for(var key in table) {
                        // construct columns
                        // HERE
                        p3.$.cols.elementPushPacket("<td>" + key + "</td>");
                    }
                    for(var x = 0; x < table.rows.length;x++) {
                        
                    }
                })
                .send();


            });
            p.el.contextUserSettings.addEventListener("click",function() {

                var pSettings = p.$.editor.elementSetPacket(
                    "<div>"+
                        "<div style='font-size:20px;'>Account "+app.selected.username+"</div>"+
                        "<table>"+
                            "<tr>"+
                                "<td>Change Password</td>"+
                                "<td><input id='btnChangePassword' type='button' value='confirm'/></td>"+
                            "</tr>" +
                            "<tr>"+
                                "<td>Delete Account</td>"+
                                "<td><input id='btnDeleteAccount' type='button' value='confirm'/></td>"+
                            "</tr>" +
                        "</table>"+
                    "</div>"
                );
                pSettings.el.btnDeleteAccount.addEventListener("click",function() {
                    
                    Import({
                        url:"/acl/remove",
                        method:"post",
                        data:{
                            username:app.selected.username
                        }
                    })
                    .done(function(data) {
                        
                        data = JSON.parse(data);
                        if(data.result) {
                            p.$.editor.elementSetPacket(
                                "<div>" +
                                    "<span>Account '"+app.selected.username+"' deleted. </span><br/>" +
                                "</div>"
                            );
                            app.seleted = {};
                            refresh_user_list();
                        } else {
                            console.log(JSON.stringify(data));
                        }
                    })
                    .send();

                });
                pSettings.el.btnChangePassword.addEventListener("click",function() {
                    var old = sha1(prompt("old password"));
                    var pass = sha1(prompt("new password"));
                    var cpass = sha1(prompt("confirm password"));
                    if(pass == cpass) {
                        Import({url:"/session/ownname",method:"post"})
                        .done(function(data) {
                            data = JSON.parse(data);
                            if(data.result) {
                                var user = data.value;
                                Import({url:"/acl/changepassword",method:"post",data : { 
                                    username : user, 
                                    target_username : app.selected.username, 
                                    oldpassword : old,
                                    password : pass 
                                }})
                                .done(function(data) {
                                    data = JSON.parse(data);
                                    if(data.result) {
                                        alert("ok, changed!");
                                    } else {
                                        alert("can't change.");
                                    }
                                })
                                .send();
                                
                            } else {
                                alert("can't get own name.");
                            }
                        })
                        .send();
                        
                    } else {
                        alert("passwords didn't match");
                    }
                });
                app.menu.dispose();
            });
            
            
            
            function setContext(target,name,args) {
                target.addEventListener("mouseup",function(event) {
                    if(event.button == 0) {
                        if(name == "Users") {
                            History.go("#manage:system=accounts&view=global");
                            return;
                        }
                    }
                    if(event.button == 2) {
                        if(args) {
                            for(var key in args)
                                app.selected[key] = args[key];
                        }

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

            var tr = self.table.$.elementPush("tr_newuser","tr");
            var td = tr.$.elementPush("td_newuser","td",{
                class : { add : ["groupDir","borderBottom"] }
            });
            td.$.elementSetPacket("Users");
            setContext(td.el,"Users");

            var placeholder = self.table.$.elementPush("WithDOMElements2");

            function refresh_user_list() {
                placeholder.$.elementsClear();
                Import({url:"/acl/list",method:"post"})
                .done(function(data) {
                    data = JSON.parse(data);
                    for(var user in data.users) {
                        var tr = placeholder.$.elementPush("tr_settings","tr");
                        var td = tr.$.elementPush("td_settings","td",{
                            class : { add : ["button","borderBottom"] }
                        });
                        td.$.elementSetPacket(user);
                        setContext(td.el,"User",{
                            username : user
                        });
                        //alert(JSON.stringify(data.users[user]));
                    }
                })
                .send();
            }
            refresh_user_list();
            
            this.hide = function() {
                p.el.app_accounts.style.display = "none";
            }
            this.show = function(context) {
                p.el.app_accounts.style.display = "";
                if( context.accounts.view == "global") {
                    load_view_global();
                }
            }
            
        }
    }
});