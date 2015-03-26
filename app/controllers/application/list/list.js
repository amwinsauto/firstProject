var Conversion = require('tools/Conversion');
var Images = require('Images');

var enableScrollUpdate = true;

var args = arguments[0] || {};
var data = args.data;
var window = args.window;
var controller = window.getController();
var connection = controller.getConnection();
var application = controller.getApplication();
var refreshControl = null;
var refreshing = false;

var rowOptions = {
	options : 0,
	click : false
};

if (Alloy.Globals.hardwareScanner) {
	Alloy.Globals.hardwareScanner.reset();
}

if (OS_ANDROID) {
	//window.setOrientationModes([Ti.UI.PORTRAIT]);
	//window.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}
if (OS_IOS) {
	//	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT]);
	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}

// Attributes
var isDeleteEnabled = false;
var template = '';

// Rows
var rowControllers = [];
var selectedRow = null;
var selectedRows = [];
var rowsBelowHeader = 0;

var moreRowsRow = null;
var noRowsRow = null;
var multidelete = false;

// Used by others
var name = '';
$.name = '';
// Used by others
var geolocation = false;
$.geolocation = false;
// Used by others
$.columns = [];

// Actions
var onSearch = null;
var onSearchCancel = null;
var onMore = null;
var onRefresh = null;

// Dynamic scroll
var scrollLastDistance = 0;
var scrollUpdating = false;
var scrollOnMoreAction = null;

if (data.name) {
	name = data.name;
	$.name = data.name;
}
if (data.geolocation) {
	geolocation = true;
	$.geolocation = true;
}
if (data.columns && data.columns.length > 0) {
	$.columns = data.columns;
}

if (data.onSearch) {
	onSearch = data.onSearch;
}
if (data.onSearchCancel) {
	onSearchCancel = data.onSearchCancel;
}
if (data.onRefresh) {
	onRefresh = data.onRefresh;
}

template = data.template || data.layouttemplate || '';

if (data.enablemultidelete === true && (template === '' || template === 'columns')) {
	multidelete = true;
}

createListView(data);

if (Alloy.isTablet && controller.isMaster && !controller.isFullScreen) {
	$.table.allowsSelection = true;
}
$.table.addEventListener('longpress', function(e) {
	// TODO Remove this when slide to delete is implemented
	if (OS_ANDROID && isDeleteEnabled) {
		return;
	}
	if (e.row && e.row.name) {
		setSelectedRow(e.row.name);
	} else if (e.rowData && e.rowData.name) {
		setSelectedRow(e.rowData.name);
	} else {
		setSelectedRow(null);
	}
//	window.getController().getApplication().metadataClick(window);
	window.metadataClick();
});

// the click event is called when longpress event is fired
//$.table.addEventListener('click', function(e) {
$.table.addEventListener('singletap', function(e) {
	if (e.row && e.row.name) {
		setSelectedRow(e.row.name);
	} else if (e.rowData && e.rowData.name) {
		setSelectedRow(e.rowData.name);
	}

	if (e.source && e.source.idtype === 'deleteview') {
		// Toggle delete Selected for a row
		if (e.source.selected) {
			setRowDeleteSelected(e.source, e.source.parent, false);
		} else {
			setRowDeleteSelected(e.source, e.source.parent, true);
		}
	} else if (e.source && e.source.onClick) {
		// Button on row clicked
		connection.sendInfo(e.source.onClick);
	} else if (e.row && e.row.onClick) {
		// Row clicked
		connection.sendInfo(e.row.onClick);
	} else if (e.row && e.row.onMore) {
		// More row clicked
		connection.sendInfo(e.row.onMore);
	}

});

function setSelectedRow(rowName) {
	selectedRow = findController(rowName);
}

if (enableScrollUpdate) {
	$.table.addEventListener('scroll', function(e) {
		if (OS_IOS) {
			var scrollOffset = e.contentOffset.y;
			var scrollHeight = e.size.height;
			var scrollTotal = scrollOffset + scrollHeight;
			var scrollTheEnd = e.contentSize.height;
			var scrollDistance = scrollTheEnd - scrollTotal;

			// going down is the only time we dynamically load,
			// going up we can safely ignore -- note here that
			// the values will be negative so we do the opposite
			if (scrollDistance < scrollLastDistance) {
				// adjust the % of rows scrolled before we decide to start fetching
				//			var scrollNearEnd = scrollTheEnd * .75;
				var scrollNearEnd = scrollTheEnd * .90;

				if (!scrollUpdating && (scrollTotal >= scrollNearEnd)) {
					if (scrollOnMoreAction) {
						scrollUpdating = true;
						connection.sendInfo(scrollOnMoreAction);
					}
				}
			}
			scrollLastDistance = scrollDistance;
		}
		if (OS_ANDROID) {
			if (!scrollUpdating && ((e.firstVisibleItem + e.visibleItemCount) == e.totalItemCount)) {
				if (scrollOnMoreAction) {
					scrollUpdating = true;
					connection.sendInfo(scrollOnMoreAction);
				}
			}
		}

	});

}

if (data.showsearch || onSearch) {
	// if (OS_ANDROID && !Alloy.Globals.isAndroidOld) {
	if (OS_ANDROID) {
		$.view.remove($.search);
		$.searchView.hintText = data.searchhint ? Conversion.toString(data.searchhint) : L('search');
		$.searchView.addEventListener('submit', function(e) {
			if (onSearch) {
				clearRows();
				//$.table.data = [];
				connection.sendInfo({
					type : 'listsearch',
					caller : e.source,
					geolocation : $.geolocation,
					request : {
						action : 'onSearch',
						type : 'list',
						list : {
							name : $.name,
							onSearch : onSearch,
							value : $.searchView.value,
						}
					}
				});
			}
		});

		//$.searchView.addEventListener('cancel', doOnSearchCancel);

		function doOnSearchCancel(e) {
			if (onSearchCancel) {
				connection.sendInfo({
					type : 'listsearchcancel',
					caller : e.source,
					geolocation : $.geolocation,
					request : {
						action : 'onSearchCancel',
						type : 'list',
						list : {
							name : $.name,
							onSearchCancel : onSearchCancel
						}
					}
				});
			}
			$.searchView.value = '';
		}

		//$.table.searchAsChild = false;
		if (onSearch) {
			$.searchView.submitEnabled = true;
			$.table.search = $.searchView;
			$.table.filterAttribute = 'NotUsed';
		} else {
			$.searchView.addEventListener('blur', function(e) {
				$.searchView.value = '';
			});
			$.table.search = $.searchView;
			$.searchView.submitEnabled = false;
		}

		if (data.searchfocus) {
			window.setInitialFocus($.searchView);
		}

		window.addAndroidMenu({
			title : L('search'),
			type : 'search',
			itemId : 1,
			actionView : $.searchView,
			onCollapse : doOnSearchCancel,
			showAsAction : data.searchfocus ? Ti.Android.SHOW_AS_ACTION_ALWAYS : Ti.Android.SHOW_AS_ACTION_ALWAYS | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW,
			icon : 'SEARCH'
		});

	} else {
		if (data.searchfocus) {
			window.setInitialFocus($.search);
		}

		$.search.hintText = data.searchhint ? Conversion.toString(data.searchhint) : L('search');
		$.search.addEventListener('return', function(e) {
			if (onSearch) {
				clearRows();
				//$.table.data = [];
				connection.sendInfo({
					type : 'listsearch',
					caller : e.source,
					geolocation : $.geolocation,
					request : {
						action : 'onSearch',
						type : 'list',
						list : {
							name : $.name,
							onSearch : onSearch,
							value : e.value,
						}
					}
				});
			}

			$.search.blur();
		});

		$.search.addEventListener('cancel', function(e) {
			if (onSearchCancel) {
				connection.sendInfo({
					type : 'listsearchcancel',
					caller : e.source,
					geolocation : $.geolocation,
					request : {
						action : 'onSearchCancel',
						type : 'list',
						list : {
							name : $.name,
							onSearchCancel : onSearchCancel
						}
					}
				});
			}
			$.search.value = '';
			$.search.blur();
		});
		//$.table.searchAsChild = true;

		if (onSearch) {
			$.search.top = 0;
			$.search.addEventListener('focus', function(e) {
				if (Alloy.Globals.hardwareScanner) {
					Alloy.Globals.hardwareScanner.setSearchField($.search);
				}
				$.search.setShowCancel(true, {
					animated : true
				});
			});
			$.search.addEventListener('blur', function(e) {
				$.search.setShowCancel(false, {
					animated : true
				});
			});
		} else {
			$.view.remove($.search);
			$.table.search = $.search;
			if (Alloy.Globals.hardwareScanner) {
				$.search.addEventListener('focus', function(e) {
					Alloy.Globals.hardwareScanner.setSearchField($.search);
				});
			}

			if (OS_IOS) {
				// Only on IOS since Android do not support other than default "title" as filter attribute
				$.table.filterAttribute = 'searchText';
			}
		}
	}
} else {
	$.view.remove($.search);
}

exports.init = function() {
	addRows(data);

	if (onRefresh) {
		createRefreshSupport();
	} else {
	}
	window.setButtonsAndTitleOnWindow($.view, data, 'list');
};

function removeRefreshSupport() {
	if (OS_IOS) {
		onRefresh = null;
		$.table.refreshControl = null;
	}
}

function createRefreshSupport() {
	if (OS_IOS) {
		// $.refreshHeader = Alloy.createController('application/list/refreshHeader', {
		// list : $,
		// data : data
		// });
		refreshing = false;
		//		refreshControl = Ti.UI.createRefreshControl({title: Ti.UI.iOS.createAttributedString({text: 'olsen'})});
		refreshControl = Ti.UI.createRefreshControl();
		$.table.refreshControl = refreshControl;
		refreshControl.addEventListener('refreshstart', function(e) {
			refreshing = true;
			$.getConnection().sendInfo({
				type : 'listrefresh',
				caller : e.source,
				geolocation : $.getGeolocation(),
				request : {
					action : 'onRefresh',
					type : 'list',
					list : {
						name : $.getName(),
						onRefresh : $.getOnRefresh(),
						value : e.value,
					}
				}
			});
		});
	} else if (OS_ANDROID) {

		window.addAndroidMenu({
			title : L('refresh'),
			name : $.name,
			type : 'list',
			action : 'onRefresh',
			itemId : 1,
			//			showAsAction : Alloy.Globals.isAndroidOld ? Ti.Android.SHOW_AS_ACTION_NEVER : Ti.Android.SHOW_AS_ACTION_ALWAYS,
			showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
			//			icon : Alloy.Globals.isAndroidOld ? '' : 'REFRESH', //Ti.Android.R.drawable.ic_menu_rotate,
			icon : 'REFRESH', //Ti.Android.R.drawable.ic_menu_rotate,
			geolocation : $.geolocation,
			onRefresh : onRefresh,
		});
	}
}


exports.getAliases = function() {
	if (selectedRow) {
		return selectedRow.getAliases();
	}
	return [];
};
exports.getName = function() {
	return name;
};

exports.getGeolocation = function() {
	return geolocation;
};

exports.getOnRefresh = function() {
	return onRefresh;
};

exports.getConnection = function() {
	return connection;
};

exports.refresh = function(request, response) {
	if (OS_IOS) {
		if (refreshControl) {
			if (refreshing) {
				refreshing = false;
				rowControllers = [];
				addRows(response, true);
				refreshControl.endRefreshing();
				return true;
			}
		}
	}
	return false;
};

exports.update = function(request, response) {

	if (request.action == 'onSearch' && onRefresh) {
		removeRefreshSupport();
	}

	// Add new rows
	addRows(response);

	// Remove rows
	// Old way
	if (response.removelistitems) {
		removeRows(response.removelistitems);
	}
	// New way
	if (response.removeitems) {
		removeRows(response.removeitems);
	}

	// Update rows
	// Old way
	if (response.updatelistitems) {
		updateRows(response.updatelistitems);
	}
	// New way
	if (response.updateitems) {
		updateRows(response.updateitems);
	}

	//	if (OS_ANDROID && !Alloy.Globals.isAndroidOld) {
	if (OS_ANDROID) {
		if (request.action = 'onSearch') {
			$.searchView.blur();
		}
	}
};

//TODO Deselect selected rows on other tabs.
// exports.resetSelection = function() {
// if ($.selectedRow != undefined && $.selectedRow > -1) {
// $.table.deselectRow($.selectedRow);
// }
//
// }

exports.setBackgroundColor = function(color) {
	$.table.backgroundColor = color;
};

function clearRows() {
	rowControllers = [];
	selectedRows = [];
	rowsBelowHeader = 0;
	$.table.data = [];
}

function addRows(data, clear) {
	var noItems = !data.items && !data.listitems && !data.updateitems && !data.updatelistitems && !data.removeitems && !data.removelistitems;

	var items = data.items || data.listitems || null;

	if (data.onMore) {
		onMore = data.onMore;
		scrollOnMoreAction = createOnMoreAction(null, data);
	} else {
		if (items || noItems) {
			onMore = null;
			scrollOnMoreAction = null;
		}
	}

	clear = clear || data.clearrows;
	if (clear) {
		clearRows();
	}

	var itemIndex = 0;
	var itemSelected = false;
	var itemSelectedIndex = -1;
	var tableRows = [];
	if (items) {
		var itemCount = items.length;
		var rowCount = 0;
		for (var i = 0; i < itemCount; i++) {
			var item = items[i];

			// if (geolocation) {
			// item.geolocation = true;
			// }
			// var header = createHeaderItem(item);
			// if (header) {
			// tableRows.push(header.getView());
			// rowControllers.push(header);
			// itemIndex += 1;
			// rowsBelowHeader = 0;
			// }

			rowsBelowHeader++;
			var rowController = createListItem(item);
			var listItem = rowController.getView();
			if (listItem) {
				listItem.name = item.name;

				if (item.header) {
					listItem.header = Conversion.substituteAll(item.header, item.headerSubst).toUpperCase();
					rowsBelowHeader = 0;
				}

				if (template === 'columns') {
					if (rowsBelowHeader % 2 == 0) {//tableRows.length % 2 == 0) {
						listItem.backgroundColor = listItem.egBackgroundColorOdd;
					}
				}
				tableRows.push(listItem);
				rowControllers.push(rowController);

				//				if (item.selected && !itemSelected && OS_IOS) {
				if (item.selected && !itemSelected) {
					itemSelected = true;
					itemSelectedIndex = itemIndex;
					if (item.onClick) {
						controller.addFutureAction(createOnClickAction(listItem, item));
					}
				}
				if (item.onDelete) {
					enableDelete();
				}
				itemIndex += 1;
			}
		}
	}

	if ($.table.data.length > 0) {
		var deleteIndex = -1;
		var tableRowCount = getTableRowCount($.table);
		//		var section = $.table.data[0];
		//		if (section.rowCount > 0 && moreRowsRow) {
		if (tableRowCount > 0 && moreRowsRow) {
			//			deleteIndex = section.rowCount - 1;
			deleteIndex = tableRowCount - 1;
			moreRowsRow = null;
		}
		if (onMore) {
			//			if (OS_IOS && enableScrollUpdate) {
			if (enableScrollUpdate) {
				moreRowsRow = Alloy.createController('application/list/rowLoadingRows').getView();
				tableRows.push(moreRowsRow);
			} else {
				moreRowsRow = Alloy.createController('application/list/rowMoreRows').getView();
				moreRowsRow.onMore = createOnMoreAction(moreRowsRow, data);
				tableRows.push(moreRowsRow);
			}
		}

		//var tableRowCount = section.rowCount;

		if (clear) {
			$.table.setData(tableRows, {
				animated : false
			});
			scrollLastDistance = 0;
		} else {
			if (deleteIndex > -1) {
				tableRowCount--;
				$.table.deleteRow(deleteIndex, {
					animated : false
				});
			}
			$.table.appendRow(tableRows, {
				animated : false
			});
		}

		// if (!clear && deleteIndex > -1) {
		// tableRowCount--;
		// $.table.deleteRow(deleteIndex, {
		// animated : false
		// });
		// }
		if (itemSelected) {
			setTimeout(function() {
				if (clear) {
					$.table.selectRow(itemSelectedIndex);
				} else {
					$.table.selectRow(itemSelectedIndex + tableRowCount);
				}
			}, 250);
			//TODO Deselect selected rows on other tabs.
			// $.selectedRow = itemSelectedIndex + tableRowCount;
		}

	} else {
		if (onMore) {
			//			if (OS_IOS && enableScrollUpdate) {
			if (enableScrollUpdate) {
				moreRowsRow = Alloy.createController('application/list/rowLoadingRows').getView();
				tableRows.push(moreRowsRow);
			} else {
				moreRowsRow = Alloy.createController('application/list/rowMoreRows').getView();
				moreRowsRow.onMore = createOnMoreAction(moreRowsRow, data);
				tableRows.push(moreRowsRow);
			}
		}
		$.table.setData(tableRows);
		scrollLastDistance = 0;
		if (itemSelected) {
			setTimeout(function() {
				$.table.selectRow(itemSelectedIndex);
			}, 250);

			//TODO Deselect selected rows on other tabs.
			// $.selectedRow = itemSelectedIndex;
		}
	}

	if (onSearch && ($.table.data.length === 0)) {
		window.setInitialFocus($.search);
		if (connection.getRequest().action === 'onSearch') {
			noRowsRow = Alloy.createController('application/list/rowNoRows').getView();
			tableRows.push(noRowsRow);
			$.table.setData(tableRows);
		}
	}
	scrollUpdating = false;
}

function removeRows(removeitems) {
	var items = null;
	if (removeitems) {
		items = removeitems;
	}

	if (items) {
		var itemCount = items.length;
		var rowCount = 0;
		for (var i = 0; i < itemCount; i++) {
			var item = items[i];
			var index = findRowIndex(getTableRows($.table), item.name);
			if (index > -1) {
				$.table.deleteRow(index, {
					animated : false
				});
			}
		}
	}
}

function updateRows(updateitems) {
	var items = null;
	if (updateitems) {
		items = updateitems;
	}

	if (items) {
		var itemCount = items.length;
		for (var i = 0; i < itemCount; i++) {
			updateListItem(items[i]);
		}
	}
}

function findControllerIndex(itemName) {
	var controllerCount = rowControllers.length;
	for (var i = 0; i < controllerCount; i++) {
		if (rowControllers[i].name === itemName) {
			return i;
		}
	}

	return -1;
}

function findController(itemName) {
	var index = findControllerIndex(itemName);
	if (index === -1) {
		return null;
	}
	return rowControllers[index];
}

function findRowIndex(items, itemName) {
	var itemCount = items.length;
	for (var i = 0; i < itemCount; i++) {
		if (items[i].name === itemName) {
			return i;
		}
	}

	return -1;
}

function enableDelete() {
	if (isDeleteEnabled === true) {
		return;
	}
	isDeleteEnabled = true;

	if (OS_ANDROID) {
		// Delete single row
		$.table.addEventListener('longclick', function(e) {
			if (e.row && e.row.onDelete) {
				// Row long clicked
				var deleteIndex = e.index;
				var onDelete = e.row.onDelete;

				// TODO Stupid bug in Titanium 3.1.0 fires longclick twice
				if (e.row.prossessingLongClick) {
					return;
				}
				e.row.prossessingLongClick = true;
				var deleteDialog = Ti.UI.createAlertDialog({
					titleid : 'delete',
					messageid : 'are_you_sure',
					buttonNames : [L('yes_button'), L('no_button')],
					cancel : 1,
				});
				deleteDialog.addEventListener('click', function(event) {
					// TODO Stupid bug in Titanium 3.1.0 fires longclick twice
					e.row.prossessingLongClick = false;
					if (event.index === 0) {
						$.table.deleteRow(deleteIndex, {
							animated : true
						});
						var index = findRowIndex(getTableRows($.table), e.row.name);
						rowControllers.splice(index, 1);
						connection.sendInfo(onDelete);
					}
				});
				deleteDialog.show();
			}
		});

	} else {
		// Enable swipe to delete not supported on Android
		$.table.editable = true;
		$.table.deleteButtonTitle = L('delete_button');
		$.table.addEventListener('delete', function(e) {
			if (e.row && e.row.onDelete) {
				rowControllers.splice(e.index, 1);
				connection.sendInfo(e.row.onDelete);
			}
		});

	}

	if (OS_IOS || multidelete) {

		// Add Edit/Cancel button
		$.editButton.position = 'top';
		$.editButton.isEdit = true;
		if (data.buttons) {
			//data.buttons.splice(0, 0, $.editButton);
			data.buttons.push($.editButton);
		} else {
			data.buttons = [$.editButton];
		}

		$.editButton.addEventListener('click', function() {
			if ($.editButton.isEdit) {

				if (multidelete) {
					if (!$.deleteSelectedButton.isAdded) {
						$.deleteSelectedButton.isAdded = true;
						$.deleteSelectedButton.addEventListener('click', function(e) {
							var deletes = {
								type : 'listdeletes',
								geolocation : false,
								request : {
									action : 'onActions',
									type : 'actions',
									actions : []
								}
							};

							var oldRows = getTableRows($.table);
							for (var i = selectedRows.length - 1; i >= 0; i--) {
								var deleteRow = selectedRows[i];

								if (selectedRows.length > 1) {
									if (deleteRow.onDelete.geolocation) {
										deletes.geolocation = geolocation;
									}
									deletes.request.actions.push(deleteRow.onDelete.request);
								} else {
									deletes = deleteRow.onDelete;
								}
								removeTableRow(oldRows, deleteRow);
							}

							window.removeBottomEditToolbarOnWindow();
							for (var i = 0; i < oldRows.length; i++) {
								var row = oldRows[i];
								showDeleteOnRow(row, false);
							};

							$.table.setData(oldRows, {
								animationStyle : Titanium.UI.iPhone.RowAnimationStyle.LEFT
							});

							selectedRows = [];
							$.deleteSelectedButton.title = L('delete_button');
							$.deleteSelectedButton.enabled = false;

							$.editButton.title = L('edit_button');
							$.editButton.isEdit = true;
							connection.sendInfo(deletes);
						});
					}
					window.setBottomEditToolbarOnWindow($.deleteToolbar);

					var rows = getTableRows($.table);
					if (rows.length > 0) {
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							showDeleteOnRow(row, true);
						};
					}
				} else {
					$.table.editing = true;
				}
				$.editButton.title = L('cancel_button');
				$.editButton.isEdit = false;
			} else {
				// isEdit = false;
				if (multidelete) {
					var rows = getTableRows($.table);
					if (rows.length > 0) {
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							showDeleteOnRow(row, false);
						};
					}
					selectedRows = [];
					window.removeBottomEditToolbarOnWindow();
				} else {
					$.table.editing = false;
				}
				$.editButton.title = L('edit_button');
				$.editButton.isEdit = true;

			}
		});
	}

}

