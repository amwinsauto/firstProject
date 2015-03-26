/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false*/
/*global module */

/******************************
 * 
 * This sample app is a generic central implementation. It scans for any
 * available peripherals, tries to connect to them, and lists their
 * services/characteristics.
 * 
 ******************************/
var
	BluetoothLE = require('com.logicallabs.bluetoothle'),
	Lib = require('examples/lib')
;

function createPeripheralRow(peripheral) {
	var self, view, countParent,
	serviceCount = 0, charCount = 0,
	serviceCountLabel, charCountLabel, uuidOrAddressLabel;
	
	self = {};
	
	view = Ti.UI.createView({
		top: Lib.scale(5),
		height: Lib.scale(60), width: '100%',
		layout: 'vertical'
	});
	
	countParent = Ti.UI.createView({
		height: Lib.scale(20), width: '100%',
		layout: 'horizontal'
	});
	
	serviceCountLabel = Ti.UI.createLabel({
		text: 'Service count: 0',
		textAlign: 'center',
		color: 'white',
		font: {
			fontSize: Lib.scale(8)
		},
		width: '45%', left: Lib.scale(10)
	});

	charCountLabel = Ti.UI.createLabel({
		text: 'Char count: 0',
		textAlign: 'center',
		color: 'white',
		font: {
			fontSize: Lib.scale(8)
		},
		width: '45%', right: Lib.scale(10)
	});

	view.add(Ti.UI.createLabel({
		height: Lib.scale(20), width: '100%',
		color: 'white',
		font: {
			fontSize: Lib.scale(10)
		},
		text: 'Name: ' + peripheral.name
	}));

	uuidOrAddressLabel = Ti.UI.createLabel({
		height: Lib.scale(20), width: '100%',
		color: 'white',
		font: {
			fontSize: Lib.scale(10)
		}
	});
	if (Lib.isAndroid()) {
		uuidOrAddressLabel.text = 'Addr: ' + peripheral.address;
	} else {
		uuidOrAddressLabel.text = 'UUID: ' + peripheral.UUID;
	}
	view.add(uuidOrAddressLabel);
	
	countParent.add(serviceCountLabel);
	
	countParent.add(charCountLabel);
	
	view.add(countParent);
	
	self.getPeripheral = function() {
		return peripheral;
	};
	
	self.getView = function() {
		return view;
	};
	
	self.getServicesCount = function() {
		return serviceCount;
	};

	self.getCharCount = function() {
		return charCount;
	};

	self.setServicesCount = function(newCount) {
		serviceCount = newCount;
		serviceCountLabel.text = 'Service count: ' + serviceCount;
	};

	self.setCharCount = function(newCount) {
		charCount = newCount;
		charCountLabel.text = 'Char count: ' + charCount;
	};

	return self;
}

