var debug = true;

var MAX_TOP_BUTTONS = 1;

var Conversion = require('tools/Conversion');
var Log = require('tools/Log');
var UIUtils = require('UIUtils');

var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;
var connection = controller.getConnection();

var type = controller.type;
var name = 'not_set';
var contentType = 'not_set';
var initialFocusField = null;
var uiFields = [];

var isMenuChanged = false;
var isMenuInvalidated = false;
var isOpened = false;

var androidMenus = [];
var isOnStack = false;
var isBackButtonHidden = false;
var isSpecialBackButton = false;
var isAndroidAppWindow = false;
var onBackClick = null;
var onClose = null;
var handler = null;

$.isPopup = false;
$.isPopover = false;
$.isMaster = false;
$.isDetail = false;
$.isTop = false;

if (type === 'popup') {
	$.isPopup = true;
} else if (type === 'popover') {
	$.isPopup = true;
	$.isPopover = true;
} else if (type === 'master') {
	$.isMaster = true;
} else if (type === 'detail') {
	$.isDetail = true;
} else if (type === 'top') {
	$.isTop = true;
}

var topToolbar = Alloy.createController('application/toolbar/topToolbar', {
	application : application,
	controller : controller,
	window : $
});

var bottomToolbar = Alloy.createController('application/toolbar/bottomToolbar', {
	application : application,
	controller : controller,
	window : $
});

function back() {
	if (onBackClick) {
		var jsonfields = $.getJsonFields();
		var requestInfo = {
			type : 'backclick',
			//caller : button,
			request : {
				action : 'onBackClick',
				type : contentType,
			}
		};
		requestInfo.request[contentType] = {
			name : name,
			onBackClick : onBackClick
		};
		if (jsonfields.length > 0) {
			requestInfo.request[contentType].fields = jsonfields;
		}

		connection.sendInfo(requestInfo);
	} else {
		if (isBackButtonHidden) {
			// Do nothing
		} else {
			if (OS_ANDROID) {
				if (isAndroidAppWindow || $.window.tab) {
					application.androidBack();
				} else {
					$.close();
				}
			}
		}
	}
}

exports.getAliases = function() {
	if (handler && handler.getAliases) {
		return handler.getAliases();
	}
	return [];
};

exports.getContentType = function() {
	return contentType;
};

exports.setAndroidAppWindow = function(appWindow) {
	isAndroidAppWindow = appWindow;
};

exports.onOpenWindow = function(e) {
	Log.debug('Window.onOpenWindow(' + name + ') in ' + type, debug);
	isOpened = true;
	if (isMenuChanged) {
		$.updateActionBar();
	}
	$.setFocus();
	//Log.debug(JSON.stringify(application.getAliases(this)), debug);

};

exports.onCloseWindow = function(e) {
	Log.debug('Window.onCloseWindow(' + name + ') in ' + type, debug);

	// TODO Remove when memory verified
	$.window.isRemoved = true;

	controller.removeWindowFromStack($);
	if (onClose) {
		var jsonfields = $.getJsonFields();
		var requestInfo = {
			type : "close",
			request : {
				action : "onClose",
				type : contentType,
			}
		};
		requestInfo.request[contentType] = {
			name : name,
			onClose : onClose
		};

		if (jsonfields.length > 0) {
			requestInfo.request[contentType].fields = jsonfields;
		}
		connection.sendInfo(requestInfo, true);
	}

	// Clean up.....
	// Do the cleaning...
	// args = null;
	// application = null;
	// controller = null;
	// connection = null;
	// initialFocusField = null;
	// uiFields = null;
	// androidMenus = null;
	// onBackClick = null;
	// onClose = null;
	// handeler = null;
	//$.window.originalBackButton = null;

	$.clearWindow(true);
	//topToolbar = null;
	//bottomToolbar = null;
};

exports.destroyHandler = function() {
	// Call handlers onDestroy if it exists
	if (handler && handler.onDestroy) {
		handler.onDestroy();
	}
};

exports.setOnStack = function(onStack) {
	isOnStack = onStack;
};

exports.isOnStack = function() {
	return isOnStack;
};

exports.setFocus = function() {
	setFocus();
};

exports.getType = function() {
	return controller.type;
};

exports.getName = function() {
	return name;
};

