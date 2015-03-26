var Properties = require("tools/Properties");

var args = arguments[0] || {};
var settings = args.settings;
var exitAction = args.exitAction;
var androidNoWindow = args.nowindow;
var settingsChanged = false;

if (OS_IOS) {
	// IOS Bug
	$.serversetupTable.headerView = Ti.UI.createView({
		height : 18
	});
}

$.serverTextField.value = Properties.getServerName();
$.httpsSwitch.value = Properties.isHttps();
$.webAppTextField.value = Properties.getWebApplication();

function onAndroidBack(e) {
	$.serversetupWindow.close();
	if (settingsChanged && exitAction) {
		exitAction();
	} else {
		if (OS_ANDROID) {
			if (androidNoWindow) {
				Ti.Android.currentActivity.finish();
			}
		}
	}
}

function onServerTextFieldChange(e) {
	Properties.setServerName(e.value);
	setupChanged();
}

function onHttpsSwitchChange(e) {
	Properties.setHttps(e.value);
	setupChanged();
}

function onWebAppTextFieldChange(e) {
	Properties.setWebApplication(e.value);
	setupChanged();
}

function setupChanged() {
	settingsChanged = true;
	if (settings) {
		settings.setupChanged();
	}
}

exports.open = function() {
	$.serversetupWindow.open();
};
