var debug = true;

var Conversion = require('tools/Conversion');

var BEACON_PROXIMITY_OUTSIDE = 100;
var BEACON_PROXIMITY_INSIDE = 99;
var open = false;
var monitoring = false;

// Test;
//var BEACON_REGION_UUIDS = ['B9407F30-F5F8-466E-AFF9-25556B57FE6D', '61687109-905F-4436-91F8-E602F514C96D'];

var beaconDatas = [];
var counter = 0;
var idCounter = 0;
var beaconRegions = [];

if (debug) {
	logNow('BLE Module is started!' + new Date().toString());
}

var BluetoothLE = require('com.logicallabs.bluetoothle');

BluetoothLE.addEventListener('moduleReady', function() {
	if (debug) {
		logNow('BLE Module is ready!' + new Date().toString());
		logNow('Location manager authorization status: ' + BluetoothLE.locationManagerAuthorizationStatus);
	}
	open = true;

	BluetoothLE.addEventListener('locationManagerAuthorizationChanged', function(e) {
		if (!open) {
			return;
		}
		switch (e.status) {
		case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_NOT_DETERMINED:
			logNow('Location manager changed authorization status to undetermined.');
			break;
		case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_RESTRICTED:
			logNow('Location manager changed authorization status to restricted.');
			break;
		case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_DENIED:
			logNow('Location manager changed authorization status to denied.');
			break;
		case BluetoothLE.LOCATION_MANAGER_AUTHORIZATION_STATUS_AUTHORIZED:
			logNow('Location manager changed authorization status to authorized.');
			break;
		default:
			logNow('Unknown authorization status!');
		}
	});

	BluetoothLE.addEventListener('peripheralManagerStateChange', function(e) {

		if (!open) {
			return;
		}

		switch (e.state) {
		case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNKNOWN:
			logNow('Peripheral manager changed state to unknown.');
			break;
		case BluetoothLE.PERIPHERAL_MANAGER_STATE_RESETTING:
			logNow('Peripheral manager changed state to resetting.');
			break;
		case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNSUPPORTED:
			logNow('Peripheral manager changed state to unsupported.');
			logNow('Bluetooth LE is not supported.');
			break;
		case BluetoothLE.PERIPHERAL_MANAGER_STATE_UNAUTHORIZED:
			logNow('Peripheral manager changed state to unauthorized.');
			break;
		case BluetoothLE.PERIPHERAL_MANAGER_STATE_POWERED_OFF:
			logNow('Peripheral manager changed state to powered off.');
			break;
		case BluetoothLE.PERIPHERAL_MANAGER_STATE_POWERED_ON:
			logNow('Peripheral manager changed state to powered on.');
			/*
			 log('Firing up beacon #' + (counter % beaconRegions.length) + '...');
			 BluetoothLE.startAdvertising({
			 beaconRegion : beaconRegions[counter % beaconRegions.length]
			 });
			 */
			counter++;
			break;
		}
	});

	BluetoothLE.addEventListener('proximityChange', function(e) {
		var i;

		if (!open) {
			return;
		}
		if (debug) {
			log('Number of beacons that changed proximity: ' + e.beacons.length);
		}
		i = 0;
		e.beacons.forEach(function(beacon) {
			i++;
			if (debug) {
				log('Beacon #' + i);
				printBeaconInfo(beacon);
			}
			doBeacon(beacon);
		});
	});

	BluetoothLE.addEventListener('rangedBeacons', function(e) {
		var i,
		    tableData;

		if (!open) {
			return;
		}
		if (debug) {
			log('Beacons in range: ' + e.beacons.length);
			log('Region.UUID: ' + e.region.UUID);
			log('Region.major: ' + e.region.major);
			log('Region.minor: ' + e.region.minor);
		}

		i = 0;
		e.beacons.forEach(function(beacon) {
			i++;
			if (debug) {
				log('Beacon #' + i);
				printBeaconInfo(beacon);
			}
		});

	});

	BluetoothLE.addEventListener('regionStateUpdated', function(e) {
		var stateStr;

		if (debug) {
			log('regionStateUpdated event received for region ' + e.region.UUID + '/' + e.region.identifier);
		}
		if (!open) {
			return;
		}

		switch(e.state) {
		case BluetoothLE.REGION_STATE_UNKNOWN:
			stateStr = 'unknown';
			break;
		case BluetoothLE.REGION_STATE_INSIDE:
			doBeacon({
				UUID : e.region.UUID,
				major : e.region.major,
				minor : e.region.minor,
				proximity : BEACON_PROXIMITY_INSIDE
			});

			BluetoothLE.startRangingBeacons({
				beaconRegion : e.region
			});
			stateStr = 'inside.';
			break;
		case BluetoothLE.REGION_STATE_OUTSIDE:
			BluetoothLE.stopRangingBeacons({
				beaconRegion : e.region
			});
			stateStr = 'outside.';

			doBeacon({
				UUID : e.region.UUID,
				major : e.region.major,
				minor : e.region.minor,
				proximity : BEACON_PROXIMITY_OUTSIDE
			});

			break;
		}
		if (debug) {
			logNow('Region state for ' + e.region.UUID.slice(-4) + ' is now ' + stateStr);
		}
	});

	BluetoothLE.addEventListener('enteredRegion', function(e) {
		if (!open) {
			return;
		}
		// In theory, we could use this event instead of regionStateUpdated
		// to turn on ranging; however, our testing indicated that this event
		// is less reliable, so we recommend using regionStateUpdated instead.
		if (debug) {
			log('Received enteredRegion event for region ' + e.region.UUID);
		}
	});

	BluetoothLE.addEventListener('exitedRegion', function(e) {
		if (!open) {
			return;
		}
		// In theory, we could use this event instead of regionStateUpdated
		// to turn off ranging; however, our testing indicated that this event
		// is less reliable, so we recommend using regionStateUpdated instead.
		if (debug) {
			log('Received exitedRegion event for region ' + e.region.UUID);
		}
	});

	if (OS_IOS) {
		Ti.App.iOS.addEventListener('notification', function(e) {
			Ti.API.info('Notification received: ' + e.userInfo);
			showBeaconMessage(e.alertBody, e.userInfo);
		});
	}

});

