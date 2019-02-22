var db = require('../commons/mysql.js'),
    config = require("../config/config"),
    md5 = require("md5"),
    async = require("async"),
    nodemailer = require('nodemailer'),
    fs = require('fs'),
    sgMail = require('@sendgrid/mail'),
    planModel = require('./plan');

sgMail.setApiKey("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");
//facebookWidgetData = require('../commons/facebookWidgetData.js');

// campname, newstatus, note, staff, campID

var User = {
    flags: {
        roleStaff: 'staff',
        roleClient: 'client',
        campaignAccessAll: 'all',
        campaignAccessRestricted: 'restricted'
    },

    numberTrialDays: 15,

    resolveSqlUpdatePromise: function (resolve, reject, error, result, message, resolveData) {
        if (error) {
            return reject({message: error.sqlMessage});
        }

        if(result.changedRows == 0) {
            return reject({message: message});
        }

        resolve(resolveData);
    },

    suggestions: function (user_id, url, dashId, iso, callback) {
        url = url.replace("https://", "")
        url = url.replace("http://", "")
        url = url.replace('/', "")
        db.query('SELECT suggestions FROM url_suggestions WHERE website_url = ?', [url], function (err, rows, fields) {
            if (!err && rows && rows.length != 0) {
                callback(rows[0].suggestions)
            }
            else {
                var Curl = require('node-libcurl').Curl;
                var curl = new Curl();

                curl.setOpt('URL', config.system.auth_url + 'dataforseo/kwrd_for_domain.php?domain=' + url + "&iso=" + iso);

                curl.setOpt('SSL_VERIFYPEER', false);
                curl.setOpt('SSL_VERIFYHOST', false);
                curl.setOpt('FOLLOWLOCATION', true);
                curl.on('end', function (statusCode, body, headers) {
                    if (body.indexOf("code: 404") != -1) {
                        callback(false)
                        return
                    }
                    db.query('INSERT INTO url_suggestions (user_id, dashboard_id, website_url, suggestions) VALUES (?, ?, ?, ?)', [user_id, dashId, url, JSON.stringify(body)], function () {
                        callback(JSON.stringify(body))
                    })
                });
                curl.perform();
            }
        })
    },
    getserviceorders: function (body, callback) {
        db.query(`SELECT * FROM client_services where campaign_id = ?`, [body.campaign_id], function (err, rows) {
            callback(rows)
        })
    },

    deleteform: function (body, callback) {
        db.query(`DELETE FROM agency_forms where form_id = ?`, [body], function (err, rows) {
            if (err) {
                callback(false)
            } else {
                callback(true)
            }
        })
    },

    saveservice: function (body, callback) {
        let campaign_id = body.campaign_id ? body.campaign_id : 0;
        let client_id = body.client_id ? body.client_id  : 0;
        let form_data = body.form_data;

        // status: 0 - active, 1 - paused, 2 - done, 3 - in progress, 4 - 
        let status = 0;
        let price = body.price;

        // type: 0 - fixed, !0 - every time period
        let type = body.type;
        db.query(`INSERT INTO client_services (campaign_id, client_id, form_data, created_at, status, price, type) VALUES (?, ?, ?, NOW(), ?, ?, ?)`, [campaign_id, client_id, form_data, status, price, type], function (err, rows) {
                if (err){
                    callback(false)
                }
                else {
                    callback(true)
                }
        })
    },

    getDashboardPublic: function (id, callback) {
        db.query("SELECT company_name FROM dashboards WHERE id = ? ", [id], function (err, rows, fields) {
            if (!err && rows.length > 0) {
                callback({status: true, result: rows[0]})
            } else if (!err && rows.length == 0) {
                callback({status: true, result: "Not found"})
            }
            else if (err) {
                callback({status: false, result: "Error occured"})
            }
        })
    },
    managekeywords: function (words, id, uid, callback) {

        let query = 'REPLACE INTO keywords (keyword, address, country_iso_code, country, region, city, deleted_at, dashboard_id) VALUES';
        let keywords = JSON.parse(words);
        let data = [];
        keywords.forEach(function (value) {
            data.push(value.keyword, value.address, value.country_iso_code, value.country, value.region, value.city, value.deleted_at, id);
            query += ' (?, ?, ?, ?, ?, ?, ?, ?),'
        });
        query = query.slice(0, -1);

        db.query(query, data, function (err, rows, flds) {
            return callback(!err);
        })
    },
    get_rank_results: function (obj, callback) {
        let query = 'SELECT * FROM rank_tracking WHERE dashboard_id = ?';
        let queryData = [obj.id];

        if (obj.startDate && obj.endDate) {
            query += ' AND dated <= ? AND dated >= ?';
            queryData.push(obj.endDate, obj.startDate);
        }
        query += ' AND keyword_id > 0';

        db.query(query, queryData, function (err, data, fields) {
            callback(data);
        });
    },
    sendNotification: function (type, info) {
        var self = this
        var backendUrl = config.system.auth_url;
        var siteUrl = config.system.url;
        var msg = {
            // from: 'Ezond@ezond.com',
            // fromname: 'Ezond',
            from: {
                email: 'ezond@ezond.com',
                name: 'Ezond'
            },
            subject: "Campaign status changed",
            text: "Result of testing"
        };
        var recipients = [];
        let message = ``;
        var color = info.newstatus == 'Normal' ? 'green' : (info.newstatus == 'Review Required' ? 'orange' : '#E06666')
        // type == 1 - changed 
        if (type == 1) {
            message = `<div style="font-family: Helvetica; width: 540px; margin: 0 auto;">
                <img style="margin-bottom: 30px" src="` + backendUrl + `apis/agencyProfileImage.php?preview=0&user_id=blank" alt="" width="180" height="70">
                <div style="font-size: 30px;font-weight: 700; color: ${color}; margin-bottom: 15px"><i>` + info.campname + `</i> ` + info.newstatus + ` Status</div>
                <div style=" font-size: 17px;">` + info.staff + ` has changed Campaign status to ` + info.newstatus + `.</div>
                <br>
                <div style="font-size: 17px;"><strong style="color: rgb(102, 102, 102);">` + info.newstatus + ` Note:</strong> <i>` + info.note + `</i></div>
                <a href="` + siteUrl + `#!/app/campaignmanagement/${info.campID}" style="text-decoration: none; display:block; cursor: pointer;width: 290px;margin-top: 30px;line-height: 50px;font-size: 20px;background-color: rgb(83, 185, 135); border-radius: 4px; color: white; text-align: center">View Campaign</a>
                </div>`;
        } else if (type == 2) {
            msg.subject = `New message in campaign ${info.campname}.`
            message = `<div style="font-family: Helvetica; width: 540px; margin: 0 auto;">
                <img style="margin-bottom: 30px" src="` + backendUrl + `apis/agencyProfileImage.php?preview=0&user_id=blank" alt="" width="180" height="70">
                <div style="font-size: 30px;font-weight: 700; color: rgb(102, 102, 102); margin-bottom: 15px">Messages on ${info.campname} Campaign</div>
                <div style=" font-size: 17px;">${info.staff} has left a comment.</div>
                <br>
                <div style="font-size: 17px;"><strong style="color: rgb(102, 102, 102);">Comment:</strong> <i>${info.message}</i></div>
                <a href="` + siteUrl + `#!/app/campaignmanagement/${info.campID}" style="text-decoration: none; display:block; cursor: pointer;width: 290px;margin-top: 30px;line-height: 50px;font-size: 20px;background-color: rgb(83, 185, 135); border-radius: 4px; color: white; text-align: center">View Comments</a>
            </div>`
        } else if (type == 3) {
            msg.subject = `${info.staff} assigned you task.`
            message = `<div style="font-family: Helvetica; width: 540px; margin: 0 auto;">
                <img style="margin-bottom: 30px" src="` + backendUrl + `apis/agencyProfileImage.php?preview=0&user_id=blank" alt="" width="180" height="70">
                <div style="font-size: 30px;font-weight: 700; color: rgb(102, 102, 102); margin-bottom: 15px">Tasks Assigned</div>
                <div style=" font-size: 17px;">${info.staff} has assigned you a task.</div>
                <br>
                <div style="font-size: 17px;"><strong style="">Task Details:</strong> <i style="color: rgb(230, 145, 56);">${info.details}</i></div>
                <a href="` + siteUrl + `#!/app/campaignmanagement/${info.campID}" style="text-decoration: none; display:block; cursor: pointer;width: 290px;margin-top: 30px;line-height: 50px;font-size: 20px;background-color: rgb(83, 185, 135); border-radius: 4px; color: white; text-align: center">View Comments</a>
            </div>`

            let query = `SELECT email FROM agency_users where id = ${info.whom}`

            db.query(query, [], function (err, rows, fields) {
                if (err)
                    return
                recipients = []
                rows.forEach(function (value) {
                    recipients.push(value.email)
                })

                msg.html = message
                for (var i = recipients.length - 1; i >= 0; i--) {
                    msg.to = recipients[i]
                    sgMail.send(msg);
                }
            })
            return
        }
        self.getDashboardFollowers(info.campID, function (back) {
            if (back.result == false || back.result == 'all') {

                db.query("SELECT ownerID FROM dashboards WHERE id = ?", [info.campID], function (err, rows, fields) {

                    if (!err && rows.length != 0) {

                        db.query("SELECT email FROM agency_users where parent_id = ? AND role = 'staff' ", [rows[0].ownerID], function (err, rows, fields) {

                            rows.forEach(function (value) {
                                recipients.push(value.email)
                            })
                            msg.html = message
                            for (var i = recipients.length - 1; i >= 0; i--) {
                                msg.to = recipients[i]
                                sgMail.send(msg);
                            }
                        })
                    } else {
                        return
                    }
                })
            } else if (back.result == 'none') {
                return
            } else {
                recipients = `( ${back.result} )`

                let query = `SELECT email FROM agency_users where id in ${recipients}`
                if (type == 3)
                    query = `SELECT email FROM agency_users where id = ${info.whom}`

                db.query(query, [], function (err, rows, fields) {
                    if (err)
                        return
                    recipients = []
                    rows.forEach(function (value) {
                        recipients.push(value.email)
                    })

                    msg.html = message
                    for (var i = recipients.length - 1; i >= 0; i--) {
                        msg.to = recipients[i]
                        sgMail.send(msg);
                    }
                })
            }
        })

    },

    getDashboardFollowers: function (dashId, callback) {
        db.query("SELECT followers_ids FROM dashboard_followers where dashboard_id = ?", [dashId], function (err, rows, fields) {
            if (rows.length != 0) {
                return callback({result: rows[0].followers_ids})
            } else
                return callback({result: false})
        })
    },
    setDashboardFollowers: function (dashId, follsIds, callback) {
        db.query("SELECT count(*) as cnt from dashboard_followers where dashboard_id = ?", [dashId], function (err, rows, fields) {
            if (rows[0].cnt == 0) {
                db.query("INSERT INTO dashboard_followers SET dashboard_id = ?, followers_ids = ?", [dashId, follsIds], function (err, rows, fields) {
                    return callback({resa: 'true'})
                })
            } else {
                db.query("UPDATE dashboard_followers SET followers_ids = ? WHERE dashboard_id = ?", [follsIds, dashId], function (err, rows, fields) {
                    return callback({resa: 'true2'})
                })
            }
        })
    },
    saveAgencyForm: function (req, callback) {
        db.query("INSERT INTO agency_forms (agency_id, form_fields, form_key) VALUES (?, ?, ?)", [req.body.agency_id, req.body.form, md5((new Date())/1000)], function (er, row, fiel) {
            callback(row)
        })
    },
    /*used*/
    getuserIdByWlName: function (wlName, callback) {
        db.query("SELECT id FROM users where domainName = ?", [wlName], function (er, rows) {
            if (rows.length > 0)
                return callback(rows[0].id)
            else
                return callback('blank')
        })
    },

    setCustomerInfo: function (customer, customerInfo) {
        let self = this;
        let message = 'An error occurred while saving the customer';

        return new Promise((resolve, reject) => {
            db.query("UPDATE users SET stripe_customer_id = ? WHERE id = ?", [customer.id, customerInfo.userId],
                (error, result) => self.resolveSqlUpdatePromise(resolve, reject, error, result, message, customer)
            )
        });
    },

    createSubscription: function (subscription, userId, billingPlanId, planMaps, billingInfo) {
        let self = this;

        let data = [
            subscription.id,
            'PENDING',
            billingPlanId,
            billingInfo,
            userId
        ];

        return new Promise((resolve, reject) => {
            db.query('UPDATE subscriptions SET stripe_id = ?, status = ?, billing_plan_id = ?, billing_info = ? WHERE user_id = ?', data, function (error, rows, fields) {
                if(error) {
                    return reject({message: error.sqlMessage});
                }
                if(rows.changedRows == 0) {
                    return reject({message: 'A subscription for the user was not found in the database'});
                }
                db.query('SELECT id FROM subscriptions WHERE user_id = ?', [userId], function (error, rows, fields) {
                    if(error) {
                        return reject({message: error.sqlMessage});
                    }

                    let subscriptionId = rows[0].id;
                    let subscriptionItems = subscription.items.data;

                    let sql = 'INSERT INTO subscription_items (subscription_id, plan_id, stripe_id, quantity) VALUES ';
                    let queryPlaceholders = [];
                    let insertData = [];

                    subscriptionItems.forEach(function (item) {
                        queryPlaceholders.push('(?, ?, ?, ?)');
                        insertData.push(subscriptionId, planMaps[item.plan.id], item.id, item.quantity);
                    });

                    sql += queryPlaceholders.join(', ');

                    db.query(sql, insertData, function (error, result, fields) {
                        if(error) {
                            return reject({message: error.sqlMessage});
                        }

                        resolve({status: 'ok'});
                    })
                })
            })
        });
    },

    updateSubscriptionPeriod: function (data) {

        return new Promise((resolve, reject) => {
            let self = this;
            let message = 'There was an error updating the subscription period';
            let subscriptionId = data.subscriptionId;
            let expiredAt = data.expiredAt;

            if(!subscriptionId || !expiredAt) {
                reject({message: 'Empty subscription data'})
            }

            db.query('UPDATE subscriptions SET expires_at = ?, status = "PAID" WHERE stripe_id = ?', [expiredAt, subscriptionId],
                (error, result) => self.resolveSqlUpdatePromise(resolve, reject, error, result, message, expiredAt)
            )
        })
    },

    createFreeSubscription: function (customerInfo, planId, callback) {
        let self = this;

        planModel.get(planId, function (plan) {
            let message = 'An error occurred while creating a free subscription';
            let interval = plan.interval;
            let now = new Date();
            let nextDate = new Date();
            interval == 'year' ? nextDate.setYear(now.getFullYear() +1) : nextDate.setMonth(now.getMonth() +1);
            let expiredAt = Math.floor(nextDate / 1000);

            return callback(
                new Promise((resolve, reject) => {
                    db.query('UPDATE subscriptions SET billing_plan_id = ?, expires_at = ? WHERE user_id = ?', [planId, expiredAt, customerInfo.userId],
                        (error, result) => self.resolveSqlUpdatePromise(resolve, reject, error, result, message, {status: 'ok'})
                    )
                })
            )
        });
    },

    getSubscriptionPlans: function (userId, callback) {
        db.query('SELECT id, billing_plan_id, expires_at FROM subscriptions WHERE user_id = ?', [userId], function(error, data, fields) {
            if(!error) {
                let subscription = data[0];
                db.query('SELECT * FROM subscription_items WHERE subscription_id = ?', [subscription.id], function(error, rows, fields) {
                    if(!error) {
                        let userPlanIds = [];
                        let sqlSuffix = [];
                        let userPlans = {};
                        
                        function fillUserPlansAndSqlData(key, value) {
                            userPlanIds.push(key);
                            sqlSuffix.push('?');
                            userPlans[key] = {};
                            userPlans[key].quantity = value;
                        }

                        if(rows.length > 0) {
                            rows.forEach(function(item) {
                                fillUserPlansAndSqlData(item.plan_id, item.quantity)
                            })
                        } else {
                            fillUserPlansAndSqlData(subscription.billing_plan_id, 1);
                        }

                        db.query('SELECT * FROM plans WHERE id IN (' + sqlSuffix.join(', ') + ')', userPlanIds, function (error, rows, fields) {

                            if(!error) {
                                rows.forEach(function (plan) {
                                    userPlans[plan.id].plan = plan;
                                });
                                userPlans.expires_at = subscription.expires_at;

                                callback(userPlans);
                            }
                        })
                    }
                })
            }
        })
    },
    
    getLimitOfSubscriptionOptions: function (userPlans, userId, callback) {
        let self = this;
        let limits = {
            campaigns: 0,
            keywords: 0,
            ad_keywords: 0,
        };

        function calculateLimits(plansList) {
            if(plansList.expires_at > (+new Date() / 1000 | 0)) {
                for(let key in plansList) {
                    if(key == 'expires_at') {
                        continue;
                    }

                    let plan = plansList[key].plan;
                    let quantity = plansList[key].quantity;

                    limits.campaigns += plan.campaigns_number * quantity;
                    limits.keywords += plan.keywords_number * quantity;
                    limits.ad_keywords += plan.ad_keywords_number * quantity;
                }
            }
        }

        if(userPlans) {
            calculateLimits(userPlans);
            callback(limits);
        } else {
            self.getSubscriptionPlans(userId, function (plans) {
                calculateLimits(plans);
                callback(limits);
            })
        }
    },

    getUsedOptions: function (userId, callback) {
        let usedOptions = {
            campaigns: 0,
            keywords: 0,
            ad_keywords: 0,
        };

        db.query('SELECT id FROM dashboards WHERE ownerID = ?', [userId], function (error, data, fields) {
            if(!error) {
                let campaignIds = data;
                let sqlPlaceholders = [];
                let sqlData = [];
                usedOptions.campaigns = campaignIds.length;

                if(campaignIds.length == 0) {
                    usedOptions.keywords = 0;
                    return callback(usedOptions);
                }

                campaignIds.forEach(function (item) {
                    sqlPlaceholders.push('?');
                    sqlData.push(item.id);
                });

                let sqlSuffix = sqlPlaceholders.join(', ');

                db.query('SELECT COUNT(*) as numbers FROM keywords WHERE dashboard_id IN (' + sqlSuffix + ') AND deleted_at IS NULL', sqlData, function (error, data, fields) {
                    if(!error) {
                        usedOptions.keywords = data[0].numbers;
                        callback(usedOptions);
                    }
                })
            }
        })

    },

    getUserData: function (userID, forAuth, callback) { //forAuth= true: calling for "user/auth" forAuth=false : otherwise
        console.log("Model user -> getUserData");

        var self = this;

        db.query('SELECT * FROM users WHERE id = ?', [userID], function (err, rows, fields) {
            // if (err) throw err;
            if (rows.length !== 1) {

                // Check if it is a child user
                db.query('SELECT * FROM agency_users WHERE id = ?', [userID], function (err, rows, fields) {
                    // if (err) throw err;
                    if (rows.length !== 1) {
                        return callback({status: false, message: 'System error'});
                    } else {
                        self.getChildUserData(rows[0], false, function (data) {
                            return callback(data);
                        });
                    }

                });

            } else {

                var user = rows[0];

                user.firstLogin = false;

                if (user.lastLogin === null) {

                    user.firstLogin = true;

                }

                self.getNetworkList(user.id, function (networks) {

                    user.networks = networks;

                    self.checkProgressReport(user, function (progressReport) {

                        if (progressReport) {

                            user.progressReport = progressReport;
                        }

                        self.getSubscriptionInfo(user.id, function (result) {
                            return callback(Object.assign({}, user, result));
                        })
                    });
                });
            }
        });
    },
    getBillingPlan: function (user, callback) {
        let sql = `SELECT p.id, p.name, p.interval, p.stripe_id, p.trial, s.expires_at
                        FROM plans p
                            INNER JOIN subscriptions s ON s.billing_plan_id=p.id
                                WHERE user_id = ?`;

        db.query(sql, [user.id], function (er, result) {
            if (er)
                console.log(er)
            callback(result)
        });
    },
    getSubscriptionExpire: function (userId, callback) {
        if (userId) {
            db.query("SELECT expires_at FROM subscriptions WHERE user_id = ?", [userId], function (er, result) {
                if (result.length > 0){
                    callback(result[0].expires_at);
                } else {
                    callback({})
                }
            })
        }
    },
    /*used*/
    getChildUserData: function (childUserData, forAuth, callback) { //forAuth= true: calling for "user/auth" forAuth=false : otherwise
        console.log("Model user -> getChildUserData");
        console.log("is forAuth")
        console.log(forAuth)
        console.log("childUserData.parent_id")
        console.log(childUserData.parent_id)

        var self = this;

        db.query('SELECT * FROM users WHERE id = ?', [childUserData.parent_id], function (err, rows, fields) {
            // if (err) throw err;

            if (rows && rows.length !== 1) return callback({status: false, message: 'System error'});

            var user = rows[0];

            self.getNetworkList(user.id, function (networks) {

                user.networks = networks;

                self.checkProgressReport(user, function (progressReport) {

                    if (progressReport) {

                        user.progressReport = progressReport;
                    }

                    self.doWidgetDataUpdate(user, function () {

                        // Update users last login
                        if (forAuth) {

                            if (user.agencyID > 0) {

                                self.getAgency(user.agencyID, function (agency) {

                                    user.agency = agency;
                                    return callback(user);
                                });
                            } else {

                                return callback(user);
                            }

                        } else {

                            // Retrieve dashboard list
                            if (user.agencyID > 0) {

                                self.getAgency(user.agencyID, function (agency) {

                                    user.agency = agency;
                                    return callback(user);
                                });
                            } else {
                                // Set user id to be proper child user id and add child related data
                                user.id = childUserData.id;
                                user.first_name = childUserData.first_name;
                                user.last_name = childUserData.last_name;
                                user.email = childUserData.email;
                                user.role = childUserData.role;
                                user.parent_id = childUserData.parent_id;
                                user.agencyID = childUserData.agencyID;
                                user.admin_level = 0;
                                user.campaign_access = childUserData.campaign_access;
                                user.campaigns_allowed = childUserData.campaigns_allowed;
                                user.providers_allowed = childUserData.providers_allowed;

                                self.getSubscriptionInfo(childUserData.agencyID, function (result) {
                                    return callback(Object.assign({}, user, result));
                                })
                            }
                        }
                    });
                });
            });
        });
    },

    getSubscriptionInfo: function (userId, callback) {
        self = this;
        let user = {};

        self.getBillingPlan({id: userId}, function (plan) {
            if (plan.length == 1) {
                user.planSubscribed = plan[0];

                self.getSubscriptionPlans(userId, function (plans) {
                    user.plans = plans;

                    if (self.getLimitOfSubscriptionOptions) {
                        self.getLimitOfSubscriptionOptions(plans, userId, function (limits) {
                            user.limits = limits;
                            self.getUsedOptions(userId, function (result) {
                                user.usedOptions = result;

                                return callback(user);
                            })
                        })
                    } else {
                        self.getUsedOptions(userId, function (result) {
                            user.usedOptions = result;

                            return callback(user);
                        })
                    }
                    
                })
            }
        });
    },

    /*used*/
    auth: function (email, pass, callback) {

        var self = this;
        var field = 'password'
        if (pass.indexOf('hashed') == -1) {
            pass = md5(config.system.db_salt + pass);
            var field = 'password'
        } else {
            var field = 'activateCode'
            pass = pass.substr(6)
        }

        db.query('SELECT * FROM users WHERE email = ? AND ' + field + ' = ?', [email, pass], function (err, rows, fields) {

            // if (err) throw err;
            var user = rows[0];
            // If user exists
            if (rows.length === 1) {

                console.log("auth -> getUserData");
                self.getUserData(user.id, true, function (userData) { //true mean calling this func for auth, auth: true, otherwise: false

                    callback(userData, false);
                });

            } else {

                // TEMPORARY SOLUTION:
                // User created staff and clients will login through the main login screen for now.
                // Later on they should login through a separate form

                db.query('SELECT * FROM agency_users WHERE email = ? AND password = ?', [email, pass], function (err, rows, fields) {

                    // if (err) throw err;
                    var user = rows[0];

                    // If user exists
                    if (rows.length === 1) {

                        console.log("auth -> getUserData (Child user)");
                        self.getChildUserData(user, false, function (userData) { //true mean calling this func for auth, auth: true, otherwise: false

                            callback(userData, false);
                        });


                    } else {

                        callback(false, "Email/Password incorrect.");
                    }
                });
            }
        });
    },
    checkProgressReport: function (user, callback) {
        // New use defer popup for one day
        if (user.showProgressPopup === null) {
            db.query('UPDATE users SET showProgressPopup = DATE_ADD(now(), INTERVAL 1 DAY) WHERE id = ?', [user.id], function (err, result) {
                // if (err) throw err;
                callback(false);
            });
            return;
        }

        var self = this;

        // determine if we should show daily progress report
        db.query('SELECT TIMESTAMPDIFF(SECOND, now(), (SELECT showProgressPopup FROM users WHERE id = ?)) AS diff', [user.id], function (err, result) {
            // 1 day = 86400 seconds
            if (result && result[0].diff <= 0 && !user.firstLogin) {
                // get last login for user to determine if we should show daily progress report
                db.query('UPDATE users SET showProgressPopup = DATE_ADD(now(), INTERVAL 1 DAY) ', [user.id], function (err, result) {
                    // if (err) throw err;
                    self.getProgressReportMetricData(user, function (report) {
                        callback(report);
                    });
                });
            } else {
                callback(false);
            }
        });
    },

    getProgressReportMetricData: function (user, callback) {
        var targetMetric = user.progressReportMetric.split(":");
        var table = "";
        var type = "";
        var metric = targetMetric[1];

        if (targetMetric[0] === "ga") {
            table = "users_data_google_analytics";
            type = "Google Analytics";
        } else if (targetMetric[0] == "aw") {
            table = "users_data_adwords";
            type = "Google Adwords";
        }

        // compare todays data to last days data and show user
        db.query('SELECT ' + metric + ' AS metric FROM ' + table + ' WHERE saveTime BETWEEN DATE_SUB(now(), INTERVAL 2 DAY) AND now() AND userID = ?', [user.id], function (err, result) {
            // if (err) throw err;
            if (result && result.length > 0) {
                var report = {
                    value: result[1].metric - result[0].metric,
                    metric: metric,
                    type: type,
                    today: result[1].metric,
                    yesterday: result[0].metric
                };

                if (report.value >= -result[0].metric && report.value <= 0) {
                    report.emoticon = "sad";
                } else if (report.value <= -result[0].metric) {
                    report.emoticon = "crying";
                } else if (report.value > 0 && report.value < result[0].metric) {
                    report.emoticon = "smile";
                } else if (report.value > result[0].metric) {
                    report.emoticon = "happy";
                }
                callback(report);
            } else {
                callback(false);
            }
        });
    },

    disableProgressReport: function (req, callback) {
        if (req.session.user) {
            delete req.session.user.progressReport;
            callback(true);
        }
    },
    /*used*/
    updateUserLastLogin: function (id, callback) {
        db.query('UPDATE users SET lastLogin = now() WHERE id = ?', [id], function (err, result) {
            // if (err) throw err;
            callback(result);
        });
    },

    getAgency: function (id, callback) {
        db.query('SELECT * FROM users WHERE id = ?', [id], function (err, result) {
            // if (err) throw err;
            callback(result[0]);
        });
    },
    /*used*/
    getNetworkList: function (id, callback) {
        db.query('SELECT * FROM users_networks WHERE userID = ?', [id], function (err, data, fields) {
            // if (err) throw err;
            callback(data);
            return;
        });
    },
    /*used*/
    delete999networks: function (req, callback) {
        let userID = req.body.userID;
        db.query('DELETE from users_networks where dashboardID=999 and userID=?', [userID], function (err, data, fields) {
            callback();
        });
    },
    addCampaign: function (req, callback) {
        if (req.session.user) {
            console.log("called user.addCampaign!");

            var self = this;
            // check if this is an agency adding a dashboard

            var description = {
                url: req.body.url,
                location: req.body.location,
                group: req.body.group || ""
            };

            var userId = req.body.userID;
            if (typeof req.session.user.parent_id != 'undefined') {
                userId = req.session.user.parent_id
            };

            var assignerID = userId;
            var keywords = "";
            if (typeof req.body.keywords != "undefined") {
                keywords = req.body.keywords;
            }
            var keywords_str = JSON.stringify(keywords.split("\n"));
            var disallow = false;

            self.getSubscriptionExpire(userId, function (timeExpire) {
                if(timeExpire && timeExpire > (+new Date() / 1000 | 0)) {
                    self.getLimitOfSubscriptionOptions(null, userId, function (limits) {
                        self.getUsedOptions(userId, function (usedOptions) {
                            if(limits.campaigns <= usedOptions.campaigns) {
                                disallow = true;
                                callback({status: false, message: "You have reached the limit of campaigns available to you"});
                                return;
                            }

                            var sql = 'INSERT INTO dashboards (`ownerID`, `assignerID`, `company_name`, `description`, `keywords`) VALUES (?, ?, ?, ?, ?)';
                            var insertData = [userId, assignerID, req.body.company_name, JSON.stringify(description), keywords_str];

                            db.query(sql, insertData, function (err, data, fields) {
                                if (typeof data != 'undefined') {
                                    db.query('UPDATE users_networks SET dashboardID=? WHERE userID=? AND dashboardID=999',
                                        [data.insertId, userId],
                                        function (err, data, fields) {
                                        });
                                }

                                if (!err) {
                                    console.log("no error");
                                    var campaign = {
                                        id: data.insertId,
                                        ownerID: userId,
                                        assignerID: userId,
                                        company_name: req.body.company_name,
                                        description: JSON.stringify(description),
                                        keywords: req.body.keywords,
                                        tagColor: '',
                                        actionCount: 0
                                    };
                                    callback({status: true, campaign: campaign});
                                }
                            });
                            if (typeof req.session.user.parent_id == 'undefined') {
                                self.updateUserLastLogin(req.body.userID, function () {});
                            }
                        })
                    })
                }
            });
        } else {
            callback({status: false, message: "Log in please or refresh page"})
        }
    },
    /*used*/
    deleteDashboard: function (req, callback) {
        if (req.session.user) {
            var self = this;
            // 13.03 prevent deleting dashboards which user not owning 
            db.query('DELETE FROM dashboards WHERE id = ? AND ownerID = ?', [req.body.id, req.session.user.id], function (err, data, fields) {
                // if (err) throw err;
                db.query('DELETE widgets FROM widgets join dashboards on widgets.dashboardID = ? where dashboards.ownerID = ? ', [req.body.id, req.session.user.id], function (err, data, fields) {
                    // if (err) throw err;
                    db.query('DELETE FROM users_networks WHERE dashboardID = ? AND userID = ?', [req.body.id, req.session.user.id], function (err, data, fields) {
                        // if (err) throw err;
                        self.getUserDashboardList(req.session.user.id, function (dashboards) {
                            req.session.user.dashboards = dashboards;

                            if (dashboards.length == 0) {
                                db.query('UPDATE users set lastLogin = null WHERE id = ?', [req.session.user.id], function (err, data, fields) {
                                    // if (err) throw err;
                                });
                            }

                            var resultData = {
                                id: req.body.id
                            };
                            callback(resultData);
                        });
                    });
                });
            });
        }
    },
    /*used*/
    deleteWidget: function (req, callback) {
        if (req.session.user) {
            // SELECT ownerID FROM dashboards
            db.query('DELETE FROM widgets WHERE id = ? AND dashboardID in (SELECT id from dashboards where ownerID = ? )', [req.body.id, req.session.user.id], function (err, data, fields) {
            // db.query('DELETE FROM widgets WHERE id = ? AND dashboardID in (SELECT id from dashboards)', [req.body.id, req.session.user.id], function (err, data, fields) {
                if (err) throw err;
                var resultData = {
                    id: req.body.id
                };
                callback(resultData);
            });
        }
    },
    /*used*/
    addWidget: function (req, res, callback) {
        var self = this;
        var currentUser = req.session.user;
        var dashboardId = req.body.dashboardID;

        db.query('SELECT ? in (SELECT id FROM dashboards WHERE ownerID = ?) ownerr;', [dashboardId, currentUser.id], function (err, data, fields) {
            var allowAddWidget = data[0].ownerr > 0;

            if (!allowAddWidget && currentUser.role === self.flags.roleStaff) {
                allowAddWidget = currentUser.campaign_access === self.flags.campaignAccessAll || JSON.parse(currentUser.campaigns_allowed).indexOf(dashboardId) > -1;
            }

            if (allowAddWidget) {
                db.query('INSERT INTO widgets (`dashboardID`, `metric1`, `metric2`, `size`, `network`,`networkName`,`networkLogo`, `layout`, `viewID`) VALUES (?, ?, ? ,?, ?, ?, ?, ?, ?)', [req.body.dashboardID, req.body.metric1, req.body.metric2, req.body.size, req.body.network, req.body.networkname, req.body.networklogo, req.body.layout, req.body.view], function (err, data, fields) {

                    var widget = {
                        id: data.insertId,
                        metric1: req.body.metric1,
                        metric2: req.body.metric2,
                        size: req.body.size,
                        layout: req.body.layout,
                        network: req.body.network,
                        networkName: req.body.networkname,
                        networkLogo: req.body.networklogo,
                    };

                    callback(widget);
                });
            }
        })
    },

    addMultipleWidgets: function (req, callback) {
        if (req.session.user) {
            if (req.body.widgets) {
                // parse json string to widget object
                widgetSet = JSON.parse(req.body.widgets);

                widgets = widgetSet.widgets;

                var valuesString = "";
                var params = [];

                for (i = 0; i < widgets.length; i++) {
                    valuesString += "(?, ? , ?, ?, ?, ?, ?, ?, ?)";
                    if (i !== widgets.length - 1) {
                        valuesString += ", ";
                    }
                }

                var widgetTypes = require("./widgetTypes");

                var resultWidgets = [];
                var insertParams = [];
                async.eachSeries(widgets, function iteratee(item, callback) {
                    var defaultWidget = widgetTypes.getWidgetByName(item.did);

                    // extra the data we need to retrieve from database for this widgetSet
                    // returns key = db_col value = db_col_value
                    var getString = "";
                    var params = [];
                    for (var i = 0; i < defaultWidget.data.length; i++) {
                        var j = 0;
                        for (var key in defaultWidget.data[i]) {
                            if (key.substring(0, 2) !== "v:") {
                                if (key !== "alias") {
                                    if ('alias' in defaultWidget.data[i]) {
                                        getString += key + " AS " + defaultWidget.data[i].alias + ",";
                                    } else {
                                        getString += key + ",";
                                    }
                                }
                            } else {
                                var param = key.substring(2);
                                var temp = {};
                                temp[param] = defaultWidget.data[i][key];
                                params.push(temp);
                            }
                            j++;
                        }
                    }

                    // remove trailing comma
                    getString = getString.substring(0, getString.length - 1);

                    var networkTable = "";
                    if (defaultWidget.network === 1) {
                        networkTable = "users_data_google_analytics";
                    } else if (defaultWidget.network === 2) {
                        networkTable = "users_data_adwords";
                    }

                    var userID = req.session.user.id;
                    if (req.body.userID) {
                        userID = req.body.userID;
                    }

                    db.query('SELECT ' + getString + ' FROM ' + networkTable + ' WHERE userID = ? AND Date(saveTime) = Curdate() AND viewID = ?', [userID, req.body.view], function (err, wData, fields) {
                        // if (err) throw err;
                        var widgetData = params;
                        if (wData.length !== 0) {
                            widgetData = wData.concat(params);
                        }

                        // select info from database based on default widget settings
                        var widget = {
                            did: item.did,
                            name: item.name,
                            description: item.description,
                            size: item.size,
                            layout: defaultWidget.layout,
                            network: defaultWidget.network,
                            data: widgetData
                        };

                        insertParams.push(widgetSet.dashboardID);
                        insertParams.push(item.did);
                        insertParams.push(item.name);
                        insertParams.push(item.description);
                        insertParams.push(item.size);
                        insertParams.push(JSON.stringify(widgetData));
                        insertParams.push(defaultWidget.network);
                        insertParams.push(defaultWidget.layout);
                        insertParams.push(req.body.view);

                        resultWidgets.push(widget);
                        callback();
                    });
                }, function done(err, data) {
                    db.query('INSERT INTO widgets (`dashboardID`, `did`, `name`, `description`, `size`, `data`, `network`, `layout`, `viewID`) VALUES ' + valuesString,
                        insertParams,
                        function (err, data, fields) {
                            // if (err) throw err;
                            for (var k = 0; k < data.affectedRows; k++) {
                                resultWidgets[k].id = data.insertId + k;
                            }
                            callback(resultWidgets);
                        });
                });
            }
        }
    },
    /*used*/
    getDashboard: function (req, callback) {
        console.log("Model user -> getDashboard");

        db.query('SELECT * FROM dashboards WHERE id = ?', [req.body.id], function (err, dashboard, fields) {
            if (err) {
                console.log(err);
            } else {
                dashboard = dashboard[0];
                db.query('SELECT * FROM keywords WHERE dashboard_id = ? and deleted_at IS NULL', [req.body.id], function (err, keywords, fields) {
                    dashboard.keywords = keywords;
                    dashboard.widgets = [];
                    db.query('SELECT * FROM widgets WHERE dashboardID = ? ORDER BY positionRow, positionCol', [req.body.id], function (err, widgets, fields) {
                        // if (err) throw err;
                        for (var i = 0; i < widgets.length; i++) {
                            var widget = widgets[i];
                            dashboard.widgets.push(widget);
                        }
                        dashboard.integrations = [];
                        db.query('select id, networkID, account, viewID FROM users_networks WHERE (defaultCheck=1 AND dashboardID= ?) OR (networkID=10 AND dashboardID=?)', [req.body.id, req.body.id], function (err, integrations, fields) {
                            // if (err) throw err;
                            for (var i = 0; i < integrations.length; i++) {
                                var integration = integrations[i];
                                dashboard.integrations.push(integration);
                            }
                            callback(dashboard);
                        });
                    });
                });
            }
        });
        // }
    },
    getDashboardBindAccounts: function (req, callback) {
        console.log("Model user -> getDashboard Bind Account");
        if (req.session.user) {
            db.query('select id, networkID, account, viewID FROM users_networks WHERE (defaultCheck=1 AND dashboardID= ?) OR (networkID=10 AND dashboardID=?)', [req.body.id, req.body.id], function (err, integrations, fields) {
                // if (err) throw err;
                callback(integrations);
            });
        }
    },
    /*used*/
    getUserDashboardList: function (id, callback) {
        db.query('SELECT * FROM dashboards WHERE ownerID = ? AND active = 1', [id], function (err, data, fields) {
            // if (err) throw err;
            return callback(data);
        });
    },
    /*used*/
    getChildUsers: function (id, callback) {

        db.query('SELECT id, first_name, last_name, role, campaign_access, parent_id FROM agency_users WHERE (agencyID = ? and role="client") or parent_id = ?)', [id, id], function (err, data, fields) {
            // if (err) throw err;
            return callback(data);
        });
    },
    /*used*/
    updateDashboard: function (req, callback) {
        if (req.session.user) {
            var self = this;

            var description = {
                url: req.body.url,
                location: req.body.location,
                group: req.body.group || ""
            };

            db.query('UPDATE dashboards SET company_name = ?, description = ? WHERE id = ?', [req.body.company_name, JSON.stringify(description), req.body.id], function (err, result) {
                // if (err) throw err;
                var campaign = {
                    id: req.body.id,
                    ownerID: req.body.userID,
                    company_name: req.body.company_name,
                    description: JSON.stringify(description),
                    keywords: req.body.keywords
                };
                console.log("updateCampaign return: " + JSON.stringify(campaign));
                callback(campaign);

            });

        }
    },
    /*used*/
    updateWidget: function (req, callback) {
        if (req.session.user) {
            var self = this;
            db.query('UPDATE widgets SET metric1 = ?, metric2 = ? WHERE id = ?', [req.body.metric1, req.body.metric2, req.body.id], function (err, result) {
                var resultData = {
                    id: req.body.id,
                    metric1: req.body.metric1,
                    metric2: req.body.metric2,
                };
                callback(resultData);
            });
        }
    },
    /*used*/
    saveWidgetPositions: function (req, callback) {
        if (req.session.user) {
            if (req.body.widgetData) {

                console.log("check point saveWidgetPositions");

                var Curl = require('node-libcurl').Curl;
                var curl = new Curl();
                curl.setOpt('URL', config.system.auth_url + 'apis/saveWidgetPositions.php?data=' + req.body.widgetData);

                curl.setOpt('SSL_VERIFYPEER', false);
                curl.setOpt('SSL_VERIFYHOST', false);
                curl.setOpt('FOLLOWLOCATION', true);
                curl.on('end', function (statusCode, body, headers) {
                    callback(body);
                });
                curl.perform();

            }
        }
    },

    getlocation: function (req, callback) {
        console.log("check point Geo Locaation");

        var Curl = require('node-libcurl').Curl;
        var curl = new Curl();
        curl.setOpt('URL', config.system.auth_url + 'apis/getLocation.php?data=' + req.header('x-forwarded-for'));
        curl.setOpt('SSL_VERIFYPEER', false);
        curl.setOpt('SSL_VERIFYHOST', false);
        curl.setOpt('FOLLOWLOCATION', true);
        curl.on('end', function (statusCode, body, headers) {
            callback(body);
        });
        curl.perform();
    },

    saveWidgetPositionsOneByOne: function (req, callback) {
        if (req.session.user) {
            if (req.body.widget) {
                var params = [];
                var queryString = "";

                db.query('UPDATE widgets SET positionCol = ?, positionRow = ? WHERE id = ?', [req.body.widget.col, req.body.widget.row, req.body.widget.itemId], function (err, result) {
                    callback(true);
                });

            }
        }
    },

    sendFeedback: function (req, callback) {
        if (req.session.user && req.body.feedback) {
            this.sendEmail(
                config.system.feedback_email,
                '(FEEDBACK) Ezond Marketting App.',
                'You have received feedback:' + req.body.feedback,
                '<h3>Ezond Marketting App.</h3><br/></br>Feedback received<br/><br/>Message: ' + req.body.feedback,
                function () {
                    callback(true);
                });
        }
    },
    /*used*/
    activate: function (req, callback) {
        db.query('SELECT id FROM users WHERE email = ? AND activateCode = ?', [req.body.email, req.body.code], function (err, data, fields) {
            // if (err) throw err;
            if (data.length === 1) {
                db.query('UPDATE users SET activated = 1 WHERE id = ?', [data[0].id], function (err, data, fields) {
                    // if (err) throw err;
                    callback(true, false);
                    return;
                });
            } else {
                callback(false, "Invalid Activation Code");
            }
        });
    },

    clientactivate: function (req, callback) {
        if (req.body.password.length < 3) {
            return callback(false, "Password is too short.");
        }

        if (req.body.password !== req.body.confirm_password) {
            return callback(false, "Passwords do not match.");
        }

        db.query('SELECT id FROM users WHERE email = ? AND activateCode = ?', [req.body.email, req.body.code], function (err, data, fields) {
            // if (err) throw err;
            if (data.length === 1) {
                var password = md5(config.system.db_salt + req.body.password);
                db.query('UPDATE users SET activated = 1, password = ? WHERE id = ?', [password, data[0].id], function (err, data, fields) {
                    // if (err) throw err;
                    callback(true, false);
                    return;
                });
            } else {
                callback(false, "Invalid Activation Code");
            }
        });
    },
    /*used*/
    updateAccountPassword: function (req, callback) {
        if (typeof req.body.code === "undefined") {
            callback(false, "Reset code not present.");
            return;
        }

        if (req.body.password.length < 3) {
            callback(false, "Password too short.");
            return;
        }

        if (req.body.password !== req.body.confirm_password) {
            callback(false, "Passwords do not match.");
            return;
        }

        var password = md5(config.system.db_salt + req.body.password);
        db.query('UPDATE users SET password = ?, resetCode = NULL WHERE resetCode = ?', [password, req.body.code], function (err, data, fields) {
            // if (err) throw err;
            callback("Password has been changed, you may login with your new password.", false);
        });
    },
    /*used*/
    resendActivationEmail: function (req, callback) {

        if (!req.session.user) return callback({status: false, message: 'User not authorized'});

        var d = new Date(),
            activateCode = md5(config.system.db_salt + d.getTime()),
            self = this;

        db.query('UPDATE users SET email = ?, activateCode = ?, lastLogin = null WHERE id = ?', [req.body.email, activateCode, req.session.user.id], updateUsersCallback);

        function updateUsersCallback(err, rows, fields) {

            if (err) return callback({status: false, message: err});

            self.sendEmail(
                req.body.email,
                'Ezond account activation.',
                'Welcome to Ezond! An inteliigent Marketing Management Platform ' + activateCode,
                '<h3>Ezond Marketting App.</h3><br/></br>Welcome message here<br/><br/>Your activation code is ' + activateCode +
                '<br/> Or <a href="' + config.system.url + 'activate?email=' + req.body.email + '&code=' + activateCode + '">click here to activate.</a>',
                function () {
                    callback({status: true});
                });
        }
    },

    startTrial: function (userId, callback) {
        var self = this;

        let nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + self.numberTrialDays);
        let expiredAt = Math.floor(nextDate / 1000);

        db.query('UPDATE subscriptions SET expires_at = ? WHERE user_id = ?', [expiredAt, userId], function (err, data, fields) {
            return callback(!err);
        })
    },

    /*used*/
    register: function (req, callback) {

        var d = new Date();
        var password = md5(config.system.db_salt + req.body.password);
        var activateCode = md5(config.system.db_salt + d.getTime());
        var self = this;

        db.query('SELECT id FROM users WHERE email = ?', [req.body.email], function (err, data, fields) {
            // if (err) throw err;

            if (data.length > 0) {

                return callback("Email already taken.", false);
            }
            let first_name = req.body.first_name.split(' ')[0]
            let last_name = req.body.first_name.split(' ')[1]
            db.query('INSERT INTO users (`first_name`, `last_name`, `company`, `email`, `password`, `activateCode`, `activated`, lastLogin) VALUES (?, ? , ?, ?, ?, ?, 1, Curdate())', [first_name, last_name, req.body.company, req.body.email, password, activateCode], function (err, data, fields) {
                // if (err) throw err;
                if (!err) {
                    let createdUserId = data.insertId;

                    db.query('SELECT id FROM plans WHERE trial IS NOT NULL', [], function (error, data, fields) {
                        if(!error) {
                            let trialPlanId = data[0].id;
                            db.query('INSERT INTO subscriptions (`user_id`, `billing_plan_id`) VALUES (?, ?)', [createdUserId, trialPlanId], function (err, data, fields) {
                                if(!err) {
                                    self.startTrial(createdUserId, function (result) {
                                    })
                                }
                            })
                        }
                    })
                }

                var msg = {
                    to: 'steven@ezond.com',
                    html: 'User just signed up.<br>User name: ' + first_name + " " + last_name + "<br>Company name: " + req.body.company + "<br>Email: " + req.body.email,
                    from: {
                        email: 'ezond@ezond.com',
                        name: 'Ezond'
                    },
                    subject: "New user in Ezond",
                    text: "Message text"
                };

                sgMail.send(msg);

                callback(false, {})
                return;
            });
        });
    },
    /*used*/
    update: function (req, callback) {
        tbl_name = "agency_users";
        if (typeof req.session.user.parent_id == "undefined") tbl_name = "users";
        passStr = '';
        passStr2 = '';
        if (req.body.password != '') {
            pass = md5(config.system.db_salt + req.body.password);
            passStr = ', password  = "' + pass + '"';
        }
        if (req.body.adminPassword != '') {
            pass2 = md5(config.system.db_salt + req.body.adminPassword);
            passStr2 = ', adminPassword  = "' + pass2 + '"';
        }

        if (tbl_name == "agency_users") {
            db.query('update ' + tbl_name + ' set first_name = ?, last_name = ?, email = ? WHERE id = ?', [req.body.first_name, req.body.last_name, req.body.email, req.session.user.id], function (err, data, fields) {
                // if (err) throw err;
                if (passStr != "") {
                    db.query('update ' + tbl_name + ' set password = ? WHERE id = ?', [pass, req.session.user.id], function (err, data, fields) {
                        // if (err) throw err;
                        return callback({status: true});
                    });
                } else {
                    return callback({status: true});
                }
            });
        } else {
            db.query('update ' + tbl_name + ' set first_name = ?, last_name = ?, email = ?, domainName = ?, adminEmail = ? WHERE id = ?', [req.body.first_name, req.body.last_name, req.body.email, req.body.domainName, req.body.adminEmail, req.session.user.id], function (err, data, fields) {
                // if (err) throw err;
                if ((passStr != "") && (passStr2 != "")) {
                    db.query('update ' + tbl_name + ' set password = ?, adminPassword = ? WHERE id = ?', [pass, pass2, req.session.user.id], function (err, data, fields) {
                        // if (err) throw err;
                        return callback({status: true});
                    });
                } else if (passStr != "") {
                    db.query('update ' + tbl_name + ' set password = ? WHERE id = ?', [pass, req.session.user.id], function (err, data, fields) {
                        // if (err) throw err;
                        return callback({status: true});
                    });
                } else if (passStr2 != "") {
                    db.query('update ' + tbl_name + ' set adminPassword = ? WHERE id = ?', [pass2, req.session.user.id], function (err, data, fields) {
                        // if (err) throw err;
                        return callback({status: true});
                    });
                } else {
                    return callback({status: true});
                }
            });
        }
    },
    /*used*/
    updatePhoto: function (req, callback) {

        return callback({status: true});
    },
    /*used*/
    addUsers: function (req, callback) {

        var password = md5(config.system.db_salt + req.body.password);
        var self = this;
        var agencyID = req.body.userID;

        db.query('SELECT id FROM agency_users WHERE email = ?', [req.body.email], function (err, data, fields) {
            // if (err) throw err;
            if (data.length > 0) {
                return callback({errmess: "Email already taken."});
            }

            db.query('SELECT expires_at FROM subscriptions WHERE user_id = ?', [req.session.user.id], function(error, data, fields) {
                if(!error) {
                    if(data[0].expires_at < (+new Date() / 1000 | 0)) {
                        return callback('Your subscription has expired.', false);
                    }

                    self.getUserInfoFromAgencyUsers(req.body.userID, function (user_info) {
                        if (user_info.length > 0) {
                            agencyID = user_info[0].parent_id;
                        }
                        db.query('INSERT INTO agency_users (`date_created`, `first_name`, `last_name`, `email`, `password`, `role`, `campaign_access`, `campaigns_allowed`, `providers_allowed`, `agencyID`, `parent_id`) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.body.first_name, req.body.last_name, req.body.email, password, req.body.role, req.body.campaign_access, JSON.stringify(req.body.campaigns_allowed), JSON.stringify(req.body.providers_allowed), req.body.userID, agencyID], function (err, data, fields) {
                            if (err) {
                                return callback("Fill all fields", false)
                            }
                            return callback({status: true, insertId: data.insertId});
                        });
                    });
                }
            });
        });
    },

    /*used*/
    reloadChildUserPermissions: function (__agencyID, __campaign_access, __campaigns_allowed, __providers_allowed) {

        db.query('SELECT id, campaign_access, campaigns_allowed, providers_allowed FROM agency_users WHERE agencyID = ?', [__agencyID], function (err, users, fields) {
            for (t_i = 0; t_i < users.length; t_i++) {
                __user_obj = users[t_i];
                __user_id = __user_obj.id;
                campaign_access = __user_obj.campaign_access;
                campaigns_allowed = JSON.parse(__user_obj.campaigns_allowed);
                providers_allowed = JSON.parse(__user_obj.providers_allowed);
                if (__campaign_access == "restricted") {
                    if (campaign_access == "all") {
                        campaign_access = "restricted";
                        campaigns_allowed = __campaigns_allowed;
                    } else {
                        campaigns_allowed2 = [];
                        for (t_j = 0; t_j < campaigns_allowed.length; t_j++) {
                            if (__campaigns_allowed.indexOf(campaigns_allowed[t_j]) != -1)
                                campaigns_allowed2.push(campaigns_allowed[t_j]);
                        }
                        campaigns_allowed = campaigns_allowed2;
                    }
                }

                providers_allowed2 = [];
                for (t_j = 0; t_j < providers_allowed.length; t_j++) {
                    if (__providers_allowed.indexOf(providers_allowed[t_j]) != -1)
                        providers_allowed2.push(providers_allowed[t_j]);
                }
                providers_allowed = providers_allowed2;
                db.query('UPDATE agency_users SET `campaign_access` = ?, `campaigns_allowed` = ?, `providers_allowed` = ? WHERE id = ? LIMIT 1', [campaign_access, JSON.stringify(campaigns_allowed), JSON.stringify(providers_allowed), __user_id], function (err, data, fields) {

                });
            }
        });
    },
    /*used*/
    editChildUser: function (req, callback) {

        var self = this;

        db.query('SELECT id FROM agency_users WHERE id = ?', [req.body.id], function (err, data, fields) {
            // if (err) throw err;

            if (data.length < 1) {

                return callback("Error. No users found.", false);
            }

            db.query('UPDATE agency_users SET `first_name` = ?, `last_name` = ?, `email` = ?, `campaign_access` = ?, `campaigns_allowed` = ?, `providers_allowed` = ? WHERE id = ? LIMIT 1', [req.body.first_name, req.body.last_name, req.body.email, req.body.campaign_access, JSON.stringify(req.body.campaigns_allowed), JSON.stringify(req.body.providers_allowed), req.body.id], function (err, data, fields) {
                // if (err) throw err;
                self.reloadChildUserPermissions(req.body.id, req.body.campaign_access, req.body.campaigns_allowed, req.body.providers_allowed);

                if (typeof req.body.password != 'undefined' && req.body.password != '') { // Update password

                    var password = md5(config.system.db_salt + req.body.password);

                    db.query('UPDATE agency_users SET `password` = ? WHERE id = ? LIMIT 1', [password, req.body.id], function (err, data, fields) {
                        // if (err) throw err;

                        return callback({status: true});

                    });

                } else {
                    return callback({status: true});
                }
            });
        });
    },
    /*used*/
    removeChildUser: function (req, callback) {

        var self = this;

        db.query('DELETE FROM agency_users WHERE id = ? LIMIT 1', [req.body.userId], function (err, data, fields) {
            // if (err) throw err;
            return callback({status: true});
        });
    },
    /*used*/
    sendEmail: function (to, subject, textBody, htmlBody, callback) {
        msg = {
            to: to,
            from: '"' + config.system.mail_name + '" <' + config.system.mail_email + '>',
            subject: subject,
            text: textBody,
            html: htmlBody,
        };
        sgMail.send(msg);
        callback(true);
    },
    /*used*/
    sendResetPasswordLink: function (req, callback) {

        if (req.body.email.length < 3) {
            callback(false, "Email too short to be valid.");
            return;
        }
        var self = this;

        db.query('SELECT id FROM users WHERE email = ? ', [req.body.email], function (err, data, fields) {
            // if (err) throw err;
            if (data.length === 1) {
                var d = new Date();
                var resetCode = md5(config.system.db_salt + d.getTime());
                db.query('UPDATE users SET resetCode = ? WHERE id = ?', [resetCode, data[0].id], function (err, data, fields) {
                    // if (err) throw err;
                    self.sendEmail(
                        req.body.email,
                        'Ezond Marketting App. Password Reset Request',
                        'A password reset has been requested, Your reset code is ' + resetCode,
                        '<h3>Ezond</h3><br/></br>A password reset has been requested<br/><br/>Your reset code is ' + resetCode +
                        '<br/> Or <a href="' + config.system.url + 'forgotpw?email=' + req.body.email + '&code=' + resetCode + '">click here to reset.</a>',
                        function () {
                            callback("Sent password reset email to your nominated email.", false);
                        });
                });
            } else {
                callback(false, "Invalid Email");
            }
        });
    },
    getUserInfoFromUsers: function (id, callback) {
        db.query('SELECT * FROM users WHERE id = ?', [id], function (err, data, fields) {
            // if (err) throw err;
            callback(data);
            return;
        });
    },
    getUserInfoFromAgencyUsers: function (id, callback) {
        db.query('SELECT * FROM agency_users WHERE id = ?', [id], function (err, data, fields) {
            // if (err) throw err;
            callback(data);
            return;
        });
    },
    getUserActionsFromId: function (id, callback) {
        db.query('SELECT * FROM user_actions WHERE actionIdx = ?', [id], function (err, data, fields) {
            // if (err) throw err;
            callback(data);
            return;
        });
    },
    sendAssignNotiEmail: function (req, callback) {
        // actionIdx, assignUserIdx, req.session.user.id
        var siteUrl = config.system.url;
        mail_obj = {};
        mail_obj.sender = "";
        mail_obj.recver = "";
        mail_obj.email = "";
        mail_obj.task = "";
        self = this;

        self.getUserInfoFromUsers(req.session.user.id, function (user_info) {
            if (user_info.length > 0) {
                mail_obj.sender = user_info[0].first_name + " " + user_info[0].last_name;
            }
            self.getUserInfoFromAgencyUsers(req.session.user.id, function (user_info) {
                if (user_info.length > 0) {
                    mail_obj.sender = user_info[0].first_name + " " + user_info[0].last_name;
                }
                self.getUserInfoFromUsers(req.body.assignUserIdx, function (user_info) {
                    if (user_info.length > 0) {
                        mail_obj.recver = user_info[0].first_name + " " + user_info[0].last_name;
                        mail_obj.email = user_info[0].email;
                    }
                    self.getUserInfoFromAgencyUsers(req.body.assignUserIdx, function (user_info) {
                        if (user_info.length > 0) {
                            mail_obj.recver = user_info[0].first_name + " " + user_info[0].last_name;
                            mail_obj.email = user_info[0].email;
                        }
                        self.getUserActionsFromId(req.body.actionIdx, function (task_info) {
                            if (task_info.length > 0) {
                                mail_obj.task = task_info[0].actionDetail;
                            }
                            console.log(mail_obj);
                            self.sendEmail(
                                mail_obj.email,
                                'Ezond. Assigned Task Notification',
                                'Hi, ' + mail_obj.recver,
                                'Hi, ' + mail_obj.recver + '<br/>' + mail_obj.sender + ' assigned you a task!.' + '<br/> Task Details: <b>' + mail_obj.task + '</b>. <br/>' + '<a href="' + siteUrl + '#!/app/campaignmanagement/' + req.body.dashboardId + '">Go to task</a>',

                                function () {
                                    callback("Sent notification email to your nominated email.", false);
                                });
                        });
                    });
                });
            });
        });
    },
    /*used*/
    unbindNetwork: function (req, callback) {
        db.query('UPDATE users_networks SET defaultCheck = 0 WHERE networkID = ? AND dashboardID = ?', [req.body.id + 1, req.body.dashboard], function (err, result) {
            callback(result);
        });
    },
    /*used*/
    bindNetwork: function (req, callback) {
        db.query('UPDATE users_networks SET defaultCheck = 0 WHERE networkID = ? AND dashboardID = ?', [req.body.id + 1, req.body.dashboard], function (err, result) {
            db.query('UPDATE users_networks SET defaultCheck = 1 WHERE networkID = ? AND dashboardID = ? AND account = ? AND (viewID = ? or viewID is null)', [req.body.id + 1, req.body.dashboard, req.body.account, req.body.viewID], function (err, result) {
                callback(result);
            });
        });
    },
    saveAdrollAccount: function (req, callback) {
        var self = this;
        self.getAdrollAdvertisables({ 
            body: {
                credentials: req.body.api_key 
            }
        }, function (response) {
            if (!response.errors) {
                let sql = 'insert into users_networks (`networkID`, `dashboardID`, `access_token`, `userID`, `account`, `viewID`) VALUES (11, ?, ?, ?, ?, ?)'
                response.results.forEach(function (result) {
                    db.query(sql, [req.body.campID, req.body.api_key, req.body.userID, result.name, result.eid], function (err, res) {
                    })
                })
            }
            callback(response)
        })
        
    },
    getDashboardAdrollMetrics: function (req, callback) {
        var self = this;
        var dot = {};
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        db.query('SELECT viewID, access_token FROM users_networks where dashboardID = ? and networkID = 11', [req.body.dashboard_id], function (err, rows) {
            if (err || !rows || !rows.length){
                callback({errors: [{message: 'Not found credentials'}]})
                return
            }

            self.getAdrollCampaignReport({fordashboard: true, body: {advertisable_id: rows[0].viewID, start_date: start_date, end_date: end_date} }, function (response) {
                callback(response)
            })
        })

    },
    getAdrollCampaignReportByDay: function (req, callback) {
        let host = "services.adroll.com";
        let self = this;
        var return_results = []

        db.query('SELECT dashboardID, access_token FROM users_networks where viewID = ?', [req.body.advertisable_id], function (err, rows) {
            if (err || !rows || !rows.length){
                callback({errors: [{message: 'Not found credentials'}]})
                return
            }

            let start_date = "&start_date=" + req.body.start_date;
            let end_date = "&end_date=" + req.body.end_date;

            let credentials = rows[0].access_token;
            let https = require('https');
            var additional = 'data_format=date&'
            var responsble_data = {};
            if (req.fordashboard) {
                additional = ''
            }
            let path = `/api/v1/report/advertisable?${additional}apikey=AIQd5ka0LRqMscI7GvJvdfzxm4vmoyXh&advertisables=`+req.body.advertisable_id;
            path = path + start_date + end_date;
            console.log(path)
            https.request({
                host: host,
                path: path,
                method: 'GET',
                headers: {
                    "Authorization": "Basic " + new Buffer( credentials ).toString('base64')
                }
            }, function(res){
                var response = "";
                res.on('data', function(chunk){
                    response += chunk;
                });

                res.on('end',function(){
                    response = JSON.parse(response);
                    callback(response.results)
                });
            }).end();
        })
    },
    getAdrollAdgroupMetrics: function (req, callback) {
        db.query('SELECT access_token FROM users_networks where viewID = ?', [req.body.advertisable_id], function (err, rows) {
            if (err || !rows || !rows.length){
                callback({errors: [{message: 'Not found credentials'}]})
                return
            }

            let start_date = "&start_date=" + req.body.start_date;
            let end_date = "&end_date=" + req.body.end_date;

            let https = require('https');
            let credentials = rows[0].access_token;
            let host = "services.adroll.com";
            let path = `/api/v1/report/campaign?adgroups=${req.body.adgroup}&apikey=AIQd5ka0LRqMscI7GvJvdfzxm4vmoyXh`;

            path = path + start_date + end_date

            https.request({
                host: host,
                path: path,
                method: 'GET',
                headers: {
                    "Authorization": "Basic " + new Buffer( credentials ).toString('base64')
                }
            }, function(res){
                var response = "";
                res.on('data', function(chunk){
                    response += chunk;
                });

                res.on('end',function(){
                    response = JSON.parse(response);
                    responsble_data = response;
                    callback(responsble_data)
                });
            }).end();
        })
    },
    getAdrollCampaignReport: function (req, callback) {
        let host = "services.adroll.com";
        let path = "/api/v1/report/campaign?apikey=AIQd5ka0LRqMscI7GvJvdfzxm4vmoyXh&campaigns=";

        let self = this;

        var return_results = []

        db.query('SELECT dashboardID, access_token FROM users_networks where viewID = ?', [req.body.advertisable_id], function (err, rows) {
            if (err || !rows || !rows.length){
                callback({errors: [{message: 'Not found credentials'}]})
                return
            }

            let start_date = "&start_date=" + req.body.start_date;
            let end_date = "&end_date=" + req.body.end_date;

            let credentials = rows[0].access_token;
            let https = require('https');

            let firstcurlended = false;
            
            var searchable_camps = "";
            var responsble_data = {};

            if (req.body.advancedoptions && req.body.advancedoptions.campaign_id) {
                self.getAdrollAdGroups({body: {credentials: credentials, campaign_id: req.body.advancedoptions.campaign_id}}, function (response) {
                    responsble_data.adgroups = response;
                    callback(responsble_data)
                })
            }
            else {
                // For chart
                self.getAdrollCampaignReportByDay({fordashboard:req.fordashboard, body: {advertisable_id: req.body.advertisable_id, start_date: req.body.start_date, end_date: req.body.end_date}}, function (results) {
                    responsble_data.endponits = results;
                    // responsble_data.endponits.push({advertisable_id: req.body.advertisable_id, start_date: req.body.start_date, end_date: req.body.end_date})
                    if (firstcurlended) {
                        callback(responsble_data);
                    } else {
                        firstcurlended = true;
                    }
                });

                if (req.fordashboard){
                    firstcurlended = true;
                    return
                }
                
                // Campaigns list
                self.getAdrollAdvertisableData({body: {advertisable_id: req.body.advertisable_id}}, function (results) {
                    results.results.forEach(function (result) {
                        searchable_camps += result.eid + ","        
                    })
                    
                    let path = "/api/v1/report/campaign?apikey=AIQd5ka0LRqMscI7GvJvdfzxm4vmoyXh&campaigns=";
                    path = path + searchable_camps
                    // path = path + results.results[1].eid
                    path = path + start_date + end_date

                    https.request({
                        host: host,
                        path: path,
                        method: 'GET',
                        headers: {
                            "Authorization": "Basic " + new Buffer( credentials ).toString('base64')
                        }
                    }, function(res){
                        var response = "";
                        res.on('data', function(chunk){
                            response += chunk;
                        });

                        res.on('end',function(){
                            response = JSON.parse(response);
                            responsble_data.advertisableData = response;
                            if (firstcurlended) {
                                callback(responsble_data)
                            }
                            else {
                                firstcurlended = true
                            }
                        });
                    }).end();
                })
            }
        })
    },
    getAdrollAdGroups: function (req, callback) {
        console.log("GOT THIS THAT")
        let host = "services.adroll.com"
        let path = "/api/v1/campaign/get_adgroups?apikey=AIQd5ka0LRqMscI7GvJvdfzxm4vmoyXh&campaign=" + req.body.campaign_id
        console.log(path)
        let credentials = req.body.credentials;

        let https = require('https')
        https.request({
            host: host,
            path: path,
            method: 'GET',
            headers: {
                "Authorization": "Basic " + new Buffer( credentials ).toString('base64')
            }
        }, function(res){

            var response = "";

            res.on('data', function(chunk){
                response += chunk;
            });

            res.on('end',function(){
                response = JSON.parse(response);
                callback(response)
            });
    
        }).end();
    },
    getAdrollAdvertisables: function (req, callback) {
        let host = "services.adroll.com"
        let path = "/api/v1/organization/get_advertisables?apikey=AIQd5ka0LRqMscI7GvJvdfzxm4vmoyXh"
        // let path = "/api/v1/organization/get_advertisables?apikey=" + config.adroll_apikey;

        // let credentials = "Tonymonsalo1:Renovjevs527t7@";
        let credentials = req.body.credentials;


        let https = require('https')
        https.request({
            host: host,
            path: path,
            method: 'GET',
            headers: {
                "Authorization": "Basic " + new Buffer( credentials ).toString('base64')
            }
        }, function(res){

            var response = "";

            res.on('data', function(chunk){
                response += chunk;
            });

            res.on('end',function(){
                response = JSON.parse(response);
                callback(response)
            });
    
        }).end();
    },
    getAdrollAdvertisableData: function (req, callback) {
        let https = require('https');
        let querystring = require('querystring');
        let host = "app.adroll.com";
        let path = "/reporting/api/v1/query"

        // let host = "services.adroll.com"
        // let path = "/api/v1/advertisable/get_campaigns?apikey=AIQd5ka0LRqMscI7GvJvdfzxm4vmoyXh&advertisable=" + req.body.advertisable_id
        db.query('SELECT access_token FROM users_networks where viewID = ?', [req.body.advertisable_id], function (err, rows) {
            if (err || !rows || !rows.length){
                callback({errors: [{message: 'Not found credentials'}]})
                return
            }
            
            let credentials = rows[0].access_token

            let postData = `{
              advertisable {
                byEID(advertisable: ${req.body.advertisable_id}) {
                  eid
                  name
                  metrics (start: "${req.body.start_date}", end: "${req.body.end_date}", currency: "USD"){
                    summary {
                        clicks
                        impressions
                        ctr
                        cpm
                        cpc
                        cpa
                        view_through_conversions:viewRevenue
                        view_through_ratio:vtcRate
                        total_conversions:conversions
                        total_conversion_rate:vtcRate
                        cost
                    }
                    byDate {
                        clicks
                        impressions
                        ctr
                        cpm
                        cpc
                        cpa
                        view_through_conversions:viewRevenue
                        view_through_ratio:vtcRate
                        total_conversions:conversions
                        total_conversion_rate:vtcRate
                        cost
                        date
                    }
                  }
                  campaigns {
                    eid
                    name
                    channel

                    metrics(start: "${req.body.start_date}", end: "${req.body.end_date}", currency: "USD") {
                      byDate {
                        clicks
                        impressions
                        ctr
                        cpm
                        cpc
                        cpa
                        view_through_conversions:viewRevenue
                        view_through_ratio:vtcRate
                        total_conversions:conversions
                        total_conversion_rate:vtcRate
                        cost
                        date
                      }
                      summary {
                        clicks
                        impressions
                        ctr
                        cpm
                        cpc
                        cpa
                        view_through_conversions:viewRevenue
                        view_through_ratio:vtcRate
                        total_conversions:conversions
                        total_conversion_rate:vtcRate
                        cost
                        date
                      }
                    }
                    adgroups {
                        kpiCurrency 
                        eid 
                        status 
                        kpiGoal 
                        kpiMetric 
                        name 
                        createdDate 
                        flights 
                        metrics(start: "${req.body.start_date}", end: "${req.body.end_date}",currency:"USD") {
                            summary {
                                clicks
                                impressions
                                ctr
                                cpm
                                cpc
                                cpa
                                view_through_conversions:viewRevenue
                                view_through_ratio:vtcRate
                                total_conversions:conversions
                                total_conversion_rate:vtcRate
                                cost
                            }
                            byDate {
                                clicks
                                impressions
                                ctr
                                cpm
                                cpc
                                cpa
                                view_through_conversions:viewRevenue
                                view_through_ratio:vtcRate
                                total_conversions:conversions
                                total_conversion_rate:vtcRate
                                cost
                                date
                              }
                        }
                        ads {
                            message 
                            eid 
                            inAdgroupStatus 
                            inAdgroupRelationshipEID 
                            name
                            type
                            channel
                            height
                            width
                            src
                            destinationURL
                            adrollEID
                            headline
                            body
                            callToAction
                            facebookPermalink
                            instagramPermalink
                            utmSource
                            utmMedium 
                            utmCampaign
                            utmTerm
                            utmContent
                            createdDate 
                            metrics(start:"2018-10-01",end:"2018-11-01",currency:"USD") {
                                summary {
                                    spend:cost 
                                    impressions 
                                    clicks 
                                    impressions
                                    ctr
                                    cpm
                                    cpc
                                    cpa
                                    view_through_conversions:viewRevenue
                                    view_through_ratio:vtcRate
                                    total_conversions:conversions
                                    total_conversion_rate:vtcRate
                                    cost
                                    newVisitors 
                                    engagedVisitors 
                                    ctr 
                                    bounceRate 
                                    videoTwentyFivePercent 
                                    videoFiftyPercent 
                                    videoSeventyFivePercent 
                                    videoHundredPercent 
                                    videoImpressions 
                                    ctc:clickThroughs 
                                    vtc:viewThroughs 
                                    clickAttributedRevenue:clickRevenue 
                                    viewAttributedRevenue:viewRevenue 
                                    influencedConversions:influencedThroughs 
                                    influencedRevenue
                                }
                            }
                            conversions(currency:"USD",start:"2018-10-01",end:"2018-11-01") {
                                byAudience {
                                    audienceEID audienceName audienceDuration audienceIsActive spend:cost impressions clicks ctc:clickThroughs vtc:viewThroughs clickAttributedRevenue:clickRevenue viewAttributedRevenue:viewRevenue influencedConversions:influencedThroughs influencedRevenue
                                }
                            }
                        }
                    }
                  }
                }
              }
            }`;
            var post_data = querystring.stringify({
                query:postData
            });

            let calling = https.request({
                host: host,
                path: path,
                method: 'POST',
                headers: {
                    "Authorization": "Basic " + new Buffer( credentials ).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_data.length
                }, 
            }, function(res){
                var response = "";

                res.on('data', function(chunk){
                    response += chunk;
                });

                res.on('end',function(){
                    response = JSON.parse(response);
                    callback(response)
                });
            })

            calling.write(post_data);
            calling.end();
        })
    },
    /*used*/
    addNetworkAccount: function (req, callback) {

        if (req.session && req.session.user) {

            console.log("check point addNetworkAccount");

            var Curl = require('node-libcurl').Curl;

            var curl = new Curl();

            let url = ''
            if (req.body.id == 10){
                curl.setOpt('POSTFIELDS', 'campID='+req.body.campID+'&docname='+req.body.docname+'&api_key='+req.body.api_key+'&userID='+req.session.user.id+'&userid='+req.session.user.id)
                curl.setOpt('POST', true);

                url = config.system.auth_url + 'data_studio/save_key_data_studio_with_name.php'

            }
            else if (req.body.id == 11) {
                curl.setOpt('POSTFIELDS', 'campID='+req.body.campID+'&api_key='+req.body.api_key+'&userID='+req.session.user.id)
                curl.setOpt('POST', true);
                url = config.system.url + 'saveadroll'
            }
            else {
                url = getUrl(req.body.id) + "@" + req.body.campID + "&api_key=" + req.body.api_key
            }
            curl.setOpt('URL', url);

            curl.setOpt('SSL_VERIFYPEER', false);
            curl.setOpt('SSL_VERIFYHOST', false);
            curl.setOpt('FOLLOWLOCATION', true);

            curl.on('end', function (statusCode, body, headers) {

                callback(body);
            });

            curl.on('error', function (st, er, body, dtt) {
                console.log(st)
                console.log(er)
                console.log(body)
                console.log(dtt)
            });


            curl.perform();
        } else {

            callback(false);
        }

        function getUrl(id) {

            var providers = {
                9: "callrail/auth.php?userID=",
                10: "data_studio/save_key_data_studio_with_name.php?userID=",
            };

            return config.system.auth_url + providers[id] + req.session.user.id;
        }
    },
    /*used*/
    addNetwork: function (req, callback) {

        if (req.session && req.session.user) {

            console.log("check point addNetwork");

            var Curl = require('node-libcurl').Curl;

            var curl = new Curl();

            curl.setOpt('URL', getUrl(req.body.id) + "@" + req.body.campID);
            curl.setOpt('SSL_VERIFYPEER', false);
            curl.setOpt('SSL_VERIFYHOST', false);
            curl.setOpt('FOLLOWLOCATION', true);

            curl.on('end', function (statusCode, body, headers) {
                callback(body);

                this.close();
            });


            curl.perform();
        } else {

            callback(false);
        }

        function getUrl(id) {

            var providers = {
                1: "google/auth.php?method=analytics&userID=",
                2: "google/auth.php?method=ads&userID=",
                3: "google/auth.php?method=console&userID=",
                4: "google/auth.php?method=sheet&userID=",
                5: "google/auth.php?method=youtube&userID=",
                6: "mailchimp/auth.php?userID=",
                7: "facebook/test_login.php?method=ads&userID=",
                8: "facebook/test_login.php?method=facebook&userID=",
            };
            // console.log(config.system.auth_url + providers[id] + req.session.user.id);
            return config.system.auth_url + providers[id] + req.session.user.id;
        }
    },
    /*used*/
    getMetricDatas: function (req, callback) {
        console.log("getMetricDatas: " + req.body.dashboardID + req.body.startDate + req.body.endDate)
        var self = this;

        // if (req.session && req.session.user) {
            var firstcurlended = false; 
            var firstcurlcontent = "";
            var returnstring = "";
            var Curl = require('node-libcurl').Curl;
            var curl = new Curl();
            curl.setOpt('URL', config.system.auth_url + "apis/get_widget_data.php?dashboardID=" + req.body.dashboardID + "&startDate=" + req.body.startDate + "&endDate=" + req.body.endDate);
            curl.setOpt('SSL_VERIFYPEER', false);

            curl.setOpt('SSL_VERIFYHOST', false);
            curl.setOpt('FOLLOWLOCATION', true);
            curl.on('end', function (statusCode, body, headers) {
                if (firstcurlended){
                    let temparray = [];
                    try {
                        a = JSON.parse(body);
                        temparray = firstcurlcontent
                        if (a && firstcurlcontent)
                            a.push(temparray);
                        returnstring = JSON.stringify(a);

                        callback(a);
                    } catch(e) {
                        // alert(e); // error in the above string (in this case, yes)!
                        if (temparray.push)
                            temparray.push(firstcurlcontent);
                        callback(temparray);
                    }
                    // let temparray = JSON.parse(body);
                    this.close();
                } else {
                    try {
                        firstcurlcontent = JSON.parse(body)
                        firstcurlended = true;
                    } catch (e) {
                        firstcurlended = true;
                    }
                }
            });

            function swapdatepos(date) {
                return date.split('-')[1]+'-'+date.split('-')[2]+'-'+date.split('-')[0]
            }

            curl.perform();
            self.getDashboardAdrollMetrics({body: {dashboard_id: req.body.dashboardID, start_date: swapdatepos(req.body.startDate), end_date: swapdatepos(req.body.endDate),}}, function (response) {
                if (firstcurlended) {
                    if (response.endponits && response.endponits.length)
                        firstcurlcontent.push({networkID: 11, metricsResult: response.endponits[0]});
                    callback(firstcurlcontent);
                } else {

                    firstcurlended = true;
                    if (response.endponits && response.endponits.length)
                        firstcurlcontent = {networkID: 11, metricsResult: response.endponits[0]};
                    else {
                        firstcurlcontent = false;
                    }
                }
            })
    },
    /*used*/
    getDedicatedPage: function (req, callback) {
        if (req.session && req.session.user) {
            var Curl = require('node-libcurl').Curl;
            var curl = new Curl();
            // console.log(req.body)
            curl.setOpt('URL', config.system.auth_url + "apis/getDetailData.php?networkID=" + req.body.networkID + "&dashboardID=" + req.body.dashboardID + "&filter=" + encodeURIComponent(req.body.filter) + "&startDate=" + req.body.startDate + "&endDate=" + req.body.endDate);

            curl.setOpt('SSL_VERIFYPEER', false);
            curl.setOpt('SSL_VERIFYHOST', false);
            curl.setOpt('FOLLOWLOCATION', true);
            curl.on('end', function (statusCode, body, headers) {
                callback(body);
                this.close();
            });

            curl.perform();
        } else {
            callback(false);
        }
    },
    getPreNetworks: function (req, callback) {
        if (req.session.user) {
            db.query('SELECT * FROM users_networks WHERE userID = ? AND dashboardID = ? AND networkID = ?', [req.session.user.id, req.body.campID, req.body.id + 1], function (err, network, fields) {
                // if (err) throw err;
                callback(network);
            });
        }
    },
    /*used*/
    deleteNetwork: function (req, callback) {
        if (req.session.user) {
            var self = this;
            var networkTable = '';
            db.query('SELECT * FROM users_networks WHERE id = ?', [req.body.id], function (err, network, fields) {
                // if (err) throw err;
                if (network[0].networkID === 2) {
                    networkTable = 'users_data_adwords';
                } else if (network[0].networkID === 1) {
                    networkTable = 'users_data_google_analytics';
                }
                db.query('DELETE FROM users_networks WHERE id = ?', [req.body.id], function (err, data, fields) {
                    // if (err) throw err;
                    db.query('DELETE FROM ' + networkTable + ' WHERE userID = ? AND viewID IN (' + network[0].viewID + ')', [network[0].userID], function (err, data, fields) {
                        // if (err) throw err;
                        self.getNetworkList(req.session.user.id, function (networks) {
                            req.session.user.networks = networks;
                            callback(data);
                        });
                    });
                });
            });

        }
    },

    addClient: function (req, callback) {
        if (req.session.user) {
            var self = this;
            db.query('SELECT id FROM users WHERE email = ?', [req.body.email], function (err, data, fields) {
                // if (err) throw err;
                if (data.length > 0) {
                    return callback(-1);
                }

                var d = new Date();
                var activateCode = md5(config.system.db_salt + d.getTime());
                db.query('INSERT INTO users (`first_name`, `last_name`, `company`, `email`, `agencyID`, `agencyAccess`, `activateCode`) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.body.first_name, req.body.last_name, req.body.company, req.body.email, req.session.user.agencyID, req.body.agencyAccess, activateCode], function (err, data, fields) {
                    // if (err) throw err;
                    self.sendEmail(
                        req.body.email,
                        "Ezond. Agency Invite",
                        'Hello ' + req.body.first_name + " " + req.body.last_name + ", you have been invited to join Ezond Marketting app. by the agency " + req.body.agencyName +
                        ' to accept this invite and start using Ezond. under ' + req.body.agencyName + ' go to this link: ' + config.system.url + 'clientactivate?email=' + req.body.email + '&code=' + activateCode,
                        '<h3>Ezond .</h3><br/></br>Hello ' + req.body.first_name + " " + req.body.last_name + ",<br/><br/> you have been invited to join Ezond. by the agency <b>" +
                        req.body.agencyName + '</b> to accept this invite and start using Ezond Marketting App. under <b>' + req.body.agencyName + '</b> go to this link <br/>' +
                        config.system.url + 'clientactivate?email=' + req.body.email + '&code=' + activateCode + '<br/><br/> Or ' +
                        '<a href="' + config.system.url + 'clientactivate?email=' + req.body.email + '&code=' + activateCode + '">click here to to activate your account and set your password.</a>',
                        function () {
                            callback(data.insertId);
                        });
                });
            });
        }
    },

    addAgency: function (req, callback) {
        if (req.session.user) {
            var self = this;
            db.query('SELECT id FROM agencies WHERE name = ?', [req.body.name], function (err, data, fields) {
                // if (err) throw err;
                if (data.length > 0) {
                    return callback(-1);
                }

                db.query('INSERT INTO agencies (`ownerID`, `name`, `country`) VALUES (?, ?, ?)', [req.session.user.id, req.body.name, req.body.country], function (err, agencyID, fields) {
                    // if (err) throw err;
                    db.query('UPDATE users SET agencyID = ?, agencyAccess = 2 WHERE id = ? ', [agencyID.insertId, req.session.user.id], function (err, data, fields) {
                        // if (err) throw err;
                        self.getAgency(agencyID.insertId, function (agency) {
                            req.session.user.agencyID = agencyID.insertId;
                            req.session.user.agencyAccess = 2;
                            req.session.user.agency = agency;
                            return callback(data.insertId);
                        });
                    });
                });
            });
        }
    },

    updateWidgetsOfNetwork: function (req, callback) {
        if (req.session.user) {
            var user = req.session.user;
            // check if user has any dashboards
            db.query('SELECT * FROM dashboards WHERE ownerID = ?', [user.id], function (err, dashboards, fields) {
                // if (err) throw err;
                if (dashboards.length > 0) {
                    var dashboardIDS = "";
                    for (var i = 0; i < dashboards.length; i++) {
                        dashboardIDS += dashboards[i].id;
                        if (i < dashboards.length - 1) {
                            dashboardIDS += ",";
                        }
                    }
                    db.query('SELECT * FROM `widgets` WHERE network = ? AND dashboardID IN (' + dashboardIDS + ')', [req.body.id], function (err, widgets, fields) {
                        // if (err) throw err;
                        var widgetTypes = require("./widgetTypes");

                        async.eachSeries(widgets, function iteratee(widgetItem, callback) {
                            var defaultWidget = widgetTypes.getWidgetByName(widgetItem.did);
                            var widgetData = [];
                            async.eachSeries(defaultWidget.data, function iteratee(item, callback) {
                                var column = '';
                                var period = 'today';
                                var params = {};
                                var paramKey = '';
                                for (var key in item) {
                                    if (key.substring(0, 2) !== "v:") {
                                        if (key !== "alias") {
                                            //if ('alias') { //<!--mymysterious-->
                                            if ('alias' in item) { //<!--mymysterious-->
                                                column = key;
                                            }
                                            period = item[key];
                                        }
                                    } else {
                                        params[key.substring(2)] = item[key];
                                    }
                                }

                                var networkTable = "";
                                if (defaultWidget.network === 1) {
                                    networkTable = "users_data_google_analytics";
                                } else if (defaultWidget.network === 2) {
                                    networkTable = "users_data_adwords";
                                }

                                var userID = req.session.user.id;
                                if (req.body.userID) {
                                    userID = req.body.userID;
                                }

                                var periodString = '';

                                if (period === "today") {
                                    periodString = ' AND Date(saveTime) = Curdate()';
                                } else {
                                    periodString = ' AND Date(saveTime) BETWEEN DATE_SUB(Curdate(), INTERVAL ' + period + ' DAY) AND Curdate() ORDER BY saveTime';
                                }

                                db.query('SELECT ' + column + ' FROM ' + networkTable + ' WHERE userID = ? AND viewID = ?' + periodString, [user.id, widgetItem.viewID], function (err, wData, fields) {
                                    // if (err) throw err;
                                    if (wData.length !== 0) {
                                        if (period === "today" || period === "1") {
                                            wData = wData[0][column];
                                        } else {
                                            var temp = [];
                                            for (var i = 0; i < wData.length; i++) {
                                                temp.push(wData[i][column]);
                                            }
                                            wData = temp;
                                        }

                                        if ("alias" in item) {
                                            params[item.alias] = wData;
                                        } else {
                                            params[column] = wData;
                                        }
                                    }
                                    widgetData.push(params);
                                    callback(); //<!--mymysterious-->
                                });
                            }, function done(err, data) {
                                db.query('UPDATE widgets SET data = ? WHERE id = ? ', [JSON.stringify(widgetData), widgetItem.id], function (err, data, fields) {
                                    // if (err) throw err;
                                    callback();
                                });
                            });
                        }, function done(err, data) {
                            db.query('UPDATE users SET lastWidgetDataUpdate = now() WHERE id = ? ', [user.id], function (err, data, fields) {
                                // if (err) throw err;
                                return callback(data);
                            });
                        });
                    });
                } else {
                    return callback(false);
                }
            });
        }
    },

    doWidgetDataUpdate: function (user, callback) {
        return callback();
    },

    getFormById: function (id, callback) {
        db.query('SELECT form_fields from agency_forms where form_id = ?', [id], function (err, rows) {
            if (rows && rows.length) {
                let return_result = JSON.parse(rows[0].form_fields);
                return_result.access = [{roles: ["5692b920d1028f01000407e4", "5692b920d1028f01000407e5", "5692b920d1028f01000407e6"]}, {type: "read_all"}]
                return_result.type = 'form'
                return_result.title = "Example"
                console.log(return_result)
                callback(return_result)
            } else {
                callback(false)
            }
        })
    },
    handleform: function (req, callback) {
        console.log(req.body)
        callback(true);
    },

    getAgencyForms: function (req, callback) {
        if ( req.query.agency_id ) {
            field = 'agency_id'
            id = req.query.agency_id
        } else {
            field = 'form_key'
            id = req.query.form_id
        }
        db.query(`SELECT * FROM agency_forms where ${field} = ?`, [id], function (err, data, fields) {
            // if (err) throw err;
            callback(data);
        });
    },

    /*used*/
    getWidgetsData: function (req, callback) {

        if (!req.session.user) return callback({status: false});

        var user = req.session.user;
        var postData = req.body;

        var out = {};

        var widgets = [{
            id: 234,
            network: 3,
            campaignID: 23,
            metrics: ['cpp', 'cpm']
        }]

        postData.widgets.forEach(function (item) {

            if (item.network == 3) { // Facebook

                facebookWidgetData.findOne({
                    where: {campaignID: item.campaignID},
                    order: [
                        ['saveTime', 'DESC']
                    ],
                    attributes: concat('id', item.metrics)
                })
                .then(function (widgetData) {

                    out[item.id] = widgetData;
                });
            }
        });

        callback({status: true, data: out});
    },
    /*used*/
    crud: {

        update: function (req, callback) {

            if (!req.session.user) return callback({status: false});

            db.query('UPDATE users SET personal = ? WHERE id = ?', [JSON.stringify(req.body.personal), req.session.user.id], function (err, data, fields) {

                // if (err) throw err;

                callback({status: true});
            });
        }
    }

};
module.exports = User;
