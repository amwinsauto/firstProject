var moment = require('alloy/moment');

// Hardcoded !!!
var displayMonthFormat = 'MMMM yyyy';
var displayMonthFormatShort = 'MMM yy';
var displayMonthFormatMedium = 'MMM yyyy';
var displayMonthFormatLong = 'MMMM yyyy';

// JSON Formats
var jsonDateFormat = 'YYYY-MM-DD';
var jsonMonthFormat = 'YYYY-MM';
var jsonTimeFormat = 'HH:mm:ss';
var jsonDateTimeFormat = 'YYYY-MM-DD\'T\'HH:mm:ss';

var decimalSeparator = ',';
var thousandSeparator = '.';
if (String.formatDecimal(1.1).indexOf(',') == -1) {
	decimalSeparator = '.';
	thousandSeparator = ',';
}

exports.setJsonDateFormat = function(format) {
	jsonDateFormat = format;
};

exports.setJsonMonthFormat = function(format) {
	jsonMonthFormat = format;
};

exports.setJsonTimeFormat = function(format) {
	jsonTimeFormat = format;
};

exports.getDecimalSeparator = function() {
	return decimalSeparator;
};

exports.getThousandSeparator = function() {
	return thousandSeparator;
};

exports.trim = function(string) {
	if (string === undefined) {
		return '';
	}
	return string.replace(/^\s+|\s+$/g, '');
};

exports.replaceAll = function(txt, replace, with_this) {
	return replaceAll(txt, replace, with_this);
};
exports.urlEncode = function(input) {
	if (input) {
		input = input.toString();
		
		if (input.indexOf('%20') > -1) {
			// Some servers encodes urls
			return input;
		}
		
		return encodeURI(input);

		//return this.replaceAll(input.toString(), ' ', '%20');
	}
	return "";
};

exports.urlValidate = function(url) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(url);
};

function formatNumber(number, decimals, showThousandSeparator) {
	number = number.toFixed(decimals) + '';
	x = number.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? decimalSeparator + x[1] : '';
	if (showThousandSeparator) {
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + thousandSeparator + '$2');
		}
	}
	return x1 + x2;
}

exports.toDisplayNumber = function(number, decimals, showThousandSeparator, showZero) {

	var num = this.toNumber(number, '');
	if (num === null || num === undefined || isNaN(num) || num === '') {
		return '';
	} else {
		if (num == 0 && !showZero) {
			return '';
		}
	}

	var dec = 0;
	if (decimals != undefined && !isNaN(decimals) && decimals != null) {
		dec = decimals;
	}

	return formatNumber(num, dec, showThousandSeparator);
};

exports.toDisplayDateTime = function(dateInput, format) {
	var d = toDateTime(dateInput);
	return this.toDisplayDate(d) + '  ' + this.toDisplayTime(d);
};

exports.toDisplayDate = function(dateInput, format) {
	var date = toDate(dateInput);
	if (date) {
		if (format) {
			if (format === 'short') {
				return String.formatDate(date, 'short');
			} else if (format === 'medium') {
				return String.formatDate(date, 'medium');
			} else if (format === 'long') {
				return String.formatDate(date, 'long');
			}
		} else {
			return String.formatDate(date, 'medium');
		}
	}
	return '';
};

exports.toDisplayTime = function(timeInput, format) {

	var time = toTime(timeInput);
	if (time) {
		if (format) {
			if (format === 'short') {
				return String.formatTime(time, 'short');
			} else if (format === 'medium') {
				return String.formatTime(time, 'medium');
			} else if (format === 'long') {
				return String.formatTime(time, 'long');
			}
		} else {
			return String.formatTime(time, 'short');
		}
	}
	return '';
};

exports.toDisplayMonth = function(monthInput, format) {
	var date = toMonth(monthInput);
	var monthStr = '';
	if (date) {
		if (format) {
			if (format === 'short') {
				return moment(date).format(displayMonthFormatShort.toUpperCase());
			} else if (format === 'medium') {
				return moment(date).format(displayMonthFormatMedium.toUpperCase());
			} else if (format === 'long') {
				return moment(date).format(displayMonthFormatLong.toUpperCase());
			}
		} else {
			return moment(date).format(displayMonthFormat.toUpperCase());
		}
	}
	return monthStr;
};

