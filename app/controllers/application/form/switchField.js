exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('checkbox');

// Properties
var viewProperties = {};
var leaderProperties = {};
var fieldProperties = {};

// Internal fields
var value = false;
var title = null;
var readOnly = false;

if (OS_ANDROID) {
	viewProperties.backgroundSelectedColor = $.fieldTableViewRow.backgroundColor || 'transparent';
}

if (data.readonly || data._readonly) {
	readOnly = true;
	if ($.fieldTableViewRow.egBackgroundColorReadOnly) {
		viewProperties.backgroundColor = $.fieldTableViewRow.egBackgroundColorReadOnly;
	}
	if ($.leaderLabel.egColorReadOnly) {
		leaderProperties.color = $.leaderLabel.egColorReadOnly;
	}
}
if (data.title) {
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
}

setValue(data.value);

fieldProperties.enabled = !readOnly;
fieldProperties.value = value;


var titlecolor = $.getColor($.fieldTableViewRow, data.titlecolor);
if (titlecolor) {
	leaderProperties.color = titlecolor;
}

$.fieldTableViewRow.applyProperties(viewProperties);
$.leaderLabel.applyProperties(leaderProperties);
$.fieldSwitch.applyProperties(fieldProperties);

function onFieldSwitchChange(e) {
	value = e.value;
}

exports.addEventListener = function(name, func) {
	$.fieldSwitch.addEventListener(name, func);
};

exports.getField = function() {
	return $.fieldSwitch;
};

exports.getValue = function() {
	return $.fieldSwitch.value;
};

exports.setValue = function(newvalue) {
	setValue(newvalue);
	$.fieldSwitch.value = value;
};

function setValue(newvalue) {
	if (newvalue != undefined) {
		value = (newvalue === true);
	} else {
		value = false;
	}
}
