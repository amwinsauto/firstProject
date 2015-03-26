var args = arguments[0] || {};
var form = args.form;
var field = args.field;
var data = args.data;

var value = field.getInternalValue();
if (field.getType() === 'date' || field.getType() === 'time' || field.getType() === 'datetime' || field.getType() === 'month') {
	if (!value) {
		value = new Date();
		value.setSeconds(0);
	}
}

var monthIndex = -1;
var yearIndex = -1;
var selectedIndex = -1;

if (field.getType() === 'date') {
	$.picker.type = Ti.UI.PICKER_TYPE_DATE;
	$.picker.value = value;
} else if (field.getType() === 'time') {
	$.picker.type = Ti.UI.PICKER_TYPE_TIME;
	$.picker.value = value;
} else if (field.getType() === 'datetime') {
	$.picker.type = Ti.UI.PICKER_TYPE_DATE_AND_TIME;
	$.picker.value = value;
} else if (field.getType() === 'month') {
	$.picker.type = Ti.UI.PICKER_TYPE_PLAIN;
	var monthIndex = new Date().getMonth();
	var year = new Date().getFullYear();

	if (value) {
		monthIndex = value.getMonth();
		year = value.getFullYear();
	}
	// Create month column
	if (OS_ANDROID) {
		var monthColumn = Ti.UI.createPickerColumn({
			width : '70%'
		});
	}
	if (OS_IOS) {
		var monthColumn = Ti.UI.createPickerColumn();
	}

	for (var i = 1; i <= 12; i++) {
		var pickerItemTitle;
		if (i == 1) {
			pickerItemTitle = L('january');
		} else if (i == 2) {
			pickerItemTitle = L('february');
		} else if (i == 3) {
			pickerItemTitle = L('march');
		} else if (i == 4) {
			pickerItemTitle = L('april');
		} else if (i == 5) {
			pickerItemTitle = L('may');
		} else if (i == 6) {
			pickerItemTitle = L('june');
		} else if (i == 7) {
			pickerItemTitle = L('july');
		} else if (i == 8) {
			pickerItemTitle = L('august');
		} else if (i == 9) {
			pickerItemTitle = L('september');
		} else if (i == 10) {
			pickerItemTitle = L('october');
		} else if (i == 11) {
			pickerItemTitle = L('november');
		} else if (i == 12) {
			pickerItemTitle = L('december');
		}
		monthColumn.addRow(Ti.UI.createPickerRow({
			title : pickerItemTitle,
			value : i.toString()
		}));
	}

	// Create year column
	if (OS_ANDROID) {
		var yearColumn = Ti.UI.createPickerColumn({
			width : '30%'
		});
	}
	if (OS_IOS) {
		var yearColumn = Ti.UI.createPickerColumn();
	}
	var thisYear = new Date().getFullYear();
	var startYear = thisYear - 50;
	var endYear = thisYear + 100;
	var index = 0;
	for (var i = startYear; i <= endYear; i++) {
		yearColumn.addRow(Ti.UI.createPickerRow({
			title : i.toString(),
			value : i.toString()
		}));
		if (i === year) {
			yearIndex = index;
		}
		index++;
	}

	$.picker.columns = [monthColumn, yearColumn];
} else {
	$.picker.type = Ti.UI.PICKER_TYPE_PLAIN;
	//	var selectedIndex = 0;
	var pickervalues = field.pickerValues;

	// Create
	if (OS_ANDROID) {
		var column = Ti.UI.createPickerColumn({
			width : '100%'
		});
	}
	if (OS_IOS) {
		var column = Ti.UI.createPickerColumn();
	}
	if (pickervalues && pickervalues.length > 0) {
		var itemCount = pickervalues.length;
		for (var i = 0; i < itemCount; i++) {
			var pickerItem = pickervalues[i];
			var pickerItemTitle = '';
			if (pickerItem.title != undefined) {
				pickerItemTitle = pickerItem.title.toString();
			} else if (pickerItem.value != undefined) {
				pickerItemTitle = pickerItem.value.toString();
			}
			column.addRow(Ti.UI.createPickerRow({
				title : pickerItemTitle,
				value : pickerItem.value
			}));

			if (value) {
				if (value === pickerItem.value) {
					selectedIndex = i;
				}
			}

		};
	}
	$.picker.columns = [column];
}

function onPickerChange(e) {
}

exports.getPicker = function() {
	return $.picker;
};

exports.getValue = function() {
	if ($.picker.type == Ti.UI.PICKER_TYPE_DATE || $.picker.type == Ti.UI.PICKER_TYPE_TIME || $.picker.type == Ti.UI.PICKER_TYPE_DATE_AND_TIME) {
		return $.picker.value;
	} else if (field.getType() === 'month') {
		return (parseInt($.picker.getSelectedRow(1).value, 10) * 100) + parseInt($.picker.getSelectedRow(0).value, 10);
	}
	return $.picker.getSelectedRow(0);
};

exports.getHeight = function() {
	return 216;
};

exports.setTop = function(top) {
	$.picker.top = top;
};

exports.shown = function() {
	if (field.getType() === 'month') {
		$.picker.setSelectedRow(0, monthIndex, false);
		$.picker.setSelectedRow(1, yearIndex, false);
	} else if ($.picker.type == Ti.UI.PICKER_TYPE_DATE || $.picker.type == Ti.UI.PICKER_TYPE_TIME || $.picker.type == Ti.UI.PICKER_TYPE_DATE_AND_TIME) {

	} else {
		if (selectedIndex > -1) {
			$.picker.setSelectedRow(0, selectedIndex, true);
		}
	}
};
