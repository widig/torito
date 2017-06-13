/******************************************************************************************************/
//
// STORE
//
//  publish -> own profile
//  feed -> published on other profiles
//  talk-store -> radio
//
/******************************************************************************************************/
if(!this.init) {
    this.init = this.init || true;
    var app = {};
    this.app = app;
    // frame for tests

    
    UI.Body.elementsClear();

    var p = app.schema = UI.Body.elementPushPacket(
        "<div id='view' style='padding:20px;'>" +
            "<div style='padding:20px;color:black;background-color:#FF8;'>"+
                "<div>"+
                    "<div style='font-size:30px;text-align:center;'>"+
                        "<div style='font-size:30px;'>Bill</div>" +
                        "<div>"+
                            "<div style='font-size:30px;'>Title</div>" +
                            "<div style='font-size:20px;'>Sub title</div>" +
                            "<div style='font-size:14px;'>Content</div>" +
                        "</div>"+

                        "<div>"+
                            "<div style='font-size:30px;'>Title</div>" +
                            "<div style='font-size:20px;'>Sub title</div>" +
                            "<div style='font-size:14px;'>Content</div>" +
                        "</div>"+
                        "<div style='display:flex'>"+
                            "<div style='font-size:30px;'>Title</div>" +
                            "<div style='font-size:20px;'>Sub title</div>" +
                            "<div style='font-size:14px;'>Content</div>" +
                        "</div>"+
                    "</div>" +
                "</div>"+
            "</div>"+
            "<br/>"+
            "<div style='padding:20px;color:black;background-color:#F00;'>"+
                "<div style='background-color:#eef442'>"+
                    "<table class='profile1' cellpadding='0' cellspacing='0'>"+
                        "<tr>"+
                            "<td class='profile1'>Nome: _NOME_</td><td>Rg : ###.###.###-##</td><td>Telefone : ## #### ####</td><td>Email : _EMAIL_</td><td>Facebook : _FACEBOOK_</td><td>WhatsUp : _WHATSUP_</td>"+
                        "</tr>"+
                    "</table>"+
                "</div>"+
                "<div style='background-color:#eef442'>"+
                    "<table class='profile1' cellpadding='0' cellspacing='0'>"+
                        "<tr>"+
                            "<td class='profile1'>Nome: _NOME_</td><td>Rg : ###.###.###-##</td><td>Telefone : ## #### ####</td><td>Email : _EMAIL_</td><td>Facebook : _FACEBOOK_</td><td>WhatsUp : _WHATSUP_</td>"+
                        "</tr>"+
                    "</table>"+
                "</div>"+
                "<div style='background-color:#eef442'>"+
                    "<table class='profile1' cellpadding='0' cellspacing='0'>"+
                        "<tr>"+
                            "<td class='profile1'>Nome: _NOME_</td><td>Rg : ###.###.###-##</td><td>Telefone : ## #### ####</td><td>Email : _EMAIL_</td><td>Facebook : _FACEBOOK_</td><td>WhatsUp : _WHATSUP_</td>"+
                        "</tr>"+
                    "</table>"+
                "</div>"+
            "</div>"+
            "<br/>"+
            "<div style='padding:20px;color:black;background-color:#F00;'>"+
            "<div style='background-color:white;padding:20px;'>"+
                "<div style='display:flex;'>"+
                    "<div style='padding:10px;margin:10px;border:solid 1px #000;'>"+
                    "<div>"+
                        "<div style='font-size:12px;'>"+
                            "<table width='100%' border='1' cellpadding='0' cellspacing='0'><tr><td width=64 height=64></td><td style='padding:10px;'><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></td></tr></table>"+
                        "</div>"+
                        "<div style='border-left:solid 1px #000;border-right:solid 1px #000;border-bottom:solid 1px #000;padding:5px;'>"+
                            "Nononono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                            "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                            "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                            "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                        "</div>"+
                        "<div style='padding:10px;'>"+
                            "<span style='font-weight:bold;'>Reply</span>"+
                        "</div>"+
                        "<div style='padding:10px;'>"+
                            "<span style='font-weight:bold;'>Replies: (Hide)</span><br/>"+

                            "<div style='padding:10px;'>"+
                                "<div style='font-size:12px;'>"+
                                    "<table width='100%' border='1' cellpadding='0' cellspacing='0'><tr><td width=64 height=64></td><td style='padding:10px;'><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></td></tr></table>"+
                                "</div>"+
                                "<div style='border-left:solid 1px #000;border-right:solid 1px #000;border-bottom:solid 1px #000;padding:5px;'>"+
                                    "Nononono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                    "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                    "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                    "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                "</div>"+
                                "<div style='padding:10px;'>"+
                                    "<span style='font-weight:bold;'>Reply</span>"+
                                "</div>"+
                            "</div>"+




                            "<div style='padding:10px;'>"+
                                "<div style='font-size:12px;'>"+
                                    "<table width='100%' border='1' cellpadding='0' cellspacing='0'><tr><td width=64 height=64></td><td style='padding:10px;'><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></td></tr></table>"+
                                "</div>"+
                                "<div style='border-left:solid 1px #000;border-right:solid 1px #000;border-bottom:solid 1px #000;padding:5px;'>"+
                                    "Nononono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                    "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                    "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                    "nonono nonono nonono nonono nonono nonono nonono nonono<br/>"+
                                "</div>"+
                                "<div style='padding:10px;'>"+
                                    "<span style='font-weight:bold;'>Reply</span>"+
                                "</div>"+
                            "</div>"+
                        "</div>"+
                    "</div>"+
                    "</div>" +
                    "<div style='padding:10px;margin:10px;border:solid 1px #000;'>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "</div>" +
                    "<div style='padding:10px;margin:10px;border:solid 1px #000;'>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "</div>" +
                    "<div style='padding:10px;margin:10px;border:solid 1px #000;'>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "<div><span style='font-weight:bold;'>_NOME_</span> did <span style='font-weight:bold;'>that</span> at <span style='font-weight:bold;'>##:##</span></div>"+
                    "</div>" +
                "</div>" +
            "</div>" +
            "</div>"+
        "</div>"
    );
    app.resize = function() {
        p.el.view.style.position = "absolute";
        p.el.view.style.left = "0px";
        p.el.view.style.top = "0px";
        p.el.view.style.width = window.innerWidth + "px";
        p.el.view.style.height = window.innerHeight + "px";
    }

    UI.Window.on("resize",app.resize);


} else { // initialized

}
