/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false bitwise:true*/
/*global module*/

/******************************
 * 
 * This sample app is a central implementation that was specifically created
 * to demonstrate interoperability with the HoMedics personal blood pressure
 * and heart rate monitor devices. It may work with other similar health
 * monitoring devices as well, although the HoMedics device reports the
 * blood pressure numbers as decimals instead of floating point numbers --
 * see comment inside bloodPressureConverter function.
 * 
 ******************************/
var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib')
;

var
	BLOOD_PRESSURE_SERVICE_UUID = '1810',
	DEVICE_INFO_SERVICE_UUID = '180A',
	BLOOD_PRESSURE_MEASUREMENT_CHAR_UUID = '2A35',
	CUFF_PRESSURE_CHAR_UUID = '2A36',
	BLOOD_PRESSURE_FEATURE_CHAR_UUID = '2A49',
	MANUFACTURER_NAME_CHAR_UUID = '2A29',
	MODEL_NUMBER_CHAR_UUID = '2A24',
	SERIAL_NUMBER_CHAR_UUID = '2A25',
	HW_REV_CHAR_UUID = '2A27',
	FW_REV_CHAR_UUID = '2A26',
	SW_REV_CHAR_UUID = '2A28',
	SYS_ID_CHAR_UUID = '2A23',
	CERT_DATA_CHAR_UUID = '2A2A',
	PNP_ID_CHAR_UUID = '2A50'
	;

