var db = require('../commons/mysql.js'),
    config = require("../config/config"),
    md5 = require("md5");

var Plan = {

    getAll: function (callback) {
        db.query('SELECT * FROM plans', function (error, data, fields) {
            let allPlans = {
                billing: [],
                extra: []
            };

            data.forEach(function (item) {
                if(item.extra) {
                    allPlans.extra.push(item);
                } else {
                    allPlans.billing.push(item);
                }
            });

            return callback(allPlans);
        })
    },
    
    get: function (id, callback) {
        db.query('SELECT * FROM plans WHERE id = ?', [id], function (error, data, fields) {
            return callback(data[0] || {})
        })
    },

    create: function (plan, callback) {
        let sql = "INSERT INTO `plans` " +
            "(`name`, `price`, `interval`, `stripe_id`, `campaigns_number`, `keywords_number`, `ad_keywords_number`, `extra`, `trial`, `type`) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        let insertData = [
            plan.name,
            plan.price,
            plan.interval,
            plan.stripe_id,
            plan.campaigns_number,
            plan.keywords_number,
            plan.ad_keywords_number,
            plan.extra,
            plan.trial,
            plan.type,
        ];

        db.query(sql, insertData, function (error, data, fields) {
                if (error) {
                    return callback({result: false, planId: null})
                }

                return callback({result: true, planId: data.insertId});
            })
    },

    toggleDisableStatus: function (planId, disable, callback) {
        let data = [
            disable ? new Date() : null,
            planId,
        ];

        db.query('UPDATE plans SET disabled_at = ? WHERE id = ?', data, function (error, data, fields) {
            return callback({result: !error});
        })
    },

    countByStripeId: function (stripeId, callback) {
        if(!stripeId) {
            return callback(0);
        }

        db.query('SELECT count(*) AS numbers FROM plans WHERE stripe_id = ?', [stripeId], function (error, data, fields) {
            if(error) {
                return callback(0);
            }
            return callback(data[0].numbers);
        })
    },
    
    remove: function (plan, callback) {
        db.query('UPDATE plans SET stripe_id = NULL, deleted_at = ? WHERE id = ?', [new Date(), plan.id], function (error, data, fields) {
            return callback({result: !error});
        })
    },

    getActivePlans: function (callback) {
        db.query('SELECT * FROM plans WHERE disabled_at IS NULL AND deleted_at IS NULL AND trial IS NULL', [], function (error, data, fields) {
            let activePlans = {
                billing: {
                    month: [],
                    year: [],
                },
                extra: {
                    month: [],
                    year: [],
                }
            };

            data.forEach(function (item) {
                if(item.extra) {
                    if(item.interval == 'month') {
                        activePlans.extra.month.push(item);
                    } else {
                        activePlans.extra.year.push(item)
                    }
                } else {
                    if(item.interval == 'month') {
                        activePlans.billing.month.push(item);
                    } else {
                        activePlans.billing.year.push(item)
                    }
                }
            });

            return callback(activePlans);
        })
    }

};

module.exports = Plan;
