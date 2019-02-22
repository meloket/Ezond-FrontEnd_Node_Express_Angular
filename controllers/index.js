var config = require("../config/config");

module.exports.controller = function(app) {

    app.get('/', function (req, res) {        
        res.render("dashboard_index/index.html", {sentry_dns: config.system.sentry_dns});
        console.log("controller index -> / ");
    });

};