exports.isNarrow = function() {
	return false;
};

exports.getActionBar = function(onlyIfCurrentTab) {
	if (OS_ANDROID) {
		var activity = $.getActivity(onlyIfCurrentTab);
		if (activity) {
			return activity.actionBar;
		}
	}
	return null;
};

exports.getActivity = function(onlyIfCurrentTab) {
	if (OS_ANDROID) {
		// Are we on a tab
		var activity = null;
		if ($.window.tab) {
			if (onlyIfCurrentTab && $.window.tab != $.window.tab.tabGroup.activeTab) {
				return null;
			}
			return $.window.tab.tabGroup.getActivity();
		} else {
			return $.window.activity;
		}
	}
	return null;
};

exports.addAndroidMenu = function(menu) {
	isMenuChanged = true;
	androidMenus.push(menu);
};

exports.updateActionBar = function(forceReloadMenu) {
	if (OS_ANDROID) {
		if (forceReloadMenu) {
			isMenuChanged = true;
			isMenuInvalidated = false;
		}


		var activity = $.getActivity(true);
		if (activity) {
			Ti.API.info("Menu updateActionBar called with forceReloadMenu: " + forceReloadMenu);

			var actionBar = activity.actionBar;
			if (actionBar) {
				if ($.window.title) {
					actionBar.title = $.window.title;
				} else {
					actionBar.title = '';
				}
				// Update homeButton
				if (isBackButtonHidden) {
					actionBar.displayHomeAsUp = false;
					actionBar.onHomeIconItemSelected = function() {
						// Do nothing;
					};
				} else {
					actionBar.displayHomeAsUp = true;
					actionBar.onHomeIconItemSelected = function() {
						back();
					};
				}

			}

			if (isMenuChanged) {
				Ti.API.info("Menu Setting onPrepareOptionsMenu");
				activity.onPrepareOptionsMenu = onPrepareOptionsMenu;
			}
			if (isMenuChanged && !isMenuInvalidated && activity.invalidateOptionsMenu) {
				Ti.API.info("Menu Invalidating menu");
				activity.invalidateOptionsMenu();
				isMenuInvalidated = true;
			}
		}
	}
	return null;
};

function onPrepareOptionsMenu(e) {
	if (isMenuChanged) {
		isMenuChanged = false;
		isMenuInvalidated = false;
		var menu = e.menu;
		//Ti.API.info("Menu Removing group 1");
		//menu.removeGroup(1);
		// Application Menus

		menu.clear();

		Ti.API.info("Menu Adding menu About");

		// Add About menu
		var about = menu.add({
			title : L('about'),
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER
		});
		about.addEventListener('click', onAboutClick);

		for (var i = 0; i < androidMenus.length; i++) {
			Ti.API.info("Menu Adding menu " + i);
			Alloy.createController('application/toolbar/menu', {
				parentMenu : menu,
				window : $,
				data : androidMenus[i]
			});
		};
	}
}

function onAboutClick(e) {
	controller.getApplication().showAbout($);
}

exports.build = function(request, response) {
	var data = response.type ? response[response.type] : {};
	name = response.name;

	removeInitialFocus();
	topToolbar.init(data);
	bottomToolbar.init(data);
	isMenuChanged = true;
	androidMenus = [];
	uiFields = [];

	// Destroy previous handler if it exists
	$.destroyHandler();

	if (response.type === 'list') {
		handler = Alloy.createController('application/list/list', {
			window : $,
			data : data
		});
		handler.init();
	} else if (response.type === 'form') {
		if (data.template === 'scanner') {
			handler = Alloy.createController('application/form/scannerForm', {
				window : $,
				data : data
			});
		} else {
			handler = Alloy.createController('application/form/form', {
				window : $,
				data : data
			});
		}
		handler.init(data);
	} else if (response.type === 'imagelist') {
		handler = Alloy.createController('application/imagelist/imageList', {
			window : $,
			data : data
		});
		handler.init(data);
	} else if (response.type === 'imageviewer') {
		handler = Alloy.createController('application/imageviewer/imageViewer', {
			window : $,
			data : data
		});
		handler.init(data);
	} else if (response.type === 'map') {
		handler = Alloy.createController('application/map', {
			window : $,
			data : data
		});
	} else if (response.type === 'url') {
		handler = Alloy.createController('application/url', {
			window : $,
			data : data
		});

	} else if (response.type === 'spc') {
		$.clearWindow();
		var SpcView = null;
		if (response.name === 'a4/ui/textile/ItemRegistration') {
			SpcView = require('textile/ItemRegistration');
		} else {
			SpcView = require(response.name);
		}
		handler = new SpcView($, data);
		return;
	}
};