function MainView() {
	var self, statusLabel, descriptionLabel, scrollView, rowViews;
	
	var discoveredPeripherals;
		
	var digestServices, digestCharacteristics, digestNewValue, digestNewRSSI,
		digestWroteValue;
	
	self = Ti.UI.createView({  
		layout: 'vertical',
		backgroundColor: '#8E8E8E'
	});
	
	descriptionLabel = Lib.createDescriptionLabel({
		text: 'This is a generic central implementation. It attempts to ' +
		'discover and connect to any peripheral, and discovers its services ' +
		'and characteristics.'
	});
	
	self.add(descriptionLabel);
	
	statusLabel = Lib.createStatusLabel({
		text: ''	
	});
	
	self.add(statusLabel);

	function setStatus(text) {
		statusLabel.text = text;
		Ti.API.info(text);
	}

	function startScan() {
		BluetoothLE.startScan();
		setStatus('Started scanning...');
	}

	scrollView = Ti.UI.createScrollView({
		height: Lib.scale(300), top: Lib.scale(10),
		left: Lib.scale(10), right: Lib.scale(10),
		scrollType: 'vertical',
		layout: 'vertical'
	});
	
	self.add(scrollView);

	function refreshScrollView() {
		scrollView.removeAllChildren();
		scrollView.contentHeight = Lib.scale(65) * rowViews.length;
		rowViews.forEach(function(rowView) {
			scrollView.add(rowView.getView());
		});
	}
	
	BluetoothLE.addEventListener('discoveredPeripheral', function(e) {
		var newPeripheral, peripheralFromAddress, beacon;
			
		newPeripheral = true;
		discoveredPeripherals.forEach(function(peripheral) {
			if (peripheral.equals(e.peripheral)) {
				newPeripheral = false;
			}
		});
		
		if (newPeripheral) {
			if (Lib.isAndroid()) {
				beacon = BluetoothLE.createBeacon(e);
				if (beacon) {
					Ti.API.info('Peripheral is a beacon!');
					Lib.printBeaconInfo(beacon);
				}
			}
			discoveredPeripherals.push(e.peripheral);
			if (e.peripheral.isConnected) {
				Ti.API.info('Discovered a peripheral that\'s already connected!');
			} else {
				setStatus('Discovered new peripheral: ' + e.peripheral.name);
				
				if (Lib.isAndroid()) {
					peripheralFromAddress = BluetoothLE.createPeripheral({
						address: e.peripheral.address
					});
					
					Ti.API.info('Created peripheral from address: ' +
							peripheralFromAddress.name);
				}
				
				BluetoothLE.connectPeripheral({
					peripheral: e.peripheral
				});
			}
		} else {
			Ti.API.info('Received discoveredPeripheral event for previously ' +
							'discovered peripheral.');
		}
	});
	
	BluetoothLE.addEventListener('connectedPeripheral', function(e) {
		var newPeripheral, rowView;
		
		Ti.API.info('Testing isConnected property (should be true): ' +
							e.peripheral.isConnected);

		newPeripheral = true;
		rowViews.forEach(function(rowView) {
			if (rowView.getPeripheral().equals(e.peripheral)) {
				newPeripheral = false;
			}
		});
		if (newPeripheral) {
			rowView = createPeripheralRow(e.peripheral);
			rowViews.push(rowView);
			refreshScrollView();
			setStatus('Connected new peripheral: ' +
							e.peripheral.name);
	
			e.peripheral.addEventListener(
									'discoveredServices',
									digestServices);
			e.peripheral.addEventListener(
									'discoveredCharacteristics',
									digestCharacteristics);
			e.peripheral.discoverServices();
		} else {
			Ti.API.info('Received connectedPeripheral event for previously ' +
							'connected peripheral.');
		}
	});
	
	BluetoothLE.addEventListener('failedToConnectPeripheral', function(e) {
		Ti.API.info('Failed to connect to peripheral: ' + e.peripheral.name);

		if (e.errorCode) {
			Ti.API.info('Error code: ' + e.errorCode + ' description: ' + e.errorDescription);
		}
	});
	
	BluetoothLE.addEventListener('disconnectedPeripheral', function(e) {
		var newRowViews = [];
		
		rowViews.forEach(function(rowView) {
			if (rowView.getPeripheral().equals(e.peripheral)) {
				setStatus('Disconnected from peripheral: ' + e.peripheral.name);
				BluetoothLE.connectPeripheral({
					peripheral: e.peripheral
				});
			
				e.peripheral.removeEventListener(
					'discoveredServices',
					digestServices);
				e.peripheral.removeEventListener(
					'discoveredCharacteristics',
					digestCharacteristics);
			} else {
				newRowViews.push(rowView);
			}
		});
		
		rowViews = newRowViews;
		refreshScrollView();
	});
	
	digestServices = function(e) {
		var peripheral, services;
		
		peripheral = e.source;
		services = peripheral.services;
		
		Ti.API.info('Discovered ' + services.length +
					' services for peripheral: ' +
					peripheral.name);
		
		rowViews.forEach(function(rowView) {
			if (rowView.getPeripheral().equals(e.source)) {
				rowView.setServicesCount(services.length);
			}
		});
		
		services.forEach(function(service) {
			Ti.API.info('Service UUID: ' + service.UUID);
			e.source.discoverCharacteristics({
				service: service
			});
		});
	};
	
	digestCharacteristics = function(e) {
		var peripheral, service, characteristics;
		
		peripheral = e.source;
		service = e.service;
		characteristics = service.characteristics;
		
		if (service) {
			Ti.API.info('Discovered ' + characteristics.length +
						' characteristics for service: ' + service.UUID +
						' on peripheral: ' + peripheral.name);
			rowViews.forEach(function(rowView) {
				if (rowView.getPeripheral().equals(e.source)) {
					rowView.setCharCount(
						rowView.getCharCount() + characteristics.length);
				}
			});
			characteristics.forEach(function(characteristic) {
				Ti.API.info('Characteristic UUID: ' + characteristic.UUID);
			});	
		}
	};
	
	BluetoothLE.addEventListener('centralWillRestoreState', function() {
		Ti.API.info('Received centralWillRestoreState event.');
	});
	
	self.addEventListener('opening', function() {
		rowViews = [];
		discoveredPeripherals = [];
		refreshScrollView();
		Lib.initBluetoothCentral({
			onCallback: function() {
				startScan();
			},
			errorCallback: function(desc) {
				Lib.log(desc);
			}
		});
	});
	
	self.addEventListener('closing', function() {
		Lib.shutdownBluetoothCentral();
	});
	
	return self;
}

module.exports = MainView;