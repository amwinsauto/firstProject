var args = arguments[0] || {};

if (args.url) {
	$.browserWebView.url = args.url.toString();
}

if (args.title) {
	$.browserWindow.title = args.title.toString();
}
function onCloseButtonClick(e) {
	$.browserWindow.close();
}

exports.close = function() {
	$.browserWindow.close();
};

exports.open = function() {
	$.browserWindow.open();
};
