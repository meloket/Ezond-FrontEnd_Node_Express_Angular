/**
 * Header controller
 */
ezondapp.controller('headerController', function ($scope, $cookies, $timeout, userService, $location, $rootScope, appDataService, dashboardService, $stateParams, $state, $rootScope, $localStorage, $sessionStorage, $http, $window, $mdDialog) {
    $scope.backendUrl = appDataService.appData.backendUrl;

    $scope.owner_id = userService.user.agencyID ? userService.user.agencyID : userService.user.id;

    $scope.getFormsList = function () {
        $http.get('/user/getAgencyForms?agency_id=' + $scope.owner_id).then( function (response) {
            console.log(response.data.forms)
            $scope.formsList = response.data.forms;

            $scope.form = JSON.parse(response.data.forms[response.data.forms.length-1].form_fields);
        })
    }

    $scope.getFormsList();

    if (typeof $localStorage.user == "undefined") {
        $state.go('login');
    }
    $scope.isOwner = userService.isOwner();
    $scope.manageSubscription = function () {
        $state.go('app.controlpanel.pleasesubscribe')
    };

    $scope.user_id = userService.user.id;
    $scope.username = userService.user.first_name + " " + userService.user.last_name;
    if (userService.user.first_name && userService.user.last_name) {
        $scope.usernameletters = userService.user.first_name[0] + " " + (userService.user.last_name ? userService.user.last_name[0] : '');
    }

    $scope.campaigns = appDataService.appData.user.dashboards;
    console.log($scope.campaigns)

    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    $scope.colors = ['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374']

    $scope.hidemenus = function () {
        $(".common-menu-topbar").toggle()
    }

    $scope.hidethings = function () {
        $rootScope.showsidebar = false;
        $rootScope.customheight = '61px';
    }

    $scope.createcampaign = function () {
        $mdDialog.show({
            template: `<md-dialog style="width: 100%;max-width: 100%;max-height:100%;height:100%;">
                <md-dialog-content style="padding-top: 30px" class="md-padding text-center flex" layout="column"> 
                    <div layout="row" layout-align="end center">
                        <md-button class="md-icon-button" ng-click="cancel()">
                            <i class="ion ion-close"></i>
                        </md-button>
                    </div>
                    <h3 class="text-center bold">Hi, {{username}}!</h3>
                    <div ng-if="step==1" layout="column" class="flex">
                        <h4 class="md-title">Select a service</h4>
                        <div layout="row" style="width: 840px; max-width: 840px; margin: 0 auto;">
                            <div ng-repeat="form in forms" class="md-padding selecting_service layout-column">
                                <div class="md-title">{{form.form_data.name}}</div>
                                <md-button  class="curs-pointer md-raised" ng-class="{'md-primary': isPrimary($index)}" ng-click="selectService(form);selectedindex($index);"> 
                                    Order
                                </md-button>
                            </div>
                        </div>
                        <span class="flex"></span>
                        <div>
                            <md-button class="md-raised md-primary" ng-disabled="!selectedService" ng-click="setStep(2)">Next</md-button>
                        </div>
                    </div>
                    <style>
                        md-input-container .md-errors-spacer{min-height: 0px; } label, .form-group {text-align: left; } input {margin-bottom: 0px !important; }
                    </style>
                    <div ng-if="step==2" style="">
                        <h4>{{selectedService.form_data.name}}</h4>
                        <h4 style="color: red;">Service description</h4>
                        <br />
                        <md-button class="md-raised" ng-click="toggleneworexisted()"  ng-class="{'md-primary': !neworexisted}">
                            New campaign
                        </md-button>
                        <md-button  class="md-raised" ng-click="toggleneworexisted()" ng-class="{'md-primary': neworexisted}">
                            Existed campaign
                        </md-button>
                        <div ng-show="!neworexisted" class="margin-top md-title" style="padding-bottom: 14px;margin: 0 auto;max-width: 600px;">
                            <md-input-container class="md-block">
                                <label>Campaign Name</label>
                                <input ng-model="usesdasdr.title">
                            </md-input-container>

                            <md-input-container class="md-block">
                                <label>URL</label>
                                <input ng-model="usesdasdr.title">
                            </md-input-container>
                              
                            <md-input-container class="md-block">
                                <label>Location</label>
                                <input ng-model="usesdasdr.title">
                            </md-input-container>
                        </div>
                        <div ng-show="neworexisted" class="margin-top" style="    padding-top: 20px;">
                            <md-input-container style="font-size: 26px; width: 270px; text-align: left;">
                                <label>Select campaign</label>
                                <md-select ng-change="showcurr(selectedCampaign)" ng-model="selectedCampaign">
                                    <md-option style="font-size: 26px;" ng-repeat="campaign in campaigns" value="{{campaign.id}}" >
                                        {{campaign.company_name}}
                                    </md-option>
                                </md-select>
                            </md-input-container>
                        </div>
                        <md-button class="md-raised" ng-click="setStep(3)">Next</md-button>
                    </div>
                    <div ng-if="step==3" class="md-headline" style="width: 840px; max-width: 840px; margin: 0 auto;">
                        <formio style="max-width: 900px;margin: 0 auto;" form="formiodata"></formio>
                    </div>
                </md-dialog-content>
            </md-dialog>`,
            locals: {
                form: $scope.form,
                forms: $scope.formsList,
                username: $scope.username,
                user_id: userService.user.id,
                campaigns: $scope.campaigns
            },
            fullscreen: true,
            escapeToClose: false,
            controller: function ($http, $scope, $mdDialog, $timeout, form, forms, userService, username, campaigns, user_id) {

                $scope.step = 1;
                $scope.forms = [];
                forms.forEach(function (form, index) {
                    form.form_data = JSON.parse(form.form_fields)
                    $scope.forms.push(form)
                });
                $scope.username = username;
                $scope.signleform = form;
                $scope.user_id = user_id;
                $scope.neworexisted = false; //false - new, true - existed
                $scope.campaigns = campaigns;
                $scope.selectedCampaign = '';

                $scope.selectedindex = function (inx) {
                    console.log(inx)
                    $scope.selinx = inx;
                }

                $scope.isPrimary = function (inx) {
                    return $scope.selinx == inx
                }

                $scope.showcurr = function (dd) {
                    $scope.selectedCampaign = dd
                }

                function addActionToFormButton() {
                    angular.element('.btn.btn-primary.btn-wizard-nav-submit').on('click', function () {
                        $scope.saveserviceorder();
                    })
                    angular.element('.btn-wizard-nav-next, .btn-wizard-nav-previous').on('click', function () {
                        addActionToFormButton()
                    })
                    // angular.element('.btn-wizard-nav-next').on('click', function () {
                    //     if (angular.element('.btn.btn-primary.btn-wizard-nav-submit')){
                    //         angular.element('.btn.btn-primary.btn-wizard-nav-submit').on('click', function () {
                    //             $scope.saveserviceorder();
                    //         })
                    //     } else {
                    //         angular.element('.btn-wizard-nav-next').on('click', function () {
                    //             addActionToFormButton()
                    //         })
                    //     }
                    // })
                }

                $scope.setStep = function (step) {
                    if (step == 3) {
                        $scope.formiodata = $scope.extractForm($scope.selectedService);
                        $timeout(addActionToFormButton, 200)
                    }
                    $scope.step = step;
                }

                $scope.saveserviceorder = function () {
                    $scope.formiodata.components.forEach(function (field) {
                        // field_input = angular.element('#' + field.id).find('input')
                        field_input = angular.element('#' + field.id).find(':input')
                        if (field_input.length){
                            field.defaultValue = (angular.element('#' + field.id).find(':input')[0]).value
                        }
                    })
                    $http.post('/user/saveservice', {campaign_id: $scope.selectedCampaign,
                                        client_id: $scope.user_id,
                                        form_data: JSON.stringify($scope.formiodata),
                                        status: 0,
                                        price: 0,
                                        type: 0
                    }, function (response) {
                        console.log(response)
                    })
                    $scope.cancel()
                }

                $scope.selectedService = '';

                $scope.toggleneworexisted = function () {
                    $scope.neworexisted = !$scope.neworexisted;
                }

                $scope.selectService = function (form) {
                    $scope.selectedService = form;
                }

                $scope.extractForm = function (form) {
                    return JSON.parse(form.form_fields)
                }

                $scope.extractFormName = function (form) {
                    return JSON.parse(form.form_fields).name || 'Empty name'
                }

                $scope.mark = function () {
                    $mdDialog.hide()
                }
                $scope.cancel = function () {
                    $mdDialog.cancel()
                }
            }
        })
        .then(function (notes) {
            
        })
    }

    shuffle($scope.colors)
    $scope.useremail = userService.user.email
    if (appDataService.appData.user){
        $scope.campaigns = appDataService.appData.user.dashboards;
    }
    $scope.showSelectCampaignDlg = false;
    $scope.showActivities = userService.isEditor();
    $scope.popover = '';
    $scope.checkPopEmpty = 0;
    $scope.currentViewstate = appDataService.currentState;
    $scope.timereport = userService.timereport;
    $scope.owner_id = userService.user.id;

    $scope.notice_count = userService.notice_count;
    $scope.notifications = userService.notifications;

    $scope.hidding = false
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

    $scope.activities = [];
    $scope.quantityAlerts = 0;
    $scope.quantityActivities = 0;

    $scope.mobileView = $window.innerWidth > 750 ? false : true


    $scope.today_tasks = [];
    $scope.future_tasks = [];
    $scope.other_tasks = [];

    $scope.planSubscribed = userService.planSubscribed;
    $scope.expiredTrial = appDataService.appData.subscription_expired;

    $scope.restrictClient = userService.isOwner();

    var hostname = $location.host()
    if (hostname.indexOf("ezond.com") != -1)
        hostname = hostname.substr(0, hostname.indexOf("ezond.com") - 1)
    else
        hostname = hostname

    $scope.owner_id = appDataService.getImageForLogin(hostname)
    $scope.owner_id.then(function (result) {
        if (result == "blank") {
            if (typeof userService.user.parent_id != "undefined") $scope.owner_id = userService.user.parent_id;
            else $scope.owner_id = userService.user.id;
            return
        }
        $scope.owner_id = result
    })

    $scope.alirt = function () {

        $state.go('app.controlpanel.pleasesubscribe')
        $scope.$emit('fromHeadToControlpanelSubscription')

    }

    $scope.isClient = true;
    if (typeof userService.user.role == 'undefined' || userService.user.role != 'client') {
        $scope.isClient = false;
    }

    $scope.changeSelectedCampaign = function () {
        $scope.selectedCampaign = dashboardService.dashboard;
        if (typeof dashboardService.dashboard.id == "undefined") {
            setTimeout(function () {
                $scope.changeSelectedCampaign();
            }, 1000);
        } else {
            setTimeout(function () {
                $scope.$apply();
            }, 100);
        }
    }

    $scope.changeSelectedCampaign();

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

    $rootScope.$on('refreshState', function (e) {
        console.log("Refresh State");
        $scope.currentViewstate = appDataService.currentState;
    });

    $scope.$on("force_user_logout", function (e) {
        $state.go('login');
    });

    // User Profile Modal dialog
    $scope.userprofile = function () {
        $(".show-pop-user").webuiPopover('hideAll');
        $scope.$emit('showPopup', {popup: 'userprofile'});
    }


    $scope.newTask = {actionDetail: '', filePath: ''}

    $scope.createNewTask = function (argument) {
        $scope.$emit("addTaskFromControlpanel", {newTask: $scope.newTask})
    }


    // Open Add Widget Window Handler
    $scope.addWidget = function () {
        $scope.$emit('showPopup', {popup: 'addWidget'});
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

    $scope.$on('refreshUserNotices', function (e) {
        $scope.notice_count = userService.notice_count;
        $scope.notifications = userService.notifications;
        $scope.$apply();

        $scope.regenNoticePop();
    });

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

    $scope.regenNoticePop = function () {

        userService.notice_count = $scope.notice_count;
        userService.notifications = $scope.notifications;
        $rootScope.$broadcast('refreshUserNotices2', {});

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

    $scope.addNotification = function (msgContent) {
        $scope.getUserNotifications();
    };

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
                $scope.checkNotice = false;

                $scope.quantityAlerts = $scope.notifications.length >= 6 ? 6 : $scope.notifications.length;


                $scope.$apply();

                $scope.regenNoticePop();
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getNotices.php?user_id=" + $scope.user_id + "&page_id=" + $scope.page_id);
        objXhr.send(data);

    }
    $scope.getUserNotifications();

    // Restrict clients from accessing control panel
    $scope.goToControlPanel = function () {
        if (typeof userService.user.role != 'client') {
            $(".show-pop-user").webuiPopover('destroy');
            $(".show-pop-edit-campaign").webuiPopover('destroy');
            $(".show-pop-notifications").webuiPopover('destroy');
        }
    }

    // Change Campaign Select Handler
    $scope.changeCampaign = function (campaign) {
        $state.go('app.dashboard.home', {id: campaign.id});
        $scope.showSelectCampaignDlg = false;
        $scope.selectedCampaign = campaign;
        $scope.popover = "";
        appDataService.currentState = "inWidgetsView";
        $scope.currentViewstate = appDataService.currentState;
    }

    // Edit Campaign Handler
    $scope.editCampaign = function () {
        $scope.$emit('editCampaign', {popup: 'editCampaign', targetWidget: $scope.selectedCampaign});
    }

    // Open Integrations Handler
    $scope.showIntegrations = function (campaignX = {}) {
        $scope.$emit('showPopup', {popup: 'integrations', campaign: campaignX});
    }

    // Check other place Click for Close PopUp Handler
    $scope.togglePopEmpty = function () {
        if ($scope.checkPopEmpty == 1) {
            $scope.popover = "";
        }
        if ($scope.checkPopEmpty == 0) $scope.checkPopEmpty++;
    }

    // Show Campaign Selector and Finder pop-menu Window Handler
    $scope.togglePopover = function () {

        $("#searchCampaignPop").css("left", ((jQuery(".campaigns-dropdown-icon").offset().left + jQuery(".campaigns-dropdown").offset().left) / 2 - 125) + "px");

        if ($scope.popover != "searchCampaign") {
            $scope.popover = 'searchCampaign';
            $scope.checkPopEmpty = 0;
        }
        else
            $scope.popover = '';
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
                    if ($scope.actionTime == "") $scope.actionTime = retObj.actions[0].actionTime;
                    if ($scope.page_id == 0) $scope.activities = retObj.actions;
                    else $scope.activities = $scope.activities.concat(retObj.actions);
                    $scope.pageMore = false;
                    if (retObj.isMore == 1) {
                        $scope.page_id++;
                        $scope.pageMore = true;
                    }
                    $scope.$apply();
                }
                $scope.pendingGetUserAction = false;
                $scope.quantityActivities = $scope.activities.length >= 6 ? 6 : $scope.activities.length;
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getUserActions.php?user_id=" + $scope.user_id + "&page_id=" + $scope.page_id);
        objXhr.send(data);
    }

    $scope.getUserActivities();


    $scope.getMyTasks = function () {
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);
                $scope.today_tasks = retObj.today_tasks;
                $scope.future_tasks = retObj.future_tasks;
                $scope.other_tasks = retObj.other_tasks;
                $scope.$apply();
            }
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getUserTasks.php?user_id=" + $scope.user_id);
        objXhr.send(data);
    }

    $scope.getMyTasks()


    $scope.reconnectSession = function () {
        if (typeof $localStorage.user != "undefined") {
            if (typeof $localStorage.user.first_name == "undefined") {
                console.log("Restore Session Status !");
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

    // Date-Range Selector Bind Module
    $(function () {
        function GetFormattedDateStringForCalendar(dateString) {
            var d = new Date(dateString + " 20:00:00");
            return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        }

        $('body').on('click', ".datepicker_recurring_start2", function () {
            $scope.curDateTask = $(this).parent().attr("value");
            if ($(this).parent().children(".CalendarText").prop("value")) {
                $scope.temp_date = GetFormattedDateStringForCalendar($(this).parent().children(".CalendarText").prop("value"));
                console.log($scope.temp_date);
                $(this).parent().children(".CalendarText").daterangepicker({
                    "singleDatePicker": true,
                    "linkedCalendars": false,
                    "startDate": $scope.temp_date,
                    "endDate": $scope.temp_date,
                    "dateFormat": "yy-mm-dd",
                    "autoUpdateInput": false,
                    "opens": "left"
                }, function (start, end, label) {
                    $scope.grab_taskdate = start.format('YYYY-MM-DD');
                    console.log($scope.curDateTask + " === " + $scope.grab_taskdate);
                });
            } else {
                $(this).parent().children(".CalendarText").daterangepicker({
                    "singleDatePicker": true,
                    "linkedCalendars": false,
                    "startDate": moment(),
                    "endDate": moment(),
                    "dateFormat": "yy-mm-dd",
                    "autoUpdateInput": false,
                    "opens": "left"
                }, function (start, end, label) {
                    $scope.grab_taskdate = start.format('YYYY-MM-DD');
                    if ($scope.curDateTask == '')
                        $scope.newTask.filePath = $scope.grab_taskdate;
                    console.log($scope.curDateTask + " === " + $scope.grab_taskdate);
                });
            }
            $(this).parent().children(".CalendarText").click();
        });


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
        $(".show-pop-user").webuiPopover('destroy').webuiPopover($.extend({}, settings, {
            width: 250,
            content: $('#popover-user-photo').html()
        }));
        $(".show-pop-edit-campaign").webuiPopover('destroy').webuiPopover($.extend({}, settings, {
            width: 200,
            content: $('#popover-edit-campaign').html()
        }));

        $scope.regenNoticePop();
    });
});