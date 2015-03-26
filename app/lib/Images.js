var Conversion = require('tools/Conversion');
/*
 * Purpose: ICON ALIASES
 *
 * This first version of an ALIAS implementation is focused on breaking
 * the hard connection between images, and allow a more flexible styling of the interface in future versions
 *
 * PRIVATE ALIASES - CORE
 * Should never be used only crosspad client internal usage and are never published
 *
 */

var debug = false;
var Log = require('tools/Log');

var core = {
	// PRIVATE - DASHBOARD
	DASHBOARD_TILE : 'dashboard/dashboard_tile.png',
	DASHBOARD_TILE_PRESSED : 'dashboard/dashboard_tile_pressed.png',
	DASHBOARD_TILE_DISABLED : 'dashboard/dashboard_tile_disabled.png',
	PHONE_TILE : 'dashboard/phone_tile.png',
	PHONE_TILE_PRESSED : 'dashboard/phone_tile_pressed.png',
	PHONE_TILE_DISABLED : 'dashboard/phone_tile_disabled.png',
	BUSY_TILE : 'dashboard/busy_tile.png',

	BACK : 'back.png',
	FORWARD : 'forward.png',
	PIN_FORWARD : 'pin_forward.png',

	// ICONS
	EXPANDED : 'expanded.png',
	COLLAPSED : 'collapsed.png',
	DATEPICKER : 'datepicker.png',
	TIMEPICKER : 'timepicker.png',
	STANDARDPICKER : 'standardpicker.png',
	PHOTO_MISSING : 'photomissing.png',
	ARROW_RIGHT : 'android_arrow_right.png',

	DELETE_SELECTED : 'selected.png',
	DELETE_UNSELECTED : 'unselected.png',

	NO_PHOTO_ID : 'no_photo_id.png'
};

// 40x40 - 80x80
var option = {
	MAIL : 'mail.png',
	MAP : 'globe.png',
	INFORMATION : 'info.png',
	SHOPPING_CART : 'shopping_cart.png',
	SHOW_DIAGRAM : 'barchart.png',
	CHANGE_SEQUENCE : 'change_sequence.png',
	DRILL_DATA : 'drill_data_model.png',
	DEFAULT : 'default_icon.png'
};

// 30x30 - 60x60
var tabbar = {
	ASPECT4_USER : 'aspect4_user.png',
	// Activity stream
	ACTIVITY_STREAM : 'activity_stream.png',
	ALL_POSTS : 'all_posts.png',
	USER_POSTS : 'user_posts.png',
	AUTO_POSTS : 'auto_posts.png',
	ADVANCED : 'advanced.png',
	BASIC : 'basic.png',
	BOOK : 'book.png',
	CALCULATOR : 'calculator.png',
	CALENDAR_MONTH : 'calendar_month.png',
	CALENDAR : 'calendar.png',
	DEFAULT : 'default_icon.png',
	DOCUMENTS : 'document.png',
	DOWNLOADS : 'downloads.png',

	// Øko
	COUNTRY : 'globe.png',
	DISTRICT : 'district.png',
	SELLER : 'seller.png',
	BUYER : 'buyer.png',

	CUSTOMER : 'customer.png',
	SELLER : 'seller.png',
	BUYER : 'buyer.png',
	SUPPLIER : 'supplier.png',

	CUSTOMER_SUPLIER_GROUP : 'customer_supplier_grp.png',
	ALTERNATIVE_GROUP : 'alternative_grp.png',
	// ALt

	// Bente
	USERS_WITH_PHOTO_ID : 'users_with_photo_id.png',
	USERS_NO_PHOTO_ID : 'users_no_photo_id.png',
	All_USERS : 'all_users.png',

	FAVORITE : 'favorite.png',
	GLOBE : 'globe.png',
	GROUP : 'group.png',
	HISTORY : 'history',
	HELP : 'help.png',
	IDS : 'ids.png',
	KEY : 'key.png',
	LOCKED : 'lock_open.png',
	LINKS : 'links.png',
	// UNLOCKED : 'lock_closed.png',
	MESSAGE : 'message.png',
	NETWORK : 'network.png',
	INFO : 'info.png',
	INVENTORY : 'inventory.png',
	SETTINGS : 'settings.png',
	SIGNATURE : 'signature.png',
	STATS : 'stats.png',
	STATS_LINE : 'stats_line.png',
	TIME : 'time.png',
	USERS : 'users.png',
	WEB_USER : 'web_user.png',
	WORKFLOW : 'workflow.png',
	DEFAULT : 'default_icon.png'
};

