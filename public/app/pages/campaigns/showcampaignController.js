/**
 * Campaigns controller
 */
ezondapp.controller('showcampaignController', function ($document, $scope, $state, appDataService, $timeout, userService) {
    if (appDataService.appData.openTaskmanagement != "") {
        $state.go('app.controlpanel.campaigns')
    }
});