exports.init = function(data) {
	// Reset
	if (monitoring) {
		shutdown();
	}

	// Make
	beaconDatas = createBeaconDatas(data);

	if (debug) {
		log('Started region monitoring...');
		log('BluetoothLE.BEACON_PROXIMITY_UNKNOWN: ' + BluetoothLE.BEACON_PROXIMITY_UNKNOWN);
		log('BluetoothLE.BEACON_PROXIMITY_IMMEDIATE: ' + BluetoothLE.BEACON_PROXIMITY_IMMEDIATE);
		log('BluetoothLE.BEACON_PROXIMITY_NEAR: ' + BluetoothLE.BEACON_PROXIMITY_NEAR);
		log('BluetoothLE.BEACON_PROXIMITY_FAR: ' + BluetoothLE.BEACON_PROXIMITY_FAR);
	}

	counter = 0;
	idCounter = 0;
	beaconRegions = [];

	beaconDatas.forEach(function(beacon) {
		if (debug) {
			log('Monitoring beacon: ' + JSON.stringify(beacon));
		}
		beaconRegions.push(BluetoothLE.createBeaconRegion({
			UUID : beacon.uuid,
			major : beacon.major,
			minor : beacon.minor,
			identifier : '#' + idCounter
		}));
		idCounter++;
	});

	beaconRegions.forEach(function(region) {
		BluetoothLE.startRegionMonitoring({
			beaconRegion : region
		});
		// BluetoothLE.startRangingBeacons({
		// beaconRegion : region
		// });
	});
	if (beaconRegions.length > 0) {
		monitoring = true;
	}

};

function createBeaconDatas(data) {
	var result = data.beacons || [];
	result.forEach(function(beacon) {
		beacon.proximity = BEACON_PROXIMITY_OUTSIDE;
	});

	return result;
}

