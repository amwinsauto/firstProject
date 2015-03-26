/*
 * Scanner.js
 * This will remain UnAlloyed since it is required that only on instance of Barcode is allowed
 * I'm not aware of anyway to do this in an Alloy Controller
 * It is possible to make the overlay in Alloy if needed. Should we do this ?????
 */

var overlay = null;
var flashButton = null;
var useLED = true;
var RedLaser = null;
var cameraPreview;

function Scanner(response, connection) {

	var data = response;

	// Use the LED
	if (data.useled != undefined) {
		if (data.useled === false || data.useled === '*OFF' || data.useled === '*NO' || data.useled === '0') {
			useLED = false;
		} else {
			useLED = true;
		}
	}

	if (RedLaser == null) {
		RedLaser = require('ti.redlaser');

		RedLaser.addEventListener('scannerActivated', function() {
			// Change settings such as supported barcode types here.
		});
		RedLaser.addEventListener('scannerStatusUpdated', function(updateInfo) {
			// Digest results returned by the RedLaser SDK here.
//			if (updateInfo.valid) {
				if (updateInfo.newFoundBarcodes.length) {
					//Ti.Media.vibrate([0, 250]);
					// Do
					var barcode = updateInfo.newFoundBarcodes[0];
					var barcodeType = barcode.barcodeType;
					var barcodeString = barcode.barcodeString;
					var extendedBarcodeString = barcode.extendedBarcodeString;
					var firstScanTime = barcode.firstScanTime;
					var mostRecentScanTime = barcode.mostRecentScanTime;
					var uniqueID = barcode.uniqueID;
					var isPartialBarcode = barcode.isPartialBarcode;
					Ti.Media.createSound({
						url : "beep.wav",
						volume : 1.0
					}).play();
					RedLaser.doneScanning();

					if (data.onSuccess) {
						var successAction = {
							type : 'scansuccess',
							request : {
								action : 'onSuccess',
								type : 'scan',
								scan : {
									onSuccess : data.onSuccess,
									value : barcodeString
								}
							}
						};
						//Barcode.fireEvent('doit', {data : successAction});
						setTimeout(function(e) {
							connection.sendInfo(successAction);
						}, 250);
					}
				}
//			}
		});
		RedLaser.addEventListener('scannerReturnedResults', function(e) {
			// This event is iOS only.
			Ti.API.info('Received scannerReturnedResults event.');
			//    e.foundBarcodes.forEach(logBarcodeResult);
		});

		RedLaser.addEventListener('backButtonPressed', function(e) {
			// This is an Android only event but it doesn't do any harm to define
			// a handler for it on either platform.
			Ti.API.info('backButtonPressed event received.');
			RedLaser.doneScanning();
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
				//Barcode.fireEvent('doit', {data : cancelAction});
				setTimeout(function(e) {
					connection.sendInfo(cancelAction);
				}, 250);
			}
		});

		overlay = Ti.UI.createView({
			backgroundColor : 'transparent',
			top : 0,
			right : 0,
			bottom : 0,
			left : 0
		});
		flashButton = Ti.UI.createButton({
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
			RedLaser.torchState = useLED;
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
			RedLaser.doneScanning();
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
				//Barcode.fireEvent('doit', {data : cancelAction});
				setTimeout(function(e) {
					connection.sendInfo(cancelAction);
				}, 250);
			}

		});

		cameraPreview = RedLaser.createCameraPreview({
			// The size and postion of the camera preview view can be set here
			width : '100%',
			height : '100%',
			// orientationModes: iOS only
			// Should be set to the same orientations as the window it is added to
			orientationModes : [Ti.UI.PORTRAIT]
		});

		if (OS_ANDROID) {
			overlay.add(cameraPreview);
		}
		overlay.add(cancelButton);
		overlay.add(flashButton);
	} else {
	}

	// Init properties for RedLaser
	RedLaser.torchState = useLED;
	flashButton.title = useLED ? L('flash_turned_on') : L('flash_turned_off');

	Ti.API.info('BARCODE_TYPE_CODABAR:' + RedLaser.BARCODE_TYPE_CODABAR);
	Ti.API.info('BARCODE_TYPE_CODE128:' + RedLaser.BARCODE_TYPE_CODE128);
	Ti.API.info('BARCODE_TYPE_CODE39:' + RedLaser.BARCODE_TYPE_CODE39);
	Ti.API.info('BARCODE_TYPE_CODE93:' + RedLaser.BARCODE_TYPE_CODE93);
	Ti.API.info('BARCODE_TYPE_DATAMATRIX:' + RedLaser.BARCODE_TYPE_DATAMATRIX);
	Ti.API.info('BARCODE_TYPE_EAN13:' + RedLaser.BARCODE_TYPE_EAN13);
	Ti.API.info('BARCODE_TYPE_EAN2:' + RedLaser.BARCODE_TYPE_EAN2);
	Ti.API.info('BARCODE_TYPE_EAN5:' + RedLaser.BARCODE_TYPE_EAN5);
	Ti.API.info('BARCODE_TYPE_EAN8:' + RedLaser.BARCODE_TYPE_EAN8);
	Ti.API.info('BARCODE_TYPE_ITF:' + RedLaser.BARCODE_TYPE_ITF);
	Ti.API.info('BARCODE_TYPE_NONE:' + RedLaser.BARCODE_TYPE_NONE);
	Ti.API.info('BARCODE_TYPE_QRCODE:' + RedLaser.BARCODE_TYPE_QRCODE);
	Ti.API.info('BARCODE_TYPE_RSS14:' + RedLaser.BARCODE_TYPE_RSS14);
	Ti.API.info('BARCODE_TYPE_STICKY:' + RedLaser.BARCODE_TYPE_STICKY);
	Ti.API.info('BARCODE_TYPE_UPCE:' + RedLaser.BARCODE_TYPE_UPCE);
	Ti.API.info('STATUS_API_LEVEL_TOO_LOW:' + RedLaser.STATUS_API_LEVEL_TOO_LOW);
	Ti.API.info('STATUS_EVAL_MODE_READY:' + RedLaser.STATUS_EVAL_MODE_READY);
	Ti.API.info('STATUS_LICENSED_MODE_READY:' + RedLaser.STATUS_LICENSED_MODE_READY);
	Ti.API.info('STATUS_MISSING_OS_LIBS:' + RedLaser.STATUS_MISSING_OS_LIBS);
	Ti.API.info('STATUS_NO_CAMERA:' + RedLaser.STATUS_NO_CAMERA);
	Ti.API.info('STATUS_BAD_LICENSE:' + RedLaser.STATUS_BAD_LICENSE);
	Ti.API.info('STATUS_SCAN_LIMIT_REACHED:' + RedLaser.STATUS_SCAN_LIMIT_REACHED);
	Ti.API.info('STATUS_MISSING_PERMISSIONS:' + RedLaser.STATUS_MISSING_PERMISSIONS);
	Ti.API.info('STATUS_UNKNOWN_STATE:' + RedLaser.STATUS_UNKNOWN_STATE);

	// Formats
	var acceptedFormats = null;
	// if (data.formats) {
	// acceptedFormats = [];
	// for (var i = 0; i < data.formats.length; i++) {
	// if (data.formats[i] === 'qr_code') {
	// acceptedFormats.push(Barcode.FORMAT_QR_CODE);
	// } else if (data.formats[i] === 'data_matrix') {
	// acceptedFormats.push(Barcode.FORMAT_DATA_MATRIX);
	// } else if (data.formats[i] === 'upc_e') {
	// acceptedFormats.push(Barcode.FORMAT_UPC_E);
	// } else if (data.formats[i] === 'upc_a') {
	// acceptedFormats.push(Barcode.FORMAT_UPC_A);
	// } else if (data.formats[i] === 'ean_8') {
	// acceptedFormats.push(Barcode.FORMAT_EAN_8);
	// } else if (data.formats[i] === 'ean_13') {
	// acceptedFormats.push(Barcode.FORMAT_EAN_13);
	// } else if (data.formats[i] === 'code_128') {
	// acceptedFormats.push(Barcode.FORMAT_CODE_128);
	// } else if (data.formats[i] === 'code_39') {
	// acceptedFormats.push(Barcode.FORMAT_CODE_39);
	// } else if (data.formats[i] === 'itf') {
	// acceptedFormats.push(Barcode.FORMAT_ITF);
	// }
	// }
	// }

	RedLaser.startScanning({
		overlay : overlay,
		cameraPreview : cameraPreview
	});

}

module.exports = Scanner;
