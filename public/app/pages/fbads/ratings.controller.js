/**
 * Ratings controller
 */
ezondapp.controller('fbadsRatingsController', function($scope, $http, $q, userService, appDataService, dashboardService, integrationProviders, ratinggroupProviders, integrationService) {
    
    // If not logged in
    if ( !userService.user ) return;

    $scope.ratingsInfo = ratinggroupProviders.ratingsInfo;
    $scope.grab_startdate = "";
    $scope.grab_enddate = "";
    $scope.selectdIndex = 0;
    $scope.selectedHeader = 0;
    $scope.selectedFilter = [];
    $scope.showDropDown = false;
    $scope.filterDropDown = [false, false, false, false, false, false, false, false];
    $scope.result_desc = "No results";
    $scope.selectMetricArray = [];
    $scope.selectMetricSort = "";
    $scope.selectMetricSortValue = true;
    $scope.mainSelectMetric = "";
    $scope.dataTableTop = "504px";
    $scope.displayTipCheck = true;
    $scope.tipOffsetLeft = "0px";
    $scope.tipOffsetTop = "630px";
    $scope.tipEventElem = null;
    $scope.loadCampaign = true;

    $scope.dedicatedPageInfo = {};

    $scope.campaigns = [];
    $scope.adGroups = [];

    $scope.metricDatas = [];
    
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
        else $scope.searchData();
    });

    // Display Tip from header handler
    $scope.displayTip = function($event, metric) {

        $scope.displayTipContent = "";
        $scope.displayTipCheck = true;

        for(i=0; i< $scope.metricDatas.length; i++)
        {
            if($scope.metricDatas[i].metricName == metric){
                $scope.displayTipContent = $scope.metricDatas[i].description;
            }
        }
        if($scope.ratingsInfo.header[$scope.selectdIndex].length > 0)
            if($scope.ratingsInfo.header[$scope.selectdIndex][$scope.selectedHeader].name == metric)
                $scope.displayTipContent = $scope.ratingsInfo.header[$scope.selectdIndex][$scope.selectedHeader].description;
        
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

    // Remove Display Tip handler
    $scope.unDisplayTip = function() {
        setTimeout(function(){
                $scope.displayTipCheck = true;
                $scope.$apply();
            }, 200);
    }

    // Get Sort Field Name Handler
    $scope.predicate = function(rows) {
      return rows[$scope.selectMetricSort];
    }

    // Get Table Result Handler
    $scope.getResultCheck = function() {
        if(angular.isDefined($scope.dedicatedPageInfo["result"])){
            if($scope.dedicatedPageInfo["result"].length > 0) $scope.result_desc = "Showing " + $scope.dedicatedPageInfo["result"].length + " Rows";
            else $scope.result_desc = "No results";
            $scope.tableRows = $scope.dedicatedPageInfo["result"];
            return ($scope.dedicatedPageInfo["result"].length > 0);
        } else return false;
    }

    // Get Metric-specified value handler
    $scope.getDisplayData = function(metric) {
     //   console.log(metric);
        if(angular.isDefined($scope.dedicatedPageInfo[metric])){
            return $scope.dedicatedPageInfo[metric];
        } else return "0.00";
    }

    // Draw Char handler
    $scope.drawChartFunction = function() {
        Highcharts.chart('chart-container2', {
            chart: {
                type: 'column'
            },
            data: {
                csv: $scope.dedicatedPageInfo[$scope.mainSelectMetric + "_Chart"]
            },
            title: {
                text: ''
            },
        });
    
        Highcharts.chart('chart-container1', {
            data: {
                csv: $scope.dedicatedPageInfo[$scope.mainSelectMetric + "_Chart"]
            },

            title: {
                text: ''
            },
        });
    }

    // Update Ratings Campaign Data
    $scope.updateCampaignData = function() {
        if($scope.loadCampaign){
            $scope.campaigns = $scope.dedicatedPageInfo.campaigns;
            $scope.adGroups = $scope.dedicatedPageInfo.adGroups;

            $scope.loadCampaign = false;
        }
    }

    // Search Data Handler
    $scope.searchData = function() {
        setTimeout('$(".panel").addClass("loading");$(".common-widgets-table").addClass("loading");', 100);
        
        post_network_id = $scope.ratingsInfo.networkID * 1 + 100 * $scope.selectdIndex + 10000 * $scope.ratingsInfo.id;

        filter_value = "";
        for(i=0; i<$scope.ratingsInfo.filters[$scope.selectdIndex].length; i++){
            if(i > 0) filter_value += "@";
            filter_value += $scope.selectedFilter[i];
        }
        console.log(filter_value);

       $http.post("/user/getDedicatedPage", {dashboardID: dashboardService.dashboard.id, filter: filter_value, startDate: $scope.grab_startdate, endDate: $scope.grab_enddate, networkID: post_network_id}).then(function(response) {
            $scope.dedicatedPageInfo = JSON.parse(response.data);
            $scope.drawChartFunction();
            $scope.updateCampaignData();
            
            $(".panel").removeClass("loading");
            $(".common-widgets-table").removeClass("loading");
        });
    }

    // Select Main Metric from Widgets
    $scope.toggleMainSelectMetric = function(metric) {
        $scope.mainSelectMetric = metric;
        $scope.drawChartFunction();
    }

    // Event handler after Metric Select Change
    $scope.refreshMetricSelected = function() {
        $scope.selectMetricArray = [];
        for(i=0; i< $scope.metricDatas.length; i++)
        {
            if(($scope.metricDatas[i].metricSelect)&&($scope.metricDatas[i].description != '')){
                $scope.selectMetricArray[$scope.selectMetricArray.length] = $scope.metricDatas[i].metricName;
            }
        }

        $scope.selectMetricSort = "";
        $scope.selectMetricSortValue = true;
        $scope.mainSelectMetric = "";
        if($scope.selectMetricArray.length > 0){
            $scope.selectMetricSort = $scope.selectMetricArray[0];
            $scope.mainSelectMetric = $scope.selectMetricArray[0];
        }
        if($scope.selectMetricArray.length > 6)
            $scope.dataTableTop = "672px";
        else
            $scope.dataTableTop = "504px";

        $scope.drawChartFunction();
    }

    // Change Metric Sort Handler
    $scope.changeMetricChange = function(metric) {
        if($scope.selectMetricSort == metric) {
            if($scope.selectMetricSortValue == false)
                $scope.selectMetricSortValue = true;
            else
                $scope.selectMetricSortValue = false;
        } else {
            $scope.selectMetricSort = metric;
            $scope.selectMetricSortValue = true;
        }
    //    $scope.searchData();
    }

    // Toggle Header Select Event Handler
    $scope.toggleSelectedHeader = function(index) {
        $scope.selectedHeader = index;
    //    $scope.searchData();
    }

    // Toggle DropDown Menu Handler
    $scope.toggleDropDown = function() {
        
        //console.log(JSON.stringify($scope.connectionInfo));
        $scope.showDropDown = !$scope.showDropDown;
    }

    // Select Filter From DropDown Menu Handler
    $scope.selectFilterDropDown = function(filter, index) {
        $scope.selectedFilter[index] = filter;
        $scope.filterDropDown[index] = false;
        $scope.searchData();
    }

    // Toggle DropDown Menu for Filter Handler
    $scope.toggleFilterDropDown = function(index) {
        if($scope.filterDropDown[index] == false) {
            $scope.filterDropDown = [false, false, false, false, false, false, false, false];
            $scope.filterDropDown[index] = true;
        } else {
            $scope.filterDropDown[index] = !$scope.filterDropDown[index];
        }
    }

    // Change Menu Handler
    $scope.changeMenu = function(index) {
        $scope.showDropDown = false;
        $scope.filterDropDown = [false, false, false, false, false, false, false, false];
        $scope.selectdIndex = index;
        $scope.selectedHeader = 0;
        $scope.metricDatas = $scope.ratingsInfo.metric[$scope.selectdIndex];
        $scope.selectedFilter = [];

        $scope.refreshMetricSelected();

        if($scope.ratingsInfo.filters[$scope.selectdIndex].length > 0)
        {
            for(i=0; i<$scope.ratingsInfo.filters[$scope.selectdIndex].length; i++){
                $scope.selectedFilter[i] = $scope.ratingsInfo.filters[$scope.selectdIndex][i][0];
                if($scope.ratingsInfo.filters[$scope.selectdIndex][i].length == 1){
                    if($scope.ratingsInfo.filters[$scope.selectdIndex][i][0] == "All Campaigns"){
                        $scope.ratingsInfo.filters[$scope.selectdIndex][i] = $scope.campaigns;
                    }
                    if($scope.ratingsInfo.filters[$scope.selectdIndex][i][0] == "All Ad Sets"){
                        console.log($scope.adGroups);
                        $scope.ratingsInfo.filters[$scope.selectdIndex][i] = $scope.adGroups;
                    }
                }
            }
        }

        $scope.searchData();
    }

    // Edit Integration Handler
    $scope.editIntegration = function() {
        integrationService.accountStep = "accountSetup";
        $scope.$emit('showPopup', {popup: 'integration', networkIndex: $scope.ratingsInfo.networkID});
    }

    // Remove Integration Handler
    $scope.deleteIntegration = function() {
        integrationService.accountStep = "accountDelete";
        $scope.$emit('showPopup', {popup: 'integration', networkIndex: $scope.ratingsInfo.networkID});
    }

    // Date-Range Selector Bind Module
    $(function(){

        $scope.grab_startdate = moment().subtract(29, 'days').format('YYYY-MM-DD');
        $scope.grab_enddate = moment().format('YYYY-MM-DD');
        
        $scope.changeMenu(0);

        $("#CalendarTextDisp").html("Last 30 Days");

        $('#CalendarText').daterangepicker({
            "ranges": {
                      'Today': [moment(), moment()],
                      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                      'This Month': [moment().startOf('month'), moment().endOf('month')],
                      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            "startDate": moment().subtract(29, 'days'),
            "endDate": moment(),
            "dateFormat": "yy-mm-dd",
            "opens": "left"
        }, function(start, end, label) {
            $scope.grab_startdate = start.format('YYYY-MM-DD');
            $scope.grab_enddate = end.format('YYYY-MM-DD');

            console.log("Date Range Selected is " + $scope.grab_startdate + " ~ " + $scope.grab_enddate);
            if((moment().format('YYYY-MM-DD') == start.format('YYYY-MM-DD'))&&(moment().format('YYYY-MM-DD') == end.format('YYYY-MM-DD'))){
                $("#CalendarTextDisp").html("Today");
            } else if((moment().subtract(1, 'days').format('YYYY-MM-DD') == start.format('YYYY-MM-DD'))&&(moment().subtract(1, 'days').format('YYYY-MM-DD') == end.format('YYYY-MM-DD'))){
                $("#CalendarTextDisp").html("Yesterday");
            } else if((moment().subtract(6, 'days').format('YYYY-MM-DD') == start.format('YYYY-MM-DD'))&&(moment().format('YYYY-MM-DD') == end.format('YYYY-MM-DD'))){
                $("#CalendarTextDisp").html("Last 7 Days");
            } else if((moment().subtract(29, 'days').format('YYYY-MM-DD') == start.format('YYYY-MM-DD'))&&(moment().format('YYYY-MM-DD') == end.format('YYYY-MM-DD'))){
                $("#CalendarTextDisp").html("Last 30 Days");
            } else if((moment().startOf('month').format('YYYY-MM-DD') == start.format('YYYY-MM-DD'))&&(moment().endOf('month').format('YYYY-MM-DD') == end.format('YYYY-MM-DD'))){
                $("#CalendarTextDisp").html("This Month");
            } else if((moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') == start.format('YYYY-MM-DD'))&&(moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') == end.format('YYYY-MM-DD'))){
                $("#CalendarTextDisp").html("Last Month");
            } else {
                $("#CalendarTextDisp").html(start.format('MMMM D YYYY') + " - " + end.format('MMMM D YYYY'));
            }
            $scope.searchData();
        });
        $("#CalendarTextBtn").click(function(){
            $("#CalendarText").click();
        })
    });

});