// 20x20 - 40x40
var floatoption = {
	COMMENT : 'comment.png',
	COMMENT_ACTIVE : 'comment.png',

	FAVORITE : 'favorite.png',
	FAVORITE_ACTIVE : 'favorite_active.png',

	FOLLOW : 'follow.png',
	FOLLOW_ACTIVE : 'follow_active.png',

	NOTIFICATION : 'notification.png',
	NOTIFICATION_ACTIVE : 'notification_active.png',

	LIKE : 'like.png',
	LIKE_ACTIVE : 'like_active.png',

	LINKS : 'links.png',
	LINKS_ACTIVE : 'links.png',

	// Social Bookmarks
	FACEBOOK : 'facebook.png',
	DROPBOX : 'dropbox.png',
	YOUTUBE : 'youtube.png',
	SKYPE : 'skype.png',
	LINKEDIN : 'linkedin.png',
	WEB : 'world.png',
	SHARE : 'share.png',
	ZOOM : 'zoom.png',
	WATCH : 'watch.png',
	LOCATION : 'location.png',

	DEFAULT : 'default_icon.png'
};

// 96x96 og 192x192
var dashboard = {
	ADD_CUSTOMER : 'addcustomer.png',
	ADDCUSTOMER : 'addcustomer.png',
	BARCODE : 'barcode.png',
	BUDGET : 'budget.png',
	CALENDAR : 'calendar.png',
	CAMERA : 'camera.png',
	COLLECTION : 'collection.png',
	COORDINATES : 'coordinates.png',
	COPYORDER : 'copyorder.png',

//	DEFAULT_ICON : 'default_icon.png',
	DEFAULT : 'default_icon.png',

	FAVORITE : 'favorite.png',
	HISTORY : 'history.png',
	HOME : 'home.png',
	INVENTORY : 'inventory.png',
	LIST : 'list.png',
	MAIL : 'mail.png',
	MESSAGE : 'message.png',
	ORDER : 'order.png',
	PDF_CATALOG : 'pdf_catalog.png',
	PRINT : 'print.png',
	QA : 'qa.png',
	QUERY : 'query.png',
	NEWSFEEDS : 'rss.png',
	STATS : 'stats.png',
	STOCK_QUERY : 'stock_query.png',
	STOCK : 'stock.png',
	SYSMSG : 'sysmsg.png',
	TIME : 'time.png',
	TRAVEL : 'travel.png',
	TRUCK : 'truck.png',
	TRUCK_DELIVERY : 'delivery.png',
	USERS : 'users.png',
	VISIT_PLAN : 'visitplan.png',
	VISITPLAN : 'visitplan.png',
	WORKFLOW : 'workflow.png',
	DEVELOPER : 'developer.png',
	TUTORIAL : 'collection.png',
	ALIAS : 'list.png',
	SUPPLIER : 'supplier.png',
	PAYMENT : 'credit_card2.png',
	PRODUCT_INFO : 'product_info.png',
	PRODUCT_PRICE : 'product_price.png',
	PRODUCT_SUPPLIER_INFO : 'product_supplier_info.png',
	PRODUCT_IN_STOCK : 'product_stock.png',
	PRODUCT_OUT_OF_STOCK : 'product_stock.png',
	PRODUCT_STOCK : 'product_stock.png',
	PRODUCT_SEARCH : 'product_search.png',
	PURCHASE_ORDER : 'purchase_order.png',
	WAREHOUSE : 'warehouse.png',

	// SOF - Logistics
	EXTERNAL_JOB : 'ext_job.png',
	EXTERNAL_JOB_FEEDBACK : 'ext_job_feedback.png',
	EXTERNAL_TOTAL_JOB_FEEDBACK : 'ext_total_job_feedback.png',

	INTERNAL_JOB : 'int_job.png',
	INTERNAL_JOB_FEEDBACK : 'int_job_feedback.png',
	INTERNAL_TOTAL_JOB_FEEDBACK : 'int_total_job_feedback.png',

	PICK_SHIPMENT : 'pick_shipment.png',
	PLANNED_MOVE : 'planned_move.png',
	MOVE_SUPPLY : 'move_supply.png',
	COUNTING : 'counting.png',
	PROD_JOB_OVERVIEW : 'prod_job_overview.png',
	ORDER_REGISTRATION : 'order_registration.png',

	// Okø - Logistik
	APPROVAL : 'approval.png',
	CUSTOMER_ENQUIRY : 'customer_enquiry.png',
	SUPPLIER_ENQUIRY : 'supplier_enquiry.png',

	CUSTOMER : 'customer.png',
	SELLER : 'seller.png',
	BUYER : 'buyer.png',
	SUPPLIER : 'supplier.png',

	// Bente
	PASSWORD : 'password.png',
	USERS_ACTIVE : 'users_active.png',
	PHOTO_ID : 'photo_id.png',
	OPERATIONS_MANAGEMENT : 'eyeball.png',

	// A4 Day 2013
	AGENDA : 'agenda.png',
	ATTENDESS_AGENDA : 'attendees_agenda.png',
	SPONSORS : 'sponsors.png',
	SPEAKERS : 'speakers.png',
	VENUE : 'venue.png',
	LOCATION : 'venue.png',
	FEEDBACK : 'feedback.png',
	MATERIAL : 'material.png',

	ACTIVITY_STREAM : 'activity_stream.png',
};