function createListView(data) {

	var items = data.items || data.listitems || [];
	if (items.length > 0) {
		updateRowOptions(items[0]);
	}

	if (template === 'columns') {
		createListViewForTemplateColumns(data);
	} else if (template === 'texItemList') {
		createListViewForTemplateTexItemList(data);
	} else if (template === 'texOrderLine') {
		createListViewForTemplateTexOrderLine(data);
	}
}

function createListViewForTemplateColumns(data) {
	Alloy.createController('application/list/headerColumns', {
		list : $,
		data : data,
		rowOptions : rowOptions
	});
}

function createListViewForTemplateTexItemList(data) {
	Alloy.createController('application/list/headerTexItemList', {
		list : $,
		data : data,
		rowOptions : rowOptions
	});
}

function createListViewForTemplateTexOrderLine(data) {
	Alloy.createController('application/list/headerTexOrderLine', {
		list : $,
		data : data,
		rowOptions : rowOptions
	});
}

function createHeaderItem(item) {
	if (item.header && item.header.toString().length > 0) {
		return Alloy.createController('application/list/rowHeader', {
			list : $,
			data : item,
			rowOptions : rowOptions
		});
	}
	return null;
}

function updateListItem(item) {
	var index = findControllerIndex(item.name);
	if (index > -1) {
		var updatedItem = createListItem(item);
		if (template === 'columns') {
			var listItem = updatedItem.getView();
			if (index % 2 == 1) {
				listItem.backgroundColor = listItem.egBackgroundColorOdd;
			}
		}
		updatedItem.getView().name = item.name;
		$.table.updateRow(index, updatedItem.getView());
		rowControllers[index] = updatedItem;

	}
	return updatedItem;
}

