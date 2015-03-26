exports.baseController = "application/controllers/abstractController";

var args = arguments[0] || {};
var application = args.application;

$.isMaster = true;
$.type = 'master';
$.windowController = args.windowController;
$.window = args.window;

$.init();

