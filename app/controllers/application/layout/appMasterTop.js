function onOpen(e) {
	$.topWindowController.open() ;
	$.masterWindowController.open() ;
}
function onClose(e) {
	$.topWindowController.close() ;
	$.masterWindowController.close() ;
}

exports.beforeClose = function() {
	$.topWindowController.visible = false;
	$.masterWindowController.visible = false;
};
