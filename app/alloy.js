// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

var Properties = require('tools/Properties');

Alloy.Globals.isIOS8Plus = (OS_IOS && parseInt(Ti.Platform.version, 10) >= 8);
Alloy.Globals.iPhoneShort = (OS_IOS && Ti.Platform.osname == "iphone" && Ti.Platform.displayCaps.platformHeight < 568);
Alloy.Globals.iPhone6Plus = (OS_IOS && Ti.Platform.osname == "iphone" && Ti.Platform.displayCaps.platformHeight == 736);
Alloy.Globals.isHighDensity = (Ti.Platform.displayCaps.density == 'high');
Alloy.Globals.showLogging = !ENV_PRODUCTION;

// If no logon then exit when Workspace is closed.
Alloy.Globals.workspaceExitOnClose = true;

Alloy.Globals.inBackground = false;

Alloy.Globals.credentials = null;

// Global reference to Index
Alloy.Globals.index = null;

// Global reference to Dashboard
Alloy.Globals.dashboard = null;
// Global reference to Logon
Alloy.Globals.logon = null;
// Global reference to all running Applications
Alloy.Globals.applicationStack = [];
// Global reference to current running application
Alloy.Globals.currentApplication = null;

Alloy.Globals.applicationStarted = function(appl) {
	Alloy.Globals.applicationStack.push(appl);
	Alloy.Globals.currentApplication = appl;

	Ti.API.info('applicationStarted current: ' + Alloy.Globals.applicationStack.length + ' ' + Alloy.Globals.currentApplication.getTitle());
};
Alloy.Globals.applicationEnded = function(appl) {
	for (var i = 0; i < Alloy.Globals.applicationStack.length; i++) {
		if (appl === Alloy.Globals.applicationStack[i]) {
			Alloy.Globals.applicationStack.splice(i, 1);
			break;
		}
	};
	if (Alloy.Globals.applicationStack.length > 0) {
		Alloy.Globals.currentApplication = Alloy.Globals.applicationStack[Alloy.Globals.applicationStack.length - 1];
	} else {
		Alloy.Globals.currentApplication = null;
	}

	if (Alloy.Globals.currentApplication) {
		Ti.API.info('applicationEnded current: ' + Alloy.Globals.applicationStack.length + ' ' + Alloy.Globals.currentApplication.getTitle());
	} else {
		Ti.API.info('applicationEnded current: ' + Alloy.Globals.applicationStack.length + ' ' + Alloy.Globals.currentApplication);
	}
};
Alloy.Globals.applicationSwitch = function(appl) {
	Alloy.Globals.currentApplication = appl;
	appl.show();
	for (var i = 0; i < Alloy.Globals.applicationStack.length; i++) {
		if (appl === Alloy.Globals.applicationStack[i]) {
			continue;
		}
		Alloy.Globals.applicationStack[i].hide();
	};

};
Alloy.Globals.applicationHideAll = function() {
	Alloy.Globals.currentApplication = null;
	for (var i = 0; i < Alloy.Globals.applicationStack.length; i++) {
		Alloy.Globals.applicationStack[i].hide();
	};

};
Alloy.Globals.applicationCloseAll = function() {
	Alloy.Globals.currentApplication = null;
	// Backwards because close on application removes it from applicationStack
	for (var i = Alloy.Globals.applicationStack.length - 1; i >= 0; i--) {
		Alloy.Globals.applicationStack[i].close();
	};
	Alloy.Globals.applicationStack = [];
};

Alloy.Globals.guid = null;
Alloy.Globals.jsonLog = null;
Alloy.Globals.logger = null;

Alloy.Globals.resetCredentials = function() {
	Alloy.Globals.credentials = null;
};
Alloy.Globals.setCredentials = function(user, password) {
	Alloy.Globals.credentials = {
		user : user,
		password : password,
		basicAuth : 'Basic ' + Ti.Utils.base64encode(user + ':' + password).toString()
	};
};

Alloy.Globals.getCredentials = function() {
	return Alloy.Globals.credentials;
};

// Global ref to push notifications
Alloy.Globals.pushNotification = require('PushNotification');

Alloy.Globals.initAcs = function(data) {
	if (Alloy.Globals.pushNotification) {
		Alloy.Globals.pushNotification.init(data);
	}
};

Alloy.Globals.initMetadata = function(data) {
	Alloy.Globals.metadata = data;
};
Alloy.Globals.getMetadataItems = function() {
	if (Alloy.Globals.metadata && Alloy.Globals.metadata.items && Alloy.Globals.metadata.items.length > 0) {
		return Alloy.Globals.metadata.items;
	}
	return null;
};

if (OS_IOS) {
	Ti.App.addEventListener('paused', function(e) {
		//Ti.API.info("APP In background");
		Alloy.Globals.inBackground = true;
	});
	Ti.App.addEventListener('resumed', function(e) {
		//Ti.API.info("Resuming APP");
		Alloy.Globals.inBackground = false;
	});
}

// if (OS_ANDROID) {
// Ti.Android.currentActivity.addEventListener('pause', function(e) {
// Ti.API.info("APP In background");
// Alloy.Globals.inBackground = true;
// });
// Ti.Android.currentActivity.addEventListener('resume', function(e) {
// Ti.API.info("Resuming APP");
// Alloy.Globals.inBackground = false;
// });
// }

// Global ref to iBeacons

if (OS_IOS) {
	Alloy.Globals.iBeacon = require('Ibeacon');
}
Alloy.Globals.initBeacons = function(data) {
	if (Alloy.Globals.iBeacon) {
		Alloy.Globals.iBeacon.init(data);
	}
};

// Support for Linea scanner
if (Properties.isLinearScannerRequired()) {

	Alloy.Globals.lineapro = require('dk.eg.crosspad.linea.scanner');
	Alloy.Globals.lineapro.addEventListener('connection_state_connected', function(e) {
		Ti.App.fireEvent("lineaConnectionState", e);
	});

	Alloy.Globals.lineapro.addEventListener('scannedBarcode', function(e) {
		Ti.App.fireEvent("lineaBarcodeData", e);
	});

	Alloy.Globals.lineapro.addEventListener('magneticCardData', function(e) {
		Ti.App.fireEvent("lineaMagneticCardData", e);
	});
	Alloy.Globals.hardwareScanner = null;
	var HardwareScanner = require('HardwareScanner');
	if (HardwareScanner) {
		Alloy.Globals.hardwareScanner = new HardwareScanner();
	}
}

Alloy.Globals.TiTouchId = null;
Alloy.Globals.canUseTouchId = false;
if (OS_IOS) {
	if (!ENV_DEV) {
		if (Alloy.Globals.isIOS8Plus) {
			Alloy.Globals.TiTouchId = require('ti.touchid');
			if (Alloy.Globals.TiTouchId.deviceCanAuthenticate) {
				var ttInfo = Alloy.Globals.TiTouchId.deviceCanAuthenticate();
				if (ttInfo) {
					Alloy.Globals.canUseTouchId = ttInfo.canAuthenticate;
				}
			}
		}
	}
}

Alloy.Globals.Map = require('ti.map'); 