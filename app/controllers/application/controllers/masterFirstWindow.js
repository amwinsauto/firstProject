exports.baseController = "application/controllers/abstractWindow";

var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;
var connection = controller.getConnection();

// Set the Ti.UI.Window
$.window = controller.window;
$.window.addEventListener('open', onOpen);
$.window.addEventListener('close', onClose);

$.isMaster = true;
$.type = 'master';

function onOpen(e) {
	$.onOpenWindow(e);
}

function onClose(e) {
	$.onCloseWindow(e);
}

exports.isNarrow = function() {
	if (OS_IOS && Alloy.isTablet && controller.isFullScreen) {
		return false;
	}
	if (OS_ANDROID && Alloy.isTablet) {
		return false;
	}
	return true;
};

