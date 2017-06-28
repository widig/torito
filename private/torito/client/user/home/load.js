if(!this.init) {
	this.init = this.init || true;
	var app = {};
	this.app = app;
	UI.Body.elementsClear();
	var p = app.schema = UI.Body.elementPushPacket(
		"<div>default</div>"
	);
	//<input type=\"file\" accept=\"video/*;capture=camcorder\">
} else {
	
}