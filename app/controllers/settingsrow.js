var Images = require('Images');

var args = arguments[0] || {};
var data = args.data;
var connection = args.connection;
var popover = args.popover;

if (data.title) {
	$.row.title = data.title.toString();
} else if (data.name) {
	$.row.title = data.name.toString();
}

if (data.icon) {
	$.row.leftImage = Images.getImage(data.icon, 'list');
}

function onClick(e) {
	if (popover) {
		popover.hide();
	}
	if (data.onClick) {
		connection.send({
			action : 'onClick',
			type : 'menu',
			menu : {
				name : data.name,
				onClick : data.onClick
			}
		});
	}
}
