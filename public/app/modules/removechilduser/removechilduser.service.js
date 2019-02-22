/**
 * Remove Child User Service
 */
ezondapp.service('removeChildUsersService', function($http, $q, appDataService) {

	// Remove Child User Handler
    this.deleteCampaign = function(targetId) {

        return $http.post('/user/deleteChildUser', {id: targetId})
        .then(function(response) {

            var defer = $q.defer();
            appDataService.deleteWidgetInDashboard(response.data);
            defer.resolve();
            
            return defer;
        });
    }
    
});