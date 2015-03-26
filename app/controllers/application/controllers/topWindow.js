exports.baseController = "application/controllers/abstractWindow";

var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;

$.isTop = true;
$.type = 'top';

function onOpen(e) {
	$.onOpenWindow(e);
}

function onClose(e) {
	$.onCloseWindow(e);
}
