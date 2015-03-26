/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false*/
/*global module */

var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib'),
	// BEACON_REGION_UUIDS holds the UUIDs of the regions this app deals with.
	// The central/monitoring side monitors for all of these regions
	// simultaneously. The peripheral/beacon side cycles through them one by
	// one, every time it's restarted.
	BEACON_REGION_UUIDS = [
		'00000000-0000-1000-8000-00805F9B4000',
		'00000000-0000-1000-8000-00805F9B4001',
		'8DEEFBB9-F738-4297-8040-96668BB44281',
		'B9407F30-F5F8-466E-AFF9-25556B57FE6D'
	],
	androidNotificationId = 1
;


function MainView() {
	var self, descriptionLabel, statusLabel,
		initCentralButton, initBeaconButton, shutdownButton, table;
		
	var beaconRegions, open = false;
	
	var digestServices, digestCharacteristics, digestNewValue, digestNewRSSI,
		digestWroteValue;
	
	var weAreTheUser = false, weAreTheBeacon = false, rangingInProgress = false;
	
	var counter = 0;
	
	var tableRowsByRegion = {};
	
	function initBeaconRegionsForCentral() {
		// The difference between this and initBeaconRegionsForBeacon is
		// that the latter initializes the beacon with a specific major/minor
		// number. This allows us to test the case where the app in the central
		// role scans for a wider range of beacons than what the app in the
		// beacon role advertises.
		var idCounter = 0;
		beaconRegions = [];
		BEACON_REGION_UUIDS.forEach(function(uuid) {
			beaconRegions.push(BluetoothLE.createBeaconRegion({
					UUID: uuid,
					identifier: '#' + idCounter
			}));
			idCounter++;
		});
	}
	
	function initBeaconRegionsForBeacon() {
		// The difference between this and initBeaconRegionsForCentral is
		// that the latter initializes the beacon without a specific major/minor
		// number. This allows us to test the case where the app in the central
		// role scans for a wider range of beacons than what the app in the
		// beacon role advertises.
		var idCounter = 0;
		beaconRegions = [];
		BEACON_REGION_UUIDS.forEach(function(uuid) {
			beaconRegions.push(BluetoothLE.createBeaconRegion({
					UUID: uuid,
					identifier: '#' + idCounter,
					major: 1,
					minor: 2
			}));
			idCounter++;
		});
	}
	
	self = Ti.UI.createView({  
	    layout: 'vertical',
		backgroundColor: '#8E8E8E'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text: 'This example demonstrates the use of iBeacons. ' +
		'It requiries iOS 7.0 or above or Android 4.3 or above. ' +
		'On iOS, the same app can act as a receiver or ' +
		'as a beacon -- by default, it will only connect to itself and to ' +
		'Estimote beacons.'
	});
	
	self.add(descriptionLabel);
	
	statusLabel = Lib.createStatusLabel({
		text: 'Choose a role:'	
	});
	
	self.add(statusLabel);
	
	function setStatus(text) {
		statusLabel.text = text;
		Ti.API.info(text);
	}
	
	initCentralButton = Lib.createDefaultButton({
		title: 'Be the monitor'
	});
	
	function setupAsUser() {
		weAreTheUser = true;
		weAreTheBeacon = false;
		initCentralButton.visible = false;
		initBeaconButton.visible = false;
		shutdownButton.visible = true;
		table.visible = true;
	}
	
	function initCentral() {
		// Central === user (as opposed to beacon).
		setupAsUser();
		initBeaconRegionsForCentral();
		beaconRegions.forEach(function(region) {
			BluetoothLE.startRegionMonitoring({
				beaconRegion: region
			});
			BluetoothLE.requestRegionState({
				beaconRegion: region
			});
			//
			// The recommended approach is to start ranging for beacons
			// only when you are inside a region, and stop ranging for them
			// when you exit the region. Some native apps out there ignore
			// this recommendation and range continuously. If you want to
			// match that behavior, uncomment the following function call
			// and comment out the stopRangingBeacons and startRangingBeacons
			// calls in the regionStateUpdated event handler.
			//
			// BluetoothLE.startRangingBeacons({
				// beaconRegion: region
			// });
		});
		Ti.API.info('Location manager authorization status: ' +
						 BluetoothLE.locationManagerAuthorizationStatus);
		setStatus('Started region monitoring...');
	}
		
	initCentralButton.addEventListener('click', initCentral);
	
	self.add(initCentralButton);
	
	initBeaconButton = Lib.createDefaultButton({
		title: 'Be the beacon'
	});
	
	initBeaconButton.addEventListener('click', function() {
		if (Lib.isAndroid()) {
			// Android doesn't implement the peripheral part...
			alert('Android devices cannot be beacons!');
			return;
		}
		weAreTheBeacon = true;
		weAreTheUser = false;
		initBeaconRegionsForBeacon();
		initCentralButton.visible = false;
		initBeaconButton.visible = false;
		setStatus('Initializing peripheral...');
		BluetoothLE.initPeripheralManager({
			// If you set this to false, the user won't be notified if Bluetooth
			// is off -- and you will receive PERIPHERAL_MANAGER_STATE_POWERED_OFF
			// status event instead of PERIPHERAL_MANAGER_STATE_POWERED_ON. 
			showPowerAlert: true
		});
		shutdownButton.visible = true;
	});
	
	self.add(initBeaconButton);
	
	shutdownButton = Lib.createDefaultButton({
		title: 'Shutdown',
		visible: false
	});
	
	function shutdown() {
		if (weAreTheUser) {
			BluetoothLE.stopRangingBeacons();
			BluetoothLE.stopRegionMonitoring();
			table.setData([]);
			table.visible = false;
			setStatus('Stopped monitoring.');
		}
		if (weAreTheBeacon) {
			BluetoothLE.stopAdvertising();
			BluetoothLE.releasePeripheralManager();
			setStatus('Released peripheral');
		}
		
		shutdownButton.visible = false;
	
		initCentralButton.visible = true;
		initBeaconButton.visible = true;
		
		weAreTheBeacon = false;
		weAreTheUser = false;
	}
	
	shutdownButton.addEventListener('click', shutdown);
	
	self.add(shutdownButton);
	
	BluetoothLE.addEventListener('locationManagerAuthorizationChanged', function(e) {
		if (!open) {
			return;
		}
		switch (e.status) {
			case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_NOT_DETERMINED:
				Ti.API.info('Location manager changed authorization status to undetermined.');
				break;
			case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_RESTRICTED:
				Ti.API.info('Location manager changed authorization status to restricted.');
				break;
			case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_DENIED:
				Ti.API.info('Location manager changed authorization status to denied.');
				break;
			case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_AUTHORIZED:
				Ti.API.info('Location manager changed authorization status to authorized.');
				break;
			default:
				Ti.API.info('Unknown authorization status!');
		}
	});

	table = Ti.UI.createTableView({
		width: '100%',
		backgroundColor: '#8E8E8E',
		top: Lib.scale(10),
		height: Lib.scale(160),
		visible: false
	});
	
	self.add(table);
	
	BluetoothLE.addEventListener('peripheralManagerStateChange', function(e) {
		var advertParams;
		
		if (!open) {
			return;
		}
		switch (e.state) {
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNKNOWN:
				Ti.API.info('Peripheral manager changed state to unknown.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_RESETTING:
				Ti.API.info('Peripheral manager changed state to resetting.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNSUPPORTED:
				Ti.API.info('Peripheral manager changed state to unsupported.');
				setStatus('Bluetooth LE is not supported.');				
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNAUTHORIZED:
				Ti.API.info('Peripheral manager changed state to unauthorized.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_POWERED_OFF:
				Ti.API.info('Peripheral manager changed state to powered off.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_POWERED_ON:
				Ti.API.info('Peripheral manager changed state to powered on.');
				setStatus('Firing up beacon #' + (counter % beaconRegions.length) + '...');
				BluetoothLE.startAdvertising({
					beaconRegion: beaconRegions[counter % beaconRegions.length]
				});
				counter++;
				break;			
		}
	});
	
	BluetoothLE.addEventListener('proximityChange', function(e) {
		var i;
		
		if (!open) {
			return;
		}
		Ti.API.info('Number of beacons that changed proximity: ' + e.beacons.length);
		i = 0;
		e.beacons.forEach(function(beacon) {
			i++;
			Ti.API.info('Beacon #' + i);
			Lib.printBeaconInfo(beacon);
		});
	});
	
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
		var stateStr, statusMsg, intent;
		
		if (!open) {
			return;
		}

		Ti.API.info('regionStateUpdated event received for region ' +
						e.region.UUID + '/' + e.region.identifier + ': ' +
						e.state);

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
		statusMsg = 'Region state for ' + e.region.UUID.slice(-4) + ' is now ' +
					stateStr;
		setStatus(statusMsg);
		
		if (Lib.isInForeground() || e.state === BluetoothLE.REGION_STATE_UNKNOWN) {
			// The remainder of this callback posts a local notification;
			// we don't want that if the app is in the foreground or if
			// all we've got to say is "state is unknown".
			return;
		}
		
		if (Lib.isIOS()) {
			Ti.App.iOS.scheduleLocalNotification({
				alertBody: statusMsg,
				date: new Date(new Date().getTime() + 100)
			});
		}
		if (Lib.isAndroid()) {
			intent = Ti.Android.createIntent({
			    flags : Ti.Android.FLAG_ACTIVITY_BROUGHT_TO_FRONT,
			    // Substitute the correct classname for your application
			    className : 'com.logicallabs.bletest.BluetoothletestActivity'
			});

			// Note: Unlike iOS, Android will post the local notification
			// even if the app is in the foreground.
			Titanium.Android.NotificationManager.notify(
				androidNotificationId++, 
				Ti.Android.createNotification({
					contentTitle: 'iBeacons Test',
					contentText: statusMsg,
					contentIntent: Ti.Android.createPendingIntent({
					    intent: intent,
					    flags: Ti.Android.FLAG_UPDATE_CURRENT
					})
				})
			);
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

	BluetoothLE.addEventListener('retrievedMonitoredRegions', function(e) {
		var areAllRegionsMonitored;
		
		beaconRegions = e.beaconRegions;
		
		areAllRegionsMonitored = true;
		
		BEACON_REGION_UUIDS.forEach(function(regionUUID) {
			var isRegionMonitored;
			
			isRegionMonitored = false;
			beaconRegions.forEach(function(region) {
				if (Lib.uuidMatch(regionUUID, region.UUID)) {
					Lib.log('Region ' + regionUUID + ' is monitored!');
					isRegionMonitored = true;
				}
			});
			
			areAllRegionsMonitored = areAllRegionsMonitored && isRegionMonitored;
		});
		
		
		if (areAllRegionsMonitored) {
			Lib.log('All regions restored!');
		} else {
			Lib.log('Some regions were not restored!');
			// For the sake of consistency, if we don't have all the regions
			// we'll just reset everything.
			shutdown();
			initCentral();
		}
	});

	self.addEventListener('opening', function() {
		Ti.API.info('Opening iBeacon example...');
		open = true;
	});
	
	self.addEventListener('restoring', function() {
		Ti.API.info('Restoring iBeacon example...');
		open = true;
		setupAsUser();
		BluetoothLE.retrieveMonitoredRegions();
	});
	
	self.addEventListener('closing', function() {
		Ti.API.info('Closing iBeacon example...');
		shutdown();
		open = false;
	});
	return self;
}

module.exports = MainView;