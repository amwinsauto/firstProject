var Properties = require("tools/Properties");
var Logger = require('Logger');

var args = arguments[0] || {};
//var connection = args.connection;
var settings = args.settings;
var exitAction = args.exitAction;
var androidNoWindow = args.nowindow;
var settingsChanged = false;

$.enableLoggingSwitch.value = Properties.isLogEnabled();

function onAndroidBack(e) {
	$.logsetupWindow.close();
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

function onEnableLoggingSwitchChange(e) {
	Properties.setLogEnabled(e.value);
	setupChanged();
}

function onEmailButtonClick(e) {
	new Logger().sendEmail();
}

function setupChanged() {
	settingsChanged = true;
	if (settings) {
		settings.setupChanged();
	}
}

exports.open = function() {
	$.logsetupWindow.open();
}; 