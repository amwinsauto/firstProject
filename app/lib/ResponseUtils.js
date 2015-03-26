exports.getName = function(response) {
	var type = response.type || 'none';
	var typeObject = response[type] || {};
	return response.name || typeObject.name || 'no_name';

};
exports.getType = function(response) {
	var type = response.type || 'none';
	if (type === 'navigatorapplication') {
		return 'application';
	}
	return type;
};
exports.getObject = function(response) {
	var type = response.type || 'none';
	return response[type] || {};
};
exports.getAction = function(response) {
	var type = response.type || 'none';
	var typeObject = response[type] || {};
	return response.action || typeObject.action || 'none';
};
exports.getLocation = function(response) {
	var type = response.type || 'none';
	var typeObject = response[type] || {};
	return response.location || typeObject.location || 'master';
};

exports.cleanup = function(response) {
	var type = response.type || 'none';
	var typeObject = response[type] || {};

	var action = response.action || typeObject.action || 'none';
	var location = response.location || typeObject.location || 'master';
	var name = response.name || typeObject.name || 'no_name';

	if (type === 'navigatorapplication') {
		type = 'application';
	}
	// Make sure json object contains the bare minimum:
	// {
	// ..action : 'none',
	// ..location : 'master',
	// ..name : 'no_name',
	// ..type : 'none',
	// ..none : {
	// ....name : 'no_nane'
	// ..}
	// }

	if (!response.action) {
		response.action = action;
	}
	if (!response.location) {
		response.location = location;
	}
	if (!response.name) {
		response.name = name;
	}
	if (!response.type) {
		response.type = type;
	}
	if (!response[type]) {
		response[type] = typeObject;
	}
	if (!typeObject.name) {
		typeObject.name = name;
	}

};
