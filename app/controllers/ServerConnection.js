var args = arguments[0] || {};

var callback = args.callback || null;

var Log = require('tools/Log');
var Properties = require('tools/Properties');

var jsonDebug = !ENV_PRODUCTION;
var debug = false;
var timeOut = Properties.getTimeOut();
var busyDelay = OS_ANDROID ? 0 : 500;

var deviceHeight = Ti.Platform.displayCaps.platformHeight;
var deviceWidth = Ti.Platform.displayCaps.platformWidth;
var deviceId = Properties.getUDID();
var locale = Ti.Locale.getCurrentLocale();

var defaultTitle = L('busy_loading_label');
var tempTitle = null;

var errorPending = false;
var geoWarningShown = false;

var request = null;
var appSesId = null;
var applicationName = null;
var requestInfo = null;
var geoCalling = false;
var cache = null;

var visible = false;
var started = false;
var progressBarEnabled = false;

// Timer
var busyCall = null;

var opening = false;
var closed = false;

var parentView = null;
var busyParent = null;

exports.setAppSesId = function(newId) {
	appSesId = newId;
};
exports.getAppSesId = function() {
	return appSesId;
};
exports.setApplicationName = function(newApplicationName) {
	applicationName = newApplicationName;
};
exports.getApplicationName = function() {
	return applicationName;
};

exports.setTimeOut = function(newTimeOut) {
	timeOut = newTimeOut;
};
exports.getTimeOut = function() {
	return timeOut;
};

exports.setCallback = function(newCallback) {
	callback = newCallback;
};

exports.getCallback = function() {
	return callback;
};

exports.setBusyParent = function(newBusyParent) {
	busyParent = newBusyParent;
};

exports.getRequest = function() {
	return request;
};

exports.getRequestInfo = function() {
	var ri = requestInfo;
	requestInfo = null;
	return ri;
};

// Send JSON to server and handle the repsponse
exports.sendInfo = function(newRequestInfo, noActivityIndicator, message) {
	requestInfo = newRequestInfo;

	if (!requestInfo.geolocation) {
		geoCalling = false;
		return $.send(requestInfo.request, noActivityIndicator, message);
	} else {
		$.getGeoLocation(null, null, noActivityIndicator, message);
	}
	return true;
};

exports.getGeoLocation = function(resultFunction, source, noActivityIndicator, message) {
	if (geoWarningShown) {
		if (!Ti.Geolocation.locationServicesEnabled || Ti.Geolocation.locationServicesAuthorization != Ti.Geolocation.AUTHORIZATION_AUTHORIZED) {
			geoCalling = false;
			var coords = {
				success : false,
				code : Ti.Geolocation.locationServicesEnabled ? -1 : -2,
				error : Ti.Geolocation.locationServicesEnabled ? 'disabled' : 'denied'
			};
			Log.debug('coords = ' + JSON.stringify(coords));
			var newRequestInfo = requestInfo;
			newRequestInfo.request[newRequestInfo.request.type].coords = coords;
			if (resultFunction) {
				resultFunction(coords, source);
				return;
			} else {
				return $.send(newRequestInfo.request, noActivityIndicator, message);
			}
		}
	}

	if (!Ti.Geolocation.locationServicesEnabled || Ti.Geolocation.locationServicesAuthorization != Ti.Geolocation.AUTHORIZATION_AUTHORIZED) {
		geoWarningShown = true;
	}
	Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	//Deprecated  Ti.Geolocation.purpose = L('geolocation_purpose');
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	Ti.Geolocation.distanceFilter = 1;
	geoCalling = true;
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (geoCalling === false) {
			Log.debug('Old geolocation called but canceled....');
			return;
		}
		if (e.success && e.coords && (resultFunction || requestInfo.request[requestInfo.request.type])) {
			// Success getting geolocation
			geoWarningShown = false;
			if (resultFunction) {
				resultFunction(e.coords, source);
				return;
			} else {
				requestInfo.request[requestInfo.request.type].coords = e.coords;
				requestInfo.request[requestInfo.request.type].coords.success = true;
			}
		} else {
			// Error getting geolocation
			var coords = {
				success : false,
				code : e.code,
				error : e.error
			};
			Log.debug('coords = ' + JSON.stringify(coords));
			// if (logger) {
			// logger.logGeoError(JSON.stringify(e));
			// }
			if (Alloy.Globals.logger) {
				Alloy.Globals.logger.logGeoError(JSON.stringify(e));
			}
			// alert('Error using GPS provider. ' + translateErrorCode(e.code) + ': ' + JSON.stringify(e.error));
			//alert(L('geolocation_not_determined') + '\n' + L('geolocation_reactivate_wifi'));
			/* Programmer should send error message
			 Ti.UI.createAlertDialog({
			 message : L('geolocation_not_determined') + '\n' + L('geolocation_reactivate_wifi')
			 }).show();
			 */
			if (resultFunction) {
				resultFunction(coords, source);
				return;
			} else {
				requestInfo.request[requestInfo.request.type].coords = coords;
			}
			//return;
		}
		geoCalling = false;
		$.send(requestInfo.request, noActivityIndicator, message);
	});
};

