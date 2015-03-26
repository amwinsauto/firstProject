function onOpen(e) {
	$.masterTabGroup.open() ;
	$.detailWindowController.open() ;
}
function onClose(e) {
	$.masterTabGroup.close() ;
	$.detailWindowController.close() ;
}

exports.beforeClose = function() {
	$.masterTabGroup.visible = false;
	$.detailWindowController.visible = false;
};
