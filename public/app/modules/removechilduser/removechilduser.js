/**
 * Remove Child User directive
 */
ezondapp.directive('removeChildUser', function(userService, appDataService) {

    return {
        restrict: 'E',
        scope: {},
        replace: true,
        link: function($scope, elem, atts) {

            $scope.showPopup = $scope.$parent.showPopup;         
            
            initData();
            
            // Close Remove Child User Window
            $scope.closePopup = function() {

                $scope.$emit('hidePopup', {popup: 'removeChildUser'});
                initData();
            }

            $scope.$on('removeChildUser1', function(e, targetUser) {
                $scope.targetUser = targetUser;
            });

            // Remove Child User Handler
            $scope.removeChildUser = function() {

                console.log("qq")
                var userId = $scope.targetUser.id;                
                
                userService.removeChildUser({userId:userId}).$promise
                .then(function(response) {
                    appDataService.deleteChildUserInDashboard(userId);                  
                    $scope.$emit('hidePopup', {popup: 'removeChildUser'});
                    initData();
                    
                });

            }            

            // Initialization Module
            function initData() {
                
            }
        },
        templateUrl: '/app/modules/removechilduser/removechilduser.html'
    }
});