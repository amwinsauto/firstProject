exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');
var args = arguments[0] || {};

var form = args.form;
var data = args.data;
var keyboardToolbar = args.keyboardToolbar;

$.setType('number');
if (data.type) {
	$.setType(data.type);
}

// Properties
var leaderProperties = {};
var fieldProperties = {};

// Internal fields
var value = null;
var stringValue = '';
var oldStringValue = '';
var isNullAble = false;
var length = null;
var decimals = 0;
var align = Ti.UI.TEXT_ALIGNMENT_RIGHT;
var maxLength = null;
var keyboardType = Ti.UI.KEYBOARD_NUMBER_PAD;
var showThousandSeparator = false;
var showZero = false;
var allowNegative = false;
var readOnly = false;
var focusable = false;
var large = false;
var ts = Conversion.getThousandSeparator();
var ds = Conversion.getDecimalSeparator();

if (data.readonly || data._readonly) {
	readOnly = true;
}

if (data.nullable) {
	isNullAble = true;
}
if (data.length) {
	length = parseInt(data.length);
	if (isNaN(length)) {
		length = null;
	}
	maxLength = length;
}
if (data.allowneg) {
	allowNegative = true;
	if (maxLength) {
		maxLength = maxLength + 1;
	}
}

// Decimals
if (data.decimals) {
	decimals = parseInt(data.decimals, 10);
	if (isNaN(decimals)) {
		decimals = 0;
	}
}
if (decimals > 0 && !allowNegative) {
	if (maxLength) {
		maxLength = maxLength + 1;
	}
	if (Alloy.isHandheld) {
		keyboardType = Ti.UI.KEYBOARD_DECIMAL_PAD;
	}
	//	}
} else if (allowNegative && !Alloy.isTablet) {
	keyboardType = Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION;
}

if (OS_ANDROID) {
	keyboardType = Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION;
}

if (decimals > 0) {
	// Default decimal numbers with thousand separator
	showThousandSeparator = true;
}

if (data.showthousandseparator) {
	showThousandSeparator = true;
}

if (data.showthousandseparator === false) {
	showThousandSeparator = false;
}

if (data.showzero) {
	showZero = true;
}

if (data.align === 'right') {
	align = Ti.UI.TEXT_ALIGNMENT_RIGHT;
} else if (data.align === 'center') {
	align = Ti.UI.TEXT_ALIGNMENT_CENTER;
}

if (data.size === 'large') {
	large = true;
}

if (data.title) {
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
} else {
	// Hide leader
	leaderProperties.visible = false;
	// Lets make the value full width
	// if (readOnly) {
		// fieldProperties.left = $.fieldLabel.right;
	// } else {
		// fieldProperties.left = $.fieldTextField.right;
	// }
	fieldProperties.left = $.leaderLabel.left;
}

if (data.hint) {
	fieldProperties.hintText = Conversion.substituteAll(data.hint, data.hintSubst);
}
var color = $.getColor($.fieldTableViewRow, data.color);
if (color) {
	fieldProperties.color = color;
}

//data.trailer = 'stk';
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

setValue(data.value);

if (readOnly) {
	$.fieldTextField.visible = false;

	fieldProperties.text = stringValue;
	fieldProperties.value = stringValue;
	fieldProperties.numberValue = value;

	$.fieldLabel.value = stringValue;
	$.fieldLabel.numberValue = value;
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
	if (!fieldProperties.color && $.fieldLabel.egColorReadOnly) {
		fieldProperties.color = $.fieldLabel.egColorReadOnly;
	}
	//	}

	$.fieldLabel.applyProperties(fieldProperties);
} else {
	focusable = true;
	$.fieldLabel.visible = false;

	fieldProperties.value = stringValue;
	fieldProperties.numberValue = value;
	fieldProperties.textAlign = align;

	if (large) {
		fieldProperties.height = 44;
		//parseInt($.fieldTextField.height, 10) * 2;
		fieldProperties.font = {
			fontSize : 28
		};
	}

	$.fieldTextField.value = stringValue;
	$.fieldTextField.numberValue = value;

	fieldProperties.keyboardType = keyboardType;

	if (OS_IOS && keyboardToolbar) {
		fieldProperties.keyboardToolbar = keyboardToolbar.keyboardToolbar;
		$.fieldTextField.addEventListener('focus', function(e) {
			keyboardToolbar.setFocusField($);
		});
	}

	if (OS_IOS && maxLength) {
		//	fieldProperties.maxLength = Conversion.toNumber(maxLength);
	}
	$.fieldTextField.applyProperties(fieldProperties);
}

var titlecolor = $.getColor($.fieldTableViewRow, data.titlecolor);
if (titlecolor) {
	leaderProperties.color = titlecolor;
}

$.leaderLabel.applyProperties(leaderProperties);

$.setOnClick(data);

function onFieldChange(e) {
	if (OS_IOS) {
		if (!validateValue(e.value)) {
			$.fieldTextField.value = oldStringValue;
			return;
		}
	}
	if (e.value) {
		$.fieldTextField.numberValue = Conversion.parseDisplayNumber(e.value, null);
		value = Conversion.parseDisplayNumber(e.value, null);
		oldStringValue = e.value;
	} else if (e.source) {
		$.fieldTextField.numberValue = Conversion.parseDisplayNumber(e.source.value, null);
		value = Conversion.parseDisplayNumber(e.source.value, null);
		oldStringValue = e.source.value;
	}
}

function onFieldReturn(e) {
	if ($.onReturn) {
		// onReturn handled by eventhandler added in for.js
	} else {
		if ($.nextIndex != undefined) {
			form.setFocusByIndex($.nextIndex);
		}
	}
}

function onFieldBlur(e) {
	$.setValue(value);
}

exports.isFocusAble = function() {
	return focusable;
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
	var val = null;
	if (readOnly) {
		val = $.fieldLabel.numberValue;
	} else {
		val = $.fieldTextField.numberValue;
	}
	if (isNullAble) {
		return val;
	} else {
		if (!val) {
			return 0;
		}
		return val;
	}
};
exports.clear = function() {
	$.setValue(null);
};

exports.setValue = function(newvalue) {
	setValue(newvalue);
	$.fieldLabel.text = stringValue;
	$.fieldLabel.numberValue = value;
	$.fieldTextField.value = stringValue;
	$.fieldTextField.numberValue = value;
};

function setValue(newvalue) {

	if (newvalue != undefined) {
		value = parseFloat(newvalue);
		if (isNaN(value)) {
			value = null;
		}
	} else {
		// newvalue undefined
		value = null;
	}

	stringValue = Conversion.toDisplayNumber(value, decimals, showThousandSeparator, showZero);
	oldStringValue = stringValue;
	showZero = true;
}

function validateValue(value) {

	if (!value) {
		return true;
	}

	var val = Conversion.replaceAll(value, ts, '');
	if (!$.regExp) {
		var expression = '^';
		if (allowNegative) {
			expression += '(-){0,1}';
		}
		expression += '([0-9])';
		if (length) {
			expression += '{0,' + (length - decimals) + '}';
		} else {
			expression += '+';
		}
		if (decimals) {
			//expression += '(,([0-9]){0,' + decimals + '}){0,1}';
			expression += '(' + ds + '([0-9]){0,' + decimals + '}){0,1}';
		}
		if (allowNegative) {
			expression += '(-){0,1}';
		}
		expression += '$';
		$.regExp = expression;
	}
	var reg = new RegExp($.regExp);
	return reg.test(val);
}
