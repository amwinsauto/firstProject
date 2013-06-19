var win = Ti.UI.createWindow({
    backgroundColor: 'blue',
    fullscreen: false
});

var view = Ti.UI.createView();


var search;
var searchAsChild = false;

if (Ti.Platform.name == 'android' && Ti.Platform.Android.API_LEVEL > 11) {
    // Use action bar search view
    search = Ti.UI.Android.createSearchView({
        hintText: "Table Search"
    });

    win.activity.onCreateOptionsMenu = function(e) {
        var menu = e.menu;
        var menuItem = menu.add({
            title: 'Table Search',
            actionView : search,
            icon: (Ti.Android.R.drawable.ic_menu_search ? Ti.Android.R.drawable.ic_menu_search : "my_search.png"),
            showAsAction: Ti.Android.SHOW_AS_ACTION_IF_ROOM | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW
        });
    };
}
else {
    // Use search bar
    search = Ti.UI.createSearchBar({
        hintText: "Table Search"
    });
    searchAsChild = true;
}

var data = [];
data.push(Ti.UI.createTableViewRow({title:'Apple'}));
data.push(Ti.UI.createTableViewRow({title:'Banana'}));
data.push(Ti.UI.createTableViewRow({title:'Orange'}));
data.push(Ti.UI.createTableViewRow({title:'Raspberry'}));

var tableview = Titanium.UI.createTableView({
    data:data,
    search:search,
    searchAsChild:searchAsChild
});
view.add(tableview);
win.add(view);
win.open();