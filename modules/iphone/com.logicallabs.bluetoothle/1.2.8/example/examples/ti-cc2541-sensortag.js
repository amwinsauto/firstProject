/* jshint undef: true, unused: true */

/*global Ti, require, module, alert, setTimeout */

/*  
 * This is a "central" implementation that looks for a Texas Instruments CC2541 
 * SensorTag peripheral and receives key and temperature updates from it.
 * "Key" in this context means the buttons on the sensor.
 */

var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib')
;

var
	KEY_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb", 
	KEY_DATA_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb",
	IR_TEMP_SERVICE_UUID = 'F000AA00-0451-4000-B000-000000000000',
	IR_TEMP_DATA_CHAR_UUID = 'F000AA01-0451-4000-B000-000000000000',
	IR_TEMP_CONFIG_CHAR_UUID = 'F000AA02-0451-4000-B000-000000000000';

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
		valueLabel.width = Lib.scale(60);
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
	scanStatus, peripheralStatus, peripheralName,
	ambTempDisplay, objTempDisplay, keysImageView;
	
	var connectedPeripheral;
	
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
	}
	
	function startScan() {
		if (open && !scanRunning) {
			scanRunning = true;
			cancelConnection();
			ambTempDisplay.update('N/A');
			objTempDisplay.update('N/A');
			BluetoothLE.startScan({
				// Scanning for specific service UUID does not work
				// because the device does not advertise the service...
				// UUIDs: [ IR_TEMP_SERVICE_UUID ]
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
	
	function twosComp(value, bitCount) {
		if (value < Math.pow(2, bitCount - 1)) {
			return value;
		}
		
		return value - Math.pow(2, bitCount); 
	}
	
	function getTemperatureValues(buffer) {
		// Self-explanatory calculation courtesy of Texas Instrument
		var ambTemp, objTemp, Vobj2, Tdie2, S0, a1, a2, b0, b1, b2,
		c2, Tref, S, Vos, fObj, Tobj;
		
		if (buffer.length < 4) {
			Lib.log('Invalid temperature values.');
			return -1;
		}
		
		objTemp = twosComp(buffer[0] + 256 * buffer[1], 16);
		ambTemp = twosComp(buffer[2] + 256 * buffer[3], 16) / 128.0;
		
		Vobj2 = objTemp * 0.00000015625;
		Tdie2 = ambTemp + 273.15;
		S0 = 6.4 * Math.pow(10,-14);
		a1 = 1.75 * Math.pow(10,-3);
		a2 = -1.678 * Math.pow(10,-5);
		b0 = -2.94 * Math.pow(10,-5);
		b1 = -5.7 * Math.pow(10,-7);
		b2 = 4.63 * Math.pow(10,-9);
		c2 = 13.4;
		Tref = 298.15;
		S = S0*(1+a1*(Tdie2 - Tref)+a2 * Math.pow((Tdie2 - Tref),2));
		Vos = b0 + b1*(Tdie2 - Tref) + b2 * Math.pow((Tdie2 - Tref),2);
		fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos),2);
		Tobj = Math.pow(Math.pow(Tdie2,4) + (fObj/S), 0.25);
		Tobj = Tobj - 273.15;
		return {
			ambTemp: Math.round(ambTemp *100) / 100.0,
			objTemp: Math.round(Tobj * 100) / 100.0
		};
	}
	
	digestServices = function(e) {
		var services;
		
		// e.source is the peripheral sending the discoveredServices event
		services = e.source.services;
		
		if (!services) {
			return;
		}
		
		Lib.log('Peripheral has ' + services.length + ' services');
		services.forEach(function(service) {
			Lib.log('Discovered service ' + service.UUID);
			if (Lib.uuidMatch(service.UUID, IR_TEMP_SERVICE_UUID)) {
				Lib.log('Found IR temperature service!');
				e.source.discoverCharacteristics({
					service: service
				});
			}
			if (Lib.uuidMatch(service.UUID, KEY_SERVICE_UUID)) {
				Lib.log('Found key service!');
				e.source.discoverCharacteristics({
					service: service
				});
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
			if (Lib.uuidMatch(characteristic.UUID, IR_TEMP_CONFIG_CHAR_UUID)) {
				Lib.log('Found IR temperature config characteristic, will write...');
				connectedPeripheral.writeValueForCharacteristic({
					data: Ti.createBuffer({ value: 0x01, type: Ti.Codec.TYPE_BYTE}),
					characteristic: characteristic,
					type: BluetoothLE.CHARACTERISTIC_TYPE_WRITE_WITH_RESPONSE
				});
			}
			if (Lib.uuidMatch(characteristic.UUID, IR_TEMP_DATA_CHAR_UUID)) {
				if (canSubscribeTo(characteristic)) {
					Lib.log('Found IR temperature data characteristic, will subscribe...');
					connectedPeripheral.subscribeToCharacteristic(characteristic);
				} else {
					Lib.log('Found IR temperature data characteristic but can\'t subscribe...');
				}
			}
			if (Lib.uuidMatch(characteristic.UUID, KEY_DATA_UUID)) {
				if (canSubscribeTo(characteristic)) {
					Lib.log('Found key data characteristic, will subscribe...');
					connectedPeripheral.subscribeToCharacteristic(characteristic);
				} else {
					Lib.log('Found key data characteristic but can\'t subscribe...');
				}
			}
		});	
	};
	
	digestNewCharValue = function(e) {
		var tempValues;
		
		if (e.characteristic) {
			if (e.errorCode !== undefined) {
				Lib.log('Error while reading char ' + e.characteristic.UUID + ' ' +
							e.errorCode + '/' + e.errorDomain + '/' +
							e.errorDescription);
			} else {
				if (Lib.uuidMatch(e.characteristic.UUID, IR_TEMP_DATA_CHAR_UUID)) {
					tempValues = getTemperatureValues(e.characteristic.value);
					Lib.log('Ambient temperature: ' + tempValues.ambTemp);
					Lib.log('Object temperature: ' + tempValues.objTemp);
					ambTempDisplay.update(tempValues.ambTemp);
					objTempDisplay.update(tempValues.objTemp);
				} else if (Lib.uuidMatch(e.characteristic.UUID, KEY_DATA_UUID)) {
					switch (e.characteristic.value[0] % 4) {
					case 0:
						keysImageView.image = '/images/buttonsoffoff.png';
						break;
					case 1:
						keysImageView.image = '/images/buttonsoffon.png';
						break;
					case 2:
						keysImageView.image = '/images/buttonsonoff.png';
						break;
					case 3:
						keysImageView.image = '/images/buttonsonon.png';
						break;
					}
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
		text: 'This is a "central" implementation that looks for a ' +
		'Texas Instruments CC2541 sensor and receives key (button) and ' +
		'temperature updates from it.'
	});
	
	self.add(descriptionLabel);
	
	scanStatus = createDisplay('Scan status:', '');
	peripheralStatus = createDisplay('Peripheral status:', '');
	peripheralName = createDisplay('Peripheral name:', '');
	ambTempDisplay = createDisplay('Ambient Temp:', '°C');
	objTempDisplay = createDisplay('Object Temp:', '°C');
	keysImageView = Ti.UI.createImageView({
		image: '/images/buttonsoffoff.png',
		width: 250,
		height: 90
	});
	
	self.add(scanStatus.getView());
	self.add(peripheralStatus.getView());
	self.add(peripheralName.getView());
	self.add(keysImageView);
	self.add(ambTempDisplay.getView());
	self.add(objTempDisplay.getView());
	
	BluetoothLE.addEventListener('discoveredPeripheral', function(e) {
		if (e.peripheral.name !== 'TI BLE Sensor Tag' &&
				e.peripheral.name !== 'SensorTag')
		{
			Lib.log('Name of peripheral (' +
					e.peripheral.name + ') does not match!');
			return;
		}
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
	});
	
	BluetoothLE.addEventListener('connectedPeripheral', function(e) {
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
		e.peripheral.discoverServices();
	});
	
	BluetoothLE.addEventListener('failedToConnectPeripheral', function(e) {
		peripheralStatus.update('failed to connect');
		peripheralName.update(e.peripheral.name);
		Lib.log('Failed to connect to peripheral: ' + e.peripheral.name);
		alert('Failed to connect to peripheral ' + e.peripheral.name);
		startScan();
	});
	
	BluetoothLE.addEventListener('disconnectedPeripheral', function(e) {
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
		
		startScan();
	});

	self.addEventListener('opening', function() {
		open = true;
		Lib.initBluetoothCentral({
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

	self.addEventListener('closing', function() {
		open = false;
		cancelConnection();
		Lib.shutdownBluetoothCentral();
	});
	return self;
}

module.exports = MainView;