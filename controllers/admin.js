var config = require("../config/config"),
    model = require('../models/app'),
    adminModel = require('../models/admin'),
    userModel = require('../models/user');
    Plan = require('../models/plan'),
    widgetTypes = require("../models/widgetTypes"),
    gateway = require('../payment_gateways/stripe');

module.exports.controller = function (app) {

    let defaultAppData = {
        basePath: config.system.url,
        title: config.system.site_title,
        widgetSets: model.getWidgetSets(),
        allWidgets: widgetTypes.getAllWidgetInfo(),
        popularWidgets: widgetTypes.getPopularWidgets(),
    };

    let loginData = {
        title: config.system.site_title,
        basePath: config.system.url
    };

    function redirectNoAdminUser(adminLevel, response) {
        if (adminLevel === 0) {
            response.redirect(config.system.url);
        }
    }

    app.get('/admin', function (req, res) {
        if (req.session.user) {
            redirectNoAdminUser(req.session.user.adminLevel, res);
            let appData = Object.assign({}, defaultAppData, {user: JSON.parse(JSON.stringify(req.session.user))});

            adminModel.getDashboard(function (data) {
                appData.data = data;
                model.getUserDashboardList(req.session.user.id, function (userDashboards) {
                    req.session.user.dashboards = userDashboards;
                    appData.user.dashboards = userDashboards;
                    if (req.session.user.agencyID > 0 && req.session.user.agencyAccess > 0) {
                        model.getAgencyClients(req.session.user.agencyID, function (agencyClients) {
                            req.session.user.agency.clients = agencyClients;
                            appData.user.agency.clients = agencyClients;
                            model.getAgencyDashboards(req.session.user.agencyID, function (agencyDashboards) {
                                req.session.user.agency.dashboards = agencyDashboards;
                                appData.user.agency.dashboards = agencyDashboards;
                                res.render("admin/admin.html", appData);
                            });
                        });
                    } else {
                        res.render("admin/admin.html", appData);
                    }
                });
            });
        } else {
            res.render("login.html", loginData);
        }
    });

    app.get('/admin/apistatus', function (req, res) {
        if (req.session.user) {
            let appData = Object.assign({}, defaultAppData, {user: JSON.parse(JSON.stringify(req.session.user))});

            adminModel.getDashboard(function (data) {
                appData.data = data;
                model.getUserDashboardList(req.session.user.id, function (userDashboards) {
                    req.session.user.dashboards = userDashboards;
                    appData.user.dashboards = userDashboards;
                    if (req.session.user.agencyID > 0 && req.session.user.agencyAccess > 0) {
                        model.getAgencyClients(req.session.user.agencyID, function (agencyClients) {
                            req.session.user.agency.clients = agencyClients;
                            appData.user.agency.clients = agencyClients;
                            model.getAgencyDashboards(req.session.user.agencyID, function (agencyDashboards) {
                                req.session.user.agency.dashboards = agencyDashboards;
                                appData.user.agency.dashboards = agencyDashboards;
                                appData.testing = {qq: "QQ1"}

                                res.render("admin/apistatus.html", appData);
                            });
                        });
                    } else {
                        var Curl = require('node-libcurl').Curl;
                        var curl = new Curl();
                        curl.setOpt('URL', config.system.auth_url + 'apis/get_widget_data.php?test=true');
                        curl.setOpt('SSL_VERIFYPEER', false);
                        curl.setOpt('SSL_VERIFYHOST', false);
                        curl.setOpt('FOLLOWLOCATION', true);
                        curl.on('end', function (statusCode, body, headers) {
                            appData.testing = JSON.parse(body)
                            for (var i = appData.testing.length - 1; i >= 0; i--) {
                                if (!appData.testing[i].metricsResult)
                                    appData.testing[i].broken = 'red'
                                else
                                    appData.testing[i].broken = 'green'
                            }
                            res.render("admin/apistatus.html", appData);
                        });
                        curl.perform();

                    }
                });
            });
        } else {
            res.render("login.html", loginData);
        }
    });

    app.get('/admin/sitecheckrules', function (req, res) {
        if (req.session.user) {
            let appData = Object.assign({}, defaultAppData, {user: JSON.parse(JSON.stringify(req.session.user))});

            adminModel.getDashboard(function (data) {
                appData.data = data;
                model.getUserDashboardList(req.session.user.id, function (userDashboards) {
                    req.session.user.dashboards = userDashboards;
                    appData.user.dashboards = userDashboards;
                    if (req.session.user.agencyID > 0 && req.session.user.agencyAccess > 0) {
                        model.getAgencyClients(req.session.user.agencyID, function (agencyClients) {
                            req.session.user.agency.clients = agencyClients;
                            appData.user.agency.clients = agencyClients;
                            model.getAgencyDashboards(req.session.user.agencyID, function (agencyDashboards) {
                                req.session.user.agency.dashboards = agencyDashboards;
                                appData.user.agency.dashboards = agencyDashboards;
                                appData.testing = {qq: "QQ1"}

                                res.render("admin/apistatus.html", appData);
                            });
                        });
                    } else {
                        res.render("admin/apistatus.html", appData);
                    }
                });
            });
        } else {
            res.render("login.html", loginData);
        }
    });

    app.get('/admin/users', function (req, res) {
        if (req.session.user) {
            redirectNoAdminUser(req.session.user.adminLevel, res);
            let appData = Object.assign({}, defaultAppData, {user: JSON.parse(JSON.stringify(req.session.user))});

            adminModel.getAllUsers(function (userList) {
                appData.users = userList;
                model.getUserDashboardList(req.session.user.id, function (userDashboards) {
                    req.session.user.dashboards = userDashboards;
                    appData.user.dashboards = userDashboards;
                    if (req.session.user.agencyID > 0 && req.session.user.agencyAccess > 0) {
                        model.getAgencyClients(req.session.user.agencyID, function (agencyClients) {
                            req.session.user.agency.clients = agencyClients;
                            appData.user.agency.clients = agencyClients;
                            model.getAgencyDashboards(req.session.user.agencyID, function (agencyDashboards) {
                                req.session.user.agency.dashboards = agencyDashboards;
                                appData.user.agency.dashboards = agencyDashboards;
                                res.render("admin/users.html", appData);
                            });
                        });
                    } else {
                        res.render("admin/users.html", appData);
                    }
                });
            });
        } else {
            res.render("login.html", loginData);
        }
    });

    app.get('/admin/sitestats', function (req, res) {
        if (req.session.user) {
            redirectNoAdminUser(req.session.user.adminLevel, res);
            let appData = Object.assign({}, defaultAppData, {user: JSON.parse(JSON.stringify(req.session.user))});

            adminModel.getSiteStats(function (sitestats) {
                appData.sitestats = sitestats;
                model.getUserDashboardList(req.session.user.id, function (userDashboards) {
                    req.session.user.dashboards = userDashboards;
                    appData.user.dashboards = userDashboards;
                    if (req.session.user.agencyID > 0 && req.session.user.agencyAccess > 0) {
                        model.getAgencyClients(req.session.user.agencyID, function (agencyClients) {
                            req.session.user.agency.clients = agencyClients;
                            appData.user.agency.clients = agencyClients;
                            model.getAgencyDashboards(req.session.user.agencyID, function (agencyDashboards) {
                                req.session.user.agency.dashboards = agencyDashboards;
                                appData.user.agency.dashboards = agencyDashboards;
                                res.render("admin/sitestats.html", appData);
                            });
                        });
                    } else {
                        res.render("admin/sitestats.html", appData);
                    }
                });
            });
        } else {
            res.render("login.html", loginData);
        }
    });

    app.get('/admin/getAgency', function (req, res) {
        adminModel.getAgency(req.query.id, function (agency) {
            return res.status(200).send({data: agency});
        });
    });

    app.post('/admin/updateagency', function (req, res) {
        adminModel.updateAgency(req, function () {
            return res.status(200).send({message: 'Success'});
        });
    });

    app.post('/admin/searchagency', function (req, res) {
        adminModel.getSearch(req.body.data, function (datas) {
            return res.status(200).send({data: datas});
        });
    });

    app.get('/admin/plans', function (req, res) {
        let user = req.session.user || null;
        if(user) {
            redirectNoAdminUser(user.adminLevel, res);
            let appData = Object.assign({}, defaultAppData, {user: JSON.parse(JSON.stringify(user))});

            Plan.getAll(function (allPlans) {
                appData.plans = allPlans;
                res.render('admin/plans.html', appData);
            })
        } else {
            res.render("login.html", loginData);
        }
    });

    app.get('/admin/plan', function (req, res) {
        Plan.get(req.query.id, function (plan) {
            return res.status(200).send({plan: plan});
        })
    });

    app.post('/admin/createPlan', function (req, res) {
        let plan = req.body.plan;

        gateway.getProductsList()
            .then(products => {
                if(products.data[0]) {
                    return gateway.getProductById(products.data[0].id)
                }
                return gateway.createProduct();
            })
            .then(product => {
                return gateway.createPlan(plan, product.id)
            })
            .then(response => {
                plan.stripe_id = response.id;
                Plan.create(plan, function (result) {
                    return res.status(200).send({id: result.id})
                });
            })
            .catch(error => {
                return res.status(200).send({id: null});
            })
    });

    app.post('/admin/updatePlan', function (req, res) {
        Plan.get(req.body.plan.id, function (plan) {
            if(plan) {
                var oldPlan = plan;
                var newPlan = Object.assign({}, oldPlan);

                delete newPlan.id;
                delete newPlan.created_at;
                delete newPlan.deleted_at;
                delete newPlan.disabled_at;
                newPlan.name = req.body.plan.name;
                newPlan.campaigns_number = req.body.plan.campaignsNumber;
                newPlan.keywords_number = req.body.plan.keywordsNumber;
                newPlan.ad_keywords_number = req.body.plan.adKeywordsNumber;

                Plan.create(newPlan, function (result) {
                    if(result.planId) {
                        Plan.toggleDisableStatus(oldPlan.id, true, function (disabled) {
                            return res.status(200).send(disabled);
                        })
                    }
                });
            }
        });
    });

    app.post('/admin/togglePlanStatus', function (req, res) {
        let data = JSON.parse(req.body.data);

        Plan.toggleDisableStatus(data.id, data.disable, function (result) {
            return res.status(200).send(result);
        })
    });

    app.post('/admin/deletePlan', function (req, res) {
        let plan = req.body.plan;
        let promise = new Promise((resolve, reject) => {resolve({deleted: true})});
        let errorResponse = {result: false};

        Plan.countByStripeId(plan.stripeId, function (numbersPlans) {
            if(numbersPlans == 1) {
                promise = gateway.deletePlan(plan.stripeId);
            }

            promise.then((result) => {
                if(result.deleted) {
                    Plan.remove(plan, function (result) {
                        return res.status(200).send(result);
                    })
                } else {
                    return res.status(200).send(errorResponse);
                }
            }).catch(error => res.status(200).send(errorResponse))
        })
    });

    app.post('/admin/restartTrial', function (req, res) {
        userModel.startTrial(req.body.user_id, function (result) {
            return res.status(200).send(result);
        })
    })

};
