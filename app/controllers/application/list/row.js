exports.baseController = "application/list/rowBase";

var Conversion = require('tools/Conversion');
var Images = require('Images');

var args = arguments[0] || {};
var list = args.list;

var defaultRowHeight = Conversion.toNumber($.contentView.height);
var padding = Conversion.toNumber($.view.egPadding);
var leftImageController = null;
var optionsView = null;

init(args.data, false);

function init(data, update) {
	if (data.onClick) {
		$.row.hasChild = true;
		// Bug in titanium
		if (OS_IOS) {
			$.view.right = 0;
		}
	}

	$.deleteView.selected = false;
	$.deleteView.idtype = 'deleteview';
	// $.deleteView.left = 0;
	// $.deleteView.width = 0;

	if (data.options && data.options.length > 0) {
		// Otherwise not able to push buttons
		// $.view is touchEnabled = false
		$.contentView.touchEnabled = true;
	}

	var aliasType = 'list';
	if (data.aliastype) {
		aliasType = data.aliastype;
	}
	var leftImage = null;
	if (data.leftimage != undefined) {
		if (!leftImageController) {
			leftImageController = Alloy.createController('application/list/rowImage', {
				image : data.leftimage,
				type : aliasType,
				size : data.leftimagesize
			});
			leftImage = leftImageController.getView();

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

		} else {
			leftImageController.updateImage(data.leftimage, aliasType, data.leftimagesize);
		}
	}

	var top = 0;
	var searchText = '';
	var postFix = '';

	// body
	searchText += Conversion.toString(data.body);
	searchText += Conversion.toString(data.bodyright);
	top += createListItemViewForStandard(top, $.view, data, 'body', '');

	if (data.body == undefined) {
		// Check for single title/titleright
		data.titlefix = true;
		for (var i = 0; i < 5; i++) {
			if (i > 0) {
				postFix = Conversion.toString(i);
			}
			if (i > 0) {
				if (data['title' + postFix] != undefined) {
					data.titlefix = false;
					break;
				}
			}
			if (data['titlebold' + postFix] != undefined) {
				data.titlefix = false;
				break;
			}
			if (data['titleplain' + postFix] != undefined) {
				data.titlefix = false;
				break;
			}
			if (data['titlegray' + postFix] != undefined) {
				data.titlefix = false;
				break;
			}
			if (data['titlesmall' + postFix] != undefined) {
				data.titlefix = false;
				break;
			}
		}
	}

	// title
	postFix = '';
	for (var i = 0; i < 5; i++) {
		if (i > 0) {
			postFix = Conversion.toString(i);
		}
		var title = 'title' + postFix;
		var titleright = 'titleright' + postFix;
		searchText += Conversion.toString(data[title]);
		searchText += Conversion.toString(data[titleright]);
		top += createListItemViewForStandard(top, $.view, data, 'title', postFix);
	}
	postFix = '';
	for (var i = 0; i < 5; i++) {
		if (i > 0) {
			postFix = Conversion.toString(i);
		}
		var title = 'titlebold' + postFix;
		var titleright = 'titleboldright' + postFix;
		searchText += Conversion.toString(data[title]);
		searchText += Conversion.toString(data[titleright]);
		top += createListItemViewForStandard(top, $.view, data, 'titlebold', postFix);
	}
	postFix = '';
	for (var i = 0; i < 5; i++) {
		if (i > 0) {
			postFix = Conversion.toString(i);
		}
		var title = 'titleplain' + postFix;
		var titleright = 'titleplainright' + postFix;
		searchText += Conversion.toString(data[title]);
		searchText += Conversion.toString(data[titleright]);
		top += createListItemViewForStandard(top, $.view, data, 'titleplain', postFix);
	}
	postFix = '';
	for (var i = 0; i < 5; i++) {
		if (i > 0) {
			postFix = Conversion.toString(i);
		}
		var title = 'titlegray' + postFix;
		var titleright = 'titlegrayright' + postFix;
		searchText += Conversion.toString(data[title]);
		searchText += Conversion.toString(data[titleright]);
		top += createListItemViewForStandard(top, $.view, data, 'titlegray', postFix);
	}
	postFix = '';
	for (var i = 0; i < 5; i++) {
		if (i > 0) {
			postFix = Conversion.toString(i);
		}
		var title = 'titlesmall' + postFix;
		var titleright = 'titlesmallright' + postFix;
		searchText += Conversion.toString(data[title]);
		searchText += Conversion.toString(data[titleright]);
		top += createListItemViewForStandard(top, $.view, data, 'titlesmall', postFix);
	}

	// Icons on row
	// var optionsView = null;
	if (!optionsView) {
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
			optionsView.width = optionsViewWidth + 1;
			optionsView.height = optionsViewHeight;
		}
	}

	if (!$.view.children) {
		top = defaultRowHeight;
	}
	$.view.height = top;
	$.setSearchTextOnRow($.row, searchText);

	if (leftImage) {
		var imageWidth = Conversion.toNumber(leftImage.width);
		$.view.left = imageWidth + (Conversion.toNumber(leftImage.left) * 2);
		if (((top + (padding * 2)) > defaultRowHeight) || ((imageWidth/* + padding*/) > defaultRowHeight)) {
			// Image Largest
			if (imageWidth > top) {
				//leftImage.top = padding;
				//leftImage.bottom = padding;
				$.contentView.height = imageWidth + padding;
			} else {
				// Labels view Largest -> set padding
				//$.view.top = padding;
				//$.view.bottom = padding;
				// Place image on top -> set top padding
				leftImage.top = padding;
				$.contentView.height = top + (padding * 2);
			}
		}
		$.contentView.add(leftImage);
	} else {
		//		$.view.top = padding;
		//		$.view.bottom = padding;
		var vHeight = top + (padding * 2);
		if (vHeight > defaultRowHeight) {
			$.contentView.height = vHeight;
		}
	}

	if (optionsView) {
		$.view.right = Conversion.toNumber(optionsView.width) + (Conversion.toNumber(optionsView.left) * 2);
		$.contentView.add(optionsView);
	}

	$.row.deleteView = $.deleteView;
	$.row.rowView = $.contentView;
	$.row.caller = $.view;

	$.setOnClickAction($.row, data, update);
	$.setOnLongClickAction($.row, data, update);
	$.setOnDeleteAction($.row, data, update);
}

