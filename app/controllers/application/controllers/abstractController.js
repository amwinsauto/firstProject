var debug = true;
var memoryDebug = true;
var Log = require('tools/Log');
var UIUtils = require('UIUtils');

var args = arguments[0] || {};
var application = args.application;
var connection = application.getConnection();

// Constructor
var windowStack = [];
var isReset = false;

$.isMaster = false;
$.isDetail = false;
$.isPopup = false;
$.isPopover = false;
$.isTop = false;

exports.init = function() {

	$.firstWindow = Alloy.createController('application/controllers/' + $.type + 'FirstWindow', {
		application : application,
		controller : $
	});

	if (OS_ANDROID) {
		$.mainWindow = $.firstWindow;
	}

	if (OS_IOS) {
		$.mainWindow = $.windowController;
	}
	$.addWindowToStack($.firstWindow);
};
// Show application (Application switch)
exports.show = function() {
	if (OS_IOS) {
		$.mainWindow.visible = true;
	}
};
// Hide application (Application switch)
exports.hide = function() {
	if (OS_IOS) {
		$.mainWindow.visible = false;
	}
};

function createWindow() {
	return Alloy.createController('application/controllers/' + $.type + 'Window', {
		application : application,
		controller : $
	});
}

exports.getNavigationGroup = function() {
	if (OS_IOS) {
		return $.windowController;
	}
	return null;
};

exports.getAliases = function() {
	var aliases = [];
	for (var i = 0; i < windowStack.length; i++) {
		var winAliases = windowStack[i].getAliases();
		aliases = winAliases.concat(aliases);
	};

	// _.each(windowStack, function(win, index, list) {
	// if (win) {
	// var winAliases = win.getAliases();
	// aliases = winAliases.concat(aliases);
	// }
	// });

	return aliases;
};

exports.getApplication = function() {
	return application;
};

exports.getConnection = function() {
	return connection;
};

exports.setNavBarHidden = function(showHide) {
	if (OS_IOS) {
		$.firstWindow.getWindow().setNavBarHidden(showHide);
	}
};

exports.setApplicationCloseButton = function(button) {
	$.appCloseButton = button;
};

exports.getApplicationCloseButton = function() {
	return $.appCloseButton;
};

exports.isKeyboardToolbarEnabled = function() {
	if (OS_ANDROID) {
		return false;
	} else {
		return true;
	}
};

exports.handle = function(request, response) {

	if (OS_IOS && $.isPopup && Alloy.isTablet) {
		if (response.size) {
			if (!$.size) {
				$.size = response.size;
			}
		} else {
			$.size = 'large';
		}
	}

	if (response.action === 'refresh') {
		return $.refresh(request, response);
	} else if (response.action === 'reset') {
		return $.reset(request, response);
	} else if (response.action === 'close') {
		return $.closeByName(request, response);
	} else if (response.action === 'closeall') {
		return $.closeAll();
	} else if (response.action === 'update') {
		return $.update(request, response);
	} else if (response.action === 'reopen') {
		return $.open(request, response, false);
	} else if (response.action === 'replace') {
		return $.replace(request, response, false);
	} else {
		return $.open(request, response, true);
	}
	return true;
};

exports.addFutureAction = function(action) {
	application.addFutureAction(action);
};

exports.reset = function(request, response) {

	var openPopup = false;
	if (!isReset) {
		if ($.isPopup) {
			if (OS_IOS) {
				$.firstWindow.setLeftNavButton($.closeButton);
			}
			openPopup = true;
		}
	}

	isReset = true;
	$.buildWindow(request, response, windowStack[0]);

	// THNTHN
	if ($.appCloseButton) {
		$.setNavBarHidden(false);
		$.firstWindow.setLeftNavButton($.appCloseButton);
	}
	// THN

	Log.debug('NavigationController.reset(' + $.firstWindow.getName() + ') in ' + $.type, debug);

	$.home();

	if (openPopup) {
		$.openPopup();
	} else {
		$.firstWindow.setFocus();
	}
	return true;

};

exports.refresh = function(request, response) {

	var win = $.getWindowByName(response.name);
	if (win) {
		Log.debug('NavigationController.refresh(' + response.name + ') in ' + $.type, debug);
		win.refresh(request, response, win);
		win.setFocus();
		return true;
	} else {
		Log.debug('NavigationController.refresh(' + response.name + ') in ' + $.type + ' - No window to refresh', debug);
		return false;
	}
};

exports.update = function(request, response) {

	var win = $.getWindowByName(response.name);
	if (win) {
		Log.debug('NavigationController.update(' + response.name + ') in ' + $.type, debug);
		win.update(request, response);
		win.setFocus();
		return true;
	} else {
		Log.debug('NavigationController.update(' + response.name + ') in ' + $.type + ' - No window to update', debug);
		return false;
	}
};

exports.replace = function(request, response) {
	if (!isReset || windowStack.length < 2) {
		return $.reset(request, response);
	}

	var win = windowStack[windowStack.length - 1];
	Log.debug('NavigationController.replace(' + response.name + ') in ' + $.type, debug);
	win.replace(request, response);
	win.setFocus();
	return true;
};

