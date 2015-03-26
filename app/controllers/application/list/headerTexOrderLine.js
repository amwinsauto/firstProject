var args = arguments[0] || {};
var list = args.list;
var data = args.data;

var headerView = list.headerView;

// id, view, title, top, left, height, width
addLabel(data.itemheader, 10);
addLabel(data.colorheader, 325);
addLabelR(data.countheader, 195 + 20);
addLabelR(data.priceheader, 110 + 20);
addLabelR(data.totalpriceheader, 15 + 20);
headerView.add($.columnsView);
headerView.add($.barView);

function addLabel(title, left) {
	var text = '';
	if (title) {
		text = title.toString();
	}
	var label = Alloy.createController('application/list/headerLabel').label;
	label.text = text;
	label.left = left;
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
	label.textAlign = 'right';
	$.columnsView.add(label);
}
