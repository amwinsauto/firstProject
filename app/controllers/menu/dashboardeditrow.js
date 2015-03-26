var args = arguments[0] || {};
var saveFunction = args.saveFunction;
var table = args.table;

var direction = 'none';

var data = args.data || {};

var title = data.title || '';
if (OS_IOS) {
	$.tableViewRow.title = title;
}

if (OS_ANDROID) {
	$.title.text = title;
}

$.tableViewRow.cpName = data.name || '';
$.tableViewRow.cpTitle = title;

if (OS_ANDROID) {
	$.tableViewRow.addEventListener('click', onClick);
}

function onClick(e) {
	var d = direction;
	direction = 'none';
	Ti.API.info('Direction ' + d + ' index ' + e.index);

	if (d === 'up') {
		if (e.index === 0) {
			// Already first row in table
			return;
		}
		var row = Alloy.createController('menu/dashboardeditrow', {
			saveFunction : saveFunction,
			table : table,
			data : data
		}).getView();

		if (_.first(e.section.rows) == e.row) {
			// First row in section -> move to above section
			table.insertRowAfter(e.index - 1, row);
		} else {
			table.insertRowBefore(e.index - 1, row);
		}
		table.deleteRow(e.row);
		saveFunction();
	} else if (d === 'down') {

		if (_.last(e.section.rows) === e.row) {
			var nextSection = getNextSection(e.section);
			if (nextSection) {
				var row = Alloy.createController('menu/dashboardeditrow', {
					saveFunction : saveFunction,
					table : table,
					data : data
				}).getView();
				if (nextSection.rowCount == 0) {
					table.appendRow(row);
				} else {
					table.insertRowBefore(e.index + 1, row);
				}
				table.deleteRow(e.row);
			}
		} else {
			var row = Alloy.createController('menu/dashboardeditrow', {
				saveFunction : saveFunction,
				table : table,
				data : data
			}).getView();
			table.insertRowAfter(e.index + 1, row);
			table.deleteRow(e.row);
		}
		saveFunction();
	}
}

function getNextSection(section) {
	if (_.last(table.sections) === section) {
		return null;
	};
	var index = _.indexOf(table.sections, section);
	if (index > -1) {
		return table.sections[index + 1];
	}
	return null;
}

function onUpClick(e) {
	direction = 'up';
}

function onDownClick(e) {
	direction = 'down';
}

//$.title.text = data.title ||'';

//$.description.text = '';
