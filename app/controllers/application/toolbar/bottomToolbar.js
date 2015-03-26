var args = arguments[0] || {};
var application = args.application;
var controller = args.controller;
var window = args.window;

$.window = window;

$.height = 0;

if (OS_ANDROID) {
	$.height = parseInt($.bottomToolbar.height);
} else {
	if (Alloy.Globals.isHighDensity) {
		$.bottomToolbar.bottom = -0.5;
		$.bottomToolbar.left = -0.5;
		$.bottomToolbar.right = -0.5;
		$.height = 43.5;
	} else {
		$.height = 44;
	}
}

$.buttons = [];
$.visible = false;
var height = 0;

exports.init = function(data) {
};

exports.getHeight = function() {
	return height;
};

exports.show = function() {
	if ($.visible) {
		return height;
	}
	height = $.height;
	//	if (OS_ANDROID) {
	window.getWindow().add($.bottomToolbar);
	//	}
	$.visible = true;
	return height;
};

exports.hide = function() {
	//	if (OS_ANDROID) {
	if ($.visible) {
		window.getWindow().remove($.bottomToolbar);
	}
	//	}
	//	if (OS_IOS) {
	//		$.clear();
	//	}
	height = 0;
	$.visible = false;
	return height;
};

exports.clear = function() {
	if ($.buttons.length == 0) {
		return height;
	}
	if (OS_ANDROID) {
		for (var i = 0; i < $.buttons.length; i++) {
			$.bottomToolbar.remove($.buttons[i]);
		}
	} else {
		if ($.bottomToolbar) {
			$.bottomToolbar.items = [];
		}
		// window.getWindow().setToolbar([], {
		// animated : false
		// });
	}
	$.buttons = [];
	return height;
};

exports.setButtons = function(buttons) {
	if (buttons && buttons.length > 0) {
		$.buttons = buttons;
		if (OS_ANDROID) {
			$.clear();
			for (var i = 0; i < buttons.length; i++) {
				buttons[i].left = parseInt(buttons[i].top);
				$.bottomToolbar.add(buttons[i]);
			}
		} else {
			$.bottomToolbar.items = buttons;
			// window.getWindow().setToolbar(buttons, {
			// animated : false
			// });
		}
	} else {
		$.clear();
	}
	return $.show();
};
