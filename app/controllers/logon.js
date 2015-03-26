//var TiTouchId = null;
var Properties = require('tools/Properties');
var ResponseUtils = require('ResponseUtils');
var args = arguments[0] || {};
var parent = args.parent;
var enableServersetup = args.enableServersetup;

var connection = Alloy.createController('ServerConnection', {
	callback : $
});

var onLogonAction = null;
var name = 'not set';

var useTouchId = false;

Alloy.Globals.logon = $;
Alloy.Globals.workspaceExitOnClose = false;

$.usernameTextField.value = Properties.getLastUser();

if (Alloy.Globals.canUseTouchId) {
	$.logonButton.addEventListener('longpress', logonWithTouchId);
}

// Always exit application if android back i pressed on login
function onAndroidBack(e) {
	// Close index -> exit application
	$.logonWindow.close();
	parent.close();
}

function onAndroidHomeClick(e) {
	showMenu(false, false);
}

function onAndroidSettingsClick(e) {
	showMenu(true, false);
}

function onMenuButtonClick(e) {
	showMenu(false, false);
}

function showMenu(gotoServersetup, showAbout) {
	var menu = Alloy.createController('menu/menu', {
		serversetup : enableServersetup,
		exitAction : $.settingsUpdated,
		support : true,
		about : true,
		logoff : false,
		showServersetup : gotoServersetup,
		showAbout : showAbout
	}).open();
}

function onAboutClick(e) {
	showMenu(false, true);
}

function onClick(e) {
	$.usernameTextField.blur();
	$.passwordTextField.blur();
}

function onFocus() {
	$.logonButton.visible = true;
}

function onWindowFocus() {
	logonWithTouchId();
	$.logonButton.visible = true;
}

function onWindowOpen(e) {
	//	logonWithTouchId();

	// if ($.usernameTextField.value.length > 0) {
	// $.passwordTextField.focus();
	// } else {
	// $.usernameTextField.focus();
	// }
}

function onUsernameTextFieldReturn(e) {
	$.passwordTextField.focus();
}

function onPasswordTextFieldReturn(e) {
	onLogonButtonClick(e);
}

function onUserPasswordChange(e) {
	$.errorLabel.text = '';
}

function onLogonButtonClick(e) {

	var password = $.passwordTextField.value;

	if ($.usernameTextField.value && password) {
		if ($.usernameTextField.value === 'demo' && password != 'demo') {
			$.passwordTextField.focus();
			// animation.shake($.logonView);
			$.errorLabel.text = L('password_incorrect');
			//alert(L('password_incorrect'));
			Ti.UI.createAlertDialog({
				message : L('password_incorrect')
			}).show();

			return;
		}
		Properties.setLastUser($.usernameTextField.value);
		Alloy.Globals.setCredentials($.usernameTextField.value, password);

		if (onLogonAction) {
			connection.send({
				action : 'onLogon',
				type : 'logon',
				logon : {
					name : name,
					username : $.usernameTextField.value,
					password : new String(Ti.Utils.base64encode(password)),
					onLogon : onLogonAction,
					fields : [{
						name : 'username',
						type : 'string',
						value : $.usernameTextField.value
					}, {
						name : 'password',
						type : 'password',
						value : new String(Ti.Utils.base64encode(password))
					}]
				}
			}, false, L('busy_login_label'));

		} else {
			connection.send({
				action : 'logon',
				type : 'user',
				user : {
					login : $.usernameTextField.value,
					username : $.usernameTextField.value,
					password : new String(Ti.Utils.base64encode(password))
				}
			}, false, L('busy_login_label'));
		}
		$.usernameTextField.blur();
		$.passwordTextField.blur();
		$.logonButton.visible = false;

	} else if (password != '') {
		$.usernameTextField.focus();
		// animation.shake($.logonView);
		Ti.Media.vibrate();
		$.errorLabel.text = L('username_required');
		//alert(L('username_required'));
		Ti.UI.createAlertDialog({
			message : L('username_required')
		}).show();
	} else if ($.usernameTextField.value != '') {
		$.passwordTextField.focus();
		// animation.shake($.logonView);
		Ti.Media.vibrate();
		$.errorLabel.text = L('password_required');
		//alert(L('password_required'));
		Ti.UI.createAlertDialog({
			message : L('password_required')
		}).show();
	} else {
		$.usernameTextField.focus();
		// animation.shake($.logonView);
		Ti.Media.vibrate();
		$.errorLabel.text = L('username_password_required');
		//alert(L('username_password_required'));
		Ti.UI.createAlertDialog({
			message : L('username_password_required')
		}).show();
	}
}