// 20x20 - 40x40
var toolbar = {

	// System buttons on IOS images/text on Andrdoid
	ACTION : 'action.png', // Default ACTION icon on IOS, on Android text Actions/Handlinger
	ADD : 'add.png', // Default ADD icon on IOS
	// BOOKMARKS: '', // Default BOOKMARKS icon on IOS
	CAMERA : 'camera.png', // Default CAMERA icon on IOS
	CANCEL : '', // Default CANCEL on IOS and text Cancel/Annuller on both
	COMPOSE : 'compose.png', // Default COMPONSE icon on IOS
	CONTACT_ADD : 'add.png', // Default CONTACT_ADD icon on IOS
	DISCLOSURE : 'info.png', // Default DISCLOSURE icon on IOS
	DONE : '', // Default DONE on IOS and text Done/OK on both
	EDIT : 'edit.png', // Default EDIT on IOS text Edit/Rediger on both
	// FAST_FORWARD
	INFO : 'info.png', // Default INFO_LIGHT icon on IOS
	// ORGANIZE
	// PAUSE
	// PLAY
	REFRESH : 'refresh.png', // Default REFRESH icon on IOS
	// REPLY
	// REWIND
	SAVE : '', // Default SAVE on IOS text Save/Gem on both
	SEARCH : 'search.png', // Default SEARCH on IOS
	STOP : 'close.png',
	TRASH : 'trash.png', // Default TRASH icon on IOS

	// Other Icons
	BACK : 'back.png',
	BILL : 'bill.png',
	COPY : 'copy.png',
	CHECK : 'checkmark.png',
	FORWARD : 'forward.png',
	DRILL_DATA : 'drill_data_model.png',
	SHOW_DIAGRAM : 'barchart.png',
	ARCHIVE : 'finans_archive.png',
	CALENDAR : 'calendar.png',
	FILTER : 'filter.png',
	FINANS_ENTRY : 'finans_entry.png',
	WALL : 'wall.png',
	LOCKED : 'lock_closed.png',
	MONEY : 'money.png',
	PROPERTIES : 'gear.png',
	PERIODE : 'time.png',
	SETTINGS : 'gear.png',
	TRAVEL : 'waypoint.png',
	UNLOCKED : 'lock_open.png',
	SCAN : 'barcode.png',

	MAP : 'map.png',
	LIST : 'list.png',

	// Textile
	CUSTOMER_VISIT_PLANNED : 'calendar.png',
	PLANNING_CUSTOMER_VISIT : 'calendar.png',

	ACCEPT : 'workflow_accept.png',
	CHANGE_APPROVER : 'change_approver.png',

	// Workflow
	WORKFLOW_CANCEL : 'workflow_cancel.png',
	WORKFLOW_ACCEPT : 'workflow_accept.png',
	// Øko
	ORDER : 'order.png',
	RUTE : 'rute.png',
	LOCATION : 'location.png',
	MISC_TEXT : 'misc_text.png',
	MAP_COORDINATES : 'map_coordinates.png',
	// Internal
	DEFAULT : 'default_icon.png'
};
var navigator = {
	SERVER_SETTINGS : 'radio.png',
	SETTINGS : 'settings.png',
	STEPPINGSTONE_LINKS : 'steppingstone_link.png',
	INFOBOARDS : 'infographic.png',
	INFO : 'info.png'
};

