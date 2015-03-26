function onOpen(e) {
	$.topWindowController.open() ;
	$.masterTabGroup.open() ;
}
function onClose(e) {
	$.topWindowController.close() ;
	$.masterTabGroup.close() ;
}

exports.beforeClose = function() {
	$.topWindowController.visible = false;
	$.masterTabGroup.visible = false;
};
