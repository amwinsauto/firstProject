exports.baseController = "application/controllers/abstractController";

var args = arguments[0] || {};
var application = args.application;

$.isTop = true;
$.type = 'top';
$.windowController = args.windowController;
$.window = args.window;

$.init();
