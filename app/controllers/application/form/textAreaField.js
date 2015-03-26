exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;
var keyboardToolbar = args.keyboardToolbar;

$.setType('textarea');

// Properties
var leaderProperties = {};
var fieldProperties = {};
var viewProperties = {};

// Internal fields
var value = '';
var title = null;
var length = null;
var defaultLines = 3;
var lines = defaultLines;
var readOnly = false;
var hint = null;
var color = null;
var focusable = false;

if (data.readonly || data._readonly) {
	readOnly = true;
}
if (data.length) {
	length = parseInt(data.length);
	if (isNaN(length)) {
		length = null;
	}
}
if (data.lines) {
	lines = parseInt(data.lines);
	if (isNaN(lines)) {
		lines = defaultLines;
	}
} else if (data.height) {
	lines = parseInt(data.height);
	if (isNaN(lines)) {
		lines = defaultLines;
	}
}

if (data.title) {
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
} else {
	// Hide leader
	leaderProperties.visible = false;
	// Lets make the value full width
	//fieldProperties.left = $.fieldTextArea.right;
	fieldProperties.left = $.leaderLabel.left;
}

setValue(data.value);

if (data.jsonlogvalue) {
	// if (form.getConnection().getJsonLog()) {
		// setValue(JSON.stringify(form.getConnection().getJsonLog(), null, 2));
	// }
	if (Alloy.Globals.jsonLog) {
		setValue(JSON.stringify(Alloy.Globals.jsonLog, null, 2));
	}
}

fieldProperties.value = value;
fieldProperties.enabled = !readOnly;

function setHeight(e) {
	if (e.source && e.source.rect && e.source.rect.height > 0) {
		$.fieldTextArea.removeEventListener('postlayout', setHeight);
		$.fieldTextArea.height = parseFloat(e.source.rect.height) + 1;
		//Ti.API.info("Setheight: " + $.fieldTextArea.height);
	}
}

if (lines > 10 || lines === -1) {
	fieldProperties.height = Ti.UI.SIZE;
	if (OS_IOS) {
		fieldProperties.scrollable = false;
		// TODO Titanium bug when scrollable= false last line of text is not visible
		$.fieldTextArea.addEventListener('postlayout', setHeight);

	}
} else {
	var height = parseInt($.fieldTextArea.height) * lines;
	height = height + 20;
	fieldProperties.height = height;
}

// Test data.trailer = 'stk';
if (data.trailer) {
	var trailerProperties = {
		visible : true,
		text : Conversion.substituteAll(data.trailer, data.trailerSubst)
	};

	fieldProperties.right = parseInt($.trailerLabel.width) + (parseInt($.fieldTextArea.right) / 3);

	var trailercolor = $.getColor($.fieldTableViewRow, data.trailercolor);
	if (trailercolor) {
		trailerProperties.color = trailercolor;
	}

	$.trailerLabel.applyProperties(trailerProperties);
}

if (readOnly) {
	fieldProperties.editable = false;
	fieldProperties.bubbleParent = true;
	//fieldProperties.enabled = false;
	if (data.onClick) {
		// Make sure click events gets bubled to parent
		fieldProperties.touchEnabled = false;
	}//else {
	if ($.fieldTableViewRow.egBackgroundColorReadOnly) {
		viewProperties.backgroundColor = $.fieldTableViewRow.egBackgroundColorReadOnly;
	}
	if ($.leaderLabel.egColorReadOnly) {
		leaderProperties.color = $.leaderLabel.egColorReadOnly;
	}
	if ($.fieldTextArea.egColorReadOnly) {
		fieldProperties.color = $.fieldTextArea.egColorReadOnly;
	}
	//}
} else {
	focusable = true;
	if (OS_IOS && length) {
		fieldProperties.maxLength = parseInt(length);
	}
	if (OS_IOS && keyboardToolbar) {
		fieldProperties.keyboardToolbar = keyboardToolbar.keyboardToolbar;
		$.fieldTextArea.addEventListener('focus', function(e) {
			keyboardToolbar.setFocusField($);
		});
	}

}

if (data.hint) {
	fieldProperties.hintText = data.hint.toString();
}

var titlecolor = $.getColor($.fieldTableViewRow, data.titlecolor);
if (titlecolor) {
	leaderProperties.color = titlecolor;
}
var color = $.getColor($.fieldTableViewRow, data.color);
if (color) {
	fieldProperties.color = color;
}

$.fieldTableViewRow.applyProperties(viewProperties);
$.leaderLabel.applyProperties(leaderProperties);
$.fieldTextArea.applyProperties(fieldProperties);

$.setOnClick(data);

exports.isFocusAble = function() {
	return focusable;
};

exports.blur = function() {
	if ($.fieldTextArea.blur) {
		$.fieldTextArea.blur();
	}
};

exports.focus = function() {
	if (!readOnly) {
		if (OS_ANDROID) {
			$.fieldTextArea.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
		}
		$.fieldTextArea.focus();
	}
};

exports.addEventListener = function(name, func) {
	$.fieldTextArea.addEventListener(name, func);
};

exports.getField = function() {
	return $.fieldTextArea;
};

exports.getValue = function() {
	return $.fieldTextArea.value;
};
exports.clear = function() {
	$.setValue('');
};

exports.setValue = function(newvalue) {
	setValue(newvalue);
	$.fieldTextArea.value = value;
};

function setValue(newvalue) {
	if (newvalue) {
		value = newvalue;
	} else {
		value = '';
	}
}
