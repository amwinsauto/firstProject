exports.baseController = "application/controllers/abstractWindow";

var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;

// Set the Ti.UI.Window
$.window = controller.window;
$.window.addEventListener('open', onOpen);
$.window.addEventListener('close', onClose);

$.isTop = true;
$.type = 'top';

function onOpen(e) {
	$.onOpenWindow(e);
}

function onClose(e) {
	$.onCloseWindow(e);
}
