exports.baseController = "application/list/rowBase";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var list = args.list;
var data = args.data;
$.name = data.name + "-header";

var title = '';
if (data.header) {
	//title = data.header.toString().toUpperCase();
	title = Conversion.substituteAll(data.header, data.headerSubst);
	title = title.toUpperCase();
}

$.setLabelTitle($.titleLabel, title, data.link);
