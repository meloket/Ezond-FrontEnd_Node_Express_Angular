/**
 * Create integrations directive
 */
ezondapp.directive('integrations', function($http, userService, integrationsService, dashboardService, $state) {

    return {
        restrict: 'E',
        replace: true,
        scope: {

        },
        link: function($scope, element, atts) {

            $scope.showPopup = $scope.$parent.showPopup;
            //$scope.providers = integrationsService.integrations;
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
            $scope.connectionInfo = dashboardService.dashboard.integrations;

            initData();

            var Handler = (function() {
                var i = 1,
                    listeners = {};

                return {
                    addListener: function(element, event, handler, capture) {
                        element.addEventListener(event, handler, capture);
                        listeners[i] = {
                            element: element,
                            event: event,
                            handler: handler,
                            capture: capture
                        };
                        return i++;
                    },
                    removeListener: function(id) {
                        if (id in listeners) {
                            var h = listeners[id];
                            h.element.removeEventListener(h.event, h.handler, h.capture);
                            delete listeners[id];
                        }
                    },
                    removeAllListener: function() {
                        for (id in listeners) {
                            var h = listeners[id];
                            h.element.removeEventListener(h.event, h.handler, h.capture);
                            delete listeners[id];
                        }
                    }
                };
            }());


            // Get Account-Binding Information and Setting Connection Info Record
            $scope.$on('showIntegrations', function(e, details) {
                $scope.connectionsloading = true
                $scope.loadBindAccountInfo(details.campaign);
            });

            // Get Account-Binding Information and Setting Connection Info Record
            $scope.loadBindAccountInfo = function(campaign = {}) {
                initData(campaign);
                $http.post("/user/getDashboardBindAccounts", { id: campaign.id ? campaign.id : dashboardService.dashboard.id }).then(function(response) {
                    $scope.connectionsloading = false
                    $scope.connectionInfo = response.data;
                    for (i = 0; i < integrationsService.integrations.length; i++)
                        integrationsService.removeConnectionInfoRecords(i);

                    for (i = 0; i < $scope.connectionInfo.length; i++) {
                        sel_obj = $scope.connectionInfo[i];
                        if (sel_obj.id) sel_obj.accountId = sel_obj.id;
                        if (sel_obj.account) sel_obj.websiteUrl = sel_obj.account;
                        if (sel_obj.viewID) sel_obj.webPropertyId = sel_obj.viewID;
                        integrationsService.addConnectionInfoRecords($scope.connectionInfo[i].networkID * 1 - 1, [sel_obj]);
                        integrationsService.addActiveRecordIdx($scope.connectionInfo[i].networkID * 1 - 1, 0);
                    }
                });
            }



            // Close Integrations Window Handler
            $scope.closePopup = function(details) {

                $scope.$emit('hidePopup', { popup: 'integrations' });
                initData();
            }

            // Close Account Select Window Handler
            $scope.closePopup2 = function(details) {
                $scope.loadBindAccountInfo();
                $scope.showAccount = false;
                $scope.accountStep = '';
                $scope.step = "integrations";
            }

            // Close Accounts Information Window
            $scope.closePopup3 = function(details) {

                $scope.accountStep = 'accountSetup';
            }

            // New Account Binding Click Handler : selectedNetIndex is 0-index
            $scope.selectNewAccount = function() {
                if ($scope.providers[selectedNetIndex].description != "") {
                    $scope.crOrDs = selectedNetIndex;
                    $scope.accountStep = "preAccountSetup";
                } else {
                    $scope.connectProvider($scope.providers[selectedNetIndex]);
                }
            }


            // Account Binding Handler
            $scope.connectProvider = function(service) {
                $scope.networkIndex = service.id - 1;
                network_index = service.id - 1;
                $scope.accountLogo = $scope.providers[network_index].logo;
                $scope.dlgDescription = $scope.providers[network_index].description;
                selectedNetIndex = network_index;
                $scope.dlgTitle = $scope.providers[network_index].name;

                if (service.description != "") {
                    console.log("API_KEY connectProvider");
                    $scope.gotoAccountEdit();
                } else {

                    authWindow = window.open($scope.service_url[service.id], "Ezond Authorize Network", "width=500,height=500,top=1,left=1");
                    Handler.removeAllListener();
                    handler = Handler.addListener(window, "message", function(event) {
                        var data = JSON.parse(event.data);
                        if (data.error == "0") {
                            $scope.gotoAccountEdit();
                        } else {

                        }
                        authWindow.close();
                    });
                }
            }


            // Get Network Account Informations from api_key Handler
            // split(/_(.+)/)[1]
            $scope.getAccountInfos = function() {

                if ($scope.adroll_username && $scope.adroll_password) {
                    $scope.api_key = $scope.adroll_username + ":" + $scope.adroll_password;
                }
                if ($scope.api_key) {
                    console.log($scope.campaign)
                    // $http.post("/user/addNetworkAccount", {id: selectedNetIndex + 1, campID:dashboardService.dashboard.id, api_key: $scope.api_key}).then(function(response) {
                    $http.post("/user/addNetworkAccount", { id: selectedNetIndex + 1, campID: $scope.campaign.id, api_key: $scope.api_key }).then(function(response) {
                        response = JSON.parse(response.data)
                        if (response.errors) {
                            $scope.adroll_error = response.errors[0].message
                        } else
                            $scope.gotoAccountEdit();
                    });
                }
            }

            // Binding Account Setup Handler : network_index is 0-index
            function showAccountSetup(network_index, items) {

                $scope.showAccount = true;
                $scope.accountStep = 'accountSetup';
                $scope.accountLogo = $scope.providers[network_index].logo;

                integrationsService.addConnectionInfoRecords(network_index, items);

                $scope.dataRecords = items;
                selectedNetIndex = network_index;
                $scope.dlgTitle = $scope.providers[network_index].name + " Setup";
                $scope.$apply(); // very very important
            }


            // Select Account & Binding Handler
            $scope.saveAccount = function() {
                if ($("input:radio[name=selected_integration]:checked").length == 0) return;
                tmp_value = $("input:radio[name=selected_integration]:checked").val();
                tmp_viewID = $("input:radio[name=selected_integration]:checked").attr("viewID");



                if (tmp_value == '')
                    index = 0
                else
                    index = $scope.dataRecords.findIndex(x => x.websiteUrl == tmp_value);

                console.log(integrationsService.integrations)


                tmp_obj = integrationsService.integrations[selectedNetIndex].connectionInfoRecords[index];
                tmp_obj.networkID = selectedNetIndex + 1;

                tmp_obj.viewID = "";
                if (tmp_obj.accountId) tmp_obj.id = tmp_obj.accountId;
                if (tmp_obj.websiteUrl) tmp_obj.account = tmp_obj.websiteUrl;
                if (tmp_obj.webPropertyId) tmp_obj.viewID = tmp_obj.webPropertyId;
                if (tmp_viewID) {
                    tmp_obj.webPropertyId = tmp_viewID;
                    tmp_obj.viewID = tmp_obj.webPropertyId;
                }


                dashboardService.dashboard.integrations.push(tmp_obj);



                integrationsService.addActiveRecordIdx(selectedNetIndex, index);
                $scope.showAccount = false;
                $scope.step = 'integrations';
                $http.post('/user/bindNetwork', {
                        id: selectedNetIndex,
                        dashboard: dashboardService.dashboard.id,
                        account: integrationsService.integrations[selectedNetIndex].connectionInfoRecords[index].websiteUrl,
                        viewID: tmp_obj.viewID
                    }) // TODO
                    .then(function(response) {
                        dashboardService.getWidgetDataFromNetwork();
                    });

            }

            // Set Pre-Binding Account Information Handler
            $scope.setAccount = function(network_index, account_info) {

                $scope.accountLogo = $scope.providers[network_index].logo;
                $scope.infoRecord = account_info;
                selectedNetIndex = network_index;
                $scope.dlgTitle = $scope.providers[network_index].name;
                $scope.showAccount = true;
                $scope.accountStep = 'accountEdit';
            }

            $scope.gotoAccountEdit = function() {
                // $http.post("/user/getPreNetworks", {id: selectedNetIndex, campID: dashboardService.dashboard.id}).then(function(response) {
                $http.post("/user/getPreNetworks", { id: selectedNetIndex, campID: $scope.campaign.id }).then(function(response) {
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

            // Remove Pre-Binding Account Handler
            $scope.deleteAccount = function() {

                integrationsService.removeConnectionInfoRecords(selectedNetIndex);
                var idx = dashboardService.dashboard.integrations.findIndex(x => x.networkID == selectedNetIndex + 1);
                let idToDelete = dashboardService.dashboard.integrations[idx].id;
                dashboardService.dashboard.integrations.splice(idx, 1);
                $scope.showAccount = false;
                $http.post('/user/unbindNetwork', { id: selectedNetIndex, dashboard: dashboardService.dashboard.id }) // TODO
                    .then(function(response) {
                        dashboardService.getWidgetDataFromNetwork();
                    });
                $scope.step = 'integrations';

                $http.post('/user/deleteNetwork', {id: idToDelete}) // TODO
                .then(function(response) {
                    $scope.$parent.$broadcast('refreshIntegration', {popup: 'delete'});
                    $scope.closePopup();
                });
            }

            $scope.setAdrollPassword = function(value) {
                $scope.adroll_password = value
            }

            $scope.setAdrollUsername = function(value) {
                $scope.adroll_username = value
            }

            // Return to Integrations from Account Setup Page
            $scope.gobacktoIntegrations = function() {

                $scope.showAccount = false;
                $scope.accountStep = '';
                $scope.step = 'integrations';
            }

            // Initialize Module
            function initData(campaign = {}) {
                $scope.step = 'integrations';
                $scope.campaign = dashboardService.dashboard;

                $scope.showAccount = false;
                $scope.dataRecords = [];
                $scope.networkIndex = 0;
                $scope.accountStep = '';
                $scope.accountLogo = '';
                $scope.adroll_username = '';
                $scope.adroll_password = '';
                $scope.dlgTitle = "";
                $scope.infoRecord = {};

                selectedNetIndex = null;

                $scope.DASHID2 = campaign.id ? campaign.id : dashboardService.dashboard.id
                if (typeof $scope.DASHID2 != "undefined") {
                    $scope.service_url = [""];
                    $scope.service_url[11] = '/user/saveadroll';
                    $http.post("/user/addNetwork", { id: 1, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[1] = response.data;
                    });
                    $http.post("/user/addNetwork", { id: 2, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[2] = response.data;
                    });
                    $http.post("/user/addNetwork", { id: 3, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[3] = response.data;
                    });
                    $http.post("/user/addNetwork", { id: 4, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[4] = response.data;
                    });
                    $http.post("/user/addNetwork", { id: 5, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[5] = response.data;
                    });
                    $http.post("/user/addNetwork", { id: 6, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[6] = response.data;
                    });
                    $http.post("/user/addNetwork", { id: 7, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[7] = response.data;
                    });
                    $http.post("/user/addNetwork", { id: 8, campID: $scope.DASHID2 }).then(function(response) {
                        $scope.service_url[8] = response.data;
                    });
                } else {

                }
            }


        },
        templateUrl: '/app/modules/integrations/integrations.html'
    }
});