//var Connection = require('Connection');
var Properties = require('tools/Properties');
var ResponseUtils = require('ResponseUtils');
var Images = require('Images');
var Logger = require('Logger');
var Conversion = require('tools/Conversion');
var cache = null;

var Scanner = null;
var SMS = null;
var Contact = null;
var Calendar = null;
var UIUtils = require('UIUtils');

var args = arguments[0] || {};
//var connection = new Connection($);
var connection = Alloy.createController('ServerConnection', {
	callback : $
});
var standAlone = args.standAlone;
var loggedOn = args.loggedOn;
var dashboarditem = args.dashboarditem;
var applicationWindowController;

var futureActions = [];
var onClose = null;
var timerAction = null;
var closing = false;
var started = false;

// Controllers
var topController = null;
var masterController = null;
var masterControllers = null;
var masterTabGroup = null;
var detailController = null;
var popupController = null;
var popoverController = null;

var title = '';
var icon = '';

// Main app view
var mainAppView = null;

function onCloseClick(e) {
	if (UIUtils.hideShownOptionDialog()) {
		return;
	}
	if (UIUtils.hideShownPopover()) {
		return;
	}

	if (Alloy.Globals.hardwareScanner) {
		Alloy.Globals.hardwareScanner.reset();
	}

	if (onClose) {
		closing = true;
		connection.sendInfo(onClose, true);
		onClose = null;
		$.close();
	} else {
		$.close();
	}
	if (standAlone && loggedOn) {
		Ti.App.fireEvent('showLogin');
	}
}

// Return the applications title
exports.getTitle = function() {
	return title;
};
exports.getIcon = function() {
	return icon;
};
// Show application (Application switch)
exports.show = function() {
	if (OS_IOS) {
		mainAppView.visible = true;
		if (topController) {
			topController.show();
		}
		if (masterTabGroup) {
			masterTabGroup.visible = true;
		} else if (masterController) {
			masterController.show();
		}
		if (detailController) {
			detailController.show();
		}
		if (popupController) {
			popupController.show();
		}
		if (popoverController) {
			popoverController.show();
		}

	}
};
// Hide application (Application switch)
exports.hide = function() {
	if (OS_IOS) {
		mainAppView.visible = false;
		if (topController) {
			topController.hide();
		}
		if (masterTabGroup) {
			masterTabGroup.visible = false;
		} else if (masterController) {
			masterController.hide();
		}
		if (detailController) {
			detailController.hide();
		}
		if (popupController) {
			popupController.hide();
		}
		if (popoverController) {
			popoverController.hide();
		}
	}
};

exports.androidBack = function() {
	onCloseClick();
};

exports.push = function(data) {
	if (data) {
		if (data.id) {
			//data.start = false;
			connection.send({
				action : 'onPush',
				type : 'push',
				push : {
					id : data.id,
					start : data.start
				}
			});
		}
	}
};

exports.startApplication = function(data) {
	Alloy.Globals.logger = new Logger("application.log");
	//	if (!data.onClick) {
	$.handleResponse(data);

	// } else {
	//
	// // Hack... take icon from dashboarditem
	// icon = Images.getImage(data.image || data.icon || 'DEFAULT', 'dashboard');
	//
	// // Support for Query restart
	// connection.setApplicationName(data.name);
	// // initialize application
	// connection.sendInfo({
	// type : 'getapplication',
	// request : {
	// action : 'onClick',
	// type : 'dashboarditem',
	// dashboarditem : {
	// name : data.name,
	// type : data.type,
	// onClick : data.onClick
	// }
	// }
	// });
	// }

};

exports.createCloseButton = function() {
	if (OS_IOS) {
		var button = null;
		if (standAlone && loggedOn) {
			button = Alloy.createController('application/layout/appLogoutButton').getView();
		} else {
			button = Alloy.createController('application/layout/appCloseButton').getView();
		}
		button.addEventListener('click', onCloseClick);
		return button;
	}
};

