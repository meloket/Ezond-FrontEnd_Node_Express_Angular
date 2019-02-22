/**
 * Sidebar controller
 */
ezondapp.controller('sidebarController', function($scope, jQuery, $timeout, dashboardService, $state, userService, appDataService, $rootScope, $mdDialog) {

    $scope.isClient = userService.isOwner();
    $scope.planSb = userService.planSubscribed;
    // $scope.selectedMenu = 

    $scope.selectedMenu = ( $scope.planSb == 'free-forever' || ( $scope.planSb == 'trial' && appDataService.appData.subscription_expired ) ) ? 4 : 1;
    $scope.allowAll = !($scope.planSb == 'free-forever' || ( $scope.planSb == 'trial' && appDataService.appData.subscription_expired ))
    $scope.selectedSubMenu = 0;

    $scope.gotoHome = function () {
        $state.go('app.dashboard.client_home', {id: 1000, kind: 123});
    }

    $scope.$on('onDashboard', function(e) {
        $scope.selectedMenu = 1;
    });

    $scope.$on('onDedicatedPage', function(e, details) {
        if (details.networkType == 1) {
            $scope.selectedMenu = 4;
            $scope.selectedSubMenu = 1;
            $scope.gotoRatings(1);
        } else if (details.networkType == 2) {
            $scope.selectedMenu = 5;
            $scope.selectedSubMenu = 6;
            $scope.gotoAdwordRatings(6);
        } else if (details.networkType == 3) {
            $scope.selectedMenu = 3;
            $scope.selectedSubMenu = 10;
            $scope.gotoConsoleRatings(10);
        } else if (details.networkType == 5) {
            $scope.selectedMenu = 6;
            $scope.selectedSubMenu = 9;
            $scope.gotoYoutubeRatings(9);
        } else if (details.networkType == 7) {
            $scope.selectedMenu = 5;
            $scope.selectedSubMenu = 7;
            $scope.gotoFacebookAdsRatings(7);
        } else if (details.networkType == 8) {
            $scope.selectedMenu = 6;
            $scope.selectedSubMenu = 8;
            $scope.gotoFacebookRatings(8);
        } else if (details.networkType == 9) {
            $scope.selectedMenu = 7;
            $scope.selectedSubMenu = 11;
            $scope.gotoCallRailRatings(11);
        } else if (details.networkType == 11) {
            $scope.selectedMenu = 5;
            $scope.selectedSubMenu = 13;
            $scope.gotoAdrollRatings(13);
        }
        appDataService.currentState = "inDedicatedView";
        $rootScope.$broadcast('refreshState', {});
    });

    $scope.selectMenu = function(_menuVal) {
        $scope.selectedMenu = _menuVal;
        if (_menuVal == 1) {
            appDataService.currentState = "inWidgetsView";
            $rootScope.$broadcast('refreshState', {});
        } else if (_menuVal == 2) {
            appDataService.currentState = "inDedicatedView";
            $rootScope.$broadcast('refreshState', {});
        } else if (_menuVal == 9) {
            console.log("Hello google data studio")
        }
        $scope.selectedSubMenu = 0;
    }

    $scope.selectSubMenu = function(_menuVal) {
        $scope.selectedSubMenu = _menuVal;
        appDataService.currentState = "inDedicatedView";
        $rootScope.$broadcast('refreshState', {});
    }

    $scope.gotoDashboard = function() {
        $state.go('app.dashboard.home', { id: dashboardService.dashboard.id });
    }
    $scope.gotoDatastudio = function() {
        $state.go('app.dashboard.data_studio', { id: dashboardService.dashboard.id });
    }

    $scope.gotoIntelPage = function() {
        $state.go('app.dashboard.intel', { id: dashboardService.dashboard.id });
    }

    $scope.gotoRatings = function(kind) {
        $state.go('app.dashboard.seo_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoAnalyticsRatings = function(kind) {
        $state.go('app.dashboard.analytics_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoAdwordRatings = function(kind) {
        $state.go('app.dashboard.adword_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoFacebookAdsRatings = function(kind) {
        $state.go('app.dashboard.fbads_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoFacebookRatings = function(kind) {
        $state.go('app.dashboard.fb_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoYoutubeRatings = function(kind) {
        $state.go('app.dashboard.youtube_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.addWidget = function() {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {

            }],
            // parent: angular.element('#material-modals'),
            disableParentScroll: true,
            clickOutsideToClose: true,
            autoWrap: false,
            // templateUrl: '/app/modules/createcampaign/createcampaign1.html',
            template: '<add-widget></add-widget>'
        })
    }

    $scope.gotoConsoleRatings = function(kind) {
        $state.go('app.dashboard.console_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoRankRatings = function(kind) {
        $state.go('app.dashboard.rank_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoAdrollRatings = function (kind) {
        $state.go('app.dashboard.adroll_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoCallRailRatings = function(kind) {
        $state.go('app.dashboard.callrail_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.gotoMailChimpRatings = function(kind) {
        $state.go('app.dashboard.mailchimp_ratings', { kind: kind, id: dashboardService.dashboard.id });
    }

    $scope.isProviderVisible = function(providerId) {

        if (typeof userService.user.providers_allowed == 'undefined')
            return true;

        if (providerId.constructor === Array) {

            var allClear = false;

            for (var i = 0; i < providerId.length; i++) {

                if ($scope.isProviderVisible(providerId[i])) {
                    allClear = true;
                    break;
                }

            }

            return allClear;

        } else if (userService.user.providers_allowed.indexOf(providerId) === -1) {
            return false;
        } else {
            return true;
        }

    }


});