exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('button');

var title = Conversion.substituteAll(data.title, data.titleSubst);


var buttontype = data.buttontype;

// Properties
var titleProperties = {
	text : title ? title : 'no text',
	title : title ? title : 'no text'
};

var fieldProperties = {};

if (data.destructive) {
	if (OS_ANDROID) {
		titleProperties.color = $.titleLabel.egTintColorDestructive;
	}
	if (OS_IOS) {
		titleProperties.tintColor = $.titleLabel.egTintColorDestructive;
	}
}

if (data.disabled === true || data.enabled === false) {
	fieldProperties.touchEnabled = false;
	if (OS_IOS) {
		fieldProperties.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
		titleProperties.enabled = false;
	}
	if (OS_ANDROID) {
		fieldProperties.backgroundSelectedColor = $.fieldTableViewRow.backgroundColor || 'transparent';
		titleProperties.enabled = false;
		titleProperties.color = $.titleLabel.egColorReadOnly;
	}
} else {
	// Enabled
	fieldProperties.touchEnabled = true;
	if (data.onClick) {
		$.onClick = data.onClick;
	}
}
$.titleLabel.applyProperties(titleProperties);
$.fieldTableViewRow.applyProperties(fieldProperties);

exports.addEventListener = function(name, func) {
	$.fieldTableViewRow.addEventListener(name, func);
};

exports.getField = function() {
	return $.titleLabel;
};
exports.getButtonType = function() {
	return buttontype;
};

exports.setValue = function(value) {
	if (value) {
		$.titleLabel.text = value.toString();
	}
};