exports.getMainAppView = function() {
	return mainAppView;
};

exports.getPopoverController = function() {
	return popoverController;
};
exports.closePopoverController = function() {
	popoverController = null;
};

exports.getPopupController = function() {
	return popupController;
};
exports.closePopupController = function() {
	popupController = null;
};
exports.showMenu = function(window) {
	$.metadataClick(window);
};
exports.metadataClick = function(window) {
	if (!Alloy.Globals.metadata) {
		return;
	}

	var aliases = $.getAliases(window.getController());
	var menu = Alloy.createController('menu/menu', {
		parent : window.getWindow(),
		application : $,
		aliases : aliases,
		connection : connection,
		serversetup : false,
		support : true,
		about : true
	}).open();
};
exports.showAbout = function(window) {
	var aliases = $.getAliases(window.getController());
	var menu = Alloy.createController('menu/menu', {
		parent : window.getWindow(),
		application : $,
		aliases : aliases,
		connection : connection,
		serversetup : false,
		support : true,
		about : true,
		showAbout : true
	}).open();
};

exports.getAliases = function(controller) {
	var controllers = [];
	var aliases = [];
	if (controller.isMaster) {
		addController(masterController);
	} else if (controller.isDetail) {
		if (OS_IOS && Alloy.isTablet) {
			addController(detailController);
		}
		addController(masterController);
	} else if (controller.isTop) {
		addController(topController);
		addController(masterController);
		if (OS_IOS && Alloy.isTablet) {
			addController(detailController);
		}
	} else if (controller.isPopover) {
		addController(popoverController);
		addController(popupController);
		if (OS_IOS && Alloy.isTablet) {
			addController(detailController);
		}
		addController(masterController);
		addController(topController);
	} else if (controller.isPopup) {
		addController(popupController);
		if (OS_IOS && Alloy.isTablet) {
			addController(detailController);
		}
		addController(masterController);
		addController(topController);
	}

	for (var i = 0; i < controllers.length; i++) {
		if (controllers[i]) {
			aliases = aliases.concat(controllers[i].getAliases());
		}
	};

	// _.each(controllers, function(ctrl, index, list) {
	// if (ctrl) {
	// aliases = aliases.concat(ctrl.getAliases());
	// }
	// });

	function addController(ctl) {
		if (ctl) {
			controllers.push(ctl);
		}
	}

	return aliases;
};

function addDetail(appLayout, data) {
	detailController = Alloy.createController('application/controllers/detailController', {
		application : $,
		type : 'detail',
		windowController : appLayout.detailWindowController,
		window : appLayout.detailWindow
	});
	detailController.setNavBarHidden(true);
}

function addTop(appLayout, data) {
	topController = Alloy.createController('application/controllers/topController', {
		application : $,
		type : 'top',
		windowController : appLayout.topWindowController,
		window : appLayout.topWindow
	});

	if (!standAlone || loggedOn) {
		topController.setApplicationCloseButton($.createCloseButton());
	}
	topController.setNavBarHidden(true);
	return appLayout.mainWindow;

}

