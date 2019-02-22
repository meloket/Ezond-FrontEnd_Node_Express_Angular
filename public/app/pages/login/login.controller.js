/**
 * Login controller
 */
ezondapp.controller('loginController', function ($scope, userService, $cookies, $location, appDataService, $location, $state, $localStorage, $sessionStorage, $http, $timeout) {

    if (appDataService && appDataService.appData){
        $scope.backendUrl = appDataService.appData.backendUrl;
        $scope.siteUrl = appDataService.appData.basePath;
    }

    $scope.userData = {
        email: '',
        password: ''
    };

    delete $localStorage.user;


    // whitelabel check url for custom domain
    var hostname = $location.host()
    $scope.hostname = hostname.split('.')[0]
    if (hostname.indexOf("ezond.com") != -1) {
        hostname = hostname.substr(0, hostname.indexOf("ezond.com") - 1)
    }
    else {
        hostname = hostname
    }


    if (hostname == 'dev' || hostname == 'app') {
        // TAM KARTINKA V PNG, PO STAROMU BILA V JPG
        $scope.imageId = 'blank';
    }
    else {
        $scope.imageId = appDataService.getImageForLogin(hostname)

        $scope.imageId.then(function (result) {
            $scope.imageId = result
        })
    }

    $scope.selflogin = false

    $scope.timereport = new Date().toString().replace(/ /g, "");
    $scope.showLoading = false

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function successfullsignup(id, email) {
        if (getParameterByName('status') == 'ok') {
            $('body').addClass('loader loaderopacity')
            window.history.pushState(null, null, "/#!/login");
            dataLayer.push({
                'event': 'signUp',
                'attributes': {
                    'userId': id, //user id
                    'email': email, //email addresss
                    'timestamp': Math.floor(+new Date() / 1000), //unix timestmap
                    'planType': 'trial'
                }
            });
        }
    }


    $scope.successfullSignIn = function (userid, planType) {
        dataLayer.push({
            'event': 'signIn',
            'attributes': {
                'userId': userid, //user id
                'timestamp': Math.floor(+new Date() / 1000), //unix timestmap
                'planType': planType
            }
        });
    }

    // User Login Handler
    $scope.login = function () {

        $('body').addClass('loader')

        userService.login($scope.userData).$promise
        .then(function (response) {

            // setTimeout(function () {
            //     $('body').removeClass('loader')
            // }, 7160)

            if (response.status) {
                $scope.successfullSignIn(response.user.id, response.user.planid)


                if (typeof $localStorage.user != "undefined")
                    delete $localStorage.user;
                if (typeof $localStorage.location_path != "undefined")
                    delete $localStorage.location_path;

                let storeuser = angular.copy($scope.userData)
                storeuser.password = 'hashed' + response.user.activateCode;

                $localStorage.user = storeuser;
                let date = new Date()
                $cookies.put('ezondID', response.user.company, {'expires': new Date((new Date()).getFullYear() + 1, new Date().getMonth(), new Date().getDay())})
                $cookies.put('visitorStatus', "logged-in", {'expires': new Date((new Date()).getFullYear() + 1, new Date().getMonth(), new Date().getDay())})
                $cookies.put('ezondPlan', response.user.planid, {'expires': new Date((new Date()).getFullYear() + 1, new Date().getMonth(), new Date().getDay())})


                if ($scope.selflogin) {
                    appDataService.selflogin = $scope.selflogin
                    successfullsignup(response.user.id, response.user.email)
                }

                if (response.user.role) {
                    $state.go('app.dashboard.client_home', {id: null})
                    return
                }
                $state.go('app.controlpanel.campaigns')
            } else {
                $scope.wronglogin = true
                $timeout(function () {
                    $scope.wronglogin = false
                }, 2400)
                // alert("Invalid Email or URL");
                $('body').removeClass('loader')
            }
        });
    }

    var time_out = setInterval(function () {
        if (typeof $localStorage.user != "undefined") {
            if (typeof $localStorage.user.first_name == "undefined") {
                $http.post("/user/restore_user_session", {user: $localStorage.user}).then(function (response) {
                    if (response.status) {
                        clearTimeout(time_out)
                    }
                });
            } else {
                delete $localStorage.user;
            }
        }
    }, 20000);


    $(function () {

        let temporaryemail = $cookies.get('temporaryemail')
        let temporarypassword = $cookies.get('temporarypassword')

        if (temporaryemail != '' && typeof temporaryemail != 'undefined' && temporarypassword != '' && typeof temporarypassword != 'undefined') {
            $scope.userData.email = temporaryemail
            $scope.userData.password = temporarypassword
            $cookies.remove('temporarypassword')
            $cookies.remove('temporaryemail')
            $scope.selflogin = true

            $scope.login()
        }

        if (typeof $localStorage.user != "undefined") {
            if (typeof $localStorage.user.first_name == "undefined") {
                $http.post("/user/restore_user_session", {user: $localStorage.user}).then(function (response) {
                    if (response.status) {
                        console.log("REALLY")
                        $state.go('app')
                    }
                });
            } else {
                delete $localStorage.user;
            }
        }
        ;

        $("#username").keydown(function (e) {
            if (e.keyCode == 13) {
                if ($scope.userData.email != "") $("#password").focus();
            }
        });

        $("#password").keydown(function (e) {
            if (e.keyCode == 13) {
                if ($scope.userData.email == "") $("#email").focus();
                else if ($scope.userData.password != "") $scope.login();
            }
        })
    });
});