function updateRowOptions(item) {
	if (item.onClick) {
		rowOptions.click = true;
	}
	if (item.options && item.options.length > rowOptions.options) {
		rowOptions.options = item.options.length;
	}
}

function createListItem(item) {
	updateRowOptions(item);

	var rowTemplate = item.template || item.layouttemplate || template;

	var rowController = 'application/list/row';
	if (rowTemplate === '2') {
		rowController = 'application/list/row2';
	} else if (rowTemplate === '4') {
		rowController = 'application/list/row4';
	} else if (rowTemplate === 'floating') {
		rowController = 'application/list/rowFloating';
	} else if (rowTemplate === 'texItemList') {
		rowController = 'application/list/rowTexItemList';
	} else if (rowTemplate === 'texOrderLine') {
		rowController = 'application/list/rowTexOrderLine';
	} else if (rowTemplate === 'columns') {
		rowController = 'application/list/rowColumns';
	} else {
		rowController = 'application/list/row';
	}

	return Alloy.createController(rowController, {
		list : $,
		data : item,
		rowOptions: rowOptions
		//row : listItem
	});
	//.getView();
}

function createOnClickAction(tablerow, item) {
	if (item.onClick) {
		return {
			type : 'listclick',
			caller : tablerow.caller,
			geolocation : item.geolocation,
			request : {
				action : 'onClick',
				type : 'listitem',
				listitem : {
					name : item.name,
					onClick : item.onClick
				}
			}
		};
	}
	return null;
}