exports.parseDisplayNumber = function(string, defaultNumber) {

	var s = '';
	if (string != undefined && string != null) {
		s = string.toString().trim();
	}
	if (s.length == 0) {
		if (defaultNumber !== undefined) {
			return defaultNumber;
		}
		return 0;
	}

	// Remove thousand separator
	// Ex 12.122,45,45 -> 12122,45,45
	s = replaceAll(s, thousandSeparator, '');

	// Check if more than one decimalSeparator
	// Ex 12122,45,45 -> 1212245,45
	while (s.indexOf(decimalSeparator) != s.lastIndexOf(decimalSeparator)) {
		s = s.replace(decimalSeparator, '');
	}
	if (decimalSeparator === ',') {
		// parseFloat always parses with . as decimal separator
		s = replaceAll(s, decimalSeparator, '.');
	}
	var positive = true;
	if (s.indexOf('-') > -1) {
		s = replaceAll(s, '-', '');
		positive = false;
	}

	var number = parseFloat(s);

	if (!isNaN(number)) {
		if (!positive) {
			number = number * -1;
		}
	}
	return number;
};

exports.toNumber = function(string, defaultNumber) {

	var s = '';
	if (string != undefined && string != null) {
		if (Object.prototype.toString.call(string) === "[object Number]") {
			return string;
		}
		s = string.toString().trim();
	}
	if (s.length > 0) {
		if (s.indexOf('-') > -1) {
			s = replaceAll(s, '-', '');
			return parseFloat(s) * -1;
		}
		return parseFloat(s);
	}
	if (defaultNumber != undefined) {
		return defaultNumber;
	}

	return 0;
};

exports.toString = function(value, defaultValue) {
	if (value != undefined && value != null) {
		return value.toString();
	}
	if (defaultValue != undefined) {
		return defaultValue;
	}
	return '';
};

exports.toDate = function(inputDate, defaultDate) {
	var date = toDate(inputDate);
	if (date) {
		return date;
	}
	if (defaultDate !== undefined) {
		return defaultDate;
	}
	return null;
};
exports.toDateTime = function(inputDate, defaultDate) {
	var date = toDateTime(inputDate);
	if (date) {
		return date;
	}
	if (defaultDate !== undefined) {
		return defaultDate;
	}
	return null;
};

exports.toMonth = function(inputMonth, defaultMonth) {
	var month = toMonth(inputMonth);
	if (month) {
		return month;
	}
	if (defaultMonth !== undefined) {
		return defaultMonth;
	}
	return null;
};

exports.toTime = function(inputTime, defaultTime) {
	var time = toTime(inputTime);
	if (time) {
		return time;
	}
	if (defaultTime !== undefined) {
		return defaultTime;
	}
	return null;
};

exports.dateToJson = function(date, defaultNumber) {
	var date = dateToJson(date);
	if (date) {
		return date;
	}
	if (defaultNumber !== undefined) {
		return defaultNumber;
	}
	return null;
};
exports.dateTimeToJson = function(date, defaultNumber) {
	var date = dateTimeToJson(date);
	if (date) {
		return date;
	}
	if (defaultNumber !== undefined) {
		return defaultNumber;
	}
	return null;
};

exports.monthToJson = function(date, defaultNumber) {
	var date = monthToJson(date);
	if (date) {
		return date;
	}
	if (defaultNumber !== undefined) {
		return defaultNumber;
	}
	return null;
};

exports.timeToJson = function(time, defaultNumber) {
	var time = timeToJson(time);
	if (time) {
		return time;
	}
	if (defaultNumber !== undefined) {
		return defaultNumber;
	}
	return null;
};

