/**
 * Create Campaign directive
 */
ezondapp.directive('taskManagement', function ($rootScope, $controller, $document, integrationsService, $timeout, removeCampaignService, dashboardService, userService, appDataService, $http, $mdDialog, $anchorScroll) {

    return {
        restrict: 'E',
        scope: {},
        replace: true,
        link: function ($scope, elem, atts) {
            var editor = new Quill('.campaign_description_editor', {placeholder: 'Description'});

            function shuffle(a) {
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            }

            $scope.completedTasksCount = function () {
                $scope.tasks.filter(function (task) {
                    if (task.taskProgress) return true
                })
            }

            $scope.nameinitials = function (fullname) {
                if (fullname == '') return 'N/A'
                return fullname.split(" ")[0][0] + " " + fullname.split(" ")[1][0]
            }

            $scope.usercolors = []
            $scope.usercolors[0] = '#eeeeee'
            $scope.colors = ['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374']

            shuffle($scope.colors)

            initCampaignData();

            $scope.removeOvh = function () {
                var bodyRef = angular.element($document[0].body);
                bodyRef.removeClass('ovh')
            }

            $scope.__str_temp = "";


            $scope.handlePaste = function (task) {
                console.log('handlePaste')
                str_task = task.actionDetail;
                str_task = str_task.split("\r").join("");
                arr_str_task = str_task.split("\n");
                arr_tasks = [];
                __first_check = true;
                for (i = 0; i < arr_str_task.length; i++) {
                    if (arr_str_task[i].trim() != "") {
                        if (__first_check) {
                            __first_check = false;
                            task.actionDetail = arr_str_task[i].trim();
                        } else
                            arr_tasks.push(arr_str_task[i].trim());
                    }
                }

                $scope.__str_temp = arr_tasks.join("\n");
                if (arr_tasks.length > 0)
                    $scope.__create_tasks($scope.__str_temp, task);
            }

            $scope.__create_tasks = function (__str_temp_tasks, task) {
                arr_subtasks = __str_temp_tasks.split("\n");
                for (i = 0; i < $scope.tasks.length; i++) {
                    if ($scope.tasks[i].taskOrder < task.taskOrder) $scope.tasks[i].taskOrder = parseInt($scope.tasks[i].taskOrder) - arr_subtasks.length;
                }
                $scope.createNewTask_progress = true;
                for (_task_i = 0; _task_i < arr_subtasks.length; _task_i++) {
                    new_task = {};
                    new_task.actionIdx = 0;
                    new_task.actionDetail = arr_subtasks[_task_i];
                    new_task.taskProgress = 0;
                    new_task.filePath = "";
                    new_task.taskOrder = parseInt(task.taskOrder) - 1 - _task_i;
                    new_task.userIdx = $scope.userIdx;
                    new_task.taskAssigner = 0;
                    $scope.tasks.push(new_task);
                    $scope.createNewTaskFromPending(new_task);
                    $scope.curEditTask = {};
                    $scope.editTask = false;
                }
                setTimeout(function () {
                    $(".autogrow_area").autoGrow();
                    $scope.createNewTask_progress = false;
                }, 100);
            }

            // Change Edit Task Handler
            $scope.changeEditTask = function (task) {

                if ($scope.curEditTask == task) return

                $scope.curEditTask = task;
                $scope.editTask = true;
                setTimeout(function () {
                    $(".curEditCell").focus();
                }, 1000);

            }

            $scope.createNewTask_progress = false;

            $scope.$on('addTaskFromControlpanel1', function (e, details) {
                initCampaignData();
                $scope.newTask = details.newTask;
                $scope.getUserActivities(true)
            })


            $scope.createNewTask = function (taskOrder) {
                if (taskOrder == 0) {
                    minTaskOrder = 1000;
                    for (i = 0; i < $scope.tasks.length; i++) {
                        if ($scope.tasks[i].taskOrder < minTaskOrder) minTaskOrder = $scope.tasks[i].taskOrder;
                    }
                    taskOrder = minTaskOrder - 1;
                }

                new_task = {};
                new_task.actionIdx = 0;
                new_task.actionDetail = "";

                if ($scope.newTask.actionDetail != '')
                    new_task.actionDetail = $scope.newTask.actionDetail;
                $scope.newTask.actionDetail = '';

                new_task.taskProgress = 0;
                new_task.filePath = "";

                if ($scope.newTask.filePath != '')
                    new_task.filePath = $scope.newTask.filePath;
                $scope.newTask.filePath = '';

                new_task.taskOrder = taskOrder;
                new_task.userIdx = $scope.userIdx;
                new_task.taskAssigner = $scope.userToAssignNewTask;
                $scope.tasks.push(new_task);
                $scope.curEditTask = new_task;
                $scope.editTask = true;
                setTimeout(function () {
                    $(".curEditCell").focus();
                    $(".autogrow_area").autoGrow();
                    $scope.createNewTask_progress = false;
                }, 100);
            }

            $scope.defaultLimitActions = 3;

            // Task Detail Changed Handler
            $scope.taskDetailChanged = function ($event, task) {
                console.log('taskDetailChanged')
                if ($event.keyCode == 8) {
                    if (task.actionDetail == "") {
                        check_prev = false;
                        prev_task = {};
                        content = task.actionIdx
                        saveindex = -1
                        for(i=0; i<$scope.tasks.length; i++){
                            if (content == $scope.tasks[i].actionIdx)
                                saveindex = i

                            if(parseInt($scope.tasks[i].taskOrder) < parseInt(task.taskOrder)) {
                                $scope.tasks[i].taskOrder = parseInt($scope.tasks[i].taskOrder) + 1;
                            }
                            
                            else if($scope.tasks[i].taskOrder == parseInt(task.taskOrder) + 1){
                                check_prev = true;
                                prev_task = $scope.tasks[i];
                            }
                        }

                        $(".curEditCell").parent().parent().parent().remove()

                        $scope.removeTask($scope.curEditTask)


                        $scope.curEditTask = {};
                        if (check_prev) {
                            $scope.curEditTask = prev_task;
                            $scope.editTask = true;
                            setTimeout(function () {
                                $(".curEditCell").focus();
                            }, 100);
                        }
                    }
                } else if ($event.keyCode == 13) {
                    $event.preventDefault();
                    if ($scope.createNewTask_progress == true) return;
                    $scope.createNewTask_progress = true;
                    for (i = 0; i < $scope.tasks.length; i++) {
                        if ($scope.tasks[i].taskOrder < task.taskOrder) $scope.tasks[i].taskOrder = parseInt($scope.tasks[i].taskOrder) - 1;
                    }

                    $scope.createNewTask(parseInt(task.taskOrder) - 1);
                } else if ($event.keyCode == 38) {
                    let current = $scope.curEditTask.taskOrder
                    $scope.tasks.sort(function (a, b) {
                        return a.taskOrder - b.taskOrder
                    })


                    for (var i = $scope.tasks.length - 1; i >= 0; i--) {
                        if ($scope.tasks[i].taskOrder > current) {
                            $scope.curEditTask = angular.copy($scope.tasks[i]);
                        }
                    }

                    console.log($scope.curEditTask)
                }
            }

            $scope.setTaskOrder = function (actionIdx, taskOrder) {
                for (ii = 0; ii < $scope.tasks.length; ii++) {
                    if ($scope.tasks[ii].actionIdx == actionIdx) $scope.tasks[ii].taskOrder = taskOrder;
                }
            }

            // Create New Task Handler
            $scope.createNewTaskFromPending = function (task) {
                var index = $scope.tasks.indexOf(task);
                var data = new FormData();
                data.append('actionDetail', task.actionDetail);
                data.append('taskAssigner', task.taskAssigner);
                data.append('taskOrder', task.taskOrder);
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        if ($scope.tasks.length > index) {
                            retObj = JSON.parse(objXhr.responseText);
                            $scope.tasks[index].actionIdx = retObj[0];
                            $scope.$apply();
                        }
                    }
                };

                objXhr.open("POST", $scope.backendUrl + "apis/createNewTask.php?dashboardId=" + $scope.campaign.id + "&user_id=" + $scope.userIdx);
                objXhr.send(data);
            }

            $scope.removeTask = function (task) {

                var taskIdx = task.actionIdx;
                var index = $scope.tasks.indexOf(task);
                $scope.tasks.splice(index, 1);

                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/removeTask.php?actionIdx=" + taskIdx);
                objXhr.send(data);
            }

            // Update Task Detail Handler
            $scope.updateTaskDetail = function (task) {
                if ($scope.curEditTask == task) $scope.curEditTask = {};
                if (task.actionIdx == 0) {
                    $scope.createNewTaskFromPending(task);
                    return;
                }

                var data = new FormData();
                data.append('taskOrder', task.taskOrder);
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        $scope.editTask = false;
                        $scope.$apply();
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/updateTaskDetail.php?actionIdx=" + task.actionIdx + "&actionDetail=" + task.actionDetail);
                objXhr.send(data);
            }

            $scope.showOrderDetails = function (order) {
                if (order){
                    $scope.taskmanagement_state = 'orderdetails';
                    $scope.order_to_show = order.form_data;
                } else {
                    $scope.taskmanagement_state = '';
                    $scope.order_to_show = {};
                }

            }

            $scope.hideLoadMore = false
            // Get Activity Handler
            $scope.getUserActivities = function (fromHeader = false) {
                if ($scope.pendingGetUserAction) return false;
                $scope.pendingGetUserAction = true;
                $scope.loadingCheck = true;

                // $http.post('/user/getserviceorders', {campaign_id: $scope.campaign.id}).then( function (response) {
                //     $scope.service_orders = []
                //     response.data.forEach(function (order, index) {
                //         colors = shuffle(['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374'])
                //         order.form_data = JSON.parse(order.form_data)
                //         order.color = colors[index]
                //         $scope.service_orders.push(order)
                //     })
                // });


                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        retObj = JSON.parse(objXhr.responseText);


                        if (retObj.ownerName != "") {
                            $scope.ownerName = retObj.ownerName;
                            $scope.$apply();
                        }
                        
                        $scope.activities.forEach(function (action) {
                            if (action.actionIdx == retObj.actions[0].actionIdx) {
                                $scope.hideLoadMore = true
                                $scope.$apply()
                            }
                        })

                        if (retObj.actions.length > 0) {
                            if ($scope.actionTime == "") $scope.actionTime = retObj.actionTime;

                            // $scope.activities = retObj.actions.concat($scope.activities);
                            $scope.activities = Object.assign($scope.activities, retObj.actions)

                            $scope.pageMore = false;
                            if (retObj.isMore == 1) {
                                $scope.page_id++;
                                $scope.pageMore = true;
                            }
                            $scope.$apply();
                        }

                        if (retObj.tasks.length > 0) {
                            $scope.tasks = retObj.tasks;
                            $scope.$apply();
                        }
                        if (retObj.uploads.length > 0) {
                            $scope.uploads = retObj.uploads;
                            $scope.$apply();
                        }
                        if (retObj.users.length > 0) {
                            $scope.users = retObj.users;

                            $scope.colors = ['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374']
                            shuffle($scope.colors)
                            $scope.usercolors = []
                            $scope.usercolors[0] = '#eeeeee'

                            $scope.users.forEach(function (value, index, array) {
                                $scope.usercolors[value.userIdx] = $scope.colors.pop()
                            })

                            $scope.taskAssignerName()

                            $scope.$apply();
                        }
                        $scope.pendingGetUserAction = false;

                        if (fromHeader) {
                            $scope.createNewTask(0)
                        }

                        setTimeout(function(){
                            $scope.loadingCheck = false;
                            $scope.$apply();

                            $(".autogrow_area").autoGrow();
                        }, 1000);



                    }
                };
                tempid = fromHeader ? dashboardService.dashboard.id : $scope.campaign.id
                objXhr.open("POST", $scope.backendUrl + "apis/getUserActions.php?dashboardId=" + tempid + "&page_id=" + $scope.page_id);
                objXhr.send(data);

            }
            // Refresh Activity Handler
            $scope.refreshUserActivities = function (messagesent = false) {
                if ($scope.pendingRefreshUserAction) return false;
                $scope.pendingRefreshUserAction = true;

                // $http.post('/user/getserviceorders', {campaign_id: $scope.campaign.id}).then( function (response) {
                //     $scope.service_orders = []
                //     response.data.forEach(function (order, index) {
                //         colors = shuffle(['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374'])
                //         order.form_data = JSON.parse(order.form_data)
                //         order.color = colors[index]
                //         $scope.service_orders.push(order)
                //     })
                // })

                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        if (messagesent)
                            $scope.gotoAnchor()
                        retObj = JSON.parse(objXhr.responseText);
                        if (retObj.actions.length > 0) {
                            $scope.actionTime = retObj.actions[retObj.actions.length - 1].actionTime;
                            $scope.activities = $scope.activities.concat(retObj.actions);
                            $scope.$apply();
                        }
                        if (retObj.uploads.length > 0) {
                            $scope.uploads = retObj.uploads;
                            $scope.$apply();
                        }
                        $scope.pendingRefreshUserAction = false;
                        if ($scope.scrollDown) {
                            $scope.scrollDown = false;
                            setTimeout(function () {
                                $("#scrollTaskPart").animate({scrollTop: 10000}, 500, 'swing', function () {
                                });
                            }, 100);
                        }
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/refreshUserActions.php?dashboardId=" + $scope.campaign.id + "&actionTime=" + $scope.actionTime);
                objXhr.send(data);
                $scope.$parent.$broadcast('refreshActivies', {});
            }

            // Remove Upload File Handler
            $scope.removeUpload = function (upload) {

                var uploadIdx = upload.actionIdx;
                var index = $scope.uploads.indexOf(upload);
                $scope.uploads.splice(index, 1);
                index = $scope.activities.indexOf(upload);
                $scope.activities.splice(index, 1);

                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/removeTask.php?actionIdx=" + uploadIdx);
                objXhr.send(data);
            }

            // Remove Comment Handler
            $scope.removeComment = function (action) {

                var actionIdx = action.actionIdx;
                var index = $scope.activities.indexOf(action);
                $scope.activities.splice(index, 1);

                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/removeTask.php?actionIdx=" + actionIdx);
                objXhr.send(data);
            }

            // Toggle Task Status Handler
            $scope.toggleTaskStatus = function (task) {
                task.taskProgress = 1 - task.taskProgress;

                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.addEventListener("load", toggleTaskStatusCompleted, false);
                objXhr.open("POST", $scope.backendUrl + "apis/toggleTaskStatus.php?actionIdx=" + task.actionIdx + "&user_id=" + $scope.userIdx + "&taskProgress=" + task.taskProgress);
                objXhr.send(data);
            }

            function toggleTaskStatusCompleted() {
                $scope.refreshUserActivities();
            }

            $scope.checkFileIsImage = function (imgFileName) {
                if (imgFileName.length < 4) return false;
                imgFileExt = imgFileName.substring(imgFileName.length - 3).toLowerCase();
                if (imgFileExt == "jpg") return true;
                if (imgFileExt == "png") return true;
                if (imgFileExt == "gif") return true;
                return false;
            }

            // Get Formatted Date String Handler
            $scope.GetFormattedShortDateString = function (dateString) {
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var d = new Date(dateString + " 20:00:00");
                return d.getDate() + " " + monthNames[d.getMonth()];
            }

            // Get Formatted Date String Handler
            function GetFormattedDateStringForCalendar(dateString) {
                var d = new Date(dateString + " 20:00:00");
                return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
            }

            $scope.removeCampaign = function (campaign) {
                $scope.$emit('removeCampaign', {popup: 'removeCampaign', targetWidget: campaign});
            }

            $scope.editCampaign = function (campaign) {
                $scope.$emit('editCampaign', {popup: 'editCampaign', targetWidget: campaign});
            }

            $scope.showIntegrations = function (campaignX) {
                console.log(campaignX)
                $scope.$emit('showPopup', {popup: 'integrations', campaign: campaignX});
            }

            // Get Formatted Date String Handler
            function GetFormattedDateString(dateString) {
                var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var d = new Date(dateString);
                return d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
            }

            // Get Formatted Time String Handler
            function GetFormattedTimeeString(dateString) {
                var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var d = new Date(dateString);
                return d.getDate() + " " + monthNames[d.getMonth()] + " at " + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
            }

            // Grab Campaign Information Handler
            $scope.$on('taskManagement1', function (e, details) {
                initCampaignData();
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!
                var yyyy = today.getFullYear();

                if (dd < 10) dd = '0' + dd;
                if (mm < 10) mm = '0' + mm;

                today = yyyy + "-" + mm + '-' + dd;


                $scope.campaign = details;
                $scope.userToAssignNewTask = $scope.campaign.assignerID;

                if (typeof $scope.campaign.createdDate == "undefined") $scope.campaign.addedDate = today;
                else $scope.campaign.addedDate = GetFormattedDateString($scope.campaign.createdDate);
                $scope.camapignTagArray = [];
                $scope.tagColor = {};

                $(".campaign_description_editor .ql-editor").html($scope.campaign.story);

                if (details.description) {
                    var description = JSON.parse(details.description);

                    $scope.campaign.url = description.url;
                    $scope.campaign.url_link = $scope.campaign.url;
                    if ($scope.campaign.url_link.substring(0, 4) != "http") $scope.campaign.url_link = "http://" + $scope.campaign.url_link;
                    $scope.campaign.location = description.location;
                    $scope.campaign.group = description.group;
                    if (typeof details.tagColor != "undefined") {
                        if (details.tagColor != "")
                            $scope.tagColor = JSON.parse(details.tagColor);
                    }

                    arr_group = description.group.split(",");
                    for (i = 0; i < arr_group.length; i++) {
                        str_group = arr_group[i].trim().toUpperCase();
                        if (str_group == "") continue;
                        if ($scope.camapignTagArray.indexOf(str_group) == -1) {
                            $scope.camapignTagArray.push(str_group);
                        }
                    }
                }

                $scope.getUserActivities();
            });


            $scope.getTagClassName = function (tagName) {
                if (typeof $scope.tagColor[tagName] != "undefined") {
                    return $scope.tagColor[tagName];
                } else {
                    return "TagCell--colorNone";
                }
            }

            // Click Add Tag Button Handler
            $scope.clickAddTag = function () {
                $scope.addTag = true;
                $scope.refreshAllCampaignTags();
                setTimeout(function () {
                    $(".newTagEdit").focus();
                }, 200);
            }

            $scope.openAttachFile = function () {
                setTimeout(function () {
                    $("#photo_file_msg").click();
                }, 100);
            }

            $scope.msgSend2 = function () {
                var socket = io();
                socket.emit('comment in taskmanagement', $scope.newMsgContent)
            }

            $scope.gotoAnchor = function (x) {
                $("md-dialog-content.taskManagementscroll").animate({ scrollTop: $('md-dialog-content.taskManagementscroll').prop("scrollHeight")}, 200);
            }

            // Send Message Event Handler
            $scope.msgSend = function (newMsgContent, $event) {
                $scope.newMsgContent = newMsgContent;

                if ($scope.newMsgContent == "") return false;
                $scope.showNotiNames = 'clear';
                var data = new FormData();
                data.append("msgContent", $scope.newMsgContent);
                data.append("userNotifi", $scope.userToGetNotice.id);

                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        $scope.scrollDown = true;
                        $scope.refreshUserActivities(true);
                    }
                };


                $http.post('/user/sendNotification', {
                        type: 2,
                        info: {
                            campname: $scope.campaign.company_name,
                            staff: userService.user.first_name + " " + userService.user.last_name,
                            campID: $scope.campaign.id,
                            message: $scope.newMsgContent,
                        }
                    }
                ).then(function (response) {
                })

                objXhr.open("POST", $scope.backendUrl + "apis/createNewMsg2.php?dashboardId=" + $scope.campaign.id + "&user_id=" + $scope.userIdx);
                objXhr.send(data);
                $scope.userToGetNotice = {};
                $scope.newMsgContent = "";
                angular.element("#txtMsgContent").val("")
                $scope.editMessage = false;
            }

            $scope.refreshAllCampaignTags = function () {
                $scope.existCamapignTagArray = [];
                for (i = 0; i < $scope.camapignTagArray.length; i++) {
                    $scope.existCamapignTagArray.push($scope.camapignTagArray[i]);
                }
                description = "";
                for (i = 0; i < appDataService.appData.user.dashboards.length; i++) {
                    description_obj = JSON.parse(appDataService.appData.user.dashboards[i].description);
                    exe_tagColor = {};
                    if (appDataService.appData.user.dashboards[i].tagColor != "") exe_tagColor = JSON.parse(appDataService.appData.user.dashboards[i].tagColor);
                    arr_group = description_obj.group.split(",");
                    for (ii = 0; ii < arr_group.length; ii++) {
                        str_group = arr_group[ii].trim().toUpperCase();
                        if (str_group == "") continue;
                        if ($scope.existCamapignTagArray.indexOf(str_group) == -1) {
                            $scope.existCamapignTagArray.push(str_group);
                            $scope.tagColor[str_group] = exe_tagColor[str_group];
                        }
                    }
                }
            }



            if (appDataService.appData) {
                $scope.backendUrl = appDataService.appData.backendUrl;
                if (appDataService.appData.user){
                    $scope.atNotiUsers = angular.copy(appDataService.appData.user.childUsers)
                }
                $scope.staffclients = []

                if ($scope.atNotiUsers){
                    for (var i = 0; i < $scope.atNotiUsers.length; i++) {
                        if ($scope.atNotiUsers[i].role == "staff")
                            $scope.staffclients.push($scope.atNotiUsers[i])
                    }
                }

                $scope.atNotiUsers = $scope.staffclients
            }



            // $scope.showNotiNames = 'clear';
            // $scope.userToGetNotice = {};
            // $scope.atNotiNAME = {};
            // $scope.atNotiNAME.first_name = '';

            // $scope.selectAtNotiUsr = function (usr) {
            //     $scope.newMsgContent = $scope.newMsgContent.replace("@" + $scope.atNotiNAME.first_name, "@" + usr.first_name) + " "
            //     $scope.userToGetNotice = usr;
            //     $scope.showNotiNames = 'done';
            //     $("#txtMsgContent").focus()
            // }

            // Toggle MessageBox Status
            // $scope.atNotifi = function (newMsgContent) {
            //     $scope.newMsgContent = newMsgContent;
            //     console.log($scope.newMsgContent)
            //     if ($scope.newMsgContent == "" || (($scope.newMsgContent.indexOf('@') > -1) && $scope.newMsgContent.split('@')[1].split(' ')[0] == "")) {
            //         $scope.showNotiNames = 'clear';
            //         $scope.atNotiNAME.first_name = '';
            //     }
            //     if ($scope.newMsgContent.indexOf('@') > -1) {
            //         $scope.atNotiNAME.first_name = $scope.newMsgContent.split('@')[1].split(' ')[0]
            //         if ($scope.showNotiNames != 'done')
            //             $scope.showNotiNames = 'catched'
            //     }
            //     else {
            //         $scope.showNotiNames = 'clear';
            //     }
            // }

            $scope.toggleEditMessage = function (newMsgContent) {
                if (newMsgContent == "") {
                    $scope.editMessage = false;
                }
            }

            $scope.addCustomTag = function (addTagName) {
                if ($scope.camapignTagArray.indexOf(addTagName.toUpperCase()) != -1) {
                    $scope.newTagName = "";
                    $scope.addTag = false;
                } else {
                    $scope.campaign.group = $scope.campaign.group + "," + addTagName;
                    $scope.camapignTagArray.push(addTagName.toUpperCase());
                    $scope.tagColor[addTagName.toUpperCase()] = $scope.getTagClassName(addTagName.toUpperCase());
                    __newTagName = addTagName.toUpperCase();
                    $scope.newTagName = "";
                    $scope.addTag = false;
                    $scope.storeTagColor();
                    $scope.updateCampaignTags($scope.campaign.id, $scope.campaign.group);
                    $scope.selectCustomTag($scope.__newTagEvent, __newTagName);
                }
            }

            $scope.removeNewTagName = function () {
                setTimeout(function () {
                    $scope.newTagName = "";
                    $scope.addTag = false;
                    $scope.$apply();
                }, 100);
            }

            // Tag Name Changed Event Handler
            $scope.tagNameChanged = function ($event) {
                $scope.__newTagEvent = $event;
            }

            // Remove Tag Name Event Handler
            $scope.removeTagName = function (tagName) {
                var index = $scope.camapignTagArray.indexOf(tagName);
                $scope.camapignTagArray.splice(index, 1);
                $scope.campaign.group = $scope.camapignTagArray.join();
                $scope.updateCampaignTags($scope.campaign.id, $scope.campaign.group);
                $scope.storeTagColor();
            }

            // NOW Update Campaign Active
            $scope.updateCampaignTags = function (campaign_id, campaign_tags) {
                description = "";

                for (i = 0; i < appDataService.appData.user.dashboards.length; i++) {
                    if (appDataService.appData.user.dashboards[i].id == campaign_id) {
                        exe_desciption = JSON.parse(appDataService.appData.user.dashboards[i].description);
                        exe_desciption.group = campaign_tags;
                        appDataService.appData.user.dashboards[i].description = JSON.stringify(exe_desciption);
                        description = JSON.stringify(exe_desciption);
                    }
                }
                var data = new FormData();
                var objXhr = new XMLHttpRequest();

                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        $scope.$parent.$broadcast('refreshCampaigns', {});
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/updateCampaignTags.php?campaign_id=" + campaign_id + "&description=" + description);
                objXhr.send(data);
            }

            // Remove Change Status Pop Window Handler
            $scope.removePopOver = function () {

                if ($scope.checkPop) $scope.popover = '';
                $scope.checkPop = false;
            }

            // Select Campaign for State Change Handler
            $scope.selectCampaign = function ($event, campaign) {
                $scope.checkPop = false;
                $scope.popover = 'selectCampaginState';
                setTimeout(function () {
                    $scope.checkPop = true;
                }, 100);
            }

            // Select Custom Tag for Change Handler
            $scope.selectCustomTag = function ($event, tagName) {
                $scope.selectTagName = tagName;
                $scope.checkPop = false;
                $scope.popover = 'selectTagColor';
                setTimeout(function () {
                    $scope.checkPop = true;
                }, 100);

                $scope.tipOffsetTop2 = $event.target.getBoundingClientRect().top + 25;
                $scope.tipOffsetLeft2 = $event.target.getBoundingClientRect().left - 25;

            }

            $scope.myuserid = angular.copy(userService.user.id)

            $scope.selectAssignMember = function ($event, task, newtask = false) {
                if (!newtask)
                    $scope.updateTaskDetail(task);
                $scope.selectTask4Assign = task;
            }

            $scope.selectAssignOwner = function ($event) {
            }

            $scope.assignNewOwner = function (user) {
                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        retObj = JSON.parse(objXhr.responseText);
                        $scope.ownerName = retObj.ownerName;
                        for (i = 0; i < appDataService.appData.user.dashboards.length; i++) {
                            if (appDataService.appData.user.dashboards[i].id == $scope.campaign.id) {
                                appDataService.appData.user.dashboards[i].assignerID = user.userIdx;
                            }
                        }
                        $scope.$parent.$broadcast('refreshCampaigns', {});
                        $scope.$apply();
                        $scope.refreshUserActivities();
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/updateCampaignAssigner.php?campaign_id=" + $scope.campaign.id + "&userIdx=" + user.userIdx + "&user_id=" + $scope.userIdx);
                objXhr.send(data);
                $scope.popover = "";
            }

            $scope.taskAssignerName = function () {
                for (var i = $scope.tasks.length - 1; i >= 0; i--) {
                    $scope.users.forEach(function (value, index, array) {
                        if (value.userIdx == $scope.tasks[i].taskAssigner) {
                            $scope.tasks[i].assignerName = value.userName
                        }
                    })
                }
            }

            $scope.assignNewUser = function (user, newtask = false) {
                if (newtask) {
                    $scope.userToAssignNewTask = user.userIdx
                    $scope.usernameToAssign = user.userName
                    return
                }
                task = $scope.selectTask4Assign;
                $scope.taskAssignerName();

                for (i = 0; i < $scope.tasks.length; i++) {
                    if ($scope.tasks[i].actionIdx == task.actionIdx) {
                        $scope.tasks[i].taskAssigner = user.userIdx;
                    }
                }
                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                objXhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {

                        $http.post('/user/sendNotification',
                            {
                                type: 3,
                                info: {
                                    staff: userService.user.first_name + " " + userService.user.last_name,
                                    details: task.actionDetail,
                                    whom: user.userIdx

                                }

                            }
                         ).then(function (response) {
                        })
                        $scope.refreshUserActivities();
                    }
                };
                objXhr.open("POST", $scope.backendUrl + "apis/updateTaskAssigner.php?actionIdx=" + task.actionIdx + "&userIdx=" + user.userIdx + "&user_id=" + $scope.userIdx);
                objXhr.send(data);
                $scope.popover = "";
            }

            // Change Tag Color
            $scope.changeTagColor = function (colorName) {
                $scope.tagColor[$scope.selectTagName] = colorName;
                $scope.storeTagColor();
            }

            $scope.showincompleted = true

            $scope.toggleshowincomplete = function () {
                $scope.showincompleted = !$scope.showincompleted
            }


            $scope.storeTagColor = function () {
                for (key in $scope.tagColor) {
                    if ($scope.camapignTagArray.indexOf(key) == -1)
                        delete $scope.tagColor[key];
                }

                var data = new FormData();
                var objXhr = new XMLHttpRequest();

                objXhr.open("POST", $scope.backendUrl + "apis/updateTagColor.php?campaign_id=" + $scope.campaign.id + "&tagColor=" + JSON.stringify($scope.tagColor));
                objXhr.send(data);


                for (i = 0; i < appDataService.appData.user.dashboards.length; i++) {
                    if (appDataService.appData.user.dashboards[i].id == $scope.campaign.id) {
                        appDataService.appData.user.dashboards[i].tagColor = JSON.stringify($scope.tagColor);
                    }
                }
                $scope.$parent.$broadcast('refreshCampaigns', {});
                $scope.popover = "";
            }

            // Select Campaign Handler
            $scope.changeCampaignStatus = function (campaignStatus) {

                $scope.closePopup();
                $scope.toOpenCampaign = $scope.campaign

                $mdDialog.show({
                    template: '<md-dialog style="width: 60%;max-width: 600px"> <md-toolbar layout="row" layout-align="start center" class="md-padding"> <span class="white-c">Campaign status</span> </md-toolbar> <md-dialog-content style="padding-top: 30px" class="md-padding" layout="column"> <span class="layout-row"> <span class="md-subhead" >{{campname}}</span> <span flex=""></span> <strong style="font-weight: 600;color: green;" class="md-subhead text-uppercase" ng-show="newstatus == 1">Normal</strong> <strong style="font-weight: 600;color: orange" class="md-subhead text-uppercase" ng-show="newstatus == 2">Review</strong> <strong style="font-weight: 600;color: red" class="md-subhead text-uppercase" ng-show="newstatus == 3">Urgent</strong> </span> <md-input-container style="margin-bottom: 0;" class="md-block" > <textarea name="" id="" cols="30" rows="4" style="margin-bottom: 0;" placeholder="Notes" ng-model="description"></textarea> </md-input-container> </md-dialog-content> <md-dialog-actions style="padding-top: 0px;" class="md-padding" layout="row" layout-align="center"> <md-button ng-click="mark()" class="md-raised md-primary">Mark {{statusname}}</md-button> <md-button ng-click="cancel()" class="md-raised">Cancel</md-button> </md-dialog-actions> </md-dialog>',
                    locals: {
                        newstatus: campaignStatus,
                        campname: $scope.campaign.company_name
                    },
                    escapeToClose: false,
                    controller: function campstatusnotes($scope, campname, newstatus, $mdDialog) {
                        $scope.campname = campname
                        $scope.newstatus = newstatus

                        $scope.mark = function () {
                            $mdDialog.hide($scope.description)
                        }
                        $scope.cancel = function () {
                            $mdDialog.cancel()
                        }

                        $scope.statusname = newstatus == 1 ? 'Normal' : (newstatus == 2 ? 'Review' : 'Urgent')
                    }
                })
                .then(function (notes) {
                    if ($scope.campaign.campaignStatus != campaignStatus) {
                        $scope.updateCampaignActive($scope.campaign.id, campaignStatus, notes, $scope.campaign.company_name);
                    }
                    $scope.campaign.campaignStatus = campaignStatus;
                    $scope.popover = '';

                    $scope.$emit('taskManagement', {popup: 'taskManagement', targetWidget: $scope.toOpenCampaign});

                    var bodyRef = angular.element($document[0].body);
                    bodyRef.addClass('ovh')

                    $scope.$parent.$broadcast('refreshCampaigns', {});

                    let socket = io();
                    let room = typeof userService.user.parent_id != 'undefined' ? userService.user.parent_id : userService.user.id;
                    room = room + "i"
                    socket.emit('changedcampaignstatus', room, {id: $scope.campaign.id, status: campaignStatus});
                })
            }

            $scope.getchangedstatusname = function (content) {
                return {
                    statusChanged: content.split(' ')[0] == 'Changed' ? true : false,
                    lastWord: content.split(' ')[content.split(' ').length - 1]
                }
            }

            // NOW Update Campaign Active
            $scope.updateCampaignActive = function (campaign_id, campaign_active, notes = '', campaign_name = '') {

                var data = new FormData();
                var objXhr = new XMLHttpRequest();

                console.log(userService.user)

                $http.post('/user/sendNotification',
                    {
                        type: 1,
                        info: {
                            campname: campaign_name,
                            staff: userService.user.first_name + " " + userService.user.last_name,
                            campID: campaign_id,
                            note: notes,
                            newstatus: campaign_active == 2 ? "Review Required" : (campaign_active == 3 ? "Urgent Attention" : "Normal")
                        }

                    }
                ).then(function (response) {
                    console.log(response)
                })


                objXhr.open("POST", $scope.backendUrl + "apis/updateCampaignActive.php?actionDetail=" + notes + "&user_id=" + $scope.userIdx + "&campaign_id=" + campaign_id + "&campaign_active=" + campaign_active);
                objXhr.send(data);
            }

            // View Widget Handler
            $scope.viewWidget = function () {
                top.location.href = "/#!/app/dashboard/" + $scope.campaign.id;
                $scope.closePopup();
            }


            // Close Remove Campaign Window
            $scope.closePopup = function (time = 500) {
                $scope.hidding = true;
                $timeout(function () {
                    $scope.$emit('hidePopup', {popup: 'taskManagement'});
                    $scope.hidding = false
                }, 500)
                $scope.removeOvh()
                initCampaignData();
            }

            // Focus EditBox Handler
            $scope.foucsEditBox = function () {
                let values = []
                $scope.atNotiUsers.forEach(function (el) {
                    values.push({key: el.first_name + ' ' + el.last_name, value: el.first_name + ' ' + el.last_name, id: el.id})
                })
                
                var tribute = new Tribute({
                  values: values
                })
                // setTimeout(function () {

                tribute.attach(angular.element("#txtMsgContent")[0]);
                    (angular.element("#txtMsgContent")[0]).addEventListener('tribute-replaced', function (e) {
                        $scope.userToGetNotice = e.detail.item.original;
                        // console.log('Matched item:', e.detail.item);
                    });
                // }, 2000)

                $scope.editMessage = true;
                setTimeout(function () {
                    $("#txtMsgContent").focus();
                }, 200);
            }

            // Initialization Module
            function initCampaignData() {
                $scope.showPopup = $scope.$parent.showPopup;
                $scope.timereport = userService.timereport;
                $scope.newTask = {actionDetail: '', filePath: ''};
                $scope.service_orders = [];
                $scope.popover = "";
                $scope.taskmanagement_state = '';
                $scope.hideLoadMore = false
                $scope.defaultLimitActions = 3;
                $scope.checkPop = false;
                $scope.tipOffsetLeft = "0px";
                $scope.tipOffsetTop = "0px";
                $scope.tipOffsetLeft2 = "0px";
                $scope.tipOffsetTop2 = "0px";
                $scope.tipOffsetLeft3 = "0px";
                $scope.tipOffsetTop3 = "0px";
                $scope.tipOffsetLeft4 = "0px";
                $scope.tipOffsetTop4 = "0px";
                $scope.addTag = false;
                $scope.newTagName = "";
                $scope.ownerName = "";
                $scope.page_id = 0;
                $scope.activities = [];
                $scope.tasks = [];
                $scope.actionTime = "";
                $scope.pageMore = false;
                $scope.pendingGetUserAction = false;
                $scope.pendingRefreshUserAction = false;
                $scope.loadingCheck = false;
                $scope.userIdx = userService.user.id;
                $scope.editTask = false;
                $scope.curEditTask = {};
                $scope.fileDrag = false;
                $scope.editMessage = false;
                $scope.newMsgContent = "";
                $scope.uploads = [];
                $scope.users = [];
                $scope.existCamapignTagArray = [];
                $scope.scrollDown = false;
            }

            function updateTaskDate(taskIdx, taskDate) {
                for (i = 0; i < $scope.tasks.length; i++) {
                    if ($scope.tasks[i].actionIdx == taskIdx) {
                        $scope.tasks[i].filePath = taskDate;
                        $scope.$apply();

                        var data = new FormData();
                        var objXhr = new XMLHttpRequest();
                        objXhr.onreadystatechange = function () {
                            if (this.readyState == 4 && this.status == 200) {
                            }
                        };
                        objXhr.open("POST", $scope.backendUrl + "apis/updateTaskDate.php?actionIdx=" + taskIdx + "&taskDate=" + taskDate);
                        objXhr.send(data);
                    }
                }
            }

            $scope.fileUploadingProgress = false;

            function sendFileToServer(formData) {
                $scope.fileUploadingProgress = true;
                var uploadURL = $scope.backendUrl + "apis/uploadAttachment.php?user_id=" + $scope.userIdx + "&dashboardId=" + $scope.campaign.id; //Upload URL
                var extraData = {}; //Extra Data.
                var jqXHR = $.ajax({
                    xhr: function () {
                        var xhrobj = $.ajaxSettings.xhr();
                        if (xhrobj.upload) {
                            xhrobj.upload.addEventListener('progress', function (event) {
                                var percent = 0;
                                var position = event.loaded || event.position;
                                var total = event.total;
                                if (event.lengthComputable) {
                                    percent = Math.ceil(position / total * 100);
                                }
                            }, false);
                        }
                        return xhrobj;
                    },
                    url: uploadURL,
                    type: "POST",
                    contentType: false,
                    processData: false,
                    cache: false,
                    data: formData,
                    success: function (data) {
                        $scope.refreshUserActivities();
                        $scope.scrollDown = true;
                        $scope.fileUploadingProgress = false;
                    }
                });
            }

            $("#photo_file_msg").change(function (event) {

                handleFileUpload(event.target.files);
            })

            function handleFileUpload(files, onefile = false) {
                if (onefile) {
                    var fd = new FormData();
                    fd.append('file', files);
                    sendFileToServer(fd);
                    return
                }

                for (var i = 0; i < files.length; i++) {
                    var fd = new FormData();
                    fd.append('file', files[i]);
                    sendFileToServer(fd);
                }
            }

            // Date-Range Selector Bind Module
            $(function () {


                var socket = io();
                let room = typeof userService.user.parent_id != 'undefined' ? userService.user.parent_id : userService.user.id
                room = room + "i"

                socket.emit('joinroom', room, function (data) {
                })


                $(".kurebenik").click(function (event) {
                    $("#filetoUpload2").click()
                })

                $("#filetoUpload2").change(function (event) {
                    var file = event.target.files[0];
                    handleFileUpload(file, true);
                })

                $('body').on('click', ".datepicker_recurring_start", function () {
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
                            updateTaskDate($scope.curDateTask, $scope.grab_taskdate);
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
                            updateTaskDate($scope.curDateTask, $scope.grab_taskdate);
                            console.log($scope.curDateTask + " === " + $scope.grab_taskdate);
                        });
                    }
                    $(this).parent().children(".CalendarText").click();
                });

                $scope.draghandleassigned = false;

                

                $(document).on('dragenter', function (e) {

                    if (!$scope.draghandleassigned) {
                        $(".dragandrophandler").on('dragenter', function (e) {
                            
                            e.stopPropagation();
                            e.preventDefault();
                            $(this).css('border', '2px solid #0B85A1');
                        }).on('dragover', function (e) {
                            
                            e.stopPropagation();
                            e.preventDefault();
                        }).on('drop', function (e) {
                           
                            $(this).css('border', '2px dotted #0B85A1');
                            e.preventDefault();
                            var files = e.originalEvent.dataTransfer.files;

                            handleFileUpload(files);
                        });
                        $scope.draghandleassigned = true;
                    }

                    e.stopPropagation();
                    e.preventDefault();
                    $scope.fileDrag = true;
                    $scope.$apply();
                }).on('dragover', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $scope.fileDrag = true;
                    $scope.$apply();
                    $(".dragandrophandler").css('border', '2px dotted #0B85A1');
                })
                .on('drop', function (e) {
                    console.log('DROP DOCUMETN')
                    e.stopPropagation();
                    e.preventDefault();
                    $scope.fileDrag = false;
                    $scope.$apply();
                });

                $(".campaign_description_editor .ql-editor").keydown(function (e) {
                    $(".campaign_description_editor").addClass("is-focused");
                }).blur(function () {
                    $(".campaign_description_editor").removeClass("is-focused");
                    $scope.campaign.story = $(".campaign_description_editor .ql-editor").html();

                    var data = new FormData();
                    var objXhr = new XMLHttpRequest();
                    data.append('story', $scope.campaign.story);
                    objXhr.open("POST", $scope.backendUrl + "apis/updateCampaignStory.php?campaign_id=" + $scope.campaign.id);
                    objXhr.send(data);


                    for (i = 0; i < appDataService.appData.user.dashboards.length; i++) {
                        if (appDataService.appData.user.dashboards[i].id == $scope.campaign.id) {
                            appDataService.appData.user.dashboards[i].story = $scope.campaign.story;
                        }
                    }
                }).focus(function () {
                    $(".campaign_description_editor").addClass("is-focused");
                });

            });


            var drake = dragula([document.getElementById("dragula_container1")]);
            drake.on("dragend", function () {
                console.log("DRAGEND")
                task_ids = "";
                for (i = 0; i < $("#dragula_container1 .exe_task_order").length; i++) {
                    if (i > 0) task_ids += ",";
                    task_ids += $("#dragula_container1 .exe_task_order").eq(i).attr("taskId");
                    $scope.setTaskOrder($("#dragula_container1 .exe_task_order").eq(i).attr("taskId"), 999 - i);
                }
                console.log(task_ids)
                var data = new FormData();
                var objXhr = new XMLHttpRequest();
                data.append('taskOrder', task_ids);
                objXhr.open("POST", $scope.backendUrl + "apis/updateCampaignTaskOrder.php?campaign_id=" + $scope.campaign.id);
                objXhr.send(data);
            });
        },
        templateUrl: "/app/modules/taskmanagement/taskmanagement2.html"
    }
});