function createOnMoreAction(tablerow, item) {
	if (item.onMore) {
		return {
			type : 'listclick',
			caller : tablerow ? tablerow.caller : undefined,
			geolocation : item.geolocation,
			request : {
				action : 'onMore',
				type : 'listitem',
				listitem : {
					name : item.name,
					onMore : item.onMore
				}
			}
		};
	}
	return null;
}

function createLabel(id, view, title, top, left, height, width) {
	var text = Conversion.toString(title);
	var label = Ti.UI.createLabel({
		id : id,
		text : text,
		top : top,
		left : left,
		height : height,
		width : width,
		touchEnabled : false
	});
	view.add(label);
	return label;
}

function createLabelR(id, view, title, top, right, height, width) {
	var text = Conversion.toString(title);
	var label = Ti.UI.createLabel({
		id : id,
		text : text.trim(),
		top : top,
		right : right,
		height : height,
		textAlign : 'right',
		width : width,
		touchEnabled : false
	});
	view.add(label);
	return label;
}

function showDeleteOnRow(row, show) {
	if (!row.onDelete) {
		return;
	}
	if (show) {
		row.rowView.left = parseInt(row.deleteView.left, 10) + parseInt(row.deleteView.width, 10);
		;
		//row.deleteView.left = 8;
		//row.deleteView.width = 20;
		row.deleteView.backgroundImage = Images.getImage('DELETE_UNSELECTED', 'core');
		row.deleteView.visible = true;
	} else {
		//row.deleteView.left = 0;
		//row.deleteView.width = 0;
		row.deleteView.visible = false;
		row.rowView.left = 0;
	}
	// Always not selected when switching visibility
	row.deleteView.selected = false;

}

