/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false*/
/*global module */

var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib'),
	// CUSTOM_SERVICE_UUID identifies the service provided by this app when
	// it plays the peripheral role. NOTIF_CHAR_UUID and READ_CHAR_UUID are
	// two characteristics in this service; the former can provide notification
	// updates to a central that subscribes to it, and the latter can be read
	// by the central.
	CUSTOM_SERVICE_UUID = '00000000-0000-1000-8000-00805F9B3000',
	NOTIF_CHAR_UUID     = '00000000-0000-1000-8000-00805F9B3001',
	READ_CHAR_UUID      = '00000000-0000-1000-8000-00805F9B3002',
	WRITE_CHAR_UUID     = '00000000-0000-1000-8000-00805F9B3003'
;


function MainView() {
	var self, statusLabel, descriptionLabel,
		initButtonParent, controlsParent,
		initCentralButton, initPeripheralButton,
		sendLabel, receiveLabel,
		sendTextField, receiveTextField,
		checkTimeButton, checkRSSIButton, checkButtonsParent,
		rescanButton, shutdownButton, killButton, resetButtonsParent;
	
	var discoveredPeripherals, connectedPeripheral,
		customService, notifChar, readChar, writeChar,
		scanRunning, restoredServiceAdvertisement;
	
	var digestServices, digestCharacteristics, digestNewValue, digestNewRSSI,
		digestWroteValue;
	
	var weAreCentral = false, weArePeripheral = false, open = false;
	
	Lib.log('backgroundDataAuthorizationStatus: ' +
				BluetoothLE.backgroundDataAuthorizationStatus);
	Lib.log('BACKGROUND_DATA_AUTHORIZATION_STATUS_NOT_DETERMINED: ' +
				BluetoothLE.BACKGROUND_DATA_AUTHORIZATION_STATUS_NOT_DETERMINED);
	Lib.log('BACKGROUND_DATA_AUTHORIZATION_STATUS_RESTRICTED: ' +
				BluetoothLE.BACKGROUND_DATA_AUTHORIZATION_STATUS_RESTRICTED);
	Lib.log('BACKGROUND_DATA_AUTHORIZATION_STATUS_DENIED: ' +
				BluetoothLE.BACKGROUND_DATA_AUTHORIZATION_STATUS_DENIED);
	Lib.log('BACKGROUND_DATA_AUTHORIZATION_STATUS_AUTHORIZED: ' +
				BluetoothLE.BACKGROUND_DATA_AUTHORIZATION_STATUS_AUTHORIZED);
	Lib.log('ADVERT_DATA_KEY_SOLICITED_SERVICE_UUIDS: ' +
				BluetoothLE.ADVERT_DATA_KEY_SOLICITED_SERVICE_UUIDS);			
	Lib.log('ADVERT_DATA_KEY_IS_CONNECTABLE: ' +
				BluetoothLE.ADVERT_DATA_KEY_IS_CONNECTABLE);			
	
	discoveredPeripherals = [];
	
	self = Ti.UI.createView({  
		layout: 'vertical',
		backgroundColor: '#8E8E8E'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text: 'This example demonstrates how to connect two iOS devices ' +
		'using Bluetooth Low Energy. The same app can act as a central or ' +
		'as a peripheral -- it will only connect to itself.'
	});
	
	self.add(descriptionLabel);
	
	statusLabel = Lib.createStatusLabel({
		text: 'Choose a role:'	
	});
	
	self.add(statusLabel);

	function setStatus(text) {
		statusLabel.text = text;
		Lib.log(text);
	}
	
	function swapViews() {
		if (weAreCentral || weArePeripheral) {
			self.remove(initButtonParent);
			self.add(controlsParent);
		} else {
			self.add(initButtonParent);
			self.remove(controlsParent);
		}
	}

	function startScan() {
		if (open && !scanRunning) {
			scanRunning = true;
			BluetoothLE.startScan({
				UUIDs: [CUSTOM_SERVICE_UUID]
			});
			setStatus('Started scanning');
		}
	}
	
	function stopScan() {
		if (open) {
			scanRunning = false;
			BluetoothLE.stopScan();
			setStatus('Stopped scanning');
		}
	}
	
	function setupAsCentral() {
		weAreCentral = true;
		weArePeripheral = false;
		checkButtonsParent.visible = true;
		swapViews();
	}
		
	function initAsCentral() {
		setupAsCentral();
		setStatus('Initializing central...');
		Lib.initBluetoothCentral({
			restoreIdentifier: 'ios-to-ios',
			onCallback: function() {
				Lib.log('Central manager changed state to powered on.');
				startScan();
			},
			errorCallback: function(desc) {
				Lib.log(desc);
			}
		});
	}

	function restoreCentral() {
		setupAsCentral();
		Lib.initBluetoothCentral({
			restoreIdentifier: 'ios-to-ios'
		});
	}
	
	initButtonParent = Ti.UI.createView({
		layout: 'vertical'
	});
	
	initCentralButton = Lib.createDefaultButton({
		title: 'Be the central'
	});
	
	initCentralButton.addEventListener('click', initAsCentral);
	
	initButtonParent.add(initCentralButton);
	
	initPeripheralButton = Lib.createDefaultButton({
		title: 'Be the peripheral'
	});
	
	function initAsPeripheral() {
		weArePeripheral = true;
		weAreCentral = false;
		checkButtonsParent.visible = false;
		swapViews();
		setStatus('Initializing peripheral...');
		BluetoothLE.initPeripheralManager({
			restoreIdentifier: 'ios-to-ios',
			// If you set this to false, the user won't be notified if Bluetooth
			// is off -- and you will receive PERIPHERAL_MANAGER_STATE_POWERED_OFF
			// status event instead of PERIPHERAL_MANAGER_STATE_POWERED_ON. 
			showPowerAlert: true
		});
	}
	
	function restorePeripheral() {
		initAsPeripheral();
	}
	
	initPeripheralButton.addEventListener('click', initAsPeripheral);
	
	initButtonParent.add(initPeripheralButton);
	
	self.add(initButtonParent);
	
	controlsParent = Ti.UI.createView({
		layout: 'vertical'
	});
	
	sendLabel = Ti.UI.createLabel({
		width: 200, height: 20, left: 10, top: 10,
		color: 'white',
		text: 'Enter text to transmit:'	
	});
	
	controlsParent.add(sendLabel);
	
	sendTextField = Ti.UI.createTextField({
		width: 200, height: 40, top: 10,
		borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED 
	});
	
	sendTextField.addEventListener('change', function(e) {
		if (weArePeripheral && notifChar) {
			if (BluetoothLE.updateValue({
				characteristic: notifChar,
				data: Ti.createBuffer({ value: e.value })
			})) {
				Lib.log('Notifying characteristic updated.');
			} else {
				Lib.log('Notifying characteristic failed to update.');
			}
		}
		if (weAreCentral && connectedPeripheral && writeChar) {
			connectedPeripheral.writeValueForCharacteristic({
				data: Ti.createBuffer({ value: e.value}),
				characteristic: writeChar,
				type: BluetoothLE.CHARACTERISTIC_TYPE_WRITE_WITH_RESPONSE
			});
		}
	});
	
	controlsParent.add(sendTextField);
	
	receiveLabel = Ti.UI.createLabel({
		width: 200, height: 20, left: 10, top: 10,
		color: 'white',
		text: 'Received text:'	
	});
	
	controlsParent.add(receiveLabel);
	
	receiveTextField = Ti.UI.createTextField({
		width: 200, height: 40, top: 10,
		editable: false,
		touchEnabled: false,
		borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED 
	});
	
	controlsParent.add(receiveTextField);
	
	checkButtonsParent = Ti.UI.createView({
		top: Lib.scale(10), width: '100%', height: Lib.scale(40)
	});
	
	checkTimeButton = Lib.createDefaultButton({
		title: 'Time',
		top: Lib.scale(0),
		left: Lib.scale(30), width: Lib.scale(100)
	});
	
	checkTimeButton.addEventListener('click', function() {
		if (connectedPeripheral && readChar) {
			connectedPeripheral.readValueForCharacteristic(readChar);
		}
	});
	
	checkButtonsParent.add(checkTimeButton);
	
	checkRSSIButton = Lib.createDefaultButton({
		title: 'RSSI',
		top: Lib.scale(0),
		right: Lib.scale(30), width: Lib.scale(100)
	});
	
	checkRSSIButton.addEventListener('click', function() {
		if (connectedPeripheral) {
			connectedPeripheral.readRSSI();
		}
	});
	
	checkButtonsParent.add(checkRSSIButton);
	
	controlsParent.add(checkButtonsParent);
	
	resetButtonsParent = Ti.UI.createView({
		top: Lib.scale(10), width: '100%', height: Lib.scale(40),
		layout: 'horizontal'
	});

	function shutdown() {
		Ti.App.Properties.removeProperty('restoreTo');
		if (weAreCentral) {
			BluetoothLE.releaseCentralManager();
			setStatus('Released central');
		}
		if (weArePeripheral) {
			BluetoothLE.releasePeripheralManager();
			setStatus('Released peripheral');
		}
		
		sendTextField.value = '';
		receiveTextField.value = '';
	
		if (weArePeripheral || weAreCentral) {
			weArePeripheral = false;
			weAreCentral = false;
			
			swapViews();
		}
	}
	
	shutdownButton = Lib.createDefaultButton({
		title: 'Shutdown',
		top: Lib.scale(0),
		left: Lib.scale(10), width: Lib.scale(90)
	});
	
	shutdownButton.addEventListener('click', shutdown);
	
	resetButtonsParent.add(shutdownButton);
	
	rescanButton = Lib.createDefaultButton({
		title: 'Rescan',
		visible: false,
		top: Lib.scale(0),
		left: Lib.scale(10), width: Lib.scale(90)		
	});
	
	rescanButton.addEventListener('click', function() {
		rescanButton.visible = false;
		discoveredPeripherals = [];
		BluetoothLE.startScan({
			UUIDs: [CUSTOM_SERVICE_UUID]
		});
		setStatus('Started scanning...');
	});
	
	resetButtonsParent.add(rescanButton);
	
	killButton = Lib.createDefaultButton({
		title: 'Kill app',
		top: Lib.scale(0),
		left: Lib.scale(10), width: Lib.scale(90)		
	});
	
	killButton.addEventListener('click', function() {
		BluetoothLE.killApp();
	});
	
	resetButtonsParent.add(killButton);
	
	controlsParent.add(resetButtonsParent);
	
	BluetoothLE.addEventListener('peripheralManagerStateChange', function(e) {
		var advertParams;
		
		if (!open) {
			return;
		}

		switch (e.state) {
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNKNOWN:
				Lib.log('Peripheral manager changed state to unknown.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_RESETTING:
				Lib.log('Peripheral manager changed state to resetting.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNSUPPORTED:
				Lib.log('Peripheral manager changed state to unsupported.');
				setStatus('Bluetooth LE is not supported.');				
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNAUTHORIZED:
				Lib.log('Peripheral manager changed state to unauthorized.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_POWERED_OFF:
				Lib.log('Peripheral manager changed state to powered off.');
				break;
			case BluetoothLE.PERIPHERAL_MANAGER_STATE_POWERED_ON:
				Lib.log('Peripheral manager changed state to powered on.');
				if (restoredServiceAdvertisement) {
					Lib.log('Service advertisement was restored.');
				} else {
					setStatus('Adding service...');
					BluetoothLE.addService({
						uuid: CUSTOM_SERVICE_UUID,
						primary: true,
						characteristics: [
							{
								uuid: NOTIF_CHAR_UUID,
								properties: BluetoothLE.CHAR_PROP_NOTIFY,
								permissions: BluetoothLE.CHAR_PERM_NONE
							},
							{
								uuid: READ_CHAR_UUID,
								properties: BluetoothLE.CHAR_PROP_READ,
								permissions: BluetoothLE.CHAR_PERM_READABLE
							},
							{
								uuid: WRITE_CHAR_UUID,
								properties: BluetoothLE.CHAR_PROP_WRITE,
								permissions: BluetoothLE.CHAR_PERM_READABLE +
												BluetoothLE.CHAR_PERM_WRITEABLE
							}
						]
					});
		
					advertParams = {};
					advertParams[BluetoothLE.ADVERT_DATA_KEY_SERVICE_UUIDS] =
									[ CUSTOM_SERVICE_UUID ];
					advertParams[BluetoothLE.ADVERT_DATA_KEY_LOCAL_NAME] = Ti.Platform.username;
					// Note: these are the only two fields supported by the Core Bluetooth
					// framework at this point.
					Lib.log('Will start service advertisement now...');
					BluetoothLE.startAdvertising(advertParams);
					setStatus('Advertising service...');
				}
	
				break;			
		}
	});
	
	function didDiscoverPeripheral(e) {
		var newPeripheral;
			
		if (!open) {
			return;
		}
		newPeripheral = true;
		discoveredPeripherals.forEach(function(peripheral) {
			// We may receive multiple discoveredPeripheral events for the same
			// peripheral. The peripheral object on the native side will be the same
			// for the events but the proxy objects will not be. We must use the
			// peripheral proxy's equal method to compare the native peripheral
			// objects instead of the proxy objects.  
			if (peripheral.equals(e.peripheral)) {
				newPeripheral = false;
			}
		});
		
		if (newPeripheral) {
			Lib.log('Discovered new peripheral: ' +
							e.peripheral.name + '/' + e.peripheral.UUID);
			setStatus('Discovered new peripheral');
	
			if (e.peripheral.isConnected) {
				Lib.log('Peripheral already connected!');
			}
			discoveredPeripherals.push(e.peripheral);
			stopScan();
			BluetoothLE.connectPeripheral({
				peripheral: e.peripheral
			});
		} else {
			Lib.log('Received discoveredPeripheral event for previously discovered peripheral.');
		}
	}
	BluetoothLE.addEventListener('discoveredPeripheral', didDiscoverPeripheral);
	
	function printPeripheralState(peripheral) {
		var text = 'Peripheral status is ';
		switch (peripheral.state) {
			case BluetoothLE.PERIPHERAL_STATE_DISCONNECTED:
				text += 'disconnected.';
				break;
			case BluetoothLE.PERIPHERAL_STATE_CONNECTED:
				text += 'connected.';
				break;
			case BluetoothLE.PERIPHERAL_STATE_CONNECTING:
				text += 'connecting.';
				break;
			default:
				text += 'unknown.';			
		}
		
		Lib.log(text);
		Lib.log('peripheral.isConnected: ' + peripheral.isConnected);
	}
	
	function didConnectPeripheral(e) {
		if (!open) {
			return;
		}
		printPeripheralState(e.peripheral);
		rescanButton.visible = false;
	
		// You must assign e.peripheral to a variable that will not be garbage
		// collected, if you want to do service discovery!
		if (connectedPeripheral) {
			BluetoothLE.cancelPeripheralConnection(connectedPeripheral);
			connectedPeripheral = null;
		}
	
		setStatus('Connected to peripheral');
		
		connectedPeripheral = e.peripheral;
		notifChar = null;
		readChar = null;
		writeChar = null;
	
		sendTextField.value = '';
		receiveTextField.value = '';
	
		Lib.log('Connected peripheral: ' +
							connectedPeripheral.name + '/' + connectedPeripheral.UUID);
	
	
		connectedPeripheral.addEventListener('discoveredServices', digestServices);
		connectedPeripheral.addEventListener('discoveredCharacteristics', digestCharacteristics);
		connectedPeripheral.addEventListener('updatedValueForCharacteristics', digestNewValue);
		connectedPeripheral.addEventListener('updatedRSSI', digestNewRSSI);
		connectedPeripheral.addEventListener('wroteValueForCharacteristics', digestWroteValue);
		
		e.peripheral.services.forEach(function(service) {
			if (Lib.uuidMatch(service.UUID, CUSTOM_SERVICE_UUID)) {
				Lib.log('Custom service restored!');
				customService = service;
				service.characteristics.forEach(function(characteristic) {
					if (Lib.uuidMatch(characteristic.UUID, NOTIF_CHAR_UUID)) {
						Lib.log('Notifying characteristic restored!');
						notifChar = characteristic;
					}
					if (Lib.uuidMatch(characteristic.UUID, READ_CHAR_UUID)) {
						Lib.log('Readable characteristic restored!');
						readChar = characteristic;
					}
					if (Lib.uuidMatch(characteristic.UUID, WRITE_CHAR_UUID)) {
						Lib.log('Writeable characteristic restored!');
						writeChar = characteristic;
						connectedPeripheral.writeValueForCharacteristic({
							data: Ti.createBuffer({
								value: 'Hello! I got restored!'
							}),
							characteristic: writeChar,
							type: BluetoothLE.CHARACTERISTIC_TYPE_WRITE_WITH_RESPONSE
						});

					}
				});
			}
		});	
		if (notifChar && notifChar.isNotifying && readChar && writeChar) {
			// This means everything got restored, which is what you would expect
			// most of the time.
			Lib.log('All characteristics have been recovered!');
		} else {
			// This means restoration is not 100%. Here we could try to
			// piecemeal it and figure out which service/characteristic is
			// missing. For sake of simplicity, we'll just start from the
			// service discovery.
			Lib.log('Some characteristics have not been recovered!');

			notifChar = null;
			readChar = null;
			writeChar = null;
			connectedPeripheral.discoverServices();
		}
	}
	
	BluetoothLE.addEventListener('connectedPeripheral', didConnectPeripheral);
	
	BluetoothLE.addEventListener('failedToConnectPeripheral', function(e) {
		if (!open) {
			return;
		}
		Lib.log('Failed to connect to peripheral: ' + e.peripheral.name);
		alert('Failed to connect to peripheral ' + e.peripheral.name);
	
		if (e.errorCode) {
			Lib.log('Error code: ' + e.errorCode + ' description: ' + e.errorDescription);
		}
	});
	
	BluetoothLE.addEventListener('disconnectedPeripheral', function(e) {
		var newConnectedPeripherals;
		
		if (!open) {
			return;
		}
		printPeripheralState(e.peripheral);
	
		if (connectedPeripheral.equals(e.peripheral)) {
			Lib.log('Disconnected from peripheral: ' + e.peripheral.name +
							'/' + e.peripheral.UUID);
			alert('Disconnected from peripheral ' + e.peripheral.name);
			setStatus('Disconnected from peripheral');
			
			if (e.errorCode) {
				Lib.log(
					'Error code: ' + e.errorCode + 
					' description: ' + e.errorDescription);
			}
	
			// This will ensure that we reconnect to the peripheral as soon as
			// it appears.
			BluetoothLE.connectPeripheral({
				peripheral: e.peripheral
			});
		
			connectedPeripheral.removeEventListener(
									'discoveredServices', digestServices);
			connectedPeripheral.removeEventListener(
									'discoveredCharacteristics',
									digestCharacteristics);
			connectedPeripheral.removeEventListener(
									'updatedValueForCharacteristics',
									digestNewValue);
			connectedPeripheral.removeEventListener(
									'updatedRSSI', 
									digestNewRSSI);
			connectedPeripheral.removeEventListener(
									'wroteValueForCharacteristics', 
									digestWroteValue);
			connectedPeripheral = null;
			notifChar = null;
			readChar = null;
			writeChar = null;
			sendTextField.value = 'Disconnected';
			receiveTextField.value = 'Disconnected';
			discoveredPeripherals = [];
			rescanButton.visible = true;
		}
	});
	
	digestServices = function(e) {
		var services;
		
		Lib.log('Entering digestServices');
		
		// e.source is the peripheral sending the discoveredServices event
		services = e.source.services;
		
		Lib.log('Peripheral has ' + services.length + ' services');
		services.forEach(function(service) {
			Lib.log('Service UUID: ' + service.UUID);
			if (service.UUID === CUSTOM_SERVICE_UUID) {
				customService = service;
				e.source.discoverCharacteristics({
					service: customService
				});
			}
		});
	};
	
	digestCharacteristics = function(e) {
		if (!open) {
			return;
		}
		Lib.log('Entering digestCharacteristics for service ' + e.service.UUID);
	
		var characteristics = e.service.characteristics;
		Lib.log('Services has ' + characteristics.length + ' characteristic(s).');
		characteristics.forEach(function(characteristic) {
			switch (characteristic.UUID) {
				case NOTIF_CHAR_UUID:
					Lib.log('Notifying characteristic discovered!');
					notifChar = characteristic;
					e.source.subscribeToCharacteristic(characteristic);
					break;
				case READ_CHAR_UUID:
					Lib.log('Readable characteristic discovered!');
					readChar = characteristic;
					break;
				case WRITE_CHAR_UUID:
					Lib.log('Writeable characteristic discovered!');
					writeChar = characteristic;
					break;
				default:
					Lib.log('Ignoring characteristic ' + characteristic.UUID);
			}
		});	
	};
	
	digestNewValue = function(e) {
		var decodedValue;
		
		if (!open) {
			return;
		}
		function pad(number, width) {
			var result;
			
			if (typeof width === 'undefined') {
				width = 2;
			}
			result = number.toString();
			
			while (result.length < width) {
				result = '0' + result;
			}
			
			return result;
		}
	
		Lib.log('Entering digestNewValue');
		
		if (e.characteristic) {
			Lib.log('... for characteristic ' + e.characteristic.UUID);
		}
		if (e.errorCode !== undefined) {
			Ti.API.error('Error domain: ' + e.errorDomain + ' code: ' + e.errorCode + ' desc: ' + e.errorDescription);
		} else {
			Lib.log('Characteristic UUID is ' + e.characteristic.UUID);
			switch (e.characteristic.UUID) {
				case READ_CHAR_UUID:
					// Here we decode the time sent by the peripheral from the
					// array of 5 bytes. This is how you can receive raw data
					// as opposed to a string.
					decodedValue = 'Time: ' +
								pad(e.characteristic.value[0]) + ':' +
								pad(e.characteristic.value[1]) + ':' +
								pad(e.characteristic.value[2]) + '.' +
								pad(e.characteristic.value[3] * 256 + e.characteristic.value[4], 3) 
								;
					receiveTextField.value = decodedValue;
					Lib.log('Updated receiveTextField.value to: ' +
									receiveTextField.value);
					break;
				case NOTIF_CHAR_UUID:		
					receiveTextField.value = e.characteristic.value.toString();
					Lib.log('Updated receiveTextField.value to: ' +
									receiveTextField.value);
					break;
			}
		}
	};
	
	digestNewRSSI = function(e) {
		if (!open) {
			return;
		}
		Lib.log('Entering digestNewRSSI');
		
		if (e.errorCode !== undefined) {
			Ti.API.error('Error domain: ' + e.errorDomain + ' code: ' + e.errorCode + ' desc: ' + e.errorDescription);
		} else {
			// e.source is the peripheral in question.
			receiveTextField.value = 'RSSI: ' + e.source.RSSI;
		}
	};
	
	digestWroteValue = function(e) {
		if (!open) {
			return;
		}
		Lib.log('Entering digestWroteValue');
	
		if (e.errorCode !== undefined) {
			Ti.API.error('Error domain: ' + e.errorDomain + ' code: ' + e.errorCode + ' desc: ' + e.errorDescription);
		} else {
			// e.source is the peripheral in question.
			Ti.API.error('source: ' + e.source);
		}
	};
	
	
	BluetoothLE.addEventListener('startedAdvertising', function(e) {
		if (!open) {
			return;
		}
		if (e.errorCode) {
			setStatus('Failed to start advertising.');
		} else {
			setStatus('Started advertising.');
		}
	});
	
	BluetoothLE.addEventListener('centralSubscribed', function(e) {
		if (!open) {
			return;
		}
		setStatus('Central subscribed to characteristic.');
		notifChar = e.characteristic;
		e.characteristic.subscribedCentrals.forEach(function(central) {
			Lib.log('Subscribed cenral UUID: ' + central.UUID);
			Lib.log('Subscribed cenral maximumUpdateValueLength: ' + central.maximumUpdateValueLength);
		});
	});
	
	BluetoothLE.addEventListener('centralUnsubscribed', function(e) {
		if (!open) {
			return;
		}
		setStatus('Central unsubscribed from characteristic.');
		notifChar = null;
	});
	
	BluetoothLE.addEventListener('receivedReadRequest', function(e) {
		if (!open) {
			return;
		}
		Lib.log('Received read request for characteristic: ' + e.request.characteristic.UUID);
		var now, buffer;
		
		// Here we package the current time as an array of 5 bytes. This is how
		// you can send raw data, as opposed to a string.
		now = new Date();
		buffer = Ti.createBuffer({ length: 5 });
		buffer[0] = now.getHours();
		buffer[1] = now.getMinutes();
		buffer[2] = now.getSeconds();
		buffer[3] = now.getMilliseconds() / 256;
		buffer[4] = now.getMilliseconds() % 256;
	
		e.request.value = buffer;
		
		BluetoothLE.respondToRequest({
			request: e.request,
			result: BluetoothLE.ATT_SUCCESS
		});
	});
	
	BluetoothLE.addEventListener('receivedWriteRequests', function(e) {
		if (!open) {
			return;
		}
		Lib.log('Received write request for ' + e.requests.length +
						' characteristic(s).');
		if (e.requests.length &&
			e.requests[0].characteristic.UUID === WRITE_CHAR_UUID
		) {
			receiveTextField.value = e.requests[0].value.toString();
			Lib.log('Updated receiveTextField.value to: ' +
									receiveTextField.value);

			BluetoothLE.respondToRequest({
				request: e.requests[0],
				result:  BluetoothLE.ATT_SUCCESS
			});
		}
	});
	
	BluetoothLE.addEventListener('readyToUpdateSubscribers', function() {
		if (!open) {
			return;
		}
		Lib.log('Received readyToUpdateSubscribers event.');
		if (notifChar) {
			if (BluetoothLE.updateValue({
				characteristic: notifChar,
				data: Ti.createBuffer({ value: sendTextField.value })
			})) {
				Lib.log('Characteristic updated.');
			} else {
				Lib.log('Characteristic failed to update.');
			}
		}
	});
	
	BluetoothLE.addEventListener('peripheralWillRestoreState', function(e) {
		if (!open) {
			return;
		}
		Lib.log('Received peripheralWillRestoreState event.');

		Lib.log('advertisement data: ' + e.advertisementData);
		
		Lib.log('advertised name: ' + e.advertisementData[BluetoothLE.ADVERT_DATA_KEY_LOCAL_NAME]);
		Lib.log('advertised service UUIDs: ' + e.advertisementData[BluetoothLE.ADVERT_DATA_KEY_SERVICE_UUIDS]);
		e.advertisementData[BluetoothLE.ADVERT_DATA_KEY_SERVICE_UUIDS].forEach(function(uuid){
			Lib.log('advertised UUID: ' + uuid);
		});
		restoredServiceAdvertisement = false;
		e.services.forEach(function(service) {
			if (Lib.uuidMatch(service.UUID, CUSTOM_SERVICE_UUID)) {
				service.characteristics.forEach(function(characteristic) {
					var subscribedCentrals;
					
					Lib.log('Restored characteristic: ' + characteristic.UUID);
					if (Lib.uuidMatch(characteristic.UUID, NOTIF_CHAR_UUID)) {
						subscribedCentrals = characteristic.subscribedCentrals;
						if (subscribedCentrals.length) {
							Lib.log('We have a subscribed central!');
							notifChar = characteristic;
						} else {
							Lib.log('We do not have a subscribed central!');
						}
					}
				});
				restoredServiceAdvertisement = true;
			}
		});
		
		if (restoredServiceAdvertisement && BluetoothLE.isAdvertising) {
			Lib.log('Peripheral was restored and is advertising!');
		} else {
			// This would be unusual as the peripheral is always advertising,
			// but better safe than sorry!
			BluetoothLE.stopAdvertising();
			e.services.forEach(function(service) {
				BluetoothLE.removeService(service);
			});
			// The peripheralManagerStateChange event handler will restart
			// advertisments...
		}
	});
	
	BluetoothLE.addEventListener('centralWillRestoreState', function(e) {
		if (!open) {
			return;
		}
		Lib.log('Received centralWillRestoreState event.');
				// e.serviceUUIDs is an array of strings, holding the UUIDs of
		// the services we are already scanning for.		
		e.serviceUUIDs.forEach(function(serviceUUID) {
			if (Lib.uuidMatch(serviceUUID, CUSTOM_SERVICE_UUID)) {
				scanRunning = true;
			}
		});
		
		if (scanRunning) {
			Lib.log('We are already scanning!');
		} else {
			Lib.log('Scanning is off!');
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
		Lib.log('Opening iOS to iOS example...');
		open = true;
	});
	
	self.addEventListener('restoring', function() {
		var restoredCentrals, restoredPeripherals;

		Lib.log('Restoring iOS to iOS example...');
		open = true;

		restoredCentrals = BluetoothLE.restoredCentralManagerIdentifiers;
		restoredPeripherals = BluetoothLE.restoredPeripheralManagerIdentifiers;

		if (restoredCentrals.length > 0) {
			Lib.log('... as a central!');
			restoreCentral();
		} else if (restoredPeripherals.length > 0) {
			Lib.log('... as a peripheral!');
			restorePeripheral();
		}
	});
	
	self.addEventListener('closing', function() {
		Lib.log('Closing iOS to iOS example...');
		shutdown();
		open = false;
	});
	return self;
}

module.exports = MainView;