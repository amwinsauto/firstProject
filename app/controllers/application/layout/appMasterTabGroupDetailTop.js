function onOpen(e) {
	$.topWindowController.open() ;
	$.masterTabGroup.open() ;
	$.detailWindowController.open() ;
}
function onClose(e) {
	$.topWindowController.close() ;
	$.masterTabGroup.close() ;
	$.detailWindowController.close() ;
}

exports.beforeClose = function() {
	$.topWindowController.visible = false;
	$.masterTabGroup.visible = false;
	$.detailWindowController.visible = false;
};
