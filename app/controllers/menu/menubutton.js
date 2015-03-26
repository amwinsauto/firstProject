var Images = require('Images');
var args = arguments[0] || {};

var data = args.data || {};
var icon = data.icon;
//var onClick = data.onClick;

var onClickFunction = args.onClickFunction;

if (icon) {
	if (OS_IOS) {
		$.menubutton.image = Images.getImage(icon, 'navigator');
	}
	if (OS_ANDROID) {
		$.menubuttonImage.backgroundImage = Images.getImage(icon, 'navigator');
	}
} else {
	if (data.title) {
		$.menubutton.title = data.title.toString();
	} else if (data.name) {
		$.menubutton.title = data.name.toString();
	}
}

function onButtonClick(e) {
	onClickFunction($.menubutton, data);
}
