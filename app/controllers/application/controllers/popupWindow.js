exports.baseController = "application/controllers/abstractWindow";

var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;
var connection = controller.getConnection();
$.isPopup = true;
$.type = 'popup';

function onOpen(e) {
	$.onOpenWindow(e);
}

function onClose(e) {
	$.onCloseWindow(e);
}

function onSupportClick(e) {
	var support = Alloy.createController('support', {
		connection : connection
	});
	support.getView().open();

}

function onAboutClick(e) {
	var about = Alloy.createController('about', {
		connection : connection
	});
	about.getView().open();

}
exports.isNarrow = function() {
	if (Alloy.isHandheld) {
		return true;
	}
	if (OS_ANDROID && Alloy.isTablet) {
		return false;
	}
	if (controller.size === 'small' || controller.size === 'medium') {
		return true;
	}
	return false;
};
