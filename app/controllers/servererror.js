var args = arguments[0] || {};
$.data = args.data;
var enableServersetup = args.enableServersetup;
var exitAction = args.exitAction;

if (Alloy.isHandheld && (enableServersetup || OS_ANDROID)) {
	if (enableServersetup) {
		//$.errorAlertDialog.cancel = 0;
		$.errorAlertDialog.buttonNames = [L('ok_button')];
	} else {
		$.errorAlertDialog.buttonNames = [L('retry_button')];
		$.errorAlertDialog.addEventListener('click', function(e) {
			if (exitAction) {
				exitAction();
			}
		});
	}
} else {
	if (enableServersetup) {
		$.retryButton.visible = false;
	} else {
		$.retryButton.visible = true;
		$.errorView.backgroundImage = $.errorView.egBackgroundImageNoSettings;
		if (Alloy.isTablet) {
			$.errorView.left = undefined;
		}
	}
}

function retryButtonClick(e) {
	if (exitAction) {
		exitAction();
	}
}

exports.show = function(title, message) {
	if (Alloy.isHandheld && (enableServersetup || OS_ANDROID)) {
		$.errorAlertDialog.title = title;
		if (enableServersetup) {
			$.errorAlertDialog.message = message;
		} else {
			$.errorAlertDialog.message = L('check_internet_connection');
		}
		//$.cancel = 0;

		$.errorAlertDialog.show();
	} else {
		$.titleLabel.text = title;
		if (enableServersetup) {
			$.descriptionLabel.text = message;
		} else {
			$.descriptionLabel.text = L('check_internet_connection');
		}
		$.errorView.visible = true;
	}
};

exports.hide = function() {
	//	if (Alloy.isTablet) {
	$.errorView.visible = false;
	//	}
};
