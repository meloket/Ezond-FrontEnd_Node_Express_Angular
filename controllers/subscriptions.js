var config = require("../config/config"),
    gateway = require('../payment_gateways/stripe'),
    db = require('../commons/mysql.js'),
    md5 = require('md5'),
    user = require('../models/user'),
    planModel = require('../models/plan');

module.exports.controller = function (app) {

    app.post('/makeSubscription', function (req, res) {
        let cardSourceId = req.body.cardSourceId;
        let planItems = req.body.planItems;
        let planMaps = req.body.planMaps;
        let customerInfo = req.body.customer;
        let subscriptionData = req.body.subscriptionItems;

        function createSubscription(customer) {
            gateway.setCustomerSource(customer, cardSourceId)
                .then(customer => gateway.createSubscription(planItems, customer, req.body.tax))
                .then(subscription => user.createSubscription(subscription, customerInfo.userId, subscriptionData.billing.id, planMaps, req.body.billingInfo))
                .then(response => response.status ? res.json({subscriptionName: subscriptionData.billing.name}) : res.json(response))
        }

        if (req.body.isFree) {
            user.createFreeSubscription(customerInfo, subscriptionData.billing.id, function (result) {
                result.then(response => {response.status ? res.json({subscriptionName: subscriptionData.billing.name}) : res.json(response)})
                        .catch(error => res.json({error: {message: error.message}}))
            })
        } else {
            if (customerInfo.stripeId) {
                gateway.getCustomer(customerInfo)
                    .then(customer => createSubscription(customer))
                    .catch(error => res.json({error: {message: error.message}}))
            } else {
                gateway.createCustomer(customerInfo)
                    .then(customer => {return user.setCustomerInfo(customer, customerInfo)})
                    .then(result => createSubscription(result))
                    .catch(error => res.json({error: {message: error.message}}))
            }
        }
    });

    app.post('/updateSubscriptionPeriod', function (req, res) {
        const event = req.body;

        if(event.id) {
            gateway.getEvent(event)
                .then(event => gateway.getSubscriptionData(event))
                .then(subscriptionData => user.updateSubscriptionPeriod(subscriptionData))
                .then(res.send('OK'))
                .catch(error => res.send(error.message))
        }
    });

    app.post('/getTermEnd', function (req, res) {
        user.getSubscriptionExpire(req.session.user.id, function (dni) {
            res.json(dni)
        })
    })

    app.get('/getSubscription', function (req, res) {
        let subId = req.query.id;
        gateway.getSubscription(subId, function (cards) {
            res.status(200).send(cards)
        })
    })    

    app.get('/getCustomerCards', function (req, res) {
        let customerInfo = req.query.id;
        gateway.getCustomerCards(customerInfo, function (cards) {
            res.status(200).send(cards)
        })
    })

    app.get('/getActivePlans', function (req, res) {
        planModel.getActivePlans(function (activePlans) {
            return res.status(200).send(activePlans);
        })
    });


    app.get('/getCustomer', function (req, res) {
        let customerInfo = req.query.id;
        gateway.getCustomer(customerInfo, function (customer) {
            res.status(200).send(customer)            
        })
    });    

    app.post('/attachTokenToCustomer', function (req, res) {
        let customerId = req.body.customerId;
        let cardInfo = req.body.card;
        gateway.createCardToken(cardInfo, function (token) {
            console.log(token)
            if (token.message) {
                res.status(200).send({error: token.message, while: 'Create Token'});
                return
            }
            console.log('oked')
            gateway.attachToken(token.id, customerId, function (customer) {
                res.status(200).send(customer);
            })
        })

    })

    app.post('/createCardToken', function (req, res) {
        let cardInfo = req.body.card;
        gateway.createCardToken(cardInfo, function (token) {
            res.status(200).send(token)
        })
    });

    app.get('/getCustomerInvoices', function (req, res) {
        let customerId = req.query.customerId;
        if(customerId) {
            gateway.getInvoicesByCustomerId(customerId)
                .then(invoices => {
                    return res.status(200).send({invoices: invoices.data})
                })
                .catch(error => {
                    return res.status(200).send({invoices: []})
                })
        }
    });

}