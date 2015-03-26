function Contact(response, connection) {
	var data = response;

	var performContactsFunction = function() {
		if (data.contactinfo === 'name') {
			Ti.Contacts.showContacts({
				selectedPerson : function(e) {
					var fields = [];
					if (e.person.fullName) {
						fields.push({
							name : 'FULLNAME',
							value : e.person.fullName
						});
					}
					if (e.person.firstName) {
						fields.push({
							name : 'FIRSTNAME',
							value : e.person.firstName
						});
					}
					if (e.person.middleName) {
						fields.push({
							name : 'MIDDLENAME',
							value : e.person.middleName
						});
					}
					if (e.person.lastName) {
						fields.push({
							name : 'LASTNAME',
							value : e.person.lastName
						});
					}
					if (e.person.nickName) {
						fields.push({
							name : 'NICKNAME',
							value : e.person.nickName
						});
					}
					if (data.onSuccess) {
						var successAction = {
							type : 'contactsuccess',
							request : {
								action : 'onSuccess',
								type : 'contact',
								contact : {
									onSuccess : data.onSuccess,
									fields : fields,
								}
							}
						};
						setTimeout(function(e) {
							connection.sendInfo(successAction);
						}, 250);
					}
				},
				cancel : function(e) {
					if (data.onCancel) {
						var cancelAction = {
							type : 'contactcancel',
							request : {
								action : 'onCancel',
								type : 'contact',
								contact : {
									onCancel : data.onCancel
								}
							}
						};
						setTimeout(function(e) {
							connection.sendInfo(successAction);
						}, 250);
					}
				}
			});
		} else {
			Ti.Contacts.showContacts({
				fields : [data.contactinfo],
				selectedProperty : function(e) {
					var fields = [];
					if ( typeof e.value === 'object') {
						for (var val in e.value) {
							fields.push({
								name : val.toUpperCase(),
								value : e.value[val]
							});
						}
					} else if ( typeof e.value === 'string') {
						fields.push({
							name : e.property.toUpperCase(),
							value : e.value
						});
					}
					if (data.onSuccess) {
						var successAction = {
							type : 'contactsuccess',
							request : {
								action : 'onSuccess',
								type : 'contact',
								contact : {
									onSuccess : data.onSuccess,
									fields : fields,
								}
							}
						};
						setTimeout(function(e) {
							connection.sendInfo(successAction);
						}, 250);
					}
				},
				cancel : function(e) {
					if (data.onCancel) {
						var cancelAction = {
							type : 'contactcancel',
							request : {
								action : 'onCancel',
								type : 'contact',
								contact : {
									onCancel : data.onCancel
								}
							}
						};
						setTimeout(function(e) {
							connection.sendInfo(successAction);
						}, 250);
					}
				}
			});
		};
	};
	// selectedPerson : function(e) {
	// if (data.onSuccess) {
	// var fields = [];
	// for (var property in e.person) {
	// Ti.API.info(property);
	// }
	// // var addresses = {};
	// for (var key in e.person.address) {
	// // var address = {};
	// var addressInfo = e.person.address[key][0];
	// for (var info in addressInfo) {
	// // address[info.toLowerCase()] = addressInfo[info];
	// var field = {'name': key + '.' + info.toUpperCase(), 'value': addressInfo[info], 'type': 'string'};
	// fields.push(field);
	// }
	// // addresses[key.toLowerCase()] = address;
	// }
	//
	// var phones = {};
	// for (var key in e.person.phone) {
	// phones[key.toLowerCase()] = e.person.phone[key][0];
	// }
	//
	// var emails = {};
	// for (var key in e.person.email) {
	// emails[key.toLowerCase()] = e.person.email[key][0];
	// }
	//
	// var urls = {};
	// for (var key in e.person.url) {
	// urls[key.toLowerCase()] = e.person.url[key][0];
	// }
	//
	// var successAction = {
	// type : 'contactsuccess',
	// request : {
	// action : 'onSuccess',
	// type : 'contact',
	// contact : {
	// onSuccess : data.onSuccess,
	// fields: fields,
	// fullName: e.person.fullName,
	// firstName: e.person.firstName,
	// middleName: e.person.middleName,
	// lastName: e.person.lastName,
	// nickName: e.person.nickName,
	// organization: e.person.organization,
	// // addresses : addresses,
	// phones: phones,
	// emails: emails,
	// urls: urls
	// }
	// }
	// }
	// setTimeout(function(e) {
	// connection.sendInfo(successAction);
	// }, 250);
	// }
	// },
	var contactsDisallowed = function() {
		//alert('Contacts cannot be accessed.');
		Ti.UI.createAlertDialog({
			message : 'Contacts cannot be accessed.'
		}).show();

	};

	if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_AUTHORIZED) {
		performContactsFunction();
	} else if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_UNKNOWN) {
		Ti.Contacts.requestAuthorization(function(e) {
			if (e.success) {
				performContactsFunction();
			} else {
				contactsDisallowed();
			}
		});
	} else {
		contactsDisallowed();
	}
}

module.exports = Contact;
