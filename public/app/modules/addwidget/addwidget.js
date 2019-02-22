/**
 * Add widget directive
 */
ezondapp.directive('addWidget', function(widgetgroupProviders, widgetsService, dashboardService, userService, $mdDialog) {

    return {
        restrict: 'E',
        scope: {},
        replace: true,

        link: function($scope, elem, atts) {

            $scope.showPopup = $scope.$parent.showPopup;            
            $scope.widgetGroups = [];
            if (typeof userService.user.providers_allowed != 'undefined'){
                for(i=0; i<widgetgroupProviders.providers.length; i++){
                    if(userService.user.providers_allowed.indexOf(widgetgroupProviders.providers[i].id) != -1){
                        $scope.widgetGroups.push(widgetgroupProviders.providers[i]);
                    }
                }
            } else {
                $scope.widgetGroups = widgetgroupProviders.providers;
            }
            //$scope.widgetGroups = widgetgroupProviders.providers;

            initWidget();

            // Close Add Widget Window
            $scope.closePopup = function() {

                $scope.$emit('hidePopup', {popup: 'addWidget'});
                initWidget();
            }

            // Select Widget Handler
            $scope.selectWidget = function(widget) {

                $scope.selectedWidget = widget;
            }

            // Select Widget Group Handler
            $scope.selectWidgetGroup = function(widgetGroup) {
                
                $scope.selectedWidgetGroup = widgetGroup;
			}

            // CheckBox checked When Select Network Handler
            $scope.selectNetwork = function(index) {

                $(".widgetGroupCheck").eq(index).children("div").children("input").prop("checked", true);
            }

            // Add Widget to Dashboard Handler
            $scope.addWidgetToDashboard = function() {

                var newWidget = {};

                newWidget.metric1 = $scope.selectedMetric1;
                newWidget.metric2 = $scope.selectedMetric2;

                newWidget.dashboardID = dashboardService.dashboard.id;

                newWidget.view = 1;
                newWidget.size = 's';
                newWidget.network = $scope.selectedWidgetGroup.id;
                newWidget.networkname = $scope.selectedWidgetGroup.name;
                newWidget.networklogo = $scope.selectedWidgetGroup.logo;

                widgetsService.addWidget(newWidget)
                .then(function() {
                    $(".widgetGroupCheck div input").prop("checked", false);
                    $scope.$emit('hidePopup', {popup: 'addWidget'});
                    initWidget();
                });
            }

            // Go To Widget Edit Window Handler
            $scope.goToWidgetChoices = function() {

                if ( $scope.selectedWidgetGroup != null )  {
                    $scope.metrics = $scope.selectedWidgetGroup.metrics;
                    $scope.selectedMetric1 = $scope.metrics[0];
                    $scope.selectedMetric2 = $scope.metrics[1];
                    $scope.step = 'choose-widget';
                    $scope.dlgTitle = 'Edit Widget';
                }
            }

            // Temporary Handler if needed
            $scope.selectMetric = function(value) {

            }

            $scope.closeDialog = function() {
                $mdDialog.hide()
            }
            // Initialize Widget Window Module
            function initWidget() {

                $scope.step = 'choose-group';
                $scope.selectedWidget = null;
                $scope.selectedWidgetGroup = null;
                $scope.dlgTitle = 'Add Widget';
                $scope.selectedMetric1 = '';
                $scope.selectedMetric2 = '';
            }
        },
        // templateUrl: '/app/modules/addwidget/addwidget.html'
        template: `<md-dialog> 
                    <md-toolbar layout="row" layout-align="start center" class="md-padding"> 
                        <span class="white-c">{{dlgTitle}}</span> 
                        <span flex=""></span> 
                        <md-button class="md-icon-button" ng-click="closeDialog()"> <i class="ion-close white-c"></i> </md-button> 
                    </md-toolbar> 
                    <md-dialog-content ng-show="step == \'choose-group\'" style="width:400px; padding-top: 30px" class="md-padding" layout="column"> 
                        <md-radio-group> 
                            <md-radio-button  class="margin-left" ng-value="$index" layout="row" ng-click="selectWidgetGroup(widgetGroup);selectNetwork($index)" ng-repeat="widgetGroup in widgetGroups track by $index"  ng-class="{active: selectedWidgetGroup == widgetGroup}"> 
                                <span layout="row" layout-align="center center"> 
                                    <img width="32" height="32" class="margin-left margin-right" ng-src="{{::widgetGroup.logo}}"> 
                                    <span style="text-align: right;" class="margin-left margin-right">{{::widgetGroup.name}}</span> 
                                </span> 
                            </md-radio-button> 
                        </md-radio-group> 
                        <md-divider></md-divider> 
                    </md-dialog-content> 
                    <md-dialog-content style="width:400px; padding-top: 30px"  class="md-padding" ng-show="step == \'choose-widget\'"> 
                        <label>Metrics</label> 
                        <select class="form-control" ng-model=\'selectedMetric1\' ng-change="selectMetric(selectedMetric1)"> 
                            <option ng-repeat="metric in metrics" value="{{metric}}">{{metric}}</option> 
                        </select> 
                        <select class="form-control margin-top" ng-model=\'selectedMetric2\'> 
                            <option ng-repeat="metric in metrics" value="{{metric}}">{{metric}}</option> 
                        </select> 
                    </md-dialog-content> 
                    <md-dialog-actions class="md-padding" style="padding-top: 0px" layout="row" layout-align="center"> 
                        <md-button ng-show="step == \'choose-group\'" class="md-raised md-primary" ng-click="goToWidgetChoices()">Add widget</md-button> 
                        <md-button ng-show="step == \'choose-widget\'" class="md-raised md-primary" ng-click="addWidgetToDashboard();closeDialog()">Save widget</md-button> 
                    </md-dialog-actions> 
                  </md-dialog>`
    }
});