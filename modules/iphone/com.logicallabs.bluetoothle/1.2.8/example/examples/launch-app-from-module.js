/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false*/
/*global module */

/*
 * This example demonstrates how the module can start the app when Bluetooth
 * activity is detected. Specifically, it starts the app when the user
 * enters a beacon region. The beacon regions of interest are identified
 * by the BEACON_REGION_UUIDS array below. If the app's main activity is
 * running, even if in the background, the JavaScript code can receive
 * the BluetoothLE events normally. In order to see the benefit of this
 * feature, you tap the "Turn On App Launching" button and then reboot the
 * Android device. At boot, a service that's part of the module will start
 * and continue monitoring for the regions specified below. When a beacon
 * of interest appears, it will launch the app.
 */
var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib'),
	BEACON_REGION_UUIDS = [
		'00000000-0000-1000-8000-00805F9B4001'
	],
	TURN_ON_TITLE = 'Turn On App Launching',
	TURN_OFF_TITLE = 'Turn Off App Launching'
;

function MainView() {
	var self, descriptionLabel, statusLabel,
		setupToggleButton, table;
		
	var beaconRegions, open = false;
	
	var digestServices, digestCharacteristics, digestNewValue, digestNewRSSI,
		digestWroteValue;
	
	var weAreTheUser = false, rangingInProgress = false;
	
	var counter = 0;
	
	var tableRowsByRegion = {};
	
	(function initBeaconRegions() {
		var idCounter = 0;
		beaconRegions = [];
		BEACON_REGION_UUIDS.forEach(function(uuid) {
			beaconRegions.push(BluetoothLE.createBeaconRegion({
					UUID: uuid,
					identifier: '#' + idCounter
			}));
			idCounter++;
		});
	}());
	
	function startMonitoring() {
		beaconRegions.forEach(function(region) {
			BluetoothLE.startRegionMonitoring({
				beaconRegion: region
			});
		});
	}
	
	function stopMonitoring() {
		BluetoothLE.stopRangingBeacons();
		beaconRegions.forEach(function(region) {
			BluetoothLE.stopRegionMonitoring({
				beaconRegion: region
			});
		});
	}
	
	self = Ti.UI.createView({  
	    layout: 'vertical',
		backgroundColor: '#8E8E8E'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text: 'This example demonstrates how the module can start the app ' +
		'when Bluetooth activity is detected. ' +
		'It only works on Android and it requiries Android 4.3 or above. ' +
		'Please read the comments in the source for full details.'
	});
	
	self.add(descriptionLabel);
	
	statusLabel = Lib.createStatusLabel();
	
	self.add(statusLabel);
	
	function updateStatus() {
		if (BluetoothLE.isAppLaunchConfigured()) {
			statusLabel.text = 'App launch is configured.';
			setupToggleButton.title = TURN_OFF_TITLE;
			// "app launch configured" just means that the app will be
			// launched if any of the monitored regions are detected.
			// It doesn't automatically mean that any regions are actually
			// being monitored. Therefore we explicitly start monitoring
			// here:
			startMonitoring();
		} else {
			statusLabel.text = 'App launch is not configured.';
			setupToggleButton.title = TURN_ON_TITLE;
		}
	}
	
	setupToggleButton = Lib.createDefaultButton({
		// This call to isAppLaunchConfigured will usually fail because
		// the module is not ready yet -- see 'moduleReady' event handler.
		title: BluetoothLE.isAppLaunchConfigured() ?
				TURN_OFF_TITLE : TURN_ON_TITLE
	});
	
	setupToggleButton.addEventListener('click', function() {
		if (setupToggleButton.title === TURN_ON_TITLE) {
			startMonitoring();
			BluetoothLE.setAppLaunchIntent({
				packageName: 'com.logicallabs.bletest',
				className: 'BluetoothletestActivity'
			});
		} else {
			stopMonitoring();
			BluetoothLE.clearAppLaunchIntent();
			table.setData([]);
		}
		updateStatus();
	});
	
	self.add(setupToggleButton);
	
	table = Ti.UI.createTableView({
		width: '100%',
		backgroundColor: '#8E8E8E',
		top: Lib.scale(10),
		height: Lib.scale(160)
	});
	
	self.add(table);
	
	updateStatus();

	BluetoothLE.addEventListener('rangedBeacons', function(e) {
		var i, tableData;
		
		if (!open) {
			return;
		}
		Ti.API.info('Beacons in range: ' + e.beacons.length);
		
		tableRowsByRegion[e.region.UUID] = [];
		e.beacons.forEach(function(beacon) {
			tableRowsByRegion[e.region.UUID].push(Lib.createBeaconRow(beacon));
		});
		
		tableData = [];
		BEACON_REGION_UUIDS.forEach(function(uuid) {
			if (tableRowsByRegion[uuid]) {
				tableRowsByRegion[uuid].forEach(function(row) {
					tableData.push(row);
				});
			}
		});
		table.setData(tableData);

		Ti.API.info('Region.UUID: ' + e.region.UUID);
		Ti.API.info('Region.major: ' + e.region.major);
		Ti.API.info('Region.minor: ' + e.region.minor);
		
		i = 0;
		e.beacons.forEach(function(beacon) {
			i++;
			Ti.API.info('Beacon #' + i);
			Lib.printBeaconInfo(beacon);
		});
	});
	
	BluetoothLE.addEventListener('regionStateUpdated', function(e) {
		var stateStr;
		
		Ti.API.info('regionStateUpdated event received for region ' +
						e.region.UUID + '/' + e.region.identifier);
		if (!open) {
			return;
		}
		switch(e.state) {
			case BluetoothLE.REGION_STATE_UNKNOWN:
				stateStr = 'unknown';
				break;
			case BluetoothLE.REGION_STATE_INSIDE:
				BluetoothLE.startRangingBeacons({
					beaconRegion: e.region
				});
				stateStr = 'inside.';
				break;
			case BluetoothLE.REGION_STATE_OUTSIDE:
				BluetoothLE.stopRangingBeacons({
					beaconRegion: e.region
				});
				stateStr = 'outside.';
				break;
		}
	});
	
	BluetoothLE.addEventListener('enteredRegion', function(e) {
		if (!open) {
			return;
		}
		// In theory, we could use this event instead of regionStateUpdated
		// to turn on ranging; however, our testing indicated that this event
		// is less reliable, so we recommend using regionStateUpdated instead.
		Ti.API.info('Received enteredRegion event for region ' + e.region.UUID);
	});
	
	BluetoothLE.addEventListener('exitedRegion', function(e) {
		if (!open) {
			return;
		}
		// In theory, we could use this event instead of regionStateUpdated
		// to turn off ranging; however, our testing indicated that this event
		// is less reliable, so we recommend using regionStateUpdated instead.
		Ti.API.info('Received exitedRegion event for region ' + e.region.UUID);
	});

	self.addEventListener('opening', function() {
		Ti.API.info('Opening Launch App example...');
		updateStatus();
		open = true;
	});
	
	self.addEventListener('closing', function() {
		Ti.API.info('Closing Launch App example...');
		open = false;
	});
	return self;
}

module.exports = MainView;