var Properties = require('tools/Properties');
$.supportWebView.url = Properties.getSupportUrl();

function onCloseClick(e) {
	$.getView().close();
}
