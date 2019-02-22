/**
 * Dashboard controller
 */
ezondapp.directive('checkoutcard', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            closeModal: '&',
            card: "=",
            formerror2: "=",
            next: "&",
            successfullsecondmodal: '&',
            closesecondmodal: '&'
        },
        link: function ($scope, $mdDialog, $q, $state) {

            // $scope.formerror
            $scope.loading = false;

            $scope.confirm = function () {
                angular.forEach($scope.subscriptioncardform.$error.required, function (field) {
                    field.$setDirty();
                    return "";
                });

                // $scope.subscriptioncardform.

                $scope.loading = true
                if ($scope.subscriptioncardform.$valid) {
                    var promise = $scope.next()
                    promise.then(function (result) {
                        $scope.successfullsecondmodal()

                    }, function (result) {
                        $scope.loading = false
                    })
                }
                else {
                    $scope.formerror2 = "Fill fields marked red"
                }
            }
        },
        template: `<md-dialog class="subscriptionModelForm" style="width: 450px;"> 
                    <md-toolbar layout="row" layout-align="center center" class="md-padding"> 
                      <span class="white-c">Enter card information</span> 
                      <span flex=""></span> 
                      <md-button ng-click="closesecondmodal()" class="md-icon-button">
                        <i class="white-c ion ion-close" ></i>
                      </md-button> 
                    </md-toolbar> 
                    <md-dialog-content class="md-padding"> 
                      <form name="subscriptioncardform" id="subscriptioncardform"> 
                        <div layout="row"> 
                          <div layout="column" class="margin-sm-right"> 
                            <label for="">First Name</label> 
                            <input required type="text" ng-model="card.first_name"> 
                          </div> 
                          <div layout="column"> 
                            <label for="">Last Name</label> 
                            <input required type="text" ng-trim="true" ng-model="card.last_name"> 
                          </div> 
                        </div> 
                        <div layout="column"> 
                          <label for="">Card Number</label> 
                          <input  required type="number" valid-length="16" ng-model="card.number" ng-maxlength="16"  ng-minlength="16" > 
                        </div> 
                        <div layout="row"> 
                          <div layout="column" class="margin-sm-right"> 
                            <label for="">Expiry month</label> 
                            <input valid-length="2" required type="number"  ng-maxlength="2" ng-model="card.expiry_month"> 
                          </div> 
                          <div layout="column"> 
                            <label for="">Expiry year</label> 
                            <input required type="number" ng-trim="true" ng-minlength="4" valid-length="4" ng-maxlength="4" name="year" ng-model="card.expiry_year"> 
                          </div> 
                        </div> 
                        <div layout="row"> 
                          <div layout="column" class="margin-sm-right"> 
                            <label for="">CVV</label> <input required type="number" ng-maxlength="3" valid-length="3" ng-minlength="3" ng-model="card.cvv"> 
                          </div> 
                          <div layout="column"> 
                            <label for="">Card address country</label> 
                            <input required type="text" ng-model="card.billing_country"> 
                          </div> 
                        </div> 
                      </form> 
                    </md-dialog-content> 
                    <md-dialog-actions class="md-padding"> 
                      <span style="color: red; font-size: 15px; font-weight: 700">{{formerror2}}</span> 
                      <span flex="" ng-class="{\'loading\': loading}"></span> 
                      <md-button class="md-raised md-primary" ng-click="confirm()">Next</md-button> 
                    </md-dialog-actions> 
                  </md-dialog>`
    }
});

ezondapp.directive('validLength', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, control) {
            control.$parsers.push(function (viewValue) {
                var lnght = attrs.validLength
                console.log(viewValue)

                if (viewValue != null) {
                    control.$viewValue = viewValue.toString().substr(0, lnght)
                    return viewValue.toString().substr(0, lnght);
                }
                else {
                    control.$viewValue = ''
                    return ''
                }
            });
        }
    };
});