exports.refresh = function(request, response) {
	if (handler.refresh) {
		if (handler.refresh(request, response[response.type])) {
			return;
		}
	}
	$.build(request, response);
};

exports.replace = function(request, response) {
	$.build(request, response);
};

exports.update = function(request, response) {

	if (response.type && response[response.type]) {
		handler.update(request, response[response.type]);
		return;
	}
};

function removeInitialFocus() {
	if (initialFocusField) {
		initialFocusField = null;
	}
}

exports.setInitialFocus = function(field) {
	if (field) {
		initialFocusField = field;
	}
};

exports.clearWindowToolBars = function() {
	if (topToolbar) {
		topToolbar.clear();
	}
	if (bottomToolbar) {
		bottomToolbar.clear();
	}
	$.setBottomEditToolbarOnWindow(null);
};

exports.clearWindow = function(closing) {
	if (!closing) {
		$.window.title = '';
	}
	$.destroyHandler();
	$.clearWindowToolBars();
	$.setView(null);
};

exports.close = function(animated) {
	controller.removeWindowFromStack($);
	if (OS_IOS) {
		if (controller.getNavigationGroup().closeWindow) {
			controller.getNavigationGroup().closeWindow($.window, {
				animated : animated ? true : false
			});
		} else {
			controller.getNavigationGroup().close($.window, {
				animated : animated ? true : false
			});
		}
	}
	if (OS_ANDROID) {
		$.window.close({
			activityEnterAnimation : Ti.Android.R.anim.slide_in_left,
			activityExitAnimation : Ti.Android.R.anim.slide_out_right
		});
	}
};

exports.open = function(animated) {
	controller.addWindowToStack($);
	if (OS_IOS) {
		if (controller.getNavigationGroup().openWindow) {
			controller.getNavigationGroup().openWindow($.window, {
				animated : animated ? true : false
			});
		} else {
			controller.getNavigationGroup().open($.window, {
				animated : animated ? true : false
			});
		}
	}
	if (OS_ANDROID) {
		//hack - setting this property ensures the window is "heavyweight" (associated with an Android activity)
		//$.window.navBarHidden = $.window.navBarHidden || false;
		$.window.open({
			activityEnterAnimation : Ti.App.Android.R.anim.slide_in_right,
			activityExitAnimation : Ti.App.Android.R.anim.slide_out_left
		});
	}
};

exports.setLeftNavButton = function(button) {
	if (OS_IOS) {
		$.window.setLeftNavButton(button);
	}
};

exports.shutdown = function() {
};

exports.setTitle = function(title) {
	topToolbar.setTitle(title);
};

exports.setUIFields = function(newFields) {
	uiFields = newFields;
};

exports.setBottomButtons = function(buttons) {
	return bottomToolbar.setButtons(buttons);
};

exports.hideBottomToolbar = function() {
	return bottomToolbar.hide();
};

exports.getWindow = function() {
	return $.window;
};

exports.getController = function() {
	return controller;
};

exports.getConnection = function() {
	return connection;
};

exports.setOrientationModes = function(orientationModes) {
	$.window.orientationModes = orientationModes;
};

exports.addEventListener = function(e, func) {
	$.window.addEventListener(e, func);
};

exports.removeEventListener = function(e, func) {
	$.window.removeEventListener(e, func);
};

exports.fireEvent = function(e, object) {
	$.window.fireEvent(e, object);
};