var map = {
	DEFAULT : 'default_icon.png'
};

var mappin = {
	EGPIN : 'egpin.png',
	DEFAULT : 'default_icon.png'
};

// 20x20 - 40x40 - 80x80 - 160x160
var list = {
	
	PUSH_NOTIFICATION: 'pushnotification.png',
	SUPPLIER: 'supplier.png',
	CUSTOMER: 'customer.png',
	CONSOLE_MSG:'console_msg.png',
	SYSTEM_MSG:'system_msg.png',
	ABOUT_ASPECT4:'about_aspect4.png',
	CHECKED: 'checked.png',
	UNCHECKED:'unchecked.png',
	TRUCK: 'truck.png',
	TRUCK_EMPTY:'truck_empty.png',
	TRUCK_DELIVERY:'delivery.png',
	DANGEROUS_GOODS:'dangerous_goods.png',
	PURCHASE_ORDER:'purchase_order.png',
	
	ADD : 'add.png',
	// ARROW_RIGHT : 'android_arrow_right.png',
	ADDRESS_BOOK : 'address_book.png',

	AUTO_POSTS : 'auto_posts.png',
	CLOSE: 'close.png',

	PHONE : 'phone.png',
	EMAIL : 'email.png',
	BANK_ACCOUNT : 'bank.png',
	TAX : 'dk_tax_logo.png',

	CALENDAR : 'calendar.png',
	CHARTS : 'chart.png',
	// TEXTILE BUDGET LIST SEMAPHORS
	CUSTOMER_VISITED_NOTHING_PURCHASED : 'arrow_down_red.png',
	CUSTOMER_VISITED_UNDER_BUDGET : 'arrow_up_red.png',
	CUSTOMER_VISITED_BUDGET_REACHED : 'arrow_up_green.png',
	CUSTOMER_VISIT_PLANNED : 'calendar.png',
	CUSTOMER_NO_BUDGET_SET : 'cross.png',

	CHANGE_SEQUENCE : 'change_sequence.png',

	BUYERS : 'buyers.png',
	CUSTOMERS : 'customers.png',
	SELLERS : 'sellers.png',
	SUPPLIERS : 'suppliers.png',

	DELETE : 'delete.png',
	DOCUMENT : 'doc.png', // Textile

	EDIT : 'edit.png',

	// TEXTILE
	SCANNER : 'scanner.png', // Textile
	LOCKED : 'locked.png',
	LOCATION : 'location.png',
	LOG : 'log.png',

	UNLOCKED : 'unlocked.png',
	MANUAL_INPUT : 'manual_input.png', // Textile
	STOCK : 'stock.png', // Textile
	PLANNING_CUSTOMER_VISIT : 'calendar.png',
	PERIODE : 'time.png',
	FILTER : 'filter.png',
	PROPERTIES : 'gear.png',
	SETTINGS : 'gear.png',
	SERVER_SETTINGS : 'settings.png',
	TRASH : 'trash.png',
	INFO : 'info.png',
	KEY : 'key.png',
	MESSAGE : 'message.png',
	NETWORK : 'network.png',
	NOTIFICATION : 'notification.png',
	SEARCH : 'search.png',
	USERS : 'usergroup.png',
	USER : 'user.png',

	// Transport
	ROUTE_START : 'route_start.png',
	ROUTE_LOAD : 'route_load.png',
	ROUTE_UNLOAD : 'route_unload.png',
	ROUTE_PAUSE : 'route_pause.png',
	ROUTE_TRUCK_CHANGE : 'route_truck_change.png',
	ROUTE_STOP : 'route_stop.png',
	//
	PRODUCT_IN_STOCK : 'product_in_stock.png',
	PRODUCT_OUT_OF_STOCK : 'product_out_of_stock.png',

	// WORKFLOW
	WORKFLOW_ACTIVITY_WORKING : 'workflow_activity_working.png',
	WORKFLOW_ACTIVITY_WAIT : 'workflow_activity_wait.png',
	WORKFLOW_ACTIVITY_INACTIVE : 'workflow_activity_inactive.png',
	WORKFLOW_ACTIVITY_ACTIVE : 'workflow_activity_active.png',

	// WORKFLOW_ACCEPT : 'workflow_accept.png',
	// WORKFLOW_CANCEL : 'workflow_canel.png',

	// BENTE
	JOBS : 'jobs.png',
	JOB_QUE : 'job_que.png',
	CONSOLE_MESSAGES : 'console_messages.png',
	SUBSYSTEM : 'subsystem.png',
	ABOUT_SOFTWARE : 'software.png',
	HARDWARE : 'hardware.png',

	// NO ICON ALIAS FOUND
	DEFAULT : 'default_icon.png',
	NO_ICON_FOUND : 'default_icon.png'
};

