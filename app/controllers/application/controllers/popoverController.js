exports.baseController = "application/controllers/abstractController";

var args = arguments[0] || {};
var application = args.application;

$.isPopup = true;
$.isPopover = true;
$.type = 'popover';

$.init();

$.popover.contentView = $.windowController;

// For compatibility reasons
$.popupWindow = $.popover;

function onPopoverHide(e) {
	$.closePopup(true);
}
