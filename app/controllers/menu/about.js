var Images = require('Images');

$.versionLabel.text = String.format(L('version'), Ti.App.version);
$.copyrightLabel.text = String.format(L('about_copyright'), new Date().getFullYear());

if (OS_IOS && Alloy.isTablet) {
	var Properties = require('tools/Properties');
	$.supportWebView.url = Properties.getSupportUrl();
}

function onEmailClick(e) {
	var email = Ti.UI.createEmailDialog({
		subject : 'Crosspad info',
		messageBody : JSON.stringify(getInfo(), null, 2)
	});
	email.open();

}

function onSupportClick(e) {
	var support = Alloy.createController('menu/support', {
	});
	support.getView().open();
}

function getInfo() {
	var Properties = require('tools/Properties');
	return {
		server : Properties.getInitInfo(),
		app : {
			id : Ti.App.id,
			name : Ti.App.name,
			version : Ti.App.version,
			publisher : Ti.App.publisher,
			url : Ti.App.url,
			description : Ti.App.description,
			copyright : Ti.App.copyright,
			deployType : Ti.App.deployType,
			sdkVersion : Ti.version,
			platform : {
				locale : Ti.Platform.locale,
				osversion : Ti.Platform.version,
				osname : Ti.Platform.osname,
				manufacturer : Ti.Platform.manufacturer,
				model : Ti.Platform.model,
				ostype : Ti.Platform.ostype,
				batteryLevel : Ti.Platform.batteryLevel,
				availableMemory : Ti.Platform.availableMemory,
				processorCount : Ti.Platform.processorCount,
				displayCaps : {
					density : Ti.Platform.displayCaps.density,
					dpi : Ti.Platform.displayCaps.dpi,
					platformHeight : Ti.Platform.displayCaps.platformHeight,
					platformWidth : Ti.Platform.displayCaps.platformWidth,
					xdpi : Ti.Platform.osname === 'android' ? Ti.Platform.displayCaps.xdpi : undefined,
					ydpi : Ti.Platform.osname === 'android' ? Ti.Platform.displayCaps.ydpi : undefined,
					logicalDensityFactor : Ti.Platform.osname === 'android' ? Ti.Platform.displayCaps.logicalDensityFactor : undefined
				}
			},
			setup : {
				serverName : Properties.getServerName(),
				isHttps : Properties.isHttps(),
				webApplication : Properties.getWebApplication(),
				supportUrl : Properties.getSupportUrl(),
				acsApiKey : Properties.getAcsApiKey()
			}
		}
	};

}
