exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');
var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('template');
if (data.type) {
	$.setType(data.type);
}

// Properties
var viewProperties = {};
var leaderProperties = {};
var fieldProperties = {};

if (!data.onClick) {
	if ($.fieldTableViewRow.egBackgroundColorReadOnly) {
		viewProperties.backgroundColor = $.fieldTableViewRow.egBackgroundColorReadOnly;
	}
}

// Internal fields
var padding = Conversion.toNumber($.fieldView.left);

var leftImage = null;

build(data);

exports.update = function(data) {
	clear();
	build(data);
};

function clear() {
	$.fieldView.removeAllChildren();
	if (leftImage) {
		$.fieldTableViewRow.remove(leftImage);
	}
}

function build(data) {
	if (data.leftimage) {
		leftImage = Alloy.createController('application/form/fieldImage', {
			form : form,
			field : $,
			image : data.leftimage,
			type : 'field',
			size : data.leftimagesize
		}).getView();
	}

	var top = 0;
	var postFix = '';
	for (var i = 0; i < 5; i++) {
		postFix = (i > 0) ? Conversion.toString(i) : '';
		top += createListItemViewForStandard(top, $.fieldView, data, 'title', postFix);
	}
	for (var i = 0; i < 5; i++) {
		postFix = (i > 0) ? Conversion.toString(i) : '';
		top += createListItemViewForStandard(top, $.fieldView, data, 'titlebold', postFix);
	}
	for (var i = 0; i < 5; i++) {
		postFix = (i > 0) ? Conversion.toString(i) : '';
		top += createListItemViewForStandard(top, $.fieldView, data, 'titleplain', postFix);
	}
	for (var i = 0; i < 5; i++) {
		postFix = (i > 0) ? Conversion.toString(i) : '';
		top += createListItemViewForStandard(top, $.fieldView, data, 'titlegray', postFix);
	}
	for (var i = 0; i < 5; i++) {
		postFix = (i > 0) ? Conversion.toString(i) : '';
		top += createListItemViewForStandard(top, $.fieldView, data, 'titlegraylarge', postFix);
	}
	for (var i = 0; i < 5; i++) {
		postFix = (i > 0) ? Conversion.toString(i) : '';
		top += createListItemViewForStandard(top, $.fieldView, data, 'titlesmall', postFix);
	}

	if (!$.fieldView.children) {
		fieldProperties.height = 30;
		viewProperties.height = 30 + padding;
	} else {
		fieldProperties.height = top;
		viewProperties.height = top + padding;
	}

	if (leftImage) {
		var imageProperties = {};
		fieldProperties.left = parseInt(leftImage.width) + (parseInt(leftImage.left) * 2);

		if (leftImage.height > top) {
			imageProperties.top = parseInt(padding / 2);
			imageProperties.bottom = parseInt(padding / 2);

			viewProperties.height = parseInt(leftImage.height) + parseInt(imageProperties.top) + parseInt(imageProperties.bottom);
		} else {
			fieldProperties.top = parseInt(padding / 2);
			fieldProperties.bottom = parseInt(padding / 2);
			// Place image on top -> set top padding
			imageProperties.top = parseInt(padding / 2);
			viewProperties.height = fieldProperties.height + fieldProperties.top + fieldProperties.bottom;
		}
		leftImage.applyProperties(imageProperties);
		$.fieldTableViewRow.add(leftImage);
	}

	//
	viewProperties.height = viewProperties.height + (11 - (viewProperties.height % 11));

	$.fieldTableViewRow.applyProperties(viewProperties);
	$.fieldView.applyProperties(fieldProperties);

	$.setOnClick(data);

}

function createListItemViewForStandard(top, view, data, titleId, postFix) {

	var title = data[titleId + postFix];
	var titleright = data[titleId + 'right' + postFix];
	if (title == undefined && titleright == undefined) {
		return 0;
	}
	var labelType = 'Title';
	var rightLabelType = 'TitleRight';
	switch(titleId) {
	case 'title':
		// labelType = 'Title';
		labelType = 'Headline';
		break;
	case 'titlebold':
		// labelType = 'TitleBold';
		labelType = 'Headline';
		break;
	case 'titleplain':
		// labelType = 'TitlePlain';
		labelType = 'Subheadline';
		break;
	case 'titlegray':
		// labelType = 'TitleGray';
		labelType = 'Subheadline_2';
		break;
	case 'titlesmall':
		labelType = 'Caption2';
		break;
	}

	var height = 0;
	var labelRight = null;
	if (titleright) {
		labelRight = $.createLabel(rightLabelType, titleright, data[titleId + 'rightlink' + postFix], data[titleId + 'right' + postFix + 'Subst']);
	}
	if (labelRight) {
		var rightProperties = {
			top : top
		};
		height = parseInt(labelRight.height);

		var color = $.getColor($.fieldTableViewRow, data[titleId + 'rightcolor' + postFix]);
		if (color) {
			rightProperties.color = color;
		}
		// var color = data[titleId + 'rightcolor' + postFix];
		// if (color) {
		// rightProperties.color = color.toString();
		// }
		labelRight.applyProperties(rightProperties);
	}
	var label = $.createLabel(labelType, title, data[titleId + 'link' + postFix], data[titleId + postFix + 'Subst']);
	if (label) {
		var labelProperties = {
			top : top
		};
		var h = parseInt(label.height);
		if (h > height) {
			height = h;
		}
		labelProperties.top = top;

		var color = $.getColor($.fieldTableViewRow, data[titleId + 'color' + postFix]);
		if (color) {
			labelProperties.color = color;
		}
		// var color = data[titleId + 'color' + postFix];
		// if (color) {
		// labelProperties.color = color.toString();
		// }
		label.applyProperties(labelProperties);
		view.add(label);
	}
	if (labelRight) {
		view.add(labelRight);
	}
	return height;
}
