var Images = require('Images');

var args = arguments[0] || {};
var image = args.image;
var aliasType = args.type;
var onClick = args.onClick;
var name = args.name;
var geolocation = args.geolocation;
var caller = args.caller;
var width = args.width;

init();

function init() {
	if (OS_ANDROID) {
		// Android hack...needs the width to calculate the height
		$.subtitleImageView.width = width;
	}
	Images.getUrlImage(image, aliasType, undefined, $.subtitleImageView, 'image');

	if (onClick) {
		$.subtitleImageView.onClick = {
			type : 'subtitleclick',
			caller : caller,
			geolocation : geolocation,
			request : {
				action : 'onSubtitleClick',
				type : 'listitem',
				listitem : {
					name : name,
					onSubtitleClick : onClick
				}
			}
		};
	}
}

exports.updateImage = function(image) {
	Images.getUrlImage(image, aliasType, undefined, $.subtitleImageView, 'image');
};
