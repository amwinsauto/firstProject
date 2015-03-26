exports.debug = function(text, log) {
	if (log === undefined || log) {
		Ti.API.debug(text);
	}
};

exports.error = function(text) {
	Ti.API.error(text);
};

exports.info = function(text, log) {
	if (log === undefined || log) {
		Ti.API.info(text);
	}
};
