var config = require("../config/config.js"),
    db = require('../commons/mysql.js'),
    userModel = require('./user');

var App = {

    getWidgetSets: function() {
        var widgetTypes = require("./widgetTypes");
        return [{
            name: "Conversion",
            description: "This set tracks your adwords conversions",
            network: 2,
            widgets: [widgetTypes.awconversions, widgetTypes.awconverionrate, widgetTypes.awcost,
                widgetTypes.awcpc
            ]
        }, {
            name: "SEO",
            network: 1,
            description: "This set tracks your SEO information via google analytics",
            widgets: [widgetTypes.gavisits, widgetTypes.gapageviews, widgetTypes.gauniquevisitors,
                widgetTypes.gauniquepageviews, widgetTypes.gabounces, widgetTypes.gaentrances,
                widgetTypes.gaexits, widgetTypes.ganewvisits, widgetTypes.gatimeonpage, widgetTypes.gatimeonsite
            ]
        }];
    },

    getAgencyDashboards: function(id, callback) {
        db.query('SELECT * FROM dashboards WHERE agencyID = ?', [id], function(err, data, fields) {
            return callback(data);
        });
    },

    getUserInfoFromAgencyUsers: function(id, callback) {
        db.query('SELECT * FROM agency_users WHERE id = ?', [id], function(err, data, fields) {
            callback(data);
            return;
        });
    },

    getAgencyClients: function(id, callback) {
        db.query('SELECT * FROM users WHERE agencyID = ? AND agencyAccess = 0', [id], function(err, data, fields) {
            return callback(data);
        });
    },
    /*used*/
    getUserDashboardListFromClient: function(__parent_id, __agency_id, callback) {
        self = this;
        if (__parent_id == __agency_id) {
            self.getUserDashboardList(__parent_id, callback);
        } else {
            self.getUserInfoFromAgencyUsers(__agency_id, function(user_info) {
                if (user_info.length > 0) {
                    __agency_user_info = user_info[0];

                    db.query('SELECT * FROM dashboards WHERE ownerID = ? AND active = 1', [__parent_id], function(err, userDashboards, fields) {
                        if (typeof __agency_user_info.parent_id != 'undefined' && __agency_user_info.campaign_access != 'all') {

                            var campaigns_allowed_str = __agency_user_info.campaigns_allowed;
                            campaigns_allowed = JSON.parse(campaigns_allowed_str);

                            var userDashboardsFiltered = [];

                            userDashboards.forEach(function(dashboard) {
                                if (campaigns_allowed.indexOf(dashboard.id) > -1) {
                                    userDashboardsFiltered.push(dashboard);
                                }
                            });
                            userDashboards = userDashboardsFiltered;
                        }
                        return callback(userDashboards);
                    });
                } else {
                    userDashboards = [];
                    return callback(userDashboards);
                }
            });
        }
    },
    /*used*/
    getUserDashboardList: function(id, callback) {
        userModel.getLimitOfSubscriptionOptions(null, id, function (limits) {
            let limit = limits.campaigns;
            db.query('SELECT * FROM dashboards WHERE ownerID = ? AND active = 1 LIMIT ?', [id, limit], function(err, data, fields) {
                return callback(data);
            });
        });
    },
    /*used*/
    getNetworkList: function(id, callback) {
        db.query('SELECT * FROM users_networks WHERE userID = ?', [id], function(err, data, fields) {
            callback(data);
            return;
        });
    },
    /*used*/
    getChildUsers: function(id, callback) {
        console.log("SQL used user id = " + id);
        db.query('SELECT * FROM agency_users WHERE (agencyID = ? and role="client") or parent_id = ?', [id, id], function(err, data, fields) {
            return callback(data);
        });
    }

};

module.exports = App;