function addMaster(appLayout, data, setCloseButton) {
	// Tabs
	if (data.mastertabs && data.mastertabs.length > 0) {
		masterTabGroup = appLayout.masterTabGroup;

		masterTabGroup.addEventListener('focus', function(e) {
			if (!e.tab) {
				return;
			}
			masterController = masterControllers[e.index];
			var theTabData = e.tab.theTabData;
			e.tab.theTabData = null;
			if (theTabData && theTabData.onClick) {
				connection.sendInfo({
					geolocation : data.geolocation,
					request : {
						action : 'onClick',
						type : 'tab',
						tab : {
							name : theTabData.name,
							onClick : theTabData.onClick
						}
					}
				});
			} else {
				if (OS_ANDROID) {
					masterController.mainWindow.updateActionBar(true);
				}
			}
		});

		masterControllers = [];
		var initialTabFocusIndex = 0;
		for (var i = 0; i < data.mastertabs.length; i++) {
			var tabData = data.mastertabs[i];
			var tabController = Alloy.createController('application/layout/appMasterTab', {
				data : tabData,
				application : $
			});
			masterControllers.push(Alloy.createController('application/controllers/masterController', {
				application : $,
				windowController : tabController.masterTab,
				window : tabController.masterWindow
			}));
			if (tabData.focus) {
				initialTabFocusIndex = i;
			}
			if (setCloseButton) {
				if (OS_IOS && (!standAlone || loggedOn)) {
					masterControllers[i].setApplicationCloseButton($.createCloseButton());
				}
			}

			// if (i === initialTabFocusIndex) {
			// if (tabData.onClick) {
			// $.addFutureAction({
			// geolocation : data.geolocation,
			// request : {
			// action : 'onClick',
			// type : 'tab',
			// tab : {
			// name : data.name,
			// onClick : tabData.onClick
			// }
			// }
			// });
			// tabData.onClick = null;
			// }
			// }

			tabController.masterTab.theTabData = tabData;
			masterTabGroup.addTab(tabController.masterTab);
		}
		masterController = masterControllers[0];
		if (OS_IOS) {
			masterController.setNavBarHidden(true);
		}

		if (initialTabFocusIndex > 0) {
			masterTabGroup.setActiveTab(initialTabFocusIndex);
		}

		if (OS_ANDROID) {
			//			masterTabGroup.addEventListener('android:back', onCloseClick);
			masterTabGroup.addEventListener('androidback', onCloseClick);
		}

		return masterTabGroup;
		// 	No Tabs
	} else {
		masterController = Alloy.createController('application/controllers/masterController', {
			application : $,
			windowController : appLayout.masterWindowController,
			window : appLayout.masterWindow
		});
		if (OS_IOS) {
			masterController.setNavBarHidden(true);
		}
		if (setCloseButton) {
			if (OS_IOS && (!standAlone || loggedOn)) {
				masterController.setApplicationCloseButton($.createCloseButton());
			}
		}
		if (OS_IOS) {
			return appLayout.masterWindowController;
		}
		if (OS_ANDROID) {
			if (standAlone) {
				masterController.mainWindow.getWindow().exitOnClose = true;
			}
			//			masterController.mainWindow.getWindow().addEventListener('android:back', onCloseClick);
			masterController.mainWindow.getWindow().addEventListener('androidback', onCloseClick);
			masterController.mainWindow.setAndroidAppWindow(true);
			return masterController.mainWindow.getWindow();
		}
	}

}

