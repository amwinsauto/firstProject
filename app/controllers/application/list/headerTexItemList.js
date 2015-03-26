var args = arguments[0] || {};
var list = args.list;
var data = args.data;

var headerView = list.headerView;

// id, view, title, top, left, height, width
addLabel(data.key1header, 85, 70, 'center');
addLabel(data.key2header, 165, 70, 'center');
addLabel(data.key3header, 245, 70, 'center');
addLabel(data.key5header, 325, 70, 'center');
addLabel(data.sizeheader, 405, Ti.UI.SIZE, 'left');
addLabel(data.priceheader, 630, Ti.UI.SIZE, 'left');
headerView.add($.columnsView);
headerView.add($.barView);

function addLabel(title, left, width, align) {
	var text = '';
	if (title) {
		text = title.toString();
	}
	var label = Alloy.createController('application/list/headerLabel').label;
	label.text = text;
	label.left = left;
	label.width = width;
	label.textAlign = align;
	$.columnsView.add(label);
}

function addLabelR(title, right, width) {
	var text = '';
	if (title) {
		text = title.toString();
	}
	var label = Alloy.createController('application/list/headerLabel').label;
	label.text = text;
	label.right = right;
	label.width = width;
	label.textAlign = 'right';
	$.columnsView.add(label);
}
