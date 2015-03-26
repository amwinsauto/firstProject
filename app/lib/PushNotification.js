var Conversion = require('tools/Conversion');

var debug = true;
var cheat = false;
var Log = require('tools/Log');
var CloudPush = null;
var Cloud = null;
var deviceToken;
var registered = false;
var loggedIn = false;

exports.init = function(data) {

	if (!Cloud) {
		Cloud = require('ti.cloud');
		Cloud.debug = debug;
	}

	if (!data) {
		data = {};
	}

	if (!data.username) {
		data.username = '';
	}
	if (!data.password) {
		data.password = '';
	} else {
		data.password = Conversion.base64Decode(data.password);
	}
	if (!data.channels) {
		data.channels = [];
	}

	$ = this;

	if (cheat) {
		deviceToken = '1709d1910dab2f40140009984fbfa6e41e4873c707af0f162abfb35ed6c7a79d';
		$.login(data);
		return;
	}

	function deviceTokenSuccess(e) {
		Log.debug('Device Token: ' + e.deviceToken, debug);
		deviceToken = e.deviceToken;
		$.login(data);
	}

	function deviceTokenError(e) {
		Log.error('Failed to register for push! ' + e.error);
		alert('error retrieveDeviceToken' + e.error);
	}

	function receivePush(e) {
		var data = null;
		var inBackground = false;
		if (OS_IOS) {
			data = e.data;
			if (!data) {
				return;
			}
			if (data.badge) {
				Ti.UI.iPhone.appBadge = data.badge;
			}
			if (e.inBackground) {
				inBackground = true;
			}
		}
		if (OS_ANDROID) {
			if (e.payload) {
				var payload = JSON.parse(e.payload);
				data = payload.android;
				if (!data) {
					return;
				}
				if (payload.id) {
					data.id = payload.id;
				}
				if (payload.start) {
					data.start = payload.start;
				}
				if (payload.title) {
					data.title = payload.title;
				}
			}

		}
		doPush(data, inBackground);
		Log.debug("InBackground: " + inBackground, debug);
	}

	if (!registered) {
		registered = true;

		if (OS_ANDROID) {
			CloudPush = require('ti.cloudpush');
			CloudPush.debug = true;
			//CloudPush.enabled = true;

			// Whether or not your application is brought to the foreground whenever a new push is received.
			// Note that this behavior is rather disruptive to users, and is strongly discouraged.
			// Default: false
			CloudPush.focusAppOnPush = false;

			// Whether or not clicking the tray notification will bring your application to the foreground.
			// Default: true
			CloudPush.showAppOnTrayClick = true;

			// Whether or not to show a tray notification when a new push is received.
			// If your payload is only a string, it will be used as the contentText and tickerText, and your application's name will be used as the contentTitle with a system icon.
			// Note that in your payload, you can customize this tray notification using any of the properties of a Titanium.Android.Notification, except for contentIntent and deleteIntent (those are automatically set).
			// Default: true
			CloudPush.showTrayNotification = true;

			// Whether or not to show tray notifications when your application is in the foreground.
			// Instead of showing a notification, the callback event will be immediately fired instead.
			// This is only applicable if you have set showTrayNotification to true.
			// Default: false
			CloudPush.showTrayNotificationsWhenFocused = true;

			// Set to true to trigger a single callback for the selected push notification when multiple push notifications are displayed in the tray.
			// In previous versions of the module, clicking on one of the application's push notifications triggered the callbacks for all of the application's push notifications. The new module retains the same behavior by default.
			// Set this property to true to receive a single callback for the push notification selected by the user, regardless of how many push notifications are displayed in the tray.
			// Default: false
			CloudPush.singleCallback = true;

			CloudPush.retrieveDeviceToken({
				success : deviceTokenSuccess,
				error : deviceTokenError
			});

			CloudPush.addEventListener('callback', receivePush);

			//CloudPush.addEventListener('trayClickLaunchedApp', function(evt) {
			//	Log.debug('Tray Click Launched App (app was not running)', debug);
			//	alert(JSON.stringify(evt));
			//alert('Tray Click Launched App (app was not running');
			//});

			//CloudPush.addEventListener('trayClickFocusedApp', function(evt) {
			//	Log.debug('Tray Click Focused App (app was already running)', debug);
			//	alert(JSON.stringify(evt));
			//alert('Tray Click Focused App (app was already running)');
			//});

		} else if (OS_IOS) {
			if (Alloy.Globals.isIOS8Plus) {
				function registerForPush() {
					Ti.Network.registerForPushNotifications({
						success : deviceTokenSuccess,
						error : deviceTokenError,
						callback : receivePush
					});
					// Remove event listener once registered for push notifications
					Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush);
				}

				// Wait for user settings to be registered before registering for push notifications
				Ti.App.iOS.addEventListener('usernotificationsettings', registerForPush);

				// Register notification types to use
				Ti.App.iOS.registerUserNotificationSettings({
					types : [Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE, Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND]
				});

			} else {
				Ti.Network.registerForPushNotifications({
					types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
					success : deviceTokenSuccess,
					error : deviceTokenError,
					callback : receivePush
				});
			}
		}
	} else {
		$.login(data);
	}
};

