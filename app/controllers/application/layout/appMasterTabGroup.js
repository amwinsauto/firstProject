function onSupportClick(e) {
	var support = Alloy.createController('support', {
		//connection : connection
	});
	support.getView().open();

}

function onAboutClick(e) {
	var about = Alloy.createController('about', {
		//connection : connection
	});
	about.getView().open();

}
