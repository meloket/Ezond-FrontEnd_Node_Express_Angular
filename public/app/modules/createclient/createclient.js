/**
 * Create Client directive
 */
ezondapp.directive('createClient', function(ratinggroupProviders, $http, userService, $state, appDataService) {
    
    return {
        restrict: 'E',
        replace: true,
        scope: {

        },
        link: function($scope, element, atts) {

            $scope.showPopup = $scope.$parent.showPopup;
            $scope.menu_providers = ratinggroupProviders.menu_providers;
            $scope.providers = [];

            if (typeof userService.user.providers_allowed != 'undefined'){
                providers_allowed = userService.user.providers_allowed;
                for(i=0; i<$scope.menu_providers.length; i++){
                    if(providers_allowed.indexOf($scope.menu_providers[i].id) != -1)
                            $scope.providers.push($scope.menu_providers[i]);
                }
            } else {
                $scope.providers = $scope.menu_providers;
            }

            $scope.searchCampaignName = {};
            $scope.searchCampaignName.company_name = '';
            $scope.searchCampaignName2 = {};
            $scope.searchCampaignName2.company_name = '';


            $scope.user = userService.user;

            var providersIds = [];

            $scope.providers.forEach(function(provider){
                providersIds.push(provider.id);
            });

            initWidgetData(providersIds);

            $scope.closePopup = function() {

                $scope.$emit('hidePopup', {popup: 'createClient'});
            }

            // Check Validation Handler of Entered Data in Contact Step
            $scope.chkDataValid = function() {

                // TODO:
                // Verify user email does not exist in "users" or "agency_users" tables.
                // Check pass min length

                $('.field-error').remove();

                if (typeof $scope.client.first_name == 'undefined')          { showError($("#client-firstname")); return false; }
                if (typeof $scope.client.last_name == 'undefined')          { showError($("#client-lastname")); return false; }
                if (typeof $scope.client.email == 'undefined')             { showError($("#client-email")); return false; }
                if (!isValidEmail($scope.client.email))             { showError($("#client-email"), 'Email Not Valid'); return false; }
                if (typeof $scope.client.password == 'undefined')          { showError($("#client-password")); return false; }

                $scope.allEntered = true;

                // for(i=0; i<integrationsService.integrations.length; i++) integrationsService.removeConnectionInfoRecords(i);

                $scope.step = 'campaigns';
                return true;
            }

            function showError(faultyBox, errorMsg) {

                if (typeof errorMsg == 'undefined')
                    errorMsg = 'Required';

                faultyBox.closest('.field').append('<div class="field-error show">' + errorMsg + '</div>');
            }

            // Change Step Handler
            $scope.changeStep = function(stepname) {

                // if(!$scope.allEntered) return false;
                $scope.step = stepname;
            }

            $scope.setCampaignAccessSelector = function(mode) {

                if (mode == 'hidden') {
                    $('.create-client-module #campaign_access_holder').addClass('hidden');
                    $scope.client.campaign_access = 'all';
                } else {
                    $('.create-client-module #campaign_access_holder').removeClass('hidden');
                    $scope.client.campaign_access = 'restricted';
                }
            }
            $scope.sw = 'page1'

            $scope.changePage = function(page) {
                $scope.sw = page
            }

            $scope.addClient = function() {

                var client = angular.copy($scope.client);

                client.userID = $scope.user.id;
                client.role = 'client';

                userService.addUsers(client).$promise
                .then(function(response) {

                    if (response.status) {
                        client.id = response.insertId;
                        appDataService.addChildUserToDashboard(client);
                        $scope.$emit('hidePopup', {popup: 'createClient'});

                        initWidgetData(providersIds);
                    }
                });
            }

            $scope.isDashboardAccessible = function(dashboardId){

                var dashIndex = $scope.client.campaigns_allowed.indexOf(dashboardId);

                if ($scope.client.campaign_access == 'all' || dashIndex !== -1) {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.toggleDashboardAccess = function(dashboardId) {

                var dashIndex = $scope.client.campaigns_allowed.indexOf(dashboardId);

                if (dashIndex === -1) {
                    $scope.client.campaigns_allowed.push(dashboardId);
                } else {
                    $scope.client.campaigns_allowed.splice(dashIndex, 1);
                }

            }

            $scope.toggleProvider = function($event, providerId) {

                var providerIndex = $scope.client.providers_allowed.indexOf(providerId);

                if (providerIndex === -1) {
                    $scope.client.providers_allowed.push(providerId);
                    $($event.currentTarget).addClass('on');
                } else {
                    $scope.client.providers_allowed.splice(providerIndex, 1); 
                    $($event.currentTarget).removeClass('on');
                }

            }

            function initWidgetData(providers) {

                $scope.step = 'contact';
                $scope.client = {
                        campaign_access:'all',
                        campaigns_allowed: [],
                        providers_allowed: providers
                    };
            }
        },
        templateUrl: '/app/modules/createclient/createclient.html'
    }
});