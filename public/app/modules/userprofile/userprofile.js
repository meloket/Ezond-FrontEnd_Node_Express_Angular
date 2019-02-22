/**
 * Create Staff directive
 */
ezondapp.directive('userprofile', function (subscriptionPlansProviders, ratinggroupProviders, $http, userService, $state, appDataService, $q, $window, fileUploadService, $localStorage, $sessionStorage) {

    return {
        restrict: 'E',
        replace: true,
        scope: {},
        link: function ($scope, element, atts) {
            $scope.backendUrl = appDataService.appData.backendUrl;
            $scope.showPopup = $scope.$parent.showPopup;
            $scope.user = userService.user;
            $scope.ownerCheck = (typeof userService.user.role == "undefined");
            $scope.profile_step = 'my_profile';
            $scope.timereport = new Date().toString().replace(/ /g, "");
            $scope.preview = 0;
            $scope.agencyPreview = 0;
            $scope.planTermEnd = '';


            $scope.fileNameChanged = function (file) {
                $(".profile.field").addClass("loading");
                $scope.uploadFiles(file.files[0]);
            }

            $scope.fileNameChanged2 = function (file) {
                $(".profile.field").addClass("loading");
                $scope.uploadAgencyFiles(file.files[0]);
            }

            $scope.blurDomain = function () {
                if ($scope.superDomainName = '')
                    $scope.changeDomain = false
            }

            $scope.managesubscription = function () {
                $scope.closePopup()
                $state.go('app.controlpanel.pleasesubscribe')
            }

            $scope.hideButton = false

            $scope.plans = subscriptionPlansProviders.plans
            $scope.classForLoadingPlans = false

            if (appDataService.appData)
                $scope.currentPlan = appDataService.appData.user.planSubscribed;

            $scope.canSuperDomain = false

            $scope.planName = function () {
                if ($scope.plans.find(function (plan) {
                        return plan.id == $scope.currentPlan
                    }))
                    return $scope.plans.find(function (plan) {
                        return plan.id == $scope.currentPlan
                    }).name
            }

            function getExpireTime() {
                $http({
                    method: "POST",
                    url: "/getTermEnd",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    var date = new Date(response.data * 1000);
                    var day = date.getDate();
                    var monthIndex = date.getMonth() + 1;
                    var year = date.getFullYear();
                    $scope.planTermEnd = moment.unix(response.data).format("D MMMM YYYY")
                })
            }

            getExpireTime();


            $scope.closePopup = function () {
                $scope.removeTempFile();
                $scope.timereport = new Date().toString().replace(/ /g, "");
                $scope.preview = 0;
                $scope.agencyPreview = 0;
                $scope.profile_step = 'my_profile';
                $scope.$emit('hidePopup', {popup: 'userprofile'});
            }

            $scope.changeDomain = function () {
                if ($("#domainName").prop("value").indexOf("ezond.com") == -1)
                    $scope.showHint = true
                else
                    $scope.showHint = false

                if ($("#domainName").prop("value").search(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/) == -1)
                    $scope.errordomain = true
                else
                    $scope.errordomain = false

            }


            $scope.saveProfile = function () {
                if ($("#first_name").prop("value") == "") {
                    $("#first_name").focus();
                    return false;
                }
                if ($("#last_name").prop("value") == "") {
                    $("#last_name").focus();
                    return false;
                }
                if ($("#email").prop("value") == "") {
                    $("#email").focus();
                    return false;
                }
                if ($("#password").prop("value") != $("#confirmPassword").prop("value")) {
                    $("#password").prop("value", "");
                    $("#confirmPassword").prop("value", "");
                    $("#password").focus();
                    return false;
                }
                if ($("#adminPassword").prop("value") != $("#confirmAdminPassword").prop("value")) {
                    $("#adminPassword").prop("value", "");
                    $("#confirmAdminPassword").prop("value", "");
                    $("#adminPassword").focus();
                    return false;
                }
                var staff = angular.copy($scope.user);

                staff.first_name = $("#first_name").prop("value");
                staff.last_name = $("#last_name").prop("value");
                staff.email = $("#email").prop("value");
                staff.password = $("#password").prop("value");


                staff.domainName = $("#domainName").prop("value");

                staff.adminEmail = $("#adminEmail").prop("value");
                staff.adminPassword = $("#adminPassword").prop("value");

                $scope.saveToDefaultFile();

                userService.updateProfile(staff).$promise
                .then(function (response) {
                    if (response.status) {
                        userService.user.first_name = staff.first_name;
                        userService.user.last_name = staff.last_name;
                        userService.user.email = staff.email;
                        userService.user.domainName = staff.domainName;
                        userService.user.adminPassword = staff.adminPassword;
                        $scope.$emit('hidePopup', {popup: 'userprofile'});
                        $scope.$parent.$broadcast('refreshProfile', {});
                    }
                });

            }

            $scope.openFile = function () {
                $("#photo_file").click();
            }

            $scope.openAgencyFile = function () {
                $("#agency_photo_file").click();
            }


            $scope.userphoto = function () {
                var file = event.target.files[0];
                $(".profile.field").addClass("loading");
                $scope.uploadFiles(file);
            }

            // NOW UPLOAD THE FILES.
            $scope.uploadFiles = function (file) {
                //FILL FormData WITH FILE DETAILS.
                var data = new FormData();

                data.append("uploadedFile", file);

                // ADD LISTENERS.
                var objXhr = new XMLHttpRequest();
                objXhr.addEventListener("load", transferComplete, false);

                // SEND FILE DETAILS TO THE API.
                objXhr.open("POST", $scope.backendUrl + "apis/uploadPhoto.php?user_id=" + $scope.user.id);
                objXhr.send(data);
            }

            // CONFIRMATION.
            function transferComplete(e) {
                $(".profile.field").removeClass("loading");
                $scope.timereport = new Date().toString().replace(/ /g, "");
                $scope.preview = 1;
                $scope.$apply();
            }

            // NOW UPLOAD THE FILES.
            $scope.uploadAgencyFiles = function (file) {

                //FILL FormData WITH FILE DETAILS.
                var data = new FormData();

                data.append("uploadedFile", file);

                // ADD LISTENERS.
                var objXhr = new XMLHttpRequest();
                objXhr.addEventListener("load", transferAgencyComplete, false);

                // SEND FILE DETAILS TO THE API.
                objXhr.open("POST", $scope.backendUrl + "apis/uploadAgencyPhoto.php?user_id=" + $scope.user.id);
                objXhr.send(data);
            }

            // CONFIRMATION.
            function transferAgencyComplete(e) {
                $(".profile.field").removeClass("loading");
                $scope.timereport = new Date().toString().replace(/ /g, "");
                $scope.agencyPreview = 1;
                $scope.$apply();
            }

            // NOW UPLOAD THE FILES.
            $scope.saveToDefaultFile = function () {

                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.addEventListener("load", transferComplete2, false);

                objXhr.open("POST", $scope.backendUrl + "apis/changeToDefaultPhoto.php?user_id=" + $scope.user.id);
                objXhr.send(data);
            }

            // CONFIRMATION.
            function transferComplete2(e) {
                $scope.timereport = new Date().toString().replace(/ /g, "");
                $scope.preview = 0;
                $scope.agencyPreview = 0;
                $scope.profile_step = 'my_profile';
                userService.timereport = $scope.timereport;
                $scope.$parent.$broadcast('refreshProfilePhoto', {});
                $scope.$apply();
            }

            // NOW UPLOAD THE FILES.
            $scope.removeTempFile = function () {

                var data = new FormData();
                var objXhr = new XMLHttpRequest();

                objXhr.open("POST", $scope.backendUrl + "apis/removeTemporaryPhoto.php?user_id=" + $scope.user.id);
                objXhr.send(data);
            }

            $scope.removeTempFile();
        },
        templateUrl: '/app/modules/userprofile/userprofile.html'
    }
});
