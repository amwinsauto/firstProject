exports.baseController = "application/list/rowBase";

var Conversion = require('tools/Conversion');
var UIUtils = require('UIUtils');

var args = arguments[0] || {};
var list = args.list;
var data = args.data;

if (data.onClick) {
	$.row.hasChild = true;
} else {
	$.row.hasChild = false;
	$.view.right = 20;
}
var searchText = '';
searchText = $.addSearchText(searchText, data.itemfield);
searchText = $.addSearchText(searchText, data.textfield);
searchText = $.addSearchText(searchText, data.colorfield);
searchText = $.addSearchText(searchText, data.countfield);
searchText = $.addSearchText(searchText, data.pricefield);
searchText = $.addSearchText(searchText, data.totalpricefield);
$.setSearchTextOnRow($.row, searchText);

$.item.text = Conversion.toString(data.itemfield);
$.text.text = Conversion.toString(data.textfield);
if (data.colornofield) {
	$.colorno.backgroundColor = Conversion.toString(data.colornofield);
} else {
	$.view.remove($.colorno);
}
$.color.text = Conversion.toString(data.colorfield);
$.count.text = Conversion.toString(data.countfield);
$.price.text = Conversion.toString(data.pricefield);
$.totalprice.text = Conversion.toString(data.totalpricefield);

//$.row.add(view);
//$.row.caller = view;

$.setOnClickAction($.row, data);
$.setOnLongClickAction($.row, data);
$.setOnDeleteAction($.row, data);

exports.hideDelete = function() {
};

exports.showDelete = function() {
};

exports.switchDeleteSelected = function() {
};
