var Images = require('Images');
var Conversion = require('tools/Conversion');
var UIUtils = require('UIUtils');

var args = arguments[0] || {};
var parentMenu = args.parentMenu;
var window = args.window;
var data = args.data;

var type = data.type || 'button';
var action = data.action || 'onClick';

var title = '';
var icon = '';
var name = '';
var enabled = true;
var geolocation = false;

if (data.name) {
	name = data.name.toString();
}

if (data.title) {
	title = Conversion.substituteAll(data.title, data.titleSubst);
}

if (data.image) {
	icon = data.image;
} else if (data.icon) {
	icon = data.icon;
}

if (icon) {
	icon = Images.getImage(icon, 'toolbar');
}

if (data.disabled === true || data.enabled === false) {
	enabled = false;
}


if (data.geolocation) {
	geolocation = true;
}

var attr = {
	title : title ? title : 'no title',
	groupId : 1 // Application Menus
};

if (icon) {
	attr.icon = icon;
}

if (data.showAsAction) {
	attr.showAsAction = data.showAsAction;
}
if (data.itemId) {
	attr.itemId = data.itemId;
}

if (data.actionView) {
	attr.actionView = data.actionView;
}

if (enabled === false) {
	attr.enabled = enabled;
}


var menuItem = parentMenu.add(attr);

if (data.type != 'search') {
	menuItem.addEventListener('click', function(e) {

		if (data.options) {
			Alloy.createController('application/toolbar/buttonGroup', {
				window : window,
				data : data
			});
		} else {

			var fields = window.getJsonFields();
			var checkeditems = window.getCheckedJsonItems();
			var items = window.getJsonItems();
			
			var info = {
				type : type,
				caller : menuItem,
				geolocation : geolocation
			};
			var request = {
				action : action,
				type : type
			};
			var object = {
				name : name,
			};
			object[action] = data[action];
			object.fields = fields.length > 0 ? fields : undefined;
			object.checkeditems = checkeditems.length > 0 ? checkeditems : undefined;
			object.items = items.length > 0 ? items : undefined;
			request[type] = object;
			info.request = request;
			window.getConnection().sendInfo(info);
		}
	});
}
if (data.onCollapse) {
	menuItem.addEventListener('collapse', data.onCollapse);

}

