exports.baseController = "application/list/rowBase";

var Conversion = require('tools/Conversion');
var Images = require('Images');

var args = arguments[0] || {};
var list = args.list;
var data = args.data;
var rowOptions = args.rowOptions;

var aliases = [];

if (data.aliases) {
	aliases = data.aliases;
}

if (args.row) {
	$.row = args.row;
	$.deleteView = $.row.deleteView;
	$.contentView = $.row.rowView;
	$.view = $.contentView.getChildren()[0];
	var children = $.view.getChildren();
	var numChildren = children.length;
	for (var i = 0; i < numChildren; i++) {
		$.view.remove(children[i]);
	};
}

if (!data.onClick && rowOptions.click) {
	if (OS_IOS) {
		$.view.right += 33;
	} else {
		$.view.right += 12;
	}

}

$.deleteView.selected = false;
$.deleteView.idtype = 'deleteview';

if (data.options && data.options.length > 0) {
	// Otherwise not able to push buttons
	// $.view is touchEnabled = false
	$.contentView.touchEnabled = true;
}

var padding = Conversion.toNumber($.view.left);
var aliasType = 'list';
if (data.aliastype) {
	aliasType = data.aliastype;
}
var leftImage = null;
if (data.leftimage != undefined) {
	leftImage = Alloy.createController('application/list/rowImage', {
		list : list,
		row : $,
		image : data.leftimage,
		type : aliasType,
		size : data.leftimagesize
	}).getView();

	if (data.onImageClick) {
		leftImage.touchEnabled = true;
		leftImage.onClick = {
			type : 'imageclick',
			caller : $.row.caller,
			geolocation : data.geolocation,
			request : {
				action : 'onImageClick',
				type : 'listitem',
				listitem : {
					name : data.name,
					onImageClick : data.onImageClick
				}
			}
		};
	}

}

var top = 0;
var searchText = '';
var lines = [];
var columns = data.columns;
for (var i = 0; i < columns.length; i++) {
	var lineNo = parseInt(columns[i].line);
	if (!lineNo) {
		lineNo = 0;
	}
	if (!lines[lineNo]) {
		lines[lineNo] = [];
	}
	lines[lineNo].push(columns[i]);
};

for (var i = 0; i < lines.length; i++) {
	if (lines[i]) {
		//Ti.API.info('line: ' + i);
		top += createListItemViewForStandard(top, list, lines[i], $.view);
	}
}

// Icons on row
var optionsView = null;
if (data.options && data.options.length > 0) {
	var optionsViewWidth = 0;
	var optionsViewHeight = 0;
	optionsView = Ti.UI.createView({
		right : 0,
		layout : 'horizontal',
	});
	for (var i = 0; i < data.options.length; i++) {
		var option = data.options[i];

		var optionController = Alloy.createController('application/list/rowOptionButton');
		var optionSeperator = optionController.seperatorView;
		optionsView.add(optionSeperator);
		optionsViewWidth += parseInt(optionSeperator.width);

		var optionButton = optionController.button;
		optionButton.title = option.title ? option.title : undefined;
		if (OS_IOS) {
			optionButton.image = option.image ? Images.getImage(option.image, 'option') : undefined;
		}
		if (OS_ANDROID) {
			optionButton.backgroundImage = option.image ? Images.getImage(option.image, 'option') : undefined;
		}
		optionsView.add(optionButton);
		optionsViewWidth += parseInt(optionButton.width);
		if (optionsViewHeight < parseInt(optionButton.height)) {
			optionsViewHeight = parseInt(optionButton.height);
		}

		if (option.onClick) {
			optionButton.onClick = {
				type : 'buttonclick',
				caller : optionButton,
				geolocation : option.geolocation,
				request : {
					action : 'onClick',
					type : 'button',
					button : {
						name : option.name,
						onClick : option.onClick
					}
				}
			};
		}
	}
	optionsView.width = optionsViewWidth;
	optionsView.height = optionsViewHeight;
}

if (!$.view.children) {
	$.view.height = 30;
} else {
	$.view.height = top;
}
$.setSearchTextOnRow($.row, searchText);

if (leftImage) {
	leftImage.left = $.view.left;
	leftImage.right = $.view.left;
	$.view.left = Conversion.toNumber(leftImage.width) + (Conversion.toNumber(leftImage.left) * 2);

	// Image Largest
	if (leftImage.width > top) {
		leftImage.top = padding;
		leftImage.bottom = padding;
		$.contentView.height = Conversion.toNumber(leftImage.width) + (padding * 2);
	} else {
		// Labels view Largest -> set padding
		$.view.top = padding;
		$.view.bottom = padding;
		// Place image on top -> set top padding
		leftImage.top = padding;
		$.contentView.height = Conversion.toNumber($.view.height) + (padding * 2);
	}
	$.contentView.add(leftImage);
} else {
	$.view.top = padding;
	$.view.bottom = padding;
	$.contentView.height = Conversion.toNumber($.view.height) + (padding * 2);
}

