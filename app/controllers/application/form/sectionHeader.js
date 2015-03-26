exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

if (data.title) {
	var title = Conversion.substituteAll(data.title, data.titleSubst);
	title = title.toUpperCase();
	$.setLabelTitle($.titleLabel, title, data.link);
} else {
	if (form.isNarrow()) {
		$.row.height = $.row.egEmptyHeight;
	}
}
if (OS_ANDROID) {
	if (data.layout === 'transparent' || data.layout === 'none') {
		$.bottomSeparator.backgroundColor = 'transparent';
	}
}

