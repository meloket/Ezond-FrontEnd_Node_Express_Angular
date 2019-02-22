/**
 * Global controller for whole app
 * Handles popups
 */
ezondapp.controller('clienthomeController', function($scope, $http, userService, $mdDialog, dashboardService, $rootScope) {
    $scope.formsList = [];
    $scope.state = 'campaigns';

    $scope.user_fullname = userService.user.first_name + " " + userService.user.last_name;
    $scope.userdashboards = userService.user.dashboards;

    $scope.agency_fullname = userService.user.first_name + " " + userService.user.last_name;
    $scope.agency_name = '';


    $scope.owner_id = userService.user.agencyID ? userService.user.agencyID : userService.user.id;
    $scope.user_id = userService.user.id;

    $scope.showform = function (form) {
        $scope.state = 'showform';
        $scope.showingform = JSON.parse(form.form_fields);
    }

    $scope.selectcampaign = function (campaign) {
        $rootScope.showsidebar = true;
        $rootScope.customheight = '109px';
        dashboardService.getDashboard(campaign.id)
        // $scope.$parent.changeCampaign(campaign)
        // angular.element('.expreminderHead').scope().changeCampaign(campaign)
    }

    $scope.getAgencyInfo = function () {

        $http.get('/user/getAgency?id=' + userService.user.agencyID).then(function (response) {
            // console.log(response)
            $scope.agency_info = response.data
            $scope.agency_name = $scope.agency_info.company
        })
    }

    $scope.getAgencyInfo()

    $scope.changestate = function (state) {
        $scope.state = state;
    }

    // New form
    $scope.addnewform = function () {
      // $scope.addformstate = true;
        $mdDialog.show({
            locals: {
            },
            multiple: true,
            controller: ['$scope', '$mdDialog', function ($scope, $mdDialog) {
                
                $scope.hide = function (servicename) {
                    $mdDialog.hide(servicename)
                };
                $scope.cancel = function () {
                    $mdDialog.cancel()
                };

                $scope.saveservicename = function () {
                  $scope.hide($scope.servicename)
                }

            }],
            parent: angular.element(document.body),
            disableParentScroll: true,
            clickOutsideToClose: true,
            template:
                `<md-dialog style="height:auto;" ng-class="{'loader': inprog}"> 
                    <md-toolbar layout="row" layout-align="start center" class="md-padding"> 
                        Add Ezond Service
                    </md-toolbar> 
                    <md-dialog-content  class="md-padding" layout="column" style="width: 600px;"> 
                        <div layout="row">
                            <label class="md-subhead bold" for="">Service name</label>
                            <span flex=""></span>
                        </div>
                        <input ng-model="servicename" style="border-radius: 70px;" class="headtags" type="text" />

                        <!-- <label class="md-subhead bold" for=""></label>
                        <input ng-model="docname" style="border-radius: 70px;" class="headtags" type="text" /> -->
                    </md-dialog-content> 
                    <md-dialog-actions class="md-padding">
                        <div style="font-weight: bold; border-width: 2px;border-color: blue;color:blue;" ng-click="saveservicename()" class="headtags curs-pointer">
                            Save
                        </div>
                    </md-dialog-actions>
                </md-dialog>`
        }).then(
            function (servicename) {
                $scope.newservicename = servicename;
                $scope.state = 'addformstate';
            },
            function (answer) {
            }
        )
    }

    $scope.extractformname = function (form) {
      if (!form) return
      return JSON.parse(form.form_fields).name
    }

    $scope.gotolist = function () {
      $scope.state = "listforms";
    }

    $scope.extractform = function (form) {
      if (!form) return
      return JSON.parse(form.form_fields)
    }

    $scope.saveNewForm = function () {
        $scope.saveform = $scope.defaultform;
        $scope.saveform.name = $scope.newservicename;
        $http.post('/user/saveAgencyForm', {form: JSON.stringify($scope.saveform), agency_id: $scope.owner_id}, function (response) {
            $scope.state = 'listforms';
            $scope.getFormsList()
            // $scope.$apply()
        })
    }

    $scope.getFormsList = function () {
        $http.get('/user/getAgencyForms?agency_id=' + $scope.owner_id).then( function (response) {
            // $scope.formsList = JSON.parse(response.data.forms);
            $scope.formsList = response.data.forms;
        })
    }

    $scope.defaultform = {
      components: [],
      display: 'form'
    };

    $scope.getFormsList();

});
