var args = arguments[0] || {};

var application = args.application;
var connection = application.getConnection();

$.data = args.data;
$.metadata = $.data.metadata;

connection.getGeoLocation(currentLocationFound);

function currentLocationFound(coords) {

	var options = [];
	options.push(L('camera'));
	options.push(L('camera_roll'));
	options.push(L('cancel_button'));
	var optionDialog = Ti.UI.createOptionDialog({
		options : options,
		cancel : 2
	});

	optionDialog.addEventListener('click', function(e) {
		if (e.index == 0) {
			startCamera(coords);
		} else if (e.index == 1) {
			openCameraRoll(coords);
		}
	});

	optionDialog.show();
}

function startCamera(coords) {
	if (coords && coords.latitude && coords.longitude) {
		if (!$.metadata) {
			$.metadata = {};
		}
		$.metadata.latitude = coords.latitude;
		$.metadata.longitude = coords.longitude;
	}
	Ti.Media.showCamera({
		success : function(event) {
			var image = resizeImage(event.media, $.data.maxsize);
			connection.sendMedia(image, function(response) {
				var successAction = {
					type : 'camerasuccess',
					request : {
						action : 'onSuccess',
						type : 'camera',
						camera : {
							onSuccess : $.data.onSuccess,
							response : response
						}
					}
				};
				setTimeout(function(e) {
					connection.sendInfo(successAction);
				}, 250);
			}, $.metadata);
		},
		cancel : function() {
		},
		error : function(error) {
			var a = Ti.UI.createAlertDialog({
				title : 'Camera'
			});
			if (error.code == Titanium.Media.NO_CAMERA) {
				a.setMessage('Please run this test on device');
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
			a.show();
		},
		mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
	});
}

function openCameraRoll(coords) {
	if (coords && coords.latitude && coords.longitude) {
		if (!$.metadata) {
			$.metadata = {};
		}
		$.metadata.latitude = coords.latitude;
		$.metadata.longitude = coords.longitude;
	}
	Ti.Media.openPhotoGallery({
		success : function(event) {
			var image = resizeImage(event.media, $.data.maxsize);
			connection.sendMedia(image, function(response) {
				var successAction = {
					type : 'camerasuccess',
					request : {
						action : 'onSuccess',
						type : 'camera',
						camera : {
							onSuccess : $.data.onSuccess,
							response : response
						}
					}
				};
				setTimeout(function(e) {
					connection.sendInfo(successAction);
				}, 250);
			}, $.metadata);
		},
		cancel : function() {
		},
		error : function(error) {
		},
		allowEditing : false,
		mediaTypes : [Ti.Media.MEDIA_TYPE_VIDEO, Ti.Media.MEDIA_TYPE_PHOTO]
	});
}

function resizeImage(image, maxSize) {
	var largeHeight = 1632;
	var largeWidth = 1224;
	var mediumHeight = 640;
	var mediumWidth = 480;
	var smallHeight = 320;
	var smallWidth = 240;

	var imageHeight;
	var imageWidth;
	imageHeight = image.height;
	imageWidth = image.width;

	var height;
	var width;
	if (imageHeight > imageWidth) {
		if (maxSize == 'large') {
			height = largeHeight;
			width = largeWidth;
		} else if (maxSize == 'small') {
			height = smallHeight;
			width = smallWidth;
		} else {
			height = mediumHeight;
			width = mediumWidth;
		}
		if (imageWidth * 4 / 3 != imageHeight) {
			width = height / (imageHeight / imageWidth);
		}
	} else {
		if (maxSize == 'large') {
			width = largeHeight;
			height = largeWidth;
		} else if (maxSize == 'small') {
			width = smallHeight;
			height = smallWidth;
		} else {
			width = mediumHeight;
			height = mediumWidth;
		}
		if (imageHeight * 4 / 3 != imageWidth) {
			height = width / (imageWidth / imageHeight);
		}
	}

	var ImageFactory = require('ti.imagefactory');
	if (OS_IOS) {
		return ImageFactory.imageAsResized(image, {
			width : width,
			height : height,
			quality : 95
		});
	} else {
		return ImageFactory.imageAsResized(image, {
			width : width,
			height : height,
			format : ImageFactory.PNG,
			quality : 0.95
		});
	}
}
