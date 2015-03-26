/*
 var __alloyId13 = [];
 $.__views.mapview = Ti.Map.createView({
 left : 0,
 right : 0,
 mapType : Ti.Map.NORMAL_TYPE,
 animate : true,
 userLocation : false,
 annotations : __alloyId13,
 id : "mapview",
 ns : Ti.Map
 });
 $.__views.mapview && $.addTopLevelView($.__views.mapview);
 _.extend($, $.__views);
 */

var args = arguments[0] || {};
var window = args.window;
var data = args.data;

var Images = require('Images');

$.window = window;
var controller = window.getController();
var connection = controller.getConnection();

var addressLookupPin = null;
if (OS_ANDROID) {
	//	window.setOrientationModes([Ti.UI.PORTRAIT]);
	//window.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}
if (OS_IOS) {
	//	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT]);
	window.setOrientationModes(Alloy.isTablet ? [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] : [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]);
}

$.data = data;

$.minLng = undefined;
$.maxLng = undefined;
$.minLat = undefined;
$.maxLat = undefined;

$.annotations = [];

setMapType(data.type);

var addressLookup = false;
if (data.addresslookup) {
	addressLookup = true;
}

if (addressLookup) {
	$.okButton = createOKButton();
	$.addPinButton = createAddPinButton();
	$.removePinButton = createRemovePinButton();

	var buttonCnt = 0;
	if (data.buttons) {
		buttonCnt = data.buttons.length;
	} else {
		data.buttons = [];
	}
	data.buttons.push($.okButton);
	data.buttons.push($.addPinButton);
	if (OS_IOS) {
		data.buttons.push(Ti.UI.createButton({
			//type : 'TiUIButton',
			systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		}));
	}
	data.buttons.push($.removePinButton);

	$.mapview.addEventListener('click', function(e) {
		if (e.annotation) {
			getAddress(e.annotation, true);
		}
	});

	var that = $;
	$.mapview.addEventListener('regionchanged', function(e) {
		that.addPinButton.latitude = e.latitude;
		that.addPinButton.longitude = e.longitude;
	});

	var address = data.address;
	if (address) {
		var that = $;
		var xhr = Titanium.Network.createHTTPClient();
		xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&sensor=true&language=da');
		xhr.onload = function() {
			var json = JSON.parse(this.responseText);
			if (!json.results || !json.results[0] || !json.results[0].geometry || !json.results[0].geometry.location) {
				return null;
			}
			that.createDraggablePin(undefined, json.results[0].geometry.location.lat, json.results[0].geometry.location.lng, L('looking_up_address'));
		};
		xhr.onerror = function(e) {
			return null;
		};
		xhr.send();
	} else {
		if (data.annotations && data.annotations.length > 0) {
			createDraggablePin(data.annotations[0].name, data.annotations[0].lat, data.annotations[0].lng, L('looking_up_address'), '', data.annotations[0].color, data.annotations[0].image);
		} else {
			connection.getGeoLocation(currentLocationFound, $);
		}
	}
} else {
	if (data.annotations) {
		addPins(data.annotations);
	}
}

setLocation();

// Add button event
$.mapview.addEventListener('click', function(e) {
	if (e.clicksource === 'leftButton' || e.clicksource === 'leftPane') {
		if (e.annotation && e.annotation.onLeftClick) {
			var requestInfo = {
				type : 'annotationleftclick',
				caller : $.window.getWindow(),
				request : {
					action : 'onClick',
					type : 'annotation',
					annotation : {
						name : e.annotation.name,
						onClick : e.annotation.onLeftClick
					}
				}
			};
			connection.sendInfo(requestInfo);
		}
	} else if (e.clicksource === 'rightButton' || e.clicksource === 'rightPane') {
		if (e.annotation && e.annotation.onRightClick) {
			var requestInfo = {
				type : 'annotationrightclick',
				caller : $.window.getWindow(),
				request : {
					action : 'onClick',
					type : 'annotation',
					annotation : {
						name : e.annotation.name,
						onClick : e.annotation.onRightClick
					}
				}
			};
			connection.sendInfo(requestInfo);
		}
	}
});

window.setButtonsAndTitleOnWindow($.mapview, data, 'map');

function createOKButton() {
	var okButton = Alloy.createController('application/toolbar/buttonImage').getView();
	if (OS_IOS) {
		Images.setToolbarIcon(okButton, 'DONE', L('ok_button'));
	} else {
		Images.setToolbarIcon(okButton, 'ACCEPT', L('ok_button'));
	}
	//okButton.title = L('ok_button');
	// if (OS_IOS) {
	// okButton.type = 'TiUIButton';
	// }
	//okButton.type = 'TiUIButton';
	okButton.position = 'top';
	okButton.enabled = false;

	var that = $;
	okButton.addEventListener('click', function(e) {
		if (that.data.onSuccess && addressLookupPin) {
			var successAction = {
				type : 'addresslookupsuccess',
				request : {
					action : 'onSuccess',
					type : 'addresslookup',
					addresslookup : {
						onSuccess : that.data.onSuccess,
						fields : [{
							name : 'ADDRESS',
							value : addressLookupPin.address
						}, {
							name : 'ENGLISHADDRESS',
							value : addressLookupPin.englishaddress
						}, {
							name : 'LOCALITY',
							value : addressLookupPin.locality
						}, {
							name : 'ZIPCODE',
							value : addressLookupPin.zipcode
						}, {
							name : 'CITY',
							value : addressLookupPin.city
						}, {
							name : 'AREA',
							value : addressLookupPin.area
						}, {
							name : 'COUNTRY',
							value : addressLookupPin.country
						}, {
							name : 'COUNTRYCODE',
							value : addressLookupPin.countrycode
						}, {
							type: 'number',
							name : 'LAT',
							value : addressLookupPin.latitude
						}, {
							type: 'number',
							name : 'LNG',
							value : addressLookupPin.longitude
						}],
						address : addressLookupPin.address,
						englishaddress : addressLookupPin.englishaddress,
						locality : addressLookupPin.locality,
						zipcode : addressLookupPin.zipcode,
						city : addressLookupPin.city,
						area : addressLookupPin.area,
						country : addressLookupPin.country,
						countrycode : addressLookupPin.countrycode,
						lat : addressLookupPin.latitude,
						lng : addressLookupPin.longitude
					}
				}
			};
			setTimeout(function(e) {
				that.window.getController().getConnection().sendInfo(successAction);
			}, 250);
		}
	});

	return okButton;
}

function createAddPinButton() {

	var addPinButton = null;
	addPinButton = Alloy.createController('application/toolbar/buttonImage').getView();
	Images.setToolbarIcon(addPinButton, 'ADD', L('add_button'));
	// if (OS_IOS) {
	// addPinButton.systemButton = Ti.UI.iPhone.SystemButton.ADD;
	// } else {
	// //addPinButton = Alloy.createController('application/toolbar/buttonNormal').getView();
	// addPinButton.image = Images.getImage('ADD', 'toolbar');
	// addPinButton.title = L('add_button');
	// }
	//addPinButton.type = 'TiUIButton';
	addPinButton.enabled = false;

	var that = $;
	addPinButton.addEventListener('click', function(e) {
		addPinButton.enabled = false;
		that.removePinButton.enabled = true;
		that.okButton.enabled = true;
		addressLookupPin = Alloy.Globals.Map.createAnnotation({
			latitude : addPinButton.latitude,
			longitude : addPinButton.longitude,
			pincolor : Alloy.Globals.Map.ANNOTATION_GREEN,
			animate : false,
			draggable : true,
			rightButton : OS_IOS ? Ti.UI.iPhone.SystemButton.TRASH : Images.getImage('TRASH', 'map')
		});

		that.mapview.addAnnotation(addressLookupPin);
		getAddress(addressLookupPin, true);
		that.mapview.selectAnnotation(addressLookupPin);
	});

	return addPinButton;
}

function createRemovePinButton() {
	var removePinButton = null;
	removePinButton = Alloy.createController('application/toolbar/buttonImage').getView();
	Images.setToolbarIcon(removePinButton, 'TRASH', L('remove_button'));
	// if (OS_IOS) {
	// removePinButton.systemButton = Ti.UI.iPhone.SystemButton.TRASH;
	// } else {
	//		removePinButton = Alloy.createController('application/toolbar/buttonNormal').getView();
	// removePinButton.image = Images.getImage('TRASH', 'toolbar');
	// removePinButton.title = L('remove_button');
	// }
	//removePinButton.type = 'TiUIButton';
	removePinButton.enabled = false;

	var that = $;
	removePinButton.addEventListener('click', function(e) {
		removePinButton.enabled = false;
		that.addPinButton.enabled = true;
		that.okButton.enabled = false;
		that.mapview.removeAllAnnotations();
		addressLookupPin = null;
	});

	return removePinButton;
}

function currentLocationFound(coords, me) {
	createDraggablePin('current', coords.latitude, coords.longitude, '', Alloy.Globals.Map.ANNOTATION_GREEN, null);
}

function createDraggablePin(name, latitude, longitude, title, color, image) {
	var pin = createPin(name, latitude, longitude, title, color, image);
	if (pin) {
		pin.animated = false;
		pin.draggable = true;
		addPin(pin);
		addressLookupPin = pin;
		getAddress(pin, true);
		$.mapview.selectAnnotation(pin);
		setLocation();
		$.removePinButton.enabled = true;
		$.okButton.enabled = true;
	} else {
		if (addressLookup) {
			$.removePinButton.enabled = false;
			$.addPinButton.enabled = true;
			$.okButton.enabled = false;
		}
	}
}

function getAddress(annotation, selectIt) {
	var xhr = Titanium.Network.createHTTPClient();
	xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + annotation.latitude.toString() + ',' + annotation.longitude.toString() + '&sensor=true&language=da');
	// xhr.open('GET', 'http://where.yahooapis.com/geocode?gflags=R&flags=J&q=' + annotation.latitude.toString() + ',' + annotation.longitude.toString());
	xhr.onload = function() {
		var json = JSON.parse(this.responseText);
		if (!json.results || !json.results[0] || !json.results[0].geometry || !json.results[0].geometry.location) {
			annotation.title = L('unknown_address');
			if (OS_ANDROID && selectIt) {
				$.mapview.selectAnnotation(annotation);
			}
			return;
		}

		annotation.title = json.results[0].formatted_address;

		var addressComponents = json.results[0].address_components;
		var route;
		var streetNumber;
		for (var i = 0; i < addressComponents.length; i++) {
			if (addressComponents[i].types) {
				if (addressComponents[i].types[0] === 'route') {
					route = addressComponents[i].long_name;
				} else if (addressComponents[i].types[0] === 'street_number') {
					streetNumber = addressComponents[i].long_name;
				} else if (addressComponents[i].types[0] === 'locality') {
					annotation.city = addressComponents[i].long_name;
				} else if (addressComponents[i].types[0] === 'administrative_area_level_1') {
					annotation.area = addressComponents[i].long_name;
				} else if (addressComponents[i].types[0] === 'sublocality') {
					annotation.locality = addressComponents[i].long_name;
				} else if (addressComponents[i].types[0] === 'postal_code') {
					annotation.zipcode = addressComponents[i].long_name;
				} else if (addressComponents[i].types[0] === 'country') {
					annotation.country = addressComponents[i].long_name;
					annotation.countrycode = addressComponents[i].short_name;
				}
			}
		}
		var address;
		if (route) {
			address = route;
		}
		if (streetNumber) {
			if (address) {
				address += ' ' + streetNumber;
			} else {
				address = streetNumber;
			}
		}
		if (address) {
			annotation.address = address;
		}

		var xhrEn = Titanium.Network.createHTTPClient();
		xhrEn.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + annotation.latitude.toString() + ',' + annotation.longitude.toString() + '&sensor=true&language=en');

		xhrEn.onload = function() {
			json = JSON.parse(this.responseText);
			if (!json.results || !json.results[0] || !json.results[0].geometry || !json.results[0].geometry.location) {
				if (OS_ANDROID && selectIt) {
					$.mapview.selectAnnotation(annotation);
				}
				return;
			}

			var addressComponents = json.results[0].address_components;
			var route;
			var streetNumber;
			for (var i = 0; i < addressComponents.length; i++) {
				if (addressComponents[i].types) {
					if (addressComponents[i].types[0] === 'route') {
						route = addressComponents[i].long_name;
					} else if (addressComponents[i].types[0] === 'street_number') {
						streetNumber = addressComponents[i].long_name;
					}
				}
			}
			var address;
			if (route) {
				address = route;
			}
			if (streetNumber) {
				if (address) {
					address += ' ' + streetNumber;
				} else {
					address = streetNumber;
				}
			}
			if (address) {
				annotation.englishaddress = address;
			}
			if (OS_ANDROID && selectIt) {
				$.mapview.selectAnnotation(annotation);
			}
		};
		xhrEn.onerror = function(e) {
			if (OS_ANDROID && selectIt) {
				$.mapview.selectAnnotation(annotation);
			}
		};
		xhrEn.send();
	};
	xhr.onerror = function(e) {
		annotation.title = L('unknown_address');
		if (OS_ANDROID && selectIt) {
			$.mapview.selectAnnotation(annotation);
		}
	};
	xhr.send();
}

