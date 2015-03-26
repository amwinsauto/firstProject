/*
 * Scanner.js
 * This will remain UnAlloyed since it is required that only on instance of Barcode is allowed
 * I'm not aware of anyway to do this in an Alloy Controller
 * It is possible to make the overlay in Alloy if needed. Should we do this ?????
 */

var overlay = null;
var Barcode = null;
var flashButton = null;
var useLED = true;

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

	if (Barcode == null) {
		Barcode = require('ti.barcode');

		Barcode.addEventListener('error', function(e) {
			//alert(e.message);
			Ti.UI.createAlertDialog({
				message : e.message
			}).show();

		});

		// Barcode.addEventListener('doit', function(e) {
		// connection.sendInfo(e.data);
		// });

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
			Barcode.useLED = useLED;
			flashButton.title = useLED ? L('flash_turned_on') : L('flash_turned_off');
		});
		overlay.add(flashButton);
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
			Barcode.cancel();
		});
		overlay.add(cancelButton);

		Barcode.addEventListener('cancel', function(e) {
			// var data = e.source.data;
			var data = Barcode.data;
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
		Barcode.addEventListener('success', function(e) {
			// var data = e.source.data;
			Ti.Media.createSound({
				url : "beep.wav",
				volume : 1.0
			}).play();

			var data = Barcode.data;
			if (data.onSuccess) {
				var successAction = {
					type : 'scansuccess',
					request : {
						action : 'onSuccess',
						type : 'scan',
						scan : {
							onSuccess : data.onSuccess,
							value : e.result
						}
					}
				};
				//Barcode.fireEvent('doit', {data : successAction});
				setTimeout(function(e) {
					connection.sendInfo(successAction);
				}, 250);
			}
		});

	} else {
		//Barcode.removeEventListener('cancel', doCancel)
		//Barcode.removeEventListener('success', doSuccess)
	}
	//	Barcode.addEventListener('cancel', doCancel);
	//	Barcode.addEventListener('success', doSuccess);

	Barcode.data = data;

	// Init properties for Barcode
	Barcode.allowRotation = true;
	Barcode.displayedMessage = '';
	if (OS_ANDROID) {
		Barcode.allowMenu = false;
		Barcode.allowInstructions = false;
	}

	Barcode.useLED = useLED;
	flashButton.title = useLED ? L('flash_turned_on') : L('flash_turned_off');

	// Formats
	var acceptedFormats = null;
	if (data.formats) {
		acceptedFormats = [];
		for (var i = 0; i < data.formats.length; i++) {
			if (data.formats[i] === 'qr_code') {
				acceptedFormats.push(Barcode.FORMAT_QR_CODE);
			} else if (data.formats[i] === 'data_matrix') {
				acceptedFormats.push(Barcode.FORMAT_DATA_MATRIX);
			} else if (data.formats[i] === 'upc_e') {
				acceptedFormats.push(Barcode.FORMAT_UPC_E);
			} else if (data.formats[i] === 'upc_a') {
				acceptedFormats.push(Barcode.FORMAT_UPC_A);
			} else if (data.formats[i] === 'ean_8') {
				acceptedFormats.push(Barcode.FORMAT_EAN_8);
			} else if (data.formats[i] === 'ean_13') {
				acceptedFormats.push(Barcode.FORMAT_EAN_13);
			} else if (data.formats[i] === 'code_128') {
				acceptedFormats.push(Barcode.FORMAT_CODE_128);
			} else if (data.formats[i] === 'code_39') {
				acceptedFormats.push(Barcode.FORMAT_CODE_39);
			} else if (data.formats[i] === 'itf') {
				acceptedFormats.push(Barcode.FORMAT_ITF);
			}
		}
	} else {
		acceptedFormats = [];
		acceptedFormats.push(Barcode.FORMAT_QR_CODE);
		acceptedFormats.push(Barcode.FORMAT_UPC_E);
		acceptedFormats.push(Barcode.FORMAT_UPC_A);
		acceptedFormats.push(Barcode.FORMAT_EAN_8);
		acceptedFormats.push(Barcode.FORMAT_EAN_13);
	}

	if (acceptedFormats) {
		Barcode.capture({
			animate : false,
			overlay : overlay,
			showCancel : false,
			showRectangle : true,
			keepOpen : false,
			acceptedFormats : acceptedFormats
		});
	} else {
		Barcode.capture({
			animate : false,
			overlay : overlay,
			showCancel : false,
			showRectangle : true,
			keepOpen : false
		});

	}
}

module.exports = Scanner;
