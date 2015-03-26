var OldScanner = null;

function Scanner(data, connection) {

	// Formats
	var useThis = true;
	if (data.formats) {
		for (var i = 0; i < data.formats.length; i++) {
			if (data.formats[i] === 'qr_code') {
			} else if (data.formats[i] === 'data_matrix') {
				useThis = false;
			} else if (data.formats[i] === 'upc_e') {
			} else if (data.formats[i] === 'upc_a') {
			} else if (data.formats[i] === 'ean_8') {
			} else if (data.formats[i] === 'ean_13') {
			} else if (data.formats[i] === 'code_128') {
				useThis = false;
			} else if (data.formats[i] === 'code_39') {
				useThis = false;
			} else if (data.formats[i] === 'itf') {
				useThis = false;
			}
		}
	}

	if (!useThis) {
		if (OldScanner == null) {
			OldScanner = require('/Scanner');
		}
		new OldScanner(data, connection);
		return;
	}

	// Use the LED
	var useLED = true;
	if (data.useled != undefined) {
		if (data.useled === false || data.useled === '*OFF' || data.useled === '*NO' || data.useled === '0') {
			useLED = false;
		} else {
			useLED = true;
		}
	}

	if (Alloy.Globals.Scanditsdk == null) {
		Alloy.Globals.Scanditsdk = require("com.mirasense.scanditsdk");
	}
	// Changes the picker dimensions and the video feed orientation when the
	// orientation of the device changes.
	Ti.Gesture.addEventListener('orientationchange', orientationChange);

	// Scanner window
	var window = Titanium.UI.createWindow({
		//title : 'Scandit SDK',
		navBarHidden : true
	});

	// Overlays
	var flashButton = Ti.UI.createButton({
		title : useLED ? L('flash_turned_on') : L('flash_turned_off'),
		textAlign : 'center',
		color : '#000',
		backgroundColor : '#fff',
		style : 0,
		font : {
			fontWeight : 'bold',
			fontSize : 16
		},
		borderColor : '#000',
		borderRadius : 10,
		borderWidth : 1,
		opacity : 0.5,
		width : 220,
		height : 30,
		bottom : 10
	});
	flashButton.addEventListener('click', function() {
		useLED = !useLED;
		picker.switchTorchOn(useLED);
		flashButton.title = useLED ? L('flash_turned_on') : L('flash_turned_off');
	});
	var cancelButton = Ti.UI.createButton({
		title : L('cancel_button'),
		textAlign : 'center',
		color : '#000',
		backgroundColor : '#fff',
		style : 0,
		font : {
			fontWeight : 'bold',
			fontSize : 16
		},
		borderColor : '#000',
		borderRadius : 10,
		borderWidth : 1,
		opacity : 0.5,
		width : 220,
		height : 30,
		top : 30
	});
	cancelButton.addEventListener('click', function() {
		closeScanner();
	});

	// Instantiate the Scandit SDK Barcode Picker view
	var picker = Alloy.Globals.Scanditsdk.createView({
		width : "100%",
		height : "100%"
	});
	// Initialize the barcode picker, remember to paste your own app key here.
	picker.init("28a2CFwSEeORWwrp4g7jln9wa4NLLFHLLj7OA/bugi8", 0);

	picker.showSearchBar(false);
	// add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
	picker.showToolBar(false);

	// Set callback functions
	picker.setSuccessCallback(onSuccess);
	picker.setCancelCallback(onCancel);

	window.add(picker);

	window.add(flashButton);
	window.add(cancelButton);

	window.addEventListener('open', windowOnOpen);
	window.addEventListener('androidback', closeScanner);
	window.open();

	// Window opend start scanning
	function windowOnOpen(e) {
		if (OS_IOS) {
			picker.setOrientation(Ti.UI.orientation);
		} else {
			picker.setOrientation(window.orientation);
		}
		picker.setSize(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight);
		picker.startScanning();
	}

	function onSuccess(e) {
		//alert("success (" + e.symbology + "): " + e.barcode);
		setTimeout(function() {
			closeScanner();
			if (data.onSuccess) {
				var successAction = {
					type : 'scansuccess',
					request : {
						action : 'onSuccess',
						type : 'scan',
						scan : {
							onSuccess : data.onSuccess,
							value : e.barcode
						}
					}
				};
				connection.sendInfo(successAction);
			}
		}, 250);

	}

	function onCancel(e) {
		closeScanner();
		if (data.onCancel) {
			var cancelAction = {
				type : 'cancelscan',
				request : {
					action : 'onCancel',
					type : 'scan',
					scan : {
						onCancel : data.onCancel
					}
				}
			};
			connection.sendInfo(cancelAction);
		}
	}

	// Stops the scanner, removes it from the window and closes the latter.
	function closeScanner() {
		if (picker != null) {
			picker.stopScanning();
			window.remove(picker);
			picker = null;
			Ti.Gesture.removeEventListener('orientationchange', orientationChange);
			window.removeEventListener('open', windowOnOpen);
		}
		window.close();
	};

	function orientationChange(e) {
		// Changes the picker dimensions and the video feed orientation when the
		// orientation of the device changes.
		window.orientationModes = [Titanium.UI.PORTRAIT, Titanium.UI.UPSIDE_PORTRAIT, Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];
		if (picker != null) {
			picker.setOrientation(e.orientation);
			picker.setSize(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight);
			// You can also adjust the interface here if landscape should look
			// different than portrait.
		}
	}

}

module.exports = Scanner;