exports.substituteAll = function(title, substitutes) {
	if (!title) {
		return '';
	}

	if (title.length < 2 || !substitutes || substitutes.length == 0) {
		return title;
	}

	if (Object.prototype.toString.call(substitutes) === "[object Array]") {
		for (var i = 0; i < substitutes.length; i++) {
			title = this.substitute(title, substitutes[i]);
		}
	} else {
		title = this.substitute(title, substitutes);
	}

	return title;
};
exports.substitute = function(title, subst) {
	if (!subst) {
		subst = '';
	}
	// Find %
	var index = title.indexOf('%');
	if (index == -1) {
		return title;
	}
	var start = title.substring(0, index);
	var middle = '';
	var after = title.substring(index);

	if (after.indexOf("%s") == 0) {
		return start + subst + after.substring(2);
	} else if (after.indexOf("%d") == 0) {
		if (after.length > 3 && after.indexOf("%ddd") == 0) {
			return start + this.toDisplayDate(subst, 'long') + after.substring(4);
		}
		if (after.length > 2 && after.indexOf("%dd") == 0) {
			return start + this.toDisplayDate(subst, 'medium') + after.substring(3);
		}
		return start + this.toDisplayDate(subst, 'short') + after.substring(2);
	} else if (after.indexOf("%t") == 0) {
		if (after.length > 3 && after.indexOf("%ttt") == 0) {
			return start + this.toDisplayTime(subst, 'long') + after.substring(4);
		}
		if (after.length > 2 && after.indexOf("%tt") == 0) {
			return start + this.toDisplayTime(subst, 'medium') + after.substring(3);
		}
		return start + this.toDisplayTime(subst, 'short') + after.substring(2);
	} else if (after.indexOf("%m") == 0) {
		if (after.length > 3 && after.indexOf("%mmm") == 0) {
			return start + this.toDisplayMonth(subst, 'long') + after.substring(4);
		}
		if (after.length > 2 && after.indexOf("%mm") == 0) {
			return start + this.toDisplayMonth(subst, 'medium') + after.substring(3);
		}
		return start + this.toDisplayMonth(subst, 'short') + after.substring(2);
	} else if (after.indexOf("%n") == 0) {
		if (after.length > 2) {
			if (after.indexOf("%n0") == 0) {
				return start + this.toDisplayNumber(subst, 0, false, true) + after.substring(3);
			} else if (after.indexOf("%n1") == 0) {
				return start + this.toDisplayNumber(subst, 1, false, true) + after.substring(3);
			} else if (after.indexOf("%n2") == 0) {
				return start + this.toDisplayNumber(subst, 2, false, true) + after.substring(3);
			} else if (after.indexOf("%n3") == 0) {
				return start + this.toDisplayNumber(subst, 3, false, true) + after.substring(3);
			} else if (after.indexOf("%n4") == 0) {
				return start + this.toDisplayNumber(subst, 4, false, true) + after.substring(3);
			}
		}
		return start + this.toDisplayNumber(subst, 0, false, true) + after.substring(2);
	} else if (after.indexOf("%N") == 0) {
		if (after.length > 2) {
			if (after.indexOf("%N0") == 0) {
				return start + this.toDisplayNumber(subst, 0, true, true) + after.substring(3);
			} else if (after.indexOf("%N1") == 0) {
				return start + this.toDisplayNumber(subst, 1, true, true) + after.substring(3);
			} else if (after.indexOf("%N2") == 0) {
				return start + this.toDisplayNumber(subst, 2, true, true) + after.substring(3);
			} else if (after.indexOf("%N3") == 0) {
				return start + this.toDisplayNumber(subst, 3, true, true) + after.substring(3);
			} else if (after.indexOf("%N4") == 0) {
				return start + this.toDisplayNumber(subst, 4, true, true) + after.substring(3);
			}
		}
		return start + this.toDisplayNumber(subst, 0, true, true) + after.substring(2);
	}

	return start + after;

};

