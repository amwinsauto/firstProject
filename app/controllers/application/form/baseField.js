var SMS = null;
var Conversion = require('tools/Conversion');
var Images = require('Images');

var args = arguments[0] || {};
var form = args.form;
var data = args.data;
var clickableFields = args.clickableFields;

var type = '';
var alias = null;
var required = false;
var persistent = false;
var listlabel = '';
var normalizedTitle = data.title;
if (!normalizedTitle) {
	normalizedTitle = data.hint;
}
if (!normalizedTitle) {
	normalizedTitle = data.name;
}
if (!normalizedTitle) {
	normalizedTitle = 'NONAME';
}

// External fields
$.name = 'name_not_set';
if (data.name) {
	$.name = data.name;
}

if (data.required) {
	required = true;
}

if (data.persistent) {
	persistent = true;
}
if (data.listlabel) {
	listlabel = data.listlabel.toString();;
}

if (data.alias) {
	alias = data.alias;
}

$.geolocation = data.geolocation;

if (data.onChange) {
	$.onChange = data.onChange;
}
if (data.onReturn) {
	$.onReturn = data.onReturn;
}

exports.onToolbarNextClick = function(e) {
	if ($.nextIndex != undefined) {
		form.setFocusByIndex($.nextIndex);
	}
};

exports.onToolbarPreviousClick = function(e) {
	if ($.previousIndex != undefined) {
		form.setFocusByIndex($.previousIndex);
	}
};

exports.onToolbarOkClick = function(e) {
	$.blur();
};

exports.onToolbarCancelClick = function(e) {
	$.blur();
};

exports.getAlias = function() {
	return alias;
};

exports.isFocusAble = function() {
	return false;
};
exports.isRequired = function() {
	return required;
};
exports.isPersistent = function() {
	return persistent;
};
exports.isScanable = function() {
	return false;
};
exports.getListLabel = function() {
	return listlabel;
};

exports.getNormalizedTitle = function() {
	return normalizedTitle;
};

exports.getRow = function() {
	return $.fieldTableViewRow;
};

exports.getLabel = function() {
	if ($.leaderLabel) {
		return $.leaderLabel;
	}
	return null;
};

exports.getType = function() {
	return type;
};

exports.setType = function(newtype) {
	type = newtype;
};

exports.getName = function() {
	return $.name;
};

exports.getColor = function(field, color) {
	if (!color) {
		return '';
	}
	if (field) {
		if (color === 'red') {
			var c = field.egColorRed;
			if (c) {
				return c;
			}
		} else if (color === 'yellow') {
			var c = field.egColorYellow;
			if (c) {
				return c;
			}
		} else if (color === 'green') {
			var c = field.egColorGreen;
			if (c) {
				return c;
			}
		} else if (color === 'blue') {
			var c = field.egColorBlue;
			if (c) {
				return c;
			}
		} else if (color === 'gray') {
			var c = field.egColorGray;
			if (c) {
				return c;
			}
		} else if (color === 'white') {
			var c = field.egColorWhite;
			if (c) {
				return c;
			}
		} else if (color === 'black') {
			var c = field.egColorBlack;
			if (c) {
				return c;
			}
		}
	}
	return color.toString();
};

exports.getValue = function() {
	return '';
};

exports.setValue = function(value) {
};

//exports.update = function(data) {
//};

exports.clear = function() {
	
};

exports.addEventListener = function(name, func) {
};

exports.fireEvent = function(name) {
};

exports.blur = function() {
};

exports.focus = function() {
};

exports.getField = function() {
	return null;
};

exports.createLabel = function(type, title, link, subst) {
	var label = Alloy.createController('application/form/fieldLabel' + type).label;
	$.setLabelTitle(label, title, link, subst);
	return label;
};

exports.setOnClick = function(data) {
	if (data.onClick) {
		$.onClick = data.onClick;
		if (OS_IOS) {
			$.fieldTableViewRow.hasChild = true;
		}
		if (OS_ANDROID) {
			if ($.fieldView && $.clickImageView) {
				$.fieldView.right = parseInt($.clickImageView.width) + parseInt($.clickImageView.right);
				$.clickImageView.visible = true;
			}
		}
		return true;
	} else {
		if (OS_IOS) {
			$.fieldTableViewRow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
			if (clickableFields) {
				$.fieldTableViewRow.hasChild = true;
				$.fieldTableViewRow.rightImage = '/images/core/arrow_right_transparent.png';
			}
		}
		if (OS_ANDROID) {
			$.fieldTableViewRow.backgroundSelectedColor = $.fieldTableViewRow.backgroundColor || 'transparent';
			if (clickableFields && $.fieldView && $.clickImageView) {
				$.fieldView.right = parseInt($.clickImageView.width) + parseInt($.clickImageView.right);
				$.clickImageView.image = '/images/core/arrow_right_transparent.png';
				$.clickImageView.visible = true;
			}
		}
		return false;
	}
};

exports.setLabelTitle = function(label, title, link, subst) {
	if (link) {
		label.touchEnabled = true;
		// Remove spaces
		link  = link.replace(/ /g,'');
	} else {
		label.touchEnabled = false;
	}
	if (title) {
		label.text = Conversion.substituteAll(title, subst);
	} else {
		label.text = '';
	}

	if (link) {
		label.addEventListener('click', function() {
			if (link.length > 4 && link.substr(0, 5) == 'mail:') {
				var emailDialog = Ti.UI.createEmailDialog();
				emailDialog.toRecipients = [link.substr(5, link.length - 5)];
				emailDialog.open();
			} else if (link.length > 3 && link.substr(0, 4) == 'sms:') {
				if (OS_IOS) {
					if (SMS === null) {
						SMS = require('ti.sms');
					}
					var sms = SMS.createSMSDialog({
						animated : true
					});
					sms.toRecipients = [link.substr(4, link.length - 4)];
					sms.open();
				} else if (OS_ANDROID) {
					try {
						var intent = Ti.Android.createIntent({
							action : Ti.Android.ACTION_SENDTO,
							data : 'smsto:' + link.substr(4, link.length - 4)
						});
						Ti.Android.currentActivity.startActivity(intent);
					} catch(e) {
						Ti.API.error(e);
						//alert('No application for ' + type + ' installed!');
						Ti.UI.createNotification({
							message : L('can_not_send_sms')
						}).show();
					}
				}
			} else {
				if (OS_IOS) {
					if (!Ti.Platform.canOpenURL(link)) {
						Ti.API.warn("Can't open url: " + link);
					}
				}
				Ti.Platform.openURL(link);
			}
		});
	}
};
