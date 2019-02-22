/**
 * Create Campaign directive
 */
ezondapp.directive('createCampaign', function (integrationsService, $http, userService, $state, $http) {

    return {
        restrict: 'E',
        replace: true,
        scope: {},
        link: function ($scope, element, atts) {
            $scope.showPopup = $scope.$parent.showPopup;
            $scope.providers = [];
            if (typeof userService.user.providers_allowed != 'undefined') {
                for (i = 0; i < integrationsService.integrations.length; i++) {
                    if (userService.user.providers_allowed.indexOf(integrationsService.integrations[i].id) != -1) {
                        $scope.providers.push(integrationsService.integrations[i]);
                    }
                }
            } else {
                $scope.providers = integrationsService.integrations;
            }

            $scope.user = userService.user;

            initData();

            var Handler = (function () {
                var i = 1,
                    listeners = {};

                return {
                    addListener: function (element, event, handler, capture) {
                        element.addEventListener(event, handler, capture);
                        listeners[i] = {
                            element: element,
                            event: event,
                            handler: handler,
                            capture: capture
                        };
                        return i++;
                    },
                    removeListener: function (id) {
                        if (id in listeners) {
                            var h = listeners[id];
                            h.element.removeEventListener(h.event, h.handler, h.capture);
                            delete listeners[id];
                        }
                    },
                    removeAllListener: function () {
                        for (id in listeners) {
                            var h = listeners[id];
                            h.element.removeEventListener(h.event, h.handler, h.capture);
                            delete listeners[id];
                        }
                    }
                };
            }());

            $scope.setAdrollPassword = function (value) {
                $scope.adroll_password = value
                $scope.adroll_error = ''
            }            

            $scope.setAdrollUsername = function (value) {
                $scope.adroll_username = value
                $scope.adroll_error = ''
            }

            $scope.clear999 = function () {
                $http.post('/user/delete999networks', {userID: $scope.user.id})
            }

            // Campaign Add Page
            $scope.addCampaign = function () {

                var campaign = angular.copy($scope.campaign);

                campaign.userID = $scope.user.id;

                userService.addCampaign(campaign).$promise
                .then(function (response) {
                    if (response.status) {
                        $scope.$parent.$broadcast('refreshCampaigns', {});
                        $scope.$emit('addcampaign', {campaign: response.campaign});
                        $state.go('app.dashboard.home', {id: response.campaign.id});
                        $scope.$emit('hidePopup', {popup: 'createCampaign'});

                        initData();
                    }
                });
            };

            // Close Integrations Pop-up Window
            $scope.closePopup = function (details) {
                console.log('emit works')
                $scope.clear999();
                $scope.$emit('hidePopup', {popup: 'createCampaign'});
                initData();
            };

            // Close Accounts Information Window
            $scope.closePopup2 = function (details) {
                $scope.showAccount = false;
                $scope.accountStep = '';
                $scope.step = "integrations";
            };

            // Close Accounts Information Window
            $scope.closePopup3 = function (details) {
                $scope.accountStep = 'accountSetup';
            };

            // New Account Binding Click Handler : selectedNetIndex is 0-index
            $scope.selectNewAccount = function () {
                if ($scope.providers[selectedNetIndex].description != "") {
                    $scope.accountStep = "preAccountSetup";
                } else {
                    $scope.connectProvider($scope.providers[selectedNetIndex]);
                }
            };

            // Account Binding Handler
            $scope.connectProvider = function (service) {
                network_index = service.id - 1;
                $scope.networkIndex = service.id - 1;
                $scope.accountLogo = $scope.providers[network_index].logo;
                $scope.dlgDescription = $scope.providers[network_index].description;
                selectedNetIndex = network_index;
                $scope.dlgTitle = $scope.providers[network_index].name;

                if (service.description != "") {
                    console.log("API_KEY connectProvider");
                    $scope.gotoAccountEdit();
                } else {
                    authWindow = window.open($scope.service_url[service.id], "Ezond Authorize Network", "width=500,height=500,top=300,left=500");
                    Handler.removeAllListener();
                    handler = Handler.addListener(window, "message", function (event) {
                        var data = JSON.parse(event.data);
                        if (data.error == "0") {
                            $scope.gotoAccountEdit();
                        }
                        authWindow.close();
                    });
                }
            };

            // Get Network Account Informations from api_key Handler
            $scope.getAccountInfos = function () {
                $scope.credentialsloading = true;
                if ($scope.adroll_username && $scope.adroll_password) {
                    $scope.api_key = $scope.adroll_username + ":" + $scope.adroll_password;
                }
                if ($scope.api_key) {
                    $http.post("/user/addNetworkAccount", {
                        id: selectedNetIndex + 1,
                        campID: 999,
                        api_key: $scope.api_key
                    }).then(function (response) {
                        $scope.credentialsloading = false;
                        response = JSON.parse(response.data)
                        if (response.errors) {
                            $scope.adroll_error = response.errors[0].message
                        } else
                            $scope.gotoAccountEdit();
                    });
                }
            };

            // Binding Account Setup Handler : network_index is 0-index
            function showAccountSetup(network_index, items) {

                $scope.showAccount = true;
                $scope.accountStep = 'accountSetup';
                $scope.accountLogo = $scope.providers[network_index].logo;

                integrationsService.addConnectionInfoRecords(network_index, items);

                $scope.dataRecords = items;
                selectedNetIndex = network_index;
                $scope.dlgTitle = $scope.providers[network_index].name + " Setup";
                $scope.$apply();
            }

            $scope.gotoAccountEdit = function () {

                $http.post("/user/getPreNetworks", {id: selectedNetIndex, campID: 999}).then(function (response) {
                    items = response.data;
                    for (i = 0; i < items.length; i++) {
                        if (items[i].id) items[i].accountId = items[i].id;
                        if (items[i].account) items[i].websiteUrl = items[i].account;
                        if (items[i].viewID) items[i].webPropertyId = items[i].viewID;
                    }
                    $scope.showAccount = true;
                    $scope.accountStep = 'accountSetup';
                    $scope.accountLogo = $scope.providers[selectedNetIndex].logo;

                    integrationsService.addConnectionInfoRecords(selectedNetIndex, items);

                    $scope.dataRecords = items;
                    if (!$scope.dataRecords.length) {
                        $scope.selectNewAccount();
                    }
                    $scope.dlgTitle = $scope.providers[selectedNetIndex].name + " Setup";
                });
            }
            // Check Validation Handler of Entered Data in General Step
            $scope.chkDataValid = function () {

                if (!$scope.campaign.company_name) {
                    $("#company").focus();
                    return false;
                }
                if (!$scope.campaign.url) {
                    $("#url").focus();
                    return false;
                }
                if (!isURLFriendly(!$scope.campaign.url)) {
                    $("#url").focus();
                    return false;
                }
                if (!$scope.campaign.location) {
                    $("#location").focus();
                    return false;
                }
                // if (!$scope.campaign.group) {
                //     $("#group").focus();
                //     return false;
                // }

                $scope.allEntered = true;
                $scope.campaign.location = $('#location').prop("value");

                for (i = 0; i < integrationsService.integrations.length; i++) {
                    integrationsService.removeConnectionInfoRecords(i)
                };

                $scope.step = 'integrations';
                return true;
            };

            // Change Step Handler
            $scope.changeStep = function (stepname) {
                if (!$scope.allEntered) return false;
                $scope.step = stepname;
            };

            // Select Account & Binding Handler
            $scope.saveAccount = function () {
                if ($("md-radio-button.md-checked").length == 0) return;
                tmp_value = $("md-radio-button.md-checked").attr('ng-value');
                tmp_viewID = $("md-radio-button.md-checked").attr('viewID');
                tmp_value = tmp_value.substr(1, tmp_value.length - 2)

                index = $scope.dataRecords.findIndex(x => x.websiteUrl == tmp_value);

                integrationsService.addActiveRecordIdx(selectedNetIndex, index);
                $scope.showAccount = false;
                $scope.step = 'integrations';
                $http.post('/user/bindNetwork', {
                    id: selectedNetIndex,
                    dashboard: 999,
                    account: integrationsService.integrations[selectedNetIndex].connectionInfoRecords[index].websiteUrl,
                    viewID: tmp_viewID
                }) // TODO
                .then(function (response) {
                });
            };

            // Set Pre-Binding Account Information Handler
            $scope.setAccount = function (network_index, account_info) {

                $scope.accountLogo = $scope.providers[network_index].logo;
                $scope.infoRecord = account_info;
                selectedNetIndex = network_index;
                $scope.dlgTitle = $scope.providers[network_index].name;
                $scope.showAccount = true;
                $scope.accountStep = 'accountEdit';
            };

            // Remove Pre-Binding Account Handler
            $scope.deleteAccount = function () {
                integrationsService.removeConnectionInfoRecords(selectedNetIndex);
                $scope.showAccount = false;
                $scope.accountStep = '';
                $http.post('/user/unbindNetwork', {id: selectedNetIndex, dashboard: 999}) // TODO
                .then(function (response) {

                });
                $scope.step = 'integrations';
            };

            // Return to Integrations from Account Setup Page
            $scope.gobacktoIntegrations = function () {
                $scope.showAccount = false;
                $scope.accountStep = '';
                $scope.step = 'integrations';
            };

            // Initialize Module
            function initData() {
                $scope.step = 'general';
                $scope.campaign = {};

                $scope.showAccount = false;
                $scope.dataRecords = [];
                $scope.networkIndex = 0;
                $scope.accountStep = 'accountSetup';
                $scope.accountLogo = '';
                $scope.adroll_username = '';
                $scope.adroll_password = '';
                $scope.dlgTitle = "";
                $scope.infoRecord = {};
                $scope.allEntered = false;
                

                selectedNetIndex = null;

                var autocomplete = new google.maps.places.Autocomplete(document.getElementById('location'));

                $scope.service_url = [""];
                $scope.service_url[11] = '/user/saveadroll';
                $http.post("/user/addNetwork", {id: 1, campID: 999}).then(function (response) {
                    $scope.service_url[1] = response.data;
                });
                $http.post("/user/addNetwork", {id: 2, campID: 999}).then(function (response) {
                    $scope.service_url[2] = response.data;
                });
                $http.post("/user/addNetwork", {id: 3, campID: 999}).then(function (response) {
                    $scope.service_url[3] = response.data;
                });
                $http.post("/user/addNetwork", {id: 4, campID: 999}).then(function (response) {
                    $scope.service_url[4] = response.data;
                });
                $http.post("/user/addNetwork", {id: 5, campID: 999}).then(function (response) {
                    $scope.service_url[5] = response.data;
                });
                $http.post("/user/addNetwork", {id: 6, campID: 999}).then(function (response) {
                    $scope.service_url[6] = response.data;
                });
                $http.post("/user/addNetwork", {id: 7, campID: 999}).then(function (response) {
                    $scope.service_url[7] = response.data;
                });
                $http.post("/user/addNetwork", {id: 8, campID: 999}).then(function (response) {
                    $scope.service_url[8] = response.data;
                });
            }
        },
        templateUrl: '/app/modules/createcampaign/createcampaign2.html'
    }
});