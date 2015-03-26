var args = arguments[0] || {};
var data = args.data;
var window = args.window;
var controller = window.getController();
var connection = controller.getConnection();
var application = controller.getApplication();

if (OS_ANDROID) {
	//window.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}
if (OS_IOS) {
	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}

var duration = 4;
var playable = false;
var play = false;
var playerTimer = null;

if (data.play === true) {
	playable = true;
	play = true;
}
if (data.duration) {
	duration = parseInt(data.duration, 10);
}

var items = [];

var rows = 2;
var columns = 3;

if (data.rows) {
	rows = parseInt(data.rows, 10);
}
if (data.columns) {
	columns = parseInt(data.columns, 10);
}

var imageCount = rows * columns;
var imageTop = $.images.egImageTop;
var imageLeft = $.images.egImageLeft;
var imageHeight = (100 - (imageTop * (rows + 1))) / rows;
var imageWidth = (100 - (imageLeft * (columns + 1))) / columns;

var itemProperties = {};
itemProperties.top = imageTop + '%';
itemProperties.left = imageLeft + '%';
itemProperties.height = imageHeight + '%';
itemProperties.width = imageWidth + '%';

function onScrollend(e) {
	// Update label on bottom
	if ($.images.views) {
		var s = ($.images.currentPage + 1) + ' ' + L('of') + ' ' + $.images.views.length;
		$.footer.text = s;
	}
}

exports.init = function(newData) {
	// Init genreal properties
	// if (data.rows) {
	// rows = data.rows;
	// }
	// if (data.columns) {
	// columns = data.columns;
	// }

	var pages = [];
	if (data.items && data.items.length > 0) {
		var page = null;
		var itemIndex = 0;
		for (var i = 0, j = data.items.length; i < j; i++) {
			var item = data.items[i];

			// if (data.geolocation) {
				// item.geolocation = true;
			// }

			itemIndex++;
			if (itemIndex > imageCount) {
				itemIndex = 1;
			}
			if (itemIndex === 1) {
				var page = Alloy.createController('application/imagelist/imageListPage', {
					list : $,
					data : item
				});
				if (data.zoomable === true) {
					page.getView().maxZoomScale = 10.0;
				}
				pages.push(page.getView());
			}

			var imageItem = Alloy.createController('application/imagelist/imageListItem', {
				window : window,
				list : $,
				data : item
			});
			imageItem.getView().applyProperties(itemProperties);
			items.push(imageItem);
			page.getView().add(imageItem.getView());
		};
	}

	if (pages.length < 2) {
		$.footer.visible = false;
		$.images.bottom = 0;
	}

	$.images.views = pages;
	onScrollend();

	window.setButtonsAndTitleOnWindow($.view, data, 'imagelist', items);

	if (play) {
		start();
	}

};

function start() {
	if (playable) {
		play = true;
		next();
	}
}

function next() {
	if ($.images.views && $.images.views.length > 1) {
		Ti.API.info("ImageList - Timer started");
		playerTimer = setTimeout(function() {
			if (!play) {
				return;
			}
			if ($.images.currentPage < ($.images.views.length - 1)) {
				$.images.scrollToView($.images.currentPage + 1);
			} else {
				$.images.currentPage = 0;
				onScrollend();
			}
			if (play) {
				next();
			}
		}, (duration * 1000));
	} else {
		stop();
	}
}

function stop() {
	Ti.API.info("ImageList - Timer stopped");
	play = false;
	if (playerTimer) {
		clearTimeout(playerTimer);
	}
}

// Named onDestroy because >destroy< is an alloy standard function
exports.onDestroy = function() {
	stop();
};

exports.isPlayable = function() {
	if (playable) {
		if (play) {
			stop();
		} else {
			start();
		}
		return true;
	}
	return false;
};

exports.getWindow = function() {
	return window;
};
