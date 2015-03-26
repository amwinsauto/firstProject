var ResponseUtils = require('ResponseUtils');

var args = arguments[0] || {};
var parent = args.parent;
var loggedOn = args.loggedOn;
var enableServersetup = args.enableServersetup;

var connection = Alloy.createController('ServerConnection', {
	callback : $
});

var onRefresh = null;
var onSave = null;
var editable = false;

var pageControllers = [];

var dashboardItems = [];
var dashboardMenus = [];

var calledApps = Ti.App.Properties.getObject('calledApps', {}) || {};

var name = 'no_name';
var title = '';

// Write the log
if (Alloy.Globals.logger) {
	Alloy.Globals.logger.write();
}

var screenWidth = Ti.Platform.displayCaps.platformWidth;
var screenHeight = Ti.Platform.displayCaps.platformHeight;

if (OS_ANDROID) {
	screenWidth = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor;
	screenHeight = Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor;
}

var pagesHeight = screenHeight - parseFloat($.dashboardPages.top);

// top bar !!
if (OS_IOS) {
	pagesHeight -= parseFloat($.dashboardPages.pagingControlHeight);
}
var pagesWidth = screenWidth;

if (OS_ANDROID) {
	pagesHeight -= 80;
}

function updateItem(data) {
	var item = null;
	for (var i = 0; i < dashboardItems.length; i++) {
		if (dashboardItems[i].getName() === data.name) {
			item = dashboardItems[i];
		}
	}
	if (item) {
		item.update(data);
	}
}

function update(data) {
	if (data.badge || data.badge === 0) {
		if (OS_IOS) {
			Ti.UI.iPhone.appBadge = parseInt(data.badge, 10);
		}
	}
	if (data.name) {
		name = data.name.toString();
	}
	if (data.title) {
		title = data.title.toString();
		if (OS_IOS) {
			$.title.text = title;
		}
		$.dashboardWindow.title = title;
	}

	var items = data.items || data.dashboarditems || [];

	if (items.length < 1) {
		return;
	}
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		updateItem(item);
	}
}

function rearrangeDashboard(data, setup) {
	//Ti.API.info("Old:" + JSON.stringify(data));
	var items = data.items || data.dashboarditems || [];
	delete data.items;
	delete data.dashboarditems;
	data.pages = [];

	var newItems = [];

	if (setup) {
		var sPages = setup.pages || [];
		for (var a = 0; a < sPages.length; a++) {
			var sPage = sPages[a];
			var page = {
				//name : sPage.name,
				title : sPage.title,
				hidden : sPage.hidden,
				items : []
			};
			var sItems = sPage.items || [];
			for (var b = 0; b < sItems.length; b++) {
				var sItem = sItems[b];
				// find item at put do page
				for (var c = 0; c < items.length; c++) {
					if (items[c].name == sItem.name) {
						page.items.push(items[c]);
						newItems.push(items[c]);
						items.splice(c, 1);
						break;
					}
				}
			}
			if (page.items.length > 0) {
				data.pages.push(page);
			}
		}
	}
	if (items.length > 0) {
		var page = {
			//name : 'new_items',
			title : '',
			items : []
		};
		for (var d = 0; d < items.length; d++) {
			page.items.push(items[d]);
			newItems.push(items[d]);
		};
		items = [];
		if (page.items.length > 0) {
			data.pages.push(page);
		}

	}

	data.items = newItems;
	// Ti.API.info("New:" + JSON.stringify(data));
	// Ti.API.info("Remaining:" + JSON.stringify(items));

}

