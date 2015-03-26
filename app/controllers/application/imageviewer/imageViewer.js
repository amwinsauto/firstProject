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

var imageCount = 9;
var duration = 4;
var playable = false;
var play = false;
var playerTimer = null;
var thumbnamilVisible = true;
var zoomable = true;
var scrollable = true;
var groupcheck = false;

if (Alloy.isHandheld) {
	imageCount = 4;
}

if (data.showthumbnails === false) {
	thumbnamilVisible = false;
}

if (data.scrollable === false) {
	scrollable = false;
}

if (data.play === true) {
	playable = true;
	play = true;
	thumbnamilVisible = false;
}

if (data.duration) {
	duration = parseInt(data.duration, 10);
}

if (data.zoomable === false) {
	zoomable = false;
}

if (data.groupcheck === true) {
	groupcheck = true;
}

var imageWidth = parseInt((100 / imageCount), 10);
var thumbnailProperties = {
	width : imageWidth + '%'
};

if (!scrollable) {
	$.images.scrollingEnabled = false;
}

var thumbItems = [];
var subThumbs = true;
var imageItems = [];

function onImagesScrollend(e) {
	if (!thumbnamilVisible) {
		var s = ($.images.currentPage + 1) + ' ' + L('of') + ' ' + $.images.views.length;
		$.thumbsFooter.text = s;

	}
}

function onThumbsScrollend(e) {
	// Update label on bottom
	var s = ($.thumbs.currentPage + 1) + ' ' + L('of') + ' ' + $.thumbs.views.length;
	$.thumbsFooter.text = s;
}

function fillThumbnails(listitem) {
	thumbItems = [];
	if (listitem.thumbnails) {
		subThumbs = true;
	} else {
		if (!subThumbs) {
			return;
		}
		subThumbs = false;
		if (data.items && data.items.length > 0) {
			var pages = [];
			var page = null;
			var itemIndex = 0;
			for (var i = 0, j = data.items.length; i < j; i++) {
				var item = data.items[i];
				itemIndex++;
				if (itemIndex > imageCount) {
					itemIndex = 1;
				}
				if (itemIndex === 1) {
					var page = Alloy.createController('application/imageviewer/thumbPage', {
						list : $,
						data : item
					});
					pages.push(page.getView());
				}

				var thumbItem = Alloy.createController('application/imageviewer/thumbItem', {
					window : window,
					viewer : $,
					data : item
				});
				thumbItems.push(thumbItem);
				thumbItem.getView().applyProperties(thumbnailProperties);
				page.getView().add(thumbItem.getView());
			}
			if (pages.length < 2) {
				$.images.bottom = parseInt($.images.bottom, 10) - parseInt($.thumbs.bottom, 10);
				$.thumbsFooter.visible = false;
				$.thumbs.bottom = 0;
			}
			$.thumbs.views = pages;
			onThumbsScrollend();

		}
	}
}

exports.init = function(newData) {

	if (!thumbnamilVisible) {
		//$.thumbsFooter.visible = false;
		$.thumbs.visible = false;
		$.images.bottom = parseInt($.thumbsFooter.height, 10);
	}

	var selectedIndex = 0;
	if (data.items && data.items.length > 0) {
		var pages = [];
		var page = null;
		var images = [];
		var itemIndex = 0;
		imageItems = [];
		for (var i = 0, j = data.items.length; i < j; i++) {
			var item = data.items[i];

			// if (data.geolocation) {
				// item.geolocation = true;
			// }

			if (item.selected === true) {
				selectedIndex = i;
			}

			if (item.zoomable === undefined) {
				item.zoomable = zoomable;
			}

			if (i === 0 && thumbnamilVisible) {
				fillThumbnails(item);
			}

			var imageItem = Alloy.createController('application/imageviewer/imageViewerItem', {
				window : window,
				viewer : $,
				data : item,
			});
			imageItems.push(imageItem);
			images.push(imageItem.getView());
		}
	}
	$.images.views = images;
	if (selectedIndex > 0) {
		$.images.setCurrentPage(selectedIndex);
	}

	if (!thumbnamilVisible) {
		onImagesScrollend();
	}

	window.setButtonsAndTitleOnWindow($.view, data, 'imageviewer', imageItems);

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
		Ti.API.info("ImageViewer - Timer started");
		playerTimer = setTimeout(function() {
			if (!play) {
				return;
			}
			if ($.images.currentPage < ($.images.views.length - 1)) {
				$.images.scrollToView($.images.currentPage + 1);
			} else {
				$.images.currentPage = 0;
				onImagesScrollend();
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
	Ti.API.info("ImageViewer - Timer stopped");
	play = false;
	if (playerTimer) {
		clearTimeout(playerTimer);
	}
}

// Named onDestroy because >destroy< is an alloy standard function
exports.onDestroy = function() {
	stop();
};

exports.isPlayable = function(item) {
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

exports.thumbnailSelected = function(selectedThumbItem) {
	if (playable) {
		if (play) {
			stop();
		} else {
			start();
		}
		return;
	}

	if (!subThumbs) {
		// scroll to image
		var imageItem = null;
		for (var i = 0, j = thumbItems.length; i < j; i++) {
			if (thumbItems[i] === selectedThumbItem) {
				$.images.setCurrentPage(i);
				//$.images.scrollToView(i); // Makes odd scroll
			}
		}
	} else {
		var imageItem = imageItems[$.images.currentPage];
		imageItem.init(thumbnail);

	}
};

exports.imageCheckboxClicked = function(selectedImage, checked) {
	if (groupcheck) {
		for (var i = 0; i < imageItems.length; i++) {
			imageItems[i].setChecked(checked);
		};
	}
};

exports.getWindow = function() {
	return window;
};
