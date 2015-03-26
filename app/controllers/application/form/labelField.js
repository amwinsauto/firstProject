exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};

var form = args.form;
var data = args.data;

$.setType('label');

// Properties
var leaderProperties = {};
var fieldProperties = {};

// Internal fields
var value = '';

fieldProperties.textAlign = Ti.UI.TEXT_ALIGNMENT_LEFT;

if (data.title) {
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
} else {
	// Hide leader
	leaderProperties.visible = false;
	// Lets make the value full width
	fieldProperties.left = $.fieldLabel.right;
}

if (data.align === 'right') {
	fieldProperties.textAlign = Ti.UI.TEXT_ALIGNMENT_RIGHT;
} else if (data.align === 'center') {
	fieldProperties.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
}

setValue(Conversion.substituteAll(data.value, data.valueSubst));

fieldProperties.value = value;
$.fieldLabel.text = value;

if (data.link) {
	fieldProperties.color = $.fieldLabel.egColorLink;
	$.setLabelTitle($.fieldLabel, value, data.link);
} else {
	$.setLabelTitle($.fieldLabel, value);
}
var color = $.getColor($.fieldTableViewRow, data.color);
if (color) {
	fieldProperties.color = color;
}
var titlecolor = $.getColor($.fieldTableViewRow, data.titlecolor);
if (titlecolor) {
	leaderProperties.color = titlecolor;
}

$.leaderLabel.applyProperties(leaderProperties);
$.fieldLabel.applyProperties(fieldProperties);

$.setOnClick(data);

exports.isFocusAble = function() {
	return false;
};

exports.focus = function() {
};

exports.addEventListener = function(name, func) {
	$.fieldLabel.addEventListener(name, func);
};

exports.getField = function() {
	return $.fieldLabel;
};

exports.getValue = function() {
	return $.fieldLabel.text;
};

exports.setValue = function(newvalue) {
	setValue(newvalue);
	$.fieldLabel.text = value;
};

function setValue(newvalue) {
	if (newvalue) {
		value = newvalue;
	} else {
		value = '';
	}
}

