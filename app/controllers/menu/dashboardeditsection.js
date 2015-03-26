var args = arguments[0] || {};

var data = args.data || {};
var saveFunction = args.saveFunction;
var table = args.table;
var items = data.items || [];

var title = data.title || '';
var name = data.name || '';
var hidden = data.hidden ? true : false;

$.tableViewSection.cpName = name;
$.tableViewSection.cpTitle = title;
$.tableViewSection.cpHidden = hidden;

$.headerLabel.text = title;

for (var i = 0; i < items.length; i++) {
	var row = Alloy.createController('menu/dashboardeditrow', {
		saveFunction : saveFunction,
		table : table,
		data : items[i]
	});
	$.tableViewSection.add(row.getView());
};

function onClick(e) {
	if (hidden) {
		return;
	}

	var androidView = null;
	var androidText = null;
	if (OS_ANDROID) {
		androidView = Ti.UI.createView({
			layout : 'vertical'
		});
		androidText = Ti.UI.createTextField({
			top : 30,
			left : 15,
			right : 15
		});
		androidText.value = title;
		androidView.add(androidText);
	}

	var alertDialog = Ti.UI.createAlertDialog({
		title : L('dashboardedit_change_title'),
		message : OS_IOS ? title : undefined,
		buttonNames : [L('ok_button'), L('cancel_button')],
		cancel : 1,
		style : OS_IOS ? Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT : undefined,
		androidView : OS_ANDROID && androidView ? androidView : undefined
	});
	alertDialog.addEventListener('click', function(e) {
		if (e.index == e.source.cancel) {
			return;
		}
		if (OS_IOS) {
			title = e.text;
		}
		if (OS_ANDROID) {
			title = androidText.value;
		}
		$.headerLabel.text = title;
		$.tableViewSection.cpTitle = title;
		saveFunction();
	});
	alertDialog.show();

}

exports.isHidden = function() {
	return hidden;
};
