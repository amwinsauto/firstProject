// exports.toString = function(value, defaultValue) {
	// if (value != undefined) {
		// return value.toString();
	// }
// 
	// if (defaultValue != undefined) {
		// return defaultValue;
	// }
	// return '';
// };

exports.fromNumber = function(number, decimals, defaultString) {

	if (number === null || number === undefined || number === '') {
		if (defaultString !== undefined) {
			return defaultString;
		}
		return '0';
	}

	var num = 0;
	var dec = 0;
	if (number != undefined && !isNaN(number)) {
		num = number;
	}
	if (decimals != undefined && !isNaN(decimals)) {
		dec = decimals;
	}

	var string = num.toFixed(dec).toString();
	string = string.replace('.', ',');
	return string;
};

exports.toNumber = function(string, defaultNumber) {

	var s = '';
	if (string != undefined && string != null) {
		s = string.toString().trim();
	}
	s = s.replace('.', '');
	s = s.replace(',', '.');
	if (s.length == 0) {
		if (defaultNumber !== undefined) {
			return defaultNumber;
		}
		return 0;
	}
	return parseFloat(s);
};

// exports.trim = function(string) {
	// return string.replace(/^\s+|\s+$/g, '');
// };
