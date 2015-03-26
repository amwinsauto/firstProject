var Properties = require('tools/Properties');
var args = arguments[0] || {};

var serverOK = args.serverOK || false;
var exitAction = args.exitAction;
var settingsUpdated = args.settingsUpdated;

if (serverOK) {
	$.serverStatusView.backgroundColor = $.serverStatusView.egBackgroundColorOk;
} else {
	$.serverStatusView.backgroundColor = $.serverStatusView.egBackgroundColorError;
}
$.serverNameLabel.text = '( ' + Properties.getServerName() + ' )';

if (Ti.Network.getNetworkType() === Ti.Network.NETWORK_WIFI || Ti.Network.getNetworkType() === Ti.Network.NETWORK_MOBILE) {
	$.deviceStatusView.backgroundColor = $.deviceStatusView.egBackgroundColorOk;
} else {
	$.deviceStatusView.backgroundColor = $.deviceStatusView.egBackgroundColorError;
}

function onSetupClick(e) {
	Alloy.createController('menu/serversetup', {
		serverOK : serverOK,
		settingsUpdated : settingsUpdated,
		exitAction : exitAction
	}).open($.serverImageView);
}
