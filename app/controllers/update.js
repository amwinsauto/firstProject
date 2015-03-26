var Properties = require('tools/Properties');

var args = arguments[0] || {};

$.titleLabel.text = L('update_necessary');
if (OS_IOS) {
	$.descriptionLabel.text = L('update_necessary_ios').replace('%1', args.version);
} else {
	$.descriptionLabel.text = L('update_necessary_android').replace('%1', args.version);
}

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
