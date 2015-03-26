var Images = require('Images');

var args = arguments[0] || {};
var form = args.form;
var field = args.field;
var image = args.image;
var type = args.type;
var size = args.size;

if (!image) {

	if (size === 'large') {
		$.image = Alloy.createController('application/form/fieldImageLargeEmpty').getView();
	} else if (size === 'medium') {
		$.image = Alloy.createController('application/form/fieldImageMediumEmpty').getView();
	} else {
		$.image = Alloy.createController('application/form/fieldImageSmallEmpty').getView();
	}
} else {
	var imageController = null;
	if (size === 'large') {
		imageController = Alloy.createController('application/form/fieldImageLarge');
	} else if (size === 'medium') {
		imageController = Alloy.createController('application/form/fieldImageMedium');
	} else {
		imageController = Alloy.createController('application/form/fieldImageSmall');
	}
	$.image = imageController.image;

	if (OS_IOS) {
		Images.getUrlImage(image.toString(), type, size, $.image, 'image');
	} else {
		Images.getUrlImage(image.toString(), type, size, imageController.imageView, 'image');
	}
}

exports.getView = function() {
	return $.image;
};