function createDisplay(preText, postText) {
	var self, parent, valueLabel, frontLabel, backLabel;
	
	function getBaseLabel(text) {
		return Ti.UI.createLabel({
			text: text,
			color: 'white',
			font: {
				fontSize: Lib.scale(12)
			},
			left: Lib.scale(5),
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
	
	frontLabel.width = Lib.scale(100);
	if (postText === '') {
		valueLabel.width = Lib.scale(200);
	} else {
		valueLabel.width = Lib.scale(100);
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

function bufferAsBytes(buffer) {
	var i, str = '';
	for(i=0; i<buffer.length; i++) {
		str += buffer[i].toString() + ' ';
	}
	
	return str;
}

function MainView() {
	var self, descriptionLabel,
	scanStatus, peripheralStatus, peripheralName, scrollView;
	
	var connectedPeripheral,
		batteryChar;
	
	var digestServices, digestCharacteristics, digestNewCharValue, 
	wroteValueForDescriptor;
	
	var scanRunning = false, open = false;
	
	var CHAR_TO_DISPLAY_MAP;
	
	function cancelConnection() {
		if (connectedPeripheral) {
			Lib.log('Cancelling previous connection.');
			BluetoothLE.cancelPeripheralConnection(connectedPeripheral);
		}
	}
	
	function startScan() {
		if (open && !scanRunning) {
			scanRunning = true;
			cancelConnection();
			BluetoothLE.startScan({
				UUIDs: [ BLOOD_PRESSURE_SERVICE_UUID ]
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
	
	function bloodPressureConverter(buffer) {
		// According to the spec, blood pressure data is supposed to be
		// reported as floating point numbers. The HoMedics device reports them
		// as a simple byte value, so that's what we assume here.
		
		var result, unit;
		
		if (buffer[0] & 1) {
			unit = 'kPa';
		} else {
			unit = 'mmHg';
		}
		
		result = buffer[1] + '/' + buffer[3] + '/' + 
					buffer[5] + ' (' + unit + ')';
					
		return result;
	}
	
	function userConverter(buffer) {
		var result, unit;
		
		if (buffer[0] & 8) {
			if (buffer[16] === 255) {
				// Value of 255 means "unknown"
				result = 'User unknown';
			} else {
				result = 'User #' + (buffer[16] + 1); // zero based...
			}
		} else {
			result = 'N/A';
		}
		
		return result;
	}

	function pulseConverter(buffer) {
		var result;
		
		if (buffer[0] & 4) {
			result = buffer[14];			
		} else {
			result = 'N/A';
		}
		
		return result;
	}
	
	function timeStampConverter(buffer) {
		var result;
		
		if (buffer[0] & 2) {
			result = buffer[9] + '/' + buffer[10] + '/' + // month and day
					((buffer[7] + buffer[8]*256) % 100) + ' ' + // year
					buffer[11] + ':' + buffer[12]; // time
		} else {
			result = 'N/A';
		}
		
		return result;
	}
	
	
	function bpFeatureConverter(buffer) {
		var result;
		
		result = '';
		
		if (buffer[0] & 1) {
			result += 'body movement;';
		}
		if (buffer[0] & 2) {
			result += 'cuff fit detection;';
		}
		if (buffer[0] & 4) {
			result += 'irregular pulse;';
		}
		if (buffer[0] & 8) {
			result += 'pulse rate range;';
		}
		if (buffer[0] & 16) {
			result += 'measurement position;';
		}
		if (buffer[0] & 32) {
			result += 'multiple bond;';
		}

		if (result === '') {
			result = 'None';
		}
		
		return result;
	}
	
	digestServices = function(e) {
		var services;
		
		// e.source is the peripheral sending the discoveredServices event
		services = e.source.services;
		
		Lib.log('Peripheral has ' + services.length + ' services');
		services.forEach(function(service) {
			Lib.log('Discovered service ' + service.UUID);
			e.source.discoverCharacteristics({
				service: service
			});
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
		
		if (Lib.uuidMatch(e.service.UUID, BLOOD_PRESSURE_SERVICE_UUID)) {
			characteristics.forEach(function(characteristic) {
				if (Lib.uuidMatch(
					characteristic.UUID,
					BLOOD_PRESSURE_MEASUREMENT_CHAR_UUID)) {
					if (canSubscribeTo(characteristic)) {
						Lib.log('Found blood pressure measurement ' +
						'characteristic, will subscribe...');
						connectedPeripheral.subscribeToCharacteristic(
							characteristic);
					} else {
						Lib.log('Found blood pressure measurement ' +
						' characterisic but can\'t subscribe...');
					}
				}
				if (Lib.uuidMatch(
					characteristic.UUID,
					BLOOD_PRESSURE_FEATURE_CHAR_UUID)) {
					connectedPeripheral.readValueForCharacteristic(characteristic);
				}
			});	
		} else if (Lib.uuidMatch(e.service.UUID, DEVICE_INFO_SERVICE_UUID)) {
			characteristics.forEach(function(characteristic) {
				connectedPeripheral.readValueForCharacteristic(characteristic);
			});
		}
	};
	
	digestNewCharValue = function(e) {
		if (e.characteristic) {
			if (e.errorCode !== undefined) {
				Lib.log('Error while reading char ' + e.characteristic.UUID +
							' ' + e.errorCode + '/' + e.errorDomain + '/' +
							e.errorDescription);
			} else {
				CHAR_TO_DISPLAY_MAP.forEach(function(entry) {
					if (Lib.uuidMatch(e.characteristic.UUID, entry.charUUID)) {
						var displayValue;
						
						if (entry.converter) {
							displayValue =
								entry.converter(e.characteristic.value);
						} else {
							displayValue = e.characteristic.value.toString();
						}
						
						entry.display.update(displayValue);
					}
				});
			}
		} else {
			Lib.log('Received updatedValueForCharacteristic event without ' +
						'characteristic object.');
			if (e.errorCode) {
				Lib.log('Error while reading char: ' +
							e.errorCode + '/' + e.errorDomain + '/' +
							e.errorDescription);
			}
		}
	};
	
	wroteValueForDescriptor = function(e) {
		Ti.API.info('Received wroteValueForDescriptor for characteristic ' +
					e.descriptor.characteristic.UUID + ' and descriptor ' +
					e.descriptor.UUID
		);
		Ti.API.info('Error code: ' + e.errorCode);
		Ti.API.info('Error message: ' + e.errorMessage);
	};
	self = Ti.UI.createView({  
		backgroundColor:'#8E8E8E',
		layout: 'vertical'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text: 'This is a "central" implementation that looks for a HoMedics ' +
		'blood pressure monitor. The UUIDs used for this service are ' +
		'defined by the Bluetooth SIG so this sample app is expected ' +
		'to work with any blood pressure monitor. The specific device type ' +
		'we used for testing was the TMB1014.'
	});
	
	self.add(descriptionLabel);
	
	scanStatus = createDisplay('Scan status:', '');
	peripheralStatus = createDisplay('Peripheral status:', '');
	peripheralName = createDisplay('Peripheral name:', '');

	CHAR_TO_DISPLAY_MAP = [
		{
			charUUID: BLOOD_PRESSURE_MEASUREMENT_CHAR_UUID,
			display: createDisplay('User: ', ''),
			converter: userConverter
		},
		{
			charUUID: BLOOD_PRESSURE_MEASUREMENT_CHAR_UUID,
			display: createDisplay('Blood pressure (Sys/Dia/MAP): ', ''),
			converter: bloodPressureConverter
		},
		{
			charUUID: BLOOD_PRESSURE_MEASUREMENT_CHAR_UUID,
			display: createDisplay('Pulse: ', 'bpm'),
			converter: pulseConverter
		},
		{
			charUUID: BLOOD_PRESSURE_MEASUREMENT_CHAR_UUID,
			display: createDisplay('Time stamp: ', ''),
			converter: timeStampConverter
		},
		{
			charUUID: BLOOD_PRESSURE_FEATURE_CHAR_UUID,
			display: createDisplay('Features: ', ''),
			converter: bpFeatureConverter
		},
		{
			charUUID: MANUFACTURER_NAME_CHAR_UUID,
			display: createDisplay('Mfr name:', '')
		},
		{
			charUUID: MODEL_NUMBER_CHAR_UUID,
			display: createDisplay('Model number:', '')
		},
		{
			charUUID: SERIAL_NUMBER_CHAR_UUID,
			display: createDisplay('Serial number: ', '')
		},
		{
			charUUID: HW_REV_CHAR_UUID,
			display: createDisplay('HW revision: ', '')
		},
		{
			charUUID: FW_REV_CHAR_UUID,
			display: createDisplay('FW revision: ', '')
		},
		{
			charUUID: SW_REV_CHAR_UUID,
			display: createDisplay('SW revision: ', '')
		},
		{
			charUUID: CERT_DATA_CHAR_UUID,
			display: createDisplay('Certificates: ', ''),
			converter: bufferAsBytes
		},
		{
			charUUID: PNP_ID_CHAR_UUID,
			display: createDisplay('PNP ID: ', ''),
			converter: bufferAsBytes
		}
	];
	
	scrollView = Ti.UI.createScrollView({
		width: '100%', height: '50%',
		layout: 'vertical'
	});
	self.add(scanStatus.getView());
	self.add(peripheralStatus.getView());
	self.add(peripheralName.getView());
	self.add(scrollView);
	
	CHAR_TO_DISPLAY_MAP.forEach(function(entry) {
		scrollView.add(entry.display.getView());
	});
	
	BluetoothLE.addEventListener('discoveredPeripheral', function(e) {
		Lib.log('Received discoveredPeripheral event.');
		if (!connectedPeripheral) {
			peripheralStatus.update('discovered');
			peripheralName.update(e.peripheral.name);
			Lib.log('Discovered peripheral: ' +
							e.peripheral.name + '/' + e.peripheral.address);
			
			BluetoothLE.connectPeripheral({
				peripheral: e.peripheral,
				autoConnect: false
			});
		} else {
			Lib.log('Received discoveredPeripheral event while connected.');
		}
	});
	
	BluetoothLE.addEventListener('connectedPeripheral', function(e) {
		stopScan();
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
		e.peripheral.addEventListener('wroteValueForDescriptor', wroteValueForDescriptor);
		e.peripheral.discoverServices();
	});
	
	BluetoothLE.addEventListener('failedToConnectPeripheral', function(e) {
		peripheralStatus.update('failed to connect');
		peripheralName.update(e.peripheral.name);
		Lib.log('Failed to connect to peripheral: ' + e.peripheral.name);
		alert('Failed to connect to peripheral ' + e.peripheral.name);
	});
	
	BluetoothLE.addEventListener('disconnectedPeripheral', function(e) {
		if (connectedPeripheral && connectedPeripheral.equals(e.peripheral)) {
			peripheralStatus.update('disconnected');
			peripheralName.update('');
			connectedPeripheral.removeEventListener(
				'discoveredServices', digestServices);
			connectedPeripheral.removeEventListener(
				'discoveredCharacteristics', digestCharacteristics);
			connectedPeripheral.removeEventListener(
				'updatedValueForCharacteristic', digestNewCharValue);
			connectedPeripheral.removeEventListener(
				'wroteValueForDescriptor', wroteValueForDescriptor
			);
			connectedPeripheral = null;
			startScan();
		}
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
		stopScan();
		cancelConnection();
		Lib.shutdownBluetoothCentral();
	});
	return self;
}

module.exports = MainView;