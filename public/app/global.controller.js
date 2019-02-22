/**
 * Global controller for whole app
 * Handles popups
 */
ezondapp.controller('globalController', function($document, $scope, $timeout,$cookies, $state, $location, userService, subscriptionPlansProviders, appDataService, integrationService, $localStorage, $sessionStorage) {

    'use strict';
     $scope.showPopup = {}; // Popups that shown

    // if (appDataService.appData.subscription_expired){
        // $state.go('app.logoutpanel.pleasesubscribe');
    // }

    if (appDataService.appData && appDataService.appData.subscription_expired)
        angular.element("#ezondapp").addClass('expireReminder')

    $scope.targetWidget = {network: 1, metric1:"", metric2:""}; //widget to be edited     

    // Show popup
    $scope.$on('showPopup', function(e, details) {
        if ( details && details.popup ) {

            var bodyRef = angular.element( $document[0].body );
            bodyRef.addClass('ovh')

            // if (details.popup != 'taskManagement')
                displayAppPopups();

            $scope.showPopup[details.popup] = true;
            if(details.popup == 'integrations') {
                $scope.$broadcast('showIntegrations', {popup: 'mmm', campaign: details.campaign});
            }
            if(details.popup == 'integration') {
                $scope.$broadcast('showIntegration', {popup: integrationService.accountStep, networkIndex: details.networkIndex});
            }

        }
    });

    $scope.$on('addTaskFromControlpanel', function (e, details) {
        $scope.$broadcast('addTaskFromControlpanel1', {newTask: details.newTask})
    })

    var popupsHidden = true;

    function displayAppPopups() {
        if(!popupsHidden) return;
        popupsHidden=!popupsHidden
        window.$('.app-popups>div').css('visibility', 'visible')
    }

    $scope.mainOvh = function() {
        var bodyRef = angular.element( $document[0].body );
        bodyRef.addClass('ovh')
    }

    // Hides popup
    $scope.$on('hidePopup', function(e, details) {

        if ( details && details.popup ) {
            var bodyRef = angular.element( $document[0].body );
            bodyRef.removeClass('ovh')

            $scope.showPopup[details.popup] = false;
        }
    }); 

    // Edit widget    
    $scope.$on('editWidget', function(e, details) {
        if ( details && details.popup ) {
            displayAppPopups()

            $scope.showPopup[details.popup] = true;
            $scope.targetWidget = details.targetWidget;
            $scope.$broadcast('editWidget1', details.targetWidget);
        }
    });


    $scope.$on('fromHeadToControlpanelSubscription', function(e) {
        $timeout(function () {
            $scope.$broadcast('emitedAlirt', {})
        }, 600)
    });



    // Edit campaign    
    $scope.$on('editCampaign', function(e, details) {
        if ( details && details.popup ) {
            displayAppPopups()
            $scope.showPopup[details.popup] = true;
            $scope.targetWidget = details.targetWidget;
            $scope.$broadcast('editCampaign1', details.targetWidget);
        }
    });

    // Remove campaign    
    $scope.$on('removeCampaign', function(e, details) {
        if ( details && details.popup ) {
            displayAppPopups()

            // $scope.showPopup[details.popup] = true;
            // $scope.targetWidget = details.targetWidget;

            $scope.$broadcast('removeCampaign1', details.targetWidget);
        }
    });

    // Task Management    
    $scope.$on('taskManagement', function(e, details) {
        if ( details && details.popup ) {
            displayAppPopups()

            var bodyRef = angular.element($document[0].body);
            bodyRef.addClass('ovh')

            $timeout(function () {
                bodyRef = angular.element('.md-menu-backdrop.md-click-catcher')

                bodyRef.click(function (elem) {
                    $scope.removeOvh()
                })
            }, 50)

            $scope.showPopup[details.popup] = true;
            $scope.targetWidget = details.targetWidget;

            $scope.$broadcast('taskManagement1', details.targetWidget);
        }
    });

    // Remove child user
    $scope.$on('removeChildUser', function(e, details) {

        if ( details && details.popup ) {
            displayAppPopups()

            $scope.showPopup[details.popup] = true;
            $scope.$broadcast('removeChildUser1', details.targetUser);
        }
    });

    // Edit child user    
    $scope.$on('editChildUser', function(e, details) {

        if ( details && details.popup ) {
            displayAppPopups()

            $scope.showPopup[details.popup] = true;
            $scope.$broadcast('editChildUser1', details.targetUser);
        }
    });

    // Add dashboard (refresh control panel)
    $scope.$on('addcampaign', function(e, details) {

        appDataService.addCampaign(details.campaign);
    });
    // User is logged in?
    if ( !appDataService.appData.user ) {
        $state.go('login'); //<!-- temporary_comment--> original
    }
    else {
        if(typeof $localStorage.location_path != "undefined"){
            if($localStorage.location_path.indexOf("users") == -1){
                if ( $location.path().indexOf('campaignmanagement') > -1 && $location.path() != $localStorage.location_path && $location.path() !=  "/app"){
                    $location.path($location.path());
                }
                else{
                    // $location.path($localStorage.location_path);
                }
                return;
            }
        }

        if ( !!userService.user.firstLogin ) {      //when first login
            $state.go('app.setup');
        } else if (typeof userService.user.role != 'undefined' && userService.user.role == 'client') { // Force clients out of control panel
            // TODO: Check if appDataService.appData.user.dashboards[0] is undefined
            // $state.go('app.dashboard.home', {id: appDataService.appData.user.dashboards[0].id});
        } else {

            // $state.go('app.controlpanel.campaigns', {id: appDataService.appData.user.dashboards[0] ? appDataService.appData.user.dashboards[0].id : 33});
        }
    }


});
