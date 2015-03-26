var debug = false;
var busyDelay = 500;
var Log = require('tools/Log');
var defaultTitle = L('busy_loading_label');
var tempTitle = null;
var visible = false;
var started = false;
var progressBarEnabled = false;
var busyCall = null;

var opening= false;
var closed = false;

var $ = this;

var parentView = null;
if (OS_ANDROID) {
	busyDelay = 0;
}

exports.start = function(message, parent) {
	parentView = parent || null;
	if (!visible) {
		visible = true;
		if (OS_IOS) {
			if (parentView) {
				parentView.add($.busyView);
			} else {
				opening = true;
				$.busyWindow.open({
					animated : false
				});
			}
		}
		busyCall = setTimeout(function(e) {
			Log.debug('Start busy', debug);
			if (visible) {
				var busyMessage = defaultTitle;
				if (tempTitle) {
					busyMessage = tempTitle;
				}
				if (message) {
					busyMessage = message.toString();
				}

				if (OS_IOS) {
					$.busyLabel.text = busyMessage;
					$.busyImageView.visible = true;
				} else {
					$.busyActivityIndicator.message = busyMessage;
				}

				started = true;
				$.busyActivityIndicator.show();
				if (OS_IOS) {
					if (progressBarEnabled) {
						$.busyProgressBar.show();
					}
				}
			}
		}, busyDelay);
	}
};
exports.stop = function() {
	if (visible) {
		Log.debug('Stop busy', debug);
		tempTitle = null;

		if (busyCall) {
			clearTimeout(busyCall);
		}

		if (OS_IOS) {
			if ($.busyImageView.visible) {
				$.busyImageView.visible = false;
				$.busyActivityIndicator.hide();
				if (progressBarEnabled) {
					$.busyProgressBar.hide();
					progressBarEnabled = false;
				}
			}
			if (parentView) {
				parentView.remove($.busyView);
				parentView = null;
			} else {
				if (opening) {
					closed = true;
					return;
				}
				$.busyWindow.close({
					animated : false
				});
			}
		} else {
			if (started) {
				started = false;
				$.busyActivityIndicator.hide();
			}

		}
		visible = false;
	}
};

function onOpen(e) {
	opening = false;
	if (closed) {
		$.stop();
	}
}

exports.setTitle = function(title) {
	//	defaultTitle = title;
	tempTitle = title;
};

exports.enableProgressBar = function() {
	progressBarEnabled = true;
};

exports.updateProgressBar = function(value) {
	if (OS_IOS) {
		$.busyProgressBar.value = value;
	}
};

