var Images = require('Images');
var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
init(args.image, args.count, args.title, args.toggle, args.selected, args.onClick);

function init(image, count, title, toggle, selected, onClick) {
	$.title.text = Conversion.toString(title);
	//	if (toggle) {
	if (selected) {
		$.title.color = $.title.egColorSelected;
	} else {
		$.title.color = $.title.egColorUnSelected;
	}
	//	}
	if (image) {
		if (selected) {
			$.image.image = Images.getImage(image + '_ACTIVE', 'floatoption');
		} else {
			$.image.image = Images.getImage(image, 'floatoption');
		}
	}
	$.optionView.onClick = onClick;
}

exports.updateOption = function(image, count, title, toggle, selected, onClick) {
	init(image, count, title, toggle, selected, onClick);
};
