/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false bitwise:true*/
/*global module */

/*  
 * This is a "central" implementation that looks for a heart rate monitor
 * peripheral. The UUIDs used for this service are defined by the Bluetooth SIG
 * so this sample app is expected to work with any heart rate monitory. The
 * specific device type we used for testing was the Zephyr HXM-2.
 */
var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib')
;

var
	HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb',
	HR_CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb',
	BATTERY_SERVICE_UUID = '180f',
	BATTERY_LEVEL_CHAR_UUID = '2a19';

function createDisplay(preText, postText) {
	var self, parent, valueLabel, frontLabel, backLabel;
	
	function getBaseLabel(text) {
		return Ti.UI.createLabel({
			text: text,
			color: 'white',
			font: {
				fontSize: Lib.scale(12)
			},
			left: Lib.scale(10),
			height: Lib.scale(40)
		});
	}
	
	self = {};
	
	parent = Ti.UI.createView({
		width: '100%', height: Lib.scale(40),
		layout: 'horizontal'
	});
	
	frontLabel = getBaseLabel(preText);
	valueLabel = getBaseLabel('N/A');
	backLabel = getBaseLabel(postText);
	
	if (postText === '') {
		valueLabel.width = Lib.scale(200);
	} else {
		valueLabel.width = Lib.scale(30);
	}
	valueLabel.textAlign = 'center';
	
	self.getView = function() {
		return parent;
	};
	
	self.update = function(text) {
		valueLabel.backgroundColor = '#800000';
		valueLabel.text = text;
		setTimeout(function() { valueLabel.backgroundColor = '#8E8E8E'; }, 100);
	};
	
	self.getView().add(frontLabel);
	self.getView().add(valueLabel);
	self.getView().add(backLabel);
	
	return self;
}

