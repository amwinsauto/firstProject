var args = arguments[0] || {};

var dashboard = args.dashboard;
var updatedAction = args.updatedAction;

var pages = [];
var title = '';
var name = '';

var dirty = false;

exports.init = function() {

	var data = dashboard.toJson();
	name = data.name || '';
	title = data.title || '';

	pages = data.pages || [];

	var sections = [];
	var lastHidden = false;
	for (var i = 0; i < pages.length; i++) {
		section = Alloy.createController('menu/dashboardeditsection', {
			data : pages[i],
			table : $.tableView,
			saveFunction : save
		});
		lastHidden = section.isHidden();
		sections.push(section.getView());
	};
	if (sections.length > 0 && !lastHidden) {
		section = Alloy.createController('menu/dashboardeditsection', {
			data : {
				//name : 'hidden_apps',
				title : L('dashboardedit_hidden_apps'),
				hidden : true
			},
			saveFunction : save
		});
		sections.push(section.getView());
	}
	$.titleLabel.text = title;
	$.tableView.setData(sections);

};

function toJson() {
	var json = {
		name : name,
		title : title,
		devicetype : Alloy.isTable ? 'tablet' : 'handheld',
		pages : []
	};
	var sections = $.tableView.data;
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		var rows = section.getRows();
		if (rows) {
			var page = {
				//name : section.cpName,
				title : section.cpTitle,
				hidden : section.cpHidden ? true : undefined,
				items : []
			};
			for (var y = 0; y < rows.length; y++) {
				var row = rows[y];
				page.items.push({
					name : row.cpName,
					title : row.cpTitle
				});
			};
			json.pages.push(page);
		}
	};
	return json;
}

function save() {
	updatedAction();
	Ti.App.Properties.setObject('dashboard_' + name, toJson());
	Ti.API.info('json: ' + JSON.stringify(toJson(), undefined, 2));
}

function onMove(e) {
	save();
}
