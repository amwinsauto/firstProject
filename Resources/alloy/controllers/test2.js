function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    exports.destroy = function() {};
    _.extend($, $.__views);
    var win = Ti.UI.createWindow({
        backgroundColor: "black",
        fullscreen: false
    });
    var view = Ti.UI.createView({
        layout: "vertical"
    });
    var entry = Ti.UI.createTextField({
        left: 10,
        top: 10,
        width: 200,
        height: 40,
        font: {
            fontSize: 20
        },
        value: "abcABC",
        backgroundColor: "white"
    });
    var entry2 = Ti.UI.createTextField({
        left: "10dp",
        top: "10dp",
        width: "200dp",
        height: "40dp",
        value: "abcABC",
        font: {
            fontSize: "20dp"
        },
        backgroundColor: "white"
    });
    view.add(entry);
    view.add(entry2);
    win.add(view);
    win.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;