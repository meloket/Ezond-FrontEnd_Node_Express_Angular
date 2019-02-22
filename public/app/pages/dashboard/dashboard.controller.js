/**
 * Dashboard controller
 */
ezondapp.controller('dashboardController', function($scope, $http, $q, $timeout, userService, dashboardService, appDataService, integrationProviders, $state, $mdDialog) {

    // If not logged in
    if (!userService.user) return;

    $scope.comparisonResult = function (val1, val2) {
        if (typeof val1 == 'undefined' || typeof val2 == 'undefined')
            return
        
        val1 = val1.replace("%", "")
        val2 = val2.replace("%", "")
        val1 = val1.replace(",", "")
        val2 = val2.replace(",", "")
        if (parseInt(val1) > parseInt(val2)) return "ion-arrow-up-b"
        else if (parseInt(val1) < parseInt(val2)) return "ion-arrow-down-b"
        else return ""
    }

    $scope.compDiff = function (val1, val2) {
        if (typeof val1 == 'undefined' || typeof val2 == 'undefined') 
            return

        val1 = val1.replace("%", "")
        val2 = val2.replace("%", "")
        val1 = val1.replace(",", "")
        val2 = val2.replace(",", "")
        if (val2 == 0) val2 = 1
        var result = ((val1-val2)/val2)*100>100 ? (((val1-val2)/val2)*100 )|0 : ( (((val1-val2)/val2)*100 == 100 || ((val1-val2)/val2)*100 == -100) ? "" : (((val1-val2)/val2)*100)|0 )
        return (result < 0) ? result*-1 : result
    }

    $scope.planSubscribed = userService.planSubscribed;
    $scope.expiredTrial = appDataService.appData.subscription_expired;

    // If user not own that dashboard
    // if (userService.user.id != dashboardService.dashboard.ownerID) {
    //     $state.go('app.controlpanel.campaigns')
    //     return
    // }
    userService.updateLocation();

    $scope.addWidget = function() {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {

            }],
            // parent: angular.element('#material-modals'),
            disableParentScroll: true,
            clickOutsideToClose: true,
            autoWrap: false,
            // templateUrl: '/app/modules/createcampaign/createcampaign1.html',
            template: '<add-widget></add-widget>'
        })
    }

    $scope.widgets = dashboardService.dashboard.widgets;

    if ($scope.widgets){
        for (var i = 0; i <= $scope.widgets.length - 1; i++) {
            $scope.widgets[i].sizeY = 3
        }
    }
    


    $scope.dashboard = dashboardService.dashboard;
    $scope.grab_startdate = "";
    $scope.grab_enddate = "";

    $scope.isClient = true;
    if (typeof userService.user.role == 'undefined' || userService.user.role != 'client') {
        $scope.isClient = false;
    }

    $scope.addWidget = function() {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {

            }],
            // parent: angular.element('#material-modals'),
            disableParentScroll: true,
            clickOutsideToClose: true,
            autoWrap: false,
            template: '<add-widget></add-widget>'
        })
    }

    // Open Add Widget Window Handler
    // $scope.addWidget = function() {
    //     if ($scope.isClient) return;
    //     $scope.$emit('showPopup', { popup: 'addWidget' });
    // }

    // Open Edit Widget Window Handler
    $scope.editWidget = function(widget) {
        if ($scope.isClient) return;
        $scope.$emit('editWidget', { popup: 'editWidget', targetWidget: widget });
    }


    $scope.modalEditWidget = function(widget) {
        if ($scope.isClient) return;
        $scope.$emit('editWidget', { popup: 'editWidget', targetWidget: widget })
    }

    $scope.goto_dedicated = function(widget) {
        $scope.$parent.$broadcast('onDedicatedPage', { networkType: widget.network });
    }

    $scope.showIntegrations = function() {
        if ($scope.isClient) return;
        $scope.$emit('showPopup', { popup: 'integrations' });
    }

    $scope.saveWidgetPositions = function(gridster) {

        var pos = [];
        widgetData = "";
        for (i = 0; i < gridster.grid.length; i++) {
            if (typeof(gridster.grid[i]) != "undefined") {
                for (j = 0; j < gridster.grid[i].length; j++) {
                    if (typeof(gridster.grid[i][j]) != "undefined") {
                        if (widgetData != "") widgetData += ":";
                        widgetData += gridster.grid[i][j].itemId + "," + gridster.grid[i][j].row + "," + gridster.grid[i][j].col
                        gridster.grid[i][j].id = gridster.grid[i][j].itemId;
                        pos[pos.length] = gridster.grid[i][j];
                    }
                }
            }
        }
        $http.post('/user/saveWidgetPositions', { widgetData: widgetData });
    }

    $scope.$parent.$broadcast('onDashboard', {});

    setTimeout(function() {
        dashboardService.getWidgetDataFromNetwork();
    }, 100);



    $scope.grab_startdate = dashboardService.startDate  ;
    $scope.grab_enddate = dashboardService.endDate  ;    


    if ((moment().format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Today";
        $scope.calendarLabelCompare = "Today";
    } else if ((moment().subtract(1, 'days').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().subtract(1, 'days').format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Yesterday";
        $scope.calendarLabelCompare = "Yesterday";
    } else if ((moment().subtract(6, 'days').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Last 7 Days";
        $scope.calendarLabelCompare = "Last 7 Days";
    } else if ((moment().subtract(29, 'days').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Last 30 Days";
        $scope.calendarLabelCompare = "Last 30 Days";
    } else if ((moment().startOf('month').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().endOf('month').format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "This Month";
        $scope.calendarLabelCompare = "This Month";
    } else if ((moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') == moment(dashboardService.startDate).format('YYYY-MM-DD')) && (moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') == moment(dashboardService.endDate).format('YYYY-MM-DD'))) {
        $scope.calendarLabel = "Last Month";
        $scope.calendarLabelCompare = "Last Month";
    } else {
        $scope.calendarLabel = moment(dashboardService.startDate).format('MMMM D YYYY') + " - " + moment(dashboardService.endDate).format('MMMM D YYYY');
        $scope.calendarLabelCompare = moment(dashboardService.startDate).format('MMMM D YYYY') + " - " + moment(dashboardService.endDate).format('MMMM D YYYY');
    }

    $scope.compare = false
    $scope.changecustomdate = false

    $(function() {

        $('.daterangepicker').remove()

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
            // "startDate": moment().subtract(29, 'days'),
            "endDate": moment(dashboardService.endDate),
            // "endDate": moment(),
            "dateFormat": "yy-mm-dd",
            "opens": "left"
        }, function (start, end, label) {
            $scope.calendarLabel = label
        })

        $('#CalendarText2').on('hide.daterangepicker', function (ev, picker) {
            // $scope.changecustomdate = false
            // $(".samo").removeClass("samo")

        })

        $('#CalendarText2').on('apply.daterangepicker', function (ev, picker) {
            dashboardService.compare = angular.element("#compareCalendarEnable").prop("checked")
            $scope.compare = angular.element("#compareCalendarEnable").prop("checked")

            if (dashboardService.compare) {
                var type = angular.element("#compareCalendar input[type='radio']:checked").val()

                if (type == "previous") {
                    dashboardService.startDate2 = $scope.grab_startdate
                    dashboardService.endDate2 = $scope.grab_enddate
                } else if (type == "pastYear") {
                    dashboardService.startDate2 = picker.startDate.subtract(1, 'years').format('YYYY-MM-DD');
                    dashboardService.endDate2 = picker.endDate.subtract(1, 'years').format('YYYY-MM-DD');
                    picker.startDate.add(1, 'years').format('YYYY-MM-DD')
                    picker.endDate.add(1, 'years').format('YYYY-MM-DD')
                } else if (type == "custom" && $scope.changecustomdate == true) {
                    dashboardService.startDate2 = picker.startDate.format('YYYY-MM-DD');
                    dashboardService.endDate2 = picker.endDate.format('YYYY-MM-DD');

                    dashboardService.getWidgetDataFromNetwork();

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



            dashboardService.getWidgetDataFromNetwork();
            console.log("Date Range Selected is " + $scope.grab_startdate + " ~ " + $scope.grab_enddate);
        })


        $('#type3, #type2, #type1').on('click', function() {
            $('#type3, #type2, #type1').not($(this)).trigger('deselect');
        })

        $('#type3').on('deselect', function(){
            $(".daterangepicker.dropdown-menu.ltr.opensleft").removeClass("samo")
            $("#customdateholder").hide()
        })


        $("#CalendarTextBtn2").click(function() {
            $("#CalendarText2").click();
        })
    });
});