function getBeaconData(beacon) {
	for (var i = 0,
	    j = beaconDatas.length; i < j; i++) {
		var b = beaconDatas[i];
		if (beacon.UUID === b.uuid) {
			if (beacon.major === b.major) {
				if (beacon.minor === b.minor) {
					return b;
				}
			}
		}
	};
	return null;
}

function doBeacon(beacon) {

	if (beacon.proximity === BluetoothLE.BEACON_PROXIMITY_UNKNOWN) {
		return;
	}
	var beaconData = getBeaconData(beacon);

	if (!beaconData) {
		logNow('No data found');
		return;
	}

	var oldProximity = beaconData.proximity;
	var newProximity = beacon.proximity;
	beaconData.proximity = newProximity;

	if (oldProximity > newProximity) {
		// Entering
		if (debug) {
			logNow('Entering from: ' + getProximity(oldProximity) + ' to ' + getProximity(newProximity));
		}
		switch(newProximity) {
		case BEACON_PROXIMITY_INSIDE:
			//  Outside -> Inside
			sendAction(beaconData, 'onEnter');
			break;
		case BluetoothLE.BEACON_PROXIMITY_FAR:
			switch(oldProximity) {
			case BEACON_PROXIMITY_OUTSIDE:
				//  Outside -> Far
				sendAction(beaconData, 'onEnter');
				sendAction(beaconData, 'onFarEnter');
				break;
			case BEACON_PROXIMITY_INSIDE:
				//  Inside -> Far
				sendAction(beaconData, 'onFarEnter');
				break;
			}
			break;
		case BluetoothLE.BEACON_PROXIMITY_NEAR:
			switch(oldProximity) {
			case BEACON_PROXIMITY_OUTSIDE:
				//  Outside -> Near
				sendAction(beaconData, 'onEnter');
				sendAction(beaconData, 'onFarEnter');
				sendAction(beaconData, 'onNearEnter');
				break;
			case BEACON_PROXIMITY_INSIDE:
				//  Inside -> Near
				sendAction(beaconData, 'onFarEnter');
				sendAction(beaconData, 'onNearEnter');
				break;
			case BluetoothLE.BEACON_PROXIMITY_FAR:
				//  Far -> Near
				sendAction(beaconData, 'onNearEnter');
				break;
			}
			break;
		case BluetoothLE.BEACON_PROXIMITY_IMMEDIATE:
			//startAccl();
			switch(oldProximity) {
			case BEACON_PROXIMITY_OUTSIDE:
				//  Outside -> Immidiate
				sendAction(beaconData, 'onEnter');
				sendAction(beaconData, 'onFarEnter');
				sendAction(beaconData, 'onNearEnter');
				sendAction(beaconData, 'onImmediateEnter');
				break;
			case BEACON_PROXIMITY_INSIDE:
				//  Inside -> Immidiate
				sendAction(beaconData, 'onFarEnter');
				sendAction(beaconData, 'onNearEnter');
				sendAction(beaconData, 'onImmediateEnter');
				break;
			case BluetoothLE.BEACON_PROXIMITY_FAR:
				//  Far -> Immidiate
				sendAction(beaconData, 'onNearEnter');
				sendAction(beaconData, 'onImmediateEnter');
				break;
			case BluetoothLE.BEACON_PROXIMITY_NEAR:
				//  Near -> Immidiate
				sendAction(beaconData, 'onImmediateEnter');
				break;
			}
			break;
		}
	} else if (newProximity > oldProximity) {
		// Exitting
		if (debug) {
			logNow('Exiting from: ' + getProximity(oldProximity) + ' to ' + getProximity(newProximity));
		}
		switch(oldProximity) {
		case BluetoothLE.BEACON_PROXIMITY_IMMEDIATE:
			// stopAccl();
			switch(newProximity) {
			case BEACON_PROXIMITY_OUTSIDE:
				//  Immidiate -> Outside
				sendAction(beaconData, 'onImmediateExit');
				sendAction(beaconData, 'onNearExit');
				sendAction(beaconData, 'onFarExit');
				sendAction(beaconData, 'onExit');
				break;
			case BEACON_PROXIMITY_INSIDE:
				//  Immidiate -> Inside
				sendAction(beaconData, 'onFarExit');
				sendAction(beaconData, 'onNearExit');
				sendAction(beaconData, 'onImmediateExit');
				break;
			case BluetoothLE.BEACON_PROXIMITY_FAR:
				//  Immidiate -> Far
				sendAction(beaconData, 'onNearExit');
				sendAction(beaconData, 'onImmediateExit');
				break;
			case BluetoothLE.BEACON_PROXIMITY_NEAR:
				//  Immidiate -> Near
				sendAction(beaconData, 'onImmediateExit');
				break;
			}
			break;
		case BluetoothLE.BEACON_PROXIMITY_NEAR:
			switch(newProximity) {
			case BEACON_PROXIMITY_OUTSIDE:
				//  Near -> Outside
				sendAction(beaconData, 'onNearExit');
				sendAction(beaconData, 'onFarExit');
				sendAction(beaconData, 'onExit');
				break;
			case BEACON_PROXIMITY_INSIDE:
				//  Near -> Inside
				sendAction(beaconData, 'onNearExit');
				sendAction(beaconData, 'onFarExit');
				break;
			case BluetoothLE.BEACON_PROXIMITY_FAR:
				//  Near -> Far
				sendAction(beaconData, 'onNearExit');
				break;
			}
			break;
		case BluetoothLE.BEACON_PROXIMITY_FAR:
			switch(newProximity) {
			case BEACON_PROXIMITY_OUTSIDE:
				//  Far -> Outside
				sendAction(beaconData, 'onFarExit');
				sendAction(beaconData, 'onExit');
				break;
			case BEACON_PROXIMITY_INSIDE:
				//  Far -> Inside
				sendAction(beaconData, 'onFarExit');
				break;
			}
			break;
		case BluetoothLE.BEACON_PROXIMITY_INSIDE:
			//  Inside -> Outside
			sendAction(beaconData, 'onExit');
			break;
		}
	}
}