if (rowOptions.options > 0) {
	$.view.right += (rowOptions.options * (50 + 1));
}

if (optionsView) {
	$.contentView.add(optionsView);
}

$.row.deleteView = $.deleteView;
$.row.rowView = $.contentView;
$.row.caller = $.view;

$.setOnClickAction($.row, data, args.row !== undefined);
$.setOnLongClickAction($.row, data, args.row !== undefined);
$.setOnDeleteAction($.row, data, args.row !== undefined);

function createListItemViewForStandard(top, list, columns, view) {

	if (!columns || columns.length < 1) {
		return 30;
	}

	var line = Ti.UI.createView({
		layout : 'horizontal',
		top : top,
		touchEnabled : false,
		focusable : false
	});

	var columnPadding = parseInt(view.left);
	var count = columns.length;
	var defaultWidth = parseInt((100 / count));
	var height = 0;

	for (var i = 0; i < columns.length; i++) {

		var jss = '';
		var width = defaultWidth;
		var align = 'left';
		var style = '';
		var showThousandSeparator = false;
		var decimals = 0;
		var alias = null;
		var color = null;
		var left = 0;

		var defColumn = {};
		if (list.columns && i < list.columns.length) {
			defColumn = list.columns[i];
		}

		var column = columns[i];

		if (column.width && column.width > 0) {
			width = column.width;
		} else if (defColumn.width && defColumn.width > 0) {
			width = defColumn.width;
		}
		var margin = 1.5;
		width = (width - margin) + '%';
		if (i > 0) {
			left = margin + '%';
		} else {
			left = (margin / 2) + '%';
		}

		var type = null;
		if (column.type) {
			type = column.type;
		} else if (defColumn.type) {
			type = defColumn.type;
		}

		if (type == 'number') {
			align = 'right';
		}

		if (column.align) {
			align = column.align;
		} else if (defColumn.align) {
			align = defColumn.align;
		}

		if (column.showthousandseparator != undefined) {
			if (column.showthousandseparator == true) {
				showThousandSeparator = true;
			}
		} else if (defColumn.showthousandseparator != undefined) {
			if (defColumn.showthousandseparator == true) {
				showThousandSeparator = true;
			}
		}
		if (column.decimals) {
			decimals = column.decimals;
		} else if (defColumn && defColumn.decimals) {
			decimals = defColumn.decimals;
		}

		if (column.color) {
			color = column.color;
		} else if (defColumn.color) {
			color = defColumn.color;
		}

		if (column.style) {
			style = column.style;
		} else if (defColumn.style) {
			style = defColumn.style;
		}

		if (!style) {
//			jss = 'Title';
			jss = 'TitlePlain';
		} else if (style === 'plain') {
			jss = 'TitlePlain';
		} else if (style === 'bold') {
			jss = 'TitleBold';
		} else if (style === 'gray') {
			jss = 'TitleGray';
		} else {
			jss = 'Title';
		}

		if (column.alias) {
			alias = column.alias;
		} else if (defColumn.alias) {
			alias = defColumn.alias;
		}
		var value = '';
		if (column.value != undefined) {
			value = column.value;
		}

		if (alias) {
			aliases.push({
				name : alias,
				value : value
			});
		}

		if (type === 'image') {
			var image = Alloy.createController('application/list/rowImage', {
				list : list,
				row : $,
				image : value,
				type : 'list',
				size : 'large'
			}).getView();
			image.left = 0;
			image.width = width;
			var tempHeight = parseInt(image.height);
			if (tempHeight > height) {
				height = tempHeight;
			}
			line.add(image);
		} else {
			if (type === 'number') {
				value = Conversion.toDisplayNumber(value, decimals, showThousandSeparator, true);
			} else if (type === 'date') {
				value = Conversion.toDisplayDate(value);
			} else if (type === 'time') {
				value = Conversion.toDisplayTime(value);
			} else {
				value = value.toString();
			}
			var label = $.createLabel(jss, value);
			searchText = $.addSearchText(searchText, value);
			color = $.getColor($.row, color);
			if (color) {
				label.color = color;
			}

			label.textAlign = align;
			label.width = width;
			label.left = left;
			var tempHeight = parseInt(label.height);
			if (tempHeight > height) {
				height = tempHeight;
			}
			line.add(label);
		}
	}

	view.add(line);
	return height;
}

exports.getAliases = function() {
	if (aliases) {
		return aliases;
	}
	return [];
};

exports.hideDelete = function() {
};

exports.showDelete = function() {
};

exports.switchDeleteSelected = function() {
};
