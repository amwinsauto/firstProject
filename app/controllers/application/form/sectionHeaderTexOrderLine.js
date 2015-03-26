exports.baseController = "application/form/baseField";

var args = arguments[0] || {};
var form = args.form;
var data = args.data;
$.setLabelTitle($.item, data.itemheader);
$.setLabelTitle($.color, data.colorheader);
$.setLabelTitle($.count, data.countheader);
$.setLabelTitle($.price, data.priceheader);
$.setLabelTitle($.totalprice, data.totalpriceheader);
