/**
 * Users controller
 */
ezondapp.controller('alertsController', function($scope, userService, campid, appDataService) {
    $scope.backendUrl = appDataService.appData.backendUrl;
    $scope.notifications = userService.notifications;
    $scope.user_id = userService.user.id;
    $scope.fullfilter = ''
    $scope.searchkey = '';
    $scope.campaigns = userService.user.dashboards
    $scope.filtredDashboard = ""

    $scope.campaignfilter = function (item) {
        return $scope.filtredDashboard == '' || item.campaign.indexOf($scope.filtredDashboard) != -1;
    }

    $scope.changeCampaign = function (camp) {
        console.log(camp)
        $scope.filtredDashboard = camp.company_name;
    }

    if (campid != -1) {
        $scope.campaigns.forEach(function (camp) {
            if (camp.id == campid){
                $scope.changeCampaign(camp)
            }
        })
    }

    $scope.expandable = []
    $scope.taskadded = []
    $scope.taskaddingprocess = []

    $scope.toggleexp = function (index) {
        $scope.expandable[index] = !($scope.expandable[index])
    }
    
    $scope.clearNoticeInfo = function (noticeIdx) {
        // $(".show-pop-notifications").webuiPopover('hideAll');
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                $scope.getUserNotifications();
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/clearUserNoitceInfo.php?user_id=" + $scope.user_id + "&noticeIdx=" + noticeIdx);
        objXhr.send(data);
    }

    $scope.postnewtask = function (notice, listindex) {


        if ($scope.taskaddingprocess[listindex] || $scope.taskadded[listindex]) return
            
        $scope.taskaddingprocess[listindex] = true
        

        setTimeout(function () {
            $scope.taskaddingprocess[listindex] = false
            $scope.taskadded[listindex] = true
            $scope.$apply()
        }, 330)

        var data = new FormData();
        data.append('actionDetail', "Check" + notice.noticeContent);
        data.append('taskOrder', 999);
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // $scope.taskaddingprocess[listindex] = false
                //$scope.refreshUserActivities();
            }
        };

        objXhr.open("POST", $scope.backendUrl + "apis/createNewTask.php?dashboardId=" + notice.dashboardId + "&user_id=" + $scope.user_id);
        objXhr.send(data);
    }

    $scope.getUserNotifications = function () {
        if ($scope.checkNotice) return;
        $scope.checkNotice = true;
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);
                console.log(retObj)
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