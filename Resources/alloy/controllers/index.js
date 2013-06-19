function Controller() {
    function onClick() {}
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.index = Ti.UI.createTabGroup({
        orientationModes: [ Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT ],
        exitOnClose: "true",
        navBarHidden: "",
        id: "index"
    });
    $.__views.win1 = Ti.UI.createWindow({
        id: "win1",
        title: "Tab 1"
    });
    $.__views.__alloyId1 = Ti.UI.createView({
        id: "__alloyId1"
    });
    $.__views.win1.add($.__views.__alloyId1);
    $.__views.__alloyId3 = Ti.UI.createTableViewRow({
        hasChild: "true",
        title: "Carrots",
        id: "__alloyId3"
    });
    var __alloyId4 = [];
    __alloyId4.push($.__views.__alloyId3);
    $.__views.__alloyId5 = Ti.UI.createTableViewRow({
        hasChild: "true",
        id: "__alloyId5"
    });
    __alloyId4.push($.__views.__alloyId5);
    $.__views.label1 = Ti.UI.createLabel({
        font: {
            fontSize: 30
        },
        id: "label1",
        text: "Bananas"
    });
    $.__views.__alloyId5.add($.__views.label1);
    $.__views.__alloyId6 = Ti.UI.createTableViewRow({
        hasChild: "true",
        id: "__alloyId6"
    });
    __alloyId4.push($.__views.__alloyId6);
    $.__views.label2 = Ti.UI.createLabel({
        font: {
            fontSize: "30dp"
        },
        id: "label2",
        text: "Bananas"
    });
    $.__views.__alloyId6.add($.__views.label2);
    $.__views.__alloyId7 = Ti.UI.createTableViewRow({
        hasChild: "true",
        id: "__alloyId7"
    });
    __alloyId4.push($.__views.__alloyId7);
    $.__views.label3 = Ti.UI.createLabel({
        id: "label3",
        text: "Bananas"
    });
    $.__views.__alloyId7.add($.__views.label3);
    $.__views.__alloyId8 = Ti.UI.createTableViewRow({
        title: "Carrots",
        hasDetail: "true",
        id: "__alloyId8"
    });
    __alloyId4.push($.__views.__alloyId8);
    $.__views.__alloyId9 = Ti.UI.createTableViewRow({
        title: "Potatoes",
        id: "__alloyId9"
    });
    __alloyId4.push($.__views.__alloyId9);
    $.__views.__alloyId10 = Ti.UI.createTableViewRow({
        title: "Cod",
        id: "__alloyId10"
    });
    __alloyId4.push($.__views.__alloyId10);
    $.__views.__alloyId11 = Ti.UI.createTableViewRow({
        title: "Haddock",
        id: "__alloyId11"
    });
    __alloyId4.push($.__views.__alloyId11);
    $.__views.__alloyId2 = Ti.UI.createTableView({
        data: __alloyId4,
        backgroundColor: "blue",
        id: "__alloyId2"
    });
    $.__views.__alloyId1.add($.__views.__alloyId2);
    onClick ? $.__views.__alloyId2.addEventListener("click", onClick) : __defers["$.__views.__alloyId2!click!onClick"] = true;
    $.__views.tab1 = Ti.UI.createTab({
        window: $.__views.win1,
        id: "tab1",
        title: "Tab 1"
    });
    $.__views.index.addTab($.__views.tab1);
    $.__views.win2 = Ti.UI.createWindow({
        id: "win2",
        title: "Tab 2"
    });
    $.__views.__alloyId13 = Ti.UI.createTableViewRow({
        title: "Apple",
        id: "__alloyId13"
    });
    var __alloyId14 = [];
    __alloyId14.push($.__views.__alloyId13);
    $.__views.__alloyId15 = Ti.UI.createTableViewRow({
        title: "Bananas",
        id: "__alloyId15"
    });
    __alloyId14.push($.__views.__alloyId15);
    $.__views.__alloyId16 = Ti.UI.createTableViewRow({
        title: "Carrots",
        id: "__alloyId16"
    });
    __alloyId14.push($.__views.__alloyId16);
    $.__views.__alloyId17 = Ti.UI.createTableViewRow({
        title: "Potatoes",
        id: "__alloyId17"
    });
    __alloyId14.push($.__views.__alloyId17);
    $.__views.__alloyId18 = Ti.UI.createTableViewRow({
        title: "Cod",
        id: "__alloyId18"
    });
    __alloyId14.push($.__views.__alloyId18);
    $.__views.__alloyId19 = Ti.UI.createTableViewRow({
        title: "Haddock",
        id: "__alloyId19"
    });
    __alloyId14.push($.__views.__alloyId19);
    $.__views.__alloyId12 = Ti.UI.createTableView({
        data: __alloyId14,
        id: "__alloyId12"
    });
    $.__views.win2.add($.__views.__alloyId12);
    onClick ? $.__views.__alloyId12.addEventListener("click", onClick) : __defers["$.__views.__alloyId12!click!onClick"] = true;
    $.__views.tab2 = Ti.UI.createTab({
        window: $.__views.win2,
        id: "tab2",
        title: "Tab 2"
    });
    $.__views.index.addTab($.__views.tab2);
    $.__views.index && $.addTopLevelView($.__views.index);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.index.open();
    __defers["$.__views.__alloyId2!click!onClick"] && $.__views.__alloyId2.addEventListener("click", onClick);
    __defers["$.__views.__alloyId12!click!onClick"] && $.__views.__alloyId12.addEventListener("click", onClick);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;