function doPush(data, inBackground) {
	var id = data.id;
	var alert = data.alert;
	var start = data.start;

	if (!Alloy.Globals.currentApplication && !Alloy.Globals.dashboard) {
		inBackground = false;
		// Show allert if any
		start = false;
		// No start button
		id = null;
		// do not call
	}

	if (alert && !inBackground) {
		var title = data.title ? data.title.toString() : '';
		var message = alert ? alert.toString() : '';
		var buttonNames = [L('close_button')];
		if (start && id) {
			buttonNames.push(L('start_button'));
		}
		var alertDialog = Ti.UI.createAlertDialog({
			title : title,
			message : alert,
			buttonNames : buttonNames
			//cancel : 0
		});
		alertDialog.addEventListener('click', function(e) {
			if (e.index === 0) {
				// Close pushed
				data.start = false;
			} else {
				// Start pushed
				data.start = true;
			}
			if (id) {
				handlePush(data);
			}
		});
		alertDialog.show();

	} else {
		// No alert
		if (id) {
			handlePush(data);
		}
	}
}

function handlePush(data) {

	// Let workspace handle response;
	if (Alloy.Globals.dashboard) {
		Alloy.Globals.dashboard.push(data);
		return;
	}
}

exports.login = function(data) {
	var $ = this;

	if (Ti.App.Properties.hasProperty("OldCloudData")) {
		var oldCloudData = Ti.App.Properties.getObject("OldCloudData");
		Ti.App.Properties.removeProperty("OldCloudData");

		//$.unsubscribe(oldCloudData, data, true);
		//return;

		if (oldCloudData.username != data.username) {
			$.unsubscribe(oldCloudData, data, true);
			return;
		}
		if (oldCloudData.channels.length != data.channels.length) {
			$.unsubscribe(oldCloudData, data, true);
			return;
		}

		for (var i = 0; i < oldCloudData.channels.length; i++) {
			if (oldCloudData.channels[i] != data.channels[i]) {
				$.unsubscribe(oldCloudData, data, true);
				return;
			}
		}

		// if (oldCloudData && oldCloudData.channels && oldCloudData.channels.length > 0) {
		// $.unsubscribe(oldCloudData, data, true);
		// return;
		// }
	}

	if (!data || !data.username || !data.password || data.channels.length < 1) {
		return;
	}

	Ti.App.Properties.setObject("OldCloudData", data);

	Log.debug('Cloud login with username: ' + data.username, debug);
	Cloud.Users.login({
		login : data.username,
		password : data.password
	}, function(e) {
		if (e.success) {
			//alert("login success");
			Log.debug('Cloud login success with username: ' + data.username, debug);
			$.subscribe(data);
		} else {
			//alert("login failed");
			Log.debug('Cloud login failed with username' + data.username, debug);
			//Log.debug('Cloud login error : ' + ((e.error && e.message) || JSON.stringify(e)), debug);
			Cloud.Users.create({
				username : data.username,
				first_name : data.firstname ? data.firstname : data.username,
				last_name : data.lastname ? data.lastname : data.username,
				password : data.password,
				password_confirmation : data.password
			}, function(e) {
				if (e.success) {
					//alert("create user success");
					Log.debug('Cloud create user success with username: ' + data.username, debug);
					$.subscribe(data);
				} else {
					//alert("create user failed");
					Log.error('Cloud create user failed with username: ' + data.username);
					//Log.error('Cloud create user error : ' + ((e.error && e.message) || JSON.stringify(e)));
				}
			});
		}
	});
};

