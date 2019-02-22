/**
 * Campaigns controller
 */
ezondapp.controller('campaignsController', function ($mdToast, $window, $document, $cookies, $scope, $state, $controller, campaignsList, appDataService, $timeout, $http, userService, $mdDialog, $mdMenu) {
    userService.updateLocation();

    $scope.colors = ['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374']

    $scope.toggleshowmobilemenu = function () {
        $scope.showmobilemenu = !$scope.showmobilemenu;
    }

    $scope.toggleshowmobilesearch = function () {
        $scope.showmobilesearch = !$scope.showmobilesearch;
    }

    $scope.showmobilemenu = false;
    $scope.showmobilesearch = false;

    
    $scope.createCampaign = function () {
        displayAppPopups()
        $scope.showDropDown = false;
        $scope.showTasks = false;
        $scope.$emit('showPopup', {popup: 'createCampaign'});
    }

    $scope.activestate = 0;
    $scope.showfiltering = false;

    $scope.togglefiltering = function () {
        $scope.showfiltering = !($scope.showfiltering);
    }
    $scope.toggleordering = function (type) {
        if (type == 'clear'){
            $scope.activeorderstate = 2
            $scope.choseactivestate('')
            type = 'taskscount'
        }
        if (type == 'taskscount')
            $scope.activeorderstate = 2
        if (type == 'actionCount') 
            $scope.activeorderstate = 1
        if (type == 'createdDate') 
            $scope.activeorderstate = 3
        $scope.otherorderingtype = $scope.orderingtype;
        $scope.orderingtype = type;
    }

    $scope.campidsidslist = [];
    $scope.pendingGetUserAction = false;
    $scope.loadingCheck = false;

    $scope.orderingtype = 'taskscount'
    $scope.otherorderingtype = 'actionCount'
    $scope.activeorderstate = 2;

    $scope.fromleft = 0;


    angular.element($window).on('resize', function () {
        console.log('event thetetete')
        $scope.scrollbarwidth = $('.tagi .custom-scrollbar').width() + 100;
        $scope.parentscrollbarwidth = $('.tagi .custom-scrollbar').parent().width();
        console.log($scope.scrollbarwidth, $scope.parentscrollbarwidth)
        $scope.$apply()
    })

    $scope.scroll_bar = function (where) {
        $('.tagi .custom-scrollbar').animate({scrollLeft: $('.tagi .custom-scrollbar').scrollLeft() + where}, 100)
        $scope.scrollbarwidth = $('.tagi .custom-scrollbar').width() + 100;
        $scope.parentscrollbarwidth = $('.tagi .custom-scrollbar').parent().width();
        $scope.fromleft = $('.tagi .custom-scrollbar').scrollLeft() + where
    }

    $scope.improvementscount = function (campaign) {
        return ($scope.campaignNoticesStore.filter(function (value) {
            if (parseInt(value.dashboardId) == campaign.id) return true
        })).length
    }

    $scope.loadingData = true;

    $scope.getCampsTasks = function () {
        // if($scope.pendingGetUserAction) return false;
        $scope.pendingGetUserAction = true;
        $scope.loadingCheck = true;

        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                retObj = JSON.parse(objXhr.responseText);

                retObj.campcount.forEach(function (camp, index) {
                    // camp.dash_id
                    found = false
                    if (appDataService.appData){
                        appDataService.appData.user.dashboards.forEach(function (camp2, index2) {
                            if (camp2.id == camp.dash_id){
                                found = true
                                camp2.taskscount = parseInt(camp.count)
                            }
                        })
                    }
                        
                })

                if (appDataService.appData && appDataService.appData.user && appDataService.appData.user.dashboards){
                    appDataService.appData.user.dashboards.forEach(function (camp2, index2) {
                        if (!camp2.taskscount){
                            camp2.taskscount = 0
                        }
                    })
                    
                    $scope.campaignsListAll = appDataService.appData.user.dashboards;
                    $scope.campaignsList = appDataService.appData.user.dashboards;
                    $scope.campaignsCount = $scope.campaignsList.length

                    $scope.campaignsList.forEach(function (camp) {
                        camp.noticecount = 0
                        if ($scope.campaignNoticesStore && $scope.campaignNoticesStore.length){
                            $scope.campaignNoticesStore.forEach(function (notice) {
                                if (camp.company_name == notice.campaign){
                                    camp.noticecount = camp.noticecount+1
                                }
                            })
                        }
                            
                    })
                    
                    $scope.campaignsList2 = $scope.campaignsList

                    let tempcolors = shuffle($scope.colors)

                    $scope.campaignsList.forEach(function (campaign,index) {
                        campaign.campcolor = tempcolors.pop()
                        $scope.campidsidslist.push(campaign.id)
                    })
                
                }
                    
            }
            $scope.loadingData = false;                
            setTimeout(function () {
                $('.manualhide').removeClass('manualhide')
                $scope.$apply()
            }, 400)
        };
        objXhr.open("POST", $scope.backendUrl + "apis/getCampaignsListTasks.php?list=" + $scope.campidsidslist);
        objXhr.send(data);
    }

    $scope.getCampsUsers = function () {
        $scope.pendingGetUserAction = true;
        $scope.loadingCheck = true;
        var data = new FormData();
        var objXhr = new XMLHttpRequest();
        objXhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                campaignsUsers = JSON.parse(objXhr.responseText);

                campaignsUsers.forEach(function (user, index) {
                    found = false
                    if (appDataService.appData){
                        appDataService.appData.user.dashboards.forEach(function (camp2, index2) {
                            if (angular.isUndefined(camp2.userscount)) camp2.userscount = 0;

                            if (user.campaign_access == 'all') {
                                camp2.userscount++
                            }
                            else {
                                if (user.campaigns_allowed && JSON.parse(user.campaigns_allowed).indexOf(camp2.id) != -1){
                                    camp2.userscount++
                                }
                            }
                        })
                    }
                })

                $scope.getCampsTasks()
            }
            else if (this.status == 404){
                $scope.getCampsTasks()
            }
        };
        let parent_id = userService.user.parent_id || userService.user.id
        if (angular.isUndefined(parent_id)){
            return
        }
        objXhr.open("POST", $scope.backendUrl + "apis/getCampaignUsersCount.php?parent_id=" + parent_id);
        objXhr.send(data);
    }

    $scope.getCampsTasks()

    if (appDataService.appData.user){
        appDataService.appData.user.dashboards.forEach(function (campaign,index) {
            $scope.campidsidslist.push(campaign.id)
        })
    }


    $scope.customordering = function(v1, v2) {
        if (typeof v1 == 'undefined' || typeof v2 == 'undefined') return 
        return (v1.value < v2.value) ? -1 : (v1.value == v2.value) ? 0 : 1;
      };

    $scope.filterbystatus = function (camp) {
        return $scope.activestate == 0 || camp.campaignStatus == $scope.activestate
    }

    $scope.choseactivestate = function (state) {
        $scope.activestate = state
    }
    
    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    $scope.nameinitials = function (fullname) {
        if (fullname=='') return 'N/A'
        return fullname.split(" ")[0][0] + " " + fullname.split(" ")[1][0]
    }


    $scope.selectedCampaign = {};
    $scope.selectedWarningCampaign = 0;
    $scope.newValue = "ALL";
    $scope.campaignNotices = [];
    $scope.searchkey = ''

    if (appDataService.appData){
        if (userService.user.planSubscribed)
            $scope.expired = Number(new Date())/1000 > userService.user.planSubscribed.expires_at;
        $scope.backendUrl = appDataService.appData.backendUrl;
        
        if (appDataService.appData.user){
            $cookies.put('ezondID', appDataService.appData.user.company, {'expires': new Date((new Date()).getFullYear() + 1, new Date().getMonth(), new Date().getDay())})
        }
    }
    $cookies.put('visitorStatus', "logged-in", {'expires': new Date((new Date()).getFullYear() + 1, new Date().getMonth(), new Date().getDay())})
    $cookies.put('ezondPlan', userService.planSubscribed, {'expires': new Date((new Date()).getFullYear() + 1, new Date().getMonth(), new Date().getDay())})

    $scope.successfullSignIn = function (userid, planType) {
        dataLayer.push({
            'event': 'signIn',
            'attributes': {
                'userId': userid, //user id
                'timestamp': Math.floor(+new Date() / 1000), //unix timestmap
                'planType': planType
            }
        });
    };
    $scope.successfullSignIn(userService.user.id, userService.planSubscribed)

    $scope.stopSearching = function () {
        $scope.searchkey = ''
    };
    $scope.restoreSearch = function () {
        $scope.campaignsList = $scope.campaignsList2
    };
    $scope.searching = function () {
    };

    $scope.createCampaign = function () {
        angular.element("#control-panel-logout").scope().createCampaign()
    };

    function isAlarmCheck(campaign) {
        for (ii = 0; ii < $scope.campaignNotices.length; ii++)
            if ($scope.campaignNotices[ii].dashboardId == campaign.id) return true;
        return false;
    }

    function resizeCampaignSize() {
        let tempPosX = 0;
        let tempPosY = 0;
        if ($scope.campaignsListAll) {
            for (i = 0; i < $scope.campaignsListAll.length; i++) {
                description_obj = JSON.parse($scope.campaignsListAll[i].description);
                $scope.campaignsListAll[i].url = description_obj.url;
                $scope.campaignsListAll[i].sizeX = 2;
                $scope.campaignsListAll[i].sizeY = 5;
                $scope.campaignsListAll[i].isAlram = isAlarmCheck($scope.campaignsListAll[i]);
            }
        }

    }

    resizeCampaignSize();

    $scope.$on("refreshCampaigns", function (e) {
        $scope.campaignsListAll = appDataService.appData.user.dashboards;
        resizeCampaignSize();
        $scope.reDisplayCampaigns();
    });

    $scope.isShowAlarm = function (campaign) {
        return campaign.isAlram;
    }

    // Select Campaign for State Change Handler
    $scope.selectCampaign = function (campaign) {
        $scope.selectedCampaign = campaign;
    }

    $scope.hidePopOver = function () {
        $scope.selectedWarningCampaign = -1;
        $(".show-pop-campaign-warning").webuiPopover('destroy');
        $(".show-pop-campaign-status").webuiPopover('destroy');
    }

    $scope.changestate = function (state) {
        $state.go(state);
    }

    $scope.pressing = function (da) {
        $state.go('app.controlpanel.alerts', {id: da})
    }

    $scope.campaignNoticesd = []

    $scope.selectWarningCampaign = function (campaign) {
        if ($scope.selectedWarningCampaign == campaign.id) return;
        $scope.selectedWarningCampaign = campaign.id;

        $scope.campaignNoticesd = []
        $scope.campaignNoticesd = $scope.campaignNoticesStore.filter(function (value) {
            if (parseInt(campaign.id) == parseInt(value.dashboardId)) return true
        })

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

        setTimeout(function () {
            $(".show-pop-campaign-warning").webuiPopover('destroy').webuiPopover($.extend({}, settings, {
                width: 350,
                content: [`<div id="popover-campaign-warning">
                      <ul style="padding: 0; list-style: none; margin: 0;">
                        <li class="list-group-item" style="position: relative;">
                          <b>Issues Detected</b>
                          <i class="icon icon-warning"
                             style="position: absolute; top: 0.6rem; right: 1rem; color: #EF6000; font-size: 2rem; display: inline-block;"></i>
                        </li>
                        <li class="list-group-item" __style="height: 115px; overflow-y: auto;">`,
                        $scope.campaignNoticesd.map(function (value) {
                            return `<div><i class="icon icon-emoti-bad" style="display: inline-block;font-size:2rem;vertical-align: top;"></i>
                            <p style="word-break: break-all;width: calc(100% - 3rem); display: inline-block; line-height: 2rem; margin: 0;">`+value.title+`</p></div>`
                        }).join(''),`</li>
                            <li class="list-group-item">
                            <div class="campaignactionbuttons" style="margin-top: 8px;">
                              <div onclick="dynamicnotificationconsolebutton(`+campaign.id+`)" class="curs-pointer text-uppercase" style="margin-right: 15px;" ng-click="taskManagement(campaign)">
                                <i class="ion-compose ion" style=""></i>
                                IMPROVEMENTS CONSOLE
                              </div>
                            </div>
                            </li>
                          </ul>
                        </div>`].join('')
            }));
        }, 100);


    }

    // Select Campaign Handler
    $scope.changeCampaignStatus = function (campaignStatus) {
        $mdDialog.show({
            template:
                `<md-dialog style="width: 60%; max-width: 600px"> 
                  <md-toolbar layout="row" layout-align="start center" class="md-padding"> 
                    <span class="white-c">Campaign status</span> 
                  </md-toolbar> 
                  <md-dialog-content style="padding-top: 30px" class="md-padding" layout="column"> 
                    <span class="layout-row"> 
                      <span class="md-subhead" >{{campname}}</span> 
                      <span flex=""></span> 
                      <strong style="font-weight: 600;color: green;" class="md-subhead text-uppercase" ng-show="newstatus == 1">Normal</strong> 
                      <strong style="font-weight: 600;color: orange" class="md-subhead text-uppercase" ng-show="newstatus == 2">Review</strong> 
                      <strong style="font-weight: 600;color: red" class="md-subhead text-uppercase" ng-show="newstatus == 3">Urgent</strong> 
                    </span> 
                    <textarea name="" id="" cols="30" rows="4" style="margin-bottom: 0;" placeholder="Notes" ng-model="description"></textarea> 
                  </md-dialog-content> 
                  <md-dialog-actions style="padding-top: 0px;" class="md-padding" layout="row" layout-align="center"> 
                    <md-button ng-click="mark()" class="md-raised md-primary">Mark {{statusname}}</md-button> 
                    <md-button ng-click="cancel()" class="md-raised">Cancel</md-button> 
                  </md-dialog-actions> 
                </md-dialog>`,
            locals: {
                newstatus: campaignStatus,
                campname: $scope.selectedCampaign.company_name
            },
            escapeToClose: false,
            controller: function campstatusnotes($scope, campname, newstatus, $mdDialog) {
                $scope.campname = campname
                $scope.newstatus = newstatus

                $scope.cancel = function () {
                    $mdDialog.cancel()
                };

                $scope.mark = function () {
                    $mdDialog.hide($scope.description)
                };

                $scope.statusname = newstatus == 1 ? 'Normal' : (newstatus == 2 ? 'Review' : 'Urgent')
            }
        })
        .then(function (notes) {
            $scope.updateCampaignActive($scope.selectedCampaign.id, campaignStatus, notes, $scope.selectedCampaign.company_name);
            $scope.selectedCampaign.campaignStatus = campaignStatus;

            $scope.reDisplayCampaigns();

            let socket = io();
            let room = typeof userService.user.parent_id != 'undefined' ? userService.user.parent_id : userService.user.id;
            room = room + "i"
            socket.emit('changedcampaignstatus', room, {id: $scope.selectedCampaign.id, status: campaignStatus});
            $scope.removeOvh()
        }, function () {
            $scope.removeOvh()
        })
    };

    // NOW Update Campaign Active
    $scope.updateCampaignActive = function (campaign_id, campaign_active, notes = '', campaign_name = '') {
        var data = new FormData();
        var objXhr = new XMLHttpRequest();

        $http.post('/user/sendNotification',
            {
                type: 1,
                info: {
                    campname: campaign_name,
                    staff: userService.user.first_name + " " + userService.user.last_name,
                    note: notes,
                    campID: campaign_id,
                    newstatus: campaign_active == 2 ? "Review Required" : (campaign_active == 3 ? "Urgent Attention" : "Normal")
                }
            }
        ).then(function (response) {
        })


        objXhr.open("POST", appDataService.appData.backendUrl + "apis/updateCampaignActive.php?actionDetail=" + notes + "&user_id=" + userService.user.id + "&campaign_id=" + campaign_id + "&campaign_active=" + campaign_active);
        objXhr.send(data);
    };


    $scope.showFollowers = function (campaign) {
        campaign.ready = true
        $scope.ids = null
        userService.getDashboardFollowers({dashId: campaign.id}).$promise
        .then(function (response) {
            delete campaign.ready

            if ($scope.ids != null && typeof $scope.ids != 'string') {
                $scope.ids = response.ids.split(',').map(function (item) {
                    return parseInt(item, 10);
                });
            }
            else
                $scope.ids = response.ids


            $mdDialog.show({
                clickOutsideToClose: true, escapeToClose: true,
                locals: {ids: $scope.ids},
                template:
                    `<md-dialog> 
                      <md-toolbar layout="row" layout-align="start center" class="md-padding"> 
                        <span class="white-c">Campaign Followers</span> 
                        <span flex=""></span> 
                        <md-button ng-click="closeMe()" class="md-icon-button"> <i class="ion-close white-c"></i> </md-button> 
                      </md-toolbar> 
                      <md-dialog-content style="padding-top: 30px" class="md-padding" layout="column"> 
                        <span class="md-subhead">Members will be notified with Campaign Status changes, Comments & Tasks are added or completed</span> 
                        <md-select placeholder="" ng-model="followingtype" style="min-width: 200px;margin-left: auto; margin-right: auto"> 
                          <md-option ng-selected="followingtype==11" ng-value="11">All Staffs</md-option> 
                          <md-option ng-selected="followingtype==22" ng-value="22">Selected Staff</md-option> 
                          <md-option ng-selected="followingtype==33" ng-value="33">None</md-option> 
                        </md-select> 
                        <md-select  ng-if="followingtype==22" ng-model="me" multiple style="min-width: 200px;margin-left: auto; margin-right: auto"> 
                          <md-optgroup label="Staff"> 
                            <md-option ng-selected="::ids.indexOf(user.id) != -1" ng-value="user.first_name + \' \' + user.last_name" ng-click="toggle(user.id, ids)" ng-repeat="user in usersToFollow | filter: {role: \'staff\' }">{{user.first_name + " " + user.last_name}}</md-option> 
                          </md-optgroup> 
                          <md-optgroup label="Clients"> 
                            <md-option ng-selected="::ids.indexOf(user.id) != -1" ng-value="user.first_name + \' \' + user.last_name" ng-click="toggle(user.id, ids)" ng-repeat="user in usersToFollow | filter: {role: \'client\' }">{{user.first_name + " " + user.last_name}}</md-option> 
                          </md-optgroup> 
                        </md-select> 
                      </md-dialog-content> 
                      <md-dialog-actions class="md-padding" layout="row" layout-align="center"> 
                        <md-button class="md-primary md-raised" ng-click="accepted()">Ok</md-button> 
                        <md-button ng-click="closeMe()">Cancel</md-button> 
                      </md-dialog-actions> 
                    </md-dialog>`,
                controller: function followersController($scope, $mdDialog, ids) {
                    if (ids == false)
                        ids = 'all'

                    if (ids == 'all')
                        $scope.followingtype = 11
                    else if (ids == 'none')
                        $scope.followingtype = 33
                    else {
                        $scope.followingtype = 22
                    }

                    if (ids != 'all' && ids != 'none') {
                        $scope.ids = []
                        ids = ids.split(',')
                        for (var i = 0; i < ids.length; i++) {
                            $scope.ids[i] = +ids[i];
                        }
                    } else {
                        $scope.ids = ids
                    }

                    $scope.accepted = function () {
                        if ($scope.followingtype == 11) {
                            $scope.ids = 'all'
                            $mdDialog.hide($scope.ids)
                            return
                        }
                        if ($scope.followingtype == 22) {
                            $scope.ids = $scope.ids.join(',')
                            $mdDialog.hide($scope.ids)
                            return
                        }
                        if ($scope.followingtype == 33) {
                            $scope.ids = 'none'
                            $mdDialog.hide($scope.ids)
                        }
                    };

                    $scope.toggle = function (item, list) {

                        if ($scope.followingtype == 22) {
                            if (typeof list != 'object') {
                                list = []
                            }
                            var idx = list.indexOf(item);
                            if (idx > -1) list.splice(idx, 1);
                            else list.push(item);
                            $scope.ids = list
                        }
                    };

                    $scope.usersToFollow = []
                    angular.copy(appDataService.appData.user.childUsers, $scope.usersToFollow);

                    $scope.closeMe = function () {
                        $mdDialog.cancel('cancel')
                    }
                }
            })
            .then(function (res) {
                    userService.setDashboardFollowers({dashId: campaign.id, follIds: res})
                },
                function (res) {
                })
        })


    }

    // Remove Campaign Handler
    $scope.removeCampaign = function (campaign) {
        $scope.$emit('removeCampaign', {popup: 'removeCampaign', targetWidget: campaign});
    };

    $scope.editCampaign = function (campaign) {
        $scope.$emit('editCampaign', {popup: 'editCampaign', targetWidget: campaign});
    };

    $scope.showIntegrations = function (campaignX) {
        $scope.$emit('showPopup', {popup: 'integrations', campaign: campaignX});
    };

    $scope.menuOpened = false;

    $scope.$watch('menuOpened', function (yesornot) {
        if (!$scope.menuOpened) {
            $scope.removeOvh()
        }
    })

    $scope.hideMe1 = function () {
        $mdDialog.hide();
    };
    $scope.removeOvh = function () {
        var bodyRef = angular.element($document[0].body);
        bodyRef.removeClass('ovh')
    };
    $scope.addOvh = function () {
        var bodyRef = angular.element($document[0].body);
        bodyRef.addClass('ovh')

        $timeout(function () {
            bodyRef = angular.element('.md-menu-backdrop.md-click-catcher')

            bodyRef.click(function (elem) {
                $scope.removeOvh()
            })
        }, 50)
    };

    // Task Management Handler
    $scope.taskManagement = function (campaign) {
        $scope.addOvh()
        $scope.$emit('taskManagement', {popup: 'taskManagement', targetWidget: campaign});
    };

    $scope.showCampaignManagement = function (campaign) {
        $scope.$emit('taskManagement', {popup: 'taskManagement', targetWidget: campaign});
    };

    $scope.$watch('campaignGroupName', function (newValue, oldValue, scope) {
        $scope.newValue = newValue;
        $scope.reDisplayCampaigns();
    });

    $scope.$watch('dash_notis', function (newValue, oldValue, scope) {
        $scope.campaignNotices = newValue;
        $scope.campaignNoticesStore = angular.copy(newValue)
        $scope.campaignsList.forEach(function (camp) {
            camp.noticecount = 0
            $scope.campaignNoticesStore.forEach(function (notice) {
                if (camp.company_name == notice.campaign){
                    camp.noticecount = camp.noticecount+1
                }
            })
        })
        $scope.selectedWarningCampaign = 0;
        setTimeout(function () {
            resizeCampaignSize();
            $scope.reDisplayCampaigns();
            $scope.$apply();
        }, 2000);
    });

    function CheckInGroup(campaign_obj) {
        description_obj = JSON.parse(campaign_obj.description);
        arr_group = description_obj.group.split(",");
        check_in = false;
        for (i = 0; i < arr_group.length; i++) {
            str_group = arr_group[i].trim().toLowerCase();
            if (($scope.newValue.toLowerCase() == str_group) || ($scope.newValue == "ALL")) {
                check_in = true;
            }
        }
        return check_in;
    }

    $scope.reDisplayCampaigns = function () {
        $scope.campaignsList = [];
        var topX = 0;
        var topY = 0;

        if (!($scope.campaignsListAll)){
            return
        }

        $scope.campaignsListAll.forEach(function (elem) {
            if ((elem.campaignStatus == 3) && (elem.isAlram)) {
                if (CheckInGroup(elem)) {
                    elem.posY = topY;
                    elem.posX = topX;
                    topY = (topY + 2) % 6;
                    if (topY == 0) topX += 5;
                    updatePositionFromGlobal(elem.id, elem.posX, elem.posY);
                    $scope.campaignsList.push(elem);
                }
            }
        });
        $scope.campaignsListAll.forEach(function (elem) {
            if ((elem.campaignStatus == 3) && (!elem.isAlram)) {
                if (CheckInGroup(elem)) {
                    elem.posY = topY;
                    elem.posX = topX;
                    topY = (topY + 2) % 6;
                    if (topY == 0) topX += 5;
                    updatePositionFromGlobal(elem.id, elem.posX, elem.posY);
                    $scope.campaignsList.push(elem);
                }
            }
        });
        $scope.campaignsListAll.forEach(function (elem) {
            if ((elem.campaignStatus == 2) && (elem.isAlram)) {
                if (CheckInGroup(elem)) {
                    elem.posY = topY;
                    elem.posX = topX;
                    topY = (topY + 2) % 6;
                    if (topY == 0) topX += 5;
                    updatePositionFromGlobal(elem.id, elem.posX, elem.posY);
                    $scope.campaignsList.push(elem);
                }
            }
        });
        $scope.campaignsListAll.forEach(function (elem) {
            if ((elem.campaignStatus == 2) && (!elem.isAlram)) {
                if (CheckInGroup(elem)) {
                    elem.posY = topY;
                    elem.posX = topX;
                    topY = (topY + 2) % 6;
                    if (topY == 0) topX += 5;
                    updatePositionFromGlobal(elem.id, elem.posX, elem.posY);
                    $scope.campaignsList.push(elem);
                }
            }
        });
        $scope.campaignsListAll.forEach(function (elem) {
            if ((elem.campaignStatus == 1) && (elem.isAlram)) {
                if (CheckInGroup(elem)) {
                    elem.posY = topY;
                    elem.posX = topX;
                    topY = (topY + 2) % 6;
                    if (topY == 0) topX += 5;
                    updatePositionFromGlobal(elem.id, elem.posX, elem.posY);
                    $scope.campaignsList.push(elem);
                }
            }
        });
        $scope.campaignsListAll.forEach(function (elem) {
            if ((elem.campaignStatus == 1) && (!elem.isAlram)) {
                if (CheckInGroup(elem)) {
                    elem.posY = topY;
                    elem.posX = topX;
                    topY = (topY + 2) % 6;
                    if (topY == 0) topX += 5;
                    updatePositionFromGlobal(elem.id, elem.posX, elem.posY);
                    $scope.campaignsList.push(elem);
                }
            }
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

        setTimeout(function () {
            $(".show-pop-campaign-status").webuiPopover('destroy').webuiPopover($.extend({}, settings, {
                width: 150,
                content: $('#popover-campaign-status').html()
            }));
        }, 100);

        $scope.saveCampaignPositions();
    }

    function updatePositionFromGlobal(dashbaordId, posX, posY) {
        for (ii = 0; ii < appDataService.appData.user.dashboards.length; ii++) {
            if (appDataService.appData.user.dashboards[ii].id == dashbaordId) {
                appDataService.appData.user.dashboards[ii].posX = posX;
                appDataService.appData.user.dashboards[ii].posY = posY;
            }
        }
    }

    $scope.saveCampaignPositions = function () {
        posData = "";
        $scope.campaignsListAll = appDataService.appData.user.dashboards;
        resizeCampaignSize();
        for (i = 0; i < $scope.campaignsListAll.length; i++) {
            if (posData != "") posData += ":";
            posData += $scope.campaignsListAll[i].id + "," + $scope.campaignsListAll[i].row + "," + $scope.campaignsListAll[i].col
        }
    };

    $scope.saveWidgetPositions = function (gridster) {
        return;
        var pos = [];
        posData = "";
        for (i = 0; i < gridster.grid.length; i++) {
            if (typeof(gridster.grid[i]) != "undefined") {
                for (j = 0; j < gridster.grid[i].length; j++) {
                    if (typeof(gridster.grid[i][j]) != "undefined") {
                        if (posData != "") posData += ":";
                        posData += gridster.grid[i][j].itemId + "," + gridster.grid[i][j].row + "," + gridster.grid[i][j].col
                        gridster.grid[i][j].id = gridster.grid[i][j].itemId;
                        updatePositionFromGlobal(gridster.grid[i][j].itemId, gridster.grid[i][j].row, gridster.grid[i][j].col);
                        pos[pos.length] = gridster.grid[i][j];
                    }
                }
            }
        }
    };

    if (appDataService.openTaskmanagement != "") {
        var id = appDataService.openTaskmanagement
        for (var i = 0; i < appDataService.appData.user.dashboards.length; i++) {
            if (appDataService.appData.user.dashboards[i].id == id) {
                var camp = appDataService.appData.user.dashboards[i]
                $scope.taskManagement(camp)
                appDataService.openTaskmanagement = ""
            }
        }
    }

    $(function () {

        $('.manualhide').removeClass('manualhide')
        
        $scope.scrollbarwidth = $('.tagi .custom-scrollbar').width() + 100;
        $scope.parentscrollbarwidth = $('.tagi .custom-scrollbar').parent().width();

        if (appDataService.selflogin) {
            appDataService.selflogin = false
            $state.go('app.controlpanel.welcome-first-login')
        }

        var socket = io()

        socket.on('changedcampaignstatusback', function (room, msg) {
            for (var i = appDataService.appData.user.dashboards.length - 1; i >= 0; i--) {
                if (appDataService.appData.user.dashboards[i].id == msg.id) {
                    appDataService.appData.user.dashboards[i].campaignStatus = msg.status;
                    return
                }
            }
        })

        $(window).resize(function () {
            $("#campaigns-container").height($(window).height() - 122);
        })
        $("#campaigns-container").height($(window).height() - 122);
    })
});


ezondapp.directive('resizer', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            angular.element($window).on('resize', function () {
                var skep = angular.element(elem).scope()
                if (typeof skep != 'undefined' && $window.innerWidth >= 750) {
                    elem.removeClass('mobileheader')
                    skep.mobileView = false
                    if (skep.showBurger)
                        skep.showBurger = false
                }
                else {
                    if (typeof skep != 'undefined') {
                        elem.addClass('mobileheader')
                        skep.mobileView = true
                    }
                }
            });
        }
    }
}]);
