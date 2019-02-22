var config = require("../config/config.js"),
    md5 = require("md5"),
    db = require('../commons/mysql.js');


var Admin = {

    getSiteCheckRules: function (callback) {
        // db.query('SELECT ')
    },

    getAllUsers: function (callback) {
        let sql = `SELECT users.id, users.first_name, users.last_name, users.company, plans.name AS plan, 
                    date(users.signupDate) AS reg_date, 
                    date(users.lastLogin) AS login_date, 
                    (select count(*) FROM dashboards AS dd WHERE dd.ownerID = users.id) AS count_campaign, 
                    sum(if(agency_users.role = "staff", 1, 0)) AS count_staff, 
                    sum(if(agency_users.role = "client", 1, 0)) AS count_client 
                        FROM users 
                            LEFT JOIN agency_users ON users.id=agency_users.parent_id 
                            LEFT JOIN subscriptions ON users.id = subscriptions.user_id
                            LEFT JOIN plans ON subscriptions.billing_plan_id = plans.id
                                GROUP BY users.id 
                                ORDER BY users.id ASC`;
        db.query(sql, function (err, data, fields) {
            return callback(data);
        });
    },

    testApis: function (callback) {
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

    getSiteStats: function (callback) {
        var stats = {};
        db.query('SELECT COUNT(*) as newUsers FROM users WHERE DATE(signupDate) = DATE(NOW())', function (err, newUsers, fields) {
            stats.newusers = newUsers[0].newUsers;
            db.query('SELECT COUNT(*) as totalUsers FROM users', function (err, totalUsers, fields) {
                stats.totalusers = totalUsers[0].totalUsers;
                callback(stats);
            });
        });
    },
    getAgency: function (id, callback) {
        let sql = `SELECT 
                    (SELECT p.name FROM plans p
                        INNER JOIN subscriptions s ON s.billing_plan_id = p.id 
                            WHERE user_id = ?) AS plan, 
                    (SELECT GROUP_CONCAT(login_at) FROM login_sessions 
                            WHERE user_id=users.id 
                                ORDER BY login_at 
                                DESC LIMIT 5) AS last_login, 
                    (SELECT p.trial FROM plans p
                        INNER JOIN subscriptions s ON s.billing_plan_id = p.id 
                            WHERE user_id = ?) AS trial, 
                    (SELECT expires_at FROM subscriptions WHERE user_id = ?) AS plan_expire,
                    users.id, users.adminNote, users.first_name, users.last_name, users.company, users.email, users.lastLogin, 
                    DATE_FORMAT(users.signupDate,"%d/%m/%Y") AS signupDate, 
                    users.personal, users.domainName, 
                    (SELECT count(*) FROM dashboards AS dd 
                        WHERE dd.ownerID = users.id) AS a_campaign, 
                    sum(if(agency_users.role = "staff", 1, 0)) AS a_staff, 
                    sum(if(agency_users.role = "client", 1, 0)) AS a_client 
                        FROM users 
                            LEFT JOIN agency_users ON users.id = agency_users.parent_id 
                                WHERE users.id = ?`;
        db.query(sql, [id, id, id, id], function (err, agency, fields) {
            let query = `SELECT first_name AS client_name, last_name as client_surname, role AS client_role 
                            FROM agency_users 
                                WHERE parent_id = ?`;
            db.query(query, [id], function (err, data, fields) {
                agency[0].accounts = data;
                return callback(agency);
            })
        });
    },

    getDashboard: function (callback) {
        var datas = {};
        db.query('select count(*) as agency_count from users', function (err, agency, fields) {
            datas.agency = agency;
        });
        db.query('select count(*) as campaigns from dashboards', function (err, campaigns, fields) {
            datas.campaigns = campaigns;
        });
        db.query('select sum(if(agency_users.role = "staff", 1, 0)) as count_staff, sum(if(agency_users.role = "client", 1, 0)) as count_client from agency_users', function (err, user, fields) {
            datas.user = user;
        });
        db.query('SELECT count(*) as agency_sign FROM users where DATE(signupDate)=CURDATE()', function (err, agency_sign, fields) {
            datas.agency_sign = agency_sign;
        });
        db.query('SELECT users.id, users.first_name, users.last_name ,users.company,date(users.signupDate) as reg_date,date(users.lastLogin) as login_date,(select count(*) from dashboards as dd where dd.ownerID = users.id) as count_campaign, sum(if(agency_users.role = "staff", 1, 0)) as count_staff, sum(if(agency_users.role = "client", 1, 0)) as count_client FROM users left join agency_users on users.id=agency_users.parent_id group by users.id order by users.id asc', function (err, agency_data, fields) {
            datas.agency_data = agency_data;
        });
        db.query('SELECT date_format(signupDate, "%W") as day, count(signupDate) as last_total FROM users WHERE date(signupDate) BETWEEN subdate(curdate(),dayofweek(curdate())+5) and subdate(curdate(),dayofweek(curdate())-1) group by date(signupDate)', function (err, last_total, fields) {
            datas.last_total = last_total;
        });
        db.query('SELECT date_format(signupDate, "%W") as day, count(signupDate) as curr_total FROM users WHERE yearweek(DATE(signupDate), 1) = yearweek(curdate(), 1) group by date(signupDate)', function (err, curr_total, fields) {
            datas.curr_total = curr_total;
        });
        db.query('SELECT day(signupDate) as sign_date, count(*) as data FROM users WHERE MONTH(signupDate) = MONTH(CURRENT_DATE()) group by DATE(signupDate) order by signupDate', function (err, curr_month, fields) {
            datas.curr_month = curr_month;
        });
        db.query('SELECT day(signupDate) as sign_date, count(*) as data FROM users WHERE YEAR(signupDate) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(signupDate) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) group by DATE(signupDate) order by signupDate', function (err, last_month, fields) {
            datas.last_month = last_month;

        });
        console.log(datas);
        return callback(datas);
    },

    getSearch: function (search, callback) {
        db.query('SELECT users.id, users.first_name, users.last_name ,users.company,date(users.signupDate) as reg_date,date(users.lastLogin) as login_date,(select count(*) from dashboards as dd where dd.ownerID = users.id) as count_campaign, sum(if(agency_users.role = "staff", 1, 0)) as count_staff, sum(if(agency_users.role = "client", 1, 0)) as count_client FROM users left join agency_users on users.id=agency_users.parent_id where users.first_name like ' + db.escape('%' + search + '%') + ' OR users.last_name like ' + db.escape('%' + search + '%') + ' OR users.email like ' + db.escape('%' + search + '%') + ' OR users.company like ' + db.escape('%' + search + '%') + ' group by users.id order by users.id asc limit 10', function (err, agency_data, fields) {
            return callback(agency_data);
        });
    },

    updateAgency: function (data, callback) {
        var id = data.body.data.id;
        var pass = data.body.data.password;
        var adminNote = data.body.data.adminNote;
        if (pass) {
            pwd = md5(config.system.db_salt + pass);
            db.query('UPDATE users SET password = ? WHERE id = ?', [pwd, id], function (err, agency, fields) {
                return callback(agency);
            });
        } else {

            db.query('UPDATE users SET adminNote = ? WHERE id = ?', [adminNote, id], function (err, agency, fields) {
                return callback(agency);
            });
        }
    },

};

module.exports = Admin;