function setMapType(type) {
	switch(type) {
		case 'standard' :
			$.mapview.mapType = Alloy.Globals.Map.NORMAL_TYPE;
			break;
		case 'satellite' :
			$.mapview.mapType = Alloy.Globals.Map.SATELLITE_TYPE;
			break;
		case 'hybrid' :
			if (OS_ANDROID) {
				$.mapview.mapType = Alloy.Globals.Map.SATELLITE_TYPE;
			} else {
				$.mapview.mapType = Alloy.Globals.Map.HYBRID_TYPE;
			}
			break;
		default:
			$.mapview.mapType = Alloy.Globals.Map.NORMAL_TYPE;
	}
}

function addPins(annotations) {
	removeAllPins();

	for (i in annotations) {
		var pin = createPin(annotations[i].name, annotations[i].lat, annotations[i].lng, annotations[i].title, annotations[i].subtitle, annotations[i].color, annotations[i].image, annotations[i].leftimage, annotations[i].rightimage, annotations[i].onLeftClick, annotations[i].onRightClick);
		if (pin) {
			addPin(pin);
		}
	}
};

function createPin(name, latitude, longitude, title, subtitle, color, pinimage, leftimage, rightimage, onLeftClick, onRightClick) {
	if (longitude == undefined || latitude == undefined) {
		return;
	}
	longitude = parseFloat(longitude);
	latitude = parseFloat(latitude);

	if ($.minLng === undefined || $.minLng > longitude) {
		$.minLng = longitude;
	};
	if ($.maxLng === undefined || $.maxLng < longitude) {
		$.maxLng = longitude;
	};
	if ($.minLat === undefined || $.minLat > latitude) {
		$.minLat = latitude;
	};
	if ($.maxLat === undefined || $.maxLat < latitude) {
		$.maxLat = latitude;
	};

	var leftButton = '';
	var rightButton = '';
	if (leftimage) {
		leftButton = Images.getImage(leftimage, 'map');
	} else if (onLeftClick) {
		if (OS_IOS) {
			leftButton = Ti.UI.iPhone.SystemButton.INFO_LIGHT;
		} else {
			//leftButton = Images.getImage('INFO', 'toolbar');
			leftButton = '/images/pin_left.png';
		}
	}

	if (rightimage) {
		rightButton = Images.getImage(rightimage, 'map');
	} else if (onRightClick) {
		rightButton = Images.getImage('FORWARD', 'toolbar');
		if (OS_IOS) {
			rightButton = Ti.UI.iPhone.SystemButton.CONTACT_ADD;
			//Images.getImage('PIN_FORWARD', 'core');
		} else {
			rightButton = '/images/pin_right.png';
		}
	}
	
	//Ti.API.info("leftButton: " + leftButton + " rightButton: " + rightButton );

	var image = '';
	if (pinimage) {
		image = Images.getImage(pinimage, 'mappin');
	}

	var pincolor = Alloy.Globals.Map.ANNOTATION_RED;
	switch(color) {
		case 'green' :
			pincolor = Alloy.Globals.Map.ANNOTATION_GREEN;
			break;
		case 'red' :
			pincolor = Alloy.Globals.Map.ANNOTATION_RED;
			break;
		case 'purple' :
			pincolor = Alloy.Globals.Map.ANNOTATION_PURPLE;
			break;
		default:
			pincolor = Alloy.Globals.Map.ANNOTATION_RED;
	};

	var pin = Alloy.Globals.Map.createAnnotation({
		latitude : latitude,
		longitude : longitude,
		title : title,
		subtitle : subtitle,
		animate : true,
		//image : image, // Android does not support image and undefined !!!!
		leftButton : leftButton,
		rightButton : rightButton,
		pincolor : pincolor,
		name : name,
		onLeftClick : onLeftClick,
		onRightClick : onRightClick
	});
	if (image && OS_IOS) {
		//if (image) {
		pin.image = image;
	}
	return pin;
}

