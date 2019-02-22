/**
 * Widgets service
 */
ezondapp.service('widgetsService', function($http, $q, dashboardService) {

    var pics = {
        1: "/img/providers/google-analytics-small.jpg",
        2: "/img/providers/google-adwords-small.jpg"
    };

    // Add Widget Handler
    this.addWidget = function(newWidgetData) {

        return $http.post('/user/addWidget', newWidgetData)
        .then(function(response) {

            var defer = $q.defer();
            dashboardService.addWidgetToDashboard(response.data);
            defer.resolve();
            
            return defer;
        });
    }

    // Update Widget Handler
    this.updateWidget = function(updateData) {

        return $http.post('/user/updateWidget', updateData)
        .then(function(response) {

            var defer = $q.defer();
            dashboardService.updateWidgetInDashboard(response.data);
            defer.resolve();
            
            return defer;
        });
    }

    // Delete Widget Handler
    this.deleteWidget = function(targetId) {

        return $http.post('/user/deleteWidget', {id: targetId})
        .then(function(response) {

            var defer = $q.defer();
            dashboardService.deleteWidgetInDashboard(response.data);
            defer.resolve();
            
            return defer;
        });
    }
});