var args = arguments[0] || {};
var menu = args.menu;

var items = [];
for (var i = 0; i < Alloy.Globals.applicationStack.length; i++) {
	var item = Alloy.createController('menu/applicationswitcheritem', {
		application : Alloy.Globals.applicationStack[i],
		menu : menu
	});
	items.push(item);
	$.contentView.add(item.getView());
};