function fill(data) {

	if (data.badge || data.badge === 0) {
		if (OS_IOS) {
			Ti.UI.iPhone.appBadge = parseInt(data.badge, 10);
		}
	}

	if (data.editable) {
		editable = true;
	}

	if (data.onRefresh) {
		onRefresh = data.onRefresh;
	}
	if (data.onSave) {
		onSave = data.onSave;
	}

	if (data.title) {
		title = data.title.toString();
		if (OS_IOS) {
			$.title.text = title;
		}
		$.dashboardWindow.title = title;
	}
	if (data.name) {
		name = data.name.toString();
	}

	dashboardMenus = data.menus || data.dashboardmenus || [];

	if (!data.pages) {
		// rearrange icons
		var setup = Ti.App.Properties.getObject('dashboard_' + name, null);
		// if (setup) {
		rearrangeDashboard(data, setup);
		// }
	}
	// Fill dashboard
	dashboardItems = [];

	pageControllers = [];

	var maxIconsOnView = 9;

	for (var p = 0; p < data.pages.length; p++) {
		var pageData = data.pages[p];
		var items = pageData.items || [];

		var idx = 1;
		var page = null;

		for (var i = 0; i < items.length; i++) {
			var dashboardItem = items[i];
			if (!dashboardItem.name) {
				dashboardItem.name = 'name_not_set';
			}
			if (idx === 1) {
				page = Alloy.createController('dashboardpage', {
					name : pageData.name,
					title : pageData.title,
					hidden : pageData.hidden
				});
				pageControllers.push(page);
			}

			var tile = Alloy.createController('dashboarditem', {
				index : idx,
				data : dashboardItem,
				connection : connection,
				pagesHeight : pagesHeight,
				pagesWidth : pagesWidth,
				standAlone : false,
				loggedOn : loggedOn,
				showNew : calledApps[dashboardItem.name] ? false : true
			});

			tile.init(dashboardItem);
			maxIconsOnView = tile.getTileCount();

			dashboardItems.push(tile);
			page.addItem(tile);
			idx++;
			if (idx > maxIconsOnView) {
				idx = 1;
			}
		}
		// Set the views
		if ($.dashboardPages.views) {
			$.dashboardPages.setCurrentPage(0);
		}
	}
	var pages = [];
	_.each(pageControllers, function(page) {
		if (!page.isHidden()) {
			pages.push(page.getView());
		}
	});
	$.dashboardPages.setViews(pages);
	// Trigger title update
	onScrollEnd();

	if (OS_IOS) {
		if (pageControllers.length > 1) {
			$.dashboardPages.showPagingControl = true;
		} else {
			$.dashboardPages.showPagingControl = false;
		}
	}

}

