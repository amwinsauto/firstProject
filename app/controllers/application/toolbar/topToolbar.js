var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;
var window = args.window;

$.window = window;

$.height = 0;
// if (OS_ANDROID) {
	// if (Alloy.Globals.isAndroidOld) {
		// $.height = parseInt($.topToolbar.height);
	// }
// }
// if (OS_IOS) {
	// if (Ti.version < '3.3.0') {
		// $.topToolbar.width = controller.isTop ? Ti.Platform.displayCaps.platformWidth / 2 : 300;
	// }
// }
$.buttons = [];
$.visible = false;
var height = 0;

exports.init = function(data) {
	$.setTitle(Conversion.substituteAll(data.title, data.titleSubst));
	if (data.hidetopbar || data.showtopbar === false) {
		$.hide();
	} else {
		$.show();
	}
};

exports.setTitle = function(t) {
	var title = t ? t.toString() : '';
	window.getWindow().title = title;
	// if (OS_ANDROID) {
		// if (Alloy.Globals.isAndroidOld) {
			// $.titleLabel.text = title;
		// }
	// }
};

exports.getHeight = function() {
	return height;
};

exports.show = function() {
	if ($.visible) {
		return height;
	}
	height = $.height;

	if (OS_IOS) {
		window.getWindow().showNavBar({
			animated : false
		});
	} else {
		// if (OS_ANDROID && Alloy.Globals.isAndroidOld) {
			// window.getWindow().add($.topToolbar);
		// }
	}

	$.visible = true;
	return height;
};

exports.hide = function() {
	if ($.visible) {
		if (OS_IOS) {
			$.window.getWindow().hideNavBar({
				animated : false
			});
		} else {
			// if (OS_ANDROID && Alloy.Globals.isAndroidOld) {
				// window.getWindow().remove($.topToolbar);
			// }
		}
	}
	height = 0;
	$.visible = false;
	return height;
};

exports.clear = function() {
	if (OS_ANDROID) {
		// for (var i = 0; i < $.buttons.length; i++) {
			// $.topToolbar.remove($.buttons[i]);
		// }
	} else {
		// if (Ti.version < '3.3.0') {
			// if ($.topToolbar) {
				// $.topToolbar.items = [];
			// }
			// window.getWindow().rightNavButton = null;
		// } else {
			window.getWindow().rightNavButtons = [];
		// }
	}
	$.buttons = [];
};

exports.setButtons = function(buttons) {
	if (buttons && buttons.length > 0) {
		$.buttons = buttons;
		if (OS_ANDROID) {
			// $.clear();
			// for (var i = 0; i < buttons.length; i++) {
				// $.topToolbar.add(buttons[i]);
			// }
		} else {
			// if (Ti.version < '3.3.0') {
				// if (buttons.length > 1) {
					// $.topToolbar.items = [Ti.UI.createButton({
						// systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
					// })].concat(buttons);
					// window.getWindow().rightNavButton = $.topToolbar;
				// } else {
					// window.getWindow().rightNavButton = buttons[0];
				// }
			// } else {
				window.getWindow().rightNavButtons = buttons.reverse();
			// }
		}
	} else {
		$.clear();
	}
};
