/**
 * Add widget directive
 */
ezondapp.directive('editCampaign', function(integrationProviders, editCampaignService, dashboardService, appDataService) {

    return {
        restrict: 'E',
        scope: {},
        replace: true,
        link: function($scope, elem, atts) {

            $scope.showPopup = $scope.$parent.showPopup;            
            
            initCampaignData();

            // Grab Campaign Information Handler
            $scope.$on('editCampaign1', function(e, details) {
                $scope.campaign = details;
                if(details.description){
                    var description = JSON.parse(details.description);

                    $scope.campaign.url = description.url;
                    $scope.campaign.location = description.location;
                    $scope.campaign.group = description.group;                               
                }
            });
            
            // Close Edit Campaign Window
            $scope.closePopup = function() {

                $scope.$emit('hidePopup', {popup: 'editCampaign'});
                initCampaignData();
            }            

            // Update Campaign Information Handler
            $scope.updateCampaign = function() {

                $scope.campaign.location = $('#location2').prop("value");
                exe_desciption = JSON.parse($scope.campaign.description);
                exe_desciption.location = $scope.campaign.location;
                $scope.campaign.description = JSON.stringify(exe_desciption);

                var campaign = angular.copy($scope.campaign);

                editCampaignService.updateCampaign(campaign)
                .then(function(response) {
                                           
                    $scope.$emit('hidePopup', {popup: 'editCampaign'});
                    initCampaignData();
                    
                });

                description = "";

                for(i=0; i<appDataService.appData.user.dashboards.length; i++)
                {
                    if(appDataService.appData.user.dashboards[i].id == campaign.id){
                        exe_desciption = JSON.parse(appDataService.appData.user.dashboards[i].description);
                        exe_desciption.location = campaign.location;
                        appDataService.appData.user.dashboards[i].description = JSON.stringify(exe_desciption);
                        description = JSON.stringify(exe_desciption);
                    }
                }
                var data = new FormData();
                var objXhr = new XMLHttpRequest();

                objXhr.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        $scope.$parent.$broadcast('refreshCampaigns', {});
                    }
                };
                objXhr.open("POST", appDataService.appData.backendUrl + "apis/updateCampaignTags.php?campaign_id=" + campaign.id + "&description=" + description);
                objXhr.send(data);
            }

            // Initialization Module
            function initCampaignData() {
                var autocomplete = new google.maps.places.Autocomplete(document.getElementById('location2'));
            }
        },
        templateUrl: '/app/modules/editcampaign/editcampaign2.html'
    }
});