var args = arguments[0] || {};
var form = args.form;

var focusField = null;

function onNextClick(e) {
	if (focusField) {
		focusField.onToolbarNextClick();
	}
}

function onPreviousClick(e) {
	if (focusField) {
		focusField.onToolbarPreviousClick();
	}
}

function onOkClick(e) {
	if (focusField) {
		focusField.onToolbarOkClick();
		if (focusField.onReturn) {
			focusField.fireEvent('return');
		}
	}
}

exports.setFocusField = function(field) {
	focusField = field;
	if (focusField) {
		$.previous.enabled = focusField.previousIndex != undefined ? true : false;
		$.next.enabled = focusField.nextIndex != undefined ? true : false;
	}
};
