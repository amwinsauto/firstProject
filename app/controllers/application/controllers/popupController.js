exports.baseController = "application/controllers/abstractController";

var args = arguments[0] || {};
var application = args.application;
var connection = application.getConnection();

$.isPopup = true;
$.type = 'popup';

if (OS_IOS) {
	$.windowController = $.popupWindow;
}

$.init();

if (OS_IOS) {
	// Save original title and button
	$.closeButton.originalTitle = $.closeButton.title;
	$.firstWindow.getWindow().originalBackButtonTitle = $.closeButton.title;
	$.firstWindow.getWindow().originalBackButton = $.closeButton;

} else {
	$.popupWindow = $.mainWindow;
	$.popupWindow.addEventListener('androidback', function() {
		$.closePopup();
	});

}
exports.isKeyboardToolbarEnabled = function() {
	if (OS_ANDROID) {
		return false;
	} else {
		if ($.size === 'small' || $.size === 'medium') {
			return false;
		}
		return true;
	}
};

function onCloseButtonClick(e) {
	$.closePopup();
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
