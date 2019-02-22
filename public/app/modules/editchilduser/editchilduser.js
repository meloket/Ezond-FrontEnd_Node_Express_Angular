/**
 * Create Staff directive
 */
ezondapp.directive('editChildUser', function(ratinggroupProviders, $http, userService, $state, appDataService) {
    
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

            $scope.user = userService.user;

            var providersIds = [];

            $scope.providers.forEach(function(provider){
                providersIds.push(provider.id);
            });

            initWidgetData(providersIds);

            $scope.closePopup = function() {

                $scope.$emit('hidePopup', {popup: 'editChildUser'});
            }

            $scope.$on('editChildUser1', function(e, targetUser) {
                $scope.edituser = targetUser;
            });

            // Check Validation Handler of Entered Data in Contact Step
            $scope.chkDataValid = function() {

                // TODO:
                // Verify user email does not exist in "users" or "agency_users" tables.
                // Check pass min length

                $('.field-error').remove();

                if (typeof $scope.edituser.first_name == 'undefined')          { showError($("#edituser-firstname")); return false; }
                if (typeof $scope.edituser.last_name == 'undefined')          { showError($("#edituser-lastname")); return false; }
                if (typeof $scope.edituser.email == 'undefined')             { showError($("#edituser-email")); return false; }
                if (!isValidEmail($scope.edituser.email))             { showError($("#edituser-email"), 'Email Not Valid'); return false; }

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
                    $('.edit-user-module #campaign_access_holder').addClass('hidden');
                    $scope.edituser.campaign_access = 'all';
                } else {
                    $('.edit-user-module #campaign_access_holder').removeClass('hidden');
                    $scope.edituser.campaign_access = 'restricted';
                }
            }

            $scope.saveChanges = function() {            
                console.log($scope.edituser)
                userService.editChildUser($scope.edituser).$promise
                .then(function(response) {
                    appDataService.deleteChildUserInDashboard($scope.edituser.id);                  
                    appDataService.addChildUserToDashboard($scope.edituser);                  
                    $scope.$emit('hidePopup', {popup: 'editChildUser'});
                    
                });
            }

            $scope.isDashboardAccessible = function(dashboardId){

                if ($scope.edituser.campaigns_allowed)
                    var dashIndex = $scope.edituser.campaigns_allowed.indexOf(dashboardId);
                else 
                    return false

                if ($scope.edituser.campaign_access == 'all' || dashIndex !== -1) {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.isProviderAccessible = function(providerId){

                if ($scope.edituser.providers_allowed.indexOf(providerId) > -1) {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.toggleDashboardAccess = function(dashboardId) {

                var dashIndex = $scope.edituser.campaigns_allowed.indexOf(dashboardId);

                if (dashIndex === -1) {
                    $scope.edituser.campaigns_allowed.push(dashboardId);
                } else {
                    $scope.edituser.campaigns_allowed.splice(dashIndex, 1); 
                }

            }

            $scope.toggleProvider = function($event, providerId) {

                var providerIndex = $scope.edituser.providers_allowed.indexOf(providerId);

                if (providerIndex === -1) {
                    $scope.edituser.providers_allowed.push(providerId);
                    $($event.currentTarget).addClass('on');
                } else {
                    $scope.edituser.providers_allowed.splice(providerIndex, 1); 
                    $($event.currentTarget).removeClass('on');
                }

            }

            function initWidgetData(providers) {

                $scope.step = 'contact';
                $scope.edituser = {
                        campaign_access:'all',
                        campaigns_allowed: [],
                        providers_allowed: providers
                    };
            }
        },
        templateUrl: '/app/modules/editchilduser/editchilduser.html'
    }
});

