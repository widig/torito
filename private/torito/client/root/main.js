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

/*
setInterval(function() {
    Import({url:"/acl/ping",method:"post"})
    .done(function(data){
        data = JSON.parse(data);
        if(!data.result) {
            window.location = "/logout";
        }
    })
    .send();
},1000);
*/
History.init("manage");
