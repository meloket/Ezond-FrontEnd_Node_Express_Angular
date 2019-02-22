/**
 * Users controller
 */
ezondapp.controller('messagesController', function($scope, userService, appDataService) {

    $scope.backendUrl = appDataService.appData.backendUrl;
    $scope.searchkey = '';

    $scope.campaigns = userService.user.dashboards

    $scope.filtredDashboard = ""

    $scope.taskMarkView = function (item) {
        let newstring = item.actionContent.replace('Mark','').replace('Incomplete', '').replace('Complete', '')
        return item.userName + " completed the Task: " + newstring
    }

    $scope.campaignfilter = function (item) {
        return $scope.filtredDashboard == '' || item.dashboard.indexOf($scope.filtredDashboard) != -1;
    }

    $scope.changeCampaign = function (camp) {
        $scope.filtredDashboard = camp.company_name;
    }

    $scope.notifications = userService.notifications;

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

    $scope.getUserActivities = function () {
        if ($scope.pendingGetUserAction || !$scope.showActivities) {
            return false;
        }
        $scope.pendingGetUserAction = true;
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);

                if (retObj.actions.length > 0) {
                    if ($scope.actionTime == "") {
                        $scope.actionTime = retObj.actions[0].actionTime;
                    }
                    if ($scope.page_id == 0) {
                        $scope.activities = retObj.actions;
                    } else {
                        $scope.activities = $scope.activities.concat(retObj.actions);
                    }
                    $scope.pageMore = false;
                    if (retObj.isMore == 1) {
                        $scope.page_id++;
                        $scope.pageMore = true;
                    }
                    $scope.$apply();
                }
                $scope.pendingGetUserAction = false;
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getUserActions.php?user_id=" + $scope.user_id + "&page_id=" + $scope.page_id);
        objXhr.send(data);
    }

    $scope.getUserActivities();

    $scope.getUserNotifications();

});