var Conversion = require('tools/Conversion');
var Images = require('Images');
var SMS = null;

var args = arguments[0] || {};
var data = args.data;
$.name = data.name;

exports.getAliases = function() {
	if (data.aliases) {
		return data.aliases;
	}
	return [];
};

exports.addSearchText = function(org, text) {
	if (!text) {
		return org;
	}
	return org + ' ' + text.toString();
};

exports.hideDelete = function() {
};

exports.showDelete = function() {
};

exports.switchDeleteSelected = function() {
};

exports.setOnDeleteAction = function(row, item, update) {
	if (item.onDelete) {
		row.editable = true;
		row.onDelete = {
			type : 'listdelete',
			geolocation : item.geolocation,
			request : {
				action : 'onDelete',
				type : 'listitem',
				listitem : {
					name : item.name,
					onDelete : item.onDelete
				}
			}
		};
	} else if (!update) {
		row.editable = false;
	}
};

exports.setSearchTextOnRow = function(row, searchText) {
	if (OS_IOS) {
		// Only on IOS since Android do not support other than default "title" as filter attribute
		row.searchText = searchText;
	} else {
		row.title = searchText;
	}
};

exports.setOnClickAction = function(row, item, update) {
	if (item.onClick) {
		row.hasChild = true;
		if (OS_ANDROID) {
			row.rightImage = Images.getImage('ARROW_RIGHT', 'core');
		}
		row.onClick = {
			type : 'listclick',
			caller : row.caller,
			geolocation : item.geolocation,
			request : {
				action : 'onClick',
				type : 'listitem',
				listitem : {
					name : item.name,
					onClick : item.onClick
				}
			}
		};
	} else if (!update) {
		row.hasChild = false;
	}
};

exports.setOnLongClickAction = function(row, item, update) {
	if (item.onLongClick) {
		row.onLongClick = {
			type : 'listclick',
			caller : row.caller,
			geolocation : item.geolocation,
			request : {
				action : 'onLongClick',
				type : 'listitem',
				listitem : {
					name : item.name,
					onLongClick : item.onLongClick
				}
			}
		};
	}
};

exports.createLabel = function(type, title, link, subst) {
	var label = Alloy.createController('application/list/rowLabel' + type).label;
	$.setLabelTitle(label, title, link, subst);
	return label;
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
		label.text = Conversion.substituteAll(title, subst); //title.toString();
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
					var intent = Ti.Android.createIntent({
						action : Ti.Android.ACTION_SENDTO,
						data : 'smsto:' + link.substr(4, link.length - 4)
					});
					try {
						Ti.Android.currentActivity.startActivity(intent);
					} catch (ActivityNotFoundException) {
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


