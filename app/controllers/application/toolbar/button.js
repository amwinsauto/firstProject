var Conversion = require('tools/Conversion');
var Images = require('Images');
var UIUtils = require('UIUtils');

var args = arguments[0] || {};
var window = args.window;
var controller = window.getController();
var data = args.data;

var title = '';
var enabled = true;
var image = '';
if (data.title) {
	title = Conversion.substituteAll(data.title, data.titleSubst);
}

if (data.disabled === true || data.enabled === false) {
	enabled = false;
}

if (data.image) {
	image = data.image;
} else if (data.icon) {
	image = data.icon;
}

if (image) {
	$.button = Alloy.createController('application/toolbar/buttonImage').getView();
//	if (OS_IOS) {
	Images.setToolbarIcon($.button, image, title);
//	} else {
//		image = Images.getImage(image, 'toolbar');
//		$.button.image = image;
//	}
} else {
	$.button = Alloy.createController('application/toolbar/buttonNormal').getView();
	$.button.title = title;
}

$.button.enabled = enabled;

if (OS_ANDROID) {
	if (!image) {
		if (title.length < 4) {
			// Androids small buttons looks ugly!!!
			$.button.width = 60;
		} else {
			$.button.width = 100;
		}
	}
}

$.button.addEventListener('click', function() {
	if (UIUtils.hideShownOptionDialog()) {
		return;
	}
	if (!controller.isPopover && UIUtils.hideShownPopover()) {
		return;
	}

	if (data.options) {
		Alloy.createController('application/toolbar/buttonGroup', {
			window : window,
			data : data,
			parent : $.button
		});
	} else {
		var fields = window.getJsonFields();
		var checkeditems = window.getCheckedJsonItems();
		var items = window.getJsonItems();
		var requestInfo = {
			type : 'buttonclick',
			caller : $.button,
			geolocation : data.geolocation,
			request : {
				action : 'onClick',
				type : 'button',
				button : {
					name : data.name,
					onClick : data.onClick,
					fields : fields.length > 0 ? fields : undefined,
					checkeditems : checkeditems.length > 0 ? checkeditems : undefined,
					items : items.length > 0 ? items : undefined
				}
			}
		};
		window.getConnection().sendInfo(requestInfo);
	}

});

exports.getView = function() {
	return $.button;
}; 