var Images = require('Images');

var args = arguments[0] || {};

var application = args.application;
var menu = args.menu;

$.title.text = application.getTitle();
$.icon.image = application.getIcon() || '';

function onClick(e) {
	Alloy.Globals.applicationSwitch(application);
	menu.close();
}
