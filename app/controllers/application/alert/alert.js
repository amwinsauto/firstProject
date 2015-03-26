var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var connection = args.connection;
var data = args.data;

var buttonNames = [];
var buttonRequests = [];

var iosStyle = null;
var androidView = null;

if (data.style === 'username_and_password') {
	if (OS_IOS) {
		iosStyle = Ti.UI.iPhone.AlertDialogStyle.LOGIN_AND_PASSWORD_INPUT;
	}
	if (OS_ANDROID) {
		androidView = Alloy.createController('application/alert/androidViewLoginAndPassword');
	}
} else if (data.style === 'password') {
	if (OS_IOS) {
		iosStyle = Ti.UI.iPhone.AlertDialogStyle.SECURE_TEXT_INPUT;
	}
	if (OS_ANDROID) {
		androidView = Alloy.createController('application/alert/androidViewSecure');
	}
} else if (data.style === 'text') {
	if (OS_IOS) {
		iosStyle = Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT;
	}
	if (OS_ANDROID) {
		androidView = Alloy.createController('application/alert/androidViewPlain');
	}
} else {
	if (OS_IOS) {
		iosStyle = Ti.UI.iPhone.AlertDialogStyle.DEFAULT;
	}
	if (OS_ANDROID) {
		androidView = null;
	}
}

if (data.buttons) {
	for (var i = 0, j = data.buttons.length; i < j; i++) {
		var button = data.buttons[i];
		if (button.title) {
			buttonNames.push(Conversion.toString(button.title));
		} else {
			buttonNames.push('???');
		}
		var action = null;
		if (button.onClick) {
			action = {
				type : 'buttonclick',
				request : {
					action : 'onClick',
					type : 'button',
					button : {
						name : Conversion.toString(button.name),
						onClick : button.onClick
					}
				}
			};
		} else {
			action = {
				type : 'none'
			};
		}
		buttonRequests.push(action);
	}
}

if (buttonNames.length === 0) {
	buttonNames.push(L('ok_button'));
	buttonRequests.push({
		type : 'none'
	});
}

$.alertDialog = Ti.UI.createAlertDialog({
	title : Conversion.toString(data.title),
	message : Conversion.toString(data.message),
	buttonNames : buttonNames,
	style : OS_IOS ? iosStyle : undefined,
	androidView : OS_ANDROID && androidView ? androidView.getView() : undefined

});

$.alertDialog.addEventListener('click', function(e) {
	if (e.index >= 0 && e.index < buttonRequests.length) {
		var requestInfo = buttonRequests[e.index];
		if (requestInfo.type === 'buttonclick') {
			if (data.style === 'username_and_password') {
				var username = '';
				var password = '';
				if (OS_IOS) {
					username = e.login;
					password = e.password ? Ti.Utils.base64encode(e.password).toString() : '';
				}
				if (OS_ANDROID) {
					username = androidView.login.value;
					password = androidView.password.value ? Ti.Utils.base64encode(androidView.password.value).toString() : '';
				}
				requestInfo.request.button.fields = [{
					name : 'username',
					type : 'string',
					value : username
				}, {
					name : 'password',
					type : 'password',
					value : password
				}];
			} else if (data.style === 'password') {
				var password = '';
				if (OS_IOS) {
					password = e.text ? Ti.Utils.base64encode(e.text).toString() : '';
				}
				if (OS_ANDROID) {
					password = androidView.text.value ? Ti.Utils.base64encode(androidView.text.value).toString() : '';
				}
				requestInfo.request.button.fields = [{
					name : 'password',
					type : 'password',
					value : password
				}];
			} else if (data.style === 'text') {
				var text = '';
				if (OS_IOS) {
					text = e.text;
				}
				if (OS_ANDROID) {
					text = androidView.text.value;
				}
				requestInfo.request.button.fields = [{
					name : 'text',
					type : 'string',
					value : text
				}];
			}

			connection.sendInfo(requestInfo);
		}
	}
});
exports.show = function() {
	$.alertDialog.show();
};
