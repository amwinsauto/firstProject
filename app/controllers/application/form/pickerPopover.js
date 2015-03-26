var args = arguments[0] || {};
var form = args.form;
var field = args.field;
var popoverview = args.popoverview;
var data = args.data;

var value = field.getInternalValue();
if (field.getType() === 'date' || field.getType() === 'time' || field.getType() === 'datetime' || field.getType() === 'month') {
	if (!value) {
		value = new Date();
	}
}

var picker = null;
var done = false;
if (field.getListType() === 'list') {
	picker = Alloy.createController('application/form/pickerList', {
		form : form,
		data : data,
		field : field,
		onSelect : function(value, title) {
			field.setValue(value);
			//if (OS_IOS) {
			field.change();

			setTimeout(function(e) {
				$.popover.hide();
			}, 250);
			//field.fireEvent('change');
			//} else {
			//	field.fireEvent('change', {
			//		source : field
			//	});
			//}
		}
	});

} else {
	done = true;
	picker = Alloy.createController('application/form/picker', {
		form : form,
		data : data,
		field : field
	});
}

$.navigationWindow.height = picker.getHeight();
$.window.title = field.getTitle ? field.getTitle().toString() : undefined;
if (done) {
} else {
	 $.window.rightNavButton = null;
	 $.window.leftNavButton = null;
}

$.window.add(picker.getPicker());

function onCancelButtonClick(e) {
	$.popover.hide();
}

function onDoneButtonClick(e) {
	value = picker.getValue();

	if (value) {
		if (field.getType() === 'date' || field.getType() === 'time' || field.getType() === 'datetime' || field.getType() === 'month') {
			field.setValue(value);
		} else {
			field.setValue(value.value);
		}
	}
	$.popover.hide();
	//field.fireEvent('change');
	field.change();

}

exports.show = function() {
	if (popoverview) {
		$.popover.show({
			view : popoverview,
			animated : true
		});
	} else {
		$.popover.show({
			view : field,
			animated : true
		});
	}
	if (picker.shown) {
		picker.shown();
	}
};
