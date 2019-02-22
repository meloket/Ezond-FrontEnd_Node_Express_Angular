/**
 * Remove Campaign Service
 */
ezondapp.service('removeCampaignService', function($http, $q, appDataService) {

	// Remove Campaign Handler
    this.deleteCampaign = function(targetId) {

        return $http.post('/user/deleteDashboard', {id: targetId})
        .then(function(response) {

            var defer = $q.defer();
            appDataService.deleteWidgetInDashboard(response.data);
            defer.resolve();
            
            return defer;
        });
    }
    
});