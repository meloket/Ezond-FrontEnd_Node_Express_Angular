ezondapp.service('subscriptionPlansProviders', function () {
    var self = this;

    this.billingIntervals = {
        month: 'month',
        year: 'year',
    };
    this.planTypes = ['billing', 'extra'];
    this.activePlans = {};
    this.taxes = {
        NZ: 15,
    }

});