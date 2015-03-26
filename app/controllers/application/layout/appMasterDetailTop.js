function onOpen(e) {
	$.topWindowController.open() ;
	$.masterWindowController.open() ;
	$.detailWindowController.open() ;
}
function onClose(e) {
	$.topWindowController.close() ;
	$.masterWindowController.close() ;
	$.detailWindowController.close() ;
}

exports.beforeClose = function() {
	$.topWindowController.visible = false;
	$.masterWindowController.visible = false;
	$.detailWindowController.visible = false;
};
