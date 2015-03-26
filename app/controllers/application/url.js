var args = arguments[0] || {};
var window = args.window;
var data = args.data;

if (OS_IOS) {
	window.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}

var url = data.url;
if (url === undefined) {
	url = 'blank.html';
}

$.backButton.enabled = false;
$.forwardButton.enabled = false;
$.urlWebView.url = url;

if (OS_ANDROID) {
	$.backButton.enabled = true;
	$.forwardButton.enabled = true;
}

if (data.shownavbuttons) {
	if (!data.buttons) {
		data.buttons = [];
	}
	data.buttons.push($.backButton);
	data.buttons.push($.forwardButton);
}

window.setButtonsAndTitleOnWindow($.urlWebView, data, 'url');

function onUrlWebViewLoad(e) {
	if (OS_ANDROID) {
		return;
	}
	$.backButton.enabled = $.urlWebView.canGoBack();
	$.forwardButton.enabled = $.urlWebView.canGoForward();
}

function onBackButtonClick(e) {
	$.urlWebView.goBack();
}

function onForwardButtonClick(e) {
	$.urlWebView.goForward();
}
