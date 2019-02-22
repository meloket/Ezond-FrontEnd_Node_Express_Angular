/**
 * Create Campaign directive
 */
ezondapp.component('topbar', {
        controller: function ($scope, appDataService, $state, userService, $localStorage, $cookies, $mdMenu, $rootScope) {
        	$scope.user_id = userService.user.id;
            $scope.userName = (userService.user.first_name ? userService.user.first_name : "") + " " + (userService.user.last_name ? userService.user.last_name : "")
        	$scope.backendUrl = appDataService.appData.backendUrl;
        	$scope.showmobilemenu = false;
        	$scope.toggleshowmobilemenu = function () {
        		$scope.showmobilemenu = !$scope.showmobilemenu;
        	}

            $scope.pressing = function (da) {
                $state.go('app.controlpanel.alerts', {id: da})
                $scope.toggleshowmobilemenu();
            }

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
            
    	    $scope.changestate = function (state) {
		        $state.go(state);
		        $scope.toggleshowmobilemenu();
		    }
        },
        templateUrl: "/app/modules/topbar/topbar.html"
    }
);