function askForTouchIdSetup(user) {
	var message = String.format(L('touchid_dialog_message'), user);
	var touchIdDialog = Ti.UI.createAlertDialog({
		title : L('touchid_dialog_header'),
		message : message,
		buttonNames : [L('yes_button'), L('no_button')],
		cancel : 1,
		//style : Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT
	});
	touchIdDialog.addEventListener('click', function(e) {
		if (e.index == e.source.cancel) {
			Properties.setTouchIdEnabled(false);
		} else {
			Properties.setTouchIdEnabled(true);
			Properties.setTouchIdUser(user);
		}
	});
	touchIdDialog.show();
}

function logonWithTouchId() {

	if (Properties.getTouchIdEnabled() === false) {
		Ti.API.info("logonWithTouchId disabled or not supported");
		return false;
	}

	if ($.usernameTextField.value != null && $.usernameTextField.value.length > 0) {
		if (Properties.getTouchIdEnabled() == undefined) {
			Ti.API.info("logonWithTouchId not configured in Crosspad");
			askForTouchIdSetup($.usernameTextField.value);
			return false;
		}
		if (Properties.getTouchIdEnabled() === true && !Properties.getTouchIdUser()) {
			Ti.API.info("logonWithTouchId enabled but no user is defined");
			askForTouchIdSetup($.usernameTextField.value);
			return false;
		}
	}

	var touchIdData = Properties.getTouchId($.usernameTextField.value);
	if (!touchIdData) {
		// No data saved
		return false;
	}
	if (touchIdData /*useTouchId*/) {
		Alloy.Globals.TiTouchId.authenticate({
			reason : L('touchid_reason'),
			callback : function(e) {
				if (!e.success) {
					//alert('Message: ' + e.error + '\nCode: ' + e.code);
					switch(e.code) {
					case Alloy.Globals.TiTouchId.ERROR_AUTHENTICATION_FAILED:
						Ti.API.info('Error code is TiTouchId.ERROR_AUTHENTICATION_FAILED');
						break;
					case Alloy.Globals.TiTouchId.ERROR_USER_CANCEL:
						Ti.API.info('Error code is TiTouchId.ERROR_USER_CANCEL');
						break;
					case Alloy.Globals.TiTouchId.ERROR_USER_FALLBACK:
						Ti.API.info('Error code is TiTouchId.ERROR_USER_FALLBACK');
						break;
					case Alloy.Globals.TiTouchId.ERROR_SYSTEM_CANCEL:
						Ti.API.info('Error code is TiTouchId.ERROR_SYSTEM_CANCEL');
						break;
					case Alloy.Globals.TiTouchId.ERROR_PASSCODE_NOT_SET:
						Ti.API.info('Error code is TiTouchId.ERROR_PASSCODE_NOT_SET');
						break;
					case Alloy.Globals.TiTouchId.ERROR_TOUCH_ID_NOT_AVAILABLE:
						Ti.API.info('Error code is TiTouchId.ERROR_TOUCH_ID_NOT_AVAILABLE');
						break;
					case Alloy.Globals.TiTouchId.ERROR_TOUCH_ID_NOT_ENROLLED:
						Ti.API.info('Error code is TiTouchId.ERROR_TOUCH_ID_NOT_ENROLLED');
						break;
					default:
						Ti.API.info('Error code is unknown');
						break;
					}
				} else {
					// do something useful
					//alert('YAY! success');
					$.usernameTextField.value = touchIdData.user;
					$.passwordTextField.value = touchIdData.password;
					$.logonButton.fireEvent('click');
				}
			}
		});
		return true;
	}
	return false;
}

exports.init = function(data) {
	if (data) {
		name = data.name;
		onLogonAction = data.onLogon;

		if (data.title) {
			if (OS_IOS) {
				$.titleLabel.text = data.title.toString();
			}
			$.logonWindow.title = data.title.toString();
		}

	}
};