exports.closePopup = function(closedByPopover) {

	Log.debug('NavigationController.closePopup()', debug);
	isReset = false;
	connection.setBusyParent(null);

	if ($.isPopover) {
		$.size = null;
		if (!closedByPopover) {
			$.popupWindow.hide({
				animated : true
			});
		}
		UIUtils.setShownPopover(null);
		application.closePopoverController();
	} else if (OS_ANDROID) {
		$.popupWindow.close();
		$.home();
		application.closePopupController();
	} else {
		application.closePopupController();
		if (Ti.App.keyboardVisible) {
			$.popupWindow.close({
				animated : false
			});
		} else {
			if ($.size === 'small' || $.size === 'medium') {
				$.popupWindow.close();
			} else {
				var animation = Ti.UI.createAnimation({
					top : Ti.Platform.displayCaps.platformHeight,
					duration : 300
				});
				$.popupWindow.close(animation);
			}
		}
	}
	$.size = null;
};

exports.openPopup = function() {

	Log.debug('NavigationController.openPopup()', debug);

	if ($.isPopover) {
		try {
			var caller = connection.getRequestInfo().caller;
			$.popupWindow.arrowDirection = Ti.UI.iPad.POPOVER_ARROW_DIRECTION_ANY;
			if (!caller) {
				//caller = application.getMainAppView();
				Ti.API.info('Caller: ' + caller);
				caller = $.firstWindow.getWindow();
			}
			if ($.size === 'small') {
				var style = $.createStyle({
					classes : 'smallPopover',
					apiName : 'Popover'
				});
				//$.popupWindow.applyProperties(style);
				$.windowController.applyProperties(style);
			} else {
				var style = $.createStyle({
					classes : 'mediumPopover',
					apiName : 'Popover'
				});
				//$.popupWindow.applyProperties(style);
				$.windowController.applyProperties(style);
				// Medium is to big for arrow to be used..
				//caller = application.getMainAppView();
				$.popupWindow.arrowDirection = false;
			}
			$.popupWindow.show({
				view : caller,
				animated : true
			});
			UIUtils.setShownPopover($.popupWindow);
		} catch (e) {
			Log.error(e);
		}
		return;
	}

	connection.setBusyParent($.popupWindow);
	if ($.size === 'medium') {
		// $.popupWindow.top = null;
		// $.popupWindow.height = null;
		// $.popupWindow.width = null;
		$.popupWindow.open({
			modal : true,
			modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
			modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_PAGESHEET
		});
	} else if ($.size === 'small') {
		$.popupWindow.open({
			modal : true,
			modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
			modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
		});
	} else {
		if (OS_ANDROID) {
			$.popupWindow.navBarHidden = $.popupWindow.navBarHidden || false;
			$.popupWindow.open();
		}
		if (OS_IOS) {
			var animation = Ti.UI.createAnimation({
				top : 0,
				duration : 300
			});
			$.popupWindow.top = Ti.Platform.displayCaps.platformHeight;
			$.popupWindow.open(animation);

		}
	}
};

exports.open = function(request, response, animated) {

	if (!isReset) {
		return $.reset(request, response);
	}

	var windowToOpen = $.buildWindow(request, response);

	if (animated) {
		Log.debug('NavigationController.open(' + windowToOpen.getName() + ') in ' + $.type, debug);
	} else {
		Log.debug('NavigationController.reopen(' + windowToOpen.getName() + ') in ' + $.type, debug);
	}

	windowToOpen.open(animated);
	return true;
};

//go back to the initial window of the NavigationController
exports.home = function() {

	//store a copy of all the current windows on the stack
	// TODO Check memory removeRemovedWindows(windowStack);
	var windows = windowStack.concat([]);
	for (var i = 1,
	    l = windows.length; i < l; i++) {
		windows[i].close(false);
	}
	//reset stack
	windowStack = [windowStack[0]];
};

exports.close = function() {

	Log.debug('NavigationController.close (' + $.type + ')', debug);

	//store a copy of all the current windows on the stack
	// TODO Check memory removeRemovedWindows(windowStack);
	var windows = windowStack.concat([]);
	var startLevel = windows.length - 1;

	if ($.isPopup && startLevel == 0) {
		$.closePopup();
		return;
	} else if (startLevel == 0) {
		windowStack[0].clearWindow();
		return;
	} else {
		windows[startLevel].close();
	}
};

