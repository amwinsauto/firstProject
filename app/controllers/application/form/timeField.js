exports.baseController = "application/form/baseField";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;

$.setType('time');

// Properties
var viewProperties = {};
var leaderProperties = {};
var fieldProperties = {};

// Internal fields
var value = null;
var stringValue = '';
var readOnly = false;
var focusable = false;
var onChangeFunction = null;
var color = '';
var hintColor = $.fieldLabel.egHintColor;
var hint = L('selectTime');

var seconds = 0;

if (data.hint) {
	hint = Conversion.substituteAll(data.hint, data.hintSubst);
}

if (data.readonly || data._readonly) {
	readOnly = true;
}
if (data.title) {
	leaderProperties.text = Conversion.substituteAll(data.title, data.titleSubst);
}

setValue(data.value);

if (stringValue) {
	fieldProperties.text = stringValue;
} else {
	if (!readOnly) {
		fieldProperties.text = hint;
		fieldProperties.color = hintColor;
	}
}

fieldProperties.value = value;
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
	fieldProperties.right = $.image.right;

	if (OS_IOS) {
		viewProperties.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
	}
	if (OS_ANDROID) {
		viewProperties.backgroundSelectedColor = $.fieldTableViewRow.backgroundColor || 'transparent';
	}

} else {
	focusable = true;
	$.fieldTableViewRow.addEventListener('click', function(e) {
		if (OS_ANDROID) {
			var picker = Ti.UI.createPicker({
				type : Ti.UI.PICKER_TYPE_TIME,
			});

			var val = $.getInternalValue();
			if (!val) {
				val = new Date();
				val.setSeconds(0);
			}
			picker.showTimePickerDialog({
				value : val,
				format24 : true,
				title : data.title ? data.title.toString() : '',
				okButtonTitle : L('ok_button'),
				callback : function(e) {
					if (e.cancel) {
						Ti.API.info('User canceled dialog');
					} else {
						var d = e.value;
						if (d) {
							d.setSeconds(seconds);
						}
						$.setValue(Conversion.timeToJson(d));
						Ti.API.info('User selected time: ' + d);
						$.change();
					}
				}
			});
		}

		if (OS_IOS) {
			if (Alloy.isTablet && !form.isInPopover()) {
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
	});

}

var color = $.getColor($.fieldLabel, data.color);
if (color) {
	fieldProperties.color = color;
} else {
	color = $.fieldLabel.color;
}
var titlecolor = $.getColor($.leaderLabel, data.titlecolor);
if (titlecolor) {
	leaderProperties.color = titlecolor;
}


$.fieldTableViewRow.applyProperties(viewProperties);
$.leaderLabel.applyProperties(leaderProperties);
$.fieldLabel.applyProperties(fieldProperties);

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
	return 'picker';
};

exports.getValue = function() {
	return Conversion.timeToJson($.fieldLabel.value);
};

// For use with popup/popover/list
exports.getInternalValue = function() {
	return $.fieldLabel.value;
};

exports.setValue = function(newvalue) {
	setValue(newvalue);

	$.fieldLabel.value = value;

	if (stringValue) {
		//$.fieldLabel.text = stringValue;
		$.fieldLabel.applyProperties({
			text : stringValue,
			color : color
		});
	} else {
		if (!readOnly) {
			$.fieldLabel.applyProperties({
				text : hint,
				color : hintColor
			});
		}
	}
};

function setValue(newvalue) {
	if (newvalue != undefined && newvalue != null) {
		value = Conversion.toTime(newvalue);
		seconds = value.getSeconds();
		stringValue = Conversion.toDisplayTime(newvalue);
	} else {
		value = null;
		seconds = 0;
		stringValue = '';
	}
}
