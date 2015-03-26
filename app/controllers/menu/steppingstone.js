//var Connection = require('Connection');
var ResponseUtils = require('ResponseUtils');
var args = arguments[0] || {};
var callConnection = args.connection;
var rowClickAction = args.rowClickAction;

//var connection = new Connection($);
var connection = Alloy.createController('ServerConnection', {
	callback : $
});
connection.setAppSesId(callConnection.getAppSesId());

var screenHeight = Ti.Platform.displayCaps.platformHeight;
if (OS_ANDROID) {
	screenHeight = Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor;
}
var maxTableHeight = screenHeight - parseInt($.toolbarView.height, 10);
var rowHeight = parseInt($.tableView.rowHeight, 10);

exports.init = function(data) {
	// call for rows;
	connection.sendInfo(data);
};

function fillTable(data) {
	Ti.API.info("Fill: " + JSON.stringify(data));
	var title = data.title || '';
	var items = data.items || [];

	$.titleLabel.text = title;

	var rows = [];
	var totalRowHeight = 0;
	for (var i = 0; i < items.length; i++) {
		var rowController = Alloy.createController('menu/steppingstonerow', {
			data : items[i]
		});
		rows.push(rowController.getView());
		totalRowHeight += rowHeight;
	};

	if (rows.length > 0) {
		if ((totalRowHeight + rowHeight) < maxTableHeight) {
			var fillerHeight = (maxTableHeight - totalRowHeight) / 2;
			var fillerStart = Ti.UI.createTableViewRow({
				height : fillerHeight,
				selectedBackgroundColor: OS_ANDROID ?'transparent': undefined,
				selectionStyle : OS_IOS ? Ti.UI.iPhone.TableViewCellSelectionStyle.NONE: undefined
			});
			var fillerEnd = Ti.UI.createTableViewRow({
				height : fillerHeight + 1,
				selectedBackgroundColor: OS_ANDROID ?'transparent': undefined,
				selectionStyle : OS_IOS ? Ti.UI.iPhone.TableViewCellSelectionStyle.NONE: undefined
			});
			rows.splice(0, 0, fillerStart);
			rows.push(fillerEnd);
			$.tableView.scrollable = false;
		}
		$.tableView.setData(rows);
		$.tableView.visible = true;
	}

}

function onTableClick(e) {
	if (rowClickAction && e.row && e.row.onClick) {
		rowClickAction(e.row.onClick);
	}
}

exports.handleResponse = function(response) {
	var responses = [];
	if (_.isArray(response)) {
		responses = response;
	} else if (response.type === 'actions') {
		responses = response.actions || [];
	} else {
		responses = [response];
	}
	_.each(responses, $.handleAction);
};

exports.handleAction = function(response) {
	if (response.error) {
		var errorinfo = response.errorinfo || {};
		Ti.UI.createAlertDialog({
			message : errorinfo.errortext
		}).show();
		return;
	}
	switch(ResponseUtils.getType(response)) {
	case 'list':
		fillTable(ResponseUtils.getObject(response));
		break;
	}
};

exports.handleError = function(message, desc) {
	//alert(desc);
	Ti.UI.createAlertDialog({
		message : desc
	}).show();

};
