/**
 * Main app controller file
 */
var config = require("../config/config"),
    model = require('../models/app'),
    user = require('../models/user');
    plan = require('../models/plan');

module.exports.controller = function (app) {

    app.get('/app/data', function (req, res) {

        console.log("appDataService.appData -> app/data");
        //console.log("session: " + JSON.stringify(req.session));

        var defaultAppData = {
            basePath: config.system.url,
            backendUrl: config.system.auth_url,
            googleMapKey: config.google.map_key,
            stripePublicKey: config.stripe.public_key,
            title: config.system.site_title,
            loggedIn: false,
        };


        if (req.session.user) {
            var isAgencyUser = typeof req.session.user.parent_id != 'undefined';
            console.log("/app/data -> getUserData");

            if (isAgencyUser) {
                user.getChildUserData(req.session.user, false, getUserDataCallback);
            } else {
                user.getUserData(req.session.user.id, false, getUserDataCallback);
            }

            function getUserDataCallback(userData) {
                var userId = isAgencyUser ? req.session.user.parent_id : req.session.user.id;
                var selfId = req.session.user.id;
                var __agency_uid = isAgencyUser ? req.session.user.agencyID : req.session.user.id;

                plan.getActivePlans(function (activePlans) {
                    var widgetTypes = require("../models/widgetTypes");
                    var appData = Object.assign({}, defaultAppData, {
                        user: JSON.parse(JSON.stringify(userData)),
                        widgetSets: model.getWidgetSets(),
                        allWidgets: widgetTypes.getAllWidgetInfo(),
                        popularWidgets: widgetTypes.getPopularWidgets(),
                        loggedIn: true,
                        subscription_expired: false,
                        activePlans: activePlans,
                    });

                    user.getSubscriptionExpire(userId, function (result) {

                        if (result * 1000 < (+new Date())) {
                            appData.subscription_expired = true
                        }

                        if (req.session.user.firstLogin) {
                            req.session.user.firstLogin = false;
                        }
                        model.getNetworkList(req.session.user.id, function (networks) {
                            console.log("1-model.getNetworkList: ");

                            req.session.user.networks = networks;
                            appData.user.networks = networks;

                            if (isAgencyUser) {
                                req.session.user.providers_allowed = req.session.user.providers_allowed;
                            }

                            model.getUserDashboardListFromClient(userId, __agency_uid, function (userDashboards) {
                                console.log("2-model.getUserDashboardList: ");

                                // Filter dashboards to remove the ones user does not have access for
                                if (isAgencyUser && req.session.user.campaign_access != 'all') {

                                    var campaigns_allowed_str = req.session.user.campaigns_allowed;
                                    campaigns_allowed = JSON.parse(campaigns_allowed_str);

                                    var userDashboardsFiltered = [];
                                    userDashboards.forEach(function (dashboard) {
                                        if (campaigns_allowed && campaigns_allowed.indexOf(dashboard.id) > -1) {
                                            userDashboardsFiltered.push(dashboard);
                                        }
                                    });
                                    userDashboards = userDashboardsFiltered;
                                }
                                req.session.user.dashboards = userDashboards;
                                appData.user.dashboards = userDashboards;

                                model.getChildUsers(selfId, function (childUsers) {
                                    console.log("3-model.getChildUsers: ");

                                    req.session.user.childUsers = childUsers;
                                    appData.user.childUsers = childUsers;
                                    if (req.session.user.agencyID > 0 && req.session.user.agencyAccess > 0) {
                                        model.getAgencyClients(req.session.user.agencyID, function (agencyClients) {

                                            console.log("3-model.getAgencyClients: ");
                                            console.log("req.session.user.agency :" + req.session.user.agency);

                                            req.session.user.agency.clients = agencyClients;
                                            console.log("check point");
                                            appData.user.agency.clients = agencyClients;

                                            model.getAgencyDashboards(req.session.user.agencyID, function (agencyDashboards) {
                                                console.log("4-model.getAgencyDashboards: ");
                                                req.session.user.agency.dashboards = agencyDashboards;
                                                appData.user.agency.dashboards = agencyDashboards;
                                                req.session.user.firstLogin = false;
                                                res.json(appData);
                                            });
                                        });
                                    } else {
                                        req.session.user.firstLogin = false;
                                        res.json(appData);
                                    }
                                });
                            });
                        });

                    })
                })
            }
        } else {
            res.json(defaultAppData);
        }
    });
};