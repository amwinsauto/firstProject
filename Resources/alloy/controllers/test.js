function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    exports.destroy = function() {};
    _.extend($, $.__views);
    var win = Ti.UI.createWindow({
        backgroundColor: "blue",
        fullscreen: false
    });
    var view = Ti.UI.createView();
    var search;
    var searchAsChild = false;
    search = Ti.UI.createSearchBar({
        hintText: "Table Search"
    });
    searchAsChild = true;
    var data = [];
    data.push(Ti.UI.createTableViewRow({
        title: "Apple"
    }));
    data.push(Ti.UI.createTableViewRow({
        title: "Banana"
    }));
    data.push(Ti.UI.createTableViewRow({
        title: "Orange"
    }));
    data.push(Ti.UI.createTableViewRow({
        title: "Raspberry"
    }));
    var tableview = Titanium.UI.createTableView({
        data: data,
        search: search,
        searchAsChild: searchAsChild
    });
    view.add(tableview);
    win.add(view);
    win.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;