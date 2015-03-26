var args = arguments[0] || {};

//var data = args.data || {};

var title = args.title || '';
var name = args.name || 'no_name';
var hidden = args.hidden ? true: false;
var itemControllers = [];

//$.title.text = title;

exports.addItem = function(item) {
	itemControllers.push(item);
	$.page.add(item.getView());
};

exports.toJson = function() {
	var data = {
		title : title,
		name : name,
		hidden: hidden,
		items : []
	};
	for (var i = 0; i < itemControllers.length; i++) {
		data.items.push(itemControllers[i].toJson());
	};

	return data;
};

exports.getTitle = function() {
	return title;
}; 

exports.isHidden = function() {
	return hidden;
}; 
