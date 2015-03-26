var Conversion = require('tools/Conversion');
var args = arguments[0] || {};
var list = args.list;
var data = args.data;
var rowOptions = args.rowOptions;

if (OS_IOS) {
	list.table.separatorStyle = Ti.UI.iPhone.TableViewSeparatorStyle.NONE;
}
var headerView = list.headerView;

if (data.columns && data.columns.length > 0) {

	// var columnPadding = parseInt($.columnsView.left);
	$.columnsView.left = getLeftForHeader();
	$.columnsView.right = getRightForHeader();

	var count = data.columns.length;
	var defaultAlign = 'left';
	var defaultWidth = parseInt((100 / count));

	//	var factor = (99 - ((data.columns.length - 1) * 2)) / 99;
	for (var i = 0; i < data.columns.length; i++) {
		var column = data.columns[i];

		var width = defaultWidth;
		var align = defaultAlign;
		var left = 0;

		var title = '';
		if (column.title) {
			//title = column.title.toString();
			title = Conversion.substituteAll(column.title, column.titleSubst);
		}
		if (column.width && column.width > 0) {
			width = column.width;
		}
		//		width = (width * factor) + '%';
		var margin = 1.5;
		width = (width - margin) + '%';
		if (i > 0) {
			left = margin + '%';
		} else {
			left = (margin / 2) + '%';
		}
		
		if (column.type == 'number') {
			align = 'right';
		}
		if (column.align) {
			align = column.align;
		}

		var label = Alloy.createController('application/list/headerLabel').label;
		label.text = title;
		label.textAlign = align;
		label.width = width;
		//backgroundColor: 'green',
		//left : i > 0 ? columnPadding : 0,
		label.left = left;
		$.columnsView.add(label);
	}
	// headerView.add($.columnsView);
	// headerView.add($.barView);
	headerView.add($.headerColumnsView);
}

function getLeftForHeader() {
	var leftForHeader = $.columnsView.left;
	var items = data.items || data.listitems || [];
	if (items.length > 0) {
		if (items[0].leftimage != undefined) {
			if (items[0].leftimagesize === 'large') {
				leftForHeader = parseInt(leftForHeader) * 2 + 75;
			} else if (items[0].leftimagesize === 'medium') {
				leftForHeader = parseInt(leftForHeader) * 2 + 40;
			} else {
				leftForHeader = parseInt(leftForHeader) * 2 + 25;
			}
			return leftForHeader;
		}
	}

	return leftForHeader;
}

function getRightForHeader() {
	var rightForHeader = $.columnsView.right;

	if (rowOptions.click) {
		if (OS_IOS) {
			rightForHeader += 33;
		} else {
			rightForHeader += 12;
		}
	}
	if (rowOptions.options > 0) {
		rightForHeader += (rowOptions.options * (50 + 1));
	}

	return rightForHeader;
}
