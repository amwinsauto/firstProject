var Images = require('Images');
var args = arguments[0] || {};
//var parent = args.parent;
var logoff = args.logoff;

var exitAction = args.exitAction;
var callExitAction = false;
var connection = args.connection;
var aliases = args.aliases;
var enableServersetup = args.enableServersetup != false ? true : false;
var extraButtons = args.extraButtons;
var dashboard = args.dashboard;
var application = args.application;
var dashboardUpdated = false;
var clientVersionRequired = args.clientVersionRequired || '';

var serverOK = true;

var onOpenedAction = null;
var currentView = null;
var currentButton = null;

var buttonColor = $.setupButton.backgroundColor;
var currentButtonColor = $.setupButton.egBackgroundColorSelected || 'white';

if (extraButtons && extraButtons.length > 0) {
	if (extraButtons) {
		for (var i = 0; i < extraButtons.length; i++) {
			var data = extraButtons[i];
			var button = Alloy.createController('menu/menubutton', {
				onClickFunction : onExtraMenuClick,
				data : data
			});
			$.buttons.add(button.getView());
		};
	}
}

function onExtraMenuClick(button, data) {
	if (data.onClick) {
		connection.send({
			action : 'onClick',
			type : 'menu',
			menu : {
				name : data.name,
				onClick : data.onClick
			}
		});
	}

}

if (args.index) {
	// Always call exitAction when called from index
	serverOK = false;
	callExitAction = true;
}

if (args.update) {
	// Goto update screen
	$.buttons.add($.updateButton);
	onOpenedAction = onUpdateClick;
}

if (dashboard) {
	$.buttons.add($.editButton);
}

if (args.serversetup) {
	$.buttons.add($.setupButton);
	if (args.showServersetup) {
		onOpenedAction = onSetupClick;
	}
}

if (OS_IOS) {
	if (Alloy.Globals.currentApplication) {
		$.buttons.add($.workspaceButton);
	}
}

if (aliases && aliases.length > 0) {
	var metaDataItems = Alloy.Globals.getMetadataItems();
	if (metaDataItems) {
		for (var i = 0; i < metaDataItems.length; i++) {
			var data = metaDataItems[i];
			var button = Alloy.createController('menu/menubutton', {
				onClickFunction : onSteppingStoneClick,
				data : data
			});
			$.buttons.add(button.getView());
		};
	}
}

if (OS_IOS) {
	if ((Alloy.Globals.applicationStack.length > 1) || !application && Alloy.Globals.applicationStack.length === 1) {
		$.buttons.add($.switchButton);
	}
}

if (args.about) {
	$.buttons.add($.aboutButton);
	if (args.showAbout) {
		onOpenedAction = onAboutClick;
	}
}

if (logoff) {
	$.logoffButton.visible = true;
}

function onCloseClick(e) {
	if (callExitAction) {
		close(exitAction);
	} else {
		close();
	}
}

function onBackgroundClick(e) {
//	if (currentView == null) {
		close();
//	}
}

function close(closeAction) {

	removeCurrent();

	// Create Animations.
	var unfadeBackground = Ti.UI.createAnimation({
		duration : 400,
		opacity : 0.0
	});

	var slideMenuOut = Ti.UI.createAnimation({
		duration : 400,
		left : parseInt($.menuBar.width, 10) * -1
	});
	$.menuBar.animate(slideMenuOut);
	$.menuWindowBackground.animate(unfadeBackground);
	unfadeBackground.addEventListener('complete', function() {
		$.menuWindow.close({
			animated : false
		});
		if (closeAction) {
			closeAction();
		}
		if (dashboardUpdated && dashboard) {
			dashboard.dashboardUpdated();
		}
	});

}

exports.close = function() {
	if (callExitAction) {
		close(exitAction);
	} else {
		close();
	}
};

exports.settingsUpdated = function() {
	callExitAction = true;
};

exports.dashboardUpdated = function() {
	dashboardUpdated = true;
};