exports.start = function(data) {

	// Support for Query restart
	if (data.name) {
		connection.setApplicationName(data.name);
	}

	if (data.appsesid) {
		connection.setAppSesId(data.appsesid);
	}
	started = true;
	if (dashboarditem) {
		dashboarditem.applicationStarted($);
	}

	title = data.title || 'no title';
	if (!icon) {
		icon = Images.getImage(data.image || data.icon || 'DEFAULT', 'dashboard');
	}

	if (data.onOpen) {
		$.addFutureAction({
			geolocation : data.geolocation,
			request : {
				action : 'onOpen',
				type : 'application',
				application : {
					name : data.name,
					onOpen : data.onOpen
				}
			}
		});
	}

	// Support old master action
	if (data.masteraction) {
		// Get initial data
		$.addFutureAction({
			geolocation : data.geolocation,
			request : {
				action : 'master',
				type : 'navigatorapplication',
				navigatorapplication : {
					name : data.name,
					master : data.masteraction
				}
			}
		});
	}

	// Support old detail action
	if (data.detailaction) {
		// Set next Action
		$.addFutureAction({
			geolocation : data.geolocation,
			request : {
				action : 'detail',
				type : 'navigatorapplication',
				navigatorapplication : {
					name : data.name,
					detail : data.detailaction
				}
			}
		});
	}

	// Support old closeaction
	if (data.closeaction) {
		onClose = {
			geolocation : data.geolocation,
			request : {
				action : 'onClose',
				type : 'navigatorapplication',
				navigatorapplication : {
					name : data.name,
					onClose : data.closeaction
				}
			}
		};
	}
	// Set new onClose
	if (data.onClose) {
		onClose = {
			geolocation : data.geolocation,
			request : {
				action : 'onClose',
				type : 'application',
				application : {
					name : data.name,
					onClose : data.onClose
				}
			}
		};
	}

	if (Alloy.Globals.dashboard) {
		if (data.globalbadge || data.globalbadge === 0 || data.badge || data.badge === 0) {
			var upd = {};
			if (data.globalbadge || data.globalbadge === 0) {
				upd.badge = data.globalbadge;
			}
			if (data.badge || data.badge === 0) {
				upd.dashboarditems = [{
					name : data.name,
					badge : data.badge
				}];
			}
			Alloy.Globals.dashboard.update(upd);
		}
	}

	if (OS_IOS && Alloy.isTablet) {
		// Default hide top
		if (data.showtop != true) {
			data.showtop = false;
		}

		// Default show detail
		if (data.showdetail != false) {
			data.showdetail = true;
		}

		if (!data.showtop && !data.showdetail) {
			// Master
			var layout = 'application/layout/appMaster';
			if (data.mastertabs && data.mastertabs.length > 1) {
				layout = 'application/layout/appMasterTabGroup';
			}
			applicationWindowController = Alloy.createController(layout, {
				application : $
			});
			mainAppView = addMaster(applicationWindowController, data, true);
			masterController.isFullScreen = true;
		} else if (!data.showtop && data.showdetail) {
			// Master & Detail
			var layout = 'application/layout/appMasterDetail';
			if (data.mastertabs && data.mastertabs.length > 1) {
				layout = 'application/layout/appMasterTabGroupDetail';
			}
			applicationWindowController = Alloy.createController(layout, {
				application : $
			});
			addMaster(applicationWindowController, data, true);
			addDetail(applicationWindowController, data);
			mainAppView = applicationWindowController.applicationWindow;
		} else if (data.showtop && !data.showdetail) {
			// Top & Master
			var layout = 'application/layout/appMasterTop';
			if (data.mastertabs && data.mastertabs.length > 1) {
				layout = 'application/layout/appMasterTabGroupTop';
			}
			applicationWindowController = Alloy.createController(layout, {
				application : $
			});
			addMaster(applicationWindowController, data, false);
			addTop(applicationWindowController, data);
			mainAppView = applicationWindowController.applicationWindow;
		} else if (data.showtop && data.showdetail) {
			// Top & Master & Detail
			var layout = 'application/layout/appMasterDetailTop';
			if (data.mastertabs && data.mastertabs.length > 1) {
				layout = 'application/layout/appMasterTabGroupDetailTop';
			}
			applicationWindowController = Alloy.createController(layout, {
				application : $
			});
			addMaster(applicationWindowController, data, false);
			addDetail(applicationWindowController, data);
			addTop(applicationWindowController, data);
			mainAppView = applicationWindowController.applicationWindow;
		}

	} else {
		// Phone...
		var layout = 'application/layout/appMaster';
		if (data.mastertabs && data.mastertabs.length > 1) {
			layout = 'application/layout/appMasterTabGroup';
		}
		applicationWindowController = Alloy.createController(layout, {
			application : $
		});
		mainAppView = addMaster(applicationWindowController, data, true);
	}
};

exports.getConnection = function() {
	return connection;
};

exports.addFutureAction = function(action) {
	futureActions.push(action);
};

exports.getFutureAction = function() {
	if (futureActions.length > 0) {
		var action = futureActions[0];
		futureActions.splice(0, 1);
		return action;
	}
	return null;
};

