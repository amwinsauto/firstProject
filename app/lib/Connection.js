var jsonDebug = !ENV_PRODUCTION;
var Log = require('tools/Log');
var Properties = require('tools/Properties');
var Alloy = require("alloy");
var cache = null;

//var networkChangedError = false;

var deviceHeight = Ti.Platform.displayCaps.platformHeight;
var deviceWidth = Ti.Platform.displayCaps.platformWidth;
var deviceId = Properties.getUDID();
var locale = Ti.Locale.getCurrentLocale();


//var logger = null;

function Application(callback) {

// this.jsonLog = null;
	this.timeOut = Properties.getTimeOut();
	this.busyWindow = Alloy.createController('busy', {});
	this.errorPending = false;
	this.callback = null;
	this.request = null;
	this.appSesId = null;
	this.requestInfo = null;
	this.geoWarningShown = false;
	if (callback) {
		this.callback = callback;
	}
}

Application.prototype.setAppSesId = function(newId) {
	this.appSesId = newId;
};
Application.prototype.getAppSesId = function() {
	return this.appSesId;
};

Application.prototype.setApplicationName = function(newApplicationName) {
	this.applicationName = newApplicationName;
};
Application.prototype.getApplicationName = function() {
	return this.applicationName;
};


Application.prototype.setTimeOut = function(timeOut) {
	this.timeOut = timeOut;
};
Application.prototype.getTimeOut = function() {
	return this.timeOut;
};

Application.prototype.setCallback = function(callback) {
	this.callback = callback;
};

Application.prototype.getCallback = function() {
	return this.callback;
};

Application.prototype.setBusyParent = function(busyParent) {
	this.busyParent = busyParent;
};

// Application.prototype.setLogger = function(newLogger) {
// logger = newLogger;
// };

// Application.prototype.getLogger = function() {
// return logger;
// };

// Application.prototype.setJsonLog = function(json) {
// this.jsonLog = json;
// };

// Application.prototype.getJsonLog = function() {
// return this.jsonLog;
// };

// Application.prototype.setGuid = function(guid) {
// this.guid = guid;
// };

// Application.prototype.getGuid = function() {
// return this.guid;
// };

// Application.prototype.setUserPassword = function(user, password) {
// this.user = user;
// this.password = password;
// this.basicAuth = 'Basic ' + Ti.Utils.base64encode(user + ':' + password).toString();
// };

Application.prototype.getRequest = function() {
	return this.request;
};

Application.prototype.getRequestInfo = function() {
	var ri = this.requestInfo;
	this.requestInfo = null;
	return ri;
};

// Send JSON to server and handle the repsponse
Application.prototype.sendInfo = function(requestInfo, noActivityIndicator, message) {
	this.requestInfo = requestInfo;

	if (!requestInfo.geolocation) {
		this.geoCalling = false;
		return this.send(requestInfo.request, noActivityIndicator, message);
	} else {
		this.getGeoLocation(null, null, noActivityIndicator, message);
	}
	return true;
};

Application.prototype.getGeoLocation = function(resultFunction, source, noActivityIndicator, message) {
	if (this.geoWarningShown) {
		if (!Ti.Geolocation.locationServicesEnabled || Ti.Geolocation.locationServicesAuthorization != Ti.Geolocation.AUTHORIZATION_AUTHORIZED) {
			this.geoCalling = false;
			var coords = {
				success : false,
				code : Ti.Geolocation.locationServicesEnabled ? -1 : -2,
				error : Ti.Geolocation.locationServicesEnabled ? 'disabled' : 'denied'
			};
			Log.debug('coords = ' + JSON.stringify(coords));
			var requestInfo = this.requestInfo;
			requestInfo.request[requestInfo.request.type].coords = coords;
			if (resultFunction) {
				resultFunction(coords, source);
				return;
			} else {
				return this.send(requestInfo.request, noActivityIndicator, message);
			}
		}
	}

	if (!Ti.Geolocation.locationServicesEnabled || Ti.Geolocation.locationServicesAuthorization != Ti.Geolocation.AUTHORIZATION_AUTHORIZED) {
		this.geoWarningShown = true;
	}
	Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	//Deprecated  Ti.Geolocation.purpose = L('geolocation_purpose');
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	Ti.Geolocation.distanceFilter = 1;
	this.geoCalling = true;
	var that = this;
	var requestInfo = this.requestInfo;
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (that.geoCalling === false) {
			Log.debug('Old geolocation called but canceled....');
			return;
		}
		if (e.success && e.coords && (resultFunction || requestInfo.request[requestInfo.request.type])) {
			// Success getting geolocation
			that.geoWarningShown = false;
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
		that.geoCalling = false;
		that.send(requestInfo.request, noActivityIndicator, message);
	});
};

