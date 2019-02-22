/**
 * Ratings controller
 */
ezondapp.controller('youtubeRatingsController', function($scope, $state, $cookies, $http, $q, userService, appDataService, dashboardService, integrationProviders, ratinggroupProviders, integrationService) {
    
    // If not logged in
    if ( !userService.user ) return;

    $scope.ratingsInfo = ratinggroupProviders.ratingsInfo;
    $scope.grab_startdate = "";
    $scope.grab_enddate = "";
    $scope.showDropDown = false;
    $scope.result_desc = "No results";
    $scope.selectMetricArray = [];
    $scope.selectMetricArray2 = [];
    $scope.selectMetricSort = "";
    $scope.selectMetricSortValue = true;
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

    // Select Main Metric from Widgets
    $scope.toggleMainSelectMetric = function(metric) {
        $scope.mainSelectMetric = metric;
        $scope.drawChartFunction();
    }

    // Display Tip from header handler
    $scope.displayTip = function($event, metric) {

        $scope.displayTipContent = "";
        $scope.displayTipCheck = true;

        for(i=0; i< $scope.ratingsInfo.metric.length; i++)
        {
            if($scope.ratingsInfo.metric[i] == metric){
                $scope.displayTipContent = $scope.ratingsInfo.description[i];
            }
        }
        for(i=0; i<$scope.ratingsInfo.header.length; i++)
            if($scope.ratingsInfo.header[i].name == metric)
                $scope.displayTipContent = $scope.ratingsInfo.header[i].description;
        
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


    // Event handler after Metric Select Change
    $scope.refreshMetricSelected = function(firstload = false) {
        $scope.selectMetricArray = [];
        $scope.selectMetricArray2 = [];

        if (firstload && typeof $cookies.get('selectedMetricsForYoutube'+$state.params.kind) != 'undefined'){
            console.log("firstload")
            $scope.savedMetrics = JSON.parse($cookies.get("selectedMetricsForYoutube"+$state.params.kind))
            for(i=0; i< $scope.ratingsInfo.metric.length; i++) {
                if ($scope.savedMetrics.indexOf($scope.ratingsInfo.metric[i]) != -1)
                    $scope.ratingsInfo.metricSelect[i] = true
                else
                    $scope.ratingsInfo.metricSelect[i] = false
            }
        }

        for(i=0; i< $scope.ratingsInfo.metric.length; i++)
        {
            if($scope.ratingsInfo.metricSelect[i]){
                $scope.selectMetricArray[$scope.selectMetricArray.length] = $scope.ratingsInfo.metric[i];
                if($scope.ratingsInfo.metricSelect2[i]){
                    $scope.selectMetricArray2[$scope.selectMetricArray2.length] = $scope.ratingsInfo.metric[i];
                }
            }
        }

        $cookies.putObject('selectedMetricsForYoutube'+$state.params.kind, $scope.selectMetricArray, {'expires': new Date(2020, 1, 1)})

        $scope.selectMetricSort = "";
        $scope.selectMetricSortValue = true;
        $scope.mainSelectMetric = "";
        if($scope.selectMetricArray.length > 0){
            $scope.selectMetricSort = $scope.selectMetricArray[0];
            $scope.mainSelectMetric = $scope.selectMetricArray2[0];
        }

        $scope.searchData();
    }

    // Get Sort Field Name Handler
    $scope.predicate = function(rows) {
      row_data = rows[$scope.selectMetricSort];
        row_data = row_data.toString().split(",").join("");
        var re = new RegExp('[0-9.]+');
        if(row_data.match(re)){
            var m = re.exec(rows[$scope.selectMetricSort]);
            if(m.index == 0 && m[0] == m.input)
                return rows[$scope.selectMetricSort] * 1;
            else if(m.index == 0 && (m[0] + "%" == m.input))
                return m[0] * 1;
        }
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
        if(angular.isDefined($scope.dedicatedPageInfo[metric])){
            return $scope.dedicatedPageInfo[metric];
        } else return "0";
    }

    // Draw Char handler
    $scope.drawChartFunction = function() {
        chart_datas = "Dates";
        if(typeof $scope.dedicatedPageInfo[$scope.mainSelectMetric + "_Chart"] != "undefined")
            chart_datas = $scope.dedicatedPageInfo[$scope.mainSelectMetric + "_Chart"];

        console.log(chart_datas)

        Highcharts.chart('chart-container', {
            data: {
                csv: chart_datas
            },

            title: {
                text: ''
            },
        });
    }

    // Search Data Handler
    $scope.searchData = function() {
        if($scope.bindAccountInfo.websiteUrl == ""){
            $scope.dedicatedPageInfo = {};
            $scope.drawChartFunction();
            return false;
        }

        setTimeout('$(".panel").addClass("loading");$(".common-widgets-table").addClass("loading");', 100);
        
        post_network_id = $scope.ratingsInfo.networkID * 1;

       $http.post("/user/getDedicatedPage", {dashboardID: dashboardService.dashboard.id, startDate: $scope.grab_startdate, endDate: $scope.grab_enddate, networkID: post_network_id}).then(function(response) {
            $scope.dedicatedPageInfo = JSON.parse(response.data);
            $scope.drawChartFunction();
            
            $(".panel").removeClass("loading");
            $(".common-widgets-table").removeClass("loading");
        });
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
        // $scope.searchData();
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

    $scope.grab_startdate = dashboardService.startDate  ;
    $scope.grab_enddate = dashboardService.endDate  ;


    if ((moment().format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Today";
    } else if ((moment().subtract(1, 'days').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().subtract(1, 'days').format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Yesterday";
    } else if ((moment().subtract(6, 'days').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Last 7 Days";
    } else if ((moment().subtract(29, 'days').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Last 30 Days";
    } else if ((moment().startOf('month').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().endOf('month').format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "This Month";
    } else if ((moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Last Month";
    } else {
        $scope.calendarLabel = moment(dashboardService.startDate).format('MMMM D YYYY') + " - " + moment(dashboardService.endDate).format('MMMM D YYYY');
    }


    // Date-Range Selector Bind Module
    $(function(){

        $scope.refreshMetricSelected(true);

        // $("#CalendarTextDisp").html("Last 30 Days");

        $('#CalendarText').daterangepicker({
            "ranges": {
                      'Today': [moment(), moment()],
                      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                      'This Month': [moment().startOf('month'), moment().endOf('month')],
                      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            "startDate": moment(dashboardService.startDate),
            "endDate": moment(dashboardService.endDate),
            "dateFormat": "yy-mm-dd",
            "opens": "left"
        }, function(start, end, label) {
            $scope.calendarLabel = label

            $scope.grab_startdate = start.format('YYYY-MM-DD');
            $scope.grab_enddate = end.format('YYYY-MM-DD'); 

            dashboardService.startDate = start.format('YYYY-MM-DD');
            dashboardService.endDate = end.format('YYYY-MM-DD');

            $scope.searchData();
        });
        $("#CalendarTextBtn").click(function(){
            $("#CalendarText").click();
        })
    });

});