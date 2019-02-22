/**
 * Create Staff directive
 */
ezondapp.directive('createStaff', function(ratinggroupProviders, $http, userService, $state, appDataService) {
    
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

                $scope.$emit('hidePopup', {popup: 'createStaff'});
            }

            // Check Validation Handler of Entered Data in Contact Step
            $scope.chkDataValid = function() {

                // TODO:
                // Verify user email does not exist in "users" or "agency_users" tables.
                // Check pass min length

                $('.field-error').remove();

                if (typeof $scope.staff.first_name == 'undefined')          { showError($("#staff-firstname")); return false; }
                if (typeof $scope.staff.last_name == 'undefined')          { showError($("#staff-lastname")); return false; }
                if (typeof $scope.staff.email == 'undefined')             { showError($("#staff-email")); return false; }
                if (!isValidEmail($scope.staff.email))             { showError($("#staff-email"), 'Email Not Valid'); return false; }
                if (typeof $scope.staff.password == 'undefined')          { showError($("#staff-password")); return false; }

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
                    $('.create-staff-module #campaign_access_holder').addClass('hidden');
                    $scope.staff.campaign_access = 'all';
                } else {
                    $('.create-staff-module #campaign_access_holder').removeClass('hidden');
                    $scope.staff.campaign_access = 'restricted';
                }
            }

            $scope.sw = 'page1'

            $scope.changePage = function(page) {
                $scope.sw = page
            }

            $scope.filterByName = {}
            $scope.filterByName2 = {}

            $scope.showemailerror = false

            $scope.addStaff = function() {
                // console.log($scope.staff.email.search(/^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.{1}([A-Za-z]{2,20})$/))


                var staff = angular.copy($scope.staff);

                if (staff.first_name == "" || staff.last_name == "" || staff.password == "" ||  (staff.email && staff.email.search(/^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.{1}([A-Za-z]{2,20})$/) == -1)) {
                    $scope.showemailerror = true
                    $scope.errmessage = "Enter at least valid email."
                    return "bad";
                }

                staff.userID = $scope.user.id;
                staff.role = 'staff';

                userService.addUsers(staff).$promise
                .then(function(response) {

                    if (response.status) {
                        staff.id = response.insertId;
                        appDataService.addChildUserToDashboard(staff);
                        $scope.$emit('hidePopup', {popup: 'createStaff'});

                        initWidgetData(providersIds);
                    }
                    else{
                        $scope.errmessage = response.errmess
                    }
                });
            }
            $scope.errmessage = ''
            $scope.isDashboardAccessible = function(dashboardId){

                var dashIndex = $scope.staff.campaigns_allowed.indexOf(dashboardId);

                if ($scope.staff.campaign_access == 'all' || dashIndex !== -1) {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.toggleDashboardAccess = function(dashboardId) {

                var dashIndex = $scope.staff.campaigns_allowed.indexOf(dashboardId);

                if (dashIndex === -1) {
                    $scope.staff.campaigns_allowed.push(dashboardId);
                } else {
                    $scope.staff.campaigns_allowed.splice(dashIndex, 1);
                }

            }

            $scope.toggleProvider = function($event, providerId) {

                var providerIndex = $scope.staff.providers_allowed.indexOf(providerId);

                if (providerIndex === -1) {
                    $scope.staff.providers_allowed.push(providerId);
                    $($event.currentTarget).addClass('on');
                } else {
                    $scope.staff.providers_allowed.splice(providerIndex, 1); 
                    $($event.currentTarget).removeClass('on');
                }

            }

            function initWidgetData(providers) {

                $scope.step = 'contact';
                $scope.staff = {
                        campaign_access:'all',
                        campaigns_allowed: [],
                        providers_allowed: providers
                    };
            }
        },
        templateUrl: '/app/modules/createstaff/createstaff2.html'
    }
});