exports.setView = function(view) {

	// If pickerView has been left on window ... Remove it
	// Fx if pickerView has been shown on a popover and the popover has been dismissed
	if ($.window.pickerView) {
		$.window.remove($.window.pickerView);
		$.window.pickerView = null;
	}

	if (view) {

		view.top = topToolbar.getHeight();
		view.bottom = bottomToolbar.getHeight();

		// Add the view infront of old
		$.window.add(view);
		Log.debug('Window.setView() added new View', debug);
		if ($.window.mainView) {
			$.window.remove($.window.mainView);
		}
		// Mark for removal
		$.window.mainView = view;
	} else {
		// Remove old view if found
		if ($.window.mainView) {
			$.window.remove($.window.mainView);
			$.window.mainView = null;
			Log.debug('Window.setView() removed mainView', debug);
		}
	}
	Log.debug('Window.setView() children count: ' + $.window.children.length, debug);
};

exports.setBottomEditToolbarOnWindow = function(toolbar) {

	if (toolbar) {
		$.window.add(toolbar);
		$.removeBottomEditToolbarOnWindow();
		$.window.bottomEditToolbar = toolbar;
	} else {
		$.removeBottomEditToolbarOnWindow();
	}
};

exports.removeBottomEditToolbarOnWindow = function() {

	var oldButtons = $.window.bottomEditToolbar;
	$.window.bottomEditToolbar = null;

	if (oldButtons) {
		try {
			//oldButtons.items = null;
			$.window.remove(oldButtons);
			oldButtons = null;
		} catch(err) {
			Log.error('setBottomEditToolbarOnWindow(win) Error removing bottomToolbar: ' + Conversion.toString(err));
		}
	}
};

exports.getJsonFields = function() {
	if (contentType == 'form') {
		return fieldsToJsonFields(uiFields, true);
	}
	return [];
};
exports.getCheckedJsonItems = function() {
	if (contentType === 'imagelist' || contentType === 'imageviewer') {
		return fieldsToJsonItems(uiFields, true);
	}
	return [];
};
exports.getJsonItems = function() {
	if (contentType === 'scannerform') {
		return uiFields;
	}
	return [];
};

exports.uiFieldsToJsonFields = function(allFields, blur) {
	return fieldsToJsonFields(allFields, blur);
};

