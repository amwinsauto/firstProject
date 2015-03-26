exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');
var Images = require('Images');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('signature');

var title = null;
var value = null;
var saved = false;
var readOnly = false;
var metadata = data.metadata;

if (data.title) {
	title = Conversion.substituteAll(data.title, data.titleSubst);
}
if (data.value) {
	value = data.value.toString();
	saved = true;
}
if (data.readonly || data._readonly) {
	readOnly = true;
}

$.leaderLabel.text = title;
if (value || readOnly) {
	// $.tiField.image = Ti.Utils.base64decode(value);

	if (value) {
		Images.getUrlImage(value, null, null, $.fieldImageView, 'image');
	}
	$.fieldTableViewRow.touchEnabled = false;
	$.fieldTableViewRow.focusable = false;
	if (OS_IOS) {
		$.fieldTableViewRow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
	}
	if (OS_ANDROID) {
		$.clickImageView.visible = false;
	}
} else {
	$.fieldTableViewRow.hasChild = true;
	if (OS_ANDROID) {
		$.clickImageView.visible = true;
	}
	$.fieldTableViewRow.addEventListener('click', drawSignature);
}

function drawSignature(e) {
	form.getConnection().getGeoLocation(showSignatureWindow, e.source);
}

function showSignatureWindow(coords, that) {
	if (coords && coords.latitude && coords.longitude) {
		$.fieldImageView.coords = {
			latitude : coords.latitude,
			longitude : coords.longitude
		};
	}
	Alloy.createController('application/form/signatureWindow', {
		data : data,
		field : $
	}).show();
}

exports.setSignature = function(image) {
	$.fieldImageView.image = image;
	$.fieldTableViewRow.hasChild = false;
	//	if (OS_ANDROID) {
	//		$.fieldTableViewRow.rightImage = '';
	//	}
	$.fieldTableViewRow.touchEnabled = false;
	$.fieldTableViewRow.focusable = false;
	$.fieldTableViewRow.removeEventListener('click', drawSignature);
	if (OS_IOS) {
		$.fieldTableViewRow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
	}
	if (OS_ANDROID) {
		$.clickImageView.visible = false;
	}

	$.fieldImageView.show();
	if (Alloy.isHandheld) {
		Ti.UI.orientation = Titanium.UI.PORTRAIT;
	}
};
exports.isInPopup = function() {
	return form.isInPopup();
};

exports.addEventListener = function(name, func) {
	$.fieldImageView.addEventListener(name, func);
};

exports.getValue = function() {
	if (!saved && $.fieldImageView.image) {
		saved = true;
		return Ti.Utils.base64encode($.fieldImageView.image).toString();
	}
	return null;
};

exports.getMetadata = function() {
	if ($.fieldImageView.coords) {
		metadata.latitude = $.fieldImageView.coords.latitude;
		metadata.longitude = $.fieldImageView.coords.longitude;
	}
	return metadata;
};