exports.subscribe = function(data) {
	var $ = this;
	if (deviceToken == null) {
		Log.debug('Cloud subscribe error to channel: ' + channel + " no deviceToken!!!", debug);
		return;
	}

	if (!data || !data.channels || data.channels.length == 0) {
		return;
	}

	var channel = data.channels.pop();
	Log.debug('Cloud subscribe to: ' + channel, debug);
	Cloud.PushNotifications.subscribe({
		channel : channel,
		device_token : deviceToken,
		type : (Ti.Platform.osname === 'android') ? 'android' : 'ios'
	}, function(e) {
		if (e.success) {
			//alert("subscribe success " + channel);
			Log.debug('Cloud subscribe success to channel: ' + channel, debug);
			$.subscribe(data);
		} else {
			//alert("subscribe error " + channel);
			Log.error('Cloud subscribe error to channel: ' + channel);
			Log.error('Cloud subscribe error : ' + ((e.error && e.message) || JSON.stringify(e)));
		}
	});
};

exports.unsubscribe = function(oldData, newData, doLogin) {
	var $ = this;
	if (deviceToken == null) {
		Log.debug("Cloud unsubscribe error no deviceToken!!!", debug);
		return;
	}

	if (!oldData || !oldData.username || !oldData.password || !oldData.channels || oldData.channels.length < 1) {
		if (doLogin) {
			$.login(newData);
		}
		return;
	}

	// If old User is not logged on
	if (!loggedIn) {
		loggedIn = true;
		Cloud.Users.login({
			login : oldData.username,
			password : oldData.password
		}, function(e) {
			if (e.success) {
				//alert("old login success");
				Log.debug('Old Cloud login success with username: ' + oldData.username, debug);
				$.unsubscribe(oldData, newData, doLogin);
			} else {
				Log.debug('Old Cloud login falied with username: ' + oldData.username, debug);
			}
		});
		return;

	}

	if (oldData.channels.length < 1) {
		$.logout(newData, doLogin);
		return;
	}

	var channel = oldData.channels.pop();

	Log.debug('Cloud unsubscribe to ' + channel, debug);
	Cloud.PushNotifications.unsubscribe({
		device_token : deviceToken,
		//channel : channel,
		type : (Ti.Platform.osname === 'android') ? 'android' : 'ios'
	}, function(e) {
		if (e.success) {
			Log.debug('Cloud unsubscribe success to ' + channel, debug);
			$.logout(newData, doLogin);
			//$.unsubscribe(oldData, newData, doLogin);
			//alert('unsubscribe Success: ' + channel);
		} else {
			Log.error('Cloud unsubscribe error to ' + channel);
			//Log.error('Cloud unsubscribe error : ' + ((e.error && e.message) || JSON.stringify(e)));
			//alert('unsubscribe error: ' + channel);
			$.logout(newData, doLogin);
		}
	});
};

exports.logout = function(newData, doLogin) {
	var $ = this;
	Log.debug('Cloud logout', debug);
	Cloud.Users.logout(function(e) {
		if (e.success) {
			//alert('Logged out');
			Log.debug('Cloud logout success', debug);
			if (doLogin) {
				$.login(newData);
			}
		} else {
			//alert('Logged out failed');
			Log.debug('Cloud logout failed ', debug);
			//Log.debug('Cloud logout error : ' + ((e.error && e.message) || JSON.stringify(e)), debug);
			if (doLogin) {
				$.login(newData);
			}
		}
	}, {
		device_token : deviceToken
	});
};
