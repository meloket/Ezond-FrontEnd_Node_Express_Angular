/**
 * Create integrations directive
 */
ezondapp.directive('integration', function($http, userService, integrationService, dashboardService, $state) {

    return {
        restrict: 'E',
        replace: true,
        scope: {

        },
        link: function($scope, element, atts) {

            $scope.showPopup = $scope.$parent.showPopup;
            
            //$scope.providers = integrationService.integrations;
            $scope.providers = [];
            if (typeof userService.user.providers_allowed != 'undefined'){
                for(i=0; i<integrationService.integrations.length; i++){
                    if(userService.user.providers_allowed.indexOf(integrationService.integrations[i].id) != -1){
                        $scope.providers.push(integrationService.integrations[i]);
                    }
                }
            } else {
                $scope.providers = integrationService.integrations;
            }

            
            $scope.user = userService.user;
            $scope.connectionInfo = dashboardService.dashboard.integrations;

            initData();
           
            var Handler = (function(){
                var i = 1,
                listeners = {};

                return {
                    addListener: function(element, event, handler, capture) {
                        element.addEventListener(event, handler, capture);
                        listeners[i] = {element: element, 
                                         event: event, 
                                         handler: handler, 
                                         capture: capture};
                        return i++;
                    },
                    removeListener: function(id) {
                        if(id in listeners) {
                            var h = listeners[id];
                            h.element.removeEventListener(h.event, h.handler, h.capture);
                            delete listeners[id];
                        }
                    },
                    removeAllListener: function() {
                        for(id in listeners) {
                            var h = listeners[id];
                            h.element.removeEventListener(h.event, h.handler, h.capture);
                            delete listeners[id];
                        }
                    }
                };
            }());


            $scope.$on('showIntegration', function(e, details) {
                initData();
                $scope.accountStep = details.popup;
                selectedNetIndex = details.networkIndex - 1;
                
                if($scope.accountStep == 'accountSetup'){
                    $scope.accountLogo = $scope.providers[selectedNetIndex].logo;
                    $scope.dlgTitle = $scope.providers[selectedNetIndex].name + " Setup";
                    $scope.gotoAccountEdit();
                }
            });

            // Close Integrations Window Handler
            $scope.closePopup = function(details) {

                $scope.$emit('hidePopup', {popup: 'integration'});
                initData();
            }

            // Close Accounts Information Window
            $scope.closePopup3 = function(details) {

                $scope.accountStep = 'accountSetup';
            }

            // New Account Binding Click Handler : selectedNetIndex is 0-index
            $scope.selectNewAccount = function() {
                if($scope.providers[selectedNetIndex].description != ""){
                    $scope.accountStep = "preAccountSetup";
                } else {
                   $scope.connectProvider($scope.providers[selectedNetIndex]);
                }
            } 

            // Account Binding Handler
            $scope.connectProvider = function(service) {
                console.log("Tag mark 2:")
                if(service.description != ""){
                    console.log("API_KEY connectProvider");
                    network_index = service.id - 1;
                    $scope.accountLogo = $scope.providers[network_index].logo;
                    $scope.dlgDescription = $scope.providers[network_index].description;
                    selectedNetIndex = network_index;
                    $scope.dlgTitle = $scope.providers[network_index].name;
                    $scope.gotoAccountEdit();
                } else {
                    network_index = service.id - 1;
                    $scope.accountLogo = $scope.providers[network_index].logo;
                    $scope.dlgDescription = $scope.providers[network_index].description;
                    selectedNetIndex = network_index;
                    $scope.dlgTitle = $scope.providers[network_index].name;

                    authWindow = window.open($scope.service_url[service.id], "Ezond Authorize Network","width=500,height=500,top=300,left=500");
                    Handler.removeAllListener();
                    handler = Handler.addListener(window, "message", function(event) {
                        var data = JSON.parse(event.data);    
                        if(data.error == "0") {                        
                            $scope.gotoAccountEdit();
                            console.log('this shows me')
                        } else {

                        }
                        authWindow.close();
                    });
                }
            }

            // Get Network Account Informations from api_key Handler
            $scope.getAccountInfos = function() {
                if($scope.api_key){
                    $http.post("/user/addNetworkAccount", {
                        id: selectedNetIndex + 1, 
                        campID:dashboardService.dashboard.id, 
                        api_key: $scope.api_key}
                    ).then(function(response) {
                        console.log(JSON.stringify(response.data));
                        $scope.gotoAccountEdit();
                    });
                }
            }

            // Binding Account Setup Handler : network_index is 0-index
            function showAccountSetup(network_index, items) {
                
                $scope.accountStep = 'accountSetup';
                $scope.accountLogo = $scope.providers[network_index].logo;

                integrationService.addConnectionInfoRecords(network_index, items);

                $scope.dataRecords = items;
                selectedNetIndex = network_index;
                $scope.dlgTitle = $scope.providers[network_index].name + " Setup";
                $scope.$apply(); // very very important
            }

            
            // Select Account & Binding Handler
            $scope.saveAccount = function() {
                if($("input:radio[name=selected_integration]:checked").length == 0) return;
                tmp_value = $("input:radio[name=selected_integration]:checked").val();
                tmp_viewID = $("input:radio[name=selected_integration]:checked").attr("viewID");

                index = $scope.dataRecords.findIndex(x=>x.websiteUrl==tmp_value);

                tmp_obj = integrationService.integrations[selectedNetIndex].connectionInfoRecords[index];
                tmp_obj.networkID = selectedNetIndex + 1;

                tmp_obj.viewID = "";
                if(tmp_obj.accountId) tmp_obj.id = tmp_obj.accountId;
                if(tmp_obj.websiteUrl) tmp_obj.account = tmp_obj.websiteUrl;
                if(tmp_obj.webPropertyId) tmp_obj.viewID = tmp_obj.webPropertyId;
                if(tmp_viewID){
                    tmp_obj.webPropertyId = tmp_viewID;
                    tmp_obj.viewID = tmp_obj.webPropertyId;
                }

                dashboardService.dashboard.integrations.push(tmp_obj);

                integrationService.addActiveRecordIdx(selectedNetIndex, index);
                $http.post('/user/bindNetwork', {id: selectedNetIndex, dashboard: dashboardService.dashboard.id, account: integrationService.integrations[selectedNetIndex].connectionInfoRecords[index].websiteUrl,
                    viewID: tmp_obj.viewID}) // TODO
                .then(function(response) {
                    $scope.$parent.$broadcast('refreshIntegration', {popup: 'mmm'});
                    $scope.closePopup();
                });             
            }         

            $scope.gotoAccountEdit = function(){
                $http.post("/user/getPreNetworks", {id: selectedNetIndex, campID: dashboardService.dashboard.id}).then(function(response) {
                    items = response.data;
                    for(i=0; i<items.length; i++){
                        if(items[i].id) items[i].accountId = items[i].id;
                        if(items[i].account) items[i].websiteUrl = items[i].account;
                        if(items[i].viewID) items[i].webPropertyId = items[i].viewID;
                    }
                    $scope.accountStep = 'accountSetup';
                    $scope.accountLogo = $scope.providers[selectedNetIndex].logo;

                    integrationService.addConnectionInfoRecords(selectedNetIndex, items);

                    $scope.dataRecords = items;
                    $scope.dlgTitle = $scope.providers[selectedNetIndex].name + " Setup";
                });
            }

            // Remove Pre-Binding Account Handler
            $scope.deleteAccount = function() {

                integrationService.removeConnectionInfoRecords(selectedNetIndex);
                var idx = dashboardService.dashboard.integrations.findIndex(x=>x.networkID==selectedNetIndex+1);
                let idToDelete = dashboardService.dashboard.integrations[idx].id;
                dashboardService.dashboard.integrations.splice(idx,1);
                $http.post('/user/unbindNetwork', {id: selectedNetIndex, dashboard: dashboardService.dashboard.id}) // TODO
                .then(function(response) {
                    $scope.$parent.$broadcast('refreshIntegration', {popup: 'delete'});
                    $scope.closePopup();
                });

                $http.post('/user/deleteNetwork', {id: idToDelete}) // TODO
                .then(function(response) {
                    $scope.$parent.$broadcast('refreshIntegration', {popup: 'delete'});
                    $scope.closePopup();
                });
            }

            // Initialize Module
            function initData() {
                $scope.dataRecords = [];
                $scope.accountStep = '';
                $scope.accountLogo = '';
                $scope.dlgTitle = "";
                $scope.infoRecord = {};                

                selectedNetIndex = null;
                if(typeof dashboardService.dashboard.id != "undefined"){
                    $scope.service_url = [""];
                    $http.post("/user/addNetwork", {id: 1, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[1] = response.data;
                    });
                    $http.post("/user/addNetwork", {id: 2, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[2] = response.data;
                    });
                    $http.post("/user/addNetwork", {id: 3, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[3] = response.data;
                    });
                    $http.post("/user/addNetwork", {id: 4, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[4] = response.data;
                    });
                    $http.post("/user/addNetwork", {id: 5, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[5] = response.data;
                    });
                    $http.post("/user/addNetwork", {id: 6, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[6] = response.data;
                    });
                    $http.post("/user/addNetwork", {id: 7, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[7] = response.data;
                    });
                    $http.post("/user/addNetwork", {id: 8, campID: dashboardService.dashboard.id}).then(function(response) {
                        $scope.service_url[8] = response.data;
                    });
                }
            }

        },
        templateUrl: '/app/modules/integration/integration.html'
    }
});