exports.open = function(completeFunction) {
	// Open the Application window
	Alloy.Globals.applicationStarted($);

	if (standAlone || OS_ANDROID) {
		connection.hideBusyWindow();
		mainAppView.open();
		completeFunction();
	} else {
		var animation = Ti.UI.createAnimation({
			top : 0,
			duration : 400,
		});
		animation.addEventListener('complete', completeFunction);

		// open application
		connection.hideBusyWindow();
		if (!standAlone) {
			mainAppView.top = Ti.Platform.displayCaps.platformHeight;
		}
		mainAppView.open(animation);
	}
};

exports.close = function() {
	if (!mainAppView) {
		// Allready closed
		return;
	}

	// if (connection.getLogger()) {
	// connection.getLogger().write();
	// }
	if (Alloy.Globals.logger) {
		Alloy.Globals.logger.write();
	}

	//connection.setCallback(oldCallback);
	connection.setBusyParent(null);
	connection.setApplicationName(null);
	Alloy.Globals.applicationEnded($);
	if (dashboarditem) {
		dashboarditem.applicationEnded();
	}

	if (Ti.App.keyboardVisible || standAlone || OS_ANDROID) {
		doEnd();
		return;
	}

	var animation = Ti.UI.createAnimation({
		top : Ti.Platform.displayCaps.platformHeight,
		bottom : -Ti.Platform.displayCaps.platformHeight,
		duration : 400,
	});

	if (applicationWindowController.beforeClose) {
		applicationWindowController.beforeClose();
	}
	animation.addEventListener('complete', doEnd);
	mainAppView.animate(animation);

	function doEnd() {

		if (mainAppView) {
			mainAppView.visible = false;
		}

		// Restore old callback
		if (masterControllers && masterControllers.length > 0) {
			for (var i = 0; i < masterControllers.length; i++) {
				masterControllers[i].shutdown();
			}
		} else {
			// Cleanup controllers
			if (masterController) {
				masterController.shutdown();
			}
		}

		if (popupController) {
			popupController.shutdown();
		}
		if (detailController) {
			detailController.shutdown();
		}
		if (popoverController) {
			popoverController.shutdown();
		}
		if (topController) {
			topController.shutdown();
		}
		if (mainAppView) {
			// Close main view
			mainAppView.close();
		}

		// Null $ fields
		mainAppView = null;
		masterController = null;
		masterControllers = null;
		detailController = null;
		popupController = null;
		popoverController = null;
		topController = null;
		masterTabGroup = null;
		applicationWindowController = null;
	}

};

exports.handleError = function(message, description) {
	//alert(message, description);
	Ti.UI.createAlertDialog({
		title : message,
		message : description
	}).show();
};

exports.handleResponse = function(response) {

	// Close after call to onClose
	// if (closing) {
		// $.close();
		// return;
	// }

	var request = connection.getRequest();

	if (response.error) {
		if (response.errorinfo && response.errorinfo.errortext) {
			Ti.UI.createAlertDialog({
				message : Conversion.toString(response.errorinfo.errortext)
			}).show();
		}
		Ti.API.error('Error response: ' + JSON.stringify(response));
	} else {
		var callNext = true;

		var responses = [];
		if (_.isArray(response)) {
			responses = response;
		} else if (response.type === 'actions' || response.actions) {
			responses = response.actions || [];
		} else {
			responses = [response];
		}
		for (var i = 0; i < responses.length; i++) {
			if (!$.handleAction(request, responses[i])) {
				callNext = false;
			}
		}

		// List had a selected item?
		if (callNext) {
			var next = $.getFutureAction();
			if (next) {
				connection.sendInfo(next);
			}
		} else {
			function appLoaded(e) {
				var next = $.getFutureAction();
				if (next) {
					connection.sendInfo(next);
				}
			}

			// open the application Window
			$.open(appLoaded);

		}

	}
};

