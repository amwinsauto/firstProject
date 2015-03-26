exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};

var form = args.form;
var data = args.data;

$.setType('slider');

// Properties
var viewProperties = {};
var leaderProperties = {};
var fieldProperties = {};
var sliderProperties = {};

// Internal fields
var value = 0;
var minValue = 0;
var maxValue = 10;
var decimals = 0;
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
	if ($.valueLabel.egColorReadOnly) {
		$.valueLabel.color = $.valueLabel.egColorReadOnly;
	}

} else {
	if ($.valueLabel.egColorReadOnly) {
		$.valueLabel.color = $.valueLabel.egColorReadOnly;
	}
}
if (data.title) {
	leaderProperties.visible = true;
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
} else {
	leaderProperties.visible = false;
	sliderProperties.left = $.fieldSlider.right;
}

if (data.minvalue) {
	minValue = parseFloat(data.minvalue);
	if (isNaN(minValue)) {
		minValue = 0;
	}
}
if (data.maxvalue) {
	maxValue = parseFloat(data.maxvalue);
	if (isNaN(maxValue)) {
		maxValue = 10;
	}
}

if (data.decimals) {
	decimals = parseInt(data.decimals, 10);
	if (isNaN(decimals)) {
		decimals = 0;
	}
}
setValue(data.value);

sliderProperties.value = value;
sliderProperties.min = minValue;
sliderProperties.max = maxValue;
sliderProperties.enabled = !readOnly;

if (data.trailer) {
	var trailerProperties = {
		visible : true,
		text : Conversion.substituteAll(data.trailer, data.trailerSubst)
	};
	fieldProperties.right = parseInt($.trailerLabel.width) + (parseInt($.valueLabel.right) / 3);

	if (readOnly) {
		if ($.trailerLabel.egColorReadOnly) {
			trailerProperties.color = $.trailerLabel.egColorReadOnly;
		}
	}

	var trailercolor = $.getColor($.fieldTableViewRow, data.trailercolor);
	if (trailercolor) {
		trailerProperties.color = trailercolor;
	}

	$.trailerLabel.applyProperties(trailerProperties);
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
$.valueLabel.applyProperties(fieldProperties);
$.fieldSlider.applyProperties(sliderProperties);

function onFieldSliderChange(e) {
	setValue(e.value);
	// value = e.value;
	// $.valueLabel.text = Conversion.toDisplayNumber(value, decimals, true, true);
}

exports.addEventListener = function(name, func) {
	$.fieldSlider.addEventListener(name, func);
};

exports.getField = function() {
	return $.fieldSlider;
};
// exports.getLabel = function() {
// return $.leaderLabel;
// }
// exports.getRow = function() {
// return $.fieldTableViewRow;
// }

exports.getValue = function() {
	return $.fieldSlider.value;
};

exports.setValue = function(newvalue) {
	setValue(newvalue);
	$.fieldSlider.value = value;
};

function setValue(newvalue) {
	if (newvalue != undefined) {
		value = parseFloat(newvalue);
		if (isNaN(value)) {
			value = 0;
		}
	} else {
		value = 0;
	}
	$.valueLabel.text = Conversion.toDisplayNumber(value, decimals, true, true);
}
