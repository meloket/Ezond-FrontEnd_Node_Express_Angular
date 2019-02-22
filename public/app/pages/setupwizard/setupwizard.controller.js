/**
 * First login/setup wizard page controller
 */
ezondapp.controller('setupWizardController', function ($scope, setupWizardService, userService) {

    'use strict';

    $scope.enabledSteps = {
        email: true,
        details: false,
        createCampaign: false
    };
    
    $scope.user = userService.user;      


    if ( $scope.user.activated ) {
         
        $scope.enabledSteps.details = true;
    }

    // Retry Confirm Email Handler
    $scope.retryconfirmemail = function() {

        $scope.enabledSteps.details = false;
    }

    // Resends Confirmation Email Handler
    $scope.resendConfirmEmail = function() {

        userService.resendConfirmEmail({email: $scope.user.email}).$promise
        .then(function(response) {
            if (response.status) {
                $scope.emailSuccess = true;
            }
            setTimeout(function() {
                $scope.emailSuccess = false;
            }, 3000);
        });
    }

    // Check User Name Entered Handler
    $scope.enterDetails = function() {

        if ( !$scope.enabledSteps.details ) return;
        
        $scope.substep = 'namedetails';
    }

    // Save User Detail Informations Handler
    $scope.saveUserDetails = function() {

        if ( !$scope.enabledSteps.details ) return;

        var personal = {            
            phone: $scope.user.phone,
            clientsnum: $scope.user.clientsnum,
            subscribe: $scope.user.subscribe,
            first_name: $scope.user.first_name,
            last_name: $scope.user.last_name
        };

        userService.update({personal: personal}).$promise
        .then(function(response) {
            if ( response.status ) {
                $scope.enabledSteps.createCampaign = true;
            }
        });
    }

    // Show Create Campaign Window Handler
    $scope.createCampaign = function() {

        if ( !$scope.enabledSteps.createCampaign ) return;

        $scope.$emit('showPopup', {popup: 'createCampaign'});
    }
});