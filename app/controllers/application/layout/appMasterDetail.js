function onOpen(e) {
	$.masterWindowController.open() ;
	$.detailWindowController.open() ;
}
function onClose(e) {
	$.masterWindowController.close() ;
	$.detailWindowController.close() ;
}

exports.beforeClose = function() {
	$.masterWindowController.visible = false;
	$.detailWindowController.visible = false;
};