function setRowDeleteSelected(view, row, selected) {
	if (selected) {
		view.selected = true;
		view.backgroundImage = Images.getImage('DELETE_SELECTED', 'core');
		selectedRows.push(row);
		//Ti.API.info(selectedRows);
	} else {
		view.selected = false;
		view.backgroundImage = Images.getImage('DELETE_UNSELECTED', 'core');
		for (var i = 0; i < selectedRows.length; i++) {
			if (selectedRows[i] === row) {
				selectedRows.splice(i, 1);
				//Ti.API.info(selectedRows);
			}
		}
	}
	var btn = {
		title : L('delete_button'),
		width : 100,
		enabled : false
	};

	if (selectedRows.length > 0) {
		btn.title = L('delete_button') + ' (' + selectedRows.length + ')';
		btn.enabled = true;
	}
	//	if (OS_IOS) {
	//		$.deleteSelectedButton.labels = [btn];
	//	} else {
	$.deleteSelectedButton.title = btn.title;
	$.deleteSelectedButton.enabled = btn.enabled;
	//	}
}

function removeTableRow(rows, row) {
	if (rows.length > 0) {
		for (var i = 0; i < rows.length; i++) {
			if (row === rows[i]) {
				rows.splice(i, 1);
				rowControllers.splice(i, 1);
			}
		}
	}
	return rows;
}

function getTableRows(table) {
	var rows = [];
	var sections = table.getSections();
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		if (section.rowCount > 0) {
			for (var j = 0; j < section.rowCount; j++) {
				rows.push(section.getRows()[j]);
			}
		}

	}
	// var section = table.data[0];
	// var rows = [];
	// if (section) {
	// if (section.rowCount > 0) {
	// for (var i = 0; i < section.rowCount; i++) {
	// rows.push(section.getRows()[i]);
	// }
	// }
	// }
	return rows;
}

function getTableRowCount(table) {
	var rowCount = 0;
	var sections = table.getSections();
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		if (section.rowCount > 0) {
			for (var j = 0; j < section.rowCount; j++) {
				rowCount++;
			}
		}

	}
	return rowCount;
}

function lastIndexOfTable(table) {
	// var section = table.data[0];
	// return section.rowCount - 1;
	var lastIndex = -1;
	var sections = table.getSections();
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		if (section.rowCount > 0) {
			for (var j = 0; j < section.rowCount; j++) {
				lastIndex++;
			}
		}

	}
	return lastIndex;
}
