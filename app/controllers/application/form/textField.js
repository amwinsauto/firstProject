exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;
var keyboardToolbar = args.keyboardToolbar;

$.setType('string');

// External fields
var scanable = false;
//$.scanable = null;
if (data.scanable === true) {
	//	$.scanable = true;
	scanable = true;
}

// Properties
var leaderProperties = {};
var fieldProperties = {};

// Internal fields
var value = '';
var title = null;
var length = null;
var readOnly = false;
var hint = null;
var lowerCase = false;
var upperCase = false;
var align = Ti.UI.TEXT_ALIGNMENT_LEFT;
var focusable = false;
var large = false;
var keyboardType = Ti.UI.KEYBOARD_DEFAULT;

if (data.readonly || data._readonly) {
	readOnly = true;
}
if (data.length) {
	length = parseInt(data.length);
	if (isNaN(length)) {
		length = null;
	}
}
if (data.hint) {
	hint = Conversion.substituteAll(data.hint, data.hintSubst);
}

if (data.title) {
	title = Conversion.substituteAll(data.title, data.titleSubst);
}
if (title) {
	leaderProperties.text = title;
} else {
	leaderProperties.visible = false;
	// No Leader lets make the value full width
	// if (readOnly) {
		// fieldProperties.left = $.fieldLabel.right;
	// } else {
		// fieldProperties.left = $.fieldTextField.right;
	// }
	fieldProperties.left = $.leaderLabel.left;
}

if (data.textcase == 'upper') {
	upperCase = true;
} else if (data.textcase == 'lower') {
	lowerCase = true;
}
if (data.align === 'right') {
	align = Ti.UI.TEXT_ALIGNMENT_RIGHT;
} else if (data.align === 'center') {
	align = Ti.UI.TEXT_ALIGNMENT_CENTER;
}

if (data.size === 'large') {
	large = true;
}

// data.trailer = 'stk';
if (data.trailer) {
	var trailerProperties = {
		visible : true,
		text : Conversion.substituteAll(data.trailer, data.trailerSubst)
	};

	if (large) {
		$.trailerLabel.height = parseInt($.trailerLabel.height, 10) * 2;
		$.trailerLabel.width = parseInt($.trailerLabel.width, 10) * 1.5;
		$.trailerLabel.font = {
			fontSize : 28
		};
	}

	if (readOnly) {
		fieldProperties.right = parseInt($.trailerLabel.width) + (parseInt($.fieldLabel.right) / 3);
		if ($.trailerLabel.egColorReadOnly) {
			trailerProperties.color = $.trailerLabel.egColorReadOnly;
		}
	} else {
		fieldProperties.right = parseInt($.trailerLabel.width) + (parseInt($.fieldTextField.right) / 3);

	}
	var trailercolor = $.getColor($.fieldTableViewRow, data.trailercolor);
	if (trailercolor) {
		trailerProperties.color = trailercolor;
	}

	$.trailerLabel.applyProperties(trailerProperties);
}

if (data.keyboardtype) {
	if (data.keyboardtype == 'email') {
		keyboardType = Ti.UI.KEYBOARD_EMAIL;
	} else if (data.keyboardtype == 'url') {
		keyboardType = Ti.UI.KEYBOARD_URL;
	} else if (data.keyboardtype == 'phone') {
		keyboardType = Ti.UI.KEYBOARD_PHONE_PAD;
	}
}

setValue(data.value);

