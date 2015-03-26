exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;
var window = form.getWindow();

$.setType('picker');
if (data.type) {
	$.setType(data.type);
}

// External fields
$.pickertype = 'string';
if (data.pickertype) {
	$.pickertype = data.pickertype;
}
$.pickerValues = null;

// Properties
var viewProperties = {};
var leaderProperties = {};
var fieldProperties = {};

// Internal fields
var value = null;
var stringValue = '';
var title = '';
var readOnly = false;
var autoSort = null;
var focusable = false;
var onChangeFunction = null;
var onGetValues = data.onGetValues || null;

if (data.readonly || data._readonly) {
	readOnly = true;
}
if (data.title) {
	title = Conversion.substituteAll(data.title, data.titleSubst);
}
if (title) {
	leaderProperties.text = title;
}

if (data.autosort) {
	autoSort = data.autosort;
}

if (data.listtype) {
	$.listType = data.listtype;
}

setPickerValues(data.pickervalues);
setValue(data.value);

fieldProperties.text = stringValue;
fieldProperties.value = value;
fieldProperties.pickertype = $.pickertype;
$.fieldLabel.value = value;

if (readOnly) {
	if ($.fieldTableViewRow.egBackgroundColorReadOnly) {
		viewProperties.backgroundColor = $.fieldTableViewRow.egBackgroundColorReadOnly;
	}
	if ($.leaderLabel.egColorReadOnly) {
		leaderProperties.color = $.leaderLabel.egColorReadOnly;
	}
	if ($.fieldLabel.egColorReadOnly) {
		fieldProperties.color = $.fieldLabel.egColorReadOnly;
	}
	// Remove image
	$.image.visible = false;

	if (OS_IOS) {
		viewProperties.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
	}
	if (OS_ANDROID) {
		viewProperties.backgroundSelectedColor = $.fieldTableViewRow.backgroundColor || 'transparent';
	}

} else {
	focusable = true;
	$.fieldTableViewRow.addEventListener('click', function(e) {

		if (onGetValues) {
			var fields = window.getJsonFields();
			var checkeditems = window.getCheckedJsonItems();
			var items = window.getJsonItems();
			var requestInfo = {
				type : 'onGetValues',
				caller : $.fieldTableViewRow,
				geolocation : data.geolocation,
				request : {
					action : 'onGetValues',
					type : 'picker',
					picker : {
						name : data.name,
						onGetValues : onGetValues,
						fields : fields.length > 0 ? fields : undefined,
						checkeditems : checkeditems.length > 0 ? checkeditems : undefined,
						items : items.length > 0 ? items : undefined
					}
				}
			};
			window.getConnection().sendInfo(requestInfo);
			onGetValues = null;
			return;
		}

		showPicker();

	});
}

if (data.color) {
	fieldProperties.color = data.color.toString();
}

$.fieldTableViewRow.applyProperties(viewProperties);
$.leaderLabel.applyProperties(leaderProperties);
$.fieldLabel.applyProperties(fieldProperties);

exports.update = function(newdata) {
	data = newdata;
	onGetValues = data.onGetValues || null;

	setPickerValues(data.pickervalues);
	if (data.value) {
		$.setValue(data.value);
	}

	if (data.showpicker) {
		$.fieldTableViewRow.fireEvent('click');
	}
};

exports.getTitle = function() {
	return title;
};

exports.isFocusAble = function() {
	return focusable;
};

exports.blur = function() {
};

exports.change = function() {
	if (onChangeFunction) {
		onChangeFunction({
			source : $.fieldLabel
		});
	}
};

exports.focus = function() {
	if ($.fieldTableViewRow) {
		$.fieldTableViewRow.fireEvent('click');
	}
};

exports.addEventListener = function(name, func) {
	if (name === 'change') {
		onChangeFunction = func;
	} else {
		$.fieldLabel.addEventListener(name, func);
	}
};

exports.fireEvent = function(e, func) {
	if (func) {
		$.fieldLabel.fireEvent(e, func);
	} else {
		$.fieldLabel.fireEvent(e);
	}
};

exports.getField = function() {
	return $.fieldLabel;
};

exports.getLabel = function() {
	return $.leaderLabel;
};

exports.getListType = function() {
	if ($.listType != 'picker') {
		if (($.pickerValues && $.pickerValues.length > 12) || $.listType === 'list') {
			return 'list';
		}
	}
	return 'picker';
};

exports.getValue = function() {
	return $.fieldLabel.value;
};

// For use with popup/popover/list
exports.getInternalValue = function() {
	return $.fieldLabel.value;
};

exports.setValue = function(value) {
	setValue(value);
	$.fieldLabel.value = value;
	$.fieldLabel.text = stringValue;
};

function showPicker() {
	if (OS_IOS && Alloy.isTablet && !form.isInPopover()) {
		Alloy.createController('application/form/pickerPopover', {
			form : form,
			field : $,
			popoverview : $.image,
			data : data
		}).show();
	} else {
		Alloy.createController('application/form/pickerView', {
			form : form,
			field : $,
			data : data
		}).show();
	}

}

function setValue(newvalue) {
	if (newvalue != undefined && newvalue != null) {
		if ($.pickertype == 'string') {
			value = newvalue.toString();
			stringValue = getValueTitle($.pickerValues, value);
		} else {
			value = parseFloat(newvalue);
			if (isNaN(value)) {
				value = 0;
			}
			stringValue = getValueTitle($.pickerValues, value);
		}
	} else {
		if ($.pickertype == 'string') {
			value = null;
			stringValue = '';
		} else {
			value = null;
			stringValue = '';
		}
	}
}

function setPickerValues(values) {
	$.pickerValues = null;
	if (values) {
		if (values.length > 0) {
			$.pickerValues = [];
			if (autoSort) {
				if (autoSort === 'asc') {
					values.sort(compareAsc);
				} else if (autoSort === 'desc') {
					values.sort(compareDesc);
				}
			}
			for (var i = 0; i < values.length; i++) {
				var value = values[i];
				if (value) {
					var pickerItem = {};
					if ($.pickertype == 'string') {
						pickerItem.value = value.value.toString();
						if (value.title != undefined) {
							pickerItem.title = value.title.toString();
						} else {
							pickerItem.title = pickerItem.value;
						}
					} else {
						pickerItem.value = parseFloat(value.value);
						if (isNaN(pickerItem.value)) {
							pickerItem.value = 0;
						}
						if (value.title != undefined) {
							pickerItem.title = value.title.toString();
						} else {
							pickerItem.title = pickerItem.value.toString();
						}

					}
					$.pickerValues.push(pickerItem);
				}
			}
		}
	}
}

function compareAsc(firstValue, secondValue) {
	if (firstValue.title.toString() < secondValue.title.toString()) {
		return -1;
	} else if (firstValue.title.toString() > secondValue.title.toString()) {
		return 1;
	}
	return 0;
}

function compareDesc(firstValue, secondValue) {
	return compareAsc(secondValue, firstValue);
}

function getValueTitle(pickervalues, value) {
	if (pickervalues && value != undefined && value != null) {
		if (pickervalues.length > 0) {
			var itemCount = pickervalues.length;
			for (var i = 0; i < itemCount; i++) {
				var pickerItem = pickervalues[i];
				if (value === pickerItem.value) {
					var pickerItemTitle = '';
					if (pickerItem.title != undefined) {
						pickerItemTitle = pickerItem.title.toString();
					} else if (pickerItem.value != undefined) {
						pickerItemTitle = pickerItem.value.toString();
					}
					return pickerItemTitle;
				}
			};
		}
	}
	return '';
}

