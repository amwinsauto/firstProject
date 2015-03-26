var allFields = [];
var focusField = null;
var searchField = null;
var scannerFields = [];
var debug = false;
var Conversion = require('tools/Conversion');

Ti.App.addEventListener('lineaConnectionState', function(e) {

});
Ti.App.addEventListener('lineaBarcodeData', function(e) {
	setValue(e.barcode);

});
Ti.App.addEventListener('lineaMagneticCardData', function(e) {
	setValue(e.source);
});

function HardwareScanner() {
	allFields = [];
	focusField = null;
	searchField = null;
	scannerFields = [];
}

function setValue(value) {

	if (scannerFields.length === 1) {
		scannerFields[0].setValue(value);
		scannerFields[0].getField().fireEvent('return');
		return;
	}

	if (scannerFields.length > 1) {
		if (focusField) {
			for (var i = 0; i < scannerFields.legth; i++) {
				var field = scannerFields[i];
				if (field == focusField) {
					field.setValue(value);
					field.getField().fireEvent('return');
					return;
				}
			}
		}
		scannerFields[0].setValue(value);
		scannerFields[0].getField().fireEvent('return');
		return;
	}

	// No scanner fields

	// Focus on a form ?
	if (focusField) {
		focusField.setValue(value);
		focusField.getField().fireEvent('return');
	}
	// Focus in search on list ?
	if (searchField) {
		var vv = Conversion.toString(value);
		if (debug) {
			alert("Setting value in search field to: " + vv);
		}

		searchField.value = vv;
		searchField.fireEvent('return', {value : vv});
		if (debug) {
			alert("Search value set to: " + vv);
		}
	}
}

function allowScannerValue(field) {
	if (field.getType() === 'string') {
		return true;
	} else {
		return false;
	}
}

HardwareScanner.prototype.reset = function() {
	allFields = [];
	focusField = null;
	searchField = null;
	scannerFields = [];
};

HardwareScanner.prototype.setFocusField = function(field) {
	if (allowScannerValue(field)) {
		searchField = null;
		focusField = field;
		// if (debug) {
			// alert("Setting focus field");
		// }
	} else {
		searchField = null;
		focusField = null;
	}
};
HardwareScanner.prototype.setSearchField = function(field) {
	// if (debug) {
		// alert("Setting search field");
	// }
	searchField = field;
	focusField = null;
};

HardwareScanner.prototype.addScanableField = function(field) {
	scannerFields.push(field);
};
// HardwareScanner.prototype.setFields = function(fields) {
// allFields = fields;
// }

module.exports = HardwareScanner;