function sendBeacon(info, backgroundaction) {
	if (info) {
		if (Alloy.Globals.dashboard) {
			Alloy.Globals.dashboard.beacon(info, backgroundaction);
		}
	}
}

function sendAction(beaconData, type) {
	if (!Alloy.Globals.dashboard) {
		return;
	}

	if (beaconData[type]) {

		var sendData = {
			action : type,
			type : 'beacon',
			beacon : {
				uuid : beaconData.uuid,
				major : beaconData.major,
				minor : beaconData.minor
			}
		};

		logNow('Data Found: ' + beaconData[type].length);
		var actions = beaconData[type];
		for (var i = 0,
		    j = actions.length; i < j; i++) {
			var onAction = actions[i];

			var timeVar = 'time' + type;
			logNow('SendNow: ' + type);
			logNow('SendNow data: ' + JSON.stringify(onAction));

			var timeInterval = onAction.timeinterval;

			var newTime = new Date().getTime();
			if (timeInterval) {
				var oldTime = beaconData[timeVar];
				if (oldTime) {
					if (debug) {
						logNow('OldTime: ' + (oldTime / 1000));
						logNow('NewTime: ' + (newTime / 1000));
						logNow('Timeout: ' + (timeInterval));
					}

					if (oldTime > newTime - (timeInterval * 1000)) {
						// Not enough time has passed
						logNow('SendNow: Not enough time has passed');
						return false;
					}
				}
			}

			var now = new Date();
			//now.setFullYear(2000);

			var starttime = Conversion.toTime(onAction.starttime);
			//alert('' + starttime + '-' + onAction.starttime);
			if (starttime) {
				//starttime.setFullYear(2000);
				logNow('Starttime ' + starttime.toString());
				logNow('Now ' + now.toString());
				if (starttime.getTime() > now.getTime()) {
					return false;
				}

			}
			var endtime = Conversion.toTime(onAction.endtime);
				logNow('endtime ' + onAction.endtime);
			if (endtime) {
				//endtime.setFullYear(2000);
				logNow('Endtime ' + endtime.toString());
				logNow('Now ' + now.toString());
				if (endtime.getTime() < now.getTime()) {
					return false;
				}

			}

			beaconData[timeVar] = newTime;

			var backgroundaction = onAction.backgroundaction;
			var message = onAction.message;
			sendData.beacon[type] = onAction;

			if (backgroundaction) {
				if (debug) {
					logNow('Sending: ' + JSON.stringify(sendData));
				}
				sendBeacon(sendData, true);
			}
			if (message) {
				if (Alloy.Globals.inBackground) {
					logNow("In background - Send notification");
					if (OS_IOS) {
						Ti.App.iOS.scheduleLocalNotification({
							alertBody : message.toString(),
							userInfo : backgroundaction ? undefined : sendData
						});
					}
					if (OS_ANDROID) {
						if (backgroundaction) {
							showBeaconMessage(message.toString());
						} else {
							showBeaconMessage(message.toString(), sendData);
						}
					}
				} else {
					logNow("Not In background - Show Beacon message");
					if (backgroundaction) {
						showBeaconMessage(message.toString());
					} else {
						showBeaconMessage(message.toString(), sendData);
					}
				}
			}
		};

		// if (debug) {
		// Ti.App.iOS.scheduleLocalNotification({
		// alertBody : getProximityString(beaconData),
		// alertAction : 'OK',
		// date : new Date(new Date().getTime() + 10)
		// });
		// }

		return true;
	}
	if (debug) {
		logNow('SendNow: ' + type + ' no action to send');
	}

	return false;
}

