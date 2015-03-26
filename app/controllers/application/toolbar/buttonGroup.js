var Conversion = require('tools/Conversion');
var UIUtils = require('UIUtils');

var args = arguments[0] || {};
var window = args.window;
var data = args.data;
var parent = args.parent;

var buttonOptions = [];
var cancelButtonOption = null;
var options = [];
var destructive = -1;
var cancel = -1;
var buttonNames = [];

for (var i = 0, c2 = data.options.length; i < c2; ++i) {
	var option = data.options[i];
	
	if (option.disabled === true || option.enabled === false) {
		continue;
	}

	
	options.push(Conversion.substituteAll(option.title, option.titleSubst));
	if (option.destructive) {
		destructive = i;
	}
	if (option.cancel) {
		cancel = i;
		if (OS_IOS) {
			buttonOptions.push(option);
		}
		cancelButtonOption = option;
	} else {
		buttonOptions.push(option);
	}
}

// If no cancel button add one
if (cancel === -1) {
	cancel = options.length;
	if (OS_IOS) {
		options.push(L('cancel_button'));
	}
	if (OS_ANDROID) {
		buttonNames.push(L('cancel_button'));
	}
}

var attrs = {
	options : options,
};

if (data.grouptitle) {
	attrs.title = Conversion.substituteAll(data.grouptitle, data.grouptitleSubst);
}

if (OS_IOS) {
	if (destructive > -1) {
		attrs.destructive = destructive;
	}
	if (cancel > -1) {
		attrs.cancel = cancel;
	}
}
if (OS_ANDROID) {
	if (buttonNames.length > 0) {
		attrs.buttonNames = buttonNames;
	}
}

// Show
var optionDialog = Ti.UI.createOptionDialog(attrs);
optionDialog.addEventListener('click', function(e) {
	UIUtils.setShownOptionDialog(null);
	var buttonOption = null;

	if (OS_ANDROID) {
		if (e.button) {
			if (cancelButtonOption) {
				buttonOption = cancelButtonOption;
			} else {
				// Cancel pressed
				return;
			}
		}
	}
	if (!buttonOption) {
		if (e.index > -1 && e.index < buttonOptions.length) {
			buttonOption = buttonOptions[e.index];
		}
	}

	if (buttonOption) {
		var fields = window.getJsonFields();
		var requestInfo = {
			type : 'buttonclick',
			geolocation : buttonOption.geolocation,
			request : {
				action : 'onClick',
				type : 'button',
				button : {
					name : buttonOption.name,
					onClick : buttonOption.onClick,
					fields : fields.length > 0 ? fields : undefined
				}
			}
		};
		window.getConnection().sendInfo(requestInfo);
	}
});
UIUtils.setShownOptionDialog(optionDialog);
if (OS_IOS) {
	optionDialog.show({
		view : parent
	});
} else {
	optionDialog.show();
}