exports.handleAction = function(request, response) {
	if (response.error) {
		if (response.errorinfo && response.errorinfo.errortext) {
			Ti.UI.createAlertDialog({
				message : Conversion.toString(response.errorinfo.errortext)
			}).show();
		}
		Ti.API.error('Error response: ' + JSON.stringify(response));
		return true;
	}

	ResponseUtils.cleanup(response);

	var type = ResponseUtils.getType(response);
	var typeObject = ResponseUtils.getObject(response);
	var action = ResponseUtils.getAction(response);
	var location = ResponseUtils.getLocation(response);
	var name = ResponseUtils.getName(response);

	if (Alloy.isHandheld || OS_ANDROID) {
		// No detail location on these devices
		if (location === 'detail') {
			location = 'master';
			response.location = location;
			if (action === 'reset') {
				action = 'open';
				response.action = action;
			}
		}
		// No popover location on these devices
		if (location === 'popover') {
			location = 'popup';
			response.location = location;
		}
	}

	// Set currentController
	var currentController = masterController;
	if (location === 'detail') {
		if (detailController) {
			currentController = detailController;
		} else {
			return true;
		}
	} else if (location === 'popup') {
		if (popupController) {
			currentController = popupController;
		} else {
			popupController = Alloy.createController('application/controllers/popupController', {
				application : $,
				type : 'popup'
			});
			currentController = popupController;
		}
	} else if (location === 'popover') {
		if (popoverController) {
			currentController = popoverController;
		} else if (OS_IOS && Alloy.isTablet) {
			popoverController = Alloy.createController('application/controllers/popoverController', {
				application : $,
				type : 'popover'
			});
			currentController = popoverController;
		} else if (popupController) {
			currentController = popupController;
		} else {
			popupController = Alloy.createController('application/controllers/popupController', {
				application : $,
				type : 'popup'
			});
			currentController = popupController;
			//return true;
		}
	} else if (location === 'top') {
		if (topController) {
			currentController = topController;
		} else {
			return true;
		}
	}

	// Handle jsonlog
	if (typeObject.jsonlog) {
		Alloy.Globals.jsonLog = response;
	} else {
		// Reset jsonlog ??
	}

	// Handle beep
	if (typeObject.beep) {
		Ti.Media.createSound({
			url : "/beep.wav",
			volume : 1.0
		}).play();
	}

	// Handle timed requests
	if (typeObject.onTimer) {
		if (typeObject.onTimer.timeout > 0) {
			timerAction = typeObject.onTimer;
			Alloy.Globals.onTimerTimer = setTimeout(function(e) {
				var requestInfo = {
					type : 'timerrequest',
					geolocation : typeObject.geolocation,
					request : {
						action : 'onTimer',
						type : 'timer',
						timer : {
							name : typeObject.name,
							onTimer : timerAction,
						}
					}
				};
				connection.sendInfo(requestInfo);
			}, timerAction.timeout);
		}
	}

	switch(type) {
	case 'none':
		if (action === 'close') {
			if (!currentController.handle(request, response)) {
				$.handleInAll(request, response);
			}
		}
		break;
	case 'application':
		if (action === 'close') {
			setTimeout(function(e) {
				$.close();
			}, 50);
			return true;
		} else {
			if (started) {
				// Start new application
				Alloy.createController('application/application', {
					standAlone : standAlone,
					loggedOn : loggedOn
				}).startApplication(response);
				return true;
			}
			// Report back that futureAction should not be called...
			$.start(typeObject);
			return false;
		}
		break;
	case 'list':
		if (!currentController.handle(request, response)) {
			$.handleInAll(request, response);
		}
		break;
	case 'imagelist':
		if (!currentController.handle(request, response)) {
			$.handleInAll(request, response);
		}
		break;
	case 'imageviewer':
		if (!currentController.handle(request, response)) {
			$.handleInAll(request, response);
		}
		break;
	case 'form':
		if (!currentController.handle(request, response)) {
			$.handleInAll(request, response);
		}
		break;
	case 'map':
		if (!currentController.handle(request, response)) {
			$.handleInAll(request, response);
		}
		break;
	case 'url':
		if (handleUrl(typeObject)) {
			break;
		}
		if (!currentController.handle(request, response)) {
			$.handleInAll(request, response);
		}
		break;
	case 'mail':
		Alloy.createController('application/email', {
			application : $,
			data : typeObject
		}).open();
		break;
	case 'call':
		var link = 'tel:';
		if (typeObject.number) {
			link += typeObject.number;
			// Remove spaces
			link = link.replace(/ /g, '');
		}
		if (OS_IOS) {
			if (!Ti.Platform.canOpenURL(link)) {
				Ti.API.warn("Can't open url: " + link);
				return true;
			}
		}
		Ti.Platform.openURL(link);
		break;
	case 'sms':
		var link = 'sms:';
		if (OS_ANDROID) {
			link = "smsto:";
		}
		if (typeObject.number) {
			link += typeObject.number;
			// Remove spaces
			link = link.replace(/ /g, '');
		}
		if (OS_IOS) {
			if (SMS === null) {
				SMS = require('com.omorandi');
			}
			var sms = SMS.createSMSDialog({
				recipients : [typeObject.number],
				messageBody : typeObject.text ? typeObject.text : ''
			});
			sms.open({
				animated : true
			});
		} else if (OS_ANDROID) {
			var intent = Ti.Android.createIntent({
				action : Ti.Android.ACTION_SENDTO,
				data : link
			});
			if (typeObject.text) {
				intent.putExtra('sms_body', typeObject.text);
			}
			try {
				Ti.Android.currentActivity.startActivity(intent);
			} catch (ActivityNotFoundException) {
				Ti.UI.createNotification({
					message : L('can_not_send_sms')
				}).show();
			}
		}
		break;
	case 'alert':
		if (masterController == null && standAlone && loggedOn) {
			Ti.App.fireEvent('showLogin');
		}
		Alloy.createController('application/alert/alert', {
			connection : connection,
			data : typeObject
		}).show();

		break;
	case 'camera':
		Alloy.createController('application/camera', {
			application : $,
			data : typeObject
		});
		break;
	case 'scan':
		if (Scanner == null) {
			if (OS_IOS) {
				Scanner = require('/Scanner');
			}
			if (OS_ANDROID) {
				Scanner = require('/ScanditScanner');
			}
		}
		new Scanner(typeObject, connection);
		break;
	case 'contact':
		if (Contact == null) {
			Contact = require('/Contact');
		}
		new Contact(typeObject, connection);
		break;
	case 'calendar':
		if (Calendar == null) {
			Calendar = require('/Calendar');
		}
		new Calendar(typeObject, connection);
		break;
	case 'route':
		Alloy.createController('application/route', {
			application : $,
			data : typeObject
		});
		break;
	case 'spc':
		currentController.open(request, response);
		break;
	case 'offlinedata':
		if (action === 'delete') {
			clearOfflineData(typeObject);
		}
		break;
	case 'dashboard':
		if (Alloy.Globals.dashboard) {
			Alloy.Globals.dashboard.handleResponse(response);
		}
		return true;
	}

	return true;
};

