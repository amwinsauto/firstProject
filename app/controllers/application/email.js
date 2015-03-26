var args = arguments[0] || {};
var application = args.application;
var data = args.data;

//var connection = application.getConnection();

var subject = '';
if (data.subject) {
	subject = data.subject.toString();
}
var body = '';
if (data.body) {
	body = data.body.toString();
}
//data.jsonlogvalue = true;
if (data.jsonlogvalue) {
//	if (application.getConnection().getJsonLog()) {
	if (Alloy.Globals.jsonLog) {
		var logDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'json_logs');
		if (!logDir.exists()) {
			logDir.createDirectory();
		}
		var logFile = Ti.Filesystem.getFile(logDir.resolve(), "lastJson.log");
//		if (logFile.write(JSON.stringify(application.getConnection().getJsonLog())) === false) {
		if (logFile.write(JSON.stringify(Alloy.Globals.jsonLog)) === false) {
			// handle write error
		} else {
			$.email.addAttachment(logFile);
		}
		//body = JSON.stringify(application.getConnection().getJsonLog(), null, 2);
	}
}

var to = [];
if (data.to && data.to.length > 0) {
	to = data.to;
}
var cc = [];
if (data.cc && data.cc.length > 0) {
	cc = data.cc;
}
var bcc = [];
if (data.bcc && data.bcc.length > 0) {
	bcc = data.bcc;
}

if (subject.length > 0) {
	$.email.subject = subject;
}
if (to.length > 0) {
	$.email.toRecipients = to;
}
if (cc.length > 0) {
	$.email.ccRecipients = cc;
}
if (bcc.length > 0) {
	$.email.bccRecipients = bcc;
}

if (body.length > 0) {
	$.email.messageBody = body;
	//emailDialog.setHtml(true); // iOS only
	//this.emailDialog.setBarColor('black');
}

// attach a blob
//emailDialog.addAttachment(event.media);

// attach a file
//var f = Ti.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, 'cricket.wav');
//emailDialog.addAttachment(f);

function onEmailComplete(e) {
	if (e.success) {
		Ti.API.debug('Mail sent');
	} else {
		Ti.API.debug('Mail not sent');
	}
}

exports.open = function() {
	if (!$.email.isSupported()) {
		Ti.UI.createAlertDialog({
			title : 'Error',
			message : L('mail_not_available')
		}).show();
		return;
	}

	$.email.open();
};
