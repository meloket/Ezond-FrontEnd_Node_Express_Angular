/**
 * Ratings controller
 */

ezondapp.controller('datastudioController', function($mdDialog, appDataService, $sce, $scope, $http, $q, userService, ratinggroupProviders, dashboardService, integrationProviders, integrationsService, integrationService, $filter) {


    // If not logged in
    if ( !userService.user ) return;

    $scope.backendUrl = appDataService.appData.backendUrl;

    $scope.showdocument = false

    $scope.ratingsInfo = ratinggroupProviders.ratingsInfo;
        

    $scope.bindAccountInfoFilling = function (integrationsfrom={}) {
        
        $scope.connectionInfo = dashboardService.dashboard.integrations;
        $scope.bindAccountInfo = [];
        for(i = 0; i < $scope.connectionInfo.length; i++) {
            if($scope.connectionInfo[i].networkID == 10)
                $scope.bindAccountInfo.push($scope.connectionInfo[i]);
        }
    }

    $scope.bindAccountInfoFilling()

        // for(i = 0; i < $scope.connectionInfo.length; i++) {
        //     if($scope.connectionInfo[i].networkID == 10){
        //         $scope.bindAccountInfo.push($scope.connectionInfo[i]);
        //     }
        // }

    $scope.urllink = ''

    $scope.hidedocument = function (argument) {
        $scope.showdocument = false
    }

    $scope.changeurl = function (url) {
        $scope.showdocument = true
        $scope.urllink = ''
        if (url.indexOf('embed') == -1){
            url = url.replace('reporting', 'embed/reporting')
        }
        $scope.urllink = $sce.trustAsResourceUrl(url)
    }

    $scope.addnewsource = function () {
        $mdDialog.show({
            locals: {
                backendUrl: $scope.backendUrl
            },
            multiple: true,
            controller: ['$scope', '$mdDialog', 'backendUrl', function ($scope, $mdDialog, backendUrl) {
                
                $scope.backendUrl = backendUrl

                $scope.hide = function () {
                    $mdDialog.hide()
                };
                $scope.cancel = function () {
                    $mdDialog.cancel()
                };

                $scope.saveurl = function () {
                    if ($scope.docname=='' || $scope.link=='') return
                    $scope.inprog = true

                    var body = "id=10" + "&userid=" + userService.user.id + "&campID=" + dashboardService.dashboard.id + "&api_key=" + $scope.link + "&docname=" + $scope.docname
                    var objXhr = new XMLHttpRequest();
                    objXhr.addEventListener("load", function () {
                        $scope.inprog = false
                        $mdDialog.hide()
                    }, false);

                    objXhr.open("POST", "/user/addNetworkAccount", true);
                    objXhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    objXhr.send(body);
                }

            }],
            parent: angular.element(document.body),
            disableParentScroll: true,
            clickOutsideToClose: true,
            template:
                `<md-dialog style="height:auto;" ng-class="{'loader': inprog}"> 
                    <md-toolbar layout="row" layout-align="start center" class="md-padding"> 
                        DATA STUDIO REPORTS
                    </md-toolbar> 
                    <md-dialog-content  class="md-padding" layout="column" style="width: 600px;"> 
                        <div layout="row">
                            <label class="md-subhead bold" for="">Data Studio Embed Link</label>
                            <span flex=""></span>
                            <a href="">How to find this link</a>
                        </div>
                        <input ng-model="link" style="border-radius: 70px;" class="headtags" type="text" />

                        <label class="md-subhead bold" for="">Report Name</label>
                        <input ng-model="docname" style="border-radius: 70px;" class="headtags" type="text" />
                    </md-dialog-content> 
                    <md-dialog-actions class="md-padding">
                        <div style="font-weight: bold; border-width: 2px;border-color: blue;color:blue;" ng-click="saveurl()" class="headtags curs-pointer">
                            Save
                        </div>
                    </md-dialog-actions>
                </md-dialog>`
        }).then(
            function (answer) {
                $scope.loadBindAccountInfo()
            },
            function (answer) {
            }
        )
    }

    $scope.loadBindAccountInfo = function(campaign = {}){
        console.log();
        $http.post("/user/getDashboardBindAccounts", {id: campaign.id ? campaign.id : dashboardService.dashboard.id}).then(function(response) {
            $scope.connectionsloading = false
            $scope.connectionInfo2 = response.data;

            // for(i=0; i<appDataService.integrations.length; i++){
            dashboardService.dashboard.integrations = []
                // integrationsService.removeConnectionInfoRecords(i);
            // }
            for(i=0; i<$scope.connectionInfo2.length; i++){
                sel_obj = $scope.connectionInfo2[i];
                if(sel_obj.id) sel_obj.accountId = sel_obj.id;
                if(sel_obj.account) sel_obj.websiteUrl = sel_obj.account;
                if(sel_obj.viewID) sel_obj.webPropertyId = sel_obj.viewID;
                // console.log($scope.connectionInfo2[i])
                // integrationsService.addConnectionInfoRecords($scope.connectionInfo[i].networkID * 1 - 1, [sel_obj]);
                dashboardService.dashboard.integrations.push($scope.connectionInfo2[i])
                // integrationsService.addActiveRecordIdx($scope.connectionInfo[i].networkID * 1 - 1, 0);
            }
            $scope.bindAccountInfoFilling(integrationsService)

        });
    }

    $scope.editsource = function (link) {
        $mdDialog.show({
            locals: {
                backendUrl: $scope.backendUrl,
                link: link
            },
            multiple: true,
            controller: ['link','$scope', '$mdDialog', 'backendUrl', function (link, $scope, $mdDialog, backendUrl) {
                
                $scope.backendUrl = backendUrl
                $scope.source = link

                $scope.hide = function () {
                    $mdDialog.hide()
                };
                $scope.cancel = function () {
                    $mdDialog.cancel()
                };

                $scope.saveurl = function (source) {
                    if ($scope.source.account=='' || $scope.source.viewID=='') return
                    var body = "id=10" + "&userid=" + userService.user.id + "&campID=" + dashboardService.dashboard.id + "&api_key=" + $scope.source.viewID + "&docname=" + $scope.source.account
                    var objXhr = new XMLHttpRequest();
                    objXhr.addEventListener("load", function () {
                        $scope.hide()
                    }, false);

                    objXhr.open("POST", "/user/addNetworkAccount", true);
                    objXhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    objXhr.send(body);
                }

                $scope.editreport = function (source) {
                    $scope.deletereport(source)
                    $scope.saveurl(source)
                }

                $scope.deletereport = function (source) {
                    $scope.inprog = true
                    var body = "id=" + source.id
                    var objXhr = new XMLHttpRequest();
                    objXhr.addEventListener("load", function () {
                        $scope.hide()
                        $scope.inprog = false
                    }, false);

                    objXhr.open("POST", "/user/deleteNetwork", true);
                    objXhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    objXhr.send(body);
                }

            }],
            parent: angular.element(document.body),
            disableParentScroll: true,
            clickOutsideToClose: true,
            template:
                `<md-dialog style="height:auto;" ng-class="{'loader': inprog}"> 
                    <md-toolbar layout="row" layout-align="start center" class="md-padding"> 
                        DATA STUDIO REPORTS
                    </md-toolbar> 
                    <md-dialog-content  class="md-padding" layout="column" style="width: 600px;"> 
                        <div layout="row">
                            <label class="md-subhead bold" for="">Data Studio Embed Link</label>
                            <span flex=""></span>
                            <a href="">How to find this link</a>
                        </div>
                        <input ng-model="source.viewID" style="border-radius: 70px;" class="headtags" type="text" />

                        <label class="md-subhead bold" for="">Report Name</label>
                        <input ng-model="source.account" style="border-radius: 70px;" class="headtags" type="text" />
                    </md-dialog-content> 
                    <md-dialog-actions class="md-padding">
                        <div ng-click="deletereport(source)" style="font-weight: bold; border-width: 2px;border-color: red;color:red;" class="headtags curs-pointer margin-sm-right">
                            Delete Report
                        </div>
                        <div style="font-weight: bold; border-width: 2px;border-color: blue;color:blue;" ng-click="editreport(source)" class="headtags curs-pointer">
                            Save
                        </div>
                    </md-dialog-actions>
                </md-dialog>`
        }).then(
            function (answer) {
                $scope.loadBindAccountInfo()
            },
            function (answer) {
                
            }
        )
    }
   
});