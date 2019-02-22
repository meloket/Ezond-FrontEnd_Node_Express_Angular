/**
 * Dashboard service
 */
ezondapp.service('dashboardService', function(integrationsService, $http, $q, userService, config) {

    var self = this;
    self.dashboard = {};
    self.dashboard.integrations = {};
    self.rankTrackingStartDate = '2018-01-01';
    self.startDate = moment().tz(config.defaultTimeZone).subtract(29, 'days').format('YYYY-MM-DD');
    self.endDate = moment().tz(config.defaultTimeZone).format('YYYY-MM-DD');

    // Add Widget To Dashboard Handler
    this.addWidgetToDashboard = function(widget) {
        widget.sizeX = 2;
        widget.sizeY = 3;
        widget.itemId = widget.id;

        widget.row = (widget.row || widget.positionRow) || 0;
        widget.col = (widget.col || widget.positionCol) || 0;

        self.dashboard.widgets.push(widget);
        self.getWidgetDataFromNetwork();
    }

    // Add Widget To Dashboard Handler
    this.addWidgetToDashboard2 = function(widget) {
        widget.sizeX = 2;
        widget.sizeY = 4;
        widget.itemId = widget.id;

        widget.row = (widget.row || widget.positionRow) || 0;
        widget.col = (widget.col || widget.positionCol) || 0;

        self.dashboard.widgets.push(widget);
    }

    // Update Widget Information in Dashboard Handler
    this.updateWidgetInDashboard = function(updateData) {
        var idx = self.dashboard.widgets.findIndex(x=>x.id==updateData.id);

        self.dashboard.widgets[idx].metric1 = updateData.metric1;
        self.dashboard.widgets[idx].metric2 = updateData.metric2;
        self.getWidgetDataFromNetwork();
    }

    // Delete Widget in Dashboard Handler
    this.deleteWidgetInDashboard = function(resultData) {

        var idx = self.dashboard.widgets.findIndex(x=>x.id==resultData.id);

        self.dashboard.widgets.splice(idx,1);
    }

    // Get Dashboard Information
    this.getDashboard = function(dashboardID) {

        var deferred = $q.defer();

        $http.post('/user/getdashboard', {id: dashboardID}) // TODO
        .then(function(response) {
            if(response.data){
                self.dashboard = response.data;
                var initWidgets = response.data.widgets;
                //console.log(initWidgets);
                self.dashboard.widgets = [];

                initWidgets.forEach(function(widget) {
                    widget.value1 = "0.00";
                    widget.value2 = "0.00";
                    widget.linked = false;
                    widget.linkedCheck = false;
                    if (typeof userService.user.providers_allowed != 'undefined'){
                        if(userService.user.providers_allowed.indexOf(widget.network) != -1)
                            self.addWidgetToDashboard2(widget);
                    } else {
                        self.addWidgetToDashboard2(widget);
                    }
                });
                integrationsService.connectionInfo = self.dashboard.integrations;
                /*
                setTimeout(function(){
                   self.getWidgetDataFromNetwork(); 
               }, 1000); 
                */
                deferred.resolve(self);
            }
        });

        return deferred.promise;
    }

    this.getWidgetDataFromNetwork = function() {
        if(typeof self.dashboard.id == "undefined") return;
        if(self.dashboard.id == 0) return;
       // if($(".loading-metric").length == 0) return;
        console.log("Dashboard ID ---" + self.dashboard.id);
        console.log("Widget Data Loading ---" + $(".loading-metric").length);
        self.endLoadData = true;
        setTimeout(function(){
            if(self.endLoadData) $(".loading-metric").each(function(){ $(this).addClass("loading");});
        }, 5);
        arr_metrics = [];
        arr_metrics[1] = {'Sessions':'sessions','Users':'users','Pageviews':'pageviews','Pages/Session':'pageviewsPerSession','Avg.Session Duration':'avgSessionDuration','% New Session':'percentNewSessions','Bounce Rate':'bounceRate','Goal Completetions':'goalCompletionsAll','Goal Value':'goalValueAll','Conversion Rate':'goalConversionRateAll'};
        arr_metrics[2] = {'Clicks':'Clicks','Impressions':'Impressions','Cost':'Cost','Average CPC':'AverageCpc','Conversions':'Conversions','CTR':'Ctr','Conversion Value':'ConversionValue','CostPer Conversion':'CostPerConversion'};
        arr_metrics[3] = {'Clicks':'clicks','Impressions':'impressions','CTR':'ctr'};
        arr_metrics[5] = {'Views' : 'views','Likes' : 'likes','Dislikes' : 'dislikes'};
        arr_metrics[7] = {'Clicks': 'clicks', 'Impressions': 'impressions', 'Amount Spent' : 'spend', 'Average CPC': 'cpc', 'CTR': 'ctr', 'CPP': 'cpp', 'CPM': 'cpm', 'Reach': 'reach'};
        arr_metrics[8] = {'Likes' : 'likes','Reach' : 'reach','Engaged Users' : 'engageduser'};
        arr_metrics[9] = {'Calls' : 'calls','Answered' : 'answered','Missed' : 'missed'};
        arr_metrics[11] = {'Clicks': "clicks", 'Impressions': "impressions", 'CTR': "ctr", 'CPM': "cpm", 'CPC': "cpc", 'CPA': "cpm", 'VTC': "view_through_conversions", 'VTC Rate': "view_through_ratio", 'Conversions': "total_conversions", 'Conv. Rate': "total_conversion_rate", 'Spend': "cost"};


        dashboardID = self.dashboard.id;
        widgets_length = self.dashboard.widgets.length;
        for(j=0; j<widgets_length; j++){
            self.dashboard.widgets[j].linkedCheck = true;
        }
        if((self.startDate) && (self.endDate) && (dashboardID)){
            $http.post("/user/getMetricDatas", {dashboardID: dashboardID, startDate: self.startDate, endDate: self.endDate}).then(function(response) {
            //    console.log(JSON.stringify(response.data));
                var data = 0;
                if (typeof response.data == 'string')
                    data = JSON.parse(response.data);
                else
                    data = response.data;
                for(i=0; i<data.length; i++){
                    for(j=0; j<widgets_length; j++){
                        if(data[i].networkID == self.dashboard.widgets[j].network){
                            widget_fld1 = arr_metrics[data[i].networkID][self.dashboard.widgets[j].metric1];
                            widget_fld2 = arr_metrics[data[i].networkID][self.dashboard.widgets[j].metric2];

                            if(typeof data[i].metricsResult == 'string') { 
                                try {
                                    data[i].metricsResult = JSON.parse(data[i].metricsResult)
                                } catch (e) {
                                    continue;
                                }
                            }

                            if(typeof data[i].metricsResult == 'object') {
                                // metricsResultObj = JSON.parse(data[i].metricsResult);
                                metricsResultObj = data[i].metricsResult;

                                self.dashboard.widgets[j].value1 = " " + numberWithCommas(metricsResultObj[widget_fld1]);
                                self.dashboard.widgets[j].value2 = " " + numberWithCommas(metricsResultObj[widget_fld2]);
                            } else {
                                self.dashboard.widgets[j].value1 = "0";
                                self.dashboard.widgets[j].value2 = "0";
                            }
                            // if (self.compare){
                            //     self.dashboard.widgets[j].value3 = "loading";
                            //     self.dashboard.widgets[j].value4 = "loading";
                            // }
                            self.dashboard.widgets[j].linkedCheck = false;
                        }
                    }
                }
                for(j=0; j<widgets_length; j++){
                    self.dashboard.widgets[j].linked = self.dashboard.widgets[j].linkedCheck;
                }
                self.endLoadData = false;
                $(".loading-metric").removeClass("loading");
            });
            if (self.compare){
                $(".widgetdiffloading").addClass('loading')
                $http.post("/user/getMetricDatas", { forcompare:true, dashboardID: dashboardID, startDate: self.startDate2, endDate: self.endDate2}).then(function(response) {
                    var data = JSON.parse(response.data);
                    for(i=0; i<data.length; i++){
                        for(j=0; j<widgets_length; j++){
                            if(data[i].networkID == self.dashboard.widgets[j].network){
                                widget_fld1 = arr_metrics[data[i].networkID][self.dashboard.widgets[j].metric1];
                                widget_fld2 = arr_metrics[data[i].networkID][self.dashboard.widgets[j].metric2];
                                if(isJson(data[i].metricsResult)) {
                                    metricsResultObj = JSON.parse(data[i].metricsResult);
                                    self.dashboard.widgets[j].value3 = " " + numberWithCommas(metricsResultObj[widget_fld1]);
                                    self.dashboard.widgets[j].value4 = " " + numberWithCommas(metricsResultObj[widget_fld2]);

                                } else {
                                    self.dashboard.widgets[j].value3 = "0";
                                    self.dashboard.widgets[j].value4 = "0";
                                }
                                self.dashboard.widgets[j].linkedCheck = false;
                            }
                        }
                    }
                    for(j=0; j<widgets_length; j++){
                        self.dashboard.widgets[j].linked = self.dashboard.widgets[j].linkedCheck;
                    }

                    $(".widgetdiffloading").removeClass('loading')

                    // self.endLoadData = false;
                    // $(".loading-metric").removeClass("loading");
                });
            }
        }  
    }

    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    function numberWithCommas(x) {
        let num = "";
        let afterdot = "";
        if (x) {
            if (x.toString().indexOf('.') != -1)
                afterdot = x.toString().split('.')[1];
            num = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            
        }
        if (afterdot.length > 4 && num) { 
            return [num.split('.')[0], afterdot.substring(0,3)].join('.')
        }

        if(x) return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        else if (typeof(x) == "undefined") return "0";

        return x;
    }

    // Get Size From size-string Module
    function gridsterSize(sizeString) {

        var size = { x: 1, y: 1 };

        if (sizeString === "m") {
            size.x = 2;
            size.y = 1;
        } else if (sizeString === "l") {
            size.x = 3;
            size.y = 2;
        }

        return size;
    }
});