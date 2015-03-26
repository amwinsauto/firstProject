var args = arguments[0] || {};
var form = args.form;
var field = args.field;
var data = args.data;
var parentview = form.getWindow().getWindow();

if (OS_ANDROID) {
	//	window.setOrientationModes([Ti.UI.PORTRAIT]);
	$.pickerWindow.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}
if (OS_IOS) {
	//	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT]);
	$.pickerWindow.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}


var value = field.getInternalValue();
if (field.getType() === 'date' || field.getType() === 'time' || field.getType() === 'datetime' || field.getType() === 'month') {
	if (!value) {
		value = new Date();
	}
}

var pickervalues = field.pickerValues;
var picker = null;

var slide_out = Ti.UI.createAnimation({
	bottom : parseInt($.pickerSlideView.bottom) //-260
});
var fireChanged = false;

slide_out.addEventListener('complete', function() {
	parentview.pickerView = null;
	parentview.remove($.pickerFullView);
	//$.pickerFullView.close();
	if (fireChanged) {
		field.change();
		// if (OS_IOS) {
		// field.fireEvent('change');
		// } else {
		// field.fireEvent('change', {
		// source : field
		// });
		// }
	}
});

function onPickerFullViewClick(e) {
	e.cancelBubble = true;
	fireChanged = false;
	$.pickerSlideView.animate(slide_out);
}

function onCancelButtonClick(e) {
	e.cancelBubble = true;
	fireChanged = false;
	$.pickerSlideView.animate(slide_out);
}

function onCloseButtonClick(e) {
	e.cancelBubble = true;
	fireChanged = false;
	$.pickerWindow.close();
}

function onDoneButtonClick(e) {
	e.cancelBubble = true;
	var value = picker.getValue();

	if (value) {
		if (field.getType() === 'date' || field.getType() === 'time'  || field.getType() === 'datetime' || field.getType() === 'month') {
			field.setValue(value);
		} else {
			field.setValue(value.value);
		}
	}
	fireChanged = true;
	$.pickerSlideView.animate(slide_out);
}

if (field.getListType() === 'list' && !(Alloy.isTablet && form.isInPopover())) {
	picker = Alloy.createController('application/form/pickerList', {
		form : form,
		data : data,
		field : field,
		onSelect : function(value, title) {
			field.setValue(value);
			$.pickerWindow.close();
			field.change();
			// if (OS_IOS) {
			// field.fireEvent('change');
			// } else {
			// field.fireEvent('change', {
			// source : field
			// });
			// }
		}
	});

	if (OS_IOS) {
		$.pickerViewHolder.add(picker.getPicker());
	} else {
		$.pickerWindow.add(picker.getPicker());
	}
} else {
	picker = Alloy.createController('application/form/picker', {
		form : form,
		data : data,
		field : field
	});
	if (OS_ANDROID) {
		picker.setTop(parseInt($.toolbar.height));
	} else {
		picker.setTop(44);
	}
	$.pickerSlideView.add(picker.getPicker());
}

exports.show = function() {
	if (field.getListType() === 'list' && !(Alloy.isTablet && form.isInPopover())) {
		if (OS_IOS) {
			$.pickerViewHolder.title = field.getTitle ? field.getTitle().toString() : undefined;;
		}
		if (OS_ANDROID) {
		//	$.pickerWindow.title = field.getTitle ? field.getTitle().toString() : undefined;;
		}
		$.pickerWindow.open({
			modal : true
		});
	} else {
		parentview.add($.pickerFullView);
		parentview.pickerView = $.pickerFullView;
		// Needs delay after view is added before it can be animated... otherwise a Warning is shown in console
		setTimeout(function() {
			$.pickerSlideView.animate({
				bottom : 0
			});
		}, 100);
	}
	if (picker.shown) {
		picker.shown();
	}
};