// Send JSON to server and handle the repsponse
exports.send = function(newRequest, noActivityIndicator, message) {

	request = newRequest;
	var connection = Ti.Network.createHTTPClient({
		validatesSecureCertificate : false
	});

	if (Alloy.Globals.onTimerTimer) {
		// Clear onTimer requests
		clearTimeout(Alloy.Globals.onTimerTimer);
		Alloy.Globals.onTimerTimer = null;
	}

	var showActivityIndicator = true;
	if (noActivityIndicator) {
		showActivityIndicator = false;
	}

	if (OS_IOS) {
		if (!cache) {
			var Cache = require('Cache');
			cache = new Cache();
		}
		var cacheKey = JSON.stringify(request);
		var cacheResponse = null;
		var cacheRecord = cache.getJson(cacheKey);
		if (cacheRecord) {
			request.cache = cacheRecord.changed;
			cacheResponse = cacheRecord.value;
		}
	}

	// if (guid) {
	// request.guid = guid;
	// }
	if (Alloy.Globals.guid) {
		request.guid = Alloy.Globals.guid;
	}

	request.osname = Ti.Platform.osname;
	if (Alloy.isTablet) {
		request.devicetype = 'tablet';
	} else {
		request.devicetype = 'handheld';
	}
	request.deviceid = deviceId;
	if (appSesId) {
		request.appsesid = appSesId;
	}
	request.locale = locale;

	// Support for Query restart
	if (!request.application && applicationName) {
		request.application = applicationName;
	}

	// Grab the callbackFunction from this, before onload...
	var busyCall = null;

	// var errorMessage = 'Online before: ' + Ti.Network.getOnline();
	// errorMessage += '\nType before: ' + Ti.Network.getNetworkTypeName();
	connection.onload = function(e) {
		var responseStatus = null;
		var responseText = null;
		var response = null;
		var responseSuccess = false;
		try {
			var con = e.source;
			if (!con) {
				Log.error('e.source not valid!!!');
				stopBusyIndicator();
				return;
			}
			responseStatus = con.status;
			responseText = con.responseText;
			if (responseText) {
				Log.debug('Response: (' + responseStatus + ") " + responseText, jsonDebug);
				if (responseStatus == 200) {
					responseSuccess = true;
					response = JSON.parse(responseText);
					if (Alloy.Globals.logger) {
						Alloy.Globals.logger.logResponse(JSON.stringify(response));
					}
				}
			} else {
				Log.debug('Response: no responseText returned', jsonDebug);
			}
		} catch(err) {
			stopBusyIndicator();
			Ti.API.error(JSON.stringify(err));
			return;
		}

		// Error
		if (!responseSuccess) {
			if (Properties.isServersetupEnabled()) {
				callback.handleError(L('http_error').replace('%1', responseStatus), L('check_server_settings'));
			} else {
				callback.handleError(L('http_error').replace('%1', responseStatus), L('check_internet_connection'));
			}
			// Stop the busy window
			stopBusyIndicator();
			Log.error('HTTP Error Response Status Code = ' + responseStatus);
			Log.error("Error =>" + responseText);
			return;
		}

		// Success

		if (OS_IOS) {
			if (cacheResponse) {
				Log.debug('Response cashed!!!', jsonDebug);
				if (response.usecached) {
					Log.debug('Using cashed response: ' + cacheResponse, jsonDebug);
					response = JSON.parse(cacheResponse);
				} else {
					Log.debug('Deleting cache', jsonDebug);
					cache.deleteJson(cacheKey);
					if (response.cache) {
						Log.debug('Saving response to cache', jsonDebug);
						cache.saveJson(cacheKey, responseText, response.cache);
					}
				}
			} else {
				if (response.cache) {
					Log.debug('Saving response to cache', jsonDebug);
					cache.saveJson(cacheKey, responseText, response.cache);
				}
			}
		}

		errorPending = false;

		// guid controled by server
		if (response.guid) {
			Alloy.Globals.guid = response.guid;
		}

		// Call the callback Handler
		callback.handleResponse(response);
		// Stop the busy window
		stopBusyIndicator();
	};

	connection.onerror = function(e) {
		// Stop the busy window
		stopBusyIndicator();
		errorPending = true;

		if (Alloy.Globals.logger) {
			Alloy.Globals.logger.logResponseError(JSON.stringify(e));
		}

		if (callback.handleError) {
			if (Properties.isServersetupEnabled()) {
				callback.handleError(L('error_contacting_server'), L('check_server_settings'));
			} else {
				callback.handleError(L('error_contacting_server'), L('check_internet_connection'));
			}
		} else {
			if (Properties.isServersetupEnabled()) {
				Ti.UI.createAlertDialog({
					title : L('error_contacting_server'),
					message : L('check_server_settings')
				}).show();
			} else {
				Ti.UI.createAlertDialog({
					title : L('error_contacting_server'),
					message : L('check_internet_connection')
				}).show();
			}
		}
	};

	if (showActivityIndicator) {
		if (busyParent) {
			startBusyIndicator(message, busyParent);
		} else {
			startBusyIndicator(message);
		}
	}

	var requestString = JSON.stringify(request);
	Log.debug('Request: ' + requestString, jsonDebug);

	connection.setTimeout(timeOut);

	connection.open('POST', getUri());
	connection.setRequestHeader('Content-Type', 'application/json');
	if (Alloy.Globals.credentials && Alloy.Globals.credentials.basicAuth) {
		connection.setRequestHeader('Authorization', Alloy.Globals.credentials.basicAuth);
	}

	if (Alloy.Globals.logger) {
		Alloy.Globals.logger.logRequest(requestString);
	}

	connection.send(requestString);
	return true;

};

