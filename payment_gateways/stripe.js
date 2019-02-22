let config = require("../config/config"),
    stripe = require('stripe')(config.stripe.secret_key);

let Stripe = {
    eventTypes: {
        invoicePaid: 'invoice.payment_succeeded',
    },

    productName: 'ezond',
    invoicesLimit: 100,

    getSubscription: function(subscriptionId, callback) {
        stripe.subscriptions.retrieve(
            subscriptionId,
            function(err, subscription) {
                callback(subscription)
            }
        );
    },

    attachToken: function(tokenId, customerId, callback) {
        stripe.customers.update(customerId, {
            source: tokenId
        }, function(err, customer) {
            if (err) {
                callback({error: err.message, while: 'Attach token'})
            } else {
                callback(customer)
            }

        });
    },

    createCardToken: function(cardInfo, callback) {
        stripe.tokens.create({
            card: {
                number: cardInfo.number,
                exp_month: cardInfo.exp_month,
                exp_year: cardInfo.exp_year,
                cvc: cardInfo.cvc
            }
        }, function(err, token) {
            if (err) {
                callback(err)
            } else {
                callback(token)
            }
        });

    },

    getCustomerCards: function(customerInfo, callback) {
        stripe.customers.listCards(customerInfo, function(err, cards) {
            callback(cards)
        });
    },

    getCustomer: function(customerInfo, callback) {
        stripe.customers.retrieve(customerInfo, function(err, customer) {
            callback(customer)
        });
    },

    createCustomer: function(customerInfo) {
        return stripe.customers.create({
            description: customerInfo.email,
        });
    },

    setCustomerSource: function(customer, cardToken) {
        return stripe.customers.update(customer.id, {
            source: cardToken,
        })
    },

    createSubscription: function(items, customer, tax) {
        let data = {
            customer: customer.id,
            items: items,
        };

        if (tax > 0) {
            data.tax_percent = tax;
        }

        return stripe.subscriptions.create(data);
    },

    getEvent: function(event) {
        return stripe.events.retrieve(event.id);
    },

    getSubscriptionData: function(event) {
        self = this;

        return new Promise((resolve, reject) => {
            if (event.type != self.eventTypes.invoicePaid) {
                return reject({ message: 'Incorrect event type' })
            }

            const source = event.data.object.lines.data[0];
            let result = {
                subscriptionId: source.subscription || null,
                expiredAt: source.period.end || null,
            };

            resolve(result);
        })
    },

    createPlan: function(plan, productId) {
        let data = {
            amount: Math.round(plan.price * 100),
            interval: plan.interval,
            product: productId,
            currency: 'usd',
            nickname: plan.name
        };

        return stripe.plans.create(data);
    },

    deletePlan: function(planId) {
        return stripe.plans.del(planId);
    },

    getProductsList: function() {
        return stripe.products.list({ limit: 1 })
    },

    getProductById: function(id) {
        return stripe.products.retrieve(id);
    },

    createProduct: function() {
        self = this;

        return stripe.products.create({
            name: self.productName,
            type: 'service',
        });
    },

    getInvoicesByCustomerId: function(customerId) {
        self = this;

        return stripe.invoices.list({
            customer: customerId,
            limit: self.invoicesLimit
        });
    }

}

module.exports = Stripe;