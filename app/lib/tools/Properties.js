// CrossPad defaults
var CFG = Alloy.CFG;
var logEnabled = false;

// App individual settings
var https = CFG.https != undefined ? CFG.https : true;
var server = CFG.server != undefined ? CFG.server : 'demo.aspect4.com';
var webApplication = CFG.webApplication != undefined ? CFG.webApplication : 'crosspad';
var appendSlashToWebApplication = CFG.appendSlashToWebApplication != undefined ? CFG.appendSlashToWebApplication : false;
var timeOut = CFG.timeOut != undefined ? CFG.timeOut : 30000;
var iosAppId = CFG.iosAppId != undefined ? CFG.iosAppId : 501296128;
var serversetupEnabled = CFG.serversetupEnabled != undefined ? CFG.serversetupEnabled : true;
var logonRequired = CFG.logonRequired != undefined ? CFG.logonRequired : true;
var linearScanner = CFG.linearScanner != undefined ? CFG.linearScanner : true;
var supportUrl = CFG.supportUrl != undefined ? CFG.supportUrl : 'http://www.aspect4.com/crosspad/%s/support.php';
var serverType = CFG.serverType != undefined ? CFG.serverType : '';

Ti.API.debug('Setup:\n' + JSON.stringify({
	https : https,
	server : server,
	webApplication : webApplication,
	appendSlashToWebApplication : appendSlashToWebApplication,
	timeOut : timeOut,
	iosAppId : iosAppId,
	serversetupEnabled : serversetupEnabled,
	logonRequired : logonRequired,
	linearScanner : linearScanner,
	supportUrl : supportUrl,
	serverType : serverType
}, undefined, 3));

// ASPECT4 Day Defaults
// if (CFG.settings === 'a4day') {
// serversetupEnabled = false;
// logonRequired = false;
// server = 'demo.aspect4.com';
// https = true;
// supportUrl = 'http://www.aspect4.com/crosspad/' + L('image_path_prefix') + '/event.php';
// }

// AdvoPro Defaults
// if (CFG.settings === 'advopro') {
// iosAppId = 738989417;
// linearScanner = false;
// serversetupEnabled = true;
// logonRequired = false;
// server = 'appdemo.advopro.dk';
// https = true;
// webApplication = 'apMobil/';
// appendSlashToWebApplication = true;
// supportUrl = 'http://www.aspect4.com/crosspad/' + L('image_path_prefix') + '/support.php?id=advopro';
// }
// EGRetail defaults
// if (CFG.settings === 'egretail') {
// linearScanner = false;
// }

// Paii Defaults
// if (CFG.settings === 'paii') {
// //iosAppId = 738989417;
// linearScanner = false;
// serversetupEnabled = false;
// logonRequired = true;
// //server = 'appdemo.advopro.dk';
// https = true;
// //webApplication = 'apMobil/';
// //appendSlashToWebApplication = true;
// supportUrl = 'http://www.aspect4.com/crosspad/' + L('image_path_prefix') + '/support.php?id=paii';
// }

// AX Defaults
// if (CFG.settings === 'axcrosspad') {
// serversetupEnabled = true;
// logonRequired = false;
// server = '87.51.6.172:1337';
// https = false;
// webApplication = 'Default.aspx';
// supportUrl = 'http://www.aspect4.com/crosspad/' + L('image_path_prefix') + '/support.php?id=ax';
// }

// EG Defaults
// if (CFG.settings === 'egcrosspad') {
// iosAppId = 815569618;
// linearScanner = false;
// serversetupEnabled = true;
// logonRequired = true;
// server = 'demo.aspect4.com';
// https = true;
// webApplication = 'crosspad';
// supportUrl = 'http://www.aspect4.dk/crosspad/' + L('image_path_prefix') + '/support.php?id=egcrosspad';
// }

// TUN defaults
// if (CFG.settings === 'tun') {
// serversetupEnabled = false;
// logonRequired = false;
// https = false;
// server = 'mobil.byggebasen.dk';
// webApplication = 'default.aspx';
// iosAppId = '';
// }

// if (CFG.settings === 'xl') {
// https = false;
// server = 'mobil.byggebasen.dk';
// webApplication = 'default.aspx';
// timeOut = 30000;
// iosAppId = '';
// }

exports.getUDID = function() {
	var udid = Ti.App.Properties.getString('UDID', '');
	if (udid === '') {
		udid = Ti.Platform.createUUID();
		Ti.App.Properties.setString('UDID', udid);
	}
	return udid;
};
exports.getAcsApiKey = function() {
	if (Ti.App.deployType === 'production') {
		return Ti.App.Properties.getString('acs-api-key-production', '');
	} else {
		return Ti.App.Properties.getString('acs-api-key-development', '');
	}
};

exports.getSupportUrl = function() {
	//	return supportUrl;
	return String.format(supportUrl, L('image_path_prefix'));
};

exports.isLogEnabled = function() {
	if (ENV_PRODUCTION) {
		return false;
	}
	return Ti.App.Properties.getBool('logEnabled', logEnabled);
};

exports.setLogEnabled = function(log) {
	return Ti.App.Properties.setBool('logEnabled', log);
};

exports.islogonRequired = function() {
	if (!serversetupEnabled) {
		return logonRequired;
	}
	return Ti.App.Properties.getBool('logonRequired', logonRequired);
};

