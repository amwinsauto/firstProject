function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    $.__views.index2 = Ti.UI.createWindow({
        navBarHidden: "false",
        id: "index2"
    });
    $.__views.index2 && $.addTopLevelView($.__views.index2);
    $.__views.__alloyId20 = Ti.UI.createView({
        id: "__alloyId20"
    });
    $.__views.index2.add($.__views.__alloyId20);
    $.__views.__alloyId21 = Ti.UI.createTableViewRow({
        title: "Apple",
        id: "__alloyId21"
    });
    var __alloyId22 = [];
    __alloyId22.push($.__views.__alloyId21);
    $.__views.__alloyId23 = Ti.UI.createTableViewRow({
        title: "Bananas",
        id: "__alloyId23"
    });
    __alloyId22.push($.__views.__alloyId23);
    $.__views.__alloyId24 = Ti.UI.createTableViewRow({
        title: "Carrots",
        id: "__alloyId24"
    });
    __alloyId22.push($.__views.__alloyId24);
    $.__views.__alloyId25 = Ti.UI.createTableViewRow({
        title: "Potatoes",
        id: "__alloyId25"
    });
    __alloyId22.push($.__views.__alloyId25);
    $.__views.__alloyId26 = Ti.UI.createTableViewRow({
        title: "Cod",
        id: "__alloyId26"
    });
    __alloyId22.push($.__views.__alloyId26);
    $.__views.__alloyId27 = Ti.UI.createTableViewRow({
        title: "Haddock",
        id: "__alloyId27"
    });
    __alloyId22.push($.__views.__alloyId27);
    $.__views.table = Ti.UI.createTableView({
        data: __alloyId22,
        id: "table"
    });
    $.__views.__alloyId20.add($.__views.table);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;