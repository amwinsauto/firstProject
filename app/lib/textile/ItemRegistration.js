var Conversion = require("tools/Conversion");
var Strings = require("textile/Strings");
var Hash = require("tools/Hash");
var Images = require('Images');

var onePixel = 1;
if (Ti.Platform.displayCaps.density === 'high') {
	onePixel = 0.5;
}

function ItemRegistration(window, response) {
	this.debug = false;
	this.hideSizes = response.hidesizes;
	var start = new Date().getTime();

	this.stocksByColor;
	this.salesByColor;
	this.rowViews = new Array();
	this.detailViews = new Array();
	this.colorOverlayViews = new Array();
	this.summaryQuantityLabels = new Array();
	this.rowViewsByColor = new Hash();
	this.detailViewsByColor = new Hash();
	this.quantityButtonsByColorIndex = new Hash();
	this.quantityButtons = new Array();
	this.priceFields = new Hash();
	this.deliveryFields = new Hash();
	this.deliveryNowLabels = new Hash();
	this.deliveryLaterLeaders = new Hash();
	this.deliveryLaterLabels = new Hash();

	this.window = window;
	this.win = window.getWindow();;
	this.controller = window.getController();
	this.applicationConnection = this.controller.getConnection();
	this.oldCallback = this.applicationConnection.getCallback();
	this.applicationConnection.setCallback(this);

	this.response = response;

	this.deliverysRetrieved = false;
	this.antal = 1;

	this.sizesArray = response.sizes;
	if (typeof response.sizes === 'string') {
		this.sizesArray = new Array();
		this.sizesArray.push(response.sizes);
	}

	this.colorsArray = response.grpitemcolors;
	if (typeof response.grpitemcolors === 'string') {
		this.colorsArray = new Array();
		this.colorsArray.push(response.grpitemcolors);
	}

	this.assortSizesArray = response.assort_sizetxt;
	if (typeof this.response.assort_sizetxt === 'string') {
		this.assortSizesArray = new Array();
		this.assortSizesArray.push(this.response.assort_sizetxt);
	}

	this.assortQuantities1 = response.assort_quantity01;
	if (typeof this.response.assort_quantity01 === 'string') {
		this.assortQuantities1 = new Array();
		this.assortQuantities1.push(this.response.assort_quantity01);
	}

	this.assortQuantities2 = response.assort_quantity02;
	if (typeof this.response.assort_quantity02 === 'string') {
		this.assortQuantities2 = new Array();
		this.assortQuantities2.push(this.response.assort_quantity02);
	}

	this.assortQuantities3 = response.assort_quantity03;
	if (typeof this.response.assort_quantity03 === 'string') {
		this.assortQuantities3 = new Array();
		this.assortQuantities3.push(this.response.assort_quantity03);
	}

	this.assortQuantities4 = response.assort_quantity04;
	if (typeof this.response.assort_quantity04 === 'string') {
		this.assortQuantities4 = new Array();
		this.assortQuantities4.push(this.response.assort_quantity04);
	}

	this.assortQuantities5 = response.assort_quantity05;
	if (typeof this.response.assort_quantity05 === 'string') {
		this.assortQuantities5 = new Array();
		this.assortQuantities5.push(this.response.assort_quantity05);
	}

	this.assortQuantities6 = response.assort_quantity06;
	if (typeof this.response.assort_quantity06 === 'string') {
		this.assortQuantities6 = new Array();
		this.assortQuantities6.push(this.response.assort_quantity06);
	}

	this.assortQuantities7 = response.assort_quantity07;
	if (typeof this.response.assort_quantity07 === 'string') {
		this.assortQuantities7 = new Array();
		this.assortQuantities7.push(this.response.assort_quantity07);
	}

	this.assortQuantities8 = response.assort_quantity08;
	if (typeof this.response.assort_quantity08 === 'string') {
		this.assortQuantities8 = new Array();
		this.assortQuantities8.push(this.response.assort_quantity08);
	}

	this.assortQuantities9 = response.assort_quantity09;
	if (typeof this.response.assort_quantity09 === 'string') {
		this.assortQuantities9 = new Array();
		this.assortQuantities9.push(this.response.assort_quantity09);
	}

	this.assortQuantities10 = response.assort_quantity10;
	if (typeof this.response.assort_quantity10 === 'string') {
		this.assortQuantities10 = new Array();
		this.assortQuantities10.push(this.response.assort_quantity10);
	}

	this.assortQuantities11 = response.assort_quantity11;
	if (typeof this.response.assort_quantity11 === 'string') {
		this.assortQuantities11 = new Array();
		this.assortQuantities11.push(this.response.assort_quantity11);
	}

	this.assortQuantities12 = response.assort_quantity12;
	if (typeof this.response.assort_quantity12 === 'string') {
		this.assortQuantities12 = new Array();
		this.assortQuantities12.push(this.response.assort_quantity12);
	}

	this.assortQuantities13 = response.assort_quantity13;
	if (typeof this.response.assort_quantity13 === 'string') {
		this.assortQuantities13 = new Array();
		this.assortQuantities13.push(this.response.assort_quantity13);
	}

	this.assortQuantities14 = response.assort_quantity14;
	if (typeof this.response.assort_quantity14 === 'string') {
		this.assortQuantities14 = new Array();
		this.assortQuantities14.push(this.response.assort_quantity14);
	}

	this.assortQuantities15 = response.assort_quantity15;
	if (typeof this.response.assort_quantity15 === 'string') {
		this.assortQuantities15 = new Array();
		this.assortQuantities15.push(this.response.assort_quantity15);
	}

	this.assortQuantities16 = response.assort_quantity16;
	if (typeof this.response.assort_quantity16 === 'string') {
		this.assortQuantities16 = new Array();
		this.assortQuantities16.push(this.response.assort_quantity16);
	}

	this.assortQuantitiesArray = new Array();
	this.assortQuantitiesArray.push(this.assortQuantities1);
	this.assortQuantitiesArray.push(this.assortQuantities2);
	this.assortQuantitiesArray.push(this.assortQuantities3);
	this.assortQuantitiesArray.push(this.assortQuantities4);
	this.assortQuantitiesArray.push(this.assortQuantities5);
	this.assortQuantitiesArray.push(this.assortQuantities6);
	this.assortQuantitiesArray.push(this.assortQuantities7);
	this.assortQuantitiesArray.push(this.assortQuantities8);
	this.assortQuantitiesArray.push(this.assortQuantities9);
	this.assortQuantitiesArray.push(this.assortQuantities10);
	this.assortQuantitiesArray.push(this.assortQuantities11);
	this.assortQuantitiesArray.push(this.assortQuantities12);
	this.assortQuantitiesArray.push(this.assortQuantities13);
	this.assortQuantitiesArray.push(this.assortQuantities14);
	this.assortQuantitiesArray.push(this.assortQuantities15);
	this.assortQuantitiesArray.push(this.assortQuantities16);
	
	this.keyboardButtons = new Array(); 

	var winView = this.createWinView(response);

	var start2 = new Date().getTime();

	// win.mainView = winView;
	// win.add(winView);
	window.setView(winView);

	var elapsed2 = new Date().getTime() - start2;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\naddingWinView: ' + elapsed2;
	}
	
	this.buildButtonBar(this.win, response);
	if (isShowDelivery() && !this.hideSizes) {
		this.getDeliverys();
	}

	var elapsed = new Date().getTime() - start;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\nCreating Window: ' + elapsed;
	}
}

ItemRegistration.prototype.closeWindow = function() {
	this.win.popover = null;
	this.win.orderPopover = null;
	this.win.detailTextPopover = null;
	this.colorPopover = null;
	this.optionDialogPredefined = null;
	this.applicationConnection.setCallback(this.oldCallback);
	if (this.response.close_module) {
		var request = {
			action : "spccall",
			type : "onCloseWindow",
			onCloseWindow : {
				action : "closeWindow",
				name : "closewindow",
				spccall : {
					module : this.response.close_module,
					request : "FUNCTION[" + this.response.close_function + "]"
				}
			}
		};
		this.applicationConnection.send(request);
	} else {
		this.controller.closePopup();
	}
};

