exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('template');
if (data.type) {
	$.setType(data.type);
}

$.item.text = Conversion.toString(data.itemfield);
$.text.text = Conversion.toString(data.textfield);
$.colorno.backgroundColor = Conversion.toString(data.colornofield);
$.color.text = Conversion.toString(data.colorfield);
$.count.text = Conversion.toString(data.countfield);
$.price.text = Conversion.toString(data.pricefield);
$.totalprice.text = Conversion.toString(data.totalpricefield);

$.setOnClick(data);
