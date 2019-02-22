/**
 * Edit Campaign Service
 */
ezondapp.service('editCampaignService', function($http, $q, appDataService) {

    // Update Campaign Information Handler
    this.updateCampaign = function(campaign) {

        return $http.post('/user/updateDashboard', campaign)
        .then(function(response) {

            var defer = $q.defer();
            appDataService.updateCampaignInControllPanel(response.data);
            defer.resolve();
            
            return defer;
        });
    }    
});