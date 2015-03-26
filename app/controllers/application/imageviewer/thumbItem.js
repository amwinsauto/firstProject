var Images = require('Images');
var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var data = args.data;
var viewer = args.viewer;

var window = viewer.getWindow();
var controller = window.getController();
var connection = controller.getConnection();
var application = controller.getApplication();

var name = data.name ? data.name.toString() : 'not_set';
var title = "";
if (data.thumbnail) {
	$.image.image = Conversion.urlEncode(data.thumbnail.toString());
	//Images.getUrlImage(data.thumbnail.toString(), null, null, $.image, 'image');
} else if (data.thumbnailcolor) {
	$.image.visible = false;
	$.colorView.visible = true;
	$.colorView.backgroundColor = data.thumbnailcolor.toString();
	// Do color
} else if (data.image) {
	$.image.image = Conversion.urlEncode(data.image.toString());
	//Images.getUrlImage(data.image.toString(), null, null, $.image, 'image');
}

if (data.title) {
	title = data.title;
}

function onClick(e) {
	viewer.thumbnailSelected($);
}

exports.getName = function() {
	return name;
};