exports.getUrlImage = function(alias, type, size, obj, attr) {
	var $ = this;
	var imagePath = $.getImage(alias, type, size);
	if (imagePath !== alias) {
		obj[attr] = imagePath;
		return;
	}

	if (imagePath) {
		imagePath = Conversion.urlEncode(imagePath.toString());
		if (imagePath.substring(0, 4) === 'http') {
			var Cache = require('Cache');
			var cache = new Cache();
			cache.getFile(imagePath, obj, attr);
		} else {
			obj[attr] = imagePath;
		}
	}
};

exports.getImage = function(alias, type, size) {
	if (!alias) {
		return '';
	}
	// Make sure its a String
	alias = alias.toString();

	if (type === 'dashboard') {
		alias = alias.toUpperCase();

		// Check for ASPECT4 default icons like APPL.400.DEFAULT
		if (alias.search('APPL.') === 0) {
			alias = 'DEFAULT';
		}

		// Remove DASHBOARD_ from  alias
		if (alias.search('DASHBOARD_') === 0) {
			alias = alias.substring(10, alias.length);
		}
		
		if (dashboard[alias]) {
			Log.info('ALIAS: ' + alias + ' type: ' + type + ' found', debug);
		} else {
			Log.info('ALIAS: ' + alias + ' type: ' + type + ' not found', debug);
			alias = 'DEFAULT';
		}
		return '/images/icons/dashboard/' + dashboard[alias];
	}

	if (type === 'core') {
		if (!core[alias]) {
			Log.debug('core: No alias found return ' + alias + ' type: ' + type);
			//return '/images/core/no_icon.png';
			return '';
		} else {
			Log.info('core: return ' + core[alias] + ' type: ' + type, debug);
			return '/images/core/' + core[alias];
		}
	}

	// Find an ALIAS of type: list, field
	if (type === 'list' || type === 'field') {
		if (!list[alias]) {
			Log.info('list: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			if (size) {
				Log.info('Size: ' + size, debug);
				return '/images/icons/lists/' + size + '/' + list[alias];
			}
			// Default size SMALL
			return '/images/icons/lists/small/' + list[alias];
		}
	}

	// Find ALIAS map
	if (type === 'map') {
		if (!map[alias]) {
			Log.info('map: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			Log.info('map: Alias found return ' + alias + ' type: ' + type, debug);
			return '/images/icons/map/' + map[alias];
		}
	}

	// Find ALIAS mappin
	if (type === 'mappin') {
		if (!mappin[alias]) {
			Log.info('mappin: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			Log.info('mappin: Alias found return ' + alias + ' type: ' + type, debug);
			return '/images/icons/mappin/' + mappin[alias];
		}
	}

	// Find ALIAS option
	if (type === 'option') {
		if (!option[alias]) {
			Log.info('option: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			Log.info('option: Alias found return ' + alias + ' type: ' + type, debug);
			return '/images/icons/option/' + option[alias];
		}
	}

	// Find ALIAS tab
	if (type === 'tab') {
		if (!tabbar[alias]) {
			Log.info('map: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			Log.info('map: Alias found return ' + alias + ' type: ' + type, debug);
			return '/images/icons/tabbar/' + tabbar[alias];
		}
	}

	// Find ALIAS floatoption
	if (type === 'floatoption') {
		if (!floatoption[alias]) {
			Log.info('map: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			Log.info('map: Alias found return ' + alias + ' type: ' + type, debug);
			return '/images/icons/floatoption/' + floatoption[alias];
		}
	}

	// Find ALIAS toolbar
	if (type === 'toolbar') {
		if (!toolbar[alias]) {
			Log.info('toolbar: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			if (OS_ANDROID) {
				if ('SEARCH' === alias && Ti.Android.R.drawable.ic_menu_search) {
					return Ti.Android.R.drawable.ic_menu_search;
				}
			}
			Log.info('toolbar: Alias found return ' + alias + ' type: ' + type, debug);
			return '/images/icons/toolbar/' + toolbar[alias];
		}
	}
	// Find ALIAS navigator
	if (type === 'navigator') {
		if (!navigator[alias]) {
			Log.info('navigator: No alias found return ' + alias + ' type: ' + type, debug);
			return alias;
		} else {
			Log.info('navigator: Alias found return ' + alias + ' type: ' + type, debug);
			return '/images/icons/navigator/' + navigator[alias];
		}
	}

	if (!type) {
		// Check if alias is found in core...
		if (core[alias]) {
			Log.info('no type: return ' + core[alias] + ' type: ' + type, debug);
			return '/images/core/' + core[alias];
		}

	}

	return alias;
};

exports.setToolbarIcon = function(button, alias, title) {
	if (OS_IOS) {
		if (alias) {
			if (alias === 'ACTION') {
				button.systemButton = Ti.UI.iPhone.SystemButton.ACTION;
				// } else if (alias === 'ACTIVITY') { // Activity spinner
				// button.systemButton = Ti.UI.iPhone.SystemButton.ACTIVITY;
			} else if (alias === 'ADD') {
				button.systemButton = Ti.UI.iPhone.SystemButton.ADD;
			} else if (alias === 'BOOKMARKS') {
				button.systemButton = Ti.UI.iPhone.SystemButton.BOOKMARKS;
			} else if (alias === 'CAMERA') {
				button.systemButton = Ti.UI.iPhone.SystemButton.CAMERA;
			} else if (alias === 'CANCEL') {
				button.style = Ti.UI.iPhone.SystemButtonStyle.PLAIN;
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('cancel_button');
				}
			} else if (alias === 'COMPOSE') {
				button.systemButton = Ti.UI.iPhone.SystemButton.COMPOSE;
			} else if (alias === 'CONTACT_ADD') {
				button.systemButton = Ti.UI.iPhone.SystemButton.CONTACT_ADD;
			} else if (alias === 'DISCLOSURE') {
				button.systemButton = Ti.UI.iPhone.SystemButton.DISCLOSURE;
			} else if (alias === 'DONE') {
				button.style = Ti.UI.iPhone.SystemButtonStyle.DONE;
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('done_button');
				}
			} else if (alias === 'EDIT') {
				button.style = Ti.UI.iPhone.SystemButtonStyle.PLAIN;
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('edit_button');
				}
			} else if (alias === 'FAST_FORWARD') {
				button.systemButton = Ti.UI.iPhone.SystemButton.FAST_FORWARD;
			} else if (alias === 'FIXED_SPACE') {
				button.systemButton = Ti.UI.iPhone.SystemButton.FIXED_SPACE;
			} else if (alias === 'FLEXIBLE_SPACE') {
				button.systemButton = Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE;
			} else if (alias === 'INFO') {
				button.systemButton = Ti.UI.iPhone.SystemButton.INFO_LIGHT;
			} else if (alias === 'ORGANIZE') {
				button.systemButton = Ti.UI.iPhone.SystemButton.ORGANIZE;
			} else if (alias === 'PAUSE') {
				button.systemButton = Ti.UI.iPhone.SystemButton.PAUSE;
			} else if (alias === 'PLAY') {
				button.systemButton = Ti.UI.iPhone.SystemButton.PLAY;
			} else if (alias === 'REFRESH') {
				button.systemButton = Ti.UI.iPhone.SystemButton.REFRESH;
			} else if (alias === 'REPLY') {
				button.systemButton = Ti.UI.iPhone.SystemButton.REPLY;
			} else if (alias === 'REWIND') {
				button.systemButton = Ti.UI.iPhone.SystemButton.REWIND;
			} else if (alias === 'SAVE') {
				button.systemButton = Ti.UI.iPhone.SystemButton.SAVE;
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('save_button');
				}
				//} else if (alias === 'SPINNER') { // Activity spinner
				//	button.systemButton = Ti.UI.iPhone.SystemButton.SPINNER;
			} else if (alias === 'SEARCH') {
				button.systemButton = Ti.UI.iPhone.SystemButton.SEARCH;
			} else if (alias === 'STOP') {
				button.systemButton = Ti.UI.iPhone.SystemButton.STOP;
			} else if (alias === 'TRASH') {
				button.systemButton = Ti.UI.iPhone.SystemButton.TRASH;
			} else {
				//this.getUrlImage(alias, 'toolbar', null, button, 'image', true);
				button.image = this.getImage(alias, 'toolbar');
			}
		} else {
			if (title) {
				button.title = title;
			}
		}
	} else {
		// Android
		if (alias) {
			if (alias === 'CANCEL') {
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('cancel_button');
				}
			} else if (alias === 'DONE') {
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('done_button');
				}
			} else if (alias === 'EDIT') {
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('edit_button');
				}
			} else if (alias === 'SAVE') {
				if (title) {
					button.title = title.toString();
				} else {
					button.title = L('save_button');
				}
			} else {
				//this.getUrlImage(alias, 'toolbar', null, button, 'image', true);
				button.image = this.getImage(alias, 'toolbar');
			}
		} else {
			if (title) {
				button.title = title;
			}
		}
	}
};