function removeCurrent() {
	setCurrent();
	// if (currentView) {
	// $.menuDetailView.remove(currentView);
	// currentView = null;
	// }
	// if (currentButton) {
	// currentButton.backgroundColor = buttonColor;
	// currentButton = null;
	// }
}

function setCurrent(button, view) {

	//	removeCurrent();

	// Clear current button
	if (currentButton) {
		currentButton.backgroundColor = buttonColor;
		currentButton = null;
	}

	// Set new current button
	if (button) {
		currentButton = button;
		currentButton.backgroundColor = currentButtonColor;
	}

	// backup currentView
	var oldCurrent = currentView;

	// Set current view
	if (view != null) {
		$.menuDetailView.add(view);
		currentView = view;
	}

	// Clear old current
	if (oldCurrent) {
		$.menuDetailView.remove(oldCurrent);
	}

}

function onEditClick(e) {
	var edit = Alloy.createController('menu/dashboardedit', {
		dashboard : dashboard,
		updatedAction : $.dashboardUpdated
	});
	edit.init();
	setCurrent($.editButton, edit.getView());
}

function onSwitchClick(e) {
	var switcher = Alloy.createController('menu/applicationswitcher', {
		menu : $
	});
	//switcher.init();
	setCurrent($.switchButton, switcher.getView());
}

function onWorkspaceClick(e) {
	Alloy.Globals.applicationHideAll();
	onCloseClick();
}

function onSteppingStoneClick(button, data) {
	if (aliases.length > 0) {

		var step = Alloy.createController('menu/steppingstone', {
			rowClickAction : steppingStoneRowClick,
			connection : connection
		});
		step.init({
			type : 'aliasclick',
			request : {
				action : 'onClick',
				type : 'metadata',
				metadata : {
					name : 'metadata',
					onClick : data.onClick,
					aliases : aliases
				}
			}
		});
		setCurrent(button, step.getView());
	}
}

function steppingStoneRowClick(data) {
	close(function() {
		connection.sendInfo(data);
	});

}

// function onSteppingStoneClick1(e) {
// close(function() {
// if (aliases.length > 0) {
// connection.sendInfo({
// type : 'aliasclick',
// request : {
// action : 'onClick',
// type : 'metadata',
// metadata : {
// name : 'metadata',
// onClick : Alloy.Globals.metadata.onClick,
// aliases : aliases
// }
// }
// });
// }
// });
// }

function onSetupClick(e) {
	var info = Alloy.createController('menu/serverinfo', {
		serverOK : serverOK,
		settingsUpdated : $.settingsUpdated,
		exitAction : $.close
		//settings : $
	});
	setCurrent($.setupButton, info.getView());
}

function onUpdateClick(e) {
	var view = Alloy.createController('menu/update', {
		version : clientVersionRequired
	});
	setCurrent($.updateButton, view.getView());
}

function onAboutClick(e) {
	var about = Alloy.createController('menu/about', {});
	setCurrent($.aboutButton, about.getView());
}

function onLogoffClick(e) {
	if (logoff) {
		close(logoff);
	} else {
		close();
	}
}

function onOpen(e) {
	
	if (!onOpenedAction && $.buttons.children && $.buttons.children.length === 1 && $.buttons.children[0] === $.aboutButton) {
		onOpenedAction = onAboutClick;
	}
	
	// Create Animations.
	var fadeBackground = Ti.UI.createAnimation({
		duration : 400,
		opacity : 0.5
	});
	var slideMenuIn = Ti.UI.createAnimation({
		duration : 400,
		left : 0
	});

	// Start the Animation.
	$.menuWindowBackground.animate(fadeBackground);
	// fadeBackground.addEventListener('start', function() {});
	// fadeBackground.addEventListener('complete', function() {});
	if (onOpenedAction) {
		slideMenuIn.addEventListener('complete', onOpenedAction);
	}
	$.menuBar.animate(slideMenuIn);
}

exports.open = function(data) {
	$.menuWindow.open({
		animated : false
	});
};

