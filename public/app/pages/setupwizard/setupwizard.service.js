/**
 * Setup Wizard Service
 */
ezondapp.service('setupWizardService', function($http, userService) {

    'use strict';

    // Resend Confirmation Email Handler
    this.resendConfirmEmail = function(email) {

        return userService.resend
    }

    // Save User Detail Handler
    this.saveUserDetails = function(details) {

        var personal = {

            clientsnum: details.clientsnum,
            phone: details.phone,
            subscribe: details.subscribe
        };

        return userService.update({personal:personal});
    }
});