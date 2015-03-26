var CFG = require('alloy').CFG;
var Properties = require('tools/Properties');
var Conversion = require('tools/Conversion');
var Logger = require('Logger');
var ResponseUtils = require('ResponseUtils');
var enableServersetup = Properties.isServersetupEnabled();
var logonRequired = Properties.islogonRequired();

var connection = Alloy.createController('ServerConnection', {
	callback : $
});

var Cache = require('Cache');
var cache = new Cache();

// Set global ref to Index
Alloy.Globals.index = $;

Ti.API.debug("Before Cache Cleanup: " + JSON.stringify(cache.info()));
cache.cleanup();
Ti.API.debug("After Cache Cleanup: " + JSON.stringify(cache.info()));

$.mainWindow.open({
	animated : false
});

init();

function onSettingsButtonClick(e) {
	showMenu(false);
}

function showMenu(gotoServersetup) {
	var menu = Alloy.createController('menu/menu', {
		index : true,
		serversetup : enableServersetup,
		exitAction : $.settingsUpdated,
		about : true,
		showServersetup : gotoServersetup
	}).open();
}

function init() {
	Alloy.Globals.logger = new Logger("init.log");
	Alloy.Globals.guid = Ti.Platform.createUUID();

	var requestInfo = {
		action : 'init',
		request : {
			action : 'init',
			type : 'init',
			init : {
				acsapikey : Properties.getAcsApiKey(),
				version : Properties.getVersion(),
				osname : Ti.Platform.osname,
				locale : Ti.Locale.getCurrentLocale(),
				language : Ti.Locale.getCurrentLanguage(),
				country : Ti.Locale.getCurrentCountry(),
				devicetype : Alloy.isTablet ? 'tablet' : 'handheld',
				deviceheight : Ti.Platform.displayCaps.platformHeight,
				devicewidth : Ti.Platform.displayCaps.platformWidth,
				deviceid : Properties.getUDID(),
				guid : Alloy.Globals.guid,
				logon : logonRequired,
				decimalSeperator : Conversion.getDecimalSeparator(),
				thousandSeperator : Conversion.getThousandSeparator()
			}
		}
	};

	connection.sendInfo(requestInfo, false, L('busy_init_label'));
}

exports.close = function() {
	$.mainWindow.close();
};

exports.settingsUpdated = function() {
	init();
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
		var errorinfo = response.errorinfo || {};
		Ti.UI.createAlertDialog({
			message : errorinfo.errortext
		}).show();
		return;
	}

	switch(ResponseUtils.getType(response)) {
	case 'serverinfo':
		Properties.setInitInfo(ResponseUtils.getObject(response));
		break;
	case 'clientupdate':
		var clientVersionRequired = ResponseUtils.getObject(response).required;
		var menu = Alloy.createController('menu/menu', {
			index : true,
			serversetup : enableServersetup,
			exitAction : $.settingsUpdated,
			about : true,
			update : true,
			clientVersionRequired : clientVersionRequired
		}).open();
		break;
	case 'logon':
		var logon = Alloy.createController('logon', {
			parent : $,
			enableServersetup : enableServersetup
		});
		logon.init(ResponseUtils.getObject(response));
		logon.getView().open();
		break;
	case 'dashboard':
		var dashboard = Alloy.createController('dashboard', {
			parent : $,
			enableServersetup : enableServersetup,
			loggedOn : false
		});
		dashboard.init(ResponseUtils.getObject(response));
		dashboard.open();
		break;
	case 'application':
		if (Alloy.Globals.logger) {
			Alloy.Globals.logger.write();
		}
		// Start application
		var appl = Alloy.createController('application/application', {
			standAlone : true,
			loggedOn : false
		});
		appl.startApplication(response);
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
	case 'init':
		handleOldInitResponse(response);
		break;
	}
};

exports.handleError = function(message, desc) {

	var requestInfo = connection.getRequestInfo();
	if (requestInfo) {
		if (requestInfo.action === 'init') {
			if (enableServersetup) {
				showMenu(true);
			}
		}
	}
};

// OLD init response
function handleOldInitResponse(response) {
	switch(response.type) {
	case 'init':
		var init = response.init || {};
		Properties.setInitInfo(init);

		// Old Default
		Conversion.setJsonDateFormat('YYYYMMDD');
		Conversion.setJsonMonthFormat('YYYYMM');
		Conversion.setJsonTimeFormat('HHmmss');

		var clientVersionValid = init.valid;
		var clientVersionRequired = init.required;
		var loginRequired = init.logon;

		if (init.newdateformat) {
			Conversion.setJsonDateFormat('YYYY-MM-DD');
			Conversion.setJsonMonthFormat('YYYY-MM');
			Conversion.setJsonTimeFormat('HH:mm:ss');
		}

		var anonymousUser = init.user;
		var anonymousPassword = init.password;

		// Override from config.json - developer
		if (CFG.anonymousUser) {
			anonymousUser = CFG.anonymousUser;
		}
		// Override from config.json - developer
		if (CFG.anonymousPassword) {
			anonymousPassword = CFG.anonymousPassword;
		}

		if (!clientVersionValid) {
			var menu = Alloy.createController('menu/menu', {
				//parent : $.mainWindow,
				index : true,
				serversetup : enableServersetup,
				exitAction : $.settingsUpdated,
				about : true,
				update : true,
				clientVersionRequired : clientVersionRequired
			}).open();
		} else {
			if (loginRequired) {
				var logon = Alloy.createController('logon', {
					parent : $,
					enableServersetup : enableServersetup
				});
				logon.getView().open();
			} else {
				if (anonymousUser) {
					Alloy.Globals.setCredentials(anonymousUser, anonymousPassword);
				}
				start();
			}
		}
		break;
	}

}

// OLD start request
function start() {
	if (Alloy.Globals.guid === null) {
		Alloy.Globals.guid = Ti.Platform.createUUID();
	};

	connection.send({
		action : 'start',
		type : 'start',
		start : {
			osname : Ti.Platform.osname,
			locale : Ti.Platform.locale
		}
	});
}

