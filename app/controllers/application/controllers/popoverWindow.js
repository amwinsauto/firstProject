exports.baseController = "application/controllers/abstractWindow";

var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;

$.isPopup = true;
$.isPopover = true;
$.type = 'popover';

function onOpen(e) {
	$.onOpenWindow(e);
}

function onClose(e) {
	$.onCloseWindow(e);
}
exports.isNarrow = function() {
	return true;
};
