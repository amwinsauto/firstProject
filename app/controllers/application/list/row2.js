exports.baseController = "application/list/rowBase";

var args = arguments[0] || {};
var list = args.list;
var data = args.data;

var searchText = '';
searchText = $.addSearchText(searchText, data.title);
searchText = $.addSearchText(searchText, data.title1);
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

$.row.caller = $.title1Label;

$.setOnClickAction($.row, data);
$.setOnLongClickAction($.row, data);
$.setOnDeleteAction($.row, data);
