var shownOptionDialog = null;
var shownPopover = null;

exports.setShownPopover = function(popover) {
	shownPopover = popover;
};

exports.hideShownPopover = function() {
	if (shownPopover) {
		shownPopover.hide();
		shownPopover = null;
		return true;
	}
	return false;
};

exports.hideShownOptionDialog = function() {
	if (shownOptionDialog) {
		shownOptionDialog.hide();
		shownOptionDialog = null;
		return true;
	}
	return false;
};

exports.setShownOptionDialog = function(optionDialog) {
	shownOptionDialog = optionDialog;
}; 