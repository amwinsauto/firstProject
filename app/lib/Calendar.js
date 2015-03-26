function Calendar(response, connection) {
	var data = response;

	// if (data.add) {
	var Calendar = Ti.Calendar.getDefaultCalendar(); 
	var Conversion = require('tools/Conversion');
	data.add = {
		title : 'Test kalenderindgang',
		startDate : 20121114,
		startTime : 800,
		endDate : 20121114,
		endTime : 945
	};

	var startTimeNum = data.add.startTime;
	var startDate = Conversion.toDate(data.add.startDate);
	startDate.setHours(startTimeNum / 100);
	startDate.setMinutes(startTimeNum - (startDate.getHours() * 100));

	var endTimeNum = data.add.endTime;
	var endDate = Conversion.toDate(data.add.endDate);
	endDate.setHours(endTimeNum / 100);
	endDate.setMinutes(endTimeNum - (endDate.getHours() * 100));

	var calendarEntry = Calendar.createItem({
		title : data.add.title,
		startDate : startDate,
		endDate : endDate,
		location : data.add.location
	});
	var result = calendarEntry.saveEvent();
	if (result.status) {
		var o = Calendar.findEvents({
			start : startDate,
			end : endDate
		});

		var keys = [];
		for (key in o) {
			keys.push(key);
		}
		keys.sort();

		for (key in keys) {
			Ti.API.info(o[keys[key]].title + " starts at " + o[keys[key]].startDate + " and has id of " + o[keys[key]].eventIdentifier);
		}
		// var successAction = {
		// type: 'calendarsuccess',
		// request: {
		// action: 'onSuccess',
		// type: 'calendar',
		// calendar: {
		// onSuccess: data.onSuccess
		// }
		// }
		// }
		// setTimeout(function(e) {
		// connection.sendInfo(successAction);
		// }, 250);
	} else {
		var a = Titanium.UI.createAlertDialog({
			title : 'Calendar'
		});
		a.setMessage('Calendar event not created.');
		a.show();
	}
	// }
}

module.exports = Calendar;
