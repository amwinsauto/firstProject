var Images = require('Images');
var args = arguments[0] || {};
var data = args.data;
var application = args.application;
var connection = application.getConnection();

$.masterTab.title = data.title ? data.title.toString() : '';
$.masterTab.icon = data.image ? Images.getImage(data.image, 'tab') : '';

function onSupportClick(e) {
	var support = Alloy.createController('support', {
		connection : connection
	});
	support.getView().open();

}

function onAboutClick(e) {
	var about = Alloy.createController('about', {
		connection : connection
	});
	about.getView().open();

}