if (readOnly) {
	$.fieldTextField.visible = false;

	fieldProperties.text = value;
	fieldProperties.value = value;
	fieldProperties.textAlign = align;

	if (large) {
		fieldProperties.height = 44;
		// parseInt($.fieldLabel.height, 10) * 2;
		fieldProperties.font = {
			fontSize : 28
		};
	}

	//	if (!data.onClick) {
	if ($.fieldTableViewRow.egBackgroundColorReadOnly) {
		$.fieldTableViewRow.backgroundColor = $.fieldTableViewRow.egBackgroundColorReadOnly;
	}
	if ($.leaderLabel.egColorReadOnly) {
		leaderProperties.color = $.leaderLabel.egColorReadOnly;
	}
	if ($.fieldLabel.egColorReadOnly) {
		fieldProperties.color = $.fieldLabel.egColorReadOnly;
	}
	//	}
	var color = $.getColor($.fieldTableViewRow, data.color);
	if (color) {
		fieldProperties.color = color;
	}

	$.fieldLabel.applyProperties(fieldProperties);
} else {
	focusable = true;
	$.fieldLabel.visible = false;

	fieldProperties.value = value;
	fieldProperties.textAlign = align;
	fieldProperties.hintText = hint;
	fieldProperties.keyboardType = keyboardType;

	if (large) {
		fieldProperties.height = 44;//parseInt($.fieldTextField.height, 10) * 2;
		fieldProperties.font = {
			fontSize : 28
		};
	}


	var color = $.getColor($.fieldTableViewRow, data.color);
	if (color) {
		fieldProperties.color = color;
	}

	if (OS_IOS && keyboardToolbar) {
		fieldProperties.keyboardToolbar = keyboardToolbar.keyboardToolbar;
	}

	$.fieldTextField.addEventListener('focus', function(e) {
		form.setFocusField($);
		if (OS_IOS && keyboardToolbar) {
			keyboardToolbar.setFocusField($);
		}

	});

	if (OS_IOS && length) {
		fieldProperties.maxLength = length;
	}

	if (upperCase || lowerCase) {
		if (OS_IOS) {
			$.fieldTextField.addEventListener('change', function(e) {
				if (upperCase) {
					e.source.value = e.value.toUpperCase();
				} else {
					e.source.value = e.value.toLowerCase();
				}
			});
		}
	}
	$.fieldTextField.applyProperties(fieldProperties);

}

var titlecolor = $.getColor($.fieldTableViewRow, data.titlecolor);
if (titlecolor) {
	leaderProperties.color = titlecolor;
}

$.leaderLabel.applyProperties(leaderProperties);

$.setOnClick(data);

function onFieldReturn(e) {
	if ($.onReturn) {
		// onReturn handled by eventhandler added in for.js
	} else {
		if ($.nextIndex != undefined) {
			form.setFocusByIndex($.nextIndex);
		}
	}
}

exports.isFocusAble = function() {
	return focusable;
};
exports.isScanable = function() {
	return scanable;
};
exports.blur = function() {
	if (!readOnly) {
		$.fieldTextField.blur();
	}
};

exports.focus = function() {
	if (!readOnly) {
		if (OS_ANDROID) {
			$.fieldTextField.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
		}
		$.fieldTextField.focus();
	}
};

exports.addEventListener = function(name, func) {
	if (readOnly) {
		$.fieldLabel.addEventListener(name, func);
	} else {
		$.fieldTextField.addEventListener(name, func);
	}
};

exports.fireEvent = function(name) {
	if (readOnly) {
		$.fieldLabel.fireEvent(name);
	} else {
		$.fieldTextField.fireEvent(name);
	}
};

exports.getField = function() {
	if (readOnly) {
		return $.fieldLabel;
	} else {
		return $.fieldTextField;
	}
};

exports.getValue = function() {
	if (readOnly) {
		return $.fieldLabel.text;
	} else {
		if ($.fieldTextField.value) {
			if (lowerCase) {
				return $.fieldTextField.value.toLowerCase();
			} else if (upperCase) {
				return $.fieldTextField.value.toUpperCase();
			} else {
				return $.fieldTextField.value;
			}

		}
		return $.fieldTextField.value;
	}
};

exports.clear = function() {
	$.setValue('');
};

exports.setValue = function(newvalue) {
	setValue(newvalue);

	$.fieldLabel.text = value;
	$.fieldTextField.value = value;
};

function setValue(newvalue) {
	if (newvalue) {
		if (lowerCase) {
			value = newvalue.toLowerCase();
		} else if (upperCase) {
			value = newvalue.toUpperCase();
		} else {
			value = newvalue;
		}
	} else {
		value = '';
	}
}

