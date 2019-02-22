/**
 * Users controller
 */
ezondapp.controller('settingsController', function($scope, userService, appDataService) {
    $scope.backendUrl = appDataService.appData.backendUrl;
    $scope.notifications = userService.notifications;

    $scope.searchkey = '';
    $scope.campaigns = userService.user.dashboards

    $scope.filtredDashboard = ""

    $scope.campaignfilter = function (item) {
        return $scope.filtredDashboard == '' || item.dashboard.indexOf($scope.filtredDashboard) != -1;
    }

    $scope.changeCampaign = function (camp) {
        $scope.filtredDashboard = camp.company_name;
    }


    $scope.getUserNotifications = function () {
        if ($scope.checkNotice) return;
        $scope.checkNotice = true;
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);
                $scope.notice_count = retObj.notice_count;
                $scope.notifications = retObj.notifications;

                $scope.quantityAlerts = $scope.notifications.length >= 6 ? 6 : $scope.notifications.length;


                $scope.dash_notis = retObj.dash_notis;
                $scope.checkNotice = false;
                $scope.$apply();

                $scope.regenNoticePop();
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getNotices.php?user_id=" + $scope.user_id + "&page_id=" + $scope.page_id);
        objXhr.send(data);

    }
    $scope.getUserNotifications();

});