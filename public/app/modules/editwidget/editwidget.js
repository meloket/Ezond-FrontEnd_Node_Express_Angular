/**
 * Add widget directive
 */
ezondapp.directive('editWidget', function(widgetgroupProviders, widgetsService, dashboardService, $mdDialog) {

    return {
        restrict: 'E',
        scope: {},
        replace: true,
        link: function($scope, elem, atts) {

            $scope.showPopup = $scope.$parent.showPopup;            
            
            initWidget();



            $scope.$on('editWidget1', function(e, details) {
                // return;
                var widget = details;

                $scope.widget = details;
                $scope.metric1 = widget.metric1;

                $scope.metric2 = widget.metric2;
                for(x in widgetgroupProviders.providers){
                    if(widgetgroupProviders.providers[x].id == widget.network){
                        $scope.metrics = widgetgroupProviders.providers[x].metrics;
                    }
                }
            });

            // Close Edit Widget Window Handler
            $scope.closePopup = function() {

                $scope.$emit('hidePopup', {popup: 'editWidget'});
                initWidget();
            }            

            // Update Widget Information Handler
            $scope.updateWidget = function() {

                var updataData = {};                
                updataData.id = $scope.widget.id;
                updataData.metric1 = $scope.metric1;
                updataData.metric2 = $scope.metric2;                

                widgetsService.updateWidget(updataData)
                .then(function() {

                    $scope.$emit('hidePopup', {popup: 'editWidget'});
                    initWidget();
                });
            }

            // Delete Widget Information Handler
            $scope.deleteWidget = function() {

                var widgetId = $scope.widget.id;                
                
                widgetsService.deleteWidget(widgetId)
                .then(function() {

                    $scope.$emit('hidePopup', {popup: 'editWidget'});
                    initWidget();
                });
            }

            // Temporary Module if needed
            $scope.selectMetric = function(value) {
            }

            // Initialization Module
            function initWidget() {               
                
                $scope.dlgTitle = 'Edit Widget';                
            }

        },
        // templateUrl: '/app/modules/editwidget/editwidget.html'
        templateUrl: '/app/modules/editwidget/editwidget2.html'
        // template: '<md-dialog ng-show="showPopup[\'editWidget\']" style="opacity: 1; "> <md-toolbar layout="row" layout-align="start center" class="md-padding"> <span class="white-c">{{dlgTitle}}</span> <span flex=""></span> <md-button ng-click="dni">SKAJD</md-button> <md-button class="md-icon-button" ng-click="closeDialog()"> <i class="ion-close white-c"></i> </md-button> </md-toolbar> <md-dialog-content style="width:400px; padding-top: 30px"  class="md-padding"> <label>Metrics</label> <select class="form-control" ng-model = \'metric1\' ng-change="selectMetric(metric1)"> <option ng-repeat="metric in metrics" value="{{metric}}">{{metric}}</option> </select> <select class="form-control margin-top" ng-model = \'metric2\'> <option ng-repeat="metric in metrics" value="{{metric}}">{{metric}}</option> </select> </md-dialog-content> <md-dialog-actions class="md-padding" style="padding-top: 0px" layout="row" layout-align="center"> <md-button class="md-raised md-primary" ng-click="updateWidget();closeDialog()">Save Settings</md-button> <span flex=""></span> <md-button class="md-raised md-primary" ng-click="deleteWidget();closeDialog()">Remove Widget</md-button> </md-dialog-actions> </md-dialog>'
    }
});