function createListItemViewForStandard(top, view, data, titleId, postFix) {

	var title = data[titleId + postFix];
	var titleright = data[titleId + 'right' + postFix];
	if (title == undefined && titleright == undefined) {
		return 0;
	}
	var labelType = 'Title';
	var rightLabelType = 'TitleRight';
	switch(titleId) {
		case 'body':
			labelType = 'Body';
			break;
		case 'title':
			// labelType = 'Title';
			labelType = 'Headline';
			if (data.titlefix) {
				labelType = 'Body';
			}
			break;
		case 'titlebold':
			// labelType = 'TitleBold';
			labelType = 'Headline';
			break;
		case 'titleplain':
			// labelType = 'TitlePlain';
			labelType = 'Subheadline';
			break;
		case 'titlegray':
			// labelType = 'TitleGray';
			labelType = 'Subheadline_2';
			break;
		case 'titlesmall':
			labelType = 'Caption2';
			break;
	}

	var height = 0;
	var labelRight = null;
	if (titleright) {
		labelRight = $.createLabel(rightLabelType, titleright, data[titleId + 'rightlink' + postFix], data[titleId + 'right' + postFix + 'Subst']);
	}
	if (labelRight) {
		height = parseInt(labelRight.height);
		labelRight.top = top;

		var color = $.getColor($.row, data[titleId + 'rightcolor' + postFix]);
		if (color) {
			labelRight.color = color;
		}
	}
	var label = $.createLabel(labelType, title, data[titleId + 'link' + postFix], data[titleId + postFix + 'Subst']);
	if (label) {
		var h = parseInt(label.height);
		if (h > height) {
			height = h;
		}
		label.top = top;
		var color = $.getColor($.row, data[titleId + 'color' + postFix]);
		if (color) {
			label.color = color;
		}
		view.add(label);
	}
	if (labelRight) {
		view.add(labelRight);

		if (label) {
			labelRight.height = label.height;
			labelRight.addEventListener('postlayout', setRight);
		}

	}

	function setRight(e) {
		if (e.source && e.source.rect && e.source.rect.width > 0) {
			labelRight.removeEventListener('postlayout', setRight);
			label.right = e.source.rect.width + parseInt(e.source.right, 10);
		}
	}

	return height;
}

exports.hideDelete = function() {
};

exports.showDelete = function() {
};

exports.switchDeleteSelected = function() {
};

exports.updateRow = function(item) {
	var children = $.view.getChildren();
	var numChildren = children.length;
	for (var i = 0; i < numChildren; i++) {
		$.view.remove(children[i]);
	};

	if (optionsView) {
		$.contentView.remove(optionsView);
		optionsView = null;
	}
	init(item, true);
};