exports.setButtonsAndTitleOnWindow = function(view, data, type, fields) {

	name = data.name;
	contentType = type;
	uiFields = fields || [];

	var onBackDisableClick = function(e) {
	};
	// Cleanup
	if (OS_IOS) {
		if ($.window.originalBackButtonTitle && $.window.leftNavButton) {
			$.window.leftNavButton.title = $.window.originalBackButtonTitle;
		}
	}
	if (OS_ANDROID) {
		if ($.window.backButton) {
//			$.window.removeEventListener('android:back', back);
			$.window.removeEventListener('androidback', back);
			$.window.backButton = null;
		}
		if (isBackButtonHidden) {
//			$.window.removeEventListener('android:back', onBackDisableClick);
			$.window.removeEventListener('androidback', onBackDisableClick);
			isBackButtonHidden = false;
		}
	}

	if (data.onClose) {
		onClose = data.onClose;
	}

	if (data.onBackClick) {
		onBackClick = data.onBackClick;

		if (OS_IOS) {
			var button = Ti.UI.createButton({
				titleid : 'back_button'
			});
			if (data.backbuttontitle) {
				button.title = Conversion.toString(data.backbuttontitle);
			}
			// TODO onBackClick is enabled but hiiden ?????
			if (data.backbuttonhide) {
				button.visible = false;
			}

			button.addEventListener('click', back);

			$.window.leftNavButton = button;
		}
		if (OS_ANDROID) {
			// Android
//			$.window.addEventListener('android:back', back);
			$.window.addEventListener('androidback', back);
		}
		$.window.backButton = true;
	} else {
		if (OS_IOS) {
			if ($.window.backButton) {
				if ($.window.originalBackButton) {
					$.window.leftNavButton = $.window.originalBackButton;
				} else {
					$.window.leftNavButton = null;
				}
				$.window.backButton = null;
			}

			if (data.backbuttonhide) {
				$.window.backButtonTitle = '';
				if ($.window.leftNavButton) {
					$.window.leftNavButton = null;
				}
				$.window.leftNavButton = Ti.UI.createView();
			} else {
				if (data.backbuttontitle) {
					$.window.backButtonTitle = Conversion.toString(data.backbuttontitle);
					if ($.window.leftNavButton) {
						$.window.leftNavButton.title = Conversion.toString(data.backbuttontitle);
					}
				}
			}
		}
		if (OS_ANDROID) {
			if (data.backbuttonhide) {
//				$.window.addEventListener('android:back', onBackDisableClick);
				$.window.addEventListener('androidback', onBackDisableClick);
				isBackButtonHidden = true;
			}
		}

	}

	var height = 0;
	var buttons = data.buttons;
	// Buttons ?
	var toolButtons = [];
	var topToolButtons = [];
	var menuCount = 0;
	if (buttons) {
		for (var i = 0,
		    c1 = buttons.length; i < c1; ++i) {
			var button = buttons[i];

			var btn = null;
			if (button.type === 'flexiblespace') {
				// Only supported on IOS
				if (OS_IOS) {
					btn = Ti.UI.createButton({
						systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
					});
				} else {
					continue;
				}
			} else if (button.type === 'fixedspace') {
				// Only supported on IOS
				if (OS_IOS) {
					btn = Ti.UI.createButton({
						systemButton : Ti.UI.iPhone.SystemButton.FIXED_SPACE
					});
				} else {
					continue;
				}
			} else if (button.apiName === 'Ti.UI.Button') {
				// Auto generated Ti.UI.Button
				btn = button;
			} else {

				if (OS_ANDROID) {
					button.showAsAction = Ti.Android.SHOW_AS_ACTION_ALWAYS;
					if (button.inmenu == true) {
						button.showAsAction = Ti.Android.SHOW_AS_ACTION_NEVER;
					}
					$.addAndroidMenu(button);
					menuCount++;
					continue;
				}

				btn = Alloy.createController('application/toolbar/button', {
					window : $,
					data : button
				}).getView();

			}

			if (button.position === 'top' || controller.isTop) {
				if (Alloy.isTablet && (controller.isDetail || (controller.isPopup && (controller.size != 'small' || !controller.size)) || controller.isTop || controller.isFullScreen)) {
					// On tablet
					if (OS_IOS) {
						topToolButtons.push(btn);
					}
				} else {
					if (OS_IOS) {
						if (topToolButtons.length < MAX_TOP_BUTTONS) {
							topToolButtons.push(btn);
						} else {
							toolButtons.push(btn);
						}
					}
					if (OS_ANDROID) {
						toolButtons.push(btn);
					}
				}
			} else {
				toolButtons.push(btn);
			}
		}
	}

	//	clearWindowToolbar(win);

	// ToolBar for buttons
	if (toolButtons.length > 0 || data.showbottombar === true) {
		height = $.setBottomButtons(toolButtons);
	} else {
		height = $.hideBottomToolbar();
	}
	topToolbar.setButtons(topToolButtons);
	view.bottom = height;
	$.setView(view);
	if (isOpened) {
		$.updateActionBar();
	}
	return height;
};

exports.metadataClick = function() {
	$.getController().metadataClick($);
};


function fieldsToJsonFields(allFields, blur) {
	var fields = [];

	for (var i = 0,
	    c1 = allFields.length; i < c1; ++i) {
		var type = allFields[i].getType();
		var value = allFields[i].getValue();
		if (type === 'signature' && !value) {
			continue;
		}
		if (type === 'button') {
			continue;
		}
		var field = {};
		if (blur && allFields[i].blur) {
			allFields[i].blur();
		}
		field.name = allFields[i].getName();
		field.type = type;
		field.value = value;
		if (allFields[i].getMetadata) {
			var metadata = allFields[i].getMetadata();
			if (metadata) {
				field.metadata = metadata;
			}
		}
		fields.push(field);
	}
	return fields;
}

function fieldsToJsonItems(allItems, checked) {
	var items = [];
	for (var i = 0,
	    c1 = allItems.length; i < c1; ++i) {
		if (checked && allItems[i].isChecked())
			items.push(allItems[i].getName());
	}
	return items;
}

function setFocus(e) {
	if (initialFocusField) {
		var focusFieldTemp = initialFocusField;
		removeInitialFocus();
		if (OS_ANDROID) {
			setTimeout(function() {
				if (focusFieldTemp.id === 'searchView') {
					focusFieldTemp.setIconified(false);
				} else {
					focusFieldTemp.focus();
				}
			}, 500);
		} else {
			setTimeout(function() {
				focusFieldTemp.focus();
			}, 500);
			//focusFieldTemp.focus();
		}
	}

}
