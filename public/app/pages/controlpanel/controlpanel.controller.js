/**
 * Control panel controller
 */
ezondapp.controller('controlpanelController', function ($scope, $timeout, $transitions, $cookies, $mdToast, dashboardService, $location, userService, $mdSidenav, appDataService, dashboardService, $state, $rootScope, $localStorage, $sessionStorage, $http, $mdDialog, $window) {

    $scope.backendUrl = appDataService.appData.backendUrl;
    $scope.showShadow = false;
    $scope.user_id = userService.user.id;
    $scope.username = userService.user.first_name + " " + userService.user.last_name;
    if (userService.user.first_name && userService.user.last_name)
        $scope.usernameletters = userService.user.first_name[0] + " " + userService.user.last_name[0]
    $scope.useremail = userService.user.email;
    if (appDataService.appData.user){
        $scope.planSubscribed = appDataService.appData.user.planSubscribed;
        console.log($scope.planSubscribed)
        $scope.campaigns = appDataService.appData.user.dashboards;
    }

    $scope.toggleshowmobilemenu = function () {
        $scope.showmobilemenu = !$scope.showmobilemenu;
    }

    $scope.toggleshowmobilesearch = function () {
        $scope.showmobilesearch = !$scope.showmobilesearch;
    }

    $scope.selectedCampaign = dashboardService.dashboard;
    $scope.showSelectCampaignDlg = false;
    $scope.checkPopEmpty = 0;
    $scope.currentViewstate = appDataService.currentState;
    $scope.timereport = userService.timereport;
    $scope.campaignGroupName = "ALL";
    $scope.isOwner = userService.isOwner();

    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    $scope.sevenanimation = {}

    $scope.show = function (what) {
        $scope.sevenanimation[what] = true
    }

    $scope.hide = function (what) {
        $scope.hidding = true
        $timeout(function () {
            $scope.sevenanimation[what] = false
            $scope.hidding = false
        }, 250)
    }

    $scope.colors = ['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374']

    shuffle($scope.colors)


    if (appDataService.appData.user) {
        $scope.campaignGroupCount = appDataService.appData.user.dashboards.length;
        $scope.campaignTotalCount = appDataService.appData.user.dashboards.length;
    }

    $scope.showBurger = false
    $scope.showDropDown = false;
    $scope.showTasks = false;
    $scope.showActivities = userService.isEditor();
    $scope.page_id = 0;
    $scope.activities = [];
    $scope.actionTime = "";
    $scope.pageMore = false;
    $scope.pendingGetUserAction = false;
    $scope.pendingRefreshUserAction = false;

    var hostname = $location.host();
    if (hostname.indexOf("ezond.com") != -1){
        hostname = hostname.substr(0, hostname.indexOf("ezond.com") - 1);
    } else {
        hostname = hostname;
    }

    $scope.owner_id = userService.user.parent_id ? userService.user.parent_id : userService.user.id;

    appDataService.getImageForLogin(hostname)
    .then(function (result) {
        if (result == "blank") {
            if (typeof userService.user.parent_id != "undefined"){
                $scope.owner_id = userService.user.parent_id;
            }
            else {
                $scope.owner_id = userService.user.id;
                return;
            }
        }
    })

    $scope.mobileView = $window.innerWidth > 750 ? false : true

    $scope.notice_count = userService.notice_count;
    $scope.notifications = userService.notifications;
    $scope.quantityAlerts = 0;
    $scope.quantityActivities = 0;
    $scope.checkNotice = false;
    $scope.dash_notis = [];
    $scope.active_role = '';
    if (typeof userService.user.role != 'undefined')
        $scope.active_role = userService.user.role;

    $scope.activeMenu = 'campaigns';
    $scope.userRole = userService.user.role;

    $scope.canCreate = !((userService.planSubscribed == 'free-forever' || userService.planSubscribed == 'small-business' || (userService.planSubscribed == 'trial' && appDataService.appData.subscription_expired)) && appDataService.appData.user.dashboards.length >= 10)

    if (appDataService.appData){   
        $scope.expiredTrial = appDataService.appData.subscription_expired;
    }


    $scope.today_tasks = [];
    $scope.future_tasks = [];
    $scope.other_tasks = [];


    if ($location.path().indexOf('pleaseSubscribe') == -1) {
        $scope.pleasesubscribeState = false;
    }

    $scope.pleasesubscribeState = false;


    $scope.goToControlPanel = function () {
        $scope.pleasesubscribeState = false;
    }


    if ($location.path().indexOf('pleaseSubscribe') != -1) {
        $scope.pleasesubscribeState = true;
    }

    $scope.$on("emitedAlirt", function (e) {
        $scope.alirt()
    })

    $scope.alirt = function () {
        // $scope.pleasesubscribeState = true;
        $scope.showShadow = true
        $state.go('app.controlpanel.pleasesubscribe')
    }

    $scope.setActive = function (menuItem) {
        $scope.showDropDown = false;
        $scope.showTasks = false;
        $(".show-pop-user-panel").webuiPopover('hideAll');
        $scope.activeMenu = menuItem;
        $state.go('app.controlpanel.' + menuItem);
    }

    $scope.createStaff = function () {
        $scope.$emit('showPopup', {popup: 'createStaff'});
    }

    $scope.createClient = function () {
        $scope.$emit('showPopup', {popup: 'createClient'});
    }


    $scope.$on('refreshUserNotices2', function (e) {
        $scope.notice_count = userService.notice_count;
        $scope.notifications = userService.notifications;
        $scope.$apply();

        $scope.regenNoticePop();
    });

    $scope.getUserNotifications = function () {
        if ($scope.checkNotice) return;
        $scope.checkNotice = true;
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if (objXhr.responseText === 'empty'){
                    return;
                }
                retObj = JSON.parse(objXhr.responseText);
                $scope.notice_count = retObj.notice_count;
                $scope.notifications = retObj.notifications;

                $scope.quantityAlerts = $scope.notifications.length >= 6 ? 6 : $scope.notifications.length;


                $scope.dash_notis = retObj.notifications;
                $scope.checkNotice = false;
                $scope.$apply();

                $scope.regenNoticePop();
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getNotices.php?user_id=" + $scope.user_id + "&page_id=" + $scope.page_id);
        objXhr.send(data);

    }

    $scope.regenNoticePop = function () {

        userService.notice_count = $scope.notice_count;
        userService.notifications = $scope.notifications;
        $rootScope.$broadcast('refreshUserNotices', {});

        var settings = {
            trigger: 'click',
            title: '',
            content: '',
            width: 'auto',
            multi: false,
            closeable: false,
            animation: 'pop',
            style: '',
            delay: 300,
            padding: false,
            backdrop: false,
            cache: false
        };

        setTimeout(function () {
            $(".show-pop-notifications").webuiPopover('destroy').webuiPopover($.extend({}, settings, {
                width: 375,
                arrow: true,
                content: $(".popover-notifications").html()
            }));
        }, 100);
    }

    $scope.clearNoticeArr = function () {
        $scope.notice_count = 0;
        $scope.notifications = [];
        $scope.regenNoticePop();
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/clearUserNoitces.php?user_id=" + $scope.user_id);
        objXhr.send(data);
    }

    $scope.clearNoticeInfo = function (noticeIdx) {
        $(".show-pop-notifications").webuiPopover('hideAll');
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

    // Get Activity Handler
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

    $scope.addNotification = function (msgContent) {
        $scope.getUserNotifications();
    }

    $scope.getUserNotifications();

    // Open Task Management Page Handler
    $scope.OpenTaskPage = function (dashboardId) {
        campaign = {};
        for (i = 0; i < $scope.campaigns.length; i++) {
            if ($scope.campaigns[i].id == dashboardId) {
                campaign = $scope.campaigns[i];
                $scope.$emit('taskManagement', {popup: 'taskManagement', targetWidget: campaign});
                $scope.showDropDown = false;
                $scope.showTasks = false;
                break;
            }
        }
    }

    $scope.openActivitiesPop2 = function () {
        $scope.page_id = 0;
        $scope.getUserActivities();
    }

    $scope.openActivitiesPop = function () {
        $scope.showTasks = false;
        $scope.showDropDown = !$scope.showDropDown;
        if ($scope.showDropDown) {
            $scope.page_id = 0;
            $scope.getUserActivities();
        }
    }

    $scope.getMyTasks = function () {
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);
                $scope.today_tasks = $scope.today_tasks.concat(retObj.today_tasks);
                $scope.future_tasks = $scope.future_tasks.concat(retObj.future_tasks);
                $scope.other_tasks = $scope.other_tasks.concat(retObj.other_tasks);
                $scope.$apply();
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getUserTasks.php?user_id=" + $scope.user_id);
        objXhr.send(data);
    }


    $scope.show_tasks = function () {
        $scope.showDropDown = false;
        $(".show-pop-user-panel").webuiPopover('hideAll');
        $scope.getMyTasks();
    }

    // Refresh Activity Handler
    $scope.refreshUserActivities = function () {
        if ($scope.pendingRefreshUserAction) return false;
        $scope.pendingRefreshUserAction = true;

        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);
                if (retObj.actions.length > 0) {
                    $scope.actionTime = retObj.actions[0].actionTime;
                    $scope.activities = retObj.actions.concat($scope.activities);
                    for (j = 0; j < retObj.actions.length; j++) {
                        for (i = 0; i < appDataService.appData.user.dashboards.length; i++) {
                            if (appDataService.appData.user.dashboards[i].id == retObj.actions[j].dashboardId)
                                appDataService.appData.user.dashboards[i].actionCount++;
                        }
                    }
                    $scope.$apply();
                    $scope.$broadcast('refreshCampaigns', {});
                }
                $scope.pendingRefreshUserAction = false;
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/refreshUserActions.php?user_id=" + $scope.user_id + "&actionTime=" + $scope.actionTime);
        objXhr.send(data);
    }

    $scope.$on('refreshActivies', function (e) {
        $scope.refreshUserActivities();
    });

    // Get Campaign Group Handler
    $scope.GetCampaignGroups = function () {
        $scope.campaignGroups = [
            {"tagName": "ALL", "tagColor": "", "tagCount": $scope.campaigns ? $scope.campaigns.length : 0}
        ];
        $scope.tagGroups = ["ALL"];
        $scope.tagColors = [];

        if ($scope.campaigns){
            $scope.campaigns.forEach(function (elem) {
                description_obj = JSON.parse(elem.description);
                color_arr = [];
                if (typeof elem.tagColor != "undefined") {
                    if (elem.tagColor != "") color_arr = JSON.parse(elem.tagColor);
                }
                $scope.tagColors = $scope.tagColors.concat(color_arr);
                arr_group = description_obj.group.split(",");
                for (i = 0; i < arr_group.length; i++) {
                    str_group = arr_group[i].trim().toUpperCase();
                    if (str_group == "") continue;
                    if ($scope.tagGroups.indexOf(str_group) == -1) {
                        $scope.tagGroups.push(str_group);
                        _new_tag = {"tagName": str_group, "tagColor": "", "tagCount": 0};
                        $scope.campaignGroups.push(_new_tag);
                    }
                }
            });

            $scope.campaigns.forEach(function (elem) {
                description_obj = JSON.parse(elem.description);
                arr_group = description_obj.group.split(",");
                for (i = 0; i < arr_group.length; i++) {
                    str_group = arr_group[i].trim().toUpperCase();
                    if (str_group == "") continue;
                    if ($scope.tagGroups.indexOf(str_group) != -1) {
                        _indexOfTag = $scope.tagGroups.indexOf(str_group)
                        if ($scope.campaignGroups[_indexOfTag].tagColor == "") {
                            _str_color = "TagCell--colorNone";
                            for (j = 0; j < $scope.tagColors.length; j++) {
                                if (_str_color == "TagCell--colorNone") {
                                    if (typeof $scope.tagColors[j][str_group] != "undefined") {
                                        _str_color = $scope.tagColors[j][str_group];
                                    }
                                }
                            }
                            $scope.campaignGroups[_indexOfTag].tagColor = _str_color;
                        }
                        $scope.campaignGroups[_indexOfTag].tagCount++;
                    }
                }
            });
        }

    }

    if (appDataService.appData)
        $scope.GetCampaignGroups();

    $scope.$on('refreshProfilePhoto', function (e) {
        console.log("Refresh Profile Photo");
        $scope.timereport = userService.timereport;
        $scope.currentViewstate = appDataService.currentState;
    });

    $scope.$on('refreshProfile', function (e) {
        console.log("Refresh Profile");
        $scope.currentViewstate = appDataService.currentState;
        $scope.username = userService.user.first_name + " " + userService.user.last_name;
    });

    $scope.$on("refreshCampaigns", function (e) {
        $scope.campaignTotalCount = appDataService.appData.user.dashboards.length;
        $scope.campaigns = appDataService.appData.user.dashboards;
        $scope.changeCampaignGroup($scope.campaignGroupName);
        $scope.GetCampaignGroups();
    });

    $scope.$on("force_user_logout", function (e) {
        $state.go('login');
    });

    $scope.mobileMenuOpen = false


    var popupsHidden = true;

    function displayAppPopups() {
        if (!popupsHidden) return;
        popupsHidden = !popupsHidden
        window.$('.app-popups>div').css('visibility', 'visible')
    }

    // Open Create Campaign Window Handler
    $scope.createCampaign = function () {
        displayAppPopups()
        $scope.showDropDown = false;
        $scope.showTasks = false;
        $scope.$emit('showPopup', {popup: 'createCampaign'});
    }


    // User Profile Modal dialog
    $scope.userprofile = function () {
        $scope.showDropDown = false;
        $scope.showTasks = false;
        $scope.$emit('showPopup', {popup: 'userprofile'});
    }

    // User Logout Handler
    $scope.logout = function () {
        userService.logout().$promise
        .then(function () {
            if (typeof $localStorage.user != "undefined")
                delete $localStorage.user;
            if (typeof $localStorage.location_path != "undefined")
                delete $localStorage.location_path;
            $cookies.put('visitorStatus', 'logged-out', {'expires': new Date((new Date()).getFullYear(), new Date().getMonth() + 3, new Date().getDay())})
            $state.go('login');
            setTimeout(function () {
                $rootScope.$broadcast('force_user_logout', {});
            }, 1000);
        });
    }

    // Change Campaign Group Handler
    $scope.changeCampaignGroup = function (campaignGroupName) {
        $scope.campaignGroupName = campaignGroupName;
    }

    $scope.reconnectSession = function () {
        console.log("Restore Session Status !!");

        if (typeof $localStorage.user != "undefined") {
            if (typeof $localStorage.user.first_name == "undefined") {
                $http.post("/user/restore_user_session", {user: $localStorage.user}).then(function (response) {
                });
            }
        }
        ;
    }

    setInterval(function () {
        if (typeof $localStorage.user == "undefined") $state.go('login');
        else if (typeof $localStorage.user.first_name != "undefined") $state.go('login');
    }, 500);

    $(function () {

        $('#control-panel-logout, .custom-scrollbar').removeClass("ng-hide")
        
        var settings = {
            trigger: 'click',
            title: '',
            content: '',
            width: 'auto',
            multi: false,
            closeable: false,
            animation: 'pop',
            style: '',
            delay: 300,
            padding: false,
            backdrop: false
        };
        $scope.regenNoticePop();
        $(".show-pop-user-panel").webuiPopover('destroy').webuiPopover($.extend({}, settings, {
            width: 250,
            content: $('#popover-user-panel').html()
        }));
        setTimeout(function () {
            $("#ttt").popover();
        }, 1000);

    });
});