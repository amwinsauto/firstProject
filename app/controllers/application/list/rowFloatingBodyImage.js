var Images = require('Images');

var args = arguments[0] || {};
var image = args.image;
var onClick = args.onClick;
var name = args.name;
var geolocation = args.geolocation;
var caller = args.caller;
var width = args.width;

init();

function init() {
	if (OS_ANDROID) {
		// Android hack...needs the width to calculate the height
		//$.bodyImageView.width = width;
	}

	Images.getUrlImage(image, undefined, undefined, $.bodyImageView, 'image');

	if (onClick) {
		$.bodyImageView.onClick = {
			type : 'imageclick',
			caller : caller,
			geolocation : geolocation,
			request : {
				action : 'onImageClick',
				type : 'listitem',
				listitem : {
					name : name,
					onImageClick : onClick
				}
			}
		};
	}
}

exports.updateImage = function(image) {
	Images.getUrlImage(image, undefined, undefined, $.bodyImageView, 'image');
};