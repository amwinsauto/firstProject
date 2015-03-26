/*global module*/

/******************************
 * 
 * This sample app is a central implementation that was specifically created
 * to demonstrate interoperability with the BT-BPM V125 HoMedics personal
 * blood pressure and heart rate monitor device.
 *
 * These devices implement a proprietary service and characteristics, so
 * this example is not likely to be compatible with anything else. 
 * 
 ******************************/
var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib')
;

var
	// The following three VENDOR_xxx_UUID constants identify the service
	// and the characteristics used by this device. Even though they are
	// in the short form and by extension reserved, they are not defined
	// by the BLE spec.
	VENDOR_SERVICE_UUID = 'FFF0',
	VENDOR_TX_CHAR_UUID = 'FFF1', // Used by BPM to transmit data to us
	VENDOR_RX_CHAR_UUID = 'FFF2', // Used by BPM to receive commands from us
	CFG_DATA_SIZE = 24,
	HEADER = [0xFA, 0x5A, 0xF1, 0xF2, 0xFA, 0x5A, 0xF3, 0xF4],
	TRAILER = [0xF5, 0xA5, 0xF5, 0xF6, 0xF5, 0xA5, 0xF7, 0xF8],
	MEMORY_TYPE_INFO = [
		{
			userCount: 1,
			maxRecordCount: 99
		},
		{
			userCount: 2,
			maxRecordCount: 90
		},
		{
			userCount: 1,
			maxRecordCount: 60
		},
		{
			userCount: 2,
			maxRecordCount: 48
		},
		{
			userCount: 2,
			maxRecordCount: 60
		},
		{
			userCount: 3,
			maxRecordCount: 30
		},
		{
			userCount: 3,
			maxRecordCount: 40
		},
		{
			userCount: 3,
			maxRecordCount: 80
		}
	]
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

function getConfigFromBuffer(buffer) {
	var cfgData, offset, i;
	
	offset = HEADER.length;
	if (buffer.length < offset + 16) {
		Ti.API.error('Buffer of length ' + buffer.length + 
				' not big enough to hold config data!');
		return {};
	}
	cfgData = {
		selectedUser: buffer[offset] / 16 + 1,
		baseYear: buffer[offset + 1] + 2000,
		userIndex: [
			buffer[offset + 7],
			buffer[offset + 4],
			buffer[offset + 5]
		],
		userMemoryFull: [
			(buffer[offset + 6] & 0x1) > 0,
			(buffer[offset + 6] & 0x2) > 0,
			(buffer[offset + 6] & 0x4) > 0
		],
		memoryType: buffer[offset + 14] & 31
	};
	
	Ti.API.info('Config: ' + JSON.stringify(cfgData));
	
	return cfgData;
}

function getIntFromDumb(top, bottom) {
	return top * 100 + parseInt(bottom.toString(16), 10);
}

function getMeasurementFromBuffer(buffer, offset, baseYear) {
	var measurement;
	
	if (buffer.length < offset + 8) {
		Ti.API.error('Buffer of length ' + buffer.length + 
				' not big enough for offset ' + offset);
		return {};
	}
	measurement = {
		year: baseYear + (buffer[offset] & 240) / 16,
		month: buffer[offset] & 15,
		day: buffer[offset + 1],
		hour: buffer[offset + 2] & 15,
		minute: buffer[offset + 3],
		amPM: (buffer[offset + 2] & 128) > 1 ? 'PM' : 'AM',
		ihb: (buffer[offset + 2] & 16) > 0 ? 'yes' : 'no',
		sys: getIntFromDumb((buffer[offset + 4] & 240) / 16, buffer[offset + 5]),
		dia: getIntFromDumb(buffer[offset + 4] & 15, + buffer[offset + 6]),
		heartRate: buffer[offset + 7]
	};
	
	return measurement;
}

function getMeasurementsFromBuffer(cfgData, userSeqNum, buffer) {
	var startIndex, index, full, done, baseYear, maxRecordCount,
	measurementRecords;
	
	index = startIndex = cfgData.userIndex[userSeqNum];
	full = cfgData.userMemoryFull[userSeqNum];
	baseYear = cfgData.baseYear;
	maxRecordCount = MEMORY_TYPE_INFO[cfgData.memoryType].maxRecordCount;
	
	measurementRecords = [];
	done = index === 0 && false === full;
	while (!done) {
		measurementRecords.push(
			getMeasurementFromBuffer(buffer, index * 8, baseYear));
				
		index--;
		if (index === startIndex) {
			// this means we circled back
			done = true;
		} else if (index < 1) {
			if (full) {
				index = maxRecordCount;
			} else {
				done = true;
			}
		}
	}
	
	return measurementRecords;
}

