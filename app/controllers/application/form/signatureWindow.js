var Paint = require('ti.paint');
var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var data = args.data;
var field = args.field;

if (data.signer) {
	$.signer = Conversion.substituteAll(data.signer, data.signerSubst);
}
if (data.title) {
	$.title = Conversion.substituteAll(data.title, data.titleSubst);
}
if (data.text) {
	$.text = Conversion.substituteAll(data.text, data.textSubst);
}

// Editor
$.fieldEditorTitleLabel.text = $.title;
$.fieldEditorTextLabel.text = $.text;
$.fieldEditorSignerLabel.text = $.signer;

$.signature = Paint.createPaintView({
	strokeWidth : 4,
	strokeColor : '#2a81df',
	zIndex : 10,
	bottom : 88,
	top : 80
});

// TODO Fix Done button when Ti.Paint fires events
// $.signature.addEventListener('touchend', function() {
	// if (!$.fieldEditorDoneButton.shown) {
		// $.fieldEditorDoneButton.animate({
			// opacity : 1,
			// duration : 500
		// });
		// $.fieldEditorDoneButton.shown = true;
	// }
// });
// TODO Fix Done button when Ti.Paint fires events
$.fieldEditorDoneButton.opacity = 1;


$.fieldEditorView.add($.signature);

exports.show = function() {
	if (Alloy.isTablet && !field.isInPopup()) {
		$.fieldEditorFillWindow.open();
	}

	if (Alloy.isHandheld) {
		$.fieldEditorWindow.backgroundColor = 'white';
		$.fieldEditorWindow.orientationModes = [Titanium.UI.LANDSCAPE_RIGHT];
	}
	$.fieldEditorView.visible = false;

	if (Alloy.isTablet && field.isInPopup()) {
		$.fieldEditorWindow.open({
			modal : true
		});
	} else {
		$.fieldEditorWindow.open();

	}

	//if (Alloy.isHandheld) {
		//Ti.UI.orientation = Titanium.UI.LANDSCAPE_RIGHT;
	//}
	$.fieldEditorView.show();
};

function onFieldEditorClearButtonClick(e) {
	$.signature.clear();
	// TODO Fix done button when Ti.Paint fires events
	// $.fieldEditorDoneButton.animate({
		// opacity : 0,
		// duration : 500
	// });
	// $.fieldEditorDoneButton.shown = false;

}

function onFieldEditorCancelButtonClick(e) {
	$.fieldEditorView.hide();
	// if (Alloy.isHandheld) {
	//	Ti.UI.orientation = Titanium.UI.PORTRAIT;
	// }
	$.fieldEditorWindow.close();
	if (Alloy.isTablet && !field.isInPopup()) {
		$.fieldEditorFillWindow.close();
	}

}

function onFieldEditorDoneButtonClick(e) {

	if (OS_ANDROID) {
		$.signature.backgroundColor = 'white';
		field.setSignature($.signature.toImage().media);
	} else {
		field.setSignature($.signature.toImage());
	}
	$.fieldEditorView.hide();
	// if (Alloy.isHandheld) {
		// Ti.UI.orientation = Titanium.UI.PORTRAIT;
	// }
	$.fieldEditorWindow.close();
	if (Alloy.isTablet && !field.isInPopup()) {
		$.fieldEditorFillWindow.close();
	}

}

