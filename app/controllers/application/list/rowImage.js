var Images = require('Images');

var args = arguments[0] || {};
var image = args.image;
var type = args.type;
var size = args.size;

init(image, type, size);

function init(image, type, size) {
	if (!image) {
		if (size === 'large') {
			$.image = Alloy.createController('application/list/rowImageLargeEmpty').getView();
		} else if (size === 'medium') {
			$.image = Alloy.createController('application/list/rowImageMediumEmpty').getView();
		} else {
			$.image = Alloy.createController('application/list/rowImageSmallEmpty').getView();
		}
	} else {
		$.imageController = null;
		if (size === 'large') {
			$.imageController = Alloy.createController('application/list/rowImageLarge');
		} else if (size === 'medium') {
			$.imageController = Alloy.createController('application/list/rowImageMedium');
		} else {
			$.imageController = Alloy.createController('application/list/rowImageSmall');
		}
		$.image = $.imageController.image;
		Images.getUrlImage(image, type, size, $.imageController.imageView, 'image');
	}
}

exports.getView = function() {
	return $.image;
};

exports.updateImage = function(image, type, size) {
	Images.getUrlImage(image, type, size, $.imageController.imageView, 'image');
};
