exports.baseController = "application/list/rowBase";

var Conversion = require('tools/Conversion');

var args = arguments[0] || {};
var list = args.list;
var data = args.data;

init(args.data);

function init(data) {

	var searchText = '';

	list.setBackgroundColor($.row.backgroundColor);

	$.row.caller = $.floatingView;

	if (data.comment) {
		$.floatingView.backgroundColor = $.floatingView.egBackgroundColorComment;
	}

	var aliasType = 'list';
	if (data.aliastype) {
		aliasType = data.aliastype;
	}

	// Header leftimage
	if (data.leftimage) {
		var leftImageController = Alloy.createController('application/list/rowImage', {
			image : data.leftimage,
			type : aliasType,
			size : data.leftimagesize
		});
		$.headerView.add(leftImageController.getView());
		if (data.onImageClick) {
			leftImageController.getView().touchEnabled = true;
			leftImageController.getView().onClick = {
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

	// Title
	var titleController = null;
	if (data.title) {
		searchText = $.addSearchText(searchText, Conversion.substituteAll(data.title, data.titleSubst));
		titleController = Alloy.createController('application/list/rowFloatingTitle');
		$.headerView.add(titleController.titleView);
		titleController.title.text = Conversion.substituteAll(data.title, data.titleSubst);
		if (data.onTitleClick) {
			titleController.title.onClick = {
				type : 'titleclick',
				caller : $.row.caller,
				geolocation : data.geolocation,
				request : {
					action : 'onTitleClick',
					type : 'listitem',
					listitem : {
						name : data.name,
						onTitleClick : data.onTitleClick
					}
				}
			};
		}
	}

	// Subtitle
	if (data.subtitle || data.subtitleimage) {
		var subtitleController = Alloy.createController('application/list/rowFloatingSubtitle');
		// Subtitle image
		if (data.subtitleimage) {
			var subtitleImageController = Alloy.createController('application/list/rowFloatingSubTitleImage', {
				image : data.subtitleimage,
				type : aliasType,
				caller : $.row.caller,
				geolocation : data.geolocation,
				onClick : data.onSubtitleClick
			});
			subTitleImage = subtitleImageController.getView();
			subtitleController.subtitleView.add(subTitleImage);
		}

		// Subtitle
		if (data.subtitle) {
			searchText = $.addSearchText(searchText, Conversion.substituteAll(data.subtitle, data.subtitleSubst));
			subtitleController.subtitle.text = Conversion.substituteAll(data.subtitle, data.subtitleSubst);
			subtitleController.subtitleView.add(subtitleController.subtitle);
			if (data.onSubtitleClick) {
				subtitleController.subtitle.onClick = {
					type : 'subtitleclick',
					caller : $.row.caller,
					geolocation : data.geolocation,
					request : {
						action : 'onSubtitleClick',
						type : 'listitem',
						listitem : {
							name : data.name,
							onSubtitleClick : data.onSubtitleClick
						}
					}
				};
			}
		}

		if (titleController) {
			titleController.titleView.add(subtitleController.subtitleView);
		} else {
			$.headerView.add(subtitleController.subtitleView);
		}
	}

	// Body....
	if (data.body) {
		searchText = $.addSearchText(searchText, Conversion.substituteAll(data.body, data.bodySubst));
		$.body.text = Conversion.substituteAll(data.body, data.bodySubst);
	}

	if (data['bodyimage']) {
		var bodyImageController = Alloy.createController('application/list/rowFloatingBodyImage', {
			image : Conversion.toString(data['bodyimage']),
			onClick : data.onBodyImageClick,
			name : data.name,
			geolocation : data.geolocation,
			caller : $.row.caller,
			// Android hack... Needs the width to calculate the height of the ImageView!!!
			//width : OS_ANDROID ? (Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor) - (parseInt($.floatingView.left) * 2): undefined
		});
		bodyImage = bodyImageController.getView();
		//		$.bodyImageView.add(bodyImage);
		$.floatingView.add(bodyImage);
	}

	if (data.footer || data.footertitle) {
		searchText = $.addSearchText(searchText, Conversion.substituteAll(data.footer, data.footerSubst));
		searchText = $.addSearchText(searchText, Conversion.substituteAll(data.footertitle, data.footertitleSubst));
		var footerController = Alloy.createController('application/list/rowFloatingFooter', {
			footer : Conversion.substituteAll(data.footer, data.footerSubst),
			footerTitle : Conversion.substituteAll(data.footertitle, data.footertitleSubst),
			onFooterTitleClick : data.onFooterTitleClick,
			name : data.name,
			caller : $.row.caller,
			geolocation : data.geolocation
		});
		footer = footerController.getView();
		//$.footerView.add(footer);
		$.floatingView.add(footer);
	}

	if (data.options && data.options.length > 0) {
		var optionsController = Alloy.createController('application/list/rowFloatingOptions', {
			options : data.options,
			caller : $.row.caller
		});
		options = optionsController.getView();
		//$.optionsView.add(options);
		$.floatingView.add(options);
	}

	$.setOnClickAction($.row, data, args.row !== undefined);
	$.setOnLongClickAction($.row, data, args.row !== undefined);

	$.row.hasChild = false;
	$.setSearchTextOnRow($.row, searchText);
}
