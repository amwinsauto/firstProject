exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('button');

var onClick = null;

if (OS_ANDROID) {
	var Draggable = require('ti.draggable');

	$.button = Draggable.createView({
		bubbleParent : false,
		backgroundImage : '/images/core/slidetoAcceptBtn.png',
		left : 4,
		top : 6,
		width : 65,
		height : 65,
		minLeft : 4,
		maxLeft : (parseFloat($.slider.width) - (65 + 4)),
		axis : 'x'
	});
	$.slider.add($.button);

	$.button.addEventListener('start', function(e) {
		maxLeft = ($.slider.rect.width - $.button.rect.width) - padding;
		form.contentScrollView.scrollingEnabled = false;
	});
	$.button.addEventListener('end', function(e) {
		Ti.API.info('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
		Ti.API.info('Event "end"');
		var left = $.button.rect.x;
		Ti.API.info('left: ' + left + ' max ' + maxLeft);

		if (left < maxLeft) {
			$.button.animate({
				left : padding,
				duration : 300
			});
		} else {
			form.onClickField($, onClick);
		}
		form.contentScrollView.scrollingEnabled = true;
	});

}

var padding = parseFloat($.button.left);

var maxLeft = 0;

var x = 0;
var y = 0;

var olt = Ti.UI.create2DMatrix();

function onTouchstart(e) {
	maxLeft = ($.slider.rect.width - $.button.rect.width) - padding;
	x = e.x;
	y = e.y;
	form.contentScrollView.scrollingEnabled = false;
}

function onTouchmove(e) {
	var deltaX = e.x - x;
	var left = $.button.rect.x;

	if ((left + deltaX) > maxLeft) {
		// Not too far right
		deltaX = maxLeft - left;
	}

	if ((left + deltaX) < padding) {
		deltaX = padding - left;
	}

	olt = olt.translate(deltaX, 0);

	$.button.animate({
		transform : olt,
		duration : 100,

	});
}

function onTouchend(e) {
	var left = $.button.rect.x;
	if (left < maxLeft) {
		olt = olt.translate((left - padding) * -1, 0);
		$.button.animate({
			transform : olt,
			duration : 300
		});
	} else {
		form.onClickField($, onClick);
	}
	form.contentScrollView.scrollingEnabled = true;

}

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
	titleProperties.color = $.titleLabel.egColorReadOnly;
	titleProperties.enabled = false;
	if (OS_IOS) {
		fieldProperties.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
	}
	if (OS_ANDROID) {
		fieldProperties.backgroundSelectedColor = $.fieldTableViewRow.backgroundColor || 'transparent';
	}
} else {
	// Enabled
	fieldProperties.touchEnabled = true;
	if (data.onClick) {
		onClick = data.onClick;
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
