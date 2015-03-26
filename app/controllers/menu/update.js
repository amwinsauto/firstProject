var Properties = require('tools/Properties');

var args = arguments[0] || {};
var version = args.version || 'n/a';
var store = 'App Store';

$.titleLabel.text = L('update_required_title');
if (OS_IOS) {
	store = L('update_required_store_ios');
} else {
	store = L('update_required_store_android');
}
$.installedLabel.text = String.format(L('update_required_installed'), Ti.App.version);
$.descriptionLabel.text = String.format(L('update_required_description'), args.version || 'n/a');
$.updateButton.title = String.format(L('update_required_update_button'), store);
$.footerLabel.text = String.format(L('update_required_footer'), store);

function onUpdateButtonClick(e) {
	if (OS_IOS) {
		//Ti.Platform.openURL('http://phobos.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=' + Properties.getAppId() + '&mt=8');

		// EG Crosspad ASPECT4 Example:
		// https://itunes.apple.com/app/id501296128?mt=8
		Ti.Platform.openURL('https://itunes.apple.com/app/id' + Properties.getAppId() + '?mt=8');
	}
}

exports.show = function() {
	$.updateView.visible = true;
};

exports.hide = function() {
	$.updateView.visible = false;
};
