var args = arguments[0] || {};
var form = args.form;
var data = args.data;

var fields = data.fields;

var sec = null;
if (data.layout === 'transparent' || data.layout === 'none') {
	sec = Alloy.createController('application/form/sectionTransparent');
	$.section = sec.getView();
} else {
	sec = Alloy.createController('application/form/sectionNormal');
	$.section = sec.getView();
}

if (form.isNarrow()) {
	$.section.left = 0;
	$.section.right = 0;
	$.section.borderWidth = 0;
	if (OS_IOS) {
		$.bottomSeparator = sec.bottomSeparator;
		if (Alloy.Globals.isHighDensity) {
		} else {
			if (sec.topSeparator) {
				sec.topSeparator.height = 1;
			}
		}
	}
} else {
	if (sec.topSeparator) {
		sec.topSeparator.backgroundColor = sec.topSeparator.egDetailBackgroundColor;
		if (OS_IOS) {
			if (Alloy.Globals.isHighDensity) {
				sec.topSeparator.height = 1;
			} else {
				sec.topSeparator.height = 2;
			}
		}
	}
}

exports.getView = function() {
	return $.section;
};

