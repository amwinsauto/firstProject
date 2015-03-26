exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};

var form = args.form;
var data = args.data;

$.setType('rating');

var selected = $.field.egSelectedImage;
var unselected = $.field.egUnSelectedImage;

var onChangeFunction = null;

// Properties
var viewProperties = {};

// Internal fields
var value = 0;
var readOnly = false;

if (OS_ANDROID) {
	viewProperties.backgroundSelectedColor = $.fieldTableViewRow.backgroundColor || 'transparent';
}
if (data.readonly || data._readonly) {
	readOnly = true;
	if ($.fieldTableViewRow.egBackgroundColorReadOnly) {
		viewProperties.backgroundColor = $.fieldTableViewRow.egBackgroundColorReadOnly;
	}
}
if (data.title) {
	$.title.text = Conversion.substituteAll(data.title, data.titleSubst);
}

setValue(data.value);

$.fieldTableViewRow.applyProperties(viewProperties);

exports.addEventListener = function(name, func) {
	if (name === 'change') {
		onChangeFunction = func;
	} else {
		$.field.addEventListener(name, func);
	}
};

exports.change = function() {
	if (onChangeFunction) {
		onChangeFunction({
			source : $.field
		});
	}
};

exports.getField = function() {
	return $.field;
};

exports.getValue = function() {
	return value;
};

exports.setValue = function(newvalue) {
	setValue(newvalue);
};

function onStarClick(e) {
	//Ti.API.info("Info: " + JSON.stringify(e));
	if (!e.source || !e.source.id) {
		return;
	}
	
	if (readOnly) {
		return;
	}

	switch(e.source.id) {
	case 'star1':
		setValue(1);
		$.change();
		break;
	case 'star2':
		setValue(2);
		$.change();
		break;
	case 'star3':
		setValue(3);
		$.change();
		break;
	case 'star4':
		setValue(4);
		$.change();
		break;
	case 'star5':
		setValue(5);
		$.change();
		break;
	default:
	}
}

function setValue(newvalue) {
	if (newvalue != undefined) {
		value = parseInt(newvalue, 10);
		if (isNaN(value) || value < 0 || value > 5) {
			value = 0;
		}
	} else {
		value = 0;
	}
	switch(value) {
	case 0:
		$.starImage1.backgroundImage = unselected;
		$.starImage2.backgroundImage = unselected;
		$.starImage3.backgroundImage = unselected;
		$.starImage4.backgroundImage = unselected;
		$.starImage5.backgroundImage = unselected;
		break;
	case 1:
		$.starImage1.backgroundImage = selected;
		$.starImage2.backgroundImage = unselected;
		$.starImage3.backgroundImage = unselected;
		$.starImage4.backgroundImage = unselected;
		$.starImage5.backgroundImage = unselected;
		break;
	case 2:
		$.starImage1.backgroundImage = selected;
		$.starImage2.backgroundImage = selected;
		$.starImage3.backgroundImage = unselected;
		$.starImage4.backgroundImage = unselected;
		$.starImage5.backgroundImage = unselected;
		break;
	case 3:
		$.starImage1.backgroundImage = selected;
		$.starImage2.backgroundImage = selected;
		$.starImage3.backgroundImage = selected;
		$.starImage4.backgroundImage = unselected;
		$.starImage5.backgroundImage = unselected;
		break;
	case 4:
		$.starImage1.backgroundImage = selected;
		$.starImage2.backgroundImage = selected;
		$.starImage3.backgroundImage = selected;
		$.starImage4.backgroundImage = selected;
		$.starImage5.backgroundImage = unselected;
		break;
	case 5:
		$.starImage1.backgroundImage = selected;
		$.starImage2.backgroundImage = selected;
		$.starImage3.backgroundImage = selected;
		$.starImage4.backgroundImage = selected;
		$.starImage5.backgroundImage = selected;
		break;
	default:
	}

}
