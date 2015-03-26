var args = arguments[0] || {};

var data = args.data || {};
$.row.title = data.title || '';

$.row.onClick = {
	type : 'listclick',
	request : {
		action : 'onClick',
		type : 'listitem',
		listitem : {
			name : data.name,
			onClick : data.onClick
		}
	}
};

