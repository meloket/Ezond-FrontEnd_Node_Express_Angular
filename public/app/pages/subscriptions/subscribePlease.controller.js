/**
 * Users controller
 */
ezondapp.controller('subscribePlease', function($timeout, $scope, $q, $http, $state, $window, userService, subscriptionPlansProviders, appDataService, $mdDialog, config) {

    let suffix = '_number';
    let stripe = Stripe(appDataService.appData.stripePublicKey);
    let elements = stripe.elements();
    $scope.billingStep = 1;

    function displayLoading(isLoading) {
        if (isLoading) {
            angular.element('#loading').show();
            angular.element('#button-purchase').hide();
        } else {
            angular.element('#loading').hide();
            angular.element('#button-purchase').show();
        }
    }

    $scope.$parent.pleasesubscribeState = true;


    $scope.billingInfo = {
        company_name: '',
        street_number: '',
        address: '',
        region: '',
        postcode: '',
        country: 'NZ',
        name_on_card: '',
    };

    let elementStyles = {
        base: {
            color: '#5b6a73',
            backgroundColor: '#e6e9ea',
            fontWeight: 400,
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',

            ':focus': {
                color: '#5b6a73',
            },

            '::placeholder': {
                color: '#9BACC8',
            },

            ':focus::placeholder': {
                color: '#CFD7DF',
            },
        },
        invalid: {
            color: '#FA755A',
            ':focus': {
                color: '#FA755A',
            },
            '::placeholder': {
                color: '#FFCCA5',
            },
        },
    };

    let options = {
        style: elementStyles,
    };

    function errorHandler(event) {
        $scope.displayError = document.getElementById('card-errors');
        $scope.displayError.textContent = event.error ? event.error.message : '';
    }

    let cardNumber = elements.create('cardNumber', options);
    cardNumber.mount('#card-number');

    let cardExpiry = elements.create('cardExpiry', options);
    cardExpiry.mount('#card-expiry');

    let cardCvc = elements.create('cardCvc', options);
    cardCvc.mount('#card-cvc');

    cardNumber.addEventListener('change', errorHandler);
    cardExpiry.addEventListener('change', errorHandler);
    cardCvc.addEventListener('change', errorHandler);

    $scope.stripe = stripe;
    $scope.cardNumber = cardNumber;
    $scope.cardExpiry = cardExpiry;
    $scope.cardCvc = cardCvc;

    $scope.currentSubscription = userService.user.planSubscribed;
    if ($scope.currentSubscription)
        $scope.showPurchaseButton = !($scope.currentSubscription.stripe_id);

    $scope.userInvoices = [];

    function isExistInvoices() {
        $scope.existsInvoices = $scope.userInvoices.length > 0;
    }
    isExistInvoices();

    $scope.openInvoicePage = function(url) {
        $window.open(url, '_blank');
    };

    $scope.updateCard = function(card) {
        $mdDialog.show({
                template: `<md-dialog style="width: 60%;max-width: 600px">
                            <md-toolbar layout="row" layout-align="start center" class="md-padding">
                                <span class="white-c">Payment source</span> 
                            </md-toolbar>
                            <md-dialog-content style="padding-top: 30px" class="md-padding" layout="column">

                                <div layout=row>
                                    <form name="form" class="flex-100">
                                        <div ng-hide="!editCard" class="md-padding">
                                            <md-input-container style="margin-bottom: 0;" class="md-block"> 
                                                <label class="md-title" for="">Last 4 numbers</label>
                                                <input type="text" ng-model="last4" ng-disabled="editCard"/>
                                            </md-input-container>
                                        </div>                                

                                        <div ng-hide="editCard" class="md-padding">
                                            <md-input-container style="margin-bottom: 0;" class="md-block"> 
                                                <label class="md-title" for="">Number</label>
                                                <input required type="number" name="number" ng-minlength="16" ng-maxlength="16" ng-model="number" ng-disabled="editCard"/>
                                            </md-input-container>
                                        </div>

                                        <div class="md-padding" layout=row>
                                            <md-input-container  style="margin-bottom: 0;" class="md-block flex-50"> 
                                                <label class="md-title" for="">Month</label>
                                                <input required type="number" ng-minlength="1" ng-maxlength="2" ng-model="month" ng-disabled="editCard"/>
                                            </md-input-container>
                                            <md-input-container  style="margin-bottom: 0;" class="md-block flex-50"> 
                                                <label class="md-title" for="">Year</label>
                                                <input required ng-minlength="4" ng-maxlength="4" type="number" name="year" ng-model="year" ng-disabled="editCard"/>
                                            </md-input-container>
                                        </div>
                                  

                                        <div ng-hide="editCard" class="md-padding">
                                            <md-input-container style="margin-bottom: 0;" class="md-block"> 
                                                <label class="md-title" for="">CVC</label>
                                                <input required name="cvc" ng-minlength="3" ng-maxlength="3" type="number" ng-model="cvc" ng-disabled="editCard"/>
                                            </md-input-container>                               
                                        </div>
                                    </form>
                                    <!-- <div layout=row>
                                        <span flex></span>
                                        <md-button title="Edit" class="md-icon-button" ng-click="toggleEdit()" >
                                            <i class="fas fa-pen" ng-class="TagCell--colorBlue"></i>
                                        </md-button>
                                        <md-button title="Delete" class="md-icon-button" >
                                            <i class="fas fa-times" ng-class="TagCell--colorBlue"></i>
                                        </md-button>
                                    </div> -->
                                </div>
                                <div ng-show="error" class="alert-danger md-padding md-title">
                                    {{error}}
                                </div>
                                <div ng-show="success" class="alert-success md-padding md-title">
                                    Your payment details updated.
                                </div>
                            </md-dialog-content>
                            <md-dialog-actions style="padding-top: 0px;" class="md-padding" layout="row" layout-align="center">
                                <md-button ng-disabled="!form.$valid"  ng-click="save()" class="md-raised md-primary">Save card</md-button>
                                <md-button ng-click="cancel()" class="md-raised">Cancel</md-button>
                            </md-dialog-actions>
                        </md-dialog>`,
                locals: {
                    card: card
                },
                escapeToClose: false,
                controller: function campstatusnotes($scope,card, $mdDialog) {
                    $scope.card = card || {}
                    $scope.editCard = false

                    $scope.number = '';
                    $scope.cvc = '';

                    $scope.last4 = card.last4 || ''
                    $scope.year = card.exp_year || ''
                    $scope.month = card.exp_month || ''

                    $scope.toggleEdit = function () {
                        $scope.editCard = !$scope.editCard;
                    }

                    $scope.save = function() {
                        $http.post('/attachTokenToCustomer', {
                                card: {
                                    number: $scope.number,
                                    exp_month: $scope.month,
                                    exp_year: $scope.year,
                                    cvc: $scope.cvc
                                },
                                customerId: userService.user.stripe_customer_id
                            }).then(
                            function(response) {
                                console.log(response)
                                if (response.data.error) {
                                    $scope.error = response.data.error
                                    $timeout(function () {
                                        $scope.error = false
                                    }, 5000)
                                }
                                if (!(response.data.error)) {
                                    $scope.success = true;
                                    $timeout(function () {
                                        $mdDialog.hide()
                                    }, 5000)
                                    $scope.getCustomer()
                                }
                        })

                        
                    }

                    $scope.cancel = function() {
                        $mdDialog.cancel()
                    }

                }
            })
            .then(function(card) {

            })
    }

    $scope.getCustomer = function () {
        $http.get('/getCustomer?id=' + userService.user.stripe_customer_id)
            .then(function(response) {
                $scope.paymentSources = response.data.sources.data
            })
    }

    $scope.getCustomer()

    $http.get('/getCustomerInvoices?customerId=' + userService.user.stripe_customer_id)
        .then(function(response) {
            response.data.invoices.forEach(function(invoice) {
                $scope.userInvoices.push({
                    date: invoice.date,
                    url: invoice.hosted_invoice_url,
                    formatedDate: moment(invoice.date * 1000).format('MMMM DD YYYY, HH:mm'),
                    total: invoice.total
                });
            });
            isExistInvoices();
        });

    let currentDate = moment();
    if ($scope.currentSubscription) {
        let expireDate = moment.unix(+$scope.currentSubscription.expires_at);
        $scope.leftSubscriptionDays = expireDate.diff(currentDate, 'days');
    }

    $scope.limitsOptions = userService.user.limits;
    $scope.usedOptions = userService.user.usedOptions;
    $scope.progressOption = function(used, limit) {
        return limit > 0 ? used / limit * 100 : 100;
    };

    $scope.subscribedPlanName = '';
    $scope.subscriptionTotalPrice = 0;
    $scope.subscriptionTotalTax = 0;
    $scope.subscriptionTotalWithTax = 0;

    $scope.billingPlans = subscriptionPlansProviders.activePlans.billing || [];
    $scope.extraPlans = subscriptionPlansProviders.activePlans.extra || [];

    $scope.planIntervals = subscriptionPlansProviders.billingIntervals;
    $scope.planTypes = subscriptionPlansProviders.planTypes;

    $scope.selectedInterval = $scope.planIntervals.month;
    $scope.selectedPlanIndex = 0;
    $scope.selectedPlan = $scope.billingPlans[$scope.selectedInterval][$scope.selectedPlanIndex];

    $scope.subscriptionItems = initDefaultItemsObject($scope.selectedPlan, $scope.extraPlans[$scope.selectedInterval]);

    $scope.togglePlanIntervals = function(interval) {
        $scope.selectedInterval = $scope.planIntervals[interval];
        $scope.selectedPlan = $scope.billingPlans[$scope.selectedInterval][0];
        $scope.subscriptionItems = initDefaultItemsObject($scope.selectedPlan, $scope.extraPlans[$scope.selectedInterval]);
        $scope.calculateTotalPriceOfSubscription();
        $scope.calculateNextRenewalDate();
    };

    function isFreePlan() {
        $scope.isFreePlan = $scope.selectedPlan.type == 'free';
    }
    isFreePlan();

    $scope.goToControlPanel = function() {
        appDataService.getAppData()
            .then(() => $window.location.reload());
    };

    $scope.setBillingStep = function(step) {
        $scope.billingStep = step;
    };

    $scope.calculateNextRenewalDate = function() {
        let offset = $scope.selectedInterval.substr(0, 1).toUpperCase();
        $scope.nextRenewal = moment().add(1, offset).format('MMM DD, YYYY');
    };
    $scope.calculateNextRenewalDate();

    $scope.togglePlan = function(planId) {
        $scope.selectedPlan = findPlanById(planId, 'billing', $scope.selectedInterval);
        isFreePlan();
        if ($scope.isFreePlan) {
            for (let key in $scope.subscriptionItems.extra) {
                $scope.subscriptionItems.extra[key].quantity = 0;
            }
        }
        $scope.updateBillingItem($scope.selectedPlan);
        $scope.calculateTotalPriceOfSubscription();
        $scope.calculateNextRenewalDate();
    };

    $scope.updateBillingItem = function(billingPlan) {
        $scope.subscriptionItems.billing.id = billingPlan.id;
        $scope.subscriptionItems.billing.price = billingPlan.price;
        $scope.subscriptionItems.billing.stripe_id = billingPlan.stripe_id;
        $scope.subscriptionItems.billing.name = billingPlan.name;

        let properties = $scope.subscriptionItems.properties;

        for (let property in properties) {
            properties[property].number = billingPlan[property + suffix];

            if ($scope.isFreePlan && property in $scope.subscriptionItems.extra) {
                properties[property].number += $scope.subscriptionItems.extra[property].quantity * properties[property].step;
            }
        }
        $scope.calculateTotalPriceOfSubscription();
    };

    $scope.getHeaderFromPropertyName = function(propertyName) {
        let name = propertyName.replace('_', ' ');

        return name.split(/\s+/).map(
            word => word[0].toUpperCase() + word.substring(1)
        ).join(' ');
    };

    $scope.updateExtraItems = function(propertyName, action) {
        let extraItems = $scope.subscriptionItems.extra;
        let property = $scope.subscriptionItems.properties[propertyName];
        let coefficient = action === 'add' ? 1 : -1;

        function updateItems() {
            extraItems[propertyName].quantity += coefficient;
            property.number += coefficient * property.step;
            $scope.calculateTotalPriceOfSubscription()
        }

        if (propertyName in extraItems) {
            if (action === 'add' || extraItems[propertyName].quantity > 0) {
                updateItems();
            }
        } else {
            alert('Currently, the additional purchase of ' + $scope.getHeaderFromPropertyName(propertyName) + ' is not available.');
        }
    };

    $scope.calculateTotalPriceOfSubscription = function() {
        $scope.subscriptionTotalPrice = $scope.subscriptionItems.billing.price;

        for (let key in $scope.subscriptionItems.extra) {
            let item = $scope.subscriptionItems.extra[key];
            $scope.subscriptionTotalPrice += item.price * item.quantity;
        }
        $scope.subscriptionTotalTax = parseInt(($scope.subscriptionTotalPrice * $scope.tax / 100).toFixed(0));
        $scope.subscriptionTotalWithTax = $scope.subscriptionTotalPrice + $scope.subscriptionTotalTax;
    };

    function getTaxByCountry(country) {
        $scope.tax = subscriptionPlansProviders.taxes[country] || 0;
    }
    getTaxByCountry($scope.billingInfo.country);

    $scope.changeCountry = function() {
        getTaxByCountry($scope.billingInfo.country);
        $scope.calculateTotalPriceOfSubscription();
    };

    $scope.purchaseSubscription = function() {
        $scope.planItems = [];
        $scope.planMaps = {};
        let inputError = false;
        displayLoading(true);

        function pushPlanItem(item) {
            $scope.planItems.push({
                plan: item.stripe_id || 'free',
                quantity: item.quantity,
            });
            if (!$scope.isFreePlan) {
                $scope.planMaps[item.stripe_id] = item.id;
            }
        }

        pushPlanItem($scope.subscriptionItems.billing);
        let promise = new Promise((resolve, reject) => { resolve($scope.cardSourceId = null) });

        if (!$scope.isFreePlan) {
            for (let field in $scope.billingInfo) {
                if ($scope.billingInfo[field] == '') {
                    angular.element('input[name="' + field + '"]').addClass('error-input');
                    inputError = true;
                } else {
                    angular.element('input[name="' + field + '"]').removeClass('error-input');
                    inputError = $scope.inputError || false;
                }
            }

            if (inputError) {
                displayLoading(false);
                return false;
            }

            let ownerInfo = {
                owner: {
                    name: $scope.billingInfo.name_on_card,
                }
            };

            let extraItems = $scope.subscriptionItems.extra;
            for (let key in extraItems) {
                let item = extraItems[key];
                if (item.quantity > 0) {
                    pushPlanItem(item);
                }
            }

            promise = $scope.stripe.createSource($scope.cardNumber, ownerInfo)
                .then(function(result) {
                    if (result.error) {
                        $scope.displayError = result.error.message;
                        displayLoading(false);
                        throw result.error;
                    } else {
                        $scope.cardSourceId = result.source.id;
                    }
                })
        }

        promise
            .then(() => $scope.subscribe())
            .then((response) => {
                if (response.data.subscriptionName != 'undefined') {
                    displayLoading(false);
                    $scope.subscribedPlanName = response.data.subscriptionName;
                    angular.element('#step-2').hide();
                    angular.element('#step-3').show();
                    angular.element('#subscribedPlan').text('Plan: ' + response.data.subscriptionName);
                }
            })
            .catch(() => { displayLoading(false); });
    };

    $scope.customer = {
        email: userService.user.email,
        userId: userService.user.id,
        stripeId: userService.user.stripe_customer_id,
    };

    $scope.subscribe = function() {
        var deferred = $q.defer()

        let data = {
            customer: $scope.customer,
            cardSourceId: $scope.cardSourceId || null,
            planItems: $scope.planItems,
            planMaps: $scope.planMaps,
            subscriptionItems: $scope.subscriptionItems,
            isFree: $scope.isFreePlan,
            tax: $scope.tax,
            billingInfo: JSON.stringify($scope.billingInfo),
        };

        $http({
            method: 'POST',
            url: '/makeSubscription',
            data: JSON.stringify(data),
        }).then(function success(response) {
            if (response.data.error) {
                $scope.formerror = response.data.error.message;
                $scope.loading = false;
                deferred.reject()
            } else {
                deferred.resolve(response)
            }
        }, function error(response) {})

        return deferred.promise;
    }

    $scope.calculateTotalPriceOfSubscription();

    $scope.currentPlan = userService.planSubscribed
    $scope.planTermEnd = '';
    $scope.classForLoadingPlans = false;
    $scope.expired = appDataService.appData.subscription_expired;

    $scope.planName = function() {
        if ($scope.plans.find(function(plan) {
                return plan.id == $scope.currentPlan
            }))
            return $scope.plans.find(function(plan) {
                return plan.id == $scope.currentPlan
            }).name
    }

    $scope.cardSourceId = '';
    $scope.formerror = ""

    function initDefaultItemsObject(billingPlan, extraPlans) {
        let extraItems = {};
        let properties = {
            campaigns: {
                number: billingPlan.campaigns_number,
                step: 0,
            },
            keywords: {
                number: billingPlan.keywords_number,
                step: 0,
            },
            ad_keywords: {
                number: billingPlan.ad_keywords_number,
                step: 0,
            },
        };

        extraPlans.forEach(function(plan) {
            for (let key in plan) {
                if (key.indexOf(suffix) == -1) {
                    continue;
                }

                if (plan[key] == null) {
                    continue;
                }

                let index = angular.copy(key).replace(suffix, '');

                extraItems[index] = {
                    id: plan.id,
                    quantity: 0,
                    price: plan.price,
                    name: plan.name,
                    stripe_id: plan.stripe_id,
                };

                extraItems[index].totalPrice = extraItems[index].quantity * extraItems[index].price;
                properties[index].step = plan[key];
            }
        });

        return {
            billing: {
                id: billingPlan.id,
                quantity: 1,
                price: billingPlan.price,
                stripe_id: billingPlan.stripe_id,
                name: billingPlan.name,
            },
            extra: extraItems,
            properties: properties,
        };
    }

    function findPlanById(id, type, interval) {
        let plans = subscriptionPlansProviders.activePlans[type][interval];
        let plan = {};

        plans.forEach(function(item) {
            if (item.id == id) {
                plan = item
            }
        });

        return plan;
    }

    function getExpireTime() {
        $http({
            method: "POST",
            url: "/getTermEnd",
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            $scope.planTermEnd = moment.unix(response.data).format("D MMMM YYYY")
        })
    }

    getExpireTime();
});