function clearOfflineData(data) {
	if (data && data.name) {
		if (!cache) {
			var Cache = require('Cache');
			cache = new Cache();
		}
		cache.deleteJson(data.name);
	}
}

exports.handleInAll = function(request, response) {
	if (masterController && masterController.handle(request, response)) {
	} else if (detailController && detailController.handle(request, response)) {
	} else if (popupController && popupController.handle(request, response)) {
	} else if (popoverController && popoverController.handle(request, response)) {
	} else if (topController && topController.handle(request, response)) {
	} else if (masterControllers && masterControllers.length > 0) {
		for (var i = 0; i < masterControllers.length; i++) {
			if (masterControllers[i].handle(request, response)) {
				return;
			}
		}
	}
};

function handleUrl(urlData) {

	if (!urlData || !urlData.url) {
		return false;
	}
	var url = urlData.url.toString();
	var type = urlData.contenttype || urlData.type || null;
	var filename = urlData.filename || '';

	if (OS_ANDROID) {
		if (!type && url.length > 4 && url.toString().toUpperCase().indexOf('.PDF', url.length - 4) !== -1) {
			type = 'application/pdf';
		}

		if (type === 'url') {
			type = null;
			urlData.external = true;
		}
		if (type === 'text/plain') {
			type = null;
		}

		if (type != null) {
			var retrieveReq = Ti.Network.createHTTPClient();
			retrieveReq.onload = function(e) {
				if (!filename) {
					// Translate type to filename
					if (type == 'application/msword') {
						filename = 'latest.doc';
						// dot
					} else if (type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
						filename = 'latest.docx';
					} else if (type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.template') {
						filename = 'latest.dotx';
					} else if (type == 'application/vnd.ms-word.document.macroEnabled.12') {
						filename = 'latest.docm';
						// dotm
					} else if (type == 'application/vnd.ms-excel') {
						filename = 'latest.xls';
						// xlt xla
					} else if (type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
						filename = 'latest.xlsx';
					} else if (type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.template') {
						filename = 'latest.xltx';
					} else if (type == 'application/vnd.ms-excel.sheet.macroEnabled.12') {
						filename = 'latest.xlsm';
					} else if (type == 'application/vnd.ms-excel.template.macroEnabled.12') {
						filename = 'latest.xltm';
					} else if (type == 'application/vnd.ms-excel.addin.macroEnabled.12') {
						filename = 'latest.xlam';
					} else if (type == 'application/vnd.ms-excel.sheet.binary.macroEnabled.12') {
						filename = 'latest.xlsb';
					} else if (type == 'application/vnd.ms-powerpoint') {
						filename = 'latest.ppt';
						// pot pps ppa
					} else if (type == 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
						filename = 'latest.pptx';
					} else if (type == 'application/vnd.openxmlformats-officedocument.presentationml.template') {
						filename = 'latest.potx';
					} else if (type == 'application/vnd.openxmlformats-officedocument.presentationml.slideshow') {
						filename = 'latest.ppsx';
					} else if (type == 'application/vnd.ms-powerpoint.addin.macroEnabled.12') {
						filename = 'latest.ppam';
					} else if (type == 'application/vnd.ms-powerpoint.presentation.macroEnabled.12') {
						filename = 'latest.pptm';
					} else if (type == 'application/vnd.ms-powerpoint.template.macroEnabled.12') {
						filename = 'latest.potm';
					} else if (type == 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12') {
						filename = 'latest.ppsm';
					} else if (type == 'application/pdf') {
						filename = 'latest.pdf';
					} else {
						filename = 'latest.tmp';
						if (this.responseData.mimeType) {
							type = this.responseData.mimeType;
						}
						if (type) {
							var types = type.split('/');
							if (types.length === 2 && types[1].length < 5) {
								filename = 'latest.' + types[1];
							}
						}
					}
				}

				var tmpFile = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory(), filename);
				tmpFile.write(this.responseData);
				var intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_VIEW,
					type : type,
					data : tmpFile.nativePath
				});
				try {
					Ti.Android.currentActivity.startActivity(intent);
				} catch(e) {
					Ti.API.error(e);
					Ti.UI.createNotification({
						message : L('can_not_open_file_type') + type
					}).show();
					//alert('No application for ' + type + ' installed!');
				}
			};

			retrieveReq.open('GET', url);
			retrieveReq.send();
			return true;
		} else {
			if (urlData.external === true) {
				Ti.Platform.openURL(url);
				return true;
			} else {
				return false;
			}
		}
	} else {
		if (urlData.external === true) {
			Ti.Platform.openURL(url);
			return true;
		}
	}
	return false;

}