exports.close = function(isDashboard) {

	if (isDashboard) {
		return;
	}
	// Return to index
	$.logonWindow.close();
};

exports.settingsUpdated = function() {
	$.close();
	// Tell parent that settings has changed
	parent.settingsUpdated();
};

exports.showError = function(id, message) {
	if (id === 'CPF22E2') {
		$.passwordTextField.focus();
		// animation.shake($.logonView);
		//alert(L('password_incorrect'));
		// if (OS_IOS) {
		// Ti.Media.beep();
		// }
		Ti.Media.vibrate();
		$.errorLabel.text = L('password_incorrect');
		Ti.UI.createAlertDialog({
			message : L('password_incorrect')
		}).show();
	} else if (id === 'CPF2204') {
		$.usernameTextField.focus();
		// animation.shake($.logonView);
		//alert(L('login_error'));
		// User not found!!!
		Ti.Media.vibrate();
		$.errorLabel.text = L('login_error');
		Ti.UI.createAlertDialog({
			message : L('login_error')
		}).show();
	} else if (message) {
		$.passwordTextField.focus();
		// animation.shake($.logonView);
		// alert(message);
		//alert(L('login_error'));
		Ti.Media.vibrate();
		$.errorLabel.text = message.toString();
		Ti.UI.createAlertDialog({
			message : message.toString()
		}).show();
	} else {
		$.passwordTextField.focus();
		// animation.shake($.logonView);
		// alert(message);
		//alert(L('login_error'));
		Ti.Media.vibrate();
		$.errorLabel.text = L('login_error');
		Ti.UI.createAlertDialog({
			message : L('login_error')
		}).show();
	}
};

exports.reset = function(id, message) {
	$.logonButton.visible = true;
	$.passwordTextField.value = '';
	//$.passwordTextField.focus();
};

exports.handleResponse = function(response) {
	var responses = [];
	if (_.isArray(response)) {
		responses = response;
	} else if (response.type === 'actions' || response.actions) {
		responses = response.actions || [];
	} else {
		responses = [response];
	}
	for (var i = 0; i < responses.length; i++) {
		handleAction(responses[i]);
	}
};

function handleAction(response) {
	if (response.error) {
		$.logonButton.visible = true;
		var errorinfo = response.errorinfo || {};
		if (response.errortype == 'logon') {
			// Login error
			$.showError(errorinfo.errorid, errorinfo.errortext);
		} else {
			Ti.UI.createAlertDialog({
				message : errorinfo.errortext
			}).show();
		}
		return;
	}

	switch(ResponseUtils.getType(response)) {
	case 'dashboard':
		Properties.setTouchId();
		var dashboard = Alloy.createController('dashboard', {
			parent : $,
			enableServersetup : enableServersetup,
			loggedOn : true
		});
		dashboard.init(ResponseUtils.getObject(response));
		dashboard.open();
		dashboard = null;
		$.passwordTextField.value = '';

		break;
	case 'application':
		Properties.setTouchId();
		if (Alloy.Globals.logger) {
			Alloy.Globals.logger.write();
		}
		// Start application
		var application = Alloy.createController('application/application', {
			standAlone : true,
			loggedOn : true
		});
		application.startApplication(response);
		application = null;
		$.passwordTextField.value = '';
		break;
	case 'acsinfo':
		Alloy.Globals.initAcs(ResponseUtils.getObject(response));
		break;
	case 'beaconsinfo':
		Alloy.Globals.initBeacons(ResponseUtils.getObject(response));
		break;
	case 'metadatainfo':
		Alloy.Globals.initMetadata(ResponseUtils.getObject(response));
		break;
	// OLD support
	case 'logon':
		start();
		break;
	}

	if (response.type != 'logon') {
		$.reset();
	}

};

exports.handleError = function(message, desc) {
	$.logonButton.visible = true;
	Ti.UI.createAlertDialog({
		message : desc
	}).show();
};

// OLD start request
function start() {
	if (Alloy.Globals.guid === null) {
		Alloy.Globals.guid = Ti.Platform.createUUID();
	}

	var request = {
		action : 'start',
		type : 'start',
		start : {
			osname : Ti.Platform.osname,
			locale : Ti.Platform.locale,
		}
	};

	connection.send(request);
}