exports.setlogonRequired = function(logonRequired) {
	//	return Ti.App.Properties.setBool('logonRequired', logonRequired);
};

exports.isServersetupEnabled = function() {
	if (!serversetupEnabled) {
		return serversetupEnabled;
	}
	return Ti.App.Properties.getBool('serversetupEnabled', serversetupEnabled);
};

exports.setServersetupEnabled = function(serversetupEnabled) {
	//	return Ti.App.Properties.setBool('serversetupEnabled', serversetupEnabled);
};

exports.getServerName = function() {
	if (!serversetupEnabled) {
		return server;
	}
	return Ti.App.Properties.getString('servername', server);
};

exports.setServerName = function(serverName) {
	if (serverName) {
		return Ti.App.Properties.setString('servername', serverName.trim());
	}
	return Ti.App.Properties.setString('servername', '');
};

exports.isHttps = function() {
	if (!serversetupEnabled) {
		return https;
	}
	return Ti.App.Properties.getBool('https', https);
};

exports.setHttps = function(https) {
	return Ti.App.Properties.setBool('https', https);
};

exports.getWebApplication = function() {
	var app = webApplication;
	
	if (serversetupEnabled) {
		app = Ti.App.Properties.getString('webapplication', webApplication);
	}

	if (appendSlashToWebApplication && app) {
		if (app.indexOf('/') == -1) {
			app += '/';
		}
	}

	return app;
};

exports.setWebApplication = function(webApplication) {
	if (webApplication) {
		return Ti.App.Properties.setString('webapplication', webApplication.trim());
	}
	return Ti.App.Properties.setString('webapplication', '');
};

exports.getServerUrl = function() {
	var uri = null;
	if (this.isHttps()) {
		uri = 'https://';
	} else {
		uri = 'http://';
	}
	uri += this.getServerName();
	uri += '/' + this.getWebApplication();
	return uri;
};

exports.getTouchIdEnabled = function() {
	if (!Alloy.Globals.canUseTouchId) {
		return false;
	}

	if (Ti.App.Properties.hasProperty('touchIdEnabled')) {
		return Ti.App.Properties.getBool('touchIdEnabled');
	} else {
		return undefined;
	}
};
exports.setTouchIdEnabled = function(enabled) {
	if (enabled === true || enabled === false) {
		Ti.App.Properties.setBool('touchIdEnabled', enabled);
	}
};
exports.getTouchIdUser = function() {
	if (Ti.App.Properties.hasProperty('touchIdUser')) {
		return Ti.App.Properties.getString('touchIdUser');
	} else {
		return '';
	}
};
exports.setTouchIdUser = function(user) {
	if (user) {
		Ti.App.Properties.setString('touchIdUser', user);
	} else {
		Ti.App.Properties.setString('touchIdUser', '');
	}
};

exports.setTouchId = function() {
	if (OS_IOS && Alloy.Globals.getCredentials() && this.getTouchIdEnabled()) {
		var key = 'touchId_' + Ti.Utils.base64encode(this.getServerUrl()).toString();
		var value = {
			user : Alloy.Globals.getCredentials().user,
			password : Alloy.Globals.getCredentials().password
		};

		// Only save on username setup as touchIdUsername
		if (value.user != this.getTouchIdUser()) {
			return;
		}

		value = Ti.Utils.base64encode(JSON.stringify(value)).toString();
		Ti.App.Properties.setString(key, value);
	}
};
exports.getTouchId = function(user) {
	if (OS_IOS) {
		if (this.getTouchIdEnabled()) {
			var key = 'touchId_' + Ti.Utils.base64encode(this.getServerUrl()).toString();
			var value = Ti.App.Properties.getString(key, null);
			if (value) {
				value = Ti.Utils.base64decode(value).toString();
				value = JSON.parse(value);
				if (value && value.user == user) {
					return value;
				}
			}
		}
		return null;
	} else {
		return null;
	}
};

exports.getTimeOut = function() {
	if (!serversetupEnabled) {
		return timeOut;
	}
	return timeOut;
};

exports.setTimeOut = function(timeOut) {
};

exports.getLastUser = function() {
	return Ti.App.Properties.getString('lastuser', '');
};

exports.setLastUser = function(lastUser) {
	return Ti.App.Properties.setString('lastuser', lastUser);
};

exports.getVersion = function() {
	return Ti.App.version;
};

exports.getAppId = function() {
	if (OS_IOS) {
		return iosAppId;
	}
	return '';
};

exports.isNecessarySettingsSet = function() {
	if (this.getServerName()) {
		return true;
	}
	return false;
};

exports.isLinearScannerRequired = function() {
	if (OS_IOS) {
		return linearScanner;
	}
	return false;
};

exports.isASPECT4 = function() {
	return 'ASPECT4' === serverType;
};

exports.setInitInfo = function(init) {
	Ti.App.Properties.setObject('initInfo', init);

	if (init) {
		// Set setup values
		if (init.type) {
			serverType = init.type;
		}
		try {
			// Anonymous user and password
			if (init.user && init.password) {
				Alloy.Globals.setCredentials(init.user, Ti.Utils.base64decode(init.password).toString());
			}
		} catch(err) {
		}
	}
};

exports.getInitInfo = function() {
	return Ti.App.Properties.getObject('initInfo', {});
};
