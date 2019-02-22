/**
 * Users controller
 */
ezondapp.controller('logoutpanelController', function($scope,$state,$rootScope, $localStorage, $http, $window, userService, subscriptionPlansProviders, appDataService) {

    $scope.plans = subscriptionPlansProviders.plans
    $scope.planTermEnd = '';
    $scope.plans = subscriptionPlansProviders.plans
    $scope.classForLoadingPlans = false
    $scope.currentPlan = userService.planSubscribed

    $scope.gHome = function() {
        $state.go("app.dashboard.home")
    }

    
    $scope.logout = function() {
        // $(".show-pop-user-panel").webuiPopover('hideAll');
        userService.logout().$promise
        .then(function() {
            if(typeof $localStorage.user != "undefined")
                    delete $localStorage.user;
            if(typeof $localStorage.location_path != "undefined")
                    delete $localStorage.location_path;
            $state.go('login');
            setTimeout(function(){
                $rootScope.$broadcast('force_user_logout', {});
            }, 1000);
        });
    }

});