ItemRegistration.prototype.buildButtonBar = function() {
	var that = this;
	var buttonBack = Ti.UI.createButton({
	    title: this.response.button_back_text,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	buttonBack.addEventListener('click', function() {
		if (that.win.orderPopover) {
			that.win.orderPopover.hide();
		}
		that.closeWindow();
	});

	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});

	var width = 0;
	var items = [flexSpace];
	// if (this.response.grporders.length > 1) {
		// for (var i = 0; i < this.response.grporders.length; i++) {
			// var buttonOrder = Ti.UI.createButton({
				// name: 'buttonOrder' + this.response.grporders[i].customernos,
				// customerno: this.response.grporders[i].customernos,
				// orderno: this.response.grporders[i].ordernos,
			    // title: this.response.grporders[i].texts,
				// style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
			// });
			// buttonOrder.addEventListener('click', function(ev) {
				// that.setOrderlines(ev.source);
			// });
			// items.push(buttonOrder);
		// }		
	// } else {
		var buttonOK = Ti.UI.createButton({
			name: 'buttonOK',
		    title: this.response.button_ok_text,
		    width: '50%',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		if (this.response.grporders.length > 1) {
			buttonOK.addEventListener('click', function(ev) {
				if (!that.win.orderPopover) {
					that.win.orderPopover = Ti.UI.iPad.createPopover({
						//id : 'textile_itemregistration_order_popover',
						arrowDirection : Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP,
						navBarHidden : true,
						height: that.response.grporders.length  * 54 - 30,
						width: 420
					});
					var view = Ti.UI.createView({
						top: 0,
						height: Ti.UI.SIZE,
						width: Ti.UI.SIZE,
						layout: 'vertical'
					});
					that.win.orderPopover.add(view);
					for (var i = 0; i < that.response.grporders.length; i++) {
						var buttonOrder = Ti.UI.createButton({
							width: 400, height: 44, top: 10, left: 10, right: 10, backgroundImage: '/images/core/pillbutton.png', backgroundFocusedImage: '/images/core/pillbutton_pressed.png', backgroundSelectedImage: '/images/core/pillbutton_pressed.png',
							name: 'buttonOrder' + that.response.grporders[i].customernos,
							customerno: that.response.grporders[i].customernos,
							orderno: that.response.grporders[i].ordernos,
						    title: that.response.grporders[i].texts,
							// style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
						});
						buttonOrder.addEventListener('click', function(ev) {
							that.win.orderPopover.hide();
							that.setOrderlines(ev.source);
						});
						view.add(buttonOrder);
					}		
				}
				that.win.orderPopover.show({
					view : buttonOK,
					animated : true
				});
			});
		} else {
			if (this.response.grporders.length > 0) {
				buttonOK.customerno = this.response.grporders[0].customernos;
				buttonOK.orderno = this.response.grporders[0].ordernos;
			}
			buttonOK.addEventListener('click', function(ev) {
				that.setOrderlines(ev.source);
			});
		}
		items.push(buttonOK);
	// }
	
	this.win.rightNavButton = buttonOK;//toolbar;
	this.win.backButtonTitle = this.response.button_back_text;
	this.win.leftNavButton = buttonBack;
	this.win.title = this.response.header_text;
	this.win.navBarHidden = false;
};

ItemRegistration.prototype.handleResponse = function(response) {
	if (response.error === true) {
		Ti.UI.createAlertDialog({
			message: Conversion.toString(response.errorinfo.errortext)
		}).show();
		//alert(response.errorinfo.errortext);
	} else if (response.type === 'alert'){
		//new AlertDialog(response.alert, this.applicationConnection).show();
		Alloy.createController('application/alert/alert', {
			connection : this.applicationConnection,
			data : response.alert
		}).show();
	} else {
		if (response.action === 'getdeliverys') {
			this.updateDeliveries(response);
			this.toggleDeliverySituation(this.applicationConnection.request.button.source);
//		} else if (this.applicationConnection.request.button.source.name === "buttonOK") {
		} else if (response.action === 'setorderlines' || this.applicationConnection.request.button.action === 'setOrderlines') {
			if (isShowDelivery()) {
				this.updateDeliveries(response);
			}
			if (this.response.grporders.length > 1) {
				for (var i = 0; i < this.quantityButtons.length; i++) {
					this.quantityButtons[i].title = '';
				}
				for (var i = 0; i < this.summaryQuantityLabels.length; i++) {
					this.summaryQuantityLabels[i].text = '';
				}
			} else {
				this.closeWindow();
			}
		} else {
			this.closeWindow();
		}
	}
};

ItemRegistration.prototype.updateDeliveries = function(response) {
	if (response.spc) {
		this.stocksByColor = new Hash();
		this.salesByColor = new Hash();
		for (var i = 0; i < this.colorsArray.length; i++) {
			var totalSummed = 0;
			var stocks = response.spc['grpitemstocks.' + this.colorsArray[i].colors];
			if (stocks) {
				for (var j = 0; j < stocks.length; j++) {
					var viewDetailRow = this.detailViewsByColor.getItem(this.colorsArray[i].colors + '_0');
					if (j > 7) {
						viewDetailRow = this.detailViewsByColor.getItem(this.colorsArray[i].colors + '_1');
					}
					viewDeliveries = getChildById(viewDetailRow, 'textile_itemregistration_deliveries');
					if (this.deliverysRetrieved) {
						var labelDeliveryNow = this.deliveryNowLabels.getItem(this.colorsArray[i].colors + '_' + j.toString());
						labelDeliveryNow.text = stocks[j]['stocknows_' + this.colorsArray[i].colors];
						
						var leaderDeliveryLater = this.deliveryLaterLeaders.getItem(this.colorsArray[i].colors + '_' + j.toString());
						var labelDeliveryLater = this.deliveryLaterLabels.getItem(this.colorsArray[i].colors + '_' + j.toString());
						if (stocks[j]['stockdeliverys_' + this.colorsArray[i].colors] != '') {
							leaderDeliveryLater.text = stocks[j]['stockdeliverys_' + this.colorsArray[i].colors];
							labelDeliveryLater.text = stocks[j]['stocklaters_' +  this.colorsArray[i].colors];
						} else {
							leaderDeliveryLater.text = '';
							labelDeliveryLater.text = '';
						}
					} else {
						viewDeliveries.getChildren();
						var leaderDeliveryNow = Ti.UI.createLabel({id: 'textile_itemregistration_delivery_now_label', font:{fontSize : 12, fontWeight : 'bold'}, color: '#f2f2f2', textAlign: 'right', height: 20, width: 37, top: 5, text: this.response.now_leader, left: 208 + (j * 96) 
						}); // f2f2f2
						if (stocks[j]['stocknows_' + this.colorsArray[i].colors] == '') {
							leaderDeliveryNow.text = '';
						}
						if (j > 7) {
							leaderDeliveryNow.left = 208 + ((j-8) * 96);
						}
						viewDeliveries.add(leaderDeliveryNow);
						var labelDeliveryNow = Ti.UI.createLabel({font:{fontSize : 12, fontWeight : 'bold'}, color: '#f2f2f2', textAlign: 'center', height: 20, width: 40, top: 5, text: stocks[j]['stocknows_' + this.colorsArray[i].colors], left: 256 + (j * 96)});
						if (j > 7) {
							labelDeliveryNow.left = 256 + ((j-8) * 96);
						}
						this.deliveryNowLabels.setItem(this.colorsArray[i].colors + '_' + j.toString(), labelDeliveryNow);
						viewDeliveries.add(labelDeliveryNow);
	
						var leaderDeliveryLater = Ti.UI.createLabel({font:{fontSize : 12, fontWeight : 'bold'}, color: '#232323', textAlign: 'right', height: 20, width: 37, top: 20, left: 208 + (j * 96)}); // GPS #a4a4a4
						this.deliveryLaterLeaders.setItem(this.colorsArray[i].colors + '_' + j.toString(), leaderDeliveryLater);
						viewDeliveries.add(leaderDeliveryLater);
						if (j > 7) {
							leaderDeliveryLater.left = 208 + ((j-8) * 96);
						}
						var labelDeliveryLater = Ti.UI.createLabel({font:{fontSize : 12, fontWeight : 'bold'}, color: '#232323', textAlign: 'center', height: 20, width: 40, top: 20, left: 256 + (j * 96)}); // GPS a4a4a4
						this.deliveryLaterLabels.setItem(this.colorsArray[i].colors + '_' + j.toString(), labelDeliveryLater);
						viewDeliveries.add(labelDeliveryLater);
						if (j > 7) {
							labelDeliveryLater.left = 256 + ((j-8) * 96);
						}
						if (stocks[j]['stockdeliverys_' + this.colorsArray[i].colors] != '') {
							leaderDeliveryLater.text = stocks[j]['stockdeliverys_' + this.colorsArray[i].colors];
							labelDeliveryLater.text = stocks[j]['stocklaters_' + this.colorsArray[i].colors];
						}
					}
					totalSummed += parseInt(this.deliveryNowLabels.getItem(this.colorsArray[i].colors + '_' + j.toString()).text, 10);
				}
			}
			var total = 0;
			if (response.spc['stockquantity_' + this.colorsArray[i].colors]) {
				total = Conversion.toNumber(response.spc['stockquantity_' + this.colorsArray[i].colors], 10);
			} else {
				total = totalSummed;
			}
			this.stocksByColor.setItem(i, total);
			var sales = Conversion.toNumber(this.response.grpitemcolors[i].sales, 10);
			this.salesByColor.setItem(i, sales);
			var summaryQuantityLabel = this.summaryQuantityLabels[i];
			if (summaryQuantityLabel && summaryQuantityLabel.text && summaryQuantityLabel.text.indexOf(' / ') == -1) {
				summaryQuantityLabel.text = summaryQuantityLabel.text + ' / ' + total.toString();
			} else if (summaryQuantityLabel) {
				if (summaryQuantityLabel.text) {
					summaryQuantityLabel.text = summaryQuantityLabel.text.substr(0, summaryQuantityLabel.text.indexOf(' / ')) + ' / ' + total.toString();
				} else {
					summaryQuantityLabel.text = '0 / ' + total.toString();
				}
			}
			if (summaryQuantityLabel && sales >= 0) {
				summaryQuantityLabel.text = summaryQuantityLabel.text + ' / ' + sales.toString();
			}
			summaryQuantityLabel = this.summaryQuantityLabels[i + this.colorsArray.length];
			if (summaryQuantityLabel && summaryQuantityLabel.text && summaryQuantityLabel.text.indexOf(' / ') == -1) {
				summaryQuantityLabel.text = summaryQuantityLabel.text + ' / ' + total.toString();
			} else if (summaryQuantityLabel) {
				if (summaryQuantityLabel.text) {
					summaryQuantityLabel.text = summaryQuantityLabel.text.substr(0, summaryQuantityLabel.text.indexOf(' / ')) + ' / ' + total.toString();
				} else {
					summaryQuantityLabel.text = '0 / ' + total.toString();
				}
			}
			if (summaryQuantityLabel && sales >= 0) {
				summaryQuantityLabel.text = summaryQuantityLabel.text + ' / ' + sales.toString();
			}
		}
	}
	this.deliverysRetrieved = true;
};

ItemRegistration.prototype.setOrderlines = function(source) { 
	var spcObj = this.getSpcObj();
	var quantities = new Array();
	for (var colorIndex = 0; colorIndex < this.colorsArray.length; colorIndex++) {
		for (var sizeIndex = 0; sizeIndex < this.sizesArray.length; sizeIndex++) {
			var quantityButton = this.quantityButtonsByColorIndex.getItem(Conversion.toString(colorIndex) + '_' + Conversion.toString(sizeIndex));
			var priceField = this.priceFields.getItem(Conversion.toString(colorIndex));
			var deliveryField = this.deliveryFields.getItem(Conversion.toString(colorIndex));
			var quantity = 0;
			if (quantityButton && quantityButton.title && quantityButton.title != '') {
				quantity = parseInt(quantityButton.title, 10);
				if (quantityButton.quantity) {
					quantity = quantity / parseInt(quantityButton.quantity, 10);
				}
			}
			var price = Strings.toNumber(priceField.value);
			var delivery = parseInt(deliveryField.value, 10);
			if (quantity > 0 || price > 0 || delivery > 0) {
				var quantityObj = {colors: this.colorsArray[colorIndex].colors, sizes: this.sizesArray[sizeIndex], quantitys: quantity, prices: price, deliverys: delivery};
				quantities.push(quantityObj);
			}
		}
	}
	spcObj.grplines = quantities;
	if (this.fieldPris && this.fieldPris.value) {
		spcObj.price = Strings.toNumber(this.fieldPris.value);
	}
	if (this.fieldLevering && this.fieldLevering.value) {
		spcObj.delivery = parseInt(this.fieldLevering.value, 10);
	}
	if (this.fieldRabat && this.fieldRabat.value) {
		spcObj.discount = Strings.toNumber(this.fieldRabat.value);
	}
	if (isShowDelivery()) {
		spcObj.getdeliverys = '*YES';
	}
	spcObj.orderno = source.orderno;
	spcObj.customerno = source.customerno;

	if (this.textAreaDetailText) {
		spcObj.detailtext = this.textAreaDetailText.value;
	}

	var typeObj = {
		action : "setOrderlines",
		source : source,
		name : "setorderlines",
		spccall : {
			module : this.response.button_ok_module,
			request : "FUNCTION[" + this.response.button_ok_function + "]"
		},
		spcobj : spcObj
	};
	var request = {
		action : "spccall",
		type : "button",
		button : typeObj
	};

	this.applicationConnection.send(request);
};

ItemRegistration.prototype.getDeliverys = function(source) {
	var spcObj = this.getSpcObj();
	if (this.fieldLevering.value) {
		spcObj.deliveryweek = this.fieldLevering.value;
	}
	var typeObj = {action: "getDeliverys", source:source, name:"getdeliverys", spccall:{module: this.response.button_delivery_show_module, request: "FUNCTION[" + this.response.button_delivery_show_function + "]"}, spcobj:spcObj};
	var request = {action: "spccall", type: "button", button: typeObj};
	this.applicationConnection.send(request);
};

ItemRegistration.prototype.getSpcObj = function() {
	var spcObj = {key1: this.response.key1, key2: this.response.key2, key3: this.response.key3, key4: this.response.key4, key5: this.response.key5};
	return spcObj;
};

ItemRegistration.prototype.createWinView = function(response) {
	var start = new Date().getTime();

//	var view = Ti.UI.createView({top: 0, height: 660, backgroundImage: '/images/textile/textile_custom_screen_bg.png', touchEnabled: true});
	var view = Ti.UI.createView({top: 0, height: 660, backgroundColor: '#efeff4', touchEnabled: true});
	
	var that = this;
	view.addEventListener('click', function(e){
		if (that.fieldRabat) {
			that.fieldRabat.blur();
		}
		if (that.fieldPris) {
			that.fieldPris.blur();
		}
		if (that.fieldLevering) { 
			that.fieldLevering.blur();
		} 
	});
	
	var contentsView = Ti.UI.createView({layout: 'vertical', top: 0, height: Ti.UI.SIZE});
	view.add(contentsView);

	var buttonUpdateDeliverySituation = Titanium.UI.createButton({
		name: 'buttonUpdateDeliverySituation',
		title: response.button_delivery_update_text,
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	var buttonLeveringssituation = Titanium.UI.createButton({
		name: 'buttonLeveringssituation',
		title: response.button_delivery_show_text,
		showTitle: response.button_delivery_show_text,
		hideTitle: response.button_delivery_hide_text,
		style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	buttonLeveringssituation.updateButton = buttonUpdateDeliverySituation;
	if (isShowDelivery()) {
		buttonLeveringssituation.title = response.button_delivery_hide_text;
	} else {
		buttonUpdateDeliverySituation.enabled = false;
	}
	var that = this;
	buttonLeveringssituation.addEventListener('click', function(ev) {
		if (that.win.popover) {
			that.win.popover.hide();
		}
		if (that.win.detailTextPopover) {
			that.win.detailTextPopover.hide();
		}
		setShowDelivery(!isShowDelivery());
		if (that.deliverysRetrieved) {
			that.toggleDeliverySituation(buttonLeveringssituation);
		} else {
			that.getDeliverys(ev.source);
		}
	});

	buttonUpdateDeliverySituation.addEventListener('click', function(ev) {
		that.getDeliverys();
	});

	if (response.button_dettxt_leader) {
		this.buttonDetailText = Titanium.UI.createButton({
			name: "buttonDetailText",
			title: response.button_dettxt_leader,
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
			value: response.detailtext
		});
		var that = this;
		var thatResponse = response;
		this.buttonDetailText.addEventListener('click', function(ev) {
			if (that.win.popover) {
				that.win.popover.hide();
			}
			if (!that.win.detailTextPopover) {
				that.win.detailTextPopover = Ti.UI.iPad.createPopover({
					id : 'mainwindow_detailtext_popover_tablet',
					arrowDirection : Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN,
					navBarHidden : true,
					//height: 80,
					//width: 300,
					font : {fontSize: 18}
				});
				
				that.textAreaDetailText = Ti.UI.createTextArea({
					height: 100,
					width: 280,
					borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
					value: thatResponse.detailtext
				});
		
				that.win.detailTextPopover.setContentView(that.textAreaDetailText);
			}
	
			that.win.detailTextPopover.show({
				view : that.buttonDetailText,
				animated : true
			});
			
			that.textAreaDetailText.focus();
		});
	}

	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});

	this.buttonQuantity = Titanium.UI.createButton({
		value: 1,
		title: '+1',
		pickertype: 'button',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	this.buttonQuantity.addEventListener('click', function(ev) {
		if (!that.win.popover) {
			that.win.popover = Ti.UI.iPad.createPopover({
				id : 'mainwindow_popover_tablet',
				arrowDirection : Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN,
				navBarHidden : true,
				height: 175,
				width: 120
			});

			picker = Ti.UI.createPicker({
				type : Ti.UI.PICKER_TYPE_PLAIN,
				top: 0,
				width: 120,
				selectionIndicator : true
			});
			var data = [];
			data[0]=Titanium.UI.createPickerRow({title:'+10000',align:'center'});
			data[1]=Titanium.UI.createPickerRow({title:'+5000',align:'center'});
			data[2]=Titanium.UI.createPickerRow({title:'+1000',align:'center'});
			data[3]=Titanium.UI.createPickerRow({title:'+500',align:'center'});
			data[4]=Titanium.UI.createPickerRow({title:'+100',align:'center'});
			data[5]=Titanium.UI.createPickerRow({title:'+50',align:'center'});
			data[6]=Titanium.UI.createPickerRow({title:'+25',align:'center'});
			data[7]=Titanium.UI.createPickerRow({title:'+10',align:'center'});
			data[8]=Titanium.UI.createPickerRow({title:'+5',align:'center'});
			data[9]=Titanium.UI.createPickerRow({title:'+1',align:'center'});
			data[10]=Titanium.UI.createPickerRow({title:'-1',align:'center'});
			data[11]=Titanium.UI.createPickerRow({title:'-5',align:'center'});
			data[12]=Titanium.UI.createPickerRow({title:'-10',align:'center'});
			data[13]=Titanium.UI.createPickerRow({title:'-25',align:'center'});
			data[14]=Titanium.UI.createPickerRow({title:'-50',align:'center'});
			data[15]=Titanium.UI.createPickerRow({title:'-100',align:'center'});
			data[16]=Titanium.UI.createPickerRow({title:'-500',align:'center'});
			data[17]=Titanium.UI.createPickerRow({title:'-1000',align:'center'});
			data[18]=Titanium.UI.createPickerRow({title:'-5000',align:'center'});
			data[19]=Titanium.UI.createPickerRow({title:'-10000',align:'center'});
			picker.add(data);

			picker.addEventListener("change",function(){
				that.buttonQuantity.title = picker.getSelectedRow(0).title;
			});

			that.win.popover.add(picker);
		}

		var selectedIndex = 0;
		for (var i = 0; i < 20 && selectedIndex === 0; i++) {
			if (picker.columns[0].rows[i].title === that.buttonQuantity.title) {
				selectedIndex = i;
			}
		}
		picker.setSelectedRow(0, selectedIndex);
		that.win.popover.show({
			view : that.buttonQuantity,
			animated : true
		});
	});

	if (this.buttonDetailText) {
		// this.window.setBottomButtons([buttonLeveringssituation, buttonUpdateDeliverySituation, this.buttonDetailText, flexSpace, this.buttonQuantity]);
		this.window.setBottomButtons([buttonLeveringssituation, buttonUpdateDeliverySituation, this.buttonDetailText]);
	} else {
		// this.window.setBottomButtons([buttonLeveringssituation, buttonUpdateDeliverySituation, flexSpace, this.buttonQuantity]);
		this.window.setBottomButtons([buttonLeveringssituation, buttonUpdateDeliverySituation]);
	}

	view.addEventListener('doubletap', function(ev) {
		if (ev.source.farveIndex != null && ev.source.strIndex != null) {
			ev.source.backgroundGradient = {};
		}
	});
	
	view.addEventListener('singletap', function(ev) {
		if (ev.source.farveIndex != null && ev.source.strIndex != null) {
			ev.source.backgroundGradient = {};
		}
	});
	view.addEventListener('touchend',function(ev) {
		if (ev.source.farveIndex != null && ev.source.strIndex != null) {
			ev.source.backgroundGradient = {};
		}
	});
	
	view.addEventListener('touchcancel',function(ev) {
		if (ev.source.farveIndex != null && ev.source.strIndex != null) {
			ev.source.backgroundGradient = {};
		}
	});

	this.createTopView(response, contentsView);
	this.createKeyboardView(response, view);
	this.createBottomView(response, view);

	var elapsed = new Date().getTime() - start;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\ncreateWinView: ' + elapsed;
	}

	return view;
};

ItemRegistration.prototype.createKeyboardView = function(response, parentView) {
	// var view = Titanium.UI.createView({top: 240, height: '48', backgroundImage: '/images/textile/keyboardbg.png', borderWidth: 0});
    var view = Titanium.UI.createView({top: 240, height: '38', backgroundImage: '/images/textile/keyboardbg.png', borderWidth: 0});
	/*
	this.createKeyboardNumberButton(view, 3, '1');
	this.createKeyboardNumberButton(view, 74, '2');
	this.createKeyboardNumberButton(view, 145, '3');
	this.createKeyboardNumberButton(view, 216, '4');
	this.createKeyboardNumberButton(view, 287, '5');
	this.createKeyboardNumberButton(view, 358, '6');
	this.createKeyboardNumberButton(view, 429, '7');
	this.createKeyboardNumberButton(view, 500, '8');
	this.createKeyboardNumberButton(view, 571, '9');
	this.createKeyboardNumberButton(view, 642, '0');
    */
	this.createKeyboardNumberButton(view, 0, '1');
    this.createKeyboardNumberButton(view, 70, '2');
    this.createKeyboardNumberButton(view, 140, '3');
    this.createKeyboardNumberButton(view, 210, '4');
    this.createKeyboardNumberButton(view, 280, '5');
    this.createKeyboardNumberButton(view, 350, '6');
    this.createKeyboardNumberButton(view, 420, '7');
    this.createKeyboardNumberButton(view, 490, '8');
    this.createKeyboardNumberButton(view, 560, '9');
    this.createKeyboardNumberButton(view, 630, '0');
    
	var that = this;
	var buttonClear = Ti.UI.createButton({
		top : 0,
		height : 37,
		right : 70,
		width : 70,
		title : 'X',
		color : 'black',
		backgroundImage : '/images/textile/keyboardBtnUp.png',
		backgroundFocusedImage : '/images/textile/keyboardBtnDown.png',
		backgroundSelectedImage : '/images/textile/keyboardBtnDown.png',
		font : {
			fontSize : 20,
			fontWeight : 'bold',
		}
	}); 
	buttonClear.addEventListener('click', function(ev) {
		that.keyboardPredefinedLabel.text = '';
		that.keyboardPredefinedLabel.visible = false;
		that.keyboardQuantityLabel.text = '';
		that.keyboardQuantityLabel.visible = true;
		for (var i = 0; i < 10; i++) {
			that.keyboardButtons[i].visible = true;
		};
		that.assortIndex = null;
	});

	var buttonPredefined = Ti.UI.createButton({
		top : 0,
		height : 37,
		right : 0,
		width : 70,
		color : 'black',
		backgroundImage: '/images/textile/multiColumnRowInsertUp.png',
		backgroundFocusedImage: '/images/textile/multiColumnRowInsertDown.png',
		backgroundSelectedImage: '/images/textile/multiColumnRowInsertDown.png'
	}); 
	if (this.assortSizesArray && this.assortSizesArray.length > 0) {
		buttonPredefined.addEventListener('click', function(ev) {
			if (!that.optionDialogPredefined) {
				that.optionDialogPredefined = Ti.UI.createOptionDialog({
					options: that.assortSizesArray
				});
				that.optionDialogPredefined.addEventListener('click', function(ev) {
					if (ev.index > -1) {
						that.assortIndex = ev.index;
						that.keyboardQuantityLabel.visible = false;
						that.keyboardQuantityLabel.text = '';
						that.keyboardPredefinedLabel.text = ev.source.options[ev.index];
						that.keyboardPredefinedLabel.visible = true;
						for (var i = 0; i < 10; i++) {
							that.keyboardButtons[i].visible = false;
						};
					}
				});
			}
	
			that.optionDialogPredefined.show({
				view : buttonPredefined,
			});
		});
	} else {
		buttonPredefined.enabled = false;
	}

	this.keyboardQuantityLabel = Ti.UI.createLabel({
		top : 0,
		height : 37,
		left : 713,
		right : 172,
		textAlign : 'right',
		text : '',
		font : {
			fontSize : 36,
			fontWeight : 'bold',
		}
	});

	this.keyboardPredefinedLabel = Ti.UI.createLabel({
		top : 0,
		height : 37,
		left : 15,
		right : 172,
		textAlign : 'left',
		font : {
			fontSize : 36,
			fontWeight : 'bold',
		},
		visible: false
	});

	view.add(this.keyboardQuantityLabel);
	view.add(this.keyboardPredefinedLabel);
	view.add(buttonClear);
	view.add(buttonPredefined);

	parentView.add(view);
	
	if (response.defaultclickquantity) {
		this.keyboardQuantityLabel.text = Conversion.toString(response.defaultclickquantity);
	}

	return view;
};

ItemRegistration.prototype.createKeyboardNumberButton = function(view, left, title) {
	var button = Ti.UI.createButton({
		top : 0,
		height : 37,
		left : left,
		width : 70,
		title : title,
		color : 'black',
		backgroundImage : '/images/textile/keyboardBtnUp.png',
		backgroundFocusedImage : '/images/textile/keyboardBtnDown.png',
		backgroundSelectedImage : '/images/textile/keyboardBtnDown.png',
		font : {
			fontSize : 20,
			fontWeight : 'bold',
		}
	}); 
	this.keyboardButtons.push(button);

	var that = this;
	button.addEventListener('click', function(ev) {
		if (that.resetQuantity) {
			that.keyboardQuantityLabel.text = '';
			that.resetQuantity = false;
		}
		that.keyboardQuantityLabel.text = that.keyboardQuantityLabel.text + ev.source.title;
	});

	view.add(button);
};

ItemRegistration.prototype.createTopView = function(response, parentView) {
	var view = Titanium.UI.createView({height: Ti.UI.SIZE});

	var imageHeader = response.description;
	if (!imageHeader) {
		imageHeader = '';
	} else {
		imageHeader = imageHeader.toString().toUpperCase();
	}
	view.add(Ti.UI.createLabel({top: 25, left: 16, width: 320, color: '#6d6d72', text: imageHeader}));

	var image = Images.getImage('PHOTO_MISSING','core'); // '/images/core/photomissing.png';
	if (response.image != undefined && response.image != '') {
		image = response.image;
	}

	var imageSectionTopLine = Ti.UI.createView({height: onePixel, left: 0, right: 0, backgroundColor: '#999999'});

	imageTableRows = [];
	var row = Ti.UI.createTableViewRow({
		hasChild : false,
		height : 171
	});
	if (this.debug) {
		this.textArea = Titanium.UI.createTextArea({top: 4, left: 4, width: 252, height: 162});
		row.add(this.textArea);
	} else {
		this.itemImage = Titanium.UI.createImageView({top: 4, left: 4, width: 312, image: image});
		this.itemImage.orgImage = image;
		row.add(this.itemImage);
	}
	imageTableRows.push(row);

	this.imageSectionView = Ti.UI.createTableView({
//		top: 25, left: 22, width: 200, height: 200, backgroundColor: '#ffffff', borderColor: '#bdbdbd', borderRadius: 10, borderWidth: 4,
		top: 55, left: 16, width: 320, height: 170, backgroundColor: '#ffffff', borderWidth: 0,
		scrollable : false,
		allowsSelection: false,
		// height : 80,
		headerView: imageSectionTopLine,
		data : imageTableRows
	});
	view.add(this.imageSectionView);


	var iheader = this.response.item_header;
	if (!iheader) {
		iheader = '';
	} else {
		iheader = iheader.toString().toUpperCase();;
		
	}
	view.add(Ti.UI.createLabel({top: 25, left: 352, width: 320, color: '#6d6d72', text: iheader}));

	var itemInformationTableRows = [];
	// var row = Ti.UI.createTableViewRow({
		// backgroundSelectedColor: 'transparent',
		// height: 50
	// });
	// row.add(Ti.UI.createLabel({height: 30, left: 15, color: '#6d6d72', font: {fontSize : 20, fontWeight : 'bold'}, text: this.response.item_header}));
	// itemInformationTableRows.push(row);

	var row = Ti.UI.createTableViewRow({
		hasChild : false,
		height : 88
	});
	var left = 15;
	if (response.key1_leader != '') {
		row.add(Ti.UI.createLabel({height: 30, font: {fontWeight : 'bold'}, minimumFontSize : 10, top: 5, text: response.key1_leader, width: 70, left: left, textAlign: 'center'}));
		row.add(Ti.UI.createLabel({text: response.key1, top: 40, width: 70, height: 20, left: left, textAlign: 'center'}));
		left += 75;
	}
	if (response.key2_leader != '') {
		row.add(Ti.UI.createLabel({height: 30, font: {fontWeight : 'bold'}, minimumFontSize : 10, top: 5, text: response.key2_leader, width: 70, left: left, textAlign: 'center'}));
		row.add(Ti.UI.createLabel({text: response.key2, top: 40, width: 70, height: 20, left: left, textAlign: 'center'}));
		left += 75;
	}
	if (response.key3_leader != '') {
		row.add(Ti.UI.createLabel({height: 30, font: {fontWeight : 'bold'}, minimumFontSize : 10, top: 5, text: response.key3_leader, width: 70, left: left, textAlign: 'center'}));
		row.add(Ti.UI.createLabel({text: response.key3, top: 40, width: 70, height: 20, left: left, textAlign: 'center'}));
		left += 75;
	}
	if (response.key5_leader != '') {
		row.add(Ti.UI.createLabel({height: 30, font: {fontWeight : 'bold'}, minimumFontSize : 10, top: 5, text: response.key5_leader, width: 70, left: left, textAlign: 'center'}));
		row.add(Ti.UI.createLabel({text: response.key5, top: 40, width: 70, height: 20, left: left, textAlign: 'center'}));
		left += 75;
	}
	itemInformationTableRows.push(row);

	var row = Ti.UI.createTableViewRow({
		hasChild : false,
		height : 88
	});
	row.add(Ti.UI.createLabel({text: response.description, top: 25, height: 20, left: 15, right: 15}));
	itemInformationTableRows.push(row);
	var itemSectionTopLine = Ti.UI.createView({height: onePixel, left: 0, right: 0, backgroundColor: '#999999'});
	var itemSectionView = Ti.UI.createTableView({
//		top: 25, left: 255, width: 420, backgroundColor: '#ffffff', borderColor: '#bdbdbd', borderRadius: 10, borderWidth: 4,
		top: 55, left: 352, width: 320, backgroundColor: '#ffffff',
		scrollable : false,
		allowsSelection: false,
//		height : 200,
		height : 170,
		headerView: itemSectionTopLine,
		data : itemInformationTableRows
	});
	view.add(itemSectionView);


	var lheader = this.response.line_header;
	if (!lheader) {
		lheader = '';
	} else {
		lheader = lheader.toString().toUpperCase();
	}
	view.add(Ti.UI.createLabel({top: 25, width: 320, right: 16, color: '#6d6d72', text: lheader}));
	var lineInformationTableRows = [];
	// var row = Ti.UI.createTableViewRow({
		// backgroundSelectedColor: 'transparent',
		// height: 50
	// });
	// row.add(Ti.UI.createLabel({height: 30, left: 15, color: '#6d6d72', font: {fontSize : 20, fontWeight : 'bold'}, text: this.response.line_header}));
	// lineInformationTableRows.push(row);
	var height = 170;

	if (response.price_leader != '') {
		row = this.createItemInformationRow(response.price_leader);
		this.fieldPris = Titanium.UI.createTextField({color: '#007aff', height: 30, right: 15, width: '45%', fieldtype: 'numeric', keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD, textAlign: 'right'});
		if (this.response.price) {
			this.fieldPris.value = Strings.fromNumber(Strings.toNumber(this.response.price), 2);
		}
		this.fieldPris.editable = response.price_edit;
		row.add(this.fieldPris);
		lineInformationTableRows.push(row);
	} else {
		height = height - 36;
	}

	if (response.delivery_leader != '') {
		row = this.createItemInformationRow(response.delivery_leader);
		this.fieldLevering = Titanium.UI.createTextField({color: '#007aff', height: 30, right: 15, width: '45%', fieldtype: 'numeric', keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD, textAlign: 'right'});
		if (this.response.delivery) {
			this.fieldLevering.value = this.response.delivery;
		}
		this.fieldLevering.editable = response.delivery_edit;
		row.add(this.fieldLevering);
		lineInformationTableRows.push(row);
	} else {
		height = height - 36;
	}

	if (response.discount_leader != '') {
		row = this.createLineInformationRow();
		//row.height = 80;
		var optionsLabel = Ti.UI.createLabel({height: 30, right: 15, minimumFontSize : 10, text: response.controloptions_header, top: 5, left: 38});
		row.add(optionsLabel);
		var that = this;
		row.addEventListener('singletap', function(ev) {
			if (that.optionsIcon.backgroundImage === '/images/core/expanded.png') {
				//that.lineSectionView.height = that.lineSectionView.height - 30;
				that.optionsIcon.backgroundImage = '/images/core/collapsed.png';
				that.fieldRabatLabel.visible = false;
				that.fieldRabat.visible = false;
				ev.row.height = 44;
			} else {
				//that.lineSectionView.height = that.lineSectionView.height + 30;
				ev.row.height = 88;
				that.optionsIcon.backgroundImage = '/images/core/expanded.png';
				that.fieldRabatLabel.visible = true;
				that.fieldRabat.visible = true;
				that.fieldRabat.focus();
			}
		});
		this.optionsIcon = Titanium.UI.createButton({
			left: 17, top: 13, height: 13, width: 13, backgroundImage: '/images/core/collapsed.png'
		});
		row.add(this.optionsIcon);
		this.fieldRabatLabel = Ti.UI.createLabel({left: 15, height: 30, width: '45%', minimumFontSize : 10, text: response.discount_leader, top: 40, visible: false}); 
		row.add(this.fieldRabatLabel);
		this.fieldRabat = Titanium.UI.createTextField({color: '#007aff', height: 30, right: 15, width: '45%', top: 40, fieldtype: 'numeric', keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD, textAlign: 'right', visible: false});
		if (this.response.discount) {
			this.fieldRabat.value = Strings.fromNumber(Strings.toNumber(this.response.discount), 2);
		}
		this.fieldRabat.editable = response.discount_edit;
		row.add(this.fieldRabat);
		lineInformationTableRows.push(row);
	} else {
		lineInformationTableRows.push(Ti.UI.createTableViewRow({
			hasChild : false,
			height : 88
		})); 
		height = height - 40;
	}

	if (response.price_leader != '' || response.delivery_leader != '' || response.discount_leader != '') {
		var lineSectionTopLine = Ti.UI.createView({height: onePixel, left: 0, right: 0, backgroundColor: '#999999'});
		this.lineSectionView = Ti.UI.createTableView({
//			top: 25, right: 20, width: 300, backgroundColor: '#ffffff', borderColor: '#bdbdbd', borderRadius: 10, borderWidth: 4,
			top: 55, right: 16, width: 320, backgroundColor: '#ffffff',
			scrollable : false,
			allowsSelection: false,
//			height : height,
			height : 170,
			headerView: lineSectionTopLine,
			data : lineInformationTableRows
		});
		view.add(this.lineSectionView);
	}

	parentView.add(view);

	return view;
};

ItemRegistration.prototype.createItemInformationRow = function(leader, value) {
	var row = Ti.UI.createTableViewRow({
		hasChild : false,
		height : 44
	});
	row.add(Ti.UI.createLabel({textAlign: 'left', left: 15, height: 30, width: '45%', minimumFontSize : 10, text: leader}));
	row.add(Ti.UI.createLabel({height: 30, width: '45%', right: 15, text: value}));
	return row;
};


ItemRegistration.prototype.createLineInformationRow = function() {
	var row = Ti.UI.createTableViewRow({
		hasChild : false,
		height : 44
	});
	return row;
};

ItemRegistration.prototype.createCenterView = function(response, parentView, scrollViewIndex) {
	var start = new Date().getTime();
	var view = Ti.UI.createView({
		top: 0,
		height: Ti.UI.SIZE
	});
	parentView.add(view);

	if (scrollViewIndex == 0) {
		for (var strIndex = 0; strIndex < this.sizesArray.length && strIndex < 8; strIndex++)	{
			this.createStrLabel(view, strIndex, this.sizesArray[strIndex]);
		}
	} else {
		for (var strIndex = 8; strIndex < this.sizesArray.length; strIndex++)	{
			this.createStrLabel(view, strIndex, this.sizesArray[strIndex]);
		}
	}

	var elapsed = new Date().getTime() - start;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\ncreateCenterView: ' + elapsed;
	}
	
	return view;
};

ItemRegistration.prototype.createStrLabel = function(parentView, strIndex, strText) {
	var labelStr = Ti.UI.createLabel({color: 'black', top: 10, height: 20, width: 73, font: {fontSize : 14, fontWeight : 'bold'}, textAlign: 'center', text: Conversion.trim(strText)});
	if (strIndex > 7) {
		labelStr.left = 234 + ((strIndex - 8) * 97);
	} else {
		labelStr.left = 234 + (strIndex * 97);
	}
	parentView.add(labelStr);
};

ItemRegistration.prototype.createBottomView = function(response, parentView) {
	var start = new Date().getTime();
	var firstPageView = Ti.UI.createView({});

	this.createCenterView(response, firstPageView, 0);
	
	var firstScrollView = Ti.UI.createScrollView({contentHeight: 'auto', layout: 'vertical', showVerticalScrollIndicator: true, bottom: 8, page: 0, x: -1, y: -1});
	firstScrollView.top = 28; //firstPageView.getChildren()[0].height + 8;
	firstPageView.add(firstScrollView);
	
	var firstScrollViewContent = Titanium.UI.createView({layout: 'vertical', height: Ti.UI.SIZE});
	firstScrollView.add(firstScrollViewContent);
	var start2 = new Date().getTime();
	for (var i = 0; i < this.colorsArray.length; i++) {
		this.addRow(response, firstScrollViewContent, 0, i);
	}
	var elapsed2 = new Date().getTime() - start2;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\nAdding rows: ' + elapsed2;
	}
	
	if (this.sizesArray.length > 8) {
//		var secondPageView = Titanium.UI.createView({left: 8, right: 8, bottom: 4, backgroundImage: '/images/textile/keyboard_bg_tile.png'});
		var secondPageView = Titanium.UI.createView({});
		this.createCenterView(response, secondPageView, 1);

		var secondScrollView = Titanium.UI.createScrollView({contentHeight: 'auto', layout: 'vertical', showVerticalScrollIndicator: true, bottom: 8, page: 1, x: -1, y: -1});
		secondScrollView.top = 28; //secondScrollView.top = secondPageView.getChildren()[0].height + 8;
		secondPageView.add(secondScrollView);

		var scrollableView = Titanium.UI.createScrollableView({pagingControlAlpha: 0.6, pagingControlHeight: 20, pagingControlColor: 'black', showPagingControl: true, top: 255, views:[firstPageView, secondPageView], currentPage: 0});
		scrollableView.top = 298;
		parentView.add(scrollableView);
	
		var secondScrollViewContent = Titanium.UI.createView({layout: 'vertical', height: Ti.UI.SIZE});
		secondScrollView.add(secondScrollViewContent);
		var start2 = new Date().getTime();
		for (var i = 0; i < this.colorsArray.length; i++) {
			this.addRow(response, secondScrollViewContent, 1, i);
		}
		var elapsed2 = new Date().getTime() - start2;
		if (this.debug) {
			this.textArea.value = this.textArea.value + '\nAdding rows: ' + elapsed2;
		}
		
		var that = this;
		
		scrollableView.addEventListener('touchstart', function(e) {
			if (scrollableView.currentPage === 0) {
				if (firstScrollView.y > -1) {
					secondScrollView.scrollTo(firstScrollView.x, firstScrollView.y);
				}
			} else if (scrollableView.currentPage === 1) {
				if (secondScrollView.y > -1) {
					firstScrollView.scrollTo(secondScrollView.x, secondScrollView.y);
				}
			}
			firstScrollView.x = -1;
			firstScrollView.y = -1;
			secondScrollView.x = -1;
			secondScrollView.y = -1;
		});
		scrollableView.addEventListener('scroll', function(e) {
			if (e.source === scrollableView) {
				if (scrollableView.currentPage === 0) {
					if (secondScrollView.y > -1) {
						firstScrollView.scrollTo(secondScrollView.x, secondScrollView.y);
						firstScrollView.x = secondScrollView.x;
						firstScrollView.y = secondScrollView.y;
					}
				} else if (scrollableView.currentPage === 1) {
					if (firstScrollView.y > -1) {
						secondScrollView.scrollTo(firstScrollView.x, firstScrollView.y);
						secondScrollView.x = firstScrollView.x;
						secondScrollView.y = firstScrollView.y;
					}
				}
			} else {
				if (scrollableView.currentPage === 0) {
					firstScrollView.x = e.x;
					firstScrollView.y = e.y;
				} else if (scrollableView.currentPage === 1) {
					secondScrollView.x = e.x;
					secondScrollView.y = e.y;
				}
			}
		});
	} else {
		firstPageView.top = 298;//255;
		parentView.add(firstPageView);
	}

	var elapsed = new Date().getTime() - start;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\ncreateBottomView: ' + elapsed;
	}
};

ItemRegistration.prototype.addRow = function(response, scrollViewContent, scrollViewIndex, farveIndex) {
	var startTime = new Date().getTime();
	var viewRow = Ti.UI.createView({height: 54});
	this.rowViewsByColor.setItem(this.colorsArray[farveIndex].colors + '_' + Conversion.toString(scrollViewIndex), viewRow);
	scrollViewContent.add(viewRow);
	
	var that = this;
	var viewColor;
	if (this.colorsArray[farveIndex].colorpictthumbs && this.colorsArray[farveIndex].colorpictthumbs !== '') {
//		viewColor = Ti.UI.createView({width: 30, height: 30, left: 27, top: 11});
		viewColor = Ti.UI.createView({width: 40, height: 40, left: 28, top: 8});
		viewColor.backgroundColor = 'ffffff';
//		imageViewColor = Ti.UI.createImageView({width: 30, left: 0});
		imageViewColor = Ti.UI.createImageView({width: 30});
		viewColor.add(imageViewColor);
		imageViewColor.image = this.colorsArray[farveIndex].colorpictthumbs;
		// imageViewColor.addEventListener('click', function(ev) {
			// if (that.colorsArray[farveIndex].colorpictimgs && that.colorsArray[farveIndex].colorpictimgs != '') {
	        	// that.itemImage.image = that.colorsArray[farveIndex].colorpictimgs;
	        // }
		// });
		viewRow.add(viewColor);
	} else if (this.colorsArray[farveIndex].rgbs && this.colorsArray[farveIndex].rgbs !== '') {
		// viewColor = Ti.UI.createView({width: 28, height: 28, left: 28, top: 12});
		viewColor = Ti.UI.createView({width: 40, height: 40, left: 28, top: 8});
		viewColor.backgroundColor = this.colorsArray[farveIndex].rgbs;
		viewRow.add(viewColor);
	} else {
		// viewColor = Ti.UI.createView({width: 28, height: 28, left: 28, top: 12});
		viewColor = Ti.UI.createView({width: 40, height: 40, left: 26, top: 6});
		viewColor.backgroundImage = '/images/textile/no_color_code.png';
		viewRow.add(viewColor);
	}

	var viewColorOverlay = Ti.UI.createView({id: 'textile_itemregistration_color_overlay_closed_view', width: 183, height: 54, top: 0, left: 20, backgroundImage: 'images/textile/colour_index.png'});
	if (this.hideSizes) {
		viewColorOverlay.backgroundImage = 'images/textile/colour_index_nosizes.png';
	}
	viewRow.add(viewColorOverlay);

	var viewColorOverlayOpen = Ti.UI.createView({id: 'textile_itemregistration_color_overlay_opened_view', width: 183, height: 54, top: 0, left: 20, backgroundImage: 'images/textile/colour_index_open.png'});
	viewColorOverlayOpen.visible = isShowDelivery();
	if (this.hideSizes) {
		viewColorOverlayOpen.backgroundImage = 'images/textile/colour_index_open_nosizes.png';
	}
	viewRow.add(viewColorOverlayOpen);
	this.colorOverlayViews.push(viewColorOverlayOpen);
	
	viewColorOverlay.addEventListener('click', function(ev) {

		if (that.colorsArray[farveIndex].colorpictimgs && that.colorsArray[farveIndex].colorpictimgs != '') {
			that.itemImage.image = that.colorsArray[farveIndex].colorpictimgs;
		} else if (that.itemImage.orgImage && that.itemImage.image != that.itemImage.orgImage) {
			that.itemImage.image = that.itemImage.orgImage;
		}
		
		if (ev.x < 50) {
			return;
		}

		var colorPopover = that.getColorPopover(farveIndex, ev);
		colorPopover.show({
			view : viewColorOverlay,
			animated : true
		});
	});
	viewColorOverlayOpen.addEventListener('click', function(ev) {
		if (that.colorsArray[farveIndex].colorpictimgs && that.colorsArray[farveIndex].colorpictimgs != '') {
        	that.itemImage.image = that.colorsArray[farveIndex].colorpictimgs;
		} else if (that.itemImage.orgImage && that.itemImage.image != that.itemImage.orgImage) {
			that.itemImage.image = that.itemImage.orgImage;
		}
		if (ev.x < 50) {
			return;
		}
		var colorPopover = that.getColorPopover(farveIndex, ev);
		colorPopover.show({
			view : viewColorOverlayOpen,
			animated : true
		});
	});

	var labelFarve = Titanium.UI.createLabel({color: '#f2f2f2', font:{fontSize : 14, fontWeight : 'bold'}, top: 10, left: 60, height: 20, width: 125, textAlign: 'center', text: this.colorsArray[farveIndex].colortexts, touchEnabled: false});
	labelFarve.farveIndex = farveIndex;
	viewRow.add(labelFarve);

	var labelSummaryQuantity = Titanium.UI.createLabel({color: '#b3b3b3', font:{fontSize : 14, fontWeight : 'bold'}, top: 27, left: 60, height: 20, width: 125, textAlign: 'center', touchEnabled: false});
	viewRow.add(labelSummaryQuantity);
	this.summaryQuantityLabels.push(labelSummaryQuantity);

	if (!this.hideSizes) {
		var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#232323', left: 203, width: 31}); // GPS - #0f5595 
		viewRow.add(viewLine);
		
		if (scrollViewIndex == 0) {
			for (var strIndex = 0; strIndex < this.sizesArray.length && strIndex < 8; strIndex++)	{
				this.addCountEntry(response, viewRow, farveIndex, strIndex, strIndex < this.sizesArray.length - 1 && strIndex < 7);
			}
		} else {
			for (var strIndex = 8; strIndex < this.sizesArray.length; strIndex++)	{
				this.addCountEntry(response, viewRow, farveIndex, strIndex, strIndex < this.sizesArray.length - 1);
			}
		}
	}

	var viewDetailRow = Ti.UI.createView({height: 0, visible: false});
	viewDetailRow.sizesHidden = this.hideSizes;

	var viewDeliveryOverlay = Ti.UI.createView({id: 'textile_itemregistration_delivery_overlay_view', width: 183, height: 38, top: 0, left: 20, backgroundImage: 'images/textile/delivery_status_bg_left.png'});
	if (this.hideSizes) {
		viewDeliveryOverlay.backgroundImage = 'images/textile/delivery_status_bg_left_nosizes.png';
	}
	viewDetailRow.add(viewDeliveryOverlay);
	
	if (scrollViewIndex == 0) {
		var fieldPris = Titanium.UI.createTextField({fieldtype: 'numeric', top: 4, height: 28, left: 17, width: 58, font:{fontSize : 14, fontWeight : 'bold'}, textAlign: 'center', hintText: this.response.price_header, keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD, borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED});
		if (this.colorsArray[farveIndex].prices) {
			fieldPris.value = Strings.fromNumber(Strings.toNumber(this.colorsArray[farveIndex].prices), 2);
		}
		fieldPris.visible = response.pricecolor_show;
		fieldPris.editable = response.pricecolor_edit;
		this.priceFields.setItem(Conversion.toString(farveIndex), fieldPris);
		viewDeliveryOverlay.add(fieldPris);
		var fieldLevering = Titanium.UI.createTextField({fieldtype: 'numeric', top: 4, height: 28, left: 92, width: 74, font:{fontSize : 14, fontWeight : 'bold'}, textAlign: 'center', hintText: this.response.delivery_header, keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD, borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED});
		if (this.colorsArray[farveIndex].deliverys) {
			fieldLevering.value = this.colorsArray[farveIndex].deliverys;
		}
		fieldLevering.visible = response.deliverycolor_show;
		fieldLevering.editable = response.deliverycolor_edit;
		this.deliveryFields.setItem(Conversion.toString(farveIndex), fieldLevering);
		viewDeliveryOverlay.add(fieldLevering);
	}

	var viewDeliveries = Ti.UI.createView({id: 'textile_itemregistration_deliveries', touchEnabled: false});
	// viewDeliveries.height = 38;
	// viewDeliveries.top = 0;
	// viewDeliveries.left = 203;
	// viewDeliveries.width = 884;
	// if (pageSizes < 8) {
		// viewDeliveries.width = (pageSizes * 96) + 96;
	// } else {
		// viewDeliveries.width = (8 * 96) + 96;
	// }
	var start = 0;
	var end = this.sizesArray.length;
	if (scrollViewIndex == 0) {
		if (this.sizesArray.length > 8) {
			end = 8;
		}
	} else {
		end = this.sizesArray.length - 8;
	}
	for (var strIndex = start; strIndex < end; strIndex++)	{
		var viewSizeDeliveryOverlay = Ti.UI.createView({width: 96, height: 38, top: 0, color: '#fff', backgroundImage: 'images/textile/delivery_status_bg_arrowed.png'});
		viewSizeDeliveryOverlay.left = 203 + (strIndex * 96);
		// viewSizeDeliveryOverlay.left = (strIndex * 96);
//		viewDetailRow.add(viewSizeDeliveryOverlay);
		viewDeliveries.add(viewSizeDeliveryOverlay);
	}
	var viewDeliveryEndOverlay = Ti.UI.createView({width: 17, height: 38, top: 0, backgroundImage: 'images/textile/delivery_status_bg_right.png'});
	pageSizes = this.sizesArray.length;
	if (scrollViewIndex === 1) {
		pageSizes -= 8;
	}
	if (pageSizes < 8) {
		viewDeliveryEndOverlay.left = 203 + (pageSizes * 96);
		// viewDeliveryEndOverlay.left = (pageSizes * 96);
	} else {
		viewDeliveryEndOverlay.left = 203 + (8 * 96);
		// viewDeliveryEndOverlay.left = (8 * 96);
	}
//	viewDetailRow.add(viewDeliveryEndOverlay);
	viewDeliveries.add(viewDeliveryEndOverlay);
	if (this.hideSizes) {
		viewDeliveries.visible = false;
	}
	viewDetailRow.add(viewDeliveries);

	if (isShowDelivery()) {
		viewDetailRow.visible = true;
		viewDetailRow.height = 40;
	}

	scrollViewContent.add(viewDetailRow);
	this.rowViews.push(scrollViewContent);
	this.detailViews.push(viewDetailRow);
	this.detailViewsByColor.setItem(this.colorsArray[farveIndex].colors + '_' + Conversion.toString(scrollViewIndex), viewDetailRow);
	
	var viewSpace = Ti.UI.createView({
		height: 5
	});
	scrollViewContent.add(viewSpace);

	var elapsed = new Date().getTime() - startTime;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\naddRow: ' + elapsed;
	}
};

ItemRegistration.prototype.getColorPopover = function(colorIndex, ev) {
	if (!this.colorPopover) {
		this.colorPopover = Ti.UI.iPad.createPopover({
			id : 'textile_itemregistration_color_popover',
			arrowDirection : Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN,
			navBarHidden : true,
			//height: 130,
			//width: 220
		});
		// if (this.hideSizes) {
			// this.colorPopover.height = 190;
		// }
		var view = Ti.UI.createView({
			top: 0,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE,
			layout: 'vertical'
		});
//		this.colorPopover.add(view);
		this.colorPopover.setContentView(view);

		var that = this;
		var buttonCopy = Ti.UI.createButton({
			width: 200, height: 44, top: 10, left: 10, right: 10, backgroundImage: '/images/core/pillbutton.png', backgroundFocusedImage: '/images/core/pillbutton_pressed.png', backgroundSelectedImage: '/images/core/pillbutton_pressed.png',
			name: 'colorCopy',
			title: that.response.button_copy_text
		});
		buttonCopy.addEventListener('click', function(ev) {
			copyQuantities(ev, that, that.colorPopover.colorIndex);
	    });
		view.add(buttonCopy);
		var buttonInsert = Ti.UI.createButton({
			width: 200, height: 44, top: 10, left: 10, right: 10, backgroundImage: '/images/core/pillbutton.png', backgroundFocusedImage: '/images/core/pillbutton_pressed.png', backgroundSelectedImage: '/images/core/pillbutton_pressed.png',
			name: 'colorPaste',
			title: that.response.button_paste_text
		});
		buttonInsert.addEventListener('click', function(ev) {
			insertQuantities(ev, that, that.colorPopover.colorIndex);
	    });
		view.add(buttonInsert);
		var buttonReset = Ti.UI.createButton({
			width: 200, height: 44, top: 10, left: 10, right: 10, backgroundImage: '/images/core/pillbutton.png', backgroundFocusedImage: '/images/core/pillbutton_pressed.png', backgroundSelectedImage: '/images/core/pillbutton_pressed.png',
			name: 'colorReset',
			title: that.response.button_reset_text
		});
		buttonReset.addEventListener('click', function(ev) {
			resetQuantities(ev, that, that.colorPopover.colorIndex);
	    });
		view.add(buttonReset);
		if (this.hideSizes) {
			var buttonOpen = Ti.UI.createButton({
				width: 200, height: 44, top: 10, bottom: 10, left: 10, right: 10, backgroundImage: '/images/core/pillbutton.png', backgroundFocusedImage: '/images/core/pillbutton_pressed.png', backgroundSelectedImage: '/images/core/pillbutton_pressed.png',
				name: 'colorOpen',
				title: that.response.button_open_text
			});
			buttonOpen.addEventListener('click', function(ev) {
				openQuantities(ev, that, that.colorPopover.colorIndex);
		    });
			view.add(buttonOpen);
		}
	}
	var sizesHidden = this.detailViewsByColor.getItem(this.colorsArray[colorIndex].colors + '_0').sizesHidden;
	this.colorPopover.getContentView().getChildren()[0].visible = !sizesHidden;
	this.colorPopover.getContentView().getChildren()[0].title = this.response.button_copy_text;
	this.colorPopover.getContentView().getChildren()[1].visible = !sizesHidden;
	this.colorPopover.getContentView().getChildren()[1].title = this.response.button_paste_text;
	this.colorPopover.getContentView().getChildren()[2].visible = !sizesHidden;
	this.colorPopover.getContentView().getChildren()[2].title = this.response.button_reset_text;
	if (this.hideSizes) {
		this.colorPopover.getContentView().getChildren()[3].visible = sizesHidden;
		this.colorPopover.getContentView().getChildren()[3].title = this.response.button_open_text;
		this.colorPopover.getContentView().getChildren()[3].height = sizesHidden ? 44: 0;
		this.colorPopover.getContentView().getChildren()[3].bottom = sizesHidden ? 10: 0;
	} 
	if (sizesHidden) {
		//this.colorPopover.height = 30;
		//this.colorPopover.getContentView().height = 30;
		this.colorPopover.getContentView().layout = 'absolute';
	} else {
		//this.colorPopover.height = 140;
		//this.colorPopover.getContentView().height = 140;
		this.colorPopover.getContentView().layout = 'vertical';
	}
	this.colorPopover.colorIndex = colorIndex;
	return this.colorPopover;	
};

function copyQuantities(ev, that, colorIndex) {
	that.copiedQuantities = new Array();
	for (var sizeIndex = 0; sizeIndex < that.sizesArray.length; sizeIndex++) {
		var quantityButton = that.quantityButtonsByColorIndex.getItem(Conversion.toString(colorIndex) + '_' + Conversion.toString(sizeIndex));
    	var quantity = parseInt(quantityButton.title, 10);
    	that.copiedQuantities[sizeIndex] = quantity;
    }
	that.colorPopover.hide();
}

function insertQuantities(ev, that, colorIndex) {
	if (that.copiedQuantities) {
		var quantity = 0;
		for (var sizeIndex = 0; sizeIndex < that.sizesArray.length; sizeIndex++) {
			if (!isNaN(that.copiedQuantities[sizeIndex])) {
				quantity += that.copiedQuantities[sizeIndex];
			}
			setQuantity(that, colorIndex, sizeIndex, that.copiedQuantities[sizeIndex]);
	    }
	    updateSummary(that, colorIndex, quantity);
	}
	that.colorPopover.hide();
}

function resetQuantities(ev, that, colorIndex) {
    var summaryQuantityLabel = that.summaryQuantityLabels[colorIndex];
	for (var sizeIndex = 0; sizeIndex < that.sizesArray.length; sizeIndex++) {
		setQuantity(that, colorIndex, sizeIndex, 0);
	}
	updateSummary(that, colorIndex, 0);
	that.colorPopover.hide();
}

function openQuantities(ev, that, colorIndex) {
	var viewDetailRow = that.detailViewsByColor.getItem(that.colorsArray[colorIndex].colors + '_0');
	viewDetailRow.sizesHidden = false;

	var viewRow = that.rowViewsByColor.getItem(that.colorsArray[colorIndex].colors + '_0');
	getChildById(viewRow, 'textile_itemregistration_color_overlay_closed_view').backgroundImage = 'images/textile/colour_index.png';
	getChildById(viewRow, 'textile_itemregistration_color_overlay_opened_view').backgroundImage = 'images/textile/colour_index_open.png';
	getChildById(viewDetailRow, 'textile_itemregistration_delivery_overlay_view').backgroundImage = 'images/textile/delivery_status_bg_left.png';
	getChildById(viewDetailRow, 'textile_itemregistration_deliveries').visible = true;
	getChildById(viewDetailRow, 'textile_itemregistration_deliveries').touchEnabled = false;

//	var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#0f5595', left: 203, width: 31});
	var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#232323', left: 203, width: 31}); // GPS 232323 9c9c9c
	viewRow.add(viewLine);
	
	for (var sizeIndex = 0; sizeIndex < that.sizesArray.length && sizeIndex < 8; sizeIndex++)	{
		that.addCountEntry(that.response, viewRow, colorIndex, sizeIndex, sizeIndex < that.sizesArray.length - 1 && sizeIndex < 7);
	}
	
	if (that.sizesArray.length > 8) {
		viewDetailRow = that.detailViewsByColor.getItem(that.colorsArray[colorIndex].colors + '_1');
		viewDetailRow.sizesHidden = false;
	
		viewRow = that.rowViewsByColor.getItem(that.colorsArray[colorIndex].colors + '_1');
		getChildById(viewRow, 'textile_itemregistration_color_overlay_closed_view').backgroundImage = 'images/textile/colour_index.png';
		getChildById(viewRow, 'textile_itemregistration_color_overlay_opened_view').backgroundImage = 'images/textile/colour_index_open.png';
		getChildById(viewDetailRow, 'textile_itemregistration_delivery_overlay_view').backgroundImage = 'images/textile/delivery_status_bg_left.png';
		getChildById(viewDetailRow, 'textile_itemregistration_deliveries').visible = true;
		getChildById(viewDetailRow, 'textile_itemregistration_deliveries').touchEnabled = false;
	
//		var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#0f5595', left: 203, width: 31});
		var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#232323', left: 203, width: 31}); // GPS
		viewRow.add(viewLine);
		
		for (var sizeIndex = 8; sizeIndex < that.sizesArray.length; sizeIndex++)	{
			that.addCountEntry(that.response, viewRow, colorIndex, sizeIndex, sizeIndex < that.sizesArray.length - 1);
		}
	}

	if (!that.deliverysRetrieved) {
		that.getDeliverys(ev.source);
	}

	that.colorPopover.hide();
}

ItemRegistration.prototype.addCountEntry = function(response, viewRow, farveIndex, strIndex, createLine) {
	var sizeInvalidKeyword = '';
	if (typeof response.sizes === 'string') {
		sizeInvalidKeyword = 'sizeinvalid_' + response.grpitemcolors[farveIndex].colors + '_' + response.sizes.trim().toLowerCase();
	} else {
		sizeInvalidKeyword = 'sizeinvalid_' + response.grpitemcolors[farveIndex].colors + '_' + response.sizes[strIndex].trim().toLowerCase();
	}

	if (response[sizeInvalidKeyword]) {
		var left = 0;
		if (strIndex > 7) {
			left = 234 + ((strIndex - 8) * 97);
		} else {
			left = 234 + (strIndex * 97);
		}
		var width = 69;
		if (createLine) {
			width = width + 28;
		}
		var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#232323', left: left, width: width}); // GPS
		viewRow.add(viewLine);
		return;
	}

	var start = new Date().getTime();

	var buttonAntal = Ti.UI.createButton({
		width : 73,
		height : 51,
		top : 5,
		selectedColor: 'black',
		backgroundImage : 'images/textile/textile_custom_button.png',
		backgroundFocusedImage : 'images/textile/textile_custom_button_pressed.png',
		backgroundSelectedImage : 'images/textile/textile_custom_button_pressed.png',
		font : {
			fontSize : 20,
			fontWeight : 'bold'
		},
		textAlign : 'center'
	}); 
	
	buttonAntal.quantity = 1;
	var sizeKeyword = '';
	if (typeof response.sizes === 'string') {
		sizeKeyword = 'sizequantity_' + response.grpitemcolors[farveIndex].colors + '_' + response.sizes.trim().toLowerCase();
	} else {
		sizeKeyword = 'sizequantity_' + response.grpitemcolors[farveIndex].colors + '_' + response.sizes[strIndex].trim().toLowerCase();
	}

	if (response[sizeKeyword]) {
		buttonAntal.quantity = parseInt(response[sizeKeyword], 10);
	}
	
	if (strIndex > 7) {
		buttonAntal.left = 234 + ((strIndex - 8) * 97);
	} else {
		buttonAntal.left = 234 + (strIndex * 97);
	}
	this.quantityButtonsByColorIndex.setItem(Conversion.toString(farveIndex) + '_' + Conversion.toString(strIndex), buttonAntal);
	this.quantityButtons.push(buttonAntal);

	var that = this;
	//buttonAntal.that = this;
	// buttonAntal.addEventListener('click', increaseQuantity);
	// buttonAntal.addEventListener('dblclick', function(ev) {
		// Ti.API.trace('button dblclicked');
		// increaseQuantity(ev, that, farveIndex);
	// });
	buttonAntal.addEventListener('click', function(ev) {
		// Ti.API.trace('button clicked');
		if (that.colorsArray[farveIndex].colorpictimgs && that.colorsArray[farveIndex].colorpictimgs != '') {
        	that.itemImage.image = that.colorsArray[farveIndex].colorpictimgs;
		} else if (that.itemImage.orgImage && that.itemImage.image != that.itemImage.orgImage) {
			that.itemImage.image = that.itemImage.orgImage;
        }
		if (that.assortIndex != undefined) {
			for (var sizeIndex = 0; sizeIndex < that.sizesArray.length; sizeIndex++) {
				var assortQuantities = that.assortQuantitiesArray[sizeIndex];
				var quantity = assortQuantities[that.assortIndex];
				if (quantity) {
					var quantityButton = that.quantityButtonsByColorIndex.getItem(Conversion.toString(farveIndex) + '_' + Conversion.toString(sizeIndex));
					increaseQuantity(quantityButton, that, farveIndex, quantity);
				}
			}
		} else {
			increaseQuantity(ev.source, that, farveIndex);
		}
        // var nytAntal = 0;
        // if (buttonAntal.title) {
        	// nytAntal = parseInt(buttonAntal.title) + parseInt(that.buttonQuantity.title);
        // } else {
        	// nytAntal = parseInt(that.buttonQuantity.title);
        // }
        // if (nytAntal < 0) {
        	// nytAntal = 0;
        // }
        // if (nytAntal > 0) {
        	// buttonAntal.title = nytAntal.toString();
        // } else if (nytAntal === 0) {
        	// buttonAntal.title = '';
        // }
		// var summaryQuantityLabel = that.summaryQuantityLabels[farveIndex];
        // if (summaryQuantityLabel.text) {
        	// nytAntal = parseInt(summaryQuantityLabel.text) + parseInt(that.buttonQuantity.title);
        // } else {
        	// nytAntal = parseInt(that.buttonQuantity.title);
        // }
        // if (nytAntal < 0) {
        	// nytAntal = 0;
        // }
        // if (nytAntal > 0) {
        	// summaryQuantityLabel.text = nytAntal.toString();
        // } else {
			// summaryQuantityLabel.text = '';
        // }
        // if (that.sizesArray.length > 8) {
			// summaryQuantityLabel = that.summaryQuantityLabels[farveIndex + that.colorsArray.length];
	        // if (nytAntal > 0) {
	        	// summaryQuantityLabel.text = nytAntal.toString();
	        // } else {
				// summaryQuantityLabel.text = '';
	        // }
        // }
    });
	
	if (this.response.quantitys && this.response.quantitys.length > strIndex) {
		buttonAntal.title = this.response.quantitys[strIndex] * buttonAntal.quantity;
        var quantity = 0;
        var index = farveIndex;
        if (index > this.response.grpitemcolors.length) {
        	index = index  - this.response.grpitemcolors.length;
        }
		var summaryQuantityLabel = this.summaryQuantityLabels[index];
        if (summaryQuantityLabel.text) {
        	quantity = parseInt(summaryQuantityLabel.text, 10) + (parseInt(this.response.quantitys[strIndex]) * buttonAntal.quantity, 10);
        } else {
        	quantity = parseInt(this.response.quantitys[strIndex], 10) * buttonAntal.quantity;
        }
        if (quantity > 0) {
        	summaryQuantityLabel.text = quantity.toString();
        }
	}
	if (strIndex > 7 && this.summaryQuantityLabels[farveIndex+this.colorsArray.length] && this.summaryQuantityLabels[farveIndex].text) {
		this.summaryQuantityLabels[farveIndex+this.colorsArray.length].text = this.summaryQuantityLabels[farveIndex].text;
	}

	viewRow.add(buttonAntal);

	if (createLine) {
//		var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#0f5595', left: buttonAntal.left + 69, width: 28});
		var viewLine = Ti.UI.createView({top: 27, height: 6, backgroundColor: '#232323', left: buttonAntal.left + 69, width: 28}); // GPS
		viewRow.add(viewLine);
	}
	var elapsed = new Date().getTime() - start;
	if (this.debug) {
		this.textArea.value = this.textArea.value + '\naddCountEntry: ' + elapsed;
	}
};

function increaseQuantity(button, that, farveIndex, increase) {
	that.resetQuantity = true;
    var nytAntal = 0;
    if (!increase) {
    	if (that.keyboardQuantityLabel.text == '') {
    		increase = 1;
    	} else {
		    increase = parseInt(that.keyboardQuantityLabel.text, 10);
	   	}
	   	if (increase == 0 && button.title) {
	   		increase = - parseInt(button.title, 10);
	   	}
    }
    var buttonAntal = button;
    if (buttonAntal.title) {
    	nytAntal = parseInt(buttonAntal.title, 10) + (increase * buttonAntal.quantity);
    } else {
    	nytAntal = increase * buttonAntal.quantity;
    }
    if (nytAntal < 0) {
    	nytAntal = 0;
    }
    if (nytAntal > 0) {
    	buttonAntal.title = nytAntal.toString();
    } else if (nytAntal === 0) {
    	buttonAntal.title = '';
    }
	var summaryQuantityLabel = that.summaryQuantityLabels[farveIndex];
    if (summaryQuantityLabel.text) {
    	nytAntal = parseInt(summaryQuantityLabel.text, 10) + (increase  * buttonAntal.quantity);
    } else {
    	nytAntal = increase * buttonAntal.quantity;
    }
    if (nytAntal < 0) {
    	nytAntal = 0;
    }
	var quantityText = '';
    // if (nytAntal > 0) {
    	if (that.stocksByColor) {
    		quantityText = nytAntal.toString() + ' / ' + that.stocksByColor.getItem(farveIndex);
    	} else {
    		quantityText = nytAntal.toString();
    	}
    	if (that.salesByColor && that.salesByColor.getItem(farveIndex) >= 0) {
    		quantityText = quantityText + ' / ' + that.salesByColor.getItem(farveIndex);
    	}
  		summaryQuantityLabel.text = quantityText;
    // } else {
		// summaryQuantityLabel.text = '';
    // }
    if (that.sizesArray.length > 8) {
    	quantityText = "";
		summaryQuantityLabel = that.summaryQuantityLabels[farveIndex + that.colorsArray.length];
        // if (nytAntal > 0) {
	    	if (that.stocksByColor) {
	    		quantityText = nytAntal.toString() + ' / ' + that.stocksByColor.getItem(farveIndex);
	    	} else {
	    		quantityText = nytAntal.toString();
	    	}
	    	if (that.salesByColor && that.salesByColor.getItem(farveIndex) >= 0) {
	    		quantityText = quantityText + ' / ' + that.salesByColor.getItem(farveIndex);
	    	}
  		summaryQuantityLabel.text = quantityText;
        // } else {
			// summaryQuantityLabel.text = '';
        // }
    }
}

function setQuantity(that, colorIndex, sizeIndex, quantity) {
	if (!quantity) {
		quantity = 0;
	}
	var quantityButton = that.quantityButtonsByColorIndex.getItem(Conversion.toString(colorIndex) + '_' + Conversion.toString(sizeIndex));
   	if (quantityButton) {
   		var currentQuantity = parseInt(quantityButton.title, 10);
		if (!currentQuantity) {
			currentQuantity = 0;
		}
	    if (quantity > 0) {
	    	quantityButton.title = quantity.toString();
	    } else if (quantity === 0) {
	    	quantityButton.title = '';
	    }
   	}
}

function updateSummary(that, colorIndex, quantity) {
	var summaryQuantityLabel = that.summaryQuantityLabels[colorIndex];
    // if (summaryQuantityLabel.text) {
    	// quantity = parseInt(summaryQuantityLabel.text, 10) + (quantity - currentQuantity);
    // } else {
    	// quantity = parseInt(that.buttonQuantity.title);
    // }
    if (quantity < 0) {
    	quantity = 0;
    }
    var quantityText = '';
    if (quantity > 0) {
    	if (that.stocksByColor) {
    		quantityText = quantity.toString() + ' / ' + that.stocksByColor.getItem(colorIndex);
    	} else {
    		quantityText = quantity.toString();
    	}
    	if (that.salesByColor && that.salesByColor.getItem(colorIndex) >= 0) {
    		quantityText = quantityText + ' / ' + that.salesByColor.getItem(colorIndex);
    	}
    } else {
		if (that.stocksByColor) {
    		quantityText = '0 / ' + that.stocksByColor.getItem(colorIndex);
	    	if (that.salesByColor && that.salesByColor.getItem(colorIndex) >= 0) {
	    		quantityText = quantityText + ' / ' + that.salesByColor.getItem(colorIndex);
	    	}
    	}
    }
   	summaryQuantityLabel.text = quantityText;
    if (that.sizesArray.length > 8) {
    	quantityText = '';
		summaryQuantityLabel = that.summaryQuantityLabels[colorIndex + that.colorsArray.length];
        if (quantity > 0) {
        	if (that.stocksByColor) {
        		quantityText = quantity.toString() + ' / ' + that.stocksByColor.getItem(colorIndex);
        	} else {
        		quantityText = quantity.toString();
        	}
	    	if (that.salesByColor && that.salesByColor.getItem(colorIndex) >= 0) {
	    		quantityText = quantityText + ' / ' + that.salesByColor.getItem(colorIndex);
	    	}
        } else {
			if (that.stocksByColor) {
	    		quantityText = '0 / ' + that.stocksByColor.getItem(colorIndex);
		    	if (that.salesByColor && that.salesByColor.getItem(colorIndex) >= 0) {
		    		quantityText = quantityText + ' / ' + that.salesByColor.getItem(colorIndex);
		    	}
			}
        }
        summaryQuantityLabel.text = quantityText;
    }
}

ItemRegistration.prototype.toggleDeliverySituation = function(buttonDeliverySituation) {
	if (buttonDeliverySituation) {
		if (isShowDelivery()) {
			buttonDeliverySituation.title = buttonDeliverySituation.hideTitle;
		} else  {
			buttonDeliverySituation.title = buttonDeliverySituation.showTitle;
		}
		if (buttonDeliverySituation.updateButton) {
			buttonDeliverySituation.updateButton.enabled = isShowDelivery();
		}
	}

	for (var i = 0; i < this.detailViews.length; i++) {
		if (isShowDelivery()) {
			this.detailViews[i].height = 40;
			this.rowViews[i].height = Ti.UI.SIZE;
			this.detailViews[i].show();
			this.colorOverlayViews[i].show();
		} else {
			this.detailViews[i].hide();
			this.colorOverlayViews[i].hide();
			this.detailViews[i].height = 0;
		}
	}
};

function setShowDelivery(showDelivery) {
	Ti.App.Properties.setBool("ItemRegistration_ShowDelivery", showDelivery);
}

function isShowDelivery() {
	return Ti.App.Properties.getBool("ItemRegistration_ShowDelivery", false);	
}

function getChildById(element, id) {
	var children = element.getChildren();
	for (var i = 0; i < children.length; i++) {
		if (children[i].id == id) {
			return children[i];
		}
	}
}

module.exports = ItemRegistration;
