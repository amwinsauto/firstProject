var CFG = require('alloy').CFG;
var Images = require('Images');
var Log = require('tools/Log');
var debug = false;

var args = arguments[0] || {};
var data = args.data;
var window = args.window;
var controller = window.getController();
var connection = controller.getConnection();
var application = controller.getApplication();
var dataFields = [];
var isPopover = false;

if (Alloy.Globals.hardwareScanner) {
	Alloy.Globals.hardwareScanner.reset();
}

var keyboardToolbar = null;
if (OS_IOS) {
	if (controller.isKeyboardToolbarEnabled()) {
		if (data.showkeyboardtoolbar != false) {
			keyboardToolbar = Alloy.createController('application/form/keyboardToolbar', {
				form : $
			});
		}
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

exports.init = function(data) {

	var sections = data.sections || [];
	var buttons = data.buttons || [];
	var layout = data.layout || data.template || '1';
	//	if (Alloy.isHandheld) {
	if (window.isNarrow()) {
		layout = '1';
	}

	var sectionholders = createFormSectionHolders($.contentScrollView, layout);

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
		if (section.position) {
			if (section.position < sectionholders.length) {
				sectionHolder = sectionholders[section.position];
			}
		}

		if (controller.type === 'top' && section.width) {
			sectionHolder.width = section.width;
		}

		var sectionController = Alloy.createController('application/form/section', {
			form : $,
			data : section
		});

		var sectionView = sectionController.getView();

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
			var field = fields[y];
			if (!field) {
				continue;
			}

			if (Alloy.isHandheld && field.type === 'filler') {
				continue;
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

	window.setButtonsAndTitleOnWindow($.formView, data, 'form', dataFields);
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
	} else if (fieldData.type === 'datetime') {
		fieldController = 'application/form/dateTimeField';
	} else if (fieldData.type === 'month') {
		fieldController = 'application/form/monthField';
	} else if (fieldData.type === 'button') {
		fieldController = 'application/form/buttonField';
		if (fieldData.slidetoclick === true) {
			fieldController = 'application/form/buttonSliderField';
		}
	} else if (fieldData.type === 'textarea') {
		fieldController = 'application/form/textAreaField';
	} else if (fieldData.type === 'signature') {
		fieldController = 'application/form/signatureField';
	} else if (fieldData.type === 'slider') {
		fieldController = 'application/form/sliderField';
	} else if (fieldData.type === 'rating') {
		fieldController = 'application/form/ratingField';
	} else if (fieldData.type === 'checkbox') {
		fieldController = 'application/form/switchField';
	} else if (fieldData.type === 'image') {
		fieldController = 'application/form/imageField';
		if (fieldData.animated == true) {
			fieldController = 'application/form/webField';
		}
	} else if (fieldData.type === 'web') {
		fieldController = 'application/form/webField';
	} else if (fieldData.type === 'filler') {
		fieldController = 'application/form/fillerField';
	} else if (fieldData.type === 'chart') {
		fieldController = 'application/form/chartField2';
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

exports.getAliases = function() {
	var aliases = [];
	_.each(dataFields, function(field, indes, list) {
		if (field.getAlias()) {
			aliases.push({
				name : field.getAlias(),
				value : field.getValue()
			});
		}

	});
	return aliases;

};

exports.update = function(request, response) {
	var sections = response.sections || [];
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i] || {};
		var fields = section.fields || [];
		for (var j = 0; j < fields.length; j++) {
			var field = fields[j] || {};
			for (var k = 0; k < dataFields.length; k++) {
				var uiField = dataFields[k];
				if (uiField.getName() === field.name) {
					if (uiField.update) {
						uiField.update(field);
					} else {
						if (uiField.setValue) {
							uiField.setValue(field.value);
						}
					}
				}
			}
		}
	}
};

function onLongPress(e){
//	window.getController().getApplication().metadataClick(window);
	window.metadataClick();
}

function createFormSectionHeader(section) {
	
	var sectionLayout = section.layout || section.template || null;

	if (sectionLayout === 'texOrderLine') {
		return Alloy.createController('application/form/sectionHeaderTexOrderLine', {
			form : $,
			data : section
		});
	}
	
	if (sectionLayout === 'noheader') {
		return null;		
	}

	return Alloy.createController('application/form/sectionHeader', {
		form : $,
		data : section
	});
}

function createFormSectionHolders(view, layout) {

	var sectionHolders = [];

	if (controller.type === 'top') {
		switch(layout) {
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

	switch(layout) {
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
	return Ti.UI.createView({
		layout : 'vertical',
		height : Ti.UI.SIZE,
		left : 0,
		right : 0
	});
}

function createLeftSectionHolder() {
	return Ti.UI.createView({
		top : 0,
		left : 0,
		width : '50%',
		layout : 'vertical',
		height : Ti.UI.SIZE,
	});
}

function createRightSectionHolder() {
	return Ti.UI.createView({
		top : 0,
		right : 0,
		width : '50%',
		layout : 'vertical',
		height : Ti.UI.SIZE,
	});
}

function addSectionToSectionHolder(row, section) {
	row.add(section);
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
				//fields[i].nextIndex = fields[0].index;
				//fields[0].previousIndex = fields[i].index;
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

exports.onClickField = function(field, onClick, e) {
	var fields = window.uiFieldsToJsonFields(dataFields, false);
	var requestInfo = {
		type : 'fieldclick',
		caller : e ? e.source : undefined,
		geolocation : field.geolocation,
		request : {
			action : 'onClick',
			type : 'field',
			field : {
				name : field.getName(),
				onClick : onClick,
				fields : fields
			}
		}
	};
	connection.sendInfo(requestInfo);
};

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
		blurAllFields();
		connection.sendInfo(requestInfo);
	});
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
		// Set field.row to null to avoid memory leaks
		field.row = null;
	}
}

function blurAllFields() {
	Log.debug('blurAllFields:' + dataFields.length, debug);
	for (var i = 0, c1 = dataFields.length; i < c1; ++i) {
		if (dataFields[i].blur) {
			dataFields[i].blur();
		}
	}

}
