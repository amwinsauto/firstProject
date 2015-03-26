exports.baseController = "application/list/rowBase";

var Conversion = require('tools/Conversion');
var Images = require('Images');

var cache = null;

var args = arguments[0] || {};
var list = args.list;
var data = args.data;

// Has child
if (data.onClick) {
	$.row.hasChild = true;
} else {
	$.row.hasChild = false;
}
var searchText = '';
searchText = $.addSearchText(searchText, data.key1);
searchText = $.addSearchText(searchText, data.key2);
searchText = $.addSearchText(searchText, data.key3);
searchText = $.addSearchText(searchText, data.key5);
searchText = $.addSearchText(searchText, data.size);
searchText = $.addSearchText(searchText, data.price);
searchText = $.addSearchText(searchText, data.title);
$.setSearchTextOnRow($.row, searchText);

var leftImage = Conversion.toString(data.leftimage);
if (leftImage != undefined) {
	Images.getUrlImage(leftImage, undefined, undefined, $.image, 'image');
}
$.key1.text = Conversion.toString(data.key1);
$.key2.text = Conversion.toString(data.key2);
$.key3.text = Conversion.toString(data.key3);
$.key5.text = Conversion.toString(data.key5);
$.size.text = Conversion.toString(data.size);
$.price.text = Conversion.toString(data.price);
$.desc.text = Conversion.toString(data.title);

addColorView($.row, Conversion.toString(data.color1), 0);
addColorView($.row, Conversion.toString(data.color2), 1);
addColorView($.row, Conversion.toString(data.color3), 2);
addColorView($.row, Conversion.toString(data.color4), 3);
addColorView($.row, Conversion.toString(data.color5), 4);
addColorView($.row, Conversion.toString(data.color6), 5);
addColorView($.row, Conversion.toString(data.color7), 6);
addColorView($.row, Conversion.toString(data.color8), 7);

if (data.morecolors === '*YES') {
	var plusIcon = Ti.UI.createImageView({
		top : 61,
		left : 655,
		width : 13,
		height : 13,
		image : '/images/core/icon_plus.png'
	});
	$.row.add(plusIcon);
}

$.setOnClickAction($.row, data);
$.setOnLongClickAction($.row, data);
$.setOnDeleteAction($.row, data);

function addColorView(row, color, index) {
	if (color) {
		var colorView = Ti.UI.createView({
			top : 60,
			width : 15,
			left : 495 + (20 * index),
			height : 15,
			borderColor : 'black',
			backgroundColor : color
		});
		row.add(colorView);
	}

}

exports.hideDelete = function() {
};

exports.showDelete = function() {
};

exports.switchDeleteSelected = function() {
}; 