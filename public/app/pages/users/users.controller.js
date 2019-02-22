/**
 * Users controller
 */
ezondapp.controller('usersController', function ($scope, userService, usersList, appDataService) {
    $scope.backendUrl = appDataService.appData.backendUrl;
    $scope.usersList = usersList;
    userService.updateLocation();

    $scope.owner = {};
    const user = userService.user;
    console.log(userService)

    if (user.personal) {
        $scope.owner.first_name = JSON.parse(user.personal).first_name;
        $scope.owner.last_name = JSON.parse(user.personal).last_name;
    } else {
        $scope.owner.first_name = user.first_name;
        $scope.owner.last_name = user.last_name;
    }

    $scope.role = user.role !== undefined ? user.role : user.id;
    $scope.isowner = userService.isOwner();

    $scope.ownerid = user.role !== undefined ? user.parent_id : user.id;

    $scope.company = user.company;
    // $scope.owner = 
    $scope.timereport = userService.timereport;

    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    $scope.colors = ['#D3356D', '#e039fd', '#6be845', '#8210c7', '#6f7db2', '#4a73d4', '#885bea', '#993954', '#f1746d', '#192b7f', '#25a203', '#56766c', '#d001d1', '#dcb374'];

    $scope.colors = shuffle($scope.colors);

    // One function to remove both Staff and Clients
    $scope.removeChildUser = function (user) {
        $scope.$emit('removeChildUser', {popup: 'removeChildUser', targetUser: user});
    }

    // One function to edit both Staff and Clients
    $scope.editChildUser = function (user) {
        delete user.password;

        if (typeof user.providers_allowed == 'string') {
            user.providers_allowed = JSON.parse(user.providers_allowed);
        }

        if (typeof user.campaigns_allowed == 'string') {
            user.campaigns_allowed = JSON.parse(user.campaigns_allowed);
        }

        $scope.$emit('editChildUser', {popup: 'editChildUser', targetUser: user});
    };

    $scope.createStaff = function () {
        $scope.$emit('showPopup', {popup: 'createStaff'});
    };

    $scope.createClient = function () {
        $scope.$emit('showPopup', {popup: 'createClient'});
    };

    angular.element('#control-panel-logout').scope().showShadow = true

});