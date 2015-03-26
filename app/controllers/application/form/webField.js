exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');
var Images = require('Images');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('web');

// Properties
var leaderProperties = {};
var fieldProperties = {};

var value = '';

if (data.title) {
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
} else {
	// Hide leader
	leaderProperties.visible = false;
	// Lets make the value full width
	$.fieldWebView.left = $.fieldWebView.right;
}

if (data.size === 'large') {
	fieldProperties.height = $.fieldWebView.egHeightLarge;
} else if (data.size === 'medium') {
	fieldProperties.height = $.fieldWebView.egHeightMedium;
} else if (data.size === 'small') {
	fieldProperties.height = $.fieldWebView.egHeightSmall;
} else if (data.size === 'max') {
	//	if (OS_IOS) {
	fieldProperties.height = Ti.UI.SIZE;
	//	} else {
	// Android fucks up height if Ti.UI.SIZE!!
	//$.fieldImageView.height = Ti.UI.SIZE;
	//		$.fieldImageView.width = Ti.Platform.displayCaps.platformWidth;
	//	}
} else if (data.size) {
	try {
		fieldProperties.height = parseInt(data.size, 10);
	} catch(err) {
		fieldProperties.height = $.fieldWebView.egHeightMedium;
	}
} else {
	fieldProperties.height = $.fieldWebView.egHeightMedium;
}
if (OS_ANDROID) {
	//$.fieldTableViewRow.height = fieldProperties.height;
	//$.fieldView.height = fieldProperties.height;
}

$.leaderLabel.applyProperties(leaderProperties);
$.fieldTableViewRow.applyProperties(fieldProperties);

exports.setValue = function(newvalue) {
	setValue(newvalue);
	$.fieldWebView.url = 'http://www.imf.org/external/np/fsap/updateProgress.gif';
	//$.fieldWebView.url = value;
	//Images.getUrlImage(value, null, null, $.fieldWebView, 'url');
};

exports.setValue(data.value);

$.setOnClick(data);

exports.blur = function() {
};

exports.focus = function() {
};

exports.addEventListener = function(name, func) {
	$.fieldWebView.addEventListener(name, func);
};

exports.getField = function() {
	return $.fieldWebView;
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
