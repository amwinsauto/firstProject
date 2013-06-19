var win = Ti.UI.createWindow({
	backgroundColor : 'black',
	fullscreen : false
});

var view = Ti.UI.createView({
	layout : "vertical"
});

var entry = Ti.UI.createTextField({
	left : 10,
	top : 10,
	width : 200,
	height : 40,
	font : {
		fontSize : 20
	},
	value: 'abcABC',
	backgroundColor : 'white'

});
var entry2 = Ti.UI.createTextField({
	left : '10dp',
	top : '10dp',
	width : '200dp',
	height : '40dp',
	value: 'abcABC',
	font : {
		fontSize : '20dp'
	},
	backgroundColor : 'white'

});

view.add(entry);
view.add(entry2);
win.add(view);
win.open(); 