function MainView() {
	var self, descriptionLabel,
	batteryButton, scanStatus, peripheralStatus, peripheralName,
	heartRateDisplay, batteryDisplay, killButton;
	
	var connectedPeripheral,
		heartRateChar,
		batteryChar;
	
	var digestServices, digestCharacteristics, digestNewCharValue;
	
	var scanRunning = false, open = false;
	
	function cancelConnection() {
		if (connectedPeripheral) {
			Lib.log('Cancelling previous connection.');
			BluetoothLE.cancelPeripheralConnection(connectedPeripheral);
			connectedPeripheral = null;
		} else {
			peripheralStatus.update('N/A');
			peripheralName.update('N/A');
		}
		batteryButton.visible = false;
	}
	
	function startScan() {
		if (open && !scanRunning) {
			scanRunning = true;
			cancelConnection();
			heartRateDisplay.update('N/A');
			batteryDisplay.update('N/A');
			Lib.log('Will start scanning now...');
			BluetoothLE.startScan({
				UUIDs: [ HR_SERVICE_UUID ]
			});
			scanStatus.update('On');
		}
	}
	
	function stopScan() {
		BluetoothLE.stopScan();
		Lib.log('Stopped scanning.');
		scanStatus.update('off');
		scanRunning = false;
	}

	function canSubscribeTo(characteristic) {
		return characteristic.properties & BluetoothLE.CHAR_PROP_NOTIFY ||
		characteristic.properties & BluetoothLE.CHAR_PROP_INDICATE;
	}
	
	digestServices = function(e) {
		var services;
		
		// e.source is the peripheral sending the discoveredServices event
		services = e.source.services;
		
		Lib.log('Peripheral has ' + services.length + ' services');
		services.forEach(function(service) {
			if (Lib.uuidMatch(service.UUID, HR_SERVICE_UUID)) {
				Lib.log('Heart rate service discovered!');
				if (heartRateChar) {
					Lib.log('... but we already have the heart rate characteristic!');
					// This can happen if the app is being restored.
				} else {
					Lib.log('Let\'s retrieve the heart rate characteristic!');
					e.source.discoverCharacteristics({
						service: service
					});
				}
			}
			if (Lib.uuidMatch(service.UUID, BATTERY_SERVICE_UUID)) {
				Lib.log('Battery service discovered!');
				if (batteryChar) {
					Lib.log('... but we already have the battery characteristic!');
					// This can happen if the app is being restored.
				} else {
					Lib.log('Let\'s retrieve the battery characteristic!');
					e.source.discoverCharacteristics({
						service: service
					});
				}
			}
		});
	};
	
	digestCharacteristics = function(e) {
		var characteristics;
		
		if (e.errorCode !== undefined) {
			Lib.log('Error while discovering characteristics: ' +
						e.errorCode + '/' + e.errorDomain + '/' +
						e.errorDescription);
			return;
		}
		characteristics = e.service.characteristics;
		characteristics.forEach(function(characteristic) {
			Lib.log('characteristic.UUID: '  + characteristic.UUID);
			if (Lib.uuidMatch(characteristic.UUID, HR_CHAR_UUID)) {
				heartRateChar = characteristic;
				if (canSubscribeTo(heartRateChar)) {
					Lib.log('Found heart rate characteristic, will subscribe...');
					connectedPeripheral.subscribeToCharacteristic(heartRateChar);
				} else {
					Lib.log('Found heart rate characterisic but can\'t subscribe...');
				}
			}
			
			if (Lib.uuidMatch(characteristic.UUID, BATTERY_LEVEL_CHAR_UUID)) {
				batteryChar = characteristic;
				batteryButton.visible = true;
			}
		});	
	};
	
	digestNewCharValue = function(e) {
		if (e.characteristic) {
			if (e.errorCode !== undefined) {
				Lib.log('Error while reading char ' + e.characteristic.UUID + ' ' +
							e.errorCode + '/' + e.errorDomain + '/' +
							e.errorDescription);
			} else {
				if (Lib.uuidMatch(e.characteristic.UUID, HR_CHAR_UUID)) {
					Lib.log('Got heart rate update: ' +
							e.characteristic.value[1] + 'bpm');
					heartRateDisplay.update(e.characteristic.value[1]);
				} else if (e.characteristic.equals(batteryChar)) {
					batteryDisplay.update(e.characteristic.value[0]);
				} else {
					Lib.log('Received value for char ' + e.characteristic.UUID.toLowerCase() +
					': ' + e.characteristic.value);
				}
			}
		} else {
			Lib.log('Received updatedValueForCharacteristic event without characteristic object.');
			if (e.errorCode) {
				Lib.log('Error while reading char: ' +
							e.errorCode + '/' + e.errorDomain + '/' +
							e.errorDescription);
			}
		}
	};
	
	self = Ti.UI.createView({  
	    backgroundColor:'#8E8E8E',
	    layout: 'vertical'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text: 'This is a "central" implementation that looks for a heart ' +
		'rate monitor peripheral. The UUIDs used for this service are ' +
		'defined by the Bluetooth SIG  so this sample app is expected ' +
		'to work with any heart rate monitory. The specific device type ' +
		'we used for testing was the Zephyr HXM-2.'
	});
	
	self.add(descriptionLabel);
	
	scanStatus = createDisplay('Scan status:', '');
	peripheralStatus = createDisplay('Peripheral status:', '');
	peripheralName = createDisplay('Peripheral name:', '');
	heartRateDisplay = createDisplay('Heart rate:', 'bpm');
	batteryDisplay = createDisplay('Battery status:', '%');
	
	self.add(scanStatus.getView());
	self.add(peripheralStatus.getView());
	self.add(peripheralName.getView());
	self.add(heartRateDisplay.getView());
	self.add(batteryDisplay.getView());
	
	batteryButton = Lib.createDefaultButton({
		title: 'Read battery status',
		visible: false
	});
	
	batteryButton.addEventListener('click', function() {
		if (connectedPeripheral && batteryChar) {
			connectedPeripheral.readValueForCharacteristic(batteryChar);
		}
	});
	
	self.add(batteryButton);	
		
	killButton = Lib.createDefaultButton({
		title: 'Kill App (for restore testing)'
	});
	if (Lib.isIOS()) {
		killButton.addEventListener('click', function() {
			BluetoothLE.killApp();
		});
		
		self.add(killButton);
	}
	
	function didDiscoverPeripheral(e) {
		if (!connectedPeripheral) {
			peripheralStatus.update('discovered');
			peripheralName.update(e.peripheral.name);
			Lib.log('Discovered peripheral: ' +
							e.peripheral.name + '/' + e.peripheral.address);
			
			stopScan();
			BluetoothLE.connectPeripheral({
				peripheral: e.peripheral,
				autoConnect: false
			});
		} else {
			Lib.log('Received discoveredPeripheral event for previously discovered peripheral.');
		}
	}
	
	BluetoothLE.addEventListener('discoveredPeripheral', didDiscoverPeripheral);
	
	function didConnectPeripheral(e) {
		var heartRateService, batteryService;
		
		// You must assign e.peripheral to a variable that will not be garbage
		// collected, if you want to do service discovery!
		if (connectedPeripheral && !connectedPeripheral.equals(e.peripheral)) {
			cancelConnection();
		}
	
		connectedPeripheral = e.peripheral;
		
		peripheralStatus.update('connected');
		peripheralName.update(e.peripheral.name);
		Lib.log('Connected peripheral: ' +
							e.peripheral.name + '/' + e.peripheral.address);
		
		e.peripheral.addEventListener('discoveredServices', digestServices);
		e.peripheral.addEventListener('discoveredCharacteristics', digestCharacteristics);
		e.peripheral.addEventListener('updatedValueForCharacteristic', digestNewCharValue);
		
		// NOTE: What follows here is a somewhat simplified check whether
		// we already know the services of the peripheral. This may happen
		// if we are being restored as opposed to starting from scratch.
		// If it looks like we already know the services, we can skip
		// the service discovery part.
		// Similar checks can be implemented to see if we already know
		// the characteristics.

		heartRateChar = null;
		batteryChar = null;
		
		e.peripheral.services.forEach(function(service) {
			if (Lib.uuidMatch(service.UUID, HR_SERVICE_UUID)) {
				Lib.log('Heart rate service restored!');
				heartRateService = service;
				service.characteristics.forEach(function(characteristic) {
					if (Lib.uuidMatch(characteristic.UUID, HR_CHAR_UUID)) {
						Lib.log('Heart rate characteristic restored!');
						heartRateChar = characteristic;
					}
				});
			}
			if (Lib.uuidMatch(service.UUID, BATTERY_SERVICE_UUID)) {
				Lib.log('Battery service restored!');
				batteryService = service;
				service.characteristics.forEach(function(characteristic) {
					if (Lib.uuidMatch(characteristic.UUID, BATTERY_LEVEL_CHAR_UUID)) {
						Lib.log('Battery characteristic restored!');
						batteryChar = characteristic;
					}
				});
			}
		});	
		
		if (heartRateChar && heartRateChar.isNotifying && batteryChar) {
			// This means everything got restored, which is what you would expect
			// most of the time.
			Lib.log('Heart rate char is already notifying and we have the battery char!');
			batteryButton.visible = true;
		} else {
			// This means restoration is not 100%. Here we could try to
			// piecemeal it and figure out which service/characteristic is
			// missing. For sake of simplicity, we'll just start from the
			// service discovery.
			heartRateChar = null;
			batteryChar = null;
			e.peripheral.discoverServices();
		}
	}
	
	BluetoothLE.addEventListener('connectedPeripheral', didConnectPeripheral);
	
	BluetoothLE.addEventListener('failedToConnectPeripheral', function(e) {
		peripheralStatus.update('failed to connect');
		peripheralName.update(e.peripheral.name);
		Lib.log('Failed to connect to peripheral: ' + e.peripheral.name);
		alert('Failed to connect to peripheral ' + e.peripheral.name);
		startScan();
	});
	
	BluetoothLE.addEventListener('disconnectedPeripheral', function(e) {
		Lib.log('Received disconnectedPeripheral event.');
		
		if (connectedPeripheral) {
			peripheralStatus.update('disconnected');
			peripheralName.update(e.peripheral.name);
			connectedPeripheral.removeEventListener(
				'discoveredServices', digestServices);
			connectedPeripheral.removeEventListener(
				'discoveredCharacteristics', digestCharacteristics);
			connectedPeripheral.removeEventListener(
				'updatedValueForCharacteristic', digestNewCharValue);
		}
		
		heartRateChar = null;
		batteryChar = null;	
		batteryButton.visible = false;
		
		startScan();
	});

	BluetoothLE.addEventListener('centralWillRestoreState', function(e) {
		if (!open) {
			return;
		}
		Lib.log('Received centralWillRestoreState event.');
		
		scanRunning = false;

		// e.serviceUUIDs is an array of strings, holding the UUIDs of
		// the services we are already scanning for.		
		e.serviceUUIDs.forEach(function(serviceUUID) {
			if (Lib.uuidMatch(serviceUUID, HR_SERVICE_UUID)) {
				scanRunning = true;
			}
		});
		
		if (scanRunning) {
			Lib.log('We are already scanning!');
			scanStatus.update('On');
		} else {
			Lib.log('Scanning is off!');
			scanStatus.update('Off');
		}
		
		if (e.peripherals.length > 0) {
			Lib.log('We have a restored peripheral...');
			if (e.peripherals[0].isConnected) {
				Lib.log('... and it is connected!');
				didConnectPeripheral({
					peripheral: e.peripherals[0]
				});
			} else {
				Lib.log('... but it is not connected -- let\'s connect!');
				didDiscoverPeripheral({
					peripheral: e.peripherals[0]
				});
			}
		} else {
			Lib.log('We don\'t have a restored peripheral!');
			// The startScan function is smart enough not to do anything
			// if scanRunning === true.
			startScan();
		}
	});
	

	self.addEventListener('opening', function() {
		Lib.log('Opening heart rate monitor example...');
		open = true;
		Lib.initBluetoothCentral({
			restoreIdentifier: 'heart-rate-monitor',
			onCallback: function() {
				startScan();
			},
			offCallback: function() {
				stopScan();
				cancelConnection();
			},
			errorCallback: function(desc) {
				Lib.log(desc);
			}
		});
	});

	self.addEventListener('restoring', function() {
		Lib.log('Restoring heart rate monitor example...');
		open = true;
		Lib.initBluetoothCentral({
			restoreIdentifier: 'heart-rate-monitor'
		});
	});

	self.addEventListener('closing', function() {
		open = false;
		cancelConnection();
		Lib.shutdownBluetoothCentral();
	});
	return self;
}

module.exports = MainView;