function createLabel(params) {
	var label = Ti.UI.createLabel({
		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,
		color: 'white',
		borderColor: 'white',
		borderWidth: 1,
		left: Lib.scale(5),
		right: Lib.scale(5),
		font: {
			fontSize: Lib.scale(12)
		}
	});
	
	Lib.addProperties(label, params);
	return label;
}

function cfgDataToString(cfgData) {
	var typeInfo, str;
	
	typeInfo = MEMORY_TYPE_INFO[cfgData.memoryType];
	str = '';
	
	str += 'Memory type: ' + cfgData.memoryType;
	str += ' ';
	str += '(' + typeInfo.userCount + ' users, ' + typeInfo.maxRecordCount + ' records)';
	str += '\n';
	str += 'Selected user: ' + cfgData.selectedUser;
	str += ' ';
	str += 'Base year: ' + cfgData.baseYear;
	str += '\n';
	str += 'User index: ' + JSON.stringify(cfgData.userIndex);
	str += '\n';
	str += 'User memory full: ' + JSON.stringify(cfgData.userMemoryFull);	
	return str;
}

function recordToString(record) {
	var str = '';
	
	str += 'Time: ' + record.year + '/' + record.month + '/' + record.day;
	str += ' ';
	str	+= record.hour + ':' + Lib.zeroPad(record.minute) + record.amPM;
	str += '\n';
	str += 'Sys: ' + record.sys + ' Dia:' + record.dia;
	str += '\n';
	str += 'Heart rate: ' + record.heartRate + ' IHB: ' + record.ihb;
	return str;
}

var updateDisplay;

(function() {
	var wrapperView;
	
	updateDisplay = function(scrollView, cfgData, measurementRecords) {
		var i;
		
		if (wrapperView) {
			scrollView.remove(wrapperView);
		}
		
		wrapperView = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			layout: 'vertical'
		});
		
		wrapperView.add(createLabel({
			text: cfgDataToString(cfgData)
		}));
		i = 1;
		measurementRecords.forEach(function(userRecords) {
			wrapperView.add(createLabel({
				text: 'Measurements for User ' + i + ':',
				top: Lib.scale(10)
			}));
			userRecords.forEach(function(record) {
				wrapperView.add(createLabel({
					text: recordToString(record)
				}));
			});
			i++;
		});
		
		scrollView.add(wrapperView);
	};
}());

