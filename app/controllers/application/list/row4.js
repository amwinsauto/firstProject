exports.baseController = "application/list/rowBase";

var args = arguments[0] || {};
var list = args.list;
var data = args.data;

var searchText = '';
searchText = $.addSearchText(searchText, data.title);
searchText = $.addSearchText(searchText, data.title1);
searchText = $.addSearchText(searchText, data.title2);
searchText = $.addSearchText(searchText, data.title3);
$.setSearchTextOnRow($.row, searchText);

$.setLabelTitle($.titleLabel, data.title, data.link);
var color = $.getColor($.row, data.titlecolor);
if (color) {
	$.titleLabel.color = color;
}

$.setLabelTitle($.title1Label, data.title1, data.link1);
var color1 = $.getColor($.row, data.titlecolor1);
if (color1) {
	$.title1Label.color = color1;
}

$.setLabelTitle($.title2Label, data.title2, data.link2);
var color2 = $.getColor($.row, data.titlecolor2);
if (color2) {
	$.title2Label.color = color2;
}
$.setLabelTitle($.title3Label, data.title3, data.link3);
var color3 = $.getColor($.row, data.titlecolor3);
if (color3) {
	$.title3Label.color = color3;
}

$.row.caller = $.title3Label;

$.setOnClickAction($.row, data);
$.setOnLongClickAction($.row, data);
$.setOnDeleteAction($.row, data);