exports.closeByName = function(request, response) {
	var name = response.name;

	if (!name) {
		return $.close();
	}

	// TODO Check memory removeRemovedWindows(windowStack);

	if ($.isPopup) {
		if (!isReset) {
			// Popup window already closed
			Log.debug('NavigationController.closeByName() - Error: No popup is shown', debug);
			$.size = null;
			return false;
		}
		// First window in popup -> close the popup
		if (windowStack[0].getName() === name) {
			$.closePopup();
			return true;
		}
	}

	//store a copy of all the current windows on the stack
	var windows = windowStack.concat([]);
	var length = windows.length;

	for (var i = length - 1; i >= 0; i--) {
		if (windows[i].getName() === name) {
			if (i === 0) {
				// First window can't be closed...
				Log.debug('NavigationController.closeByName(' + name + ') in ' + $.type + ' cleared...', debug);
				windows[0].clearWindow();
			} else {
				// Close the window
				if (i < (length - 1)) {
					Log.debug('NavigationController.closeByName(' + name + ') in ' + $.type + ' closed non animated...', debug);
					windows[i].close(false);
				} else {
					Log.debug('NavigationController.closeByName(' + name + ') in ' + $.type + ' closed animated...', debug);
					windows[i].close(true);
				}
			}
			return true;
		}
	}
	Log.debug('NavigationController.closeByName(' + name + ') in ' + $.type + ' Warning: Window not found', debug);
	return false;
};

exports.closeAll = function() {

	if ($.isPopup) {
		$.closePopup(false);
		return true;
	}

	isReset = true;
	windowStack[0] = $.firstWindow;
	$.firstWindow.clearWindow();
	Log.debug('NavigationController.closeAll() in ' + $.type, debug);
	$.home();
	return true;
};

exports.shutdown = function() {

	Log.debug('NavigationController.shutdown() in ' + $.type, debug);

	if (!$.firstWindow) {
		// Already closed
		return;
	}
	if (OS_IOS) {
		if ($.appCloseButton) {
			$.firstWindow.setLeftNavButton(null);
		}
	}

	// Make sure popup/popover is closed
	if ($.isPopup && $.popupWindow && application) {
		if ($.isPopover && application.getPopoverController()) {
			// $.popupWindow.hide({
			// animated : false
			// });
			// UIUtils.setShownPopover(null);
		} else if (application.getPopupController()) {
			$.popupWindow.close({
				animated : false
			});
		}
	}
	if (OS_ANDROID) {
		$.home();
	}

	// Null $ fields
	$.firstWindow = null;
	$.mainWindow = null;
	$.popupWindow = null;
	$.windowController = null;
	connection = null;
	application = null;
	$.appCloseButton = null;
	windowStack = null;
	$.closeButton = null;
};

exports.getWindowByName = function(name) {

	// TODO Check memory removeRemovedWindows(windowStack);

	var length = windowStack.length;
	for (var i = 0; i < length; i++) {
		if (windowStack[i].getName() === name) {
			//Log.debug('NavigationController.getWindowByName (' + name + ') (' + $.type + ')', debug);
			return windowStack[i];
		}
	}
	return null;
};

exports.buildWindow = function(request, response, win) {
	Log.debug('NavigationController.buildWindow start', debug);

	var theWindow = null;

	if (win) {
		theWindow = win;
		if (theWindow === $.firstWindow && $.getApplicationCloseButton()) {
			theWindow.setLeftNavButton($.getApplicationCloseButton());
		}
	} else {
		theWindow = createWindow();
	}

	theWindow.build(request, response);
	Log.debug('NavigationController.buildWindow end', debug);

	return theWindow;
};

exports.addWindowToStack = function(win) {
	if (windowStack) {
		windowStack.push(win);
		win.setOnStack(true);
	}
};

exports.removeWindowFromStack = function(win) {
	if (windowStack) {
		if (win.isOnStack()) {
			win.setOnStack(false);
			removeWindow(windowStack, win);
		}
	} else {
		//	Log.debug('removeWindowFromStack stack missing: ' + win.type + ' ' + win.getWindow().title, memoryDebug);
	}
};

exports.metadataClick = function(window) {
	if (OS_IOS && Alloy.isTablet && $.isPopup && ($.size === 'small' || $.size === 'medium')) {
		return;
	}
	$.getApplication().metadataClick(window);
};

function removeWindow(windows, win) {

	// Last window can never be removed
	if (windows.length == 1) {
		Log.debug('removeWindow() - Can\'t remove index 0 from stack - Title: ' + windows[0].getWindow().title, memoryDebug);
		return windows[0];
	}

	if (!win) {
		var w = windows.pop();
		Log.error('removeWindow() - (called without window removing top level): ' + windows.length + ' - Title: ' + w.getWindow().title, memoryDebug);
		return w;
	};

	for (var i = windows.length - 1; i > 0; i--) {
		if (windows[i] === win) {
			windows.splice(i, 1);
			Log.debug('removeWindow() - removing index: ' + i + ' - Title: ' + win.getWindow().title, memoryDebug);
			return win;
		};
	};
	Log.error('removeWindow() - window not found: ' + win.getWindow().title, memoryDebug);
	return win;
}

// function removeRemovedWindows(windows) {
// // Remove windows removed by window close event
// for (var i = windows.length - 1; i > 0; i--) {
// var win = windows[i];
// if (win.getWindow().isRemoved) {
// Log.error('removeRemovedWindows window from stack: ' + i + ' - Title: ' + win.getWindow().title);
// windows.splice(i, 1);
// }
// }
// }

