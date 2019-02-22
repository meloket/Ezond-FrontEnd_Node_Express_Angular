/**
 * Users controller
 */
ezondapp.controller('tasksController', function($scope, userService, appDataService) {
    $scope.backendUrl = appDataService.appData.backendUrl;
    $scope.user_id = userService.user.id;

    $scope.searchkey = '';

    $scope.filtredDashboard = ""

    $scope.changeCampaign = function (camp) {
        $scope.filtredDashboard = camp.company_name;
    }

    $scope.toggleTaskStatus = function(task){

        task.task_progress = 1 - task.task_progress;

        var data = new FormData();
        var objXhr = new XMLHttpRequest();

        objXhr.addEventListener("load", function () {
            $scope.today_tasks = [];
            $scope.future_tasks = [];
            $scope.other_tasks = [];
            setTimeout($scope.getMyTasks, 3000)
        }, false);
        objXhr.open("POST", $scope.backendUrl + "apis/toggleTaskStatus.php?actionIdx=" + task.actionIdx + "&user_id=" + $scope.user_id + "&taskProgress=" + task.task_progress);
        objXhr.send(data);
    }


    $scope.today_tasks = [];
    $scope.future_tasks = [];
    $scope.other_tasks = [];

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

    $scope.getMyTasks();

    $scope.show_tasks = function () {
        
    }

});