exports.push = function(data) {
	if (data) {
		if (data.id) {
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

exports.beacon = function(data, backgroundaction) {
	if (!data) {
		return;
	}
	if (backgroundaction) {
		connection.sendBeacon(data);
	} else {
		connection.send(data);
	}
};

exports.update = function(data) {
	update(data);
};

exports.init = function(data) {
	fill(data);

	if (Alloy.Globals.iBeacon) {
		Alloy.Globals.iBeacon.init(data);
	}

};

exports.toJson = function() {
	var data = {
		name : name,
		title : title,
		pages : []
	};
	var hiddenPage = null;
	for (var i = 0; i < pageControllers.length; i++) {
		if (pageControllers[i].isHidden()) {
			if (!hiddenPage) {
				hiddenPage = pageControllers[i].toJson();
			} else {
				var tmp = pageControllers[i].toJson();
				for (var a = 0; a < tmp.items.length; a++) {
					hiddenPage.items.push(tmp.items[a]);
				};
			}
		} else {
			data.pages.push(pageControllers[i].toJson());
		}
	};
	if (hiddenPage) {
		data.pages.push(hiddenPage);
	}
	return data;
};

exports.open = function() {
	Alloy.Globals.dashboard = $;
	$.dashboardWindow.open();
};

exports.dashboardUpdated = function() {
	if (onSave) {
		save();
	} else if (onRefresh) {
		onRefreshClick();
	}
};

exports.refresh = function() {
	onRefreshClick();
};

exports.save = function() {
	save();
};

exports.close = function() {

	// Cleanup
	onRefresh = null;
	onSave = null;
	dashboardItems = null;
	pageControllers = null;
	Alloy.Globals.dashboard = null;

	Alloy.Globals.applicationCloseAll();

	// Return to index
	$.dashboardWindow.close();
};

exports.settingsUpdated = function() {
	$.close();
	// Tell parent that settings has changed
	parent.settingsUpdated();
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
		if (handleAction(responses, responses[i])) {
			return;
		}
	}
};

function handleAction(responses, response) {
	if (response.error) {
		var errorinfo = response.errorinfo || {};
		Ti.UI.createAlertDialog({
			message : errorinfo.errortext
		}).show();
		return;
	}

	switch(ResponseUtils.getType(response)) {
	case 'application':
		// Start application
		var ri = connection.getRequestInfo() || {};
		var dbi = ri.dashboarditem;
		var app = Alloy.createController('application/application', {
			dashboarditem: dbi,
			standAlone : false,
			loggedOn : loggedOn
		});
		// Call with responses in case application and fx list i returned
		app.startApplication(responses);
		return true;
		break;
	case 'dashboard':
		if (ResponseUtils.getAction(response) === 'update') {
			update(ResponseUtils.getObject(response));
		} else if (ResponseUtils.getAction(response) === 'refresh') {
			fill(ResponseUtils.getObject(response));
		} else {
			fill(ResponseUtils.getObject(response));
		}
		break;
	case 'alert':
		Alloy.createController('application/alert/alert', {
			connection : connection,
			data : response.alert
		}).show();
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
	}
	return false;
};

exports.handleError = function(message, desc) {
	//alert(desc);
	Ti.UI.createAlertDialog({
		message : desc
	}).show();

};

function showMenu() {
	var menu = Alloy.createController('menu/menu', {
		parent : $.dashboardWindow,
		connection : connection,
		extraButtons : dashboardMenus,
		dashboard : editable ? $ : undefined,
		serversetup : enableServersetup,
		support : true,
		about : true,
		exitAction : $.settingsUpdated,
		logoff : Alloy.Globals.logon ? onCloseClick : undefined
	}).open();
}

// EVENTS
function onMenuButtonClick(e) {
	showMenu();
}

function onCloseClick(e) {
	$.close();
}

function onRefreshClick(e) {
	if (onRefresh) {
		var requestInfo = {
			type : 'dashboardrefresh',
			request : {
				action : 'onRefresh',
				type : 'dashboard',
				dashboard : {
					name : name,
					onRefresh : onRefresh
				}
			}
		};
		connection.sendInfo(requestInfo);
	}
}

function onLongPress(e) {
	showMenu();
}

function save(data) {
	if (onSave) {
		var dashboard = Ti.App.Properties.getObject('dashboard_' + name, null);
		dashboard.onSave = onSave;
		var requestInfo = {
			type : 'save',
			caller : $.dashboardWindow,
			request : {
				action : 'onSave',
				type : 'dashboard',
				dashboard : dashboard
			}
		};
		connection.sendInfo(requestInfo);
	}
}

function onScrollEnd(e) {
	if ($.dashboardPages.views) {
		if (pageControllers[$.dashboardPages.currentPage]) {
			var newTitle = pageControllers[$.dashboardPages.currentPage].getTitle();
			if (!newTitle) {
				newTitle = title;
			}
			$.dashboardWindow.title = newTitle;
			if (OS_IOS) {
				$.title.text = newTitle;
			}
		}
	}
}

function onAndroidBack(e) {
	$.close();
	parent.close(true);
	// if (!Alloy.Globals.logon) {
	// Ti.Android.currentActivity.finish();
	// }

}

function onAndroidHomeClick(e) {
	showMenu();
}

function onServerSetupClick(e) {
	var serversetup = Alloy.createController('serversetup', {
		exitAction : $.settingsUpdated
	});
	serversetup.open();
}

function onSupportClick(e) {
	var support = Alloy.createController('support', {
	});
	support.getView().open();
}

function onAboutClick(e) {
	var about = Alloy.createController('about', {
	});
	about.getView().open();
}

function onOpen(e) {
	if (OS_ANDROID && false) {
		$.dashboardWindow.activity.onCreateOptionsMenu = function(e) {

			if (dashboardMenus && dashboardMenus.length > 0) {
				for (var i = 0; i < dashboardMenus.length; i++) {
					var title = dashboardMenus[i].title || 'no title' + i;
					var id = dashboardMenus[i].name || 'noId' + i;
					var extraProps = {
						title : title,
						//icon : "/images/icons/toolbar/refresh.png",
						showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
						id : id
					};
					var extraMenu = e.menu.add(_.pick(extraProps, Alloy.Android.menuItemCreateArgs));
					extraMenu.applyProperties(_.omit(extraProps, Alloy.Android.menuItemCreateArgs));
					addClick(extraMenu, dashboardMenus[i]);
				};
			}
			function addClick(menu, data) {
				menu.addEventListener("click", function(e) {
					if (data.onClick) {
						connection.send({
							action : 'onClick',
							type : 'click',
							click : {
								name : data.name,
								onClick : data.onClick
							}
						});
					}

				});
			}

			if (enableServersetup) {
				var serverSetupProps = {
					title : L("server_setup"),
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
					id : "serverSetupMenu",
					itemId : "100"
				};
				var serverSetupMenu = e.menu.add(_.pick(serverSetupProps, Alloy.Android.menuItemCreateArgs));
				serverSetupMenu.applyProperties(_.omit(serverSetupProps, Alloy.Android.menuItemCreateArgs));
				serverSetupMenu.addEventListener("click", onServerSetupClick);
			}
			var supportMenuProps = {
				title : L("support"),
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				id : "supportMenu"
			};
			var supportMenu = e.menu.add(_.pick(supportMenuProps, Alloy.Android.menuItemCreateArgs));
			supportMenu.applyProperties(_.omit(supportMenuProps, Alloy.Android.menuItemCreateArgs));
			supportMenu.addEventListener("click", onSupportClick);

			var aboutMenuProps = {
				title : L("about"),
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				id : "aboutMenu"
			};
			var aboutMenu = e.menu.add(_.pick(aboutMenuProps, Alloy.Android.menuItemCreateArgs));
			aboutMenu.applyProperties(_.omit(aboutMenuProps, Alloy.Android.menuItemCreateArgs));
			aboutMenu.addEventListener("click", onAboutClick);
		};
	}
}
