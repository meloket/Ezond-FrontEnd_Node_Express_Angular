/**
 * Dashboard controller
 */
ezondapp.controller('intelController', function($scope, $http, $q, userService, $state, dashboardService, appDataService) {
    // If not logged in
    if ( !userService.user ) return;

    $scope.widget_item01 = {};
    $scope.widget_item02 = {};
    $scope.widget_item03 = {};
    $scope.widget_item04 = {};
    $scope.widget_item05 = {};
    $scope.widget_item06 = {};
    $scope.widget_item07 = {};
    $scope.widget_item08 = {};
    $scope.widget_item09 = {};
    $scope.widget_item10 = {};
    $scope.widget_item11 = {};
    $scope.widget_item12 = {};

    $scope.resize_item = function(widget, rowX, rowY, sizeX, sizeY){
        widget.rowX = rowX;
        widget.rowY = rowY;
        widget.sizeX = sizeX;
        widget.sizeY = sizeY;
    }

    $scope.resize_item($scope.widget_item01, 0, 0, 2, 5);
    $scope.resize_item($scope.widget_item02, 2, 0, 2, 5);
    $scope.resize_item($scope.widget_item03, 4, 0, 2, 5);
    // $scope.resize_item($scope.widget_item04, 0, 5, 3, 7); 
    $scope.resize_item($scope.widget_item05, 0, 5, 3, 7);
    // $scope.resize_item($scope.widget_item06, 0, 12, 3, 6);
    $scope.resize_item($scope.widget_item07, 3, 5, 3, 7);
    $scope.resize_item($scope.widget_item08, 0, 12, 3, 5);
    $scope.resize_item($scope.widget_item09, 3, 12, 3, 5);
    $scope.resize_item($scope.widget_item10, 0, 17, 4, 5);
    $scope.resize_item($scope.widget_item11, 4, 17, 2, 5);
    $scope.resize_item($scope.widget_item12, 0, 22, 6, 3);

    var desktopPageSpeed = new Gauge({
        renderTo  : 'desktopPageSpeed',
        width     : 250,
        height    : 250,
        glow      : true,
        units     : 'Speed',
        title       : 'Desktop',
        minValue    : 0,
        maxValue    : 100,
        majorTicks  : ['0','20','40','60','80','100'],
        minorTicks  : 5,
        strokeTicks : true,
        valueFormat : {
            int : 2,
            dec : 0,
            text : '%'
        },
        valueBox: {
            rectStart: '#888',
            rectEnd: '#666',
            background: '#CFCFCF'
        },
        valueText: {
            foreground: '#CFCFCF'
        },
        highlights : [{
            from  : 0,
            to    : 40,
            color : '#EFEFEF'
        },{
            from  : 40,
            to    : 60,
            color : 'LightSalmon'
        }, {
            from  : 60,
            to    : 80,
            color : 'Khaki'
        }, {
            from  : 80,
            to    : 100,
            color : 'PaleGreen'
        }],
        animation : {
            delay : 10,
            duration: 300,
            fn : 'bounce'
        }
    });

    var mobilePageSpeed = new Gauge({
        renderTo  : 'mobilePageSpeed',
        width     : 250,
        height    : 250,
        glow      : true,
        units     : 'Speed',
        title       : 'Mobile',
        minValue    : 0,
        maxValue    : 100,
        majorTicks  : ['0','20','40','60','80','100'],
        minorTicks  : 5,
        strokeTicks : true,
        valueFormat : {
            int : 2,
            dec : 0,
            text : '%'
        },
        valueBox: {
            rectStart: '#888',
            rectEnd: '#666',
            background: '#CFCFCF'
        },
        valueText: {
            foreground: '#CFCFCF'
        },
        highlights : [{
            from  : 0,
            to    : 40,
            color : '#EFEFEF'
        },{
            from  : 40,
            to    : 60,
            color : 'LightSalmon'
        }, {
            from  : 60,
            to    : 80,
            color : 'Khaki'
        }, {
            from  : 80,
            to    : 100,
            color : 'PaleGreen'
        }],
        animation : {
            delay : 10,
            duration: 300,
            fn : 'bounce'
        }
    });

    $scope.get_icon_status = function(__status_num){
        if(__status_num == 1)
            return "icon-intel-info-no";
        else if(__status_num == 2)
            return "icon-intel-warning";
        return "icon-intel-info-ok";
    }
   
    $scope.initIntelPage = function(){
        console.log("Intelligent Page Loaded");

        $scope.ssl_info = { 
                            "server_address": "", "server_status": 0,
                            "cert_correctness": "", "cert_status": 0,
                            "cert_expiration": "", "cert_expire_status": 0,
                            "cert_host_correctness": "", "cert_host_status": 0,
                        };

        $scope.essential_info = {
                            "sitemap_info": "", "sitemap_status": 0,
                            "safe_info": "", "safe_status": 0,
                            "load_info": "", "load_status": 0,
                            "analytics_info": "", "analytics_status": 0,
                            "console_info": "", "console_status": 0,
                        };

        $scope.site_keywords = [ ];

        $scope.keywords_rank = {
                            "report_date": "",
                            "keywords": []
                        };

        $scope.mobile = {
                            "phone_screen" : "",
                            "tablet_screen" : "",
                            "mobile_info": "",
                            "mobile_status": 0,
                        };

        $scope.competitors = [ ];

        $scope.page_speed = {
                            "site": "",
                            "site_score": "",
                            "site_status": 0,
                            "desktop": 0,
                            "mobile": 0,
                            "page_size": "0",
                            "page_size_status": 0,
                            "load_time": "0",
                            "load_time_status": 0,
                        };

        $scope.privacy = {
                            "email_info": "",
                            "email_status": 0,
                            "safe_info": "",
                            "safe_status": 0,
                            "privacy_status": 0,
                        };

        $scope.social = {
                            "facebook": 0,
                            "google": 0,
                            "stumble": 0,
                            "linkedin": 0,
                            "social_status": 0,
                        };

        $scope.technology = {
                            "encoding_info": "",
                            "encoding_status": 0,
                            "doctype_info": "",
                            "doctype_status": 0,
                            "w3c_info": "",
                            "w3c_status": 0,
                        };

        $scope.linksto = {
                            "total": 0,
                            "links": [ ],
                            "contents": [ ],
                        };

        $scope.link_analysis = {
                            "inpage_status": 0,
                            "broken_status": 0,
                            "links": [ ],
                            "broken_links": [ ],
                        };
        $scope.isMore = {
                        "inpage" : false,
                        "broken" : false,
                        "links" : false,
                        "contents" : false,
                        "inpage_limit" : 4,
                        "broken_limit" : 4,
                        "links_limit" : 4,
                        "contents_limit" : 4,
                    }

        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);
                if(retObj.error == 0){
                    $scope.ssl_info = retObj.ssl_info;
                    $scope.essential_info = retObj.essential_info;
                    $scope.site_keywords = retObj.site_keywords;
                    $scope.keywords_rank = retObj.keywords_rank;
                    $scope.mobile = retObj.mobile;
                    $scope.competitors = retObj.competitors;
                    $scope.page_speed = retObj.page_speed;
                    $scope.privacy = retObj.privacy;
                    $scope.social = retObj.social;
                    $scope.technology = retObj.technology;
                    $scope.linksto = retObj.linksto;
                    $scope.link_analysis = retObj.link_analysis;
     
                    if($scope.link_analysis.links.length > 5) $scope.isMore.inpage = true;
                    if($scope.link_analysis.broken_links.length > 5) $scope.isMore.broken = true;
                    if($scope.linksto.links.length > 5) $scope.isMore.links = true;
                    if($scope.linksto.contents.length > 5) $scope.isMore.contents = true;

                    desktopPageSpeed.onready = function() {
                        desktopPageSpeed.setValue($scope.page_speed.desktop);
                    };

                    mobilePageSpeed.onready = function() {
                        mobilePageSpeed.setValue($scope.page_speed.mobile);
                    };
                    desktopPageSpeed.draw();
                    mobilePageSpeed.draw();

                    setTimeout(function(){
                        $scope.$apply();
                    }, 100);
                }

            }
        };
        objXhr.open("POST", appDataService.appData.backendUrl + "site_check/get_intel_info.php?idx=" + dashboardService.dashboard.id);
        objXhr.send(data);

    }
   
    $scope.initIntelPage();

});