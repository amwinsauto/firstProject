/*jslint white:true plusplus:true nomen:true vars:true sloppy:true undef:false*/
/*
 Note: The iOS version of this sample app requires the following lines
 in the tiapp.xml file for generic (non-beacon related) functionality to
 work in the background:
 
    <ios>
        <min-ios-ver>6.0</min-ios-ver>
        <plist>
            <dict>
                <key>UIBackgroundModes</key>
                <array>
                    <string>bluetooth-central</string>
                    <string>bluetooth-peripheral</string>
                </array>
            </dict>
        </plist>
    </ios>
    
 Similarly, the iOS version of this sample app requires the following lines
 in the tiapp.xml file for beacon related functionality to work:
 
     <ios>
        <min-ios-ver>6.0</min-ios-ver>
        <plist>
            <dict>
				<key>NSLocationAlwaysUsageDescription</key>
				<string>
					Please allow "always" usage to enable beacon monitoring!
				</string>
            </dict>
        </plist>
    </ios>

 Obviously, the two can be merged into one ios/plist section.
*/

Ti.API.info('Entering app.js of Logical Labs Bluetooth LE sample app.');

var Menu,
	Lib,
	navWin, win, menu,
	restoreTo, warningLabel, warningText;

var BluetoothLE = require('com.logicallabs.bluetoothle');

win = Ti.UI.createWindow({
	title:'Bluetooth LE Examples',
	exitOnClose:true,
	backgroundColor:'#8E8E8E',
	orientationModes: [ Ti.UI.PORTRAIT ]
});

if ((Ti.Platform.osname === 'android' && Ti.Platform.version >= '4.3') ||
	((Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') &&
	Ti.Platform.version >= '5.0')) {
	Menu = require('menu');
	Lib = require('examples/lib');


	if (Lib.isIOS()) {
		navWin = Titanium.UI.iOS.createNavigationWindow({
		   window: win
		});
		win.addEventListener('open', function() {
			BluetoothLE.requestAlwaysAuthorization();
		});
	}
	
	menu = new Menu(navWin);
	win.add(menu.getView());
	
	BluetoothLE.addEventListener('moduleReady', function() {
		var restoredCentrals, restoredPeripherals;
		
		Lib.log('BLE Module is ready!');
		if (navWin) {
			navWin.open();
		} else {
			win.open();
		}
		
		restoredCentrals = BluetoothLE.restoredCentralManagerIdentifiers;
		restoredPeripherals = BluetoothLE.restoredPeripheralManagerIdentifiers;
		
		if (restoredCentrals.length > 0) {
			/*jslint eqeq:true */
			if (restoredCentrals[0] == 'ios-to-ios') {
			/*jslint eqeq:false */
				Lib.log('Will restore iOS to iOS example.');
				menu.open({
					title: 'iOS to iOS Central Restored',
					path: 'examples/ios-to-ios.js',
					restore: true
				});
			}
			/*jslint eqeq:true */
			if (restoredCentrals[0] == 'heart-rate-monitor') {
			/*jslint eqeq:false */
				Lib.log('Will restore heart rate monitor example.');
				menu.open({
					title: 'Heart Rate Monitor Restored',
					path: 'examples/heart-rate-monitor.js',
					restore: true
				});
			}
		} else if (restoredPeripherals.length > 0) {
			/*jslint eqeq:true */
			if (restoredPeripherals[0] == 'ios-to-ios') {
			/*jslint eqeq:false */
				menu.open({
					title: 'iOS to iOS Peripheral Restored',
					path: 'examples/ios-to-ios.js',
					restore: true
				});
			}
		} else if (BluetoothLE.wasLocationLaunch) {
			// We will jump to the assumption that it was the iBeacon
			// example that caused this; it might have been the Estimotes
			// example, too...
			menu.open({
				title: 'iBeacons Restored',
				path: 'examples/ibeacon.js',
				restore: true
			});
		}
		if (Lib.isAndroid()) {
			if (Ti.Android.currentActivity.intent.getStringExtra('eventName')) {
				// If eventName is set on the intent launching the current activity,
				// then chances are we are being launched by the module.
				menu.open({
					title: 'App Launch',
					path: 'examples/launch-app-from-module.js'
				});
			}
		}
	});
	
} else {
	warningText = 'This module provides access to functionality that is only ' +
				'present in Android version 4.3 or higher and iOS version ' +
				' 5.0 and higher.';
	Ti.API.error(warningText);
	warningLabel = Ti.UI.createLabel({
		width: '90%',
		color: 'red',
		font: {
			fontSize: Math.round(16 * Ti.Platform.displayCaps.platformWidth / 320)
		},
		text: warningText,
		backgroundColor: 'white'
	});
	
	win.add(warningLabel);
	win.open();
}

Ti.API.info('Exiting app.js of Logical Labs Bluetooth LE sample app.');