function MainView() {
	var self, descriptionLabel, rescanButton,
	scanStatus, peripheralStatus, peripheralName, scrollView;
	
	var connectedPeripheral, charToSubscribeTo, charToWrite;
	
	var digestServices, digestCharacteristics, digestNewCharValue, 
	wroteValueForCharacteristic;
	
	var scanRunning = false, open = false;

	var state, measurementRecords;
	
	var STATE = {
			DISCONNECTED: 'disconnected',
			CONNECTED: 'connected',
			CFG_REQ_SENT: 'config request sent',
			READING_CFG: 'reading config',
			USER_DATA_REQ_SENT: 'user data request sent',
			READING_USER_DATA: 'reading user data'
	};
	
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
				// Scanning for specific service UUID does not work
				// because the device does not advertise the service...
				// UUIDs: [ VENDOR_SERVICE_UUID ]
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
	
	function isBufferClosed(buffer) {
		var i, result;
		
		result = false;
		if (buffer && buffer.length >= TRAILER.length) {
			result = true;
			for (i=0; i < TRAILER.length; i++) {
				result = result &&
					(buffer[buffer.length - TRAILER.length + i] === TRAILER[i]); 
			}
		}
		
		return result;
	}
	
	function requestConfig() {
		if (state !== STATE.CONNECTED) {
			Ti.API.error('Invalid state: ' + state +
						' Must be CONNECTED to request config.');
			return;
		}
		
		Ti.API.info('Sending command to retrieve config.');
		peripheralStatus.update('Reading config...');

		connectedPeripheral.writeValueForCharacteristic({
			characteristic: charToWrite,
			data: Ti.createBuffer({ value: 'BT:9' }),
			type: BluetoothLE.CHARACTERISTIC_TYPE_WRITE_WITH_RESPONSE
		});
		state = STATE.CFG_REQ_SENT;
	}
	
	function requestUserData(userSeqNum) {
		Ti.API.info('Entering requestUserData');
		if (state !== STATE.CONNECTED) {
			Ti.API.error('Invalid state: ' + state +
					' Must be CONNECTED to request user data.');
			return;
		}
		
		Ti.API.info('Sending command to retrieve data for user ' + userSeqNum);
		peripheralStatus.update('Reading data for user ' + userSeqNum + '...');
		connectedPeripheral.writeValueForCharacteristic({
			characteristic: charToWrite,
			data: Ti.createBuffer({ value: 'BT:' + userSeqNum }),
			type: BluetoothLE.CHARACTERISTIC_TYPE_WRITE_WITH_RESPONSE
		});
		state = STATE.USER_DATA_REQ_SENT;
		Ti.API.info('Exiting requestUserData');
	}
	
	(function() {
		var buffer = {}, currentUser;
		
		handleReceivedData = function(e) {
			if (e.data === undefined || e.data === null || e.data.length ===0) {
				Ti.API.info('Update did not contain any data!');
				return;
			}
			switch (state) {
				case STATE.CFG_REQ_SENT:
					buffer = e.data;
					state = STATE.READING_CFG;
					break;
				case STATE.USER_DATA_REQ_SENT:
					buffer = e.data;
					state = STATE.READING_USER_DATA;
					break;
				case STATE.READING_CFG:
				case STATE.READING_USER_DATA:
					buffer.append(e.data);
					break;
				default:
					Ti.API.error('Invalid state checkpoint #1: ' + state);
					return;
			}

			if (isBufferClosed(buffer)) {
				switch (state) {
					case STATE.CFG_REQ_SENT:
					case STATE.READING_CFG:
						cfgData = getConfigFromBuffer(buffer);
						currentUser = 0;
						break;
					case STATE.USER_DATA_REQ_SENT:
					case STATE.READING_USER_DATA:
						measurementRecords[currentUser] =
							getMeasurementsFromBuffer(
								cfgData, currentUser, buffer);
						currentUser++;
						break;
					default:
						Ti.API.error('Invalid state checkpoint #2: ' + state);
						return;
				}
				
				state = STATE.CONNECTED;

				if (currentUser <
						MEMORY_TYPE_INFO[cfgData.memoryType].userCount)
				{
						requestUserData(currentUser);
				} else {
					BluetoothLE.cancelPeripheralConnection(connectedPeripheral);
					updateDisplay(scrollView, cfgData, measurementRecords);
				}
			}
		};
	}());

	state = STATE.DISCONNECTED;
		
	digestServices = function(e) {
		var services;
		
		// e.source is the peripheral sending the discoveredServices event
		services = e.source.services;
		
		Lib.log('Peripheral has ' + services.length + ' services');
		services.forEach(function(service) {
			if (Lib.uuidMatch(service.UUID, VENDOR_SERVICE_UUID)) {
				Lib.log('Found vendor service!');
				e.source.discoverCharacteristics({
					service: service
				});
			}
		});
	};
	
	function logPropertyFlag(characteristic, propName) {
		Lib.log(propName + ' is ' +
				((characteristic.properties & BluetoothLE[propName]) > 0 ?
				'ON' : 'OFF'));
	}
	
	digestCharacteristics = function(e) {
		var characteristics;
		
		if (e.errorCode !== undefined) {
			Lib.log('Error while discovering characteristics: ' +
						e.errorCode + '/' + e.errorDomain + '/' +
						e.errorDescription);
			return;
		}
		characteristics = e.service.characteristics;
		
		if (Lib.uuidMatch(e.service.UUID, VENDOR_SERVICE_UUID)) {
			characteristics.forEach(function(characteristic) {
				Lib.log('Char UUID: ' + characteristic.UUID);
				Lib.log('Char properties: ' + characteristic.properties);
				if (Lib.uuidMatch(characteristic.UUID, VENDOR_TX_CHAR_UUID)) {
					Lib.log('Found vendor tx char!');
					charToSubscribeTo = characteristic;
					if (canSubscribeTo(characteristic)) {
						Lib.log('Subscribing...');
						connectedPeripheral.subscribeToCharacteristic(
								characteristic);
					} else {
						Lib.log('Cannot subscribe to it though!');
						charToSubscribeTo = null;
					}
				}
				if (Lib.uuidMatch(characteristic.UUID, VENDOR_RX_CHAR_UUID)) {
					Lib.log('Found vendor rx char!');
					charToWrite = characteristic;
				}
			});
		}
		
		if (charToSubscribeTo && charToWrite) {
			// Once we found the two characteristics we need to communicate
			// with the device, we can start to query it...
			requestConfig();
		}
	};
	
	digestNewCharValue = function(e) {
		if (e.characteristic) {
			if (e.errorCode !== undefined) {
				Lib.log('Error while reading char ' + e.characteristic.UUID +
							' ' + e.errorCode + '/' + e.errorDomain + '/' +
							e.errorDescription);
			} else if (e.characteristic.equals(charToSubscribeTo)) {
				handleReceivedData({
					data: e.value
				});
			} else {
				Lib.log('Received update for unexpected characteristic.');
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
	
	wroteValueForCharacteristic = function(e) {
		Ti.API.info('Received wroteValueForCharacteristic for characteristic ' +
					e.characteristic.UUID
		);
		Ti.API.info('Error code: ' + e.errorCode);
		Ti.API.info('Error message: ' + e.errorMessage);
	};

	self = Ti.UI.createView({  
		backgroundColor:'#8E8E8E',
		layout: 'vertical'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text:
			'This is a "central" implementation that looks for a BT-BPM V125 ' +
			'HoMedics personal blood pressure and heart rate monitor device. ' +
			'These devices implement a proprietary service and ' +
			'characteristics, so this example is not likely to be compatible ' +
			'with anything else.' 
	});
	
	self.add(descriptionLabel);
	
	scanStatus = createDisplay('Scan status:', '');
	peripheralStatus = createDisplay('Peripheral status:', '');
	peripheralName = createDisplay('Peripheral name:', '');
	rescanButton = Lib.createDefaultButton({
		title: 'Rescan'
	});

	scrollView = Ti.UI.createScrollView({
		top: Lib.scale(10),
		width: '100%', height: '50%',
		layout: 'vertical'
	});
	self.add(scanStatus.getView());
	self.add(peripheralStatus.getView());
	self.add(peripheralName.getView());
	self.add(rescanButton);
	self.add(scrollView);
	
	rescanButton.addEventListener('click', function(e) {
		startScan();
	});
	
	BluetoothLE.addEventListener('discoveredPeripheral', function(e) {
		Lib.log('Received discoveredPeripheral event.');
		if (e.peripheral.name !== 'BT-BPM V125') {
			Lib.log('Name of peripheral does not match!');
			return;
		}
		if (!connectedPeripheral) {
			peripheralStatus.update('Discovered!');
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
		if (e.peripheral.name !== 'BT-BPM V125') {
			return;
		}
		stopScan();
		
		
		// You must assign e.peripheral to a variable that will not be garbage
		// collected, if you want to do service discovery!
		if (connectedPeripheral && !connectedPeripheral.equals(e.peripheral)) {
			cancelConnection();
		}
	
		connectedPeripheral = e.peripheral;
		state = STATE.CONNECTED;
		measurementRecords = [];
		charToSubscribeTo = null;
		charToWrite = null;

		peripheralStatus.update('Connected!');
		peripheralName.update(e.peripheral.name);
		Lib.log('Connected peripheral: ' +
							e.peripheral.name + '/' + e.peripheral.address);
		
		e.peripheral.addEventListener('discoveredServices', digestServices);
		e.peripheral.addEventListener('discoveredCharacteristics', digestCharacteristics);
		e.peripheral.addEventListener('updatedValueForCharacteristic', digestNewCharValue);
		e.peripheral.addEventListener('wroteValueForCharacteristic', wroteValueForCharacteristic);
		e.peripheral.discoverServices();
	});
	
	BluetoothLE.addEventListener('failedToConnectPeripheral', function(e) {
		peripheralStatus.update('Failed to connect!');
		peripheralName.update(e.peripheral.name);
		Lib.log('Failed to connect to peripheral: ' + e.peripheral.name);
		alert('Failed to connect to peripheral ' + e.peripheral.name);
	});
	
	BluetoothLE.addEventListener('disconnectedPeripheral', function(e) {
		if (connectedPeripheral && connectedPeripheral.equals(e.peripheral)) {
			state = STATE.DISCONNECTED;
			peripheralStatus.update('Disconnected.');
			peripheralName.update('');
			connectedPeripheral.removeEventListener(
				'discoveredServices', digestServices);
			connectedPeripheral.removeEventListener(
				'discoveredCharacteristics', digestCharacteristics);
			connectedPeripheral.removeEventListener(
				'updatedValueForCharacteristic', digestNewCharValue);
			connectedPeripheral.removeEventListener(
					'wroteValueForCharacteristic', wroteValueForCharacteristic
				);
			connectedPeripheral = null;
			charToSubscribeTo = null;
			charToWrite = null;
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