// Send JSON to server and handle the repsponse
Application.prototype.send = function(request, noActivityIndicator, message) {

	this.connection = Ti.Network.createHTTPClient({
		validatesSecureCertificate : false
	});

	if (Alloy.Globals.onTimerTimer) {
		// Clear onTimer requests
		clearTimeout(Alloy.Globals.onTimerTimer);
		Alloy.Globals.onTimerTimer = null;
	}

	this.request = request;
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

	// if (this.guid) {
	// request.guid = this.guid;
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
	if (this.appSesId) {
		request.appsesid = this.appSesId;
	}
	request.locale = locale;

	// Support for Query restart
	if (!request.application && this.applicationName) {
		request.application = this.applicationName;
	}

	if (!this.errorPending && this.connection.readyState === this.connection.LOADING) {
		Log.error('Connection is busy!!!... Aborting call to Application.send(): readyState=' + this.connection.readyState);
		return false;
	}

	// Grab the callbackFunction from this, before onload...
	var callback = this.callback;
	var busyWindow = this.busyWindow;
	var busyCall = null;

	var that = this;

	// var errorMessage = 'Online before: ' + Ti.Network.getOnline();
	// errorMessage += '\nType before: ' + Ti.Network.getNetworkTypeName();
	this.connection.onload = function(e) {

		if (!e.source) {
			Log.error('e.source not valid');
			// Stop the busy window
			busyWindow.stop();
			return;
		}

		if (e.source.status === 200) {

			if (!e.source.responseText) {
				// No Response json
				// Stop the busy window
				busyWindow.stop();
				return;
			}

			Log.debug('Response: ' + e.source.responseText, jsonDebug);

			var response = null;
			try {
				response = JSON.parse(e.source.responseText);

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
								cache.saveJson(cacheKey, e.source.responseText, response.cache);
							}
						}
					} else {
						if (response.cache) {
							Log.debug('Saving response to cache', jsonDebug);
							cache.saveJson(cacheKey, e.source.responseText, response.cache);
						}
					}
				}
				// if (logger) {
					// logger.logResponse(JSON.stringify(response));
				// }
				if (Alloy.Globals.logger) {
					Alloy.Globals.logger.logResponse(JSON.stringify(response));
				}
			} catch(err) {
				Log.error('Invalid response:\n' + e.source.responseText);

				// if (logger) {
					// logger.logResponseError(JSON.stringify(err));
				// }
				if (Alloy.Globals.logger) {
					Alloy.Globals.logger.logResponseError(JSON.stringify(err));
				}

				if (that.request && that.request.action === 'init') {
					var contentType = e.source.getResponseHeader('Content-Type');
					if (!contentType || contentType.length < 'application/json'.length || contentType.indexOf('application/json') < 0) {
						that.callback.handleError(L('http_error').replace('%1', 'Wrong content type'), L('server_not_valid'));
						busyWindow.stop();
						return;
					}
				}
			}
			if (!response) {
				Log.error('Response not valid');
				if (Alloy.Globals.logger) {
					Alloy.Globals.logger.logResponseError(JSON.stringify(e));
				}
				// Stop the busy window
				busyWindow.stop();
				return;
			}
			that.errorPending = false;

			// guid controled by server
			if (response.guid) {
				Alloy.Globals.guid = response.guid;
			}

			// Call the callback Handler
			callback.handleResponse(response);
			// Stop the busy window
			busyWindow.stop();
		} else {
			if (Alloy.Globals.logger) {
				Alloy.Globals.logger.logResponseError(JSON.stringify(e));
			}

			if (Properties.isServersetupEnabled()) {
				that.callback.handleError(L('http_error').replace('%1', e.source.status), L('check_server_settings'));
			} else {
				that.callback.handleError(L('http_error').replace('%1', e.source.status), L('check_internet_connection'));
			}
			// Stop the busy window
			busyWindow.stop();
			Log.error('HTTP Error Response Status Code = ' + e.source.status);
			Log.error("Error =>" + e.source.responseText);

		}
	};

	this.connection.onerror = function(e) {
		// Stop the busy window
		busyWindow.stop();
		that.errorPending = true;

		if (Alloy.Globals.logger) {
			Alloy.Globals.logger.logResponseError(JSON.stringify(e));
		}

		if (that.callback.handleError) {
			if (Properties.isServersetupEnabled()) {
				that.callback.handleError(L('error_contacting_server'), L('check_server_settings'));
			} else {
				that.callback.handleError(L('error_contacting_server'), L('check_internet_connection'));
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
		if (this.busyParent) {
			busyWindow.start(message, this.busyParent);
		} else {
			busyWindow.start(message);
		}
	}

	var requestString = JSON.stringify(request);
	Log.debug('Request: ' + requestString, jsonDebug);

	this.connection.setTimeout(this.timeOut);

	this.connection.open('POST', getUri());
	this.connection.setRequestHeader('Content-Type', 'application/json');
	if (Alloy.Globals.credentials && Alloy.Globals.credentials.basicAuth) {
		this.connection.setRequestHeader('Authorization', Alloy.Globals.credentials.basicAuth);
	}

	if (Alloy.Globals.logger) {
		Alloy.Globals.logger.logRequest(requestString);
	}

	this.connection.send(requestString);
	return true;

};

Application.prototype.sendMedia = function(media, successFunction, metadata) {
	var xhr = Titanium.Network.createHTTPClient();
	xhr.setTimeout(600000);
	if (Alloy.Globals.credentials && Alloy.Globals.credentials.basicAuth) {
		xhr.setRequestHeader('Authorization', Alloy.Globals.credentials.basicAuth);
	}

	var busyWindow = this.busyWindow;
	busyWindow.setTitle(L('busy_sending_label'));
	busyWindow.enableProgressBar();

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
		busyWindow.stop();
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
			busyWindow.updateProgressBar(Math.round(e.progress * 100));
		}
	};

	busyWindow.start();

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

Application.prototype.sendBeacon = function(data) {
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

Application.prototype.showBusyWindow = function() {
	this.busyWindow.start();
};

Application.prototype.hideBusyWindow = function() {
	this.busyWindow.stop();
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

module.exports = Application;
