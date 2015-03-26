var args = arguments[0] || {};
var footer = args.footer;
var footerTitle = args.footerTitle;
var onTitleClick = args.onFooterTitleClick;
var name = args.name;
var caller = args.caller;
var geolocation = args.geolocation;

init();

function init() {
	if (footer) {
		$.footer.visible = true;
		$.footer.text = footer;
	} else {
		$.footer.visible = false;
		$.footer.height = 0;
	}
	if (footerTitle) {
		$.footerTitle.visible = true;
		$.footerTitle.text = footerTitle;

		if (onTitleClick) {
			$.footerTitle.onClick = {
				type : 'footertitleclick',
				caller : caller,
				geolocation : geolocation,
				request : {
					action : 'onFooterTitleClick',
					type : 'listitem',
					listitem : {
						name : name,
						onFooterTitleClick : onTitleClick
					}
				}
			};
		}
	} else {
		$.footerTitle.visible = false;
		$.footerTitle.height = 0;
	}
}

exports.updateFooter = function(footer, footerTitle) {
	if (footer) {
		$.footer.visible = true;
		$.footer.text = footer;
	} else {
		$.footer.visible = false;
	}
	if (footerTitle) {
		$.footerTitle.visible = true;
		$.footerTitle.text = footerTitle;
	} else {
		$.footerTitle.visible = false;
	}
};
