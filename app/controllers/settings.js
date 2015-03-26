var Images = require('Images');

var args = arguments[0] || {};
var connection = args.connection;
var button = args.button;
var exitAction = args.exitAction;
var enableServersetup = args.enableServersetup != false ? true : false;
var gotoServersetup = args.gotoServersetup != true ? false : true;
var extraMenus = args.extraMenus || [];

var setupChanged = false;

// Ensure retry
if (gotoServersetup) {
	setupChanged = true;
}
$.setupTableViewRow.leftImage = Images.getImage('NETWORK', 'list');
$.supportTableViewRow.leftImage = Images.getImage('USERS', 'list');
$.aboutTableViewRow.leftImage = Images.getImage('INFO', 'list');
$.logTableViewRow.leftImage = Images.getImage('LOG', 'list');

if (!enableServersetup) {
	// Remove
	$.setupTableViewRow.hasChild = false;
	$.setupTableViewRow.removeEventListener('click', onSetupTableViewRowClick);
	$.setupTableViewRow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
	$.setupTableViewRow.color = 'gray';
}

if (!ENV_PRODUCTION) {
	var tmpRows = $.settingsTable.data[0].rows;
	tmpRows.push($.logTableViewRow);
	$.settingsTable.data = tmpRows;
}

if (extraMenus && extraMenus.length > 0) {
	var newRows = [];
	for (var i = 0; i < extraMenus.length; i++) {
		newRows.push(Alloy.createController('settingsrow', {
			connection : connection,
			popover : $.settingsPopover,
			data : extraMenus[i]
		}).getView());
	};
	if (newRows.length > 0) {
		$.settingsTable.data = newRows.concat($.settingsTable.data[0].rows);
	}
}

if (Alloy.isTablet) {
	$.settingsPopover.contentView = $.settingsNavigationWindow;
}

function onSettingsWindowOpen(e) {
	if (enableServersetup && gotoServersetup) {
		onSetupTableViewRowClick();
	}
}

function onSettingsPopoverHide(e) {
	if (exitAction && setupChanged) {
		exitAction();
	}
}

function onCloseButtonClick(e) {
	$.settingsNavigationWindow.close({
		transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT
		//transition : Ti.UI.iPhone.AnimationStyle.CURL_DOWN
	});

	if (exitAction && setupChanged) {
		exitAction();
	}
}

function onSetupTableViewRowClick(e) {
	var setup = Alloy.createController('serversetup', {
		//connection : connection,
		settings : $
	});
	$.settingsNavigationWindow.openWindow(setup.getView());
}

function onSupportTableViewRowClick(e) {
	var oldExitAction = exitAction;
	if (Alloy.isTablet) {
		exitAction = null;
		$.settingsPopover.hide();
	}
	var support = Alloy.createController('support', {
		//connection : connection
	});
	// if (Alloy.isTablet) {
		// support.getView().addEventListener('close', function(e) {
			// exitAction = oldExitAction;
			// $.open();
		// });
		// $.settingsPopover.hide();
	// }
	support.getView().open();
}

function onAboutTableViewRowClick(e) {
	var about = Alloy.createController('about', {
		//connection : connection
	});
	$.settingsNavigationWindow.openWindow(about.getView());
}

function onLogTableViewRowClick(e) {
	var logsetup = Alloy.createController('logsetup', {
		//connection : connection,
		settings : $
	});
	$.settingsNavigationWindow.openWindow(logsetup.getView());
}

exports.open = function() {
	if (Alloy.isTablet) {
		$.settingsPopover.show({
			view : button,
			animated : true
		});
		if (enableServersetup && gotoServersetup) {
			onSetupTableViewRowClick();
		}
	} else {
		$.settingsNavigationWindow.open({
			transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
		});
	}
};

exports.setupChanged = function() {
	setupChanged = true;
};
