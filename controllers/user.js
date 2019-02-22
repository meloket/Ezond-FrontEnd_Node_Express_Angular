var config = require("../config/config"),
    user = require('../models/user');

module.exports.controller = function (app) {


    app.post('/user/kwrd_suggestions', function (req, res) {
        user.suggestions(req.session.user.id, req.body.url, req.body.dashboard_id, req.body.iso, function (result) {
            res.json({sts: result})
        })
    })

    app.post('/user/deleteform', function (req, res) {
        user.deleteform(req.body.form_id, function (result) {
            res.json(result)
        })
    })

    app.get('/publicform/:id', function(req, res) {
        res.redirect('/#!/publicform/' + req.params.id);
    });

    app.get('/campaign/public/:id', function (req, res) {
        user.getDashboardPublic(req.params.id, function (result) {

            res.json(result.result.company_name)
        })
    })

    app.options('/forms/embed/:id', function (req, res) {
        console.log('OPTIONS ', req.params.id)
        user.getFormById(req.params.id, function (result) {
            res.json(result)
        })
    })

    app.get('/forms/embed/:id', function (req, res) {
        console.log('GET ', req.params.id)
        user.getFormById(req.params.id, function (result) {
            res.json(result)
        })
    })

    app.post('/user/saveservice', function (req, res) {
        user.saveservice(req.body, function (result) {
            res.json(result);
        })
    })

    app.post('/agency/handleform', function (req, res) {
        user.handleform(req, function (result) {
            res.json(result);
        })
    })

    app.post('/user/getserviceorders', function (req, res) {
        user.getserviceorders(req.body, function (result) {
            res.json(result);
        })
    })

    app.post('/saveadroll', function (req, res) {
        user.saveAdrollAccount (req, function (result) {
            res.json(result)
        })
    })

    app.post('/user/saveAgencyForm', function (req, res) {
        user.saveAgencyForm(req, function (result) {
            res.json(result)
        })
    })

    app.post('/getAdrollCampaignReport', function (req, res) {
        user.getAdrollCampaignReport(req, function (result) {
            res.json(result)
        })
    })

    app.post('/getAdrollAdgroupMetrics', function (req, res) {
        user.getAdrollAdgroupMetrics(req, function (result) {
            res.json(result)
        })
    })

    app.get('/getAdrollAdGroups', function (req, res) {
        user.getAdrollAdGroups(req, function (result) {
            res.json(result)
        })
    })

    app.get('/getAdrollAdvertisables', function (req, res) {
        user.getAdrollAdvertisables(req, function (result) {
            res.json(result)
        })
    })    

    app.post('/getAdrollAdvertisableData', function (req, res) {

        user.getAdrollAdvertisableData(req, function (result) {
            res.json(result)
        })
    })
    
    app.post('/user/get_rank_results', function (req, res) {

        var obj = {
            id: req.body.id
        }

        if (req.body.startDate) {
            obj.startDate = req.body.startDate
        }
        if (req.body.endDate) {
            obj.endDate = req.body.endDate
        }
        user.get_rank_results(obj, function (result) {
            res.json(result)
        })
    })

    app.post('/user/managekeywords', function (req, res) {
        user.managekeywords(req.body.words, req.body.id, req.session.user.id, function (result) {
            res.json({status: result})
        })
    })

    app.post('/user/delete999networks', function (req, res) {
        console.log(req)
        user.delete999networks(req, function () {
            res.json(true)
        })
    })

    app.get('/user/getAgency', function (req, res) {
        user.getAgency(req.query.id, function (result) {
            res.json(result)
        })
    })

    app.get('/user/getAgencyForms', function (req, res) {
        user.getAgencyForms(req, function (result) {
            res.json({forms: result})
        })
    })

    app.post('/user/restore_user_session', function (req, res) {
        if (req.body.user.email && req.body.user.password) {

            console.log("controller user -> user/auth");

            user.auth(req.body.user.email, req.body.user.password, function (data, err) {

                if (err) {
                    res.json({status: false, message: err});
                } else if (data) {
                    req.session.user = data;
                    res.json({status: true, user: data});
                } else {
                    res.json({status: false, message: 'Email/password invalid'});
                }
            });
        } else {
            res.json({status: false, message: 'Email/password invalid'});
        }
    });
    app.post('/user/sendNotification', function (req, res) {
        user.sendNotification(req.body.type, req.body.info)
        res.json({message: "Sended"})
    })

    app.get('/adrollcallback', function (req, res) {
        console.log("adrollcallback works")
    })

    app.post('/user/getTitle', function (req, res) {
        user.getuserIdByWlName(req.body.wlName, function (data) {
            res.json({wlName: data})
        })
    }),

        app.post('/user/auth', function (req, res) {

            if (req.body.email && req.body.password) {

                console.log("controller user -> user/auth");

                user.auth(req.body.email, req.body.password, function (data, err) {

                    if (err) {
                        res.json({status: false, message: err});
                    } else if (data) {
                        req.session.user = data;

                        if (req.body.admin) {
                            res.redirect('/admin')
                            return
                        }

                        res.json({status: true, user: data});
                    } else {
                        res.json({status: false, message: 'Email/password invalid'});
                    }
                });
            } else {
                res.json({status: false, message: 'Email/password invalid'});
            }
        });

    app.get('/user/extendsession', function (req, res) {
        if (!!req.session.user) {
            res.json({status: true});
        } else {
            res.json({status: false});
        }
    });

    app.get('/user/info', function (req, res) {
        res.json(req.session)
        if (!!req.session.user) {

            console.log("controller user -> /user/info");

            user.getUserData(req.session.user.id, false, function (userData) {
                res.json({status: true, user: userData});
            });
        } else {
            res.json({status: false});
        }
    });

    app.get('/user/logout', function (req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    app.post('/user/dosignup', function (req, res) {
        var error = null;
        if (!req.body.email) {
            res.redirect('/signup?error=Email is Missing.');
            return;
        }

        if (!req.body.password) {
            res.redirect('/signup?error=Password is Missing.');
            return;
        }

        // if (!req.body.c_password) {
        //     res.redirect('/signup?error=Confirm Password is Missing.');
        //     return;
        // }

        // if (req.body.password !== req.body.c_password) {
        //     res.redirect('/signup?error=Passwords do not match.');
        //     return;
        // }

        if (!req.body.first_name) {
            res.redirect('/signup?error=Name is Missing.');
            return;
        }

        // process signup then send to activation page
        user.register(req, function (err, data) {
            if (err) {
                res.redirect('/signup?error=' + err);
                return;
            }

            res.redirect('/?status=ok')
            // res.redirect('/activate?email='+req.body.email);
        });
    });

    app.get('/signup', function (req, res) {
        var data = {
            basePath: config.system.url,
            title: config.system.site_title,
            backendUrl: config.system.auth_url,
            newemail: req.query.newemail
        };

        if (req.query.error) {
            data.error = req.query.error;
        }

        res.render('signup.html', data);
    });

    app.get('/embed', function (req, res) {
        var data = {
            basePath: config.system.url,
            title: config.system.site_title,
            backendUrl: config.system.auth_url
        };

        if (req.query.error) {
            data.error = req.query.error;
        }

        res.render('embed.html', data);
    });

    app.get('/activate', function (req, res) {
        var data = {
            basePath: config.system.url,
            title: config.system.site_title
        };

        if (req.query.email) {
            data.email = req.query.email;
            //data.code = "";//<!-- mycorrection-->
        }

        if (req.query.code) {
            data.code = req.query.code;
        } else {
            data.code = "";
        }

        if (req.query.error) {
            data.error = req.query.error;
        }

        if (req.query.success) {
            data.success = req.query.success;
        }
        res.render('activate.html', data);
    });

    app.post('/user/update', function (req, res) {

        user.crud.update(req, function (status) {

            res.json(status);
        });
    });

    app.post('/user/updateProfile', function (req, res) {

        user.update(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/updatePhoto', function (req, res) {

        user.updatePhoto(req, function (data) {
            res.json(data);
        });
    });

    app.post('/doactivate', function (req, res) {
        var data = {
            basePath: config.system.url,
            title: config.system.site_title
        };

        // process signup then send to activation page
        user.activate(req, function (success, err) {
            if (err) {
                res.redirect('/activate?email=' + req.body.email + '&code=' + req.body.code + '&error=' + err);
                return;
            }
            res.redirect('/activate?success=Activation Complete, You can login now!');
        });
    });

    app.get('/clientactivate', function (req, res) {
        var data = {
            basePath: config.system.url,
            title: config.system.site_title
        };

        if (req.query.email) {
            data.email = req.query.email;
        }

        if (req.query.code) {
            data.code = req.query.code;
        } else {
            data.code = "";
        }

        if (req.query.error) {
            data.error = req.query.error;
        }

        if (req.query.success) {
            data.success = req.query.success;
        }

        res.render('client-activate.html', data);
    });

    app.post('/doactivateclient', function (req, res) {
        var data = {
            basePath: config.system.url,
            title: config.system.site_title
        };

        // process signup then send to activation page
        user.clientactivate(req, function (success, err) {
            if (err) {
                res.redirect('/clientactivate?email=' + req.body.email + '&code=' + req.body.code + '&error=' + err);
                return;
            }

            res.redirect('/clientactivate?success=Activation Complete, You can login now!');
        });
    });

    app.get('/forgotpw', function (req, res) {
        var data = {
            basePath: config.system.url,
            title: config.system.site_title
        };

        if (req.query.error) {
            data.error = req.query.error;
        }

        if (req.query.success) {
            data.success = req.query.success;
        }

        if (req.query.code) {
            data.code = req.query.code;
        } else {
            data.code = "";
        }

        if (req.query.email) { //<!-- mycorrection-->mytest
            data.email = req.query.email;
        }

        res.render('forgot-password.html', data);
    });

    app.post('/user/resendemail', function (req, res) {

        user.resendActivationEmail(req, function (status) {

            res.json(status);
        });
    });

    app.post('/user/getlocation', function (req, res) {

        user.getlocation(req, function (status) {

            res.json(status);
        });
    });

    app.post('/doforgotpw', function (req, res) {
        // process signup then send to activation page
        user.sendResetPasswordLink(req, function (data, err) {
            console.log("sendResetPasswordLink_callback");
            if (err) {
                res.redirect('/forgotpw?error=' + err);
                return;
            }
            res.redirect('/forgotpw?success=' + data);
        });
    });

    app.post('/updateAccountPassword', function (req, res) {

        user.updateAccountPassword(req, function (data, err) {
            if (err) {
                res.redirect('/forgotpw?error=' + err);
                return;
            }
            res.redirect('/forgotpw?success=' + data);
        });
    });

    app.post('/user/getDashboardFollowers', function (req, res) {
        user.getDashboardFollowers(req.body.dashId, function (data) {
            if (data.result == false)
                res.json({ids: false})
            else
                res.json({ids: data.result});
        });
    });

    app.post('/user/setDashboardFollowers', function (req, res) {
        user.setDashboardFollowers(req.body.dashId, req.body.follIds, function (data) {
            res.json({ids: data.resa})
        });
    });

    app.post('/user/addcampaign', function (req, res) {

        user.addCampaign(req, function (data) {
            if (data.status == false)
                res.json({status: false, message: data.message})
            else
                res.json({status: true, campaign: data.campaign});
        });
    });

    app.post('/user/deleteDashboard', function (req, res) {

        user.deleteDashboard(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/updateDashboard', function (req, res) {

        user.updateDashboard(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/addWidget', function (req, res) {

        user.addWidget(req, res, function (data) {
            res.json(data);
        });
    });

    app.post('/user/addTestWidget', function (req, res) {

        user.addWidget(req, function (data) {

            var res_data = {
                people_value: data[0].people,
                conversions_value: data[1].conversions,
                conversionRate_value: data[2].conversionRate
            };
            res.render("test/test_dash_widget.html", res_data);
        });
    });

    app.post('/user/deleteWidget', function (req, res) {

        user.deleteWidget(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/updateWidget', function (req, res) {

        user.updateWidget(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/addMultipleWidgets', function (req, res) {

        user.addMultipleWidgets(req, function (data) {
            res.json(data);
        });
    });



    app.post('/user/getDashboard', function (req, res) {

        user.getDashboard(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/getDashboardBindAccounts', function (req, res) {

        user.getDashboardBindAccounts(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/saveWidgetPositions', function (req, res) {
        user.saveWidgetPositions(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/saveWidgetPositionsOneByOne', function (req, res) {
        user.saveWidgetPositions(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/sendFeedback', function (req, res) {

        user.sendFeedback(req, function (data) {

            res.json(data);
        });
    });

    app.post('/user/addNetwork', function (req, res) {

        user.addNetwork(req, function (data) {

            res.json(data);
        });
    });

    app.post('/user/addNetworkAccount', function (req, res) {

        user.addNetworkAccount(req, function (data) {

            res.json(data);
        });
    });

    app.get('/user/getDashboardAdrollMetrics', function (req, res) {
        user.getDashboardAdrollMetrics(req, function (data) {
            res.json(data)
        })
    })

    app.post('/user/getPreNetworks', function (req, res) {

        user.getPreNetworks(req, function (data) {

            res.json(data);
        });
    });

    app.post('/user/getMetricDatas', function (req, res) {
        user.getMetricDatas(req, function (data) {
            res.json(data);
        });
    });


    app.post('/user/getDedicatedPage', function (req, res) {

        user.getDedicatedPage(req, function (data) {
            res.json(data);
        });
    });


    app.post('/user/unbindNetwork', function (req, res) {

        user.unbindNetwork(req, function (data) {

            res.json(data);
        });
    });

    app.post('/user/bindNetwork', function (req, res) {

        user.bindNetwork(req, function (data) {

            res.json(data);
        });
    });

    app.post('/user/sendAssignNotiEmail', function (req, res) {

        user.sendAssignNotiEmail(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/deleteNetwork', function (req, res) {

        user.deleteNetwork(req, function (data) {

            res.json(data);
        });
    });

    app.post('/user/updateWidgetsOfNetwork', function (req, res) {

        user.updateWidgetsOfNetwork(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/addClient', function (req, res) {

        user.addClient(req, function (data) {
            res.json(data);
        });
    });

    // app.get('/opencampaignwithtask', function(req,res) {

    // })


    app.post('/user/addAgency', function (req, res) {

        user.addAgency(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/disableProgressReport', function (req, res) {

        user.disableProgressReport(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/addUsers', function (req, res) {

        user.addUsers(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/removeChildUser', function (req, res) {

        user.removeChildUser(req, function (data) {
            res.json(data);
        });
    });

    app.post('/user/editChildUser', function (req, res) {

        user.editChildUser(req, function (data) {
            res.json(data);
        });
    });

};