exports.sendMedia = function(media, successFunction, metadata) {
	var xhr = Titanium.Network.createHTTPClient();
	xhr.setTimeout(600000);
	if (Alloy.Globals.credentials && Alloy.Globals.credentials.basicAuth) {
		xhr.setRequestHeader('Authorization', Alloy.Globals.credentials.basicAuth);
	}

	setTitle(L('busy_sending_label'));
	enableProgressBar();

	xhr.onload = function(e) {
		var response;
		try {
			response = JSON.parse(e.source.responseText);
		} catch(err) {
			response = {
				filename : e.source.responseText
			};
		}
		successFunction(response);
		stopBusyIndicator();
	};

	xhr.onerror = function(e) {
		busyWindow.stop();
		Log.error("Error: status code:" + e.source.status);

		if (Alloy.Globals.logger) {
			Alloy.Globals.logger.logMediaError(JSON.stringify(e));
		}

		Ti.UI.createAlertDialog({
			title : L('error_contacting_server'),
			message : L('check_server_settings')
		}).show();
	};

	xhr.onsendstream = function(e) {
		if (Math.round(e.progress * 100) <= 100) {
			updateProgressBar(Math.round(e.progress * 100));
		}
	};
	startBusyIndicator();

	xhr.open('POST', getUri());
	if (metadata) {
		var metadataString = JSON.stringify(metadata);
		xhr.send({
			metadata : metadataString,
			media : media
		});
	} else {
		xhr.send({
			media : media
		});
	}
};