function showBeaconMessage(message, data) {

	var buttonNames = [L('close_button')];
	if (data) {
		buttonNames.push(L('start_button'));
	}

	var alert = Ti.UI.createAlertDialog({
		message : message,
		buttonNames : buttonNames
	});
	if (data) {
		alert.addEventListener('click', function(e) {
			if (e.index === 1) {
				sendBeacon(data, false);
			}
		});
	}
	alert.show();
}

function printBeaconInfo(beacon) {
	log('    UUID: ' + beacon.UUID);
	log('    major: ' + beacon.major);
	log('    minor: ' + beacon.minor);
	log('    RSSI: ' + beacon.RSSI);
	log('    proximity: ' + getProximityString(beacon));
}

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

function getProximity(proximity) {
	var result = '';

	switch(proximity) {
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

function log(s) {
	if (debug) {
		//Ti.API.info(s);
	}
}

function logNow(s) {
	if (debug) {
		Ti.API.info('Beacon - ' + s);
	}
}

function shutdown() {
	if (debug) {
		log('Stopping region monitoring...');
	}
	BluetoothLE.stopRangingBeacons();
	BluetoothLE.stopRegionMonitoring();
	monitoring = false;
	//setStatus('Stopped monitoring.');
}

function startAccl() {
	logNow('Accl Start');
	if (Ti.Platform.model === 'Simulator' || Ti.Platform.model.indexOf('sdk') !== -1) {
		logNow('Accelerometer does not work on a virtual device');
	} else {
		Ti.Accelerometer.addEventListener('update', accelerometerCallback);
	}
}

function stopAccl() {
	logNow('Accl Stop');
	if (Ti.Platform.model === 'Simulator' || Ti.Platform.model.indexOf('sdk') !== -1) {
		logNow('Accelerometer does not work on a virtual device');
	} else {
		Ti.Accelerometer.removeEventListener('update', accelerometerCallback);
	}
}

var kFilteringFactor = 0.1;
var accelZ = 0.0;
var accelerometerCallback = function(e) {

	var prevAccelZ = accelZ;

	accelZ = e.z - ((e.z * kFilteringFactor) + (accelZ * (1.0 - kFilteringFactor)));
	// Compute the derivative (which represents change in acceleration).
	var deltaZ = Math.abs((accelZ - prevAccelZ));

	// Check if the derivative exceeds some sensitivity threshold
	// (Bigger value indicates stronger bump)
	// (Probably should use length of the vector instead of componentwise)
	//	if (deltaX > 1 || deltaY > 1 || deltaZ > 1) {
	if (deltaZ > 1.5) {
		logNow('BUMP: ' + deltaZ);
	}
};

