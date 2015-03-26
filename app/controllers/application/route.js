var args = arguments[0] || {};
var application = args.application;
var data = args.data;

var connection = application.getConnection();

$.from = data.fromaddress;
$.fromAddress = null;
if (data.fromlat && data.fromlng && data.fromlat > 0 && data.fromlng > 0) {
	$.from = data.fromlat + ',' + data.fromlng;
} else {
	$.fromAddress = data.fromaddress;
}

$.to = data.toaddress;
$.toAddress = null;
if (data.tolat && data.tolng && data.tolat > 0 && data.tolng > 0) {
	$.to = data.tolat + ',' + data.tolng;
} else {
	$.toAddress = data.toaddress;
}

connection.getGeoLocation(currentLocationFound);

function currentLocationFound(coords) {
	if ($.fromAddress || $.toAddress) {
		getGeoLocations($.toAddress, $.fromAddress, coords);
	} else {
		showRoute(coords);
	}
}

function getGeoLocations(to, from, coords) {
	var address = to;
	if (!address) {
		address = from;
	}
	var xhr = Ti.Network.createHTTPClient();
	xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&sensor=true');
	xhr.onload = function(e) {
		json = JSON.parse(e.source.responseText);
		if (json.results && json.results[0] && json.results[0].geometry && json.results[0].geometry.location) {
			if (to) {
				$.to = json.results[0].geometry.location.lat + ',' + json.results[0].geometry.location.lng;
			} else {
				$.from = json.results[0].geometry.location.lat + ',' + json.results[0].geometry.location.lng;
			}
		}
		if (from && to) {
			var xhr = Ti.Network.createHTTPClient();
			xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(from) + '&sensor=true');
			xhr.onload = function(e) {
				json = JSON.parse(e.source.responseText);
				if (json.results && json.results[0] && json.results[0].geometry && json.results[0].geometry.location) {
					$.from = json.results[0].geometry.location.lat + ',' + json.results[0].geometry.location.lng;
					showRoute(coords);
				}
			};
			xhr.onerror = function(e) {
				showRoute(coords);
			};
			xhr.send();
		} else {
			showRoute(coords);
		}
	};
	xhr.onerror = function(e) {
		if (from && to) {
			var xhr = Ti.Network.createHTTPClient();
			xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(to) + '&sensor=true');
			xhr.onload = function(e) {
				showRoute(coords);
			};
			xhr.onerror = function(e) {
				showRoute(coords);
			};
			xhr.send();
		} else {
			showRoute(coords);
		}
	};
	xhr.send();
}

function showRoute(coords) {
	var url = 'http://maps.apple.com/?';
	if (!OS_IOS || parseFloat(Ti.Platform.version) < 6) {
		url = 'http://maps.google.com/?';
	}
	if ($.to) {
		url += 'daddr=' + $.to;
	}
	if (!$.from) {
		$.from = coords.latitude + ',' + coords.longitude;
	}
	if ($.from) {
		url += '&saddr=' + $.from;
	}

	if (!$.to) {
		//alert(L('no_destination_specified'));
		Ti.UI.createAlertDialog({
			message : L('no_destination_specified')
		}).show();

		return;
	}

	Ti.Platform.openURL(url);
}
