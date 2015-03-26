exports.baseController = "application/form/baseField";

var args = arguments[0] || {};

var form = args.form;
var data = args.data;

$.setType('filler');

if (data.height) {
	var height = parseFloat(data.height);
	if (height) {
		$.fieldTableViewRow.height = parseFloat($.fieldTableViewRow.height) * height;
	}
}
exports.isFocusAble = function() {
	return false;
};

exports.focus = function() {
};

exports.addEventListener = function(name, func) {
};

exports.getField = function() {
	return $.row;
};

exports.getValue = function() {
	return '';
};

exports.setValue = function(newvalue) {
};
