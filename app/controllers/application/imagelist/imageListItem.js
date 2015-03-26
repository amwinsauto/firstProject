var Images = require('Images');
var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var data = args.data;
var list = args.list;

var window = list.getWindow();
var controller = window.getController();
var connection = controller.getConnection();
var application = controller.getApplication();

var name = data.name ? data.name.toString() : 'not_set';

var checkedImage = $.marker.egCheckedBackgroundImage;
var unCheckedImage = $.marker.egUnCheckedBackgroundImage;

var checked = data.checked ? true : false;
var showMarker = false;

if (checked || data.checkable || data.onCheck || data.onUnCheck) {
	showMarker = true;
}

if (showMarker) {
	$.marker.visible = true;
	$.markerHolder.visible = true;
	if (checked) {
		$.marker.backgroundImage = checkedImage;
	} else {
		$.marker.backgroundImage = unCheckedImage;
	}
}

if (data.image) {
//	Images.getUrlImage(data.image.toString(), null, null, $.image, 'image');
	$.image.image = Conversion.urlEncode(data.image.toString());
}

var titleHeight = 0;
if (data.title != undefined) {
	var title = Alloy.createController('application/imagelist/title');
	title.title.text = data.title.toString();
	$.titles.add(title.title);
	titleHeight += parseInt(title.title.height, 10);
}
if (data.subtitle != undefined) {
	var subtitle = Alloy.createController('application/imagelist/title');
	subtitle.title.text = data.subtitle.toString();
	$.titles.add(subtitle.title);
	titleHeight += parseInt(subtitle.title.height, 10);
}
$.image.bottom = titleHeight;
$.titles.height = titleHeight;

function onClick(e) {

	if (list.isPlayable()) {
		return;
	}

	if (data.onClick) {
		var click = {
			type : 'imagelistclick',
			caller : $.imageView,
			geolocation : data.geolocation,
			request : {
				action : 'onClick',
				type : 'item',
				item : {
					name : data.name,
					onClick : data.onClick
				}
			}
		};
		connection.sendInfo(click);
	}
}

function onMarkerClick(e) {

	if (list.isPlayable()) {
		return;
	}

	var doChecked = checked;
	if (checked) {
		checked = false;
		$.marker.backgroundImage = unCheckedImage;
		if (!data.onUnCheck) {
			return;
		}
	} else {
		checked = true;
		$.marker.backgroundImage = checkedImage;
		if (!data.onCheck) {
			return;
		}
	}

	var click = {
		type : doChecked ? 'itemunchecked' : 'itemchecked',
		caller : $.marker,
		geolocation : data.geolocation,
		request : {
			action : doChecked ? 'onUnCheck' : 'onCheck',
			type : 'item',
			item : {
				name : data.name,
				onCheck : doChecked ? undefined : data.onCheck,
				onUnCheck : doChecked ? data.onUnCheck : undefined
			}
		}
	};
	connection.sendInfo(click);

}

exports.getName = function() {
	return name;
};
exports.isChecked = function() {
	return checked;
};
