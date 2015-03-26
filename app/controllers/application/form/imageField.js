exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');
var Images = require('Images');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('image');

// Properties
var fieldViewProperties = {};
var leaderProperties = {};
var fieldProperties = {};

var value = '';

if (data.title) {
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
} else {
	// Hide leader
	leaderProperties.visible = false;
	// Lets make the value full width
	fieldProperties.left = $.fieldImageView.right;
}

var aliasType = null;
if (data.aliastype) {
	aliasType = data.aliastype;
}

if (data.size === 'large') {
	fieldProperties.height = $.fieldImageView.egHeightLarge;
} else if (data.size === 'medium') {
	fieldProperties.height = $.fieldImageView.egHeightMedium;
} else if (data.size === 'small') {
	fieldProperties.height = $.fieldImageView.egHeightSmall;
} else if (data.size === 'max') {
	if (OS_IOS) {
		fieldProperties.height = Ti.UI.SIZE;
	} else {
		// Android fucks up height if Ti.UI.SIZE!!
		//$.fieldImageView.height = Ti.UI.SIZE;
		//		$.fieldImageView.width = Ti.Platform.displayCaps.platformWidth;
	}
} else if (data.size) {
	try {
		fieldProperties.height = parseInt(data.size, 10);
	} catch(err) {
		fieldProperties.height = $.fieldImageView.egHeightMedium;
	}
} else {
	fieldProperties.height = $.fieldImageView.egHeightMedium;
}

if (data.clipvertical) {
	fieldViewProperties.width = 4096;
}

if (OS_ANDROID) {
	$.fieldTableViewRow.height = fieldProperties.height;
	fieldViewProperties.height = fieldProperties.height;
}

$.fieldView.applyProperties(fieldViewProperties);
$.leaderLabel.applyProperties(leaderProperties);
$.fieldImageView.applyProperties(fieldProperties);

exports.setValue = function(newvalue) {
	setValue(newvalue);
	Images.getUrlImage(value, aliasType, null, $.fieldImageView, 'image');
};

exports.setValue(data.value);

$.setOnClick(data);

exports.blur = function() {
};

exports.focus = function() {
};

exports.addEventListener = function(name, func) {
	$.fieldImageView.addEventListener(name, func);
};

exports.getField = function() {
	return $.fieldImageView;
};

exports.getValue = function() {
	return value;
};

function setValue(newvalue) {
	if (newvalue) {
		value = newvalue;
	} else {
		value = '';
	}
}
