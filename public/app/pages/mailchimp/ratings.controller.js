/**
 * Ratings controller
 */
ezondapp.controller('mailchimpRatingsController', function($scope, $http, $q, userService, appDataService, dashboardService, integrationProviders, ratinggroupProviders, integrationService) {
    
    // If not logged in
    if ( !userService.user ) return;

    $scope.ratingsInfo = ratinggroupProviders.ratingsInfo;
    $scope.selectdIndex = 0;
    $scope.showDropDown = false;
    $scope.result_desc = "No results";
    $scope.selectMetricSort = "";
    $scope.selectMetricSortValue = "";
    $scope.displayTipCheck = true;
    $scope.tipOffsetLeft = "0px";
    $scope.tipOffsetTop = "630px";
    $scope.tipEventElem = null;
    $scope.mainSelectMetric = "";

    $scope.dedicatedPageInfo = {};
    
    $scope.bindAccountInfo = {"websiteUrl": "", "webPropertyId": ""};
    $scope.connectionInfo = dashboardService.dashboard.integrations;
    for(i = 0; i < $scope.connectionInfo.length; i++)
    {
        if($scope.connectionInfo[i].networkID == $scope.ratingsInfo.networkID)
            $scope.bindAccountInfo = $scope.connectionInfo[i];
    }    

    // Refresh Handler after edit or delete integration event
    $scope.$on('refreshIntegration', function(e, details) {
        console.log("Refresh Integrations : " + details.popup);
        $scope.bindAccountInfo = {"websiteUrl": "", "webPropertyId": ""};
        $scope.connectionInfo = dashboardService.dashboard.integrations;
        for(i = 0; i < $scope.connectionInfo.length; i++)
        {
            if($scope.connectionInfo[i].networkID == $scope.ratingsInfo.networkID)
                $scope.bindAccountInfo = $scope.connectionInfo[i];
        }
        if(details.popup == "delete") $scope.showDropDown = false;
        $scope.searchData();
    });

    // Display Tip from header handler
    $scope.displayTip = function($event, metric) {

        $scope.displayTipContent = "";
        $scope.displayTipCheck = true;

        for(i=0; i<$scope.ratingsInfo.header[$scope.selectdIndex].length; i++)
            if($scope.ratingsInfo.header[$scope.selectdIndex][i].name == metric)
                $scope.displayTipContent = $scope.ratingsInfo.header[$scope.selectdIndex][i].description;
        
        $scope.tipOffsetTop = $event.target.getBoundingClientRect().top + $(window).scrollTop() - 80;
        $scope.tipOffsetLeft = $event.target.getBoundingClientRect().left - 100;
        $scope.tipEventElem = $event.target.getBoundingClientRect();

        if($scope.displayTipContent != ""){
            setTimeout(function(){
                var twidth = $("#toolTipDiv").outerWidth();
                var theight = $("#toolTipDiv").outerHeight();

                $scope.tipOffsetTop = $scope.tipEventElem.top + $(window).scrollTop() - theight - 10;
                $scope.tipOffsetLeft = $scope.tipEventElem.left - twidth / 2 + 5;
                $scope.displayTipCheck = false;
                $scope.$apply();

            }, 100);
        } 
    }

    $scope.getResultCheck = function() {
        menu_select_name = $scope.ratingsInfo.menu[$scope.selectdIndex];
        // console.log(menu_select_name);
        if(angular.isDefined($scope.dedicatedPageInfo[menu_select_name + "_result"])){
            if($scope.dedicatedPageInfo[menu_select_name + "_result"].length > 0) $scope.result_desc = "Showing " + $scope.dedicatedPageInfo[menu_select_name + "_result"].length + " Rows";
            else $scope.result_desc = "No results";
            $scope.tableRows = $scope.dedicatedPageInfo[menu_select_name + "_result"];
            return ($scope.dedicatedPageInfo[menu_select_name + "_result"].length > 0);
        } else return false;
    }

    // Remove Display Tip handler
    $scope.unDisplayTip = function() {
        setTimeout(function(){
                $scope.displayTipCheck = true;
                $scope.$apply();
            }, 200);
    }

    // Search Data Handler
    $scope.searchData = function() {
        if($scope.bindAccountInfo.websiteUrl == ""){
            $scope.dedicatedPageInfo = {};
            return false;
        }
        setTimeout('$(".panel").addClass("loading");$(".common-widgets-table").addClass("loading");', 100);

        $http.post("/user/getDedicatedPage", {dashboardID: dashboardService.dashboard.id, startDate: "2017-01-01", endDate: "2017-01-01", networkID: $scope.ratingsInfo.networkID}).then(function(response) {
            $scope.dedicatedPageInfo = JSON.parse(response.data);
            
            $(".panel").removeClass("loading");
            $(".common-widgets-table").removeClass("loading");
        });
    
    }

    // Change Menu Handler
    $scope.changeMenu = function(index) {
        $scope.showDropDown = false;
        $scope.selectdIndex = index;

        $scope.searchData();
    }

    // Toggle DropDown Menu Handler
    $scope.toggleDropDown = function() {
        
        //console.log(JSON.stringify($scope.connectionInfo));
        $scope.showDropDown = !$scope.showDropDown;
    }

    $scope.isClient = true;
    if (typeof userService.user.role == 'undefined' || userService.user.role != 'client'){
        $scope.isClient = false;
    }
    // Edit Integration Handler
    $scope.editIntegration = function() {
        if($scope.isClient) return;
        integrationService.accountStep = "accountSetup";
        $scope.$emit('showPopup', {popup: 'integration', networkIndex: $scope.ratingsInfo.networkID});
    }

    // Remove Integration Handler
    $scope.deleteIntegration = function() {
        if($scope.isClient) return;
        integrationService.accountStep = "accountDelete";
        $scope.$emit('showPopup', {popup: 'integration', networkIndex: $scope.ratingsInfo.networkID});
    }

    // Date-Range Selector Bind Module
    $(function(){
        $scope.changeMenu(0);
    });

});