exports.sendBeacon = function(data) {
	var sender = Titanium.Network.createHTTPClient();

	sender.setTimeout(600000);
	sender.open('POST', getUri());
	sender.setRequestHeader('Content-Type', 'application/json');
	if (Alloy.Globals.credentials && Alloy.Globals.credentials.basicAuth) {
		sender.setRequestHeader('Authorization', Alloy.Globals.credentials.basicAuth);
	}
	sender.send(JSON.stringify(data));
};

function getUri() {
	var uri = null;
	if (Properties.isHttps()) {
		uri = 'https://';
	} else {
		uri = 'http://';
	}
	uri += Properties.getServerName();
	uri += '/' + Properties.getWebApplication();
	return uri;
}

exports.showBusyWindow = function() {
	startBusyIndicator();
};

exports.hideBusyWindow = function() {
	stopBusyIndicator();
};

function translateErrorCode(code) {
	if (code == null) {
		return null;
	}
	switch (code) {
	case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
		return "Location unknown";
	case Ti.Geolocation.ERROR_DENIED:
		return "Access denied";
	case Ti.Geolocation.ERROR_NETWORK:
		return "Network error";
	case Ti.Geolocation.ERROR_HEADING_FAILURE:
		return "Failure to detect heading";
	case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
		return "Region monitoring access denied";
	case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
		return "Region monitoring access failure";
	case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
		return "Region monitoring setup delayed";
	}
}

function startBusyIndicator(message, parent) {
	parentView = parent || null;
	if (!visible) {
		visible = true;
		if (OS_IOS) {
			if (parentView) {
				parentView.add($.busyView);
			} else {
				opening = true;
				$.busyWindow.open({
					animated : false
				});
			}
		}
		busyCall = setTimeout(function(e) {
			Log.debug('Start busy', debug);
			if (visible) {
				var busyMessage = defaultTitle;
				if (tempTitle) {
					busyMessage = tempTitle;
				}
				if (message) {
					busyMessage = message.toString();
				}

				if (OS_IOS) {
					$.busyLabel.text = busyMessage;
					$.busyImageView.visible = true;
				} else {
					$.busyActivityIndicator.message = busyMessage;
				}

				started = true;
				$.busyActivityIndicator.show();
				if (OS_IOS) {
					if (progressBarEnabled) {
						$.busyProgressBar.show();
					}
				}
			}
		}, busyDelay);
	}
}

function stopBusyIndicator() {
	if (visible) {
		Log.debug('Stop busy', debug);
		tempTitle = null;

		if (busyCall) {
			clearTimeout(busyCall);
		}

		if (OS_IOS) {
			if ($.busyImageView.visible) {
				$.busyImageView.visible = false;
				$.busyActivityIndicator.hide();
				if (progressBarEnabled) {
					$.busyProgressBar.hide();
					progressBarEnabled = false;
				}
			}
			if (parentView) {
				parentView.remove($.busyView);
				parentView = null;
			} else {
				if (opening) {
					closed = true;
					return;
				}
				$.busyWindow.close({
					animated : false
				});
			}
		} else {
			if (started) {
				started = false;
				$.busyActivityIndicator.hide();
			}

		}
		visible = false;
	}
};

function onOpen(e) {
	opening = false;
	if (closed) {
		stopBusyIndicator();
	}
}

function setTitle(title) {
	//	defaultTitle = title;
	tempTitle = title;
};

function enableProgressBar() {
	progressBarEnabled = true;
};

function updateProgressBar(value) {
	if (OS_IOS) {
		$.busyProgressBar.value = value;
	}
};