/*
 Developed by Kevin L. Hopkins (http://kevin.h-pk-ns.com)
 You may borrow, steal, use this in any way you feel necessary but please
 leave attribution to me as the source.  If you feel especially grateful,
 give me a linkback from your blog, a shoutout @Devneck on Twitter, or
 my company profile @ http://wearefound.com.

 /* Expects parameters of the directory name you wish to save it under, the url of the remote image,
 and the Image View Object its being assigned to. */
/*
 exports.setRemoteImage = function(imageDirectoryName, url, imageViewObject)
 {
 // Grab the filename
 var filename = url.split('/');
 filename = filename[filename.length - 1];
 // Try and get the file that has been previously cached
 var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);

 if (file.exists()) {
 // If it has been cached, assign the local asset path to the image view object.
 imageViewObject.image = file.nativePath;
 } else {
 // If it hasn't been cached, grab the directory it will be stored in.
 var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName);
 if (!g.exists()) {
 // If the directory doesn't exist, make it
 g.createDirectory();
 };

 // Create the HTTP client to download the asset.
 var xhr = Ti.Network.createHTTPClient();

 xhr.onload = function() {
 if (xhr.status == 200) {
 // On successful load, take that image file we tried to grab before and
 // save the remote image data to it.
 file.write(xhr.responseData);
 // Assign the local asset path to the image view object.
 imageViewObject.image = file.nativePath;
 };
 };

 // Issuing a GET request to the remote URL
 xhr.open('GET', url);
 // Finally, sending the request out.
 xhr.send();
 };
 };
 */