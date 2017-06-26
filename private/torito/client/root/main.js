UI.Body.canSelect(false);
window.mousePos = { x : 0, y : 0 };
function handleMouseMove(event) {
    var dot, eventDoc, doc, body, pageX, pageY;
    event = event || window.event; // IE-ism
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;
        event.pageX = event.clientX +
        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
        (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
        (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
        (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }
    window.mousePos = {
        x: event.pageX,
        y: event.pageY
    };
    //console.log(window.mousePos);
}
document.onmousemove = handleMouseMove;
window.torito = {
     tab : "",
     page : ""
};
UI.Window.Router.on("pageLoad",function(page,a) {
    //alert(History.getHash());
    window.torito.page = page;
    window.torito.date = new Date();
    Import({url:"/acl/tab/page",method:"post", data : { id : window.torito.tab , page : page, args : JSON.stringify(a)  }})
    .done(function(data) {
        data = JSON.parse(data);
        if(data.result) {
            console.log("logged on page : " + page + JSON.stringify(a));
        } else {
            console.log("123 @@@",data.code,window.torito.tab, name,JSON.stringify(data));
        }
    })
    .send();
});
// request id for this tab
Import({url:"/acl/tab/create",method:"post"})
.done(function(data) {
     data = JSON.parse(data);
     if(data.result) {
          //data.value
          window.torito.tab = data.id;


          (function() {
            var hidden = "hidden";
            // Standards:
            if (hidden in document)
              document.addEventListener("visibilitychange", onchange);
            else if ((hidden = "mozHidden") in document)
              document.addEventListener("mozvisibilitychange", onchange);
            else if ((hidden = "webkitHidden") in document)
              document.addEventListener("webkitvisibilitychange", onchange);
            else if ((hidden = "msHidden") in document)
              document.addEventListener("msvisibilitychange", onchange);
            // IE 9 and lower:
            else if ("onfocusin" in document)
              document.onfocusin = document.onfocusout = onchange;
            // All others:
            else
              window.onpageshow = window.onpagehide
              = window.onfocus = window.onblur = onchange;

            function onchange (evt) {
              var v = "visible", h = "hidden",
                  evtMap = {
                    focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
                  };

              evt = evt || window.event;
              var s = "";
              if (evt.type in evtMap)
                s = evtMap[evt.type];
              else
                s = this[hidden] ? "hidden" : "visible";
              if(s == "visible") {
                  setInterval(function() {
                      /*
                      Import({url:"/acl/ping",method:"post"})
                      .done(function(data){
                          data = JSON.parse(data);
                          if(!data.result) {
                              // window.location = "/logout"; (clear this when user got in unlogged state)
                          } else {
                              console.log("logged since:" + (data.value/1000) );
                          }
                      })
                      .send();
                      */

                  },1000);
                  console.log("visible");

              } else {
              console.log("hidden");
              }
            }

            // set the initial state (but only if browser supports the Page Visibility API)
            if( document[hidden] !== undefined )
              onchange({type: document[hidden] ? "blur" : "focus"});
          })();

	  

          History.init("manage");	  
	  

     }
})
.send();





