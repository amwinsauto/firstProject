/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false*/
/*global module */

var pages = {};

var ANDROID = Ti.Platform.osname === 'android';

var Lib = require('examples/lib');

function Menu(navWin) {
	var self, view, tableData, table, menuOptions;
	
	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	
	function load(title, path) {
		var Page;
		
		if (!pages[title]) {
			if (endsWith(path, '.js')) {
				path = path.substr(0, path.length - 3);
			}
			Page = require(path);
			pages[title] = new Page();
		}		
	}

	function open(e) {
		load(e.title, e.path);
		var detailContainerWindow = Ti.UI.createWindow({
			title: e.title,
			orientationModes: [ Ti.UI.PORTRAIT ]
		});
		
		detailContainerWindow.add(pages[e.title]);

		if (ANDROID) {
			detailContainerWindow.addEventListener('open', function() {
				function onPause() {
					Lib.onPause();
				}
				
				function onResume() {
					Lib.onResume();
				}
				
				detailContainerWindow.activity.addEventListener('pause', onPause);
				detailContainerWindow.activity.addEventListener('resume', onResume);
		
			});
			detailContainerWindow.addEventListener('android:back', function() {
				pages[e.title].fireEvent('closing', {});
				detailContainerWindow.close();
			});
	        detailContainerWindow.open();
		} else {
			detailContainerWindow.addEventListener('close', function() {
				Ti.API.info('Received close event. ' + e.path);
				pages[e.title].fireEvent('closing', {});
			});
			navWin.openWindow(detailContainerWindow, {animated:true});
		}
		
		if (e.restore) {
			pages[e.title].fireEvent('restoring', {});
		} else {
			pages[e.title].fireEvent('opening', {});
		}
	}
 
	self = {};
	
	view = Ti.UI.createView({
		backgroundColor: 'white'
	});
	
	menuOptions =
		JSON.parse(Ti.Filesystem.getFile(
			Ti.Filesystem.resourcesDirectory,
			'menu-data.json').read().text);
			
	tableData = [];
	
	menuOptions.forEach(function(menuOption) {
		if (ANDROID && menuOption.platform === 'ios') {
			Ti.API.info('Skipping iOS only sample.');
			return;
		}
		if (!ANDROID && menuOption.platform === 'android') {
			Ti.API.info('Skipping Android only sample.');
			return;
		}
		if (menuOption.minOSVersion && menuOption.minOSVersion > Ti.Platform.version) {
			Ti.API.info('Skipping sample with min OS version of ' +
						menuOption.minOSVersion);
			return;
		}
		tableData.push(menuOption);
		tableData[tableData.length - 1].className = 'row';
		tableData[tableData.length - 1].color = '#000000';
		tableData[tableData.length - 1].hasChild = true;
		tableData[tableData.length - 1].height = '50dp';
		tableData[tableData.length - 1].font = {fontSize : '20dp'};
	});
	
	table = Ti.UI.createTableView({
		data: tableData,
		rowHeight: '100dp',
		minRowHeight: '100dp'
	});
	view.add(table);
	
	table.addEventListener('click', function(e) {
		open({
			title: e.rowData.title,
			path: e.rowData.path,
			restore: false
		});
	});
	
	self.getView = function() {
		return view;
	};
	
	self.open = open;
	
	return self;
}

module.exports = Menu;