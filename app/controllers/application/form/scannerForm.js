var CFG = require('alloy').CFG;
var Images = require('Images');
var Log = require('tools/Log');
var Cache = require('Cache');
var cache = new Cache();

var debug = false;

var args = arguments[0] || {};
var data = args.data;
var window = args.window;
var controller = window.getController();
var connection = controller.getConnection();
var application = controller.getApplication();
var dataFields = [];
var scannedItems = [];
var isPopover = false;
var offlinedata = data.offlinedata;

if (Alloy.Globals.hardwareScanner) {
	Alloy.Globals.hardwareScanner.reset();
}

var keyboardToolbar = null;
if (OS_IOS) {
	if (controller.isKeyboardToolbarEnabled()) {
		keyboardToolbar = Alloy.createController('application/form/keyboardToolbar', {
			form : $
		});
	}
}

if (OS_ANDROID) {
	//	window.setOrientationModes([Ti.UI.PORTRAIT]);
	//window.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}
if (OS_IOS) {
	//	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT]);
	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}

if (controller.isPopover) {
	isPopover = true;
}

if (OS_IOS) {
	$.formView.addEventListener('click', function(e) {
		Log.debug('Form.onClick bluring fields:' + dataFields.length, debug);
		for (var i = 0, c1 = dataFields.length; i < c1; ++i) {
			if (dataFields[i].blur) {
				dataFields[i].blur();
			}
		}
	});
} else {
	//	window.getWindow().softKeyboardOnFocus = Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
	//	window.getWindow().windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;
}

// Prepare data

exports.init = function(newdata) {
	data = newdata;
	var sections = data.sections || [];
	var buttons = data.buttons || [];

	var formTemplate = 0;
	// if (data.layout) {
	// formTemplate = data.layout;
	// } else if (data.template) {
	// formTemplate = data.template;
	// }
	// if (Alloy.isHandheld) {
	formTemplate = '1';
	// }

	var formStyle = '';
	if (data.style) {
		formStyle = data.style;
	}

	if (data.listtitle) {
		$.itemsHeaderTitle.text = data.listtitle.toString().toUpperCase();
	}

	var sectionholders = createFormSectionHolders($.contentScrollView, formTemplate);

	// Sections
	for (var i = 0, c1 = sections.length; i < c1; ++i) {
		var firstField = true;
		var section = sections[i];
		var fields = section.fields || [];
		var tableRows = [];
		var sectionHeight = 0;

		if (Alloy.isTablet && section.fillers) {
			fields.push({
				type : 'filler',
				height : section.fillers
			});
		}

		var sectionHolder = sectionholders[0];
		// if (section.position) {
		// if (section.position < sectionholders.length) {
		// sectionHolder = sectionholders[section.position];
		// }
		// }

		// if (controller.type === 'top' && section.width) {
		// sectionHolder.width = section.width;
		// }

		// if (OS_ANDROID) {
		// var sectionView = Alloy.createController('application/form/section', {
		// form : $,
		// data : section
		// }).getView();
		// }

		// if (OS_IOS) {
		var sectionController = Alloy.createController('application/form/section', {
			form : $,
			data : section
		});
		var sectionView = sectionController.getView();
		// }

		var sectionTitle = createFormSectionHeader(section);
		if (sectionTitle) {
			if (OS_ANDROID) {
				sectionView.add(sectionTitle.getView());
			}
			if (OS_IOS) {
				sectionHolder.add(sectionTitle.getView());
			}
		}

		// Check if any clickable fields
		var clickableFields = false;
		_.each(fields, function(field, index, list) {
			if (field && field.onClick && field.type != 'button') {
				clickableFields = true;
			}
		});

		// Fields
		for (var y = 0, c2 = fields.length; y < c2; ++y) {
			var field = section.fields[y];
			if (!field) {
				continue;
			}

			if (Alloy.isHandheld) {
				if (field.type === 'filler') {
					continue;
				}
			}

			var tableRow = createTableRowWithField(section, field, clickableFields, sectionView);
			if (!field.hidden) {
				if (OS_ANDROID) {
					if (firstField) {
						tableRow.top = 0;
					}
					firstField = false;
					if (section.layout === 'transparent' || section.layout === 'none') {
						tableRow.backgroundColor = 'transparent';
					}
					sectionView.add(tableRow);
				}
				if (OS_IOS) {
					tableRows.push(tableRow);
				}

			}
		}
		if (OS_IOS) {
			// var sectionController = Alloy.createController('application/form/section', {
			// form : $,
			// data : section
			// });
			// var sectionView = sectionController.getView();
			if (tableRows.length > 0) {
				if (sectionController.bottomSeparator) {
					tableRows[tableRows.length - 1].add(sectionController.bottomSeparator);
				}
			}
			sectionView.data = tableRows;
		}
		addSectionToSectionHolder(sectionHolder, sectionView);
	}

	// Set next events on fields
	addIndexesToFields(dataFields);
	addEventsToFields(connection, dataFields);
	addOnReturnEventSpecial(dataFields);

	loadData();

	window.setButtonsAndTitleOnWindow($.formView, data, 'scannerform', scannedItems);
};

// Named onDestroy because >destroy< is an alloy standard function
exports.onDestroy = function() {
	if (Alloy.Globals.hardwareScanner) {
		Alloy.Globals.hardwareScanner.reset();
	}
};

exports.isNarrow = function() {
	return window.isNarrow();
};

function createTableRowWithField(sectionData, fieldData, clickableFields, sectionView) {

	var fieldController = 'application/form/textField';
	if (fieldData.type === 'template' || fieldData.template) {
		if (fieldData.template === 'texOrderLine') {
			fieldController = 'application/form/templateTexOrderLineField';
		} else {
			fieldController = 'application/form/templateField';
		}
	} else if (fieldData.type === 'label') {
		fieldController = 'application/form/labelField';
	} else if (fieldData.type === 'string') {
		fieldController = 'application/form/textField';
	} else if (fieldData.type === 'number' || fieldData.type === 'integer' || fieldData.type === 'decimal') {
		fieldController = 'application/form/numberField';
	} else if (fieldData.type === 'picker') {
		fieldController = 'application/form/pickerField';
	} else if (fieldData.type === 'date') {
		fieldController = 'application/form/dateField';
	} else if (fieldData.type === 'time') {
		fieldController = 'application/form/timeField';
	} else if (fieldData.type === 'month') {
		fieldController = 'application/form/monthField';
	} else if (fieldData.type === 'button') {
		fieldController = 'application/form/buttonField';
	} else if (fieldData.type === 'textarea') {
		fieldController = 'application/form/textAreaField';
	} else if (fieldData.type === 'signature') {
		fieldController = 'application/form/signatureField';
	} else if (fieldData.type === 'slider') {
		fieldController = 'application/form/sliderField';
	} else if (fieldData.type === 'checkbox') {
		fieldController = 'application/form/switchField';
	} else if (fieldData.type === 'image') {
		fieldController = 'application/form/imageField';
	} else if (fieldData.type === 'filler') {
		fieldController = 'application/form/fillerField';
	} else if (fieldData.type === 'chart') {
		//		if (OS_ANDROID || fieldData.chart2) {
		fieldController = 'application/form/chartField2';
		//		} else {
		//			fieldController = 'application/form/chartField';
		//		}
	} else if (fieldData.type === 'chart2') {
		fieldController = 'application/form/chartField2';
	} else {
		fieldController = 'application/form/textField';
	}

	var field = Alloy.createController(fieldController, {
		form : $,
		keyboardToolbar : keyboardToolbar,
		data : fieldData,
		sectionData : sectionData,
		sectionView : sectionView,
		clickableFields : clickableFields
	});

	if (fieldData.type === 'filler') {
		return field.getRow();
	}

	if (Alloy.Globals.hardwareScanner && field.isScanable()) {
		Alloy.Globals.hardwareScanner.addScanableField(field);
	}

	dataFields.push(field);
	// Set initial focus field
	if (field.getName() === data.initialfocus || field.getName() === data.focus) {
		window.setInitialFocus(field);
	}

	return field.getRow();
}

exports.setFocusField = function(field) {
	if (Alloy.Globals.hardwareScanner) {
		Alloy.Globals.hardwareScanner.setFocusField(field);
	}
};

exports.isInPopover = function() {
	if (controller.isPopover) {
		return true;
	}
	return false;
};
exports.isInPopup = function() {
	if (controller.isPopup) {
		return true;
	}
	return false;
};

exports.getConnection = function() {
	return connection;
};

exports.getWindow = function() {
	return window;
};

exports.update = function(request, response) {
	for (var i = 0; i < response.sections.length; i++) {
		var section = response.sections[i];
		for (var j = 0; j < section.fields.length; j++) {
			var field = section.fields[j];
			for (var k = 0; k < dataFields.length; k++) {
				var uiField = dataFields[k];
				if (uiField.getName() === field.name) {
					if (uiField.setValue) {
						uiField.setValue(field.value);
					}
				}
			}
		}
	}
};

function createFormSectionHeader(section) {

	if (section.template === 'texOrderLine') {
		return Alloy.createController('application/form/sectionHeaderTexOrderLine', {
			form : $,
			data : section
		});
	}

	//	if (section.title) {
	return Alloy.createController('application/form/sectionHeader', {
		form : $,
		data : section
	});
	//	}

	// if (OS_IOS && Alloy.CFG.theme === 'ios7') {
	// return Alloy.createController('application/form/sectionHeader', {
	// form : $,
	// data : section
	// });
	// }

	return null;
}

function createFormSectionHolders(view, layout) {

	var sectionHolders = [];
	var sectionLayout = '1';
	if (layout) {
		sectionLayout = layout;
	}

	if (controller.type === 'top') {
		switch(sectionLayout) {
			case '1' :
				var mv = Ti.UI.createView({
					top : 0,
					left : 0,
					width : '100%',
					height : '100%',
				});
				sectionHolders.push(mv);
				view.add(mv);
				return sectionHolders;
			case '2':
				var mv = Ti.UI.createView({
					top : 0,
					left : 0,
					width : '100%',
					height : '100%',
					layout : 'horizontal'
				});
				for (var i = 0; i < 2; i++) {
					var v1 = Ti.UI.createView({
						top : 0,
						left : 0,
						bottom : 0,
						width : '50%'
					});
					sectionHolders.push(v1);
					mv.add(v1);
				}
				view.add(mv);
				return sectionHolders;
			case '3':
				var mv = Ti.UI.createView({
					top : 0,
					left : 0,
					width : '100%',
					height : '100%',
					layout : 'horizontal'
				});
				for (var i = 0; i < 3; i++) {
					var v1 = Ti.UI.createView({
						top : 0,
						left : 0,
						bottom : 0,
						width : '33%'
					});
					sectionHolders.push(v1);
					mv.add(v1);
				}
				view.add(mv);
				return sectionHolders;
			case '4':
				var mv = Ti.UI.createView({
					top : 0,
					left : 0,
					width : '100%',
					height : '100%',
					layout : 'horizontal'
				});
				for (var i = 0; i < 4; i++) {
					var v1 = Ti.UI.createView({
						top : 0,
						left : 0,
						bottom : 0,
						width : '25%'
					});
					sectionHolders.push(v1);
					mv.add(v1);
				}
				view.add(mv);
				return sectionHolders;
			case '5':
				var mv = Ti.UI.createView({
					top : 0,
					left : 0,
					width : '100%',
					height : '100%',
					layout : 'horizontal'
				});
				for (var i = 0; i < 5; i++) {
					var v1 = Ti.UI.createView({
						top : 0,
						left : 0,
						bottom : 0,
						width : '20%'
					});
					sectionHolders.push(v1);
					mv.add(v1);
				}
				view.add(mv);
				return sectionHolders;
		}
	}

	switch(sectionLayout) {
		case '1' :
			// -------
			// |     |
			// |  0  | Position 0
			// |     |
			// -------
			addWideSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '2':
			// -------
			// |  |  |
			// |0 | 1| Position 0 and 1
			// |  |  |
			// -------
			addSplitSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '1.1':
			// -------
			// |  0  |
			// -------
			// |  1  |
			// -------
			addWideSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '1.2':
			// -------
			// |  0  |
			// -------
			// |1 | 2|
			// -------
			addWideSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '2.1':
			// -------
			// |0 | 1|
			// -------
			// |  2  |
			// -------
			addSplitSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '2.2':
			// -------
			// |0 | 1|
			// -------
			// |2 | 3|
			// -------
			addSplitSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '1.1.1':
			// -------
			// |  0  |
			// -------
			// |  1  |
			// -------
			// |  2  |
			// -------
			addWideSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '1.1.2':
			// -------
			// |  0  |
			// -------
			// |  1  |
			// -------
			// |2 | 3|
			// -------
			addWideSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '1.2.1':
			// -------
			// |  0  |
			// -------
			// |1 | 2|
			// -------
			// |  3  |
			// -------
			addWideSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '2.1.1':
			// -------
			// |0 | 1|
			// -------
			// |  2  |
			// -------
			// |  3  |
			// -------
			addSplitSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '1.2.2':
			// -------
			// |  0  |
			// -------
			// |1 | 2|
			// -------
			// |3 | 4|
			// -------
			addWideSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '2.1.2':
			// -------
			// |0 | 1|
			// -------
			// |  2  |
			// -------
			// |3 | 4|
			// -------
			addSplitSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '2.2.1':
			// -------
			// |0 | 1|
			// -------
			// |2 | 3|
			// -------
			// |  4  |
			// -------
			addSplitSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			addWideSectionHolder(sectionHolders, view);
			return sectionHolders;
		case '2.2.2':
			// -------
			// |0 | 1|
			// -------
			// |2 | 3|
			// -------
			// |4 | 5|
			// -------
			addSplitSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			addSplitSectionHolder(sectionHolders, view);
			return sectionHolders;
	}
}

function addWideSectionHolder(sectionHolders, view) {
	sectionHolders.push(createSectionHolder());
	view.add(sectionHolders[sectionHolders.length - 1]);
}

function addSplitSectionHolder(sectionHolders, view) {
	var split = createSplitSectionView();
	sectionHolders.push(createLeftSectionHolder());
	split.add(sectionHolders[sectionHolders.length - 1]);
	sectionHolders.push(createRightSectionHolder());
	split.add(sectionHolders[sectionHolders.length - 1]);
	view.add(split);
}

function createSplitSectionView() {
	return Ti.UI.createView({
		height : Ti.UI.SIZE,
		left : 0,
		right : 0
	});
}

function createPadding() {
	return Ti.UI.createView({
		height : 9,
		left : 0,
		right : 0,
	});
}

function createSectionHolder() {
	var sectionHolder = Ti.UI.createView({
		layout : 'vertical',
		height : Ti.UI.SIZE,
		left : 0,
		right : 0
	});

	// Add padding on top
	if (OS_IOS && Alloy.CFG.theme === 'ios7') {
	} else {
		//	sectionHolder.add(createPadding());
	}
	return sectionHolder;
}

function createLeftSectionHolder() {
	left = Ti.UI.createView({
		top : 0,
		left : 0,
		width : '50%',
		layout : 'vertical',
		height : Ti.UI.SIZE,
	});
	// Add padding on top
	if (OS_IOS && Alloy.CFG.theme === 'ios7') {
	} else {
		//	left.add(createPadding());
	}

	return left;

}

function createRightSectionHolder() {
	right = Ti.UI.createView({
		top : 0,
		right : 0,
		width : '50%',
		layout : 'vertical',
		height : Ti.UI.SIZE,
	});
	// Add padding on top
	if (OS_IOS && Alloy.CFG.theme === 'ios7') {
	} else {
		//	right.add(createPadding());
	}

	return right;

}

function addSectionToSectionHolder(row, section) {
	row.add(section);
	// Add padding after section
	if (OS_IOS && Alloy.CFG.theme === 'ios7') {
	} else {
		//row.add(createPadding());
	}

}

function addIndexesToFields(allFields) {
	var fields = [];
	for (var i = 0, c = allFields.length; i < c; ++i) {
		allFields[i].index = i;
		if (allFields[i].isFocusAble()) {
			fields.push(allFields[i]);
		}
	}
	// Add nextIndex/previousIndex to handle Next/Previous keyboardToolbar and onReturn events
	if (fields.length > 1) {
		for (var i = 0, c2 = fields.length; i < c2; ++i) {
			if (i < (fields.length - 1)) {
				fields[i].nextIndex = fields[i + 1].index;
				fields[i + 1].previousIndex = fields[i].index;
			} else {
				// Add previous to first field and next to last field
				fields[i].nextIndex = fields[0].index;
				fields[0].previousIndex = fields[i].index;
			}
		}
	}

}

exports.setFocusByIndex = function(index) {
	if (index >= 0 && index < dataFields.length) {
		dataFields[index].focus();
	}
};

function addOnClickEvent(field, allFields, connection) {
	var row = field.getRow();
	field.row = null;
	row.addEventListener('click', function(e) {
		var fields = window.uiFieldsToJsonFields(allFields, false);
		var requestInfo = {
			type : 'fieldclick',
			caller : e.source,
			geolocation : field.geolocation,
			request : {
				action : 'onClick',
				type : 'field',
				field : {
					name : field.getName(),
					onClick : field.onClick,
					fields : fields
				}
			}
		};
		connection.sendInfo(requestInfo);
	});
}

function addOnLongClickEvent(field, allFields, connection) {
	var row = field.getRow();
	field.row = null;
	row.addEventListener('longpress', function(e) {
		var fields = window.uiFieldsToJsonFields(allFields, false);
		var requestInfo = {
			type : 'fieldlongclick',
			caller : e.source,
			geolocation : field.geolocation,
			request : {
				action : 'onLongClick',
				type : 'field',
				field : {
					name : field.getName(),
					onClick : field.onLongClick,
					fields : fields
				}
			}
		};
		connection.sendInfo(requestInfo);
	});
}

function addOnChangeEvent(field, allFields, connection) {
	field.addEventListener('change', function(e) {
		var fields = window.uiFieldsToJsonFields(allFields, false);

		var requestInfo = {
			type : 'fieldchange',
			caller : e.source,
			geolocation : field.geolocation,
			request : {
				action : 'onChange',
				type : 'field',
				field : {
					name : field.getName(),
					onChange : field.onChange,
					fields : fields
				}
			}
		};
		connection.sendInfo(requestInfo);
	});

}

function addOnReturnEvent(field, allFields, connection) {
	field.addEventListener('return', function(e) {
		var fields = window.uiFieldsToJsonFields(allFields, false);
		var requestInfo = {
			type : 'fieldreturn',
			caller : e.source,
			geolocation : field.geolocation,
			request : {
				action : 'onReturn',
				type : 'field',
				field : {
					name : field.getName(),
					onReturn : field.onReturn,
					fields : fields
				}
			}
		};
		connection.sendInfo(requestInfo);
	});
}

function clearList() {
	// YES
	scannedItems.length = 0;
	$.items.data = [];
	deleteOfflineData();
	//Ti.App.Properties.setObject(offlinedata, scannedItems);
}

function addToList(e) {
	//Set focus on first field
	//	$.setFocusByIndex(0);
	e.cancelBubble = true;
	// Get field values
	var fields = window.uiFieldsToJsonFields(dataFields, false);

	var itemData = {};
	var focusSet = true;
	var hasError = false;

	// Validate fields
	_.each(dataFields, function(field, index, list) {
		if (field && !hasError) {
			if (field.isRequired()) {
				if (!field.getValue()) {
					hasError = true;
					Ti.UI.createAlertDialog({
						message : field.getNormalizedTitle() + L('fieldIsRequired')
					}).show();
				}
			}
		}
	});
	if (hasError) {
		return;
	}

	// Clear Fields except those with persistent = true;
	_.each(dataFields, function(field, index, list) {
		if (field) {
			var listLabel = field.getListLabel();
			if (listLabel) {
				itemData[listLabel] = field.getValue().toString();
			}
			if (!field.isPersistent()) {
				field.clear();
				if (focusSet) {
//					if (!field.isScanable()) {
					if (Alloy.Globals.hardwareScanner && field.isScanable()) {
						// Do not set focus, because keyboard will show in scanner field 
					} else {
						$.setFocusByIndex(index);
					}
					focusSet = false;
				}
			}
		}
	});

	// Add the fields to the list
	scannedItems.splice(0, 0, fields);
	saveOfflineData(scannedItems);
	// if (offlinedata) {
	// Ti.App.Properties.setObject(offlinedata, scannedItems);
	// }
	var row = Alloy.createController('application/list/row', {
		list : $,
		data : itemData,
	}).getView();
	row.editable = true;

	if ($.items.getData() && $.items.getData().length > 0) {
		$.items.insertRowBefore(0, row);
	} else {
		$.items.data = [row];
	}
	$.items.scrollToTop(0);
}

function onItemDelete(e) {
	if (e.index != undefined) {
		scannedItems.splice(e.index, 1);
		saveOfflineData(scannedItems);
		// if (offlinedata) {
		// Ti.App.Properties.setObject(offlinedata, scannedItems);
		// }

	}
}

function onClearButtonClick(e) {
	if (OS_ANDROID) {
		var warningAlert = Ti.UI.createAlertDialog({
			title : L('clear_button'),
			message : L('are_you_sure'),
			buttonNames : [L('no_button'), L('yes_button')]
		});
		warningAlert.addEventListener('click', function(e) {
			if (e.index == 0) {
				// NO

			}
			if (e.index == 1) {
				clearList();
			}
		});

		warningAlert.show();
	}

	if (OS_IOS) {
		var optionDialog = Ti.UI.createOptionDialog({
			//titleid: 'are_you_sure',
			options : [L('clear_button'), L('cancel_button')],
			destructive : 0,
			cancel : 1
		});
		optionDialog.addEventListener('click', function(e) {
			if (e.index == 0) {
				clearList();
			}
		});
		optionDialog.show();
	}

}

function loadData() {
	if (!offlinedata) {
		return;
	}
	scannedItems = getOfflineData();
	//scannedItems = Ti.App.Properties.getObject(offlinedata, []);

	var items = [];
	for (var i = 0; i < scannedItems.length; i++) {
		var itemData = {};
		_.each(dataFields, function(field, index, list) {
			if (field) {
				var listLabel = field.getListLabel();
				if (listLabel) {
					itemData[listLabel] = getFieldValue(scannedItems[i], field.getName());
				}
			}
		});

		var row = Alloy.createController('application/list/row', {
			list : $,
			data : itemData,
		}).getView();
		row.editable = true;
		items.push(row);
	};
	$.items.data = items;

}

function getOfflineData() {
	if (offlinedata) {
		var cacheRecord = cache.getJson(offlinedata);
		if (cacheRecord) {
			//request.cache = cacheRecord.changed;
			if (cacheRecord.value) {
				return JSON.parse(cacheRecord.value);
			}
		}
	}
	return [];
}

function saveOfflineData(data) {
	if (offlinedata) {
		cache.saveJson(offlinedata, JSON.stringify(data), '');
	}
}

function deleteOfflineData() {
	if (offlinedata) {
		cache.deleteJson(offlinedata);
	}
}

function getFieldValue(fields, name) {
	for (var i = 0; i < fields.length; i++) {
		if (fields[i].name === name) {
			return fields[i].value;
		}
	};
	return '';

}

function addOnReturnEventSpecial(allFields) {
	for (var i = allFields.length - 1, c = 0; i >= c; --i) {
		var field = allFields[i];
		if (field.isFocusAble()) {
			field.addEventListener('return', function(e) {
				addToList(e);
			});
			return;
		}
	}
}

function addEventsToFields(connection, allFields) {

	for (var i = 0, c = allFields.length; i < c; ++i) {
		var field = allFields[i];
		if (field.onChange) {
			addOnChangeEvent(field, allFields, connection);
		}
		if (field.onClick) {
			addOnClickEvent(field, allFields, connection);
		}
		if (field.onLongClick) {
			addOnLongClickEvent(field, allFields, connection);
		}
		if (field.onReturn) {
			addOnReturnEvent(field, allFields, connection);
		}

		if (field.getType() == 'button' && field.getButtonType() == 'add') {
			field.addEventListener('click', addToList);
		}
		// Set field.row to null to avoid memory leaks
		field.row = null;
	}
}
