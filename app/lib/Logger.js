var debug = true;
var Log = require('tools/Log');
var Properties = require('tools/Properties');

var logText = "// Json log from Crosspad \n";
var file = "";
var logEnabled = false;
function Logger(newfile) {
	logEnabled = Properties.isLogEnabled();
	if (logEnabled) {
		file = newfile;
		Log.debug('Log created: ' + file, debug);
	}
}

Logger.prototype.logRequest = function(request) {
	if (logEnabled) {
		logText += "Request: \n" + request + "\n";
	}
};

Logger.prototype.logResponse = function(request) {
	if (logEnabled) {
		logText += "Response: \n" + request + "\n";
	}
};

Logger.prototype.logResponseError = function(request) {
	if (logEnabled) {
		logText += "response error: \n" + request + "\n";
	}
};

Logger.prototype.logGeoError = function(request) {
	if (logEnabled) {
		logText += "Geolocation error: \n" + request + "\n";
	}
};

Logger.prototype.logMediaError = function(request) {
	if (logEnabled) {
		logText += "sendMedia error: \n" + request + "\n";
	}
};

Logger.prototype.write = function() {
	if (logEnabled) {
		var logDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'json_logs');
		if (!logDir.exists()) {
			logDir.createDirectory();
		}
		var logFile = Ti.Filesystem.getFile(logDir.resolve(), file);
		if (logFile.write(logText) === false) {
			// handle write error
		}
		Log.debug('Log written: ' + file, debug);
	}
};

Logger.prototype.sendEmail = function() {
	var logDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'json_logs');
	if (!logDir.exists()) {
		alert("Logfile: " + file + " not found");
		return;
	}
	var logFile = Ti.Filesystem.getFile(logDir.resolve(), "init.log");
	var logFile2 = Ti.Filesystem.getFile(logDir.resolve(), "application.log");
	// var blob = logFile.read();
	// var readText = blob.text;
	var email = Ti.UI.createEmailDialog({
		subject : 'Crosspad Logfiles',
		messageBody : 'Attached file contains the Json Log'
	});
	if (logFile.exists()) {
		email.addAttachment(logFile);
	}
	if (logFile2.exists()) {
		email.addAttachment(logFile2);
	}
	email.open();
};

module.exports = Logger;
