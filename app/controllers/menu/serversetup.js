var Properties = require("tools/Properties");
var Logger = require('Logger');

var args = arguments[0] || {};
//var settings = args.settings;
var exitAction = args.exitAction;
var settingsUpdated = args.settingsUpdated;
var androidNoWindow = args.nowindow;
//var settingsChanged = false;

var dirty = false;
var touchIdUser = undefined;
var touchIdEnabled = undefined;

$.serverTextField.value = Properties.getServerName();
$.httpsSwitch.value = Properties.isHttps();
$.webAppTextField.value = Properties.getWebApplication();
if (OS_IOS && Alloy.Globals.showLogging) {
	$.logSwitch.value = Properties.isLogEnabled();
}

if (Alloy.Globals.canUseTouchId) {
	if (Properties.getTouchIdEnabled() != undefined) {
		touchIdEnabled = Properties.getTouchIdEnabled();
		$.touchIdSwitch.value = touchIdEnabled;
	}
	if (Properties.getTouchIdUser() != undefined) {
		touchIdUser = Properties.getTouchIdUser();
		$.touchIdTextField.value = touchIdUser;
	}
	if (touchIdEnabled) {
		$.touchIdTextField.enabled = true;
	}
}

function onAndroidBack(e) {
	onCancelClick();
	// $.serversetupWindow.close();
	// if (exitAction) {
	// exitAction();
	// } else {
	// if (OS_ANDROID) {
	// if (androidNoWindow) {
	// Ti.Android.currentActivity.finish();
	// }
	// }
	// }
}

function onOkClick() {
	if (dirty) {
		Properties.setServerName($.serverTextField.value);
		Properties.setHttps($.httpsSwitch.value);
		Properties.setWebApplication($.webAppTextField.value);
		
		if (touchIdEnabled != undefined) {
			Properties.setTouchIdEnabled(touchIdEnabled);
		}
		if (touchIdUser != undefined) {
			Properties.setTouchIdUser(touchIdUser);
		}
		
		if (OS_IOS && Alloy.Globals.showLogging) {
			Properties.setLogEnabled($.logSwitch.value);
		}
		setupChanged();
	}

	close();

	if (dirty && exitAction) {
		exitAction();
	}

}

function onCancelClick() {
	close();
}

function close() {
	if (OS_IOS) {
		if (Alloy.isHandheld) {
			$.serversetup.close();
		}
		if (Alloy.isTablet) {
			$.serversetup.hide();
		}
	}
	if (OS_ANDROID) {
		$.serversetupWindow.close();
	}
}

function onSendLogButtonClick(e) {
	new Logger().sendEmail();
}

function onServerTextFieldChange(e) {
	dirty = true;
}

function onHttpsSwitchChange(e) {
	dirty = true;
}

function onLogSwitchChange(e) {
	dirty = true;
}

function onWebAppTextFieldChange(e) {
	dirty = true;
}
function onTouchIdSwitchChange(e) {
	dirty = true;
	if ($.touchIdSwitch.value == true) {
		$.touchIdTextField.enabled = true;
		touchIdEnabled = true;
	} else {
		touchIdEnabled = false;
		$.touchIdTextField.value = '';
		$.touchIdTextField.enabled = false;
		touchIdUser = undefined;
	}
}

function onTouchIdTextFieldChange(e) {
	dirty = true;
	touchIdUser = $.touchIdTextField.value;
}


function setupChanged() {
	if (settingsUpdated) {
		settingsUpdated();
	}
}

exports.open = function(view) {
	if (OS_IOS) {
		if (Alloy.isTablet) {
			$.serversetup.show({
				view : view
			});
		} else {
			$.serversetup.open({
				modal : true
			});
		}
	} else {
		$.serversetupWindow.open({
			modal : true
		});
	}
};
