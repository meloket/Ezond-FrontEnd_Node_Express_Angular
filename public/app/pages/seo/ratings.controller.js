/**
 * Ratings controller
 */
ezondapp.controller('seoRatingsController', function($scope, $state, $cookies, $http, $q, userService, appDataService, dashboardService, integrationProviders, ratinggroupProviders, integrationService) {
    
    // If not logged in
    if ( !userService.user ) return;


    $scope.ratingsInfo = ratinggroupProviders.ratingsInfo;
    // $scope.grab_startdate = "";
    // $scope.grab_enddate = "";
    $scope.selectdIndex = 0;
    $scope.selectedHeader = 0;
    $scope.selectedFilter = "";
    $scope.showDropDown = false;
    $scope.filterDropDown = false;
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

        for(i=0; i< $scope.ratingsInfo.metric.length; i++)
        {
            if($scope.ratingsInfo.metric[i] == metric){
                $scope.displayTipContent = $scope.ratingsInfo.description[i];
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


    $scope.comparisonResult = function (val1, val2) {
        if (typeof val1 == 'undefined' || typeof val2 == 'undefined')
            return

        val1 = val1.toString().replace("%", "")
        val2 = val2.toString().replace("%", "")
        val1 = val1.toString().replace(",", "")
        val2 = val2.toString().replace(",", "")
        if (parseInt(val1) > parseInt(val2)) {
            return "ion-arrow-up-b" 
        }
        else if (parseInt(val1) < parseInt(val2)) { 
             return "ion-arrow-down-b"
        }
        else return ""
    }

    $scope.compDiff = function (val1, val2) {
        if (typeof val1 == 'undefined' || typeof val2 == 'undefined') 
            return

        val1 = val1.toString().replace("%", "")
        val2 = val2.toString().replace("%", "")
        val1 = val1.toString().replace(",", "")
        val2 = val2.toString().replace(",", "")
        if (val2 == 0) val2 = 1
        var result = ((val1-val2)/val2)*100>100 ? (((val1-val2)/val2)*100 )|0 : ( (((val1-val2)/val2)*100 == 100 || ((val1-val2)/val2)*100 == -100) ? "" : (((val1-val2)/val2)*100)|0 )
        return (result < 0) ? result*-1 : result
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
    $scope.getDisplayData = function(metric, forcompare = false) {
        if(angular.isDefined($scope.dedicatedPageInfo[metric])){
            if (forcompare && angular.isDefined($scope.dedicatedPageInfo_compare[metric]))
                return $scope.dedicatedPageInfo_compare[metric];
            return $scope.dedicatedPageInfo[metric];
        } else return "0.00";
    }

    // Draw Char handler
    $scope.drawChartFunction = function() {
        chart_datas = "Dates";
        if(typeof $scope.dedicatedPageInfo[$scope.mainSelectMetric + "_Chart"] != "undefined")
            chart_datas = $scope.dedicatedPageInfo[$scope.mainSelectMetric + "_Chart"];
        if($scope.ratingsInfo.id == 2){
            Highcharts.chart('chart-container2', {
                chart: {
                    type: 'pie'
                },
                data: {
                    csv: chart_datas
                },

                title: {
                    text: ''
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            useHTML: true,
                            enabled: true,
                            format: '{point.name}',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
            });
        
            Highcharts.chart('chart-container1', {
                chart: {
                    type: 'column'
                },
                data: {
                    csv: chart_datas
                },

                title: {
                    text: ''
                },
            });
        } else {
            Highcharts.chart('chart-container2', {
                chart: {
                    type: 'column'
                },
                data: {
                    csv: chart_datas
                },
                title: {
                    text: ''
                },
            });
        
            Highcharts.chart('chart-container1', {
                data: {
                    csv: chart_datas
                },

                title: {
                    text: ''
                },
            });
        }
    }

    // Search Data Handler
    $scope.searchData = function() {
        if($scope.bindAccountInfo.websiteUrl == ""){
            $scope.dedicatedPageInfo = {};
            $scope.drawChartFunction();
            return false;
        }
        setTimeout('$(".panel").addClass("loading");$(".common-widgets-table").addClass("loading");', 100);
        
        post_network_id = $scope.ratingsInfo.networkID * 1 + 100 * $scope.selectdIndex + 10000 * $scope.ratingsInfo.id;

       $http.post("/user/getDedicatedPage", {dashboardID: dashboardService.dashboard.id, startDate: $scope.grab_startdate, endDate: $scope.grab_enddate, networkID: post_network_id}).then(function(response) {
            $scope.dedicatedPageInfo = JSON.parse(response.data);
            $scope.drawChartFunction();
            $(".panel").removeClass("loading");
            $(".common-widgets-table").removeClass("loading");
        });

      if ($scope.compare) {
            $(".stat_small").addClass("loading");
            $http.post("/user/getDedicatedPage", {tocompare:true, dashboardID: dashboardService.dashboard.id, startDate: dashboardService.startDate2, endDate: dashboardService.endDate2, networkID: post_network_id}).then(function(response) {
                $scope.dedicatedPageInfo_compare = JSON.parse(response.data);
                $(".stat_small").removeClass("loading");
            });
       }
    }

    // Select Main Metric from Widgets
    $scope.toggleMainSelectMetric = function(metric) {
        $scope.mainSelectMetric = metric;
        $scope.drawChartFunction();
    }

    // Event handler after Metric Select Change
    $scope.refreshMetricSelected = function(firstload = false) {
        $scope.selectMetricArray = [];

        if (firstload && typeof $cookies.get('selectedMetricsForSeo'+$scope.selectdIndex+$state.params.kind) != 'undefined'){
            console.log("firstload")
            $scope.savedMetrics = JSON.parse($cookies.get("selectedMetricsForSeo"+$scope.selectdIndex+$state.params.kind))
            for(i=0; i< $scope.ratingsInfo.metric.length; i++) {
                if ($scope.savedMetrics.indexOf($scope.ratingsInfo.metric[i]) != -1)
                    $scope.ratingsInfo.metricSelect[i] = true
                else
                    $scope.ratingsInfo.metricSelect[i] = false
            }
        }


        for(i=0; i< $scope.ratingsInfo.metric.length; i++) {
            if($scope.ratingsInfo.metricSelect[i]){
                $scope.selectMetricArray[$scope.selectMetricArray.length] = $scope.ratingsInfo.metric[i];
            }
        }
        $cookies.putObject('selectedMetricsForSeo'+$scope.selectdIndex+$state.params.kind, $scope.selectMetricArray, {'expires': new Date(2020, 1, 1)})

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

        if ($scope.selectMetricArray.length != 0)
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
    $scope.selectFilterDropDown = function(filter) {
    	$scope.selectedFilter = filter;
    	$scope.filterDropDown = false;
    //	$scope.searchData();
    }

    // Toggle DropDown Menu for Filter Handler
    $scope.toggleFilterDropDown = function() {
    	$scope.filterDropDown = !$scope.filterDropDown;
    }

    // Change Menu Handler
    $scope.changeMenu = function(index) {
    	$scope.showDropDown = false;
    	$scope.filterDropDown = false;
    	$scope.selectdIndex = index;
        $scope.selectedHeader = 0;
        $scope.refreshMetricSelected(true)
        $scope.searchData();
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
    	if($scope.ratingsInfo.filters.length > 0)
    		$scope.selectedFilter = $scope.ratingsInfo.filters[0];
        
        // $scope.ratingsInfo.metricSelect = $cookies.get('selectedMetricsForSeo')
        // console.log($cookies.get('selectedMetricsForSeo'))
        // console.log($scope.metricSelect)
        $scope.refreshMetricSelected(true);
        $scope.changeMenu(0);

        $('.daterangepicker').remove()


        // $("#CalendarTextDisp").html("Last 30 Days");

        $('#CalendarText2').daterangepicker({
            "autoApply": true,
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
        });


        $('#CalendarText2').on('apply.daterangepicker', function (ev, picker) {
            dashboardService.compare = angular.element("#compareCalendarEnable").prop("checked")
            $scope.compare = angular.element("#compareCalendarEnable").prop("checked")
            // dashboardService.compare = angular.element("#compareCalendarEnable")
            if (dashboardService.compare){
                var type = angular.element("#compareCalendar input[type='radio']:checked").val()
                if (type == "previous") {
                    dashboardService.startDate2 = $scope.grab_startdate
                    dashboardService.endDate2 = $scope.grab_enddate
                }
                else if (type == "pastYear"){
                    dashboardService.startDate2 = picker.startDate.subtract(1, 'years').format('YYYY-MM-DD');
                    dashboardService.endDate2 = picker.endDate.subtract(1, 'years').format('YYYY-MM-DD');
                    picker.startDate.add(1, 'years').format('YYYY-MM-DD')
                    picker.endDate.add(1, 'years').format('YYYY-MM-DD')
                } else if (type == "custom" && $scope.changecustomdate==true) {
                    dashboardService.startDate2 = picker.startDate.format('YYYY-MM-DD');
                    dashboardService.endDate2 = picker.endDate.format('YYYY-MM-DD');

                    $scope.searchData();

                    $(".daterangepicker.dropdown-menu.ltr.opensleft").removeClass("samo")
                    $scope.changecustomdate = false


                    $("#customdateholder").html(picker.startDate.format('MMMM Do YYYY') + "<br>" + picker.endDate.format('MMMM Do YYYY'))

                    $('#CalendarText2').data('daterangepicker').setStartDate(moment($scope.grab_startdate, "YYYY-MM-DD").format("MM/DD/YYYY"))
                    $('#CalendarText2').data('daterangepicker').setEndDate(moment($scope.grab_enddate,  "YYYY-MM-DD").format("MM/DD/YYYY"))
                    $("#CalendarText2").click();

                    return
                } else if (type == "custom" && $scope.changecustomdate==false) {
                }
            }

            $scope.grab_startdate = picker.startDate.format('YYYY-MM-DD');
            $scope.grab_enddate = picker.endDate.format('YYYY-MM-DD');

            dashboardService.startDate = picker.startDate.format('YYYY-MM-DD');
            dashboardService.endDate = picker.endDate.format('YYYY-MM-DD');
            
            $scope.searchData();
            console.log("Date Range Selected is " + $scope.grab_startdate + " ~ " + $scope.grab_enddate);
        })

        $('#type3, #type2, #type1').on('click', function() {
            $('#type3, #type2, #type1').not($(this)).trigger('deselect');
        })

        $('#type3').on('deselect', function(){
            $(".daterangepicker.dropdown-menu.ltr.opensleft").removeClass("samo")
            $("#customdateholder").hide()
        })

        $("#CalendarTextBtn2").click(function(){
            $("#CalendarText2").click();
        })
    });

});