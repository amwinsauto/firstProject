exports.baseController = "application/controllers/abstractController";

var args = arguments[0] || {};
var application = args.application;

$.isDetail = true;
$.type = 'detail';
$.windowController = args.windowController;
$.window = args.window;

$.init();