exports.base64Decode = function(data) {
	// http://kevin.vanzonneveld.net
	// +   original by: Tyler Akins (http://rumkin.com)
	// +   improved by: Thunder.m
	// +      input by: Aman Gupta
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   bugfixed by: Onno Marsman
	// +   bugfixed by: Pellentesque Malesuada
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +      input by: Brett Zamir (http://brett-zamir.me)
	// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
	// *     returns 1: 'Kevin van Zonneveld'
	// mozilla has this native
	// - but breaks in 2.0.0.12!
	//if (typeof this.window['atob'] == 'function') {
	//    return atob(data);
	//}
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1,
	    o2,
	    o3,
	    h1,
	    h2,
	    h3,
	    h4,
	    bits,
	    i = 0,
	    ac = 0,
	    dec = "",
	    tmp_arr = [];

	if (!data) {
		return data;
	}

	data += '';

	do {// unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;

		if (h3 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
			tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	} while (i < data.length);

	dec = tmp_arr.join('');

	return dec;
};

exports.base64Encode = function(data) {
	// http://kevin.vanzonneveld.net
	// +   original by: Tyler Akins (http://rumkin.com)
	// +   improved by: Bayron Guevara
	// +   improved by: Thunder.m
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   bugfixed by: Pellentesque Malesuada
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: Rafał Kukawski (http://kukawski.pl)
	// *     example 1: base64_encode('Kevin van Zonneveld');
	// *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	// mozilla has this native
	// - but breaks in 2.0.0.12!
	//if (typeof this.window['btoa'] == 'function') {
	//    return btoa(data);
	//}
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1,
	    o2,
	    o3,
	    h1,
	    h2,
	    h3,
	    h4,
	    bits,
	    i = 0,
	    ac = 0,
	    enc = "",
	    tmp_arr = [];

	if (!data) {
		return data;
	}

	do {// pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	enc = tmp_arr.join('');

	var r = data.length % 3;

	return ( r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
};

function toDate(inputDate) {
	if (!inputDate) {
		return null;
	}

	if (Object.prototype.toString.call(inputDate) === "[object Date]") {
		return inputDate;
	}

	var sDate = inputDate.toString();
	var dateMoment = null;
	switch(sDate.length) {
	case 4:
		// Old Compatibility
		dateMoment = moment(sDate, 'YYYY');
		break;
	case 6:
		// Old Compatibility
		dateMoment = moment(sDate, 'YYYYMM');
		break;
	case 7:
		// Old Compatibility
		dateMoment = moment(sDate, 'YYYY-MM');
		break;
	case 8:
		// Old Compatibility
		dateMoment = moment(sDate, 'YYYYMMDD');
		break;
	default:
		dateMoment = moment(sDate);
		break;
	}
	if (dateMoment.isValid()) {
		return dateMoment.toDate();

	}
	return null;
}

function toDateTime(inputDate) {
	if (!inputDate) {
		return null;
	}

	if (Object.prototype.toString.call(inputDate) === "[object Date]") {
		return inputDate;
	}

	var sDate = inputDate.toString();
	var dateMoment = moment(sDate);
	if (dateMoment != null) {
		//Ti.API.info('Date valid? ' + dateMoment.isValid());
		if (dateMoment.isValid()) {
			return dateMoment.toDate();

		}
	}
	return null;
}

function dateToJson(date) {
	var d = toDate(date);
	if (d) {
		return moment(d).format(jsonDateFormat);
	}
	return null;
}

function dateTimeToJson(date) {
	var d = toDateTime(date);
	if (d) {
		return moment(d).format(jsonDateTimeFormat);
	}
	return null;
}

function toMonth(inputMonth) {
	if (!inputMonth) {
		return null;
	}

	if (Object.prototype.toString.call(inputMonth) === "[object Date]") {
		return inputMonth;
	}

	//	YYYY-MM or YYYYMM
	//	YYYY-MM-DD or YYYYMMDD

	var sMonth = inputMonth.toString();
	var monthMoment = null;
	switch(sMonth.length) {
	case 6:
		monthMoment = moment(sMonth, 'YYYYMM');
		break;
	case 7:
		monthMoment = moment(sMonth, 'YYYY-MM');
		break;
	case 8:
		monthMoment = moment(sMonth, 'YYYYMMDD');
		break;
	case 10:
		monthMoment = moment(sMonth, 'YYYY-MM-DD');
		break;
	default:
		monthMoment = moment(sMonth);
		break;
	}
	//Ti.API.info('Month valid? ' + monthMoment.isValid());
	if (monthMoment.isValid()) {
		return monthMoment.toDate();
	}
	return null;
}

function monthToJson(date) {
	var d = toDate(date);
	if (d) {
		return moment(d).format(jsonMonthFormat);
	}
	return null;
}

function toTime(inputTime) {
	if (!inputTime) {
		return null;
	}

	if (Object.prototype.toString.call(inputTime) === "[object Date]") {
		return inputTime;
	}

	// hh:mm:ss	or	hhmmss
	// hh:mm	or	hhmm
	// hh
	var sTime = inputTime.toString();
	var timeMoment = null;
	if (sTime.indexOf(':') > -1) {
		switch(sTime.length) {
		case 5:
			timeMoment = moment(sTime, 'HH:mm');
			break;
		case 8:
			timeMoment = moment(sTime, 'HH:mm:ss');
			break;
		default:
			timeMoment = moment(sTime);
			break;
		}

	} else {
		switch(sTime.length) {
		case 1:
			timeMoment = moment("0" + sTime, 'HH');
			break;
		case 2:
			timeMoment = moment(sTime, 'HH');
			break;
		case 3:
			timeMoment = moment("0" + sTime, 'HHmm');
			break;
		case 4:
			timeMoment = moment(sTime, 'HHmm');
			break;
		case 5:
			timeMoment = moment("0" + sTime, 'HHmmss');
			break;
		case 6:
			timeMoment = moment(sTime, 'HHmmss');
			break;
		default:
			timeMoment = moment(sTime);
			break;
		}
	}
	//Ti.API.info('Time valid? ' + timeMoment.isValid());
	if (timeMoment.isValid()) {
		// Bug in String.formatTime() needs a year
		if (timeMoment.year() === 0) {
			timeMoment.year(2000);
		}
		return timeMoment.toDate();
	}
	return null;
}

function timeToJson(time) {
	var t = toTime(time);
	if (t) {
		return moment(t).format(jsonTimeFormat);
	}
	return null;
}

function replaceAll(txt, replace, with_this) {
	if (!txt) {
		return '';
	}
	var rep = replace;
	if (rep === ',' || rep === '.') {
		rep = '\\' + rep;
	}

	return txt.replace(new RegExp(rep, 'g'), with_this);
}

