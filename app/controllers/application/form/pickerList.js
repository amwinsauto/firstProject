var args = arguments[0] || {};
var form = args.form;
var field = args.field;
var data = args.data;

var showSearch = true;
if (data.showsearch === false) {
	showSearch = false;
}

// TODO Titanium bug when searching table in popover.. table is obscured
//if (OS_IOS && Alloy.isHandheld) {

if (showSearch) {
	$.table.search = $.search;
}
//}


function onSearchReturn(e) {
	$.search.blur();
}

function onSearchCancel(e) {
	$.search.value = '';
	$.search.blur();
}

function onTableClick(e) {
	if (OS_ANDROID) {
		if (e.rowData) {
			args.onSelect(e.rowData.value, e.rowData.title);
		} else {
			args.onSelect(e.row.value, e.row.title);
		}
	} else {
		args.onSelect(e.row.value, e.row.title);
	}
}

var value = field.getInternalValue();
if (field.getType() === 'date' || field.getType() === 'time' || field.getType() === 'datetime' || field.getType() === 'month') {
	if (!value) {
		value = new Date();
	}
}

var pickervalues = field.pickerValues;
var selectedIndex = -1;
// Create
var tableData = [];
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

		var item = {
			title : pickerItemTitle,
			value : pickerItem.value,
			//			selectedBackgroundColor : '#c9c9ce',
			selectedBackgroundColor : '#d9d9d9',
			color : 'black',
			height : 44,
			font : {
				fontSize : 18, // Default list font on ios7
				//fontWeight : 'normal'
			}
		};

		if (value) {
			if (value === pickerItem.value) {
				selectedIndex = i;
				//if (OS_ANDROID) {
				item.hasCheck = true;
				//}
			}
		}
		tableData.push(item);
	};
}

$.table.data = tableData;

// if (selectedIndex > -1) {
// $.table.selectRow(selectedIndex);
// }

exports.getPicker = function() {
	return $.table;
};

exports.getHeight = function() {
	if (pickervalues.length > 9) {
		return 44 * 10;
	}
	return 44 * (pickervalues.length + 1);
};

exports.shown = function() {
	if (selectedIndex > -1) {
		if (OS_IOS) {
			$.table.scrollToIndex(selectedIndex, {
				animated : true,
				position : Ti.UI.iPhone.TableViewScrollPosition.MIDDLE
			});
		} else {
			$.table.scrollToIndex(selectedIndex);
		}
		//$.table.selectRow(selectedIndex);
	}
};

