/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false*/
/*global module */

var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib'),
	ESTIMOTE_UUID = 'B9407F30-F5F8-466E-AFF9-25556B57FE6D'
;

function getProximityString(beacon) {
	var result;
	
	switch(beacon.proximity) {
		case BluetoothLE.BEACON_PROXIMITY_UNKNOWN:
			result = 'unkown';
			break;
		case BluetoothLE.BEACON_PROXIMITY_IMMEDIATE:
			result = 'immediate';
			break;
		case BluetoothLE.BEACON_PROXIMITY_NEAR:
			result = 'near';
			break;
		case BluetoothLE.BEACON_PROXIMITY_FAR:
			result = 'far';
			break;
	}
	return result;
}

function createBeaconRow(beacon) {
	var result, topLabel, bottomLabel;

	function createLabel() {
		return Ti.UI.createLabel({
			left: Lib.scale(15),
			height: Lib.scale(20), width: '100%',
			color: 'white',
			font: {
				fontSize: Lib.scale(12)
			}
		});
	}
	
	result = Ti.UI.createTableViewRow({
		height: Lib.scale(50), width: '100%'
	});
	
	topLabel = createLabel();
	topLabel.top = 0;
	topLabel.text = 'Major/minor: ' + beacon.major + '/' + beacon.minor;

	bottomLabel = createLabel();
	bottomLabel.top = Lib.scale(20);
	bottomLabel.text = 'Proximity/RSSI/Accuracy: ' +
				getProximityString(beacon) + '/' +
				beacon.RSSI + '/' +
				beacon.accuracy.toFixed(2);
					
	result.add(topLabel);
	result.add(bottomLabel);
	
	return result;
}

function MainView() {
	var self, descriptionLabel, statusLabel,
		onOffButton, table;
		
	var beaconRegion = BluetoothLE.createBeaconRegion({
					UUID: ESTIMOTE_UUID,
					identifier: 'Estimote Beacons'
			});
	var open = false;
	
	var digestServices, digestCharacteristics, digestNewValue, digestNewRSSI,
		digestWroteValue;
	
	var rangingInProgress = false;
	
	var counter = 0;
	
	function startMonitoring() {
		BluetoothLE.startRegionMonitoring({
			beaconRegion: beaconRegion
		});
		BluetoothLE.requestRegionState({
			beaconRegion: beaconRegion
		});
	}
	
	function stopMonitoring() {
		BluetoothLE.stopRegionMonitoring({
			beaconRegion: beaconRegion
		});
	}
	
	function startRanging() {
		BluetoothLE.startRangingBeacons({
			beaconRegion: beaconRegion
		});
		rangingInProgress = true;
	}
	
	function stopRanging() {
		BluetoothLE.stopRangingBeacons({
			beaconRegion: beaconRegion
		});
		rangingInProgress = false;
	}
	
	self = Ti.UI.createView({  
	    layout: 'vertical',
		backgroundColor: '#8E8E8E'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text: 'This example demonstrates the use of Estimote Beacons. ' +
		'It requiries iOS 7.0 or above. '
	});
	
	self.add(descriptionLabel);
	
	statusLabel = Lib.createStatusLabel({
		text: 'Click button to start scanning!'	
	});
	
	self.add(statusLabel);
	
	function setStatus(text) {
		statusLabel.text = text;
		Ti.API.info(text);
	}

	function shutdown() {
		stopRanging();
		stopMonitoring();
		table.setData([]);
		setStatus('Stopped scanning.');
	}
		
	onOffButton = Lib.createDefaultButton({
		title: 'Start Scanning'
	});
	
	onOffButton.addEventListener('click', function() {
		if (onOffButton.title === 'Start Scanning') {
			startMonitoring();
			setStatus('Started scanning');
			onOffButton.title = 'Stop Scanning';
		} else {
			shutdown();
			onOffButton.title = 'Start Scanning';
		}
	});
	
	self.add(onOffButton);
	
	table = Ti.UI.createTableView({
		width: '100%',
		backgroundColor: '#8E8E8E',
		top: Lib.scale(10),
		height: Lib.scale(260)
	});
	
	self.add(table);
	
	BluetoothLE.addEventListener('rangedBeacons', function(e) {
		var tableData;
		
		if (!open) {
			return;
		}
		
		if (e.beacons.length === 0) {
			return;
		}

		tableData = [];
		e.beacons.forEach(function(beacon) {
			tableData.push(createBeaconRow(beacon));
		});
		table.setData(tableData);
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
				startRanging();
				stateStr = 'inside.';
				break;
			case BluetoothLE.REGION_STATE_OUTSIDE:
				stopRanging();
				table.setData([]);
				stateStr = 'outside.';
				break;
		}
		setStatus('State for Estimote region is now ' + stateStr);
	});
	
	BluetoothLE.addEventListener('enteredRegion', function(e) {
		if (!open) {
			return;
		}
		setStatus('Estimote beacon detected!');
		// In theory, we could use this event instead of regionStateUpdated
		// to turn on ranging; however, our testing indicated that this event
		// is less reliable, so we recommend using regionStateUpdated instead.
		// startRanging();
	});
	
	BluetoothLE.addEventListener('exitedRegion', function(e) {
		if (!open) {
			return;
		}
		setStatus('Lost contact with Estimote beacons!');
		// In theory, we could use this event instead of regionStateUpdated
		// to turn off ranging; however, our testing indicated that this event
		// is less reliable, so we recommend using regionStateUpdated instead.
		// stopRanging();
		// table.setData([]);
	});

	self.addEventListener('opening', function() {
		Ti.API.info('Opening Estimote Beacons example...');
		open = true;
	});
	
	self.addEventListener('closing', function() {
		Ti.API.info('Closing Estimote Beacons example...');
		shutdown();
		open = false;
	});
	return self;
}

module.exports = MainView;