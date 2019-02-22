/**
 * Add widget directive
 */
ezondapp.directive('removeCampaign', function(integrationProviders, removeCampaignService, dashboardService, $mdDialog) {

    return {
        restrict: 'E',
        scope: {},
        replace: true,
        link: function($scope, elem, atts) {

            $scope.showPopup = $scope.$parent.showPopup;            
            
            initCampaignData();

            // Grab Campaign Information Handler
            $scope.$on('removeCampaign1', function(e, details) {

                $scope.campaign = details;

                if(details.description){
                    
                    var description = JSON.parse(details.description);

                    $scope.campaign.url = description.url;
                    $scope.campaign.location = description.location;
                    $scope.campaign.group = description.group;                               
                }


                $mdDialog.show( 
                    $mdDialog.confirm()
                      .title('Are you sure you want to delete this campaign?')
                      .textContent("You want to delete " + $scope.campaign.company_name)
                      .ariaLabel('Delete campaign?')
                      .targetEvent(e)
                      .ok('CONFRIM')
                      .cancel('CANCEL')
                    )
                    .then(function() {
                        $scope.removeCampaign()
                    }, function() {
                        $mdDialog.hide()
                    });

            });
            
            // Close Remove Campaign Window
            $scope.closePopup = function() {

                $scope.$emit('hidePopup', {popup: 'removeCampaign'});
                initCampaignData();
            }

            // Remove Camapign Handler
            $scope.removeCampaign = function() {

                var campaignId = $scope.campaign.id;                
                
                removeCampaignService.deleteCampaign(campaignId)
                .then(function(response) {
                                           
                    // $scope.$emit('hidePopup', {popup: 'removeCampaign'});
                    initCampaignData();
                    $scope.$parent.$broadcast('refreshCampaigns', {});
                });
            }            

            // Initialization Module
            function initCampaignData() {
                
            }
        },
        template: '<span></span>'
    }
});