var Images = require('Images');
var args = arguments[0] || {};
var data = args.data || {};
var showNew = args.showNew;
var standAlone = args.standAlone;
var loggedOn = args.loggedOn;
var index = args.index;
var pagesHeight = args.pagesHeight;
var pagesWidth = args.pagesWidth;

var connection = args.connection;

var runningApp = null;

var badgeWidth = parseInt($.badgeView.width, 10);
var tileWidth = parseFloat($.tile.width);
var tileHeight = parseFloat($.tile.height);

var name = data.name || 'not_set';
var title = data.title ? data.title.toString() : '';
var icon = Images.getImage(data.image || data.icon || 'DEFAULT', 'dashboard');

// Properties
var tileProperties = {};
var buttonProperties = {};

var tileCountWidth = parseInt(pagesWidth / (tileWidth + 10), 10);
var tileCountHeight = parseInt(pagesHeight / tileHeight, 10);

// new handled by showNew
if (!data.overlaytype || data.overlaytype === 'new') {
	if (showNew) {
		data.overlaytype = 'new';
	} else {
		data.overlaytype = '';
	}
} else {
	showNew = false;
}

// LABEL
$.label.text = title;
// IMAGE/ICON
$.icon.image = icon;

// TILE
tileProperties.top = getTopPosition(index);
tileProperties.left = getLeftPosition($.tile, index);
tileProperties.index = index;
tileProperties.data = data;

var backgroundSelectedImage = '';
var backgroundFocusedImage = '';
var backgroundImage = '';

if (data.overlaytype === 'coming') {
	if (Alloy.isTablet) {
		backgroundImage = Images.getImage('DASHBOARD_TILE_DISABLED', 'core');
	} else {
		backgroundImage = Images.getImage('PHONE_TILE_DISABLED', 'core');
	}
} else {
	if (Alloy.isTablet) {
		backgroundImage = Images.getImage('DASHBOARD_TILE', 'core');
		backgroundSelectedImage = Images.getImage('DASHBOARD_TILE_PRESSED', 'core');
		if (OS_ANDROID) {
			backgroundFocusedImage = Images.getImage('DASHBOARD_TILE_PRESSED', 'core');
		}
	} else {
		backgroundImage = Images.getImage('PHONE_TILE', 'core');
		backgroundSelectedImage = Images.getImage('PHONE_TILE_PRESSED', 'core');
		if (OS_ANDROID) {
			backgroundFocusedImage = Images.getImage('PHONE_TILE_PRESSED', 'core');
		}
	}
}

buttonProperties.backgroundSelectedImage = backgroundSelectedImage;
if (OS_ANDROID) {
	buttonProperties.backgroundFocusedImage = backgroundFocusedImage;
}
buttonProperties.backgroundImage = backgroundImage;

// OVERLAY
if (data.overlaytype === 'coming' || data.overlaytype === 'demo' || data.overlaytype === 'new') {
	if (data.overlaytype === 'coming') {
		if (Alloy.isTablet) {
			buttonProperties.backgroundImage = Images.getImage('DASHBOARD_TILE_DISABLED', 'core');
		} else {
			buttonProperties.backgroundImage = Images.getImage('PHONE_TILE_DISABLED', 'core');
		}
	}
	if (Alloy.isTablet) {
		$.overlay.image = '/images/core/dashboard/' + L('image_path_prefix') + '/tile_overlay_' + data.overlaytype + '.png';
	} else {
		$.overlay.image = '/images/core/dashboard/' + L('image_path_prefix') + '/phone_tile_overlay_' + data.overlaytype + '.png';
	}
	$.overlay.visible = true;
}

$.button.applyProperties(buttonProperties);
$.tile.applyProperties(tileProperties);

exports.init = function(data) {
	name = data.name;
	$.setBadge(data.badge);
};

exports.update = function(data) {
	$.setBadge(data.badge);
};

exports.getName = function() {
	return name;
};

exports.getTitle = function() {
	return title;
};
exports.getIcon = function() {
	return icon;
};
exports.toJson = function() {
	return data;
};

exports.setBadge = function(count) {
	if (count && count > 0) {
		var badge = count.toString();
		$.badgeLabel.text = badge;
		$.badgeView.width = ((badgeWidth / 3) * (badge.length + 2));
		$.badgeView.visible = true;
	} else {
		$.badgeView.visible = false;
	}
};

exports.getTileCount = function() {
	return tileCountWidth * tileCountHeight;
};

exports.applicationStarted = function(newRunningApp) {
	runningApp = newRunningApp;
};

exports.applicationEnded = function() {
	runningApp = null;
};

function onClick(e) {
	if (data.overlaytype === 'coming') {
		return;
	}
	if (runningApp) {
		Alloy.Globals.applicationSwitch(runningApp);
		return;
	}


	removeNew();


	connection.sendInfo({
		type : 'dasboarditemclick',
		dashboarditem: $,
		request : {
			action : 'onClick',
			type : 'dashboarditem',
			dashboarditem : {
				name : data.name,
				//type : data.type,
				onClick : data.onClick
			}
		}
	});
	return;



	// var type = data.type;
	// if (type === 'navigatorapplication') {
		// type = 'application';
	// }
// 
	// switch(type) {
	// case 'application' :
		// if (runningApp) {
			// Alloy.Globals.applicationSwitch(runningApp);
			// break;
		// }
// 
		// runningApp = Alloy.createController('application/application', {
			// dashboarditem : $,
			// standAlone : standAlone,
			// loggedOn : loggedOn
		// });
		// runningApp.startApplication(data);
		// break;
	// case 'url' :
		// var url = Alloy.createController('browser', {
			// url : data.url,
			// title : data.title
		// });
		// url.open();
		// break;
	// }
// 

}

function getLeftPosition(tile, index) {
	var padding = (pagesWidth - (tileCountWidth * tileWidth)) / (tileCountWidth + 1);
	var column = index % tileCountWidth;
	if (column === 0) {
		column = tileCountWidth;
	}
	column--;

	var columnWidth = padding + tileWidth;
	return padding + (columnWidth * column);
}

function getTopPosition(index) {
	var padding = (pagesHeight - (tileCountHeight * tileHeight)) / (tileCountHeight + 1);
	var row = indexToRow(index, tileCountWidth);
	var rowHeight = padding + tileHeight;
	return padding + (rowHeight * row);
}

function indexToRow(index, totalIconRowCount) {
	var offset = index % totalIconRowCount;
	var row = Math.floor(index / totalIconRowCount);
	if (offset !== 0) {
		row = row + 1;
	}
	return row - 1;
}

function removeNew() {
	if (showNew) {
		showNew = false;
		var calledApps = Ti.App.Properties.getObject('calledApps', {}) || {};
		calledApps[data.name] = true;
		Ti.App.Properties.setObject('calledApps', calledApps);
		$.overlay.visible = false;
	}
}