function addPin(pin) {
	$.mapview.addAnnotation(pin);
}

function removeAllPins() {
	$.mapview.removeAllAnnotations();
}

function setLocation(longitude, latitude, latitudeDelta, longitudeDelta) {
	if (longitude && latitude && latitudeDelta && longitudeDelta) {
		$.mapview.setRegion({
			latitude : Number(longitude),
			longitude : Number(latitude),
			latitudeDelta : Number(latitudeDelta),
			longitudeDelta : Number(longitudeDelta)
		});
		return;
	}

	if ($.minLng) {
		var lng = $.maxLng - (($.maxLng - $.minLng) / 2);
		var lat = $.maxLat - (($.maxLat - $.minLat) / 2);
		var lngDelta = (($.maxLng - $.minLng) + 0.1);
		var latDelta = (($.maxLat - $.minLat) + 0.1);

		$.mapview.setRegion({
			latitude : Number(lat),
			longitude : Number(lng),
			latitudeDelta : Number(latDelta),
			longitudeDelta : Number(lngDelta)
		});
	}

}

// Static Class functions
function decodePolyline(encoded, points) {
	var len = encoded.length;
	var index = 0;
	var array = [];
	var lat = 0;
	var lng = 0;

	while (index < len) {
		var b;
		var shift = 0;
		var result = 0;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lat += dlat;

		shift = 0;
		result = 0;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lng += dlng;

		// Create new Vars for the created lats and lng
		var newLat = lat * 1e-5;
		var newLon = lng * 1e-5;

		// push them into the array at the end (thus adding it to the correct place)
		points.push({
			latitude : newLat,
			longitude : newLon
		});
	}
}
