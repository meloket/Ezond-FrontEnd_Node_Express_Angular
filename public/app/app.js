/**
 * Main angular app file
 */
// 'use strict';

var ezondapp = angular.module('ezondapp', ['ui.router', 'ui.router.state.events', 'gridster', 'ngResource', 'ngIdle', 'ngStorage', 'ngMaterial', 'ngMessages', 'ngCookies', /*'ngRaven',*/ 'formio']);

/**
 * Appconfig
 */
ezondapp.config(function($urlRouterProvider, $stateProvider, KeepaliveProvider) {

        KeepaliveProvider.interval(1 * 60); // 5 minute keep-alive ping


        $urlRouterProvider.otherwise('/app');
        $stateProvider
            .state('publicform', {
                url: '/publicform/:id',
                template: `
                    <div layout="column">
                        <md-toolbar style="background: #f6f6f6 !important" class="md-whiteframe-glow-z1">
                            <div class="md-toolbar-tools">
                                <a href="/"><img ng-src="https://networks.ezond.com/apis/agencyProfileImage2.php?user_id={{agency_id}}" alt="" /></a>
                            </div>
                        </md-toolbar>
                        <md-content class="md-padding text-center">
                            <div ng-if="agency_id" layout="row" layout-align="center center">
                                <div style="max-width: 900px;">
                                    <formio form="form"></formio>
                                </div>
                            </div>
                            <div ng-hide="agency_id">
                                <h2>Form not found.</h2>
                            </div>
                        </md-content>
                    </div>
                    <style>
                        body{background-color: rgb(250,250,250) !important;}
                        /* md-content.md-default-theme, md-content {background-color: rgb(250,250,250); } */
                    </style>
                    `,
                controller: function ($scope, $state, form, $timeout, $http) {

                        function addActionToFormButton() {
                            angular.element('.btn-wizard-nav-next').on('click', function () {
                                if (angular.element('.btn.btn-primary.btn-wizard-nav-submit')){
                                    angular.element('.btn.btn-primary.btn-wizard-nav-submit').on('click', function () {
                                        $scope.saveserviceorder();
                                    })
                                } else {
                                    angular.element('.btn-wizard-nav-next').on('click', function () {
                                        addActionToFormButton()
                                    })
                                }
                            })
                        }
                        $timeout(addActionToFormButton, 200)

                        $scope.saveserviceorder = function () {
                            $scope.form.components.forEach(function (field) {
                                // field_input = angular.element('#' + field.id).find('input')
                                field_input = angular.element('#' + field.id).find(':input')
                                if (field_input.length){
                                    field.defaultValue = (angular.element('#' + field.id).find(':input')[0]).value
                                }
                            })
                            $http.post('/user/saveservice', {campaign_id: $scope.selectedCampaign,
                                                client_id: $scope.user_id,
                                                form_data: JSON.stringify($scope.form),
                                                status: 0,
                                                price: 0,
                                                type: 0
                            }, function (response) {
                            })
                        }

                    if (form){
                        $scope.agency_id = form.agency_id;
                        $scope.form = JSON.parse(form.form_fields);
                    } else {
                        $scope.agency_id = 0;

                    }
                },
                resolve: {
                    form: function ($stateParams, $http, $q, $timeout) {

                        let deferred = $q.defer();
                        $http.get('/user/getAgencyForms?form_id=' + $stateParams.id).then( function (response) {
                            // deferred.resolve(5)
                            // forme = JSON.parse(response.data.forms[0].form_fields);
                            // agency_id = response.data.forms[0].agency_id;
                            forme = response.data.forms[0]

                            deferred.resolve(forme)
                        })
                        return deferred.promise
                    }
                }
            })

            .state('login', {
                url: '/login',
                templateUrl: '/app/pages/login/login.html',
                controller: 'loginController',
                resolve: {
                    appData: function(appDataService) {
                        return appDataService.getAppData();
                    }
                }
            })
            .state('app', {
                url: '/app',
                abstract: true,
                views: {
                    'topbar': {
                        controller: 'campaignsController',
                        // templateUrl: '/app/pages/topbar.html'
                        template: '/app/pages/topbar/topbar.html',
                        resolve: {
                            campaignsList: function(appDataService, userService, dashboardService, $state) {
                                if (userService.user && userService.user.role == 'client') {
                                    console.log("Im doing that")
                                    $state.go('app.dashboard.home', { id: dashboardService.dashboard.id })
                                    return false;
                                }

                                appDataService.currentState = "inCampaignsView";
                                if (appDataService.appData && typeof appDataService.appData.user == "undefined")
                                    return false;
                                return false;
                                return appDataService.appData.user.dashboards;
                            }
                        }
                    },
                    '': {
                        controller: 'globalController',
                        templateUrl: '/app/pages/commons/global.html'
                    }
                },
                // templateUrl: '/app/pages/commons/global.html',
                // controller: 'globalController',
                resolve: {
                    appData: function(appDataService, $state, dashboardService) {
                        return appDataService.getAppData()
                            .then(function(data) {
                                return $state.go('app.controlpanel.campaigns')
                                return
                            }, function(data) {
                                if (data == 0) {
                                    return $state.go('login')
                                } else if (data == 1) {
                                    // return $state.go('app.dashboard.home', { id: null })
                                    return $state.go('app.dashboard.client_home')
                                    return false
                                }
                            });
                    }
                }
                // redirectTo: 'app.controlpanel.campaigns'
            })
            .state('app.controlpanel.pleasesubscribe', {
                url: '/subscriptions',
                controller: 'subscribePlease',
                templateUrl: '/app/pages/subscriptions/subscribePlease.html',
                resolve: {
                    closeForClient: function($state) {}
                }

            })
            .state('app.dashboard', {
                controller: function($scope, userService, dashboardService, $window, $document, $rootScope) {

                    $scope.showButton = userService.user.role == 'client' ? false : true;

                    $scope.addOvh = function() {
                        var bodyRef = angular.element($document[0].body);
                        bodyRef.addClass('ovh')
                    }


                    $scope.buttonref = angular.element('.showTaskm')

                    $scope.buttonHover = function() {
                        $scope.buttonref.removeClass('minShowTaskm')
                        $scope.buttonref.addClass('showTaskm')
                    }

                    window.addEventListener("scroll", function() {
                        if ($window.innerWidth < 1680) {
                            $scope.buttonref.removeClass('showTaskm')
                            $scope.buttonref.addClass('minShowTaskm')
                        }
                    }, false);

                    // $rootScope.showsidebar = true;
                    $rootScope.showsidebar = userService.isOwner();
                    $rootScope.customheight = userService.isOwner() ? '109px' : '61px';
                    // $rootScope.customheight = '109px';

                    $scope.showTaskm = function() {
                        $scope.addOvh()
                        $scope.$emit('taskManagement', { popup: 'taskManagement', targetWidget: dashboardService.dashboard });
                    }
                },
                templateUrl: '/app/pages/index.html',
            })
            .state('app.controlpanel.services', {
                url: '/buildservice',
                controller: 'formsController',
                templateUrl: '/app/pages/forms/forms.html'
            })
            .state('app.dashboard.client_home', {
                url: '/home',
                onEnter: function ($rootScope) {
                    $rootScope.showsidebar = false;
                    $rootScope.customheight = '61px';
                },
                controller: 'clienthomeController',
                templateUrl: '/app/pages/clienthome/index.html'
            })
            .state('app.dashboard.home', {

                url: '/dashboard/:id',
                controller: 'dashboardController',
                templateUrl: '/app/pages/dashboard/dashboard.html',
                resolve: {
                    dashboardInfo: function(dashboardService, appDataService, $stateParams, userService, $q) {
                        appDataService.currentState = "inWidgetsView";

                        var deferred = $q.defer();
                        var allow = false

                        if (typeof $stateParams == 'undefined' || $stateParams.id == '') {
                            return dashboardService.getDashboard(appDataService.appData.user.dashboards[0].id || 0)
                        }

                        userService.user.dashboards.forEach(function(dash, index, array) {
                            if ($stateParams.id == dash.id) {
                                allow = true
                            }
                        })
                        if (!allow) {
                            deferred.reject()
                            return
                        }

                        if ($stateParams.id && $stateParams.id != '') {
                            return dashboardService.getDashboard($stateParams.id); // TODO
                        } else {
                            if (!!appDataService.appData && appDataService.appData.user.dashboards.length > 0) {
                                return dashboardService.getDashboard(appDataService.appData.user.dashboards[0].id); // TODO
                            }
                        }
                    }
                }
            })
            .state('app.dashboard.intel', {
                url: '/intel/:id',
                controller: 'intelController',
                templateUrl: '/app/pages/intel/intel.html',
                resolve: {}
            })
            .state('app.dashboard.data_studio', {
                url: '/data_studio',
                controller: 'datastudioController',
                templateUrl: '/app/pages/data_studio/data_studio.html',
                resolve: {}
            })
            .state('app.dashboard.rank_ratings', {
                url: '/rank_ratings/:kind/:id',
                controller: 'rankratingsController',
                templateUrl: '/app/pages/rank_ratings/rank_ratings.html',
                resolve: {

                }
            })
            .state('app.dashboard.seo_ratings', {
                url: '/seo_ratings/:kind/:id',
                controller: 'seoRatingsController',
                templateUrl: '/app/pages/seo/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.analytics_ratings', {
                url: '/analytics_ratings/:kind/:id',
                controller: 'analyticsRatingsController',
                templateUrl: '/app/pages/analytics_ratings/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.adword_ratings', {
                url: '/adword_ratings/:kind/:id',
                controller: 'adwordRatingsController',
                templateUrl: '/app/pages/adword/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.fbads_ratings', {
                url: '/fbads_ratings/:kind/:id',
                controller: 'fbadRatingsController',
                templateUrl: '/app/pages/fbad/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.fb_ratings', {
                url: '/fb_ratings/:kind/:id',
                controller: 'fbRatingsController',
                templateUrl: '/app/pages/fb/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.youtube_ratings', {
                url: '/youtube_ratings/:kind/:id',
                controller: 'youtubeRatingsController',
                templateUrl: '/app/pages/youtube/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.adroll_ratings', {
                url: '/adroll_ratings/:kind',
                controller: 'adrollController',
                templateUrl: '/app/pages/adroll/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        console.log(ratinggroupProviders.ratingsInfo)
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.console_ratings', {
                url: '/console_ratings/:kind/:id',
                controller: 'consoleRatingsController',
                templateUrl: '/app/pages/console/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.callrail_ratings', {
                url: '/callrail_ratings/:kind/:id',
                controller: 'callrailRatingsController',
                templateUrl: '/app/pages/callrail/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })

            .state('app.dashboard.mailchimp_ratings', {
                url: '/mailchimp_ratings/:kind/:id',
                controller: 'mailchimpRatingsController',
                templateUrl: '/app/pages/mailchimp/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.controlpanel', {
                // abstract: true,
                // url: '',
                templateUrl: '/app/pages/controlpanel/controlpanel.html',
                controller: 'controlpanelController'
            })
            .state('app.showcampaign', {
                url: '/campaignmanagement/:id',
                controller: 'showcampaignController',
                resolve: {
                    openTaskManagement: function(appDataService, $stateParams) {
                        appDataService.openTaskmanagement = $stateParams.id
                    }
                }
            })
            .state('app.controlpanel.welcome-first-login', {
                url: '/welcome-first-login',
                templateUrl: '/app/pages/campaigns/welcome-first-login.html',
                controller: 'campaignsController',
                resolve: {
                    campaignsList: function(appDataService, userService, dashboardService, $state) {
                        if (typeof appDataService.appData.user == "undefined")
                            return false;
                        return appDataService.appData.user.dashboards;
                    }
                }

            })
            .state('app.controlpanel.campaigns', {
                url: '',
                // templateUrl: '/app/pages/campaigns/campaigns.html',
                // controller: 'campaignsController',
                views: {
                    'topbar': {
                        controller: 'campaignsController',
                        // templateUrl: '/app/pages/topbar.html'
                        template: '<topbar></topbar>'
                    },
                    '': {
                        controller: 'campaignsController',
                        templateUrl: '/app/pages/campaigns/campaigns.html'
                    }
                },
                resolve: {
                    campaignsList: function(appDataService, userService, dashboardService, $state) {
                        if (userService.user && userService.user.role == 'client') {
                            console.log("Im doing that")
                            $state.go('app.dashboard.home', { id: dashboardService.dashboard.id })
                            return false;
                        }

                        appDataService.currentState = "inCampaignsView";
                        if (appDataService.appData && typeof appDataService.appData.user == "undefined")
                            return false;
                        return false;
                        return appDataService.appData.user.dashboards;
                    }
                }
            })
            // .state('app.controlpanel.campaigns', {

            //     url: '/campaigns:id',
            //     templateUrl: '/app/pages/campaigns/campaigns.html',
            //     controller: 'campaignsController',

            //     resolve: {                
            //         campaignsList: function(appDataService) {
            //             appDataService.currentState = "inCampaignsView";
            //             if(typeof appDataService.appData == "undefined")
            //                 return false;
            //             return appDataService.appData.user.dashboards;
            //         },
            //         openTaskManagement: function(appDataService, $stateParams) {
            //             appDataService.openTaskmanagement = $stateParams.id
            //         }
            //     }
            // })
            .state('app.controlpanel.messages', {

                url: '/messages',
                templateUrl: '/app/pages/messages/messages.html',
                controller: 'messagesController'
            })
            .state('app.controlpanel.alerts', {

                url: '/alerts/:id',
                templateUrl: '/app/pages/alerts/alerts.html',
                controller: 'alertsController',
                resolve: {
                    campid: function($stateParams) {
                        return $stateParams.id
                    }
                }
            })
            .state('app.controlpanel.settings.services', {
                url: '/app/settings/settingsservices',
                template: '<div>Something cool is coming here</div>',
                controller: function() {

                }
            })
            .state('app.controlpanel.settings.addons', {
                url: '/app/settings/settingsaddons',
                template: '<div>Something cool is coming here</div>',
                controller: function() {

                }
            })
            .state('app.controlpanel.settings.profile', {
                url: '/app/settings/settingsprofile',
                template: `
                    <div style="width: 100%;padding: 120px 15px 35px 90px;">
                        <div style="max-width: 1070px; margin: 0 auto; padding: 40px; background: white;">
                            <h2 style="font-weight: 900;" class="no-margin">My profile</h2>
                            <div layout="row" class="layout-align-center">
                                <div layout="row" layout-align="center center">
                                    <div layout="row" layout-align="start center" flex="100">
                                        <div flex="40">
                                            <div class="common-ui-form-profile-photo">
                                                <div class="profile field">
                                                    <div class="profile-content">
                                                        <div class="action-links">
                                                            <div class="common-ui-form-file-upload">
                                                                <button type="button" class="file-upload-button btn btn-default btn-sm" ng-click="openFile()"><i class="icon icon-upload"></i></button>
                                                                <input onchange="angular.element(this).scope().fileNameChanged(this)" type="file" id="photo_file" style="display: none;" >
                                                            </div>
                                                        </div>
                                                        <img ng-src="{{::backendUrl}}apis/profileImage.php?preview={{preview}}&user_id={{user.id}}&{{timereport}}" class="profile-image">
                                                    </div>
                                                </div>
                                                <div></div>
                                            </div>
                                        </div>
                                        <div flex="60" md-padding style="padding-left: 15%">
                                            <div layout="row" class="margin-sm-bottom">
                                                <div class="margin-sm-right">
                                                    <label for="first_name">First name</label>
                                                    <input type="text" id="first_name" name="first_name" class="margin-sm-bottom form-control margin-sm-right" placeholder="First Name" value="{{user.first_name}}" maxlength="100">
                                                </div>
                                                <div class="">
                                                    <label for="last_name">Last name</label>
                                                    <input type="text" id="last_name" name="last_name" class="form-control" placeholder="Last Name" value="{{user.last_name}}" maxlength="100">
                                                </div>
                                            </div>
                                            <div class="margin-sm-bottom margin-top">
                                                <label for="email">Email</label>
                                                <input type="text" class="form-control" ng-model="email" ng-blur="emailblur()" style="max-width: 339px;" id="email" name="email" md-margin placeholder="Email" maxlength="100">
                                                <div class="alert alert-danger margin-top" style="padding: 10px 15px;" ng-show="enteremailalert">Enter email.</div>
                                                <div class="alert alert-danger margin-top" style="padding: 10px 15px;" ng-show="entervalidemail">Enter valid email.</div>
                                            </div>
                                            <div layout="row" class="margin-sm-bottom margin-top">
                                                <div class="margin-sm-right">
                                                    <label for="password">New password</label>
                                                    <input type="password" ng-model="password" id="password" class="form-control margin-sm-right" name="password" placeholder="New Password" value="" maxlength="32">
                                                </div>
                                                <div class="">
                                                    <label for="confirmPassword">Confirm password</label>
                                                    <input ng-blur="passwordblur()" type="password" id="confirmPassword" ng-model="confirmPassword" class="form-control" name="confirmPassword" placeholder="Confirm Password" value="" maxlength="32">
                                                </div>
                                            </div>
                                            <div class="alert alert-danger margin-top" style="padding: 10px 15px;" ng-show="passwordsmissmatch">Passwords don't match.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div layout="row" layout-align="center center">
                                <md-button ng-disabled="enteremailalert || entervalidemail || passwordsmissmatch" class="md-raised md-primary" ng-click="saveProfile()">Save</md-button>
                            </div>
                        </div>
                    </div>
                        `,
                controller: function(subscriptionPlansProviders, ratinggroupProviders, $http, userService, $state, appDataService, $q, $window, fileUploadService, $localStorage, $sessionStorage, $scope, $timeout) {
                    $scope.backendUrl = appDataService.appData.backendUrl;
                    $scope.user = userService.user;
                    $scope.ownerCheck = (typeof userService.user.role == "undefined");
                    $scope.profile_step = 'my_profile';
                    $scope.timereport = new Date().toString().replace(/ /g, "");
                    $scope.preview = 0;
                    $scope.agencyPreview = 0;
                    $scope.planTermEnd = '';
                    $scope.email = angular.copy($scope.user.email)

                    $scope.emailblur = function() {
                        if (!($scope.email)) {
                            $scope.enteremailalert = true
                        } else {
                            $scope.enteremailalert = false
                            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            if (re.test(String($scope.email).toLowerCase())) {
                                $scope.entervalidemail = false
                            } else {
                                $scope.entervalidemail = true
                            }
                        }
                    }

                    $scope.passwordblur = function() {
                        if ($scope.password != '' != $scope.confirmPassword) {

                        }
                        if ($scope.password !== $scope.confirmPassword) {
                            $scope.passwordsmissmatch = true
                        } else {
                            $scope.passwordsmissmatch = false
                        }
                    }

                    $scope.fileNameChanged = function(file) {
                        $(".profile.field").addClass("loading");
                        $scope.uploadFiles(file.files[0]);
                    }

                    $scope.fileNameChanged2 = function(file) {
                        $(".profile.field").addClass("loading");
                        $scope.uploadAgencyFiles(file.files[0]);
                    }

                    $scope.blurDomain = function() {
                        if ($scope.superDomainName = '')
                            $scope.changeDomain = false
                    }

                    $scope.managesubscription = function() {
                        $scope.closePopup()
                        $state.go('app.controlpanel.pleasesubscribe')
                    }

                    $scope.hideButton = false

                    $scope.plans = subscriptionPlansProviders.plans
                    $scope.classForLoadingPlans = false

                    if (appDataService.appData)
                        $scope.currentPlan = appDataService.appData.user.planSubscribed;

                    $scope.canSuperDomain = false

                    $scope.planName = function() {
                        if ($scope.plans.find(function(plan) {
                                return plan.id == $scope.currentPlan
                            }))
                            return $scope.plans.find(function(plan) {
                                return plan.id == $scope.currentPlan
                            }).name
                    }

                    function getExpireTime() {
                        $http({
                            method: "POST",
                            url: "/getTermEnd",
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(function(response) {
                            var date = new Date(response.data * 1000);
                            var day = date.getDate();
                            var monthIndex = date.getMonth() + 1;
                            var year = date.getFullYear();
                            $scope.planTermEnd = moment.unix(response.data).format("D MMMM YYYY")
                        })
                    }

                    getExpireTime();


                    $scope.closePopup = function() {
                        $scope.removeTempFile();
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 0;
                        $scope.agencyPreview = 0;
                        $scope.profile_step = 'my_profile';
                        $scope.$emit('hidePopup', { popup: 'userprofile' });
                    }

                    $scope.changeDomain = function() {
                        if ($("#domainName").prop("value").indexOf("ezond.com") == -1)
                            $scope.showHint = true
                        else
                            $scope.showHint = false

                        if ($("#domainName").prop("value").search(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/) == -1)
                            $scope.errordomain = true
                        else
                            $scope.errordomain = false

                    }


                    $scope.saveProfile = function() {
                        if ($("#first_name").prop("value") == "") {
                            $("#first_name").focus();
                            return false;
                        }
                        if ($("#last_name").prop("value") == "") {
                            $("#last_name").focus();
                            return false;
                        }
                        if ($("#email").prop("value") == "") {
                            $("#email").focus();
                            return false;
                        }
                        if ($("#password").prop("value") != $("#confirmPassword").prop("value")) {
                            $("#password").prop("value", "");
                            $("#confirmPassword").prop("value", "");
                            $("#password").focus();
                            return false;
                        }
                        if ($("#adminPassword").prop("value") != $("#confirmAdminPassword").prop("value")) {
                            $("#adminPassword").prop("value", "");
                            $("#confirmAdminPassword").prop("value", "");
                            $("#adminPassword").focus();
                            return false;
                        }
                        var staff = angular.copy($scope.user);

                        staff.first_name = $("#first_name").prop("value");
                        staff.last_name = $("#last_name").prop("value");
                        staff.email = $("#email").prop("value");
                        staff.password = $("#password").prop("value");


                        staff.domainName = $("#domainName").prop("value");

                        staff.adminEmail = $("#adminEmail").prop("value");
                        staff.adminPassword = $("#adminPassword").prop("value");

                        $scope.saveToDefaultFile();

                        userService.updateProfile(staff).$promise
                            .then(function(response) {
                                if (response.status) {
                                    userService.user.first_name = staff.first_name;
                                    userService.user.last_name = staff.last_name;
                                    userService.user.email = staff.email;
                                    userService.user.domainName = staff.domainName;
                                    userService.user.adminPassword = staff.adminPassword;
                                    $scope.$emit('hidePopup', { popup: 'userprofile' });
                                    $scope.$parent.$broadcast('refreshProfile', {});
                                }
                            });

                    }

                    $scope.openFile = function() {
                        $("#photo_file").click();
                    }

                    $scope.openAgencyFile = function() {
                        $("#agency_photo_file").click();
                    }


                    $scope.userphoto = function() {
                        var file = event.target.files[0];
                        $(".profile.field").addClass("loading");
                        $scope.uploadFiles(file);
                    }


                    // NOW UPLOAD THE FILES.
                    $scope.uploadFiles = function(file) {
                        //FILL FormData WITH FILE DETAILS.
                        var data = new FormData();

                        data.append("uploadedFile", file);

                        // ADD LISTENERS.
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferComplete, false);

                        // SEND FILE DETAILS TO THE API.
                        objXhr.open("POST", $scope.backendUrl + "apis/uploadPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferComplete(e) {
                        $(".profile.field").removeClass("loading");
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 1;
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.uploadAgencyFiles = function(file) {

                        //FILL FormData WITH FILE DETAILS.
                        var data = new FormData();

                        data.append("uploadedFile", file);

                        // ADD LISTENERS.
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferAgencyComplete, false);

                        // SEND FILE DETAILS TO THE API.
                        objXhr.open("POST", $scope.backendUrl + "apis/uploadAgencyPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferAgencyComplete(e) {
                        $(".profile.field").removeClass("loading");
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.agencyPreview = 1;
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.saveToDefaultFile = function() {

                        var data = new FormData();
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferComplete2, false);

                        objXhr.open("POST", $scope.backendUrl + "apis/changeToDefaultPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferComplete2(e) {
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 0;
                        $scope.agencyPreview = 0;
                        $scope.profile_step = 'my_profile';
                        userService.timereport = $scope.timereport;
                        $scope.$parent.$broadcast('refreshProfilePhoto', {});
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.removeTempFile = function() {

                        var data = new FormData();
                        var objXhr = new XMLHttpRequest();

                        objXhr.open("POST", $scope.backendUrl + "apis/removeTemporaryPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    $scope.removeTempFile();
                }
            })
            .state('app.controlpanel.settings.agency', {
                url: '/settings/settingsagency',
                template: `<style>
                      #campaignactionbuttons>div.active{
                          color: white !important;
                      }
                      #campaignactionbuttons>div.active{
                        background: #0076FF;
                        border-color: #0076ffa6 !important;
                      }
                      #campaignactionbuttons {
                            display: block; 
                            margin: 0 auto;
                            text-align: center;
                            margin-top: 35px;
                      }
                      #campaignactionbuttons > div i{
                        color: #0076FC;
                      }
                      #campaignactionbuttons > div{
                        color: #0076FC;
                        font-size: 17px;
                        border-radius: 3px;
                        display: inline-block;
                        border: 1px solid #0076FC;
                        padding: 4px 8px;
                      }
                    </style>
                    <div style="width: 100%;padding: 120px 15px 35px 90px;">
                        <div style="max-width: 1070px; margin: 0 auto; padding: 40px; background: white;">
                            <h2 style="font-weight: 900;" class="no-margin">Agency settings</h2>
                            <div>
                                <div layout="row" layout-align="center center">
                                    <div layout="row" layout-align="start center" flex="100">
                                        <div flex="40">
                                            <div class="common-ui-form-profile-photo">
                                                <div class="profile field">
                                                    <div class="profile-content">
                                                        <div class="action-links">
                                                            <div class="common-ui-form-file-upload">
                                                                <button type="button" class="file-upload-button btn btn-default btn-sm" ng-click="openAgencyFile()"><i class="icon icon-upload"></i></button>
                                                                <input onchange="angular.element(this).scope().fileNameChanged2(this)" type="file" id="agency_photo_file" style="display: none;">
                                                            </div>
                                                        </div>
                                                        <img ng-src="{{::backendUrl}}apis/agencyProfileImage.php?preview={{agencyPreview}}&user_id={{user.id}}&{{timereport}}">
                                                    </div>
                                                </div>
                                                <div></div>
                                            </div>
                                        </div>
                                        <div flex="60" md-padding style="padding-left: 15%">
                                            <div class="margin-sm-bottom margin-top">
                                                <label for="domainName" >White Label Domain Name</label>
                                                <div>
                                                    <span class="md-subhead" layout-align="start center" layout="row">
                                                        <span style="padding-right: 4px; ">https://</span>
                                                        
                                                        <input type="text" id="domainName" ng-model-options="{ debounce: 600 }" ng-change="changeDomain()" style="padding-left: 4px;" ng-model="user.domainName" class="form-control" >
                                                    </span>
                                                    <div ng-show="showHint" class="margin-top">You will need to configure your web server 
                                                        <i class="ion-ios-help-outline cursor ion" style="font-size: 19px; vertical-align: middle;" >
                                                            <md-tooltip style="font-size: 14px" md-z-index="213123123">Enter <i class="white-c">yoursubdomain</i>.ezond.com if you dont want configure your server</md-tooltip>
                                                        </i>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="campaignactionbuttons">
                              <div ng-class="{'active': activesave}" class="curs-pointer text-uppercase" ng-click="saveProfile()">
                                Save
                              </div>
                            </div>
                        </div>
                    </div>`,
                controller: function(subscriptionPlansProviders, ratinggroupProviders, $http, userService, $state, appDataService, $q, $window, fileUploadService, $localStorage, $sessionStorage, $scope) {
                    $scope.backendUrl = appDataService.appData.backendUrl;
                    $scope.user = userService.user;
                    $scope.ownerCheck = (typeof userService.user.role == "undefined");
                    $scope.profile_step = 'my_profile';
                    $scope.timereport = new Date().toString().replace(/ /g, "");
                    $scope.preview = 0;
                    $scope.agencyPreview = 0;
                    $scope.planTermEnd = '';

                    $scope.clientsform = 0;

                    $scope.owner_id = userService.user.agencyID ? userService.user.agencyID : userService.user.id;

                    $scope.saveNewForm = function() {
                        $http.post('/user/saveAgencyForm', { form: JSON.stringify($scope.clientsform), agency_id: $scope.owner_id }, function(response) {
                            $scope.getFormsList()
                        })
                    }

                    $scope.getFormsList = function() {
                        $http.get('/user/getAgencyForms?agency_id=' + $scope.owner_id).then(function(response) {
                            if (response.data.forms.length != 0) {
                                $scope.clientsform = JSON.parse(response.data.forms[response.data.forms.length - 1].form_fields);
                            } else {
                                $scope.clientsform = {
                                    components: [],
                                    display: 'form'
                                }
                            };
                        })
                    }

                    $scope.getFormsList();

                    $scope.defaultform = {
                        components: [],
                        display: 'form'
                    };


                    $scope.fileNameChanged = function(file) {
                        $(".profile.field").addClass("loading");
                        $scope.uploadFiles(file.files[0]);
                    }

                    $scope.fileNameChanged2 = function(file) {
                        $(".profile.field").addClass("loading");
                        $scope.uploadAgencyFiles(file.files[0]);
                    }

                    $scope.blurDomain = function() {
                        if ($scope.superDomainName = '')
                            $scope.changeDomain = false
                    }

                    $scope.managesubscription = function() {
                        $scope.closePopup()
                        $state.go('app.controlpanel.pleasesubscribe')
                    }

                    $scope.hideButton = false

                    $scope.plans = subscriptionPlansProviders.plans
                    $scope.classForLoadingPlans = false

                    if (appDataService.appData)
                        $scope.currentPlan = appDataService.appData.user.planSubscribed;

                    $scope.canSuperDomain = false

                    $scope.planName = function() {
                        if ($scope.plans.find(function(plan) {
                                return plan.id == $scope.currentPlan
                            }))
                            return $scope.plans.find(function(plan) {
                                return plan.id == $scope.currentPlan
                            }).name
                    }

                    function getExpireTime() {
                        $http({
                            method: "POST",
                            url: "/getTermEnd",
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(function(response) {
                            var date = new Date(response.data * 1000);
                            var day = date.getDate();
                            var monthIndex = date.getMonth() + 1;
                            var year = date.getFullYear();
                            $scope.planTermEnd = moment.unix(response.data).format("D MMMM YYYY")
                        })
                    }

                    getExpireTime();


                    $scope.closePopup = function() {
                        $scope.removeTempFile();
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 0;
                        $scope.agencyPreview = 0;
                        $scope.profile_step = 'my_profile';
                        $scope.$emit('hidePopup', { popup: 'userprofile' });
                    }

                    $scope.changeDomain = function() {
                        if ($("#domainName").prop("value").indexOf("ezond.com") == -1)
                            $scope.showHint = true
                        else
                            $scope.showHint = false

                        if ($("#domainName").prop("value").search(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/) == -1)
                            $scope.errordomain = true
                        else
                            $scope.errordomain = false

                    }


                    $scope.saveProfile = function() {
                        if ($("#first_name").prop("value") == "") {
                            $("#first_name").focus();
                            return false;
                        }
                        if ($("#last_name").prop("value") == "") {
                            $("#last_name").focus();
                            return false;
                        }
                        if ($("#email").prop("value") == "") {
                            $("#email").focus();
                            return false;
                        }
                        if ($("#password").prop("value") != $("#confirmPassword").prop("value")) {
                            $("#password").prop("value", "");
                            $("#confirmPassword").prop("value", "");
                            $("#password").focus();
                            return false;
                        }
                        if ($("#adminPassword").prop("value") != $("#confirmAdminPassword").prop("value")) {
                            $("#adminPassword").prop("value", "");
                            $("#confirmAdminPassword").prop("value", "");
                            $("#adminPassword").focus();
                            return false;
                        }
                        var staff = angular.copy($scope.user);

                        staff.first_name = $("#first_name").prop("value");
                        staff.last_name = $("#last_name").prop("value");
                        staff.email = $("#email").prop("value");
                        staff.password = $("#password").prop("value");


                        staff.domainName = $("#domainName").prop("value");

                        staff.adminEmail = $("#adminEmail").prop("value");
                        staff.adminPassword = $("#adminPassword").prop("value");

                        $scope.saveToDefaultFile();

                        userService.updateProfile(staff).$promise
                            .then(function(response) {
                                if (response.status) {
                                    userService.user.first_name = staff.first_name;
                                    userService.user.last_name = staff.last_name;
                                    userService.user.email = staff.email;
                                    userService.user.domainName = staff.domainName;
                                    userService.user.adminPassword = staff.adminPassword;
                                    $scope.$emit('hidePopup', { popup: 'userprofile' });
                                    $scope.$parent.$broadcast('refreshProfile', {});
                                }
                            });

                    }

                    $scope.openFile = function() {
                        $("#photo_file").click();
                    }

                    $scope.openAgencyFile = function() {
                        $("#agency_photo_file").click();
                    }


                    $scope.userphoto = function() {
                        var file = event.target.files[0];
                        $(".profile.field").addClass("loading");
                        $scope.uploadFiles(file);
                    }


                    // NOW UPLOAD THE FILES.
                    $scope.uploadFiles = function(file) {
                        //FILL FormData WITH FILE DETAILS.
                        var data = new FormData();

                        data.append("uploadedFile", file);

                        // ADD LISTENERS.
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferComplete, false);

                        // SEND FILE DETAILS TO THE API.
                        objXhr.open("POST", $scope.backendUrl + "apis/uploadPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferComplete(e) {
                        $(".profile.field").removeClass("loading");
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 1;
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.uploadAgencyFiles = function(file) {

                        //FILL FormData WITH FILE DETAILS.
                        var data = new FormData();

                        data.append("uploadedFile", file);

                        // ADD LISTENERS.
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferAgencyComplete, false);

                        // SEND FILE DETAILS TO THE API.
                        objXhr.open("POST", $scope.backendUrl + "apis/uploadAgencyPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferAgencyComplete(e) {
                        $(".profile.field").removeClass("loading");
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.agencyPreview = 1;
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.saveToDefaultFile = function() {

                        var data = new FormData();
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferComplete2, false);

                        objXhr.open("POST", $scope.backendUrl + "apis/changeToDefaultPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferComplete2(e) {
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 0;
                        $scope.agencyPreview = 0;
                        $scope.profile_step = 'my_profile';
                        userService.timereport = $scope.timereport;
                        $scope.$parent.$broadcast('refreshProfilePhoto', {});
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.removeTempFile = function() {

                        var data = new FormData();
                        var objXhr = new XMLHttpRequest();

                        objXhr.open("POST", $scope.backendUrl + "apis/removeTemporaryPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    $scope.removeTempFile();
                }
            })
            .state('app.controlpanel.settings.billing', {
                url: '/app/settings/settingsbilling',
                template: `<md-tab-content layout-align="center center"  layout="row">
                                <div style="text-align: center">
                                    <h2>Your current plan <span style="font-weight: bold; color: blue">{{currentPlan.name}}</span></h2>
                                    <h3 ng-show="currentPlan.trial">Expires at: {{planTermEnd}}</h3>
                                    <md-button class="md-primary" ng-click="managesubscription()">Manage subscription</md-button>
                                </div>
                            </md-tab-content>`,
                controller: function(subscriptionPlansProviders, ratinggroupProviders, $http, userService, $state, appDataService, $q, $window, fileUploadService, $localStorage, $sessionStorage, $scope) {
                    $scope.backendUrl = appDataService.appData.backendUrl;
                    $scope.user = userService.user;
                    $scope.ownerCheck = (typeof userService.user.role == "undefined");
                    $scope.profile_step = 'my_profile';
                    $scope.timereport = new Date().toString().replace(/ /g, "");
                    $scope.preview = 0;
                    $scope.agencyPreview = 0;
                    $scope.planTermEnd = '';


                    $scope.fileNameChanged = function(file) {
                        $(".profile.field").addClass("loading");
                        $scope.uploadFiles(file.files[0]);
                    }

                    $scope.fileNameChanged2 = function(file) {
                        $(".profile.field").addClass("loading");
                        $scope.uploadAgencyFiles(file.files[0]);
                    }

                    $scope.blurDomain = function() {
                        if ($scope.superDomainName = '')
                            $scope.changeDomain = false
                    }

                    $scope.managesubscription = function() {
                        $scope.closePopup()
                        $state.go('app.controlpanel.pleasesubscribe')
                    }

                    $scope.hideButton = false

                    $scope.plans = subscriptionPlansProviders.plans
                    $scope.classForLoadingPlans = false

                    if (appDataService.appData)
                        $scope.currentPlan = appDataService.appData.user.planSubscribed;

                    $scope.canSuperDomain = false

                    $scope.planName = function() {
                        if ($scope.plans.find(function(plan) {
                                return plan.id == $scope.currentPlan
                            }))
                            return $scope.plans.find(function(plan) {
                                return plan.id == $scope.currentPlan
                            }).name
                    }

                    function getExpireTime() {
                        $http({
                            method: "POST",
                            url: "/getTermEnd",
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(function(response) {
                            var date = new Date(response.data * 1000);
                            var day = date.getDate();
                            var monthIndex = date.getMonth() + 1;
                            var year = date.getFullYear();
                            $scope.planTermEnd = moment.unix(response.data).format("D MMMM YYYY")
                        })
                    }

                    getExpireTime();


                    $scope.closePopup = function() {
                        $scope.removeTempFile();
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 0;
                        $scope.agencyPreview = 0;
                        $scope.profile_step = 'my_profile';
                        $scope.$emit('hidePopup', { popup: 'userprofile' });
                    }

                    $scope.changeDomain = function() {
                        if ($("#domainName").prop("value").indexOf("ezond.com") == -1)
                            $scope.showHint = true
                        else
                            $scope.showHint = false

                        if ($("#domainName").prop("value").search(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/) == -1)
                            $scope.errordomain = true
                        else
                            $scope.errordomain = false

                    }


                    $scope.saveProfile = function() {
                        if ($("#first_name").prop("value") == "") {
                            $("#first_name").focus();
                            return false;
                        }
                        if ($("#last_name").prop("value") == "") {
                            $("#last_name").focus();
                            return false;
                        }
                        if ($("#email").prop("value") == "") {
                            $("#email").focus();
                            return false;
                        }
                        if ($("#password").prop("value") != $("#confirmPassword").prop("value")) {
                            $("#password").prop("value", "");
                            $("#confirmPassword").prop("value", "");
                            $("#password").focus();
                            return false;
                        }
                        if ($("#adminPassword").prop("value") != $("#confirmAdminPassword").prop("value")) {
                            $("#adminPassword").prop("value", "");
                            $("#confirmAdminPassword").prop("value", "");
                            $("#adminPassword").focus();
                            return false;
                        }
                        var staff = angular.copy($scope.user);

                        staff.first_name = $("#first_name").prop("value");
                        staff.last_name = $("#last_name").prop("value");
                        staff.email = $("#email").prop("value");
                        staff.password = $("#password").prop("value");


                        staff.domainName = $("#domainName").prop("value");

                        staff.adminEmail = $("#adminEmail").prop("value");
                        staff.adminPassword = $("#adminPassword").prop("value");

                        $scope.saveToDefaultFile();

                        userService.updateProfile(staff).$promise
                            .then(function(response) {
                                if (response.status) {
                                    userService.user.first_name = staff.first_name;
                                    userService.user.last_name = staff.last_name;
                                    userService.user.email = staff.email;
                                    userService.user.domainName = staff.domainName;
                                    userService.user.adminPassword = staff.adminPassword;
                                    $scope.$emit('hidePopup', { popup: 'userprofile' });
                                    $scope.$parent.$broadcast('refreshProfile', {});
                                }
                            });

                    }

                    $scope.openFile = function() {
                        $("#photo_file").click();
                    }

                    $scope.openAgencyFile = function() {
                        $("#agency_photo_file").click();
                    }


                    $scope.userphoto = function() {
                        var file = event.target.files[0];
                        $(".profile.field").addClass("loading");
                        $scope.uploadFiles(file);
                    }


                    // NOW UPLOAD THE FILES.
                    $scope.uploadFiles = function(file) {
                        //FILL FormData WITH FILE DETAILS.
                        var data = new FormData();

                        data.append("uploadedFile", file);

                        // ADD LISTENERS.
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferComplete, false);

                        // SEND FILE DETAILS TO THE API.
                        objXhr.open("POST", $scope.backendUrl + "apis/uploadPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferComplete(e) {
                        $(".profile.field").removeClass("loading");
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 1;
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.uploadAgencyFiles = function(file) {

                        //FILL FormData WITH FILE DETAILS.
                        var data = new FormData();

                        data.append("uploadedFile", file);

                        // ADD LISTENERS.
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferAgencyComplete, false);

                        // SEND FILE DETAILS TO THE API.
                        objXhr.open("POST", $scope.backendUrl + "apis/uploadAgencyPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferAgencyComplete(e) {
                        $(".profile.field").removeClass("loading");
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.agencyPreview = 1;
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.saveToDefaultFile = function() {

                        var data = new FormData();
                        var objXhr = new XMLHttpRequest();
                        objXhr.addEventListener("load", transferComplete2, false);

                        objXhr.open("POST", $scope.backendUrl + "apis/changeToDefaultPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    // CONFIRMATION.
                    function transferComplete2(e) {
                        $scope.timereport = new Date().toString().replace(/ /g, "");
                        $scope.preview = 0;
                        $scope.agencyPreview = 0;
                        $scope.profile_step = 'my_profile';
                        userService.timereport = $scope.timereport;
                        $scope.$parent.$broadcast('refreshProfilePhoto', {});
                        $scope.$apply();
                    }

                    // NOW UPLOAD THE FILES.
                    $scope.removeTempFile = function() {

                        var data = new FormData();
                        var objXhr = new XMLHttpRequest();

                        objXhr.open("POST", $scope.backendUrl + "apis/removeTemporaryPhoto.php?user_id=" + $scope.user.id);
                        objXhr.send(data);
                    }

                    $scope.removeTempFile();
                }
            })
            .state('app.controlpanel.settings', {
                url: '/settings',
                templateUrl: '/app/pages/settings/settings.html',
                controller: 'settingsController'
            })
            .state('app.controlpanel.tasks', {

                url: '/tasks',
                templateUrl: '/app/pages/tasks/tasks.html',
                controller: 'tasksController'
            })
            .state('app.controlpanel.users', {

                url: '/app/users',
                templateUrl: '/app/pages/users/users.html',
                controller: 'usersController',

                resolve: {
                    usersList: function(appDataService, userService) {
                        appDataService.currentState = "inUsersView";
                        if (userService.user.role == 'client') {
                            $state.go('app.dashboard.home', { id: dashboardService.dashboard.id })
                        }

                        if (appDataService.appData) {
                            console.log('done1');
                            return appDataService.appData.user.childUsers;
                        } else {
                            console.log('done2');
                            return {}
                        }
                    }
                }
            })
            .state('chat', {
                url: '/chat',
                templateUrl: '/test.htm'
            })
            .state('app.setup', {

                url: '/setup',
                templateUrl: '/app/pages/setupwizard/setupwizard.html',
                controller: 'setupWizardController',

                onEnter: function() {
                    document.body.classList.add('setupwizard-body');
                },
                onExit: function() {

                    document.body.classList.remove('setupwizard-body');
                }
            });
    })
    .run(function($state, $rootScope, Idle, $http, $location, $transitions, userService, $mdToast) {

        $transitions.onStart({ from: 'app.dashboard.client_home' }, function(trans) { 
            $rootScope.showsidebar = true;
            $rootScope.customheight = '109px';
        })

        $transitions.onStart({ to: '**' }, function(trans) {
            if (trans._options.relative && trans._options.relative == "app.controlpanel") {
                angular.element('.side-menu-points').scope().pleasesubscribeState = false
            }
            if (trans._options.relative && trans._options.relative.name == "app.dashboard.home" && trans._targetState._identifier == "app.controlpanel.campaigns") {
                if (trans.deferred) {
                    // Transition breaks to prevent showing campaigns page for 'clients'
                    // TRANSLIT
                    // Kogda klient zaxodit, emu na doli sekundi pokazivaetsya stranica s kompaniyami, a tolko potom state menyalsya na nujniy, etot reject otmenyal tot perexod.
                    console.log("Transition stopped")
                    trans.deferred.reject()
                }
            }
            if (trans.to().name == 'app.controlpanel.campaigns' && !userService.isOwner()) {
                // trans._deferred.reject()
                // $state.go('app.dashboard.client_home')
                return false
            }
        })


        $transitions.onStart({}, function(trans) {

            // if (trans.to().name == 'app' && userService.user.role == 'client') {

            // }

            if (trans.to().name == 'app.controlpanel.pleasesubscribe' && !userService.isOwner()) {
                $mdToast.show($mdToast.simple().textContent('You have no access to this page.'));
                return false
            }


            $('body').addClass('loader loaderopacity')
        });

        $transitions.onError({}, function(trans) {
            setTimeout(function(argument) {
                $('body').removeClass('loader')
            }, 10)
            setTimeout(function(argument) {
                $('body').removeClass('loaderopacity')
            }, 10)
        })

        $transitions.onEnter({}, function(trans) {

        })

        $transitions.onBefore({}, function(trans) {
        })

        $transitions.onFinish({}, function(trans) {
            setTimeout(function(argument) {
                $('body').removeClass('loader')
            }, 300)
            setTimeout(function(argument) {
                $('body').removeClass('loaderopacity')
            }, 600)
        })

        $transitions.onSuccess({}, function(trans) {
            setTimeout(function(argument) {
                $('body').removeClass('loader')
            }, 300)
            setTimeout(function(argument) {
                $('body').removeClass('loaderopacity')
            }, 600)
        });
    });

// Manual app init
angular.element(document).ready(function() {
    angular.bootstrap(document.body, ['ezondapp']);
});




function logout() {
    var scope = angular.element($("#control-panel-logout2")).scope();
    scope.$apply(function() {
        scope.logout();
    })
}

function googleSignOut() {
    if (!gapi.auth2) return
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        console.log('User signed out.');
    });
    auth2.disconnect()
}

function userprofile() {
    displayAppPopups()
    var scope = angular.element($("#control-panel-logout2")).scope();
    scope.$apply(function() {
        scope.userprofile();
    })
}


function logout3() {
    googleSignOut()
    var scope = angular.element($("#logout-subscribe-panel")).scope();
    scope.$apply(function() {
        scope.logout();
    })
}


function logout2() {
    googleSignOut()
    var scope = angular.element($("#control-panel-logout")).scope();
    scope.$apply(function() {
        scope.logout();
    })
}

function userprofile2() {

    var scope = angular.element($("#control-panel-logout")).scope();
    scope.$apply(function() {
        scope.userprofile();
    })
}

function reconnect_session() {
    var scope = angular.element($("#control-panel-logout")).scope();
    if (typeof scope != "undefined") {
        scope.$apply(function() {
            scope.reconnectSession();
        })
    }
}

function reconnect_session_2() {
    var scope = angular.element($("#control-panel-logout2")).scope();
    if (typeof scope != "undefined") {
        scope.$apply(function() {
            scope.reconnectSession();
        })
    }
}


function showIntegrations(campaign = {}) {
    displayAppPopups()

    var scope = angular.element($("#control-panel-logout2")).scope();
    scope.$apply(function() {
        scope.showIntegrations(campaign);
    })
}

function editCampaign() {
    displayAppPopups()
    var scope = angular.element($("#control-panel-logout2")).scope();
    scope.$apply(function() {
        scope.editCampaign();
    })
}

function setActive_users() {
    displayAppPopups()
    var scope = angular.element($(".show-pop-user-panel")).scope();
    scope.$apply(function() {
        scope.setActive('users');
    })
}

function show_tasks() {
    displayAppPopups()
    var scope = angular.element($(".show-pop-user-panel")).scope();
    scope.$apply(function() {
        scope.show_tasks();
    })
}

function setActive_campaigns() {
    var scope = angular.element($(".show-pop-user-panel")).scope();
    scope.$apply(function() {
        scope.setActive('campaigns');
    })
}



function customOrNot() {
    $("#customdateholder").show()
    $(".daterangepicker.dropdown-menu.ltr.opensleft").addClass("samo")
    $("li[data-range-key='Custom Range']").click()
    var skopa = angular.element('.toGetController').scope()
    skopa.changecustomdate = true
}


function hideCompareVariants(el) {
    // console.log()
    var skopa = angular.element(el).scope()
    skopa.compare = $('.toGetController').prop("checked")
    skopa.$apply()
    if ($(el).prop("checked")) {
        $(el).parent().parent().find("div").show()
    } else {
        $("#type0").prop('checked', true)
        $(".samo").removeClass("samo")
        $(el).parent().parent().find("div").hide()
    }
}

function clearNoticeArr() {
    var scope = angular.element($("#control-panel-logout")).scope();
    // var scope = angular.element($(".show-pop-user-panel")).scope();
    scope.$apply(function() {
        scope.clearNoticeArr();
    })
}

function clearNoticeArr2() {
    var scope = angular.element($(".show-pop-user")).scope();
    scope.$apply(function() {
        scope.clearNoticeArr();
    })
}

function changeCampaignStatus(__status_val) {
    displayAppPopups()


    var scope = angular.element($(".changeCampaignStatusDropdown")).scope();
    scope.$apply(function() {
        scope.changeCampaignStatus(__status_val);
    })
}

function clearNoticeInfo(__notice_id) {
    var scope = angular.element($("#control-panel-logout")).scope();
    scope.$apply(function() {
        scope.clearNoticeInfo(__notice_id);
    })
}


var popupsHidden = true;

function displayAppPopups() {
    if (!popupsHidden) return;
    popupsHidden = !popupsHidden
    window.$('.app-popups>div').css('visibility', 'visible')
}

$(function() {
    var socket = io();

    function __send_packet(__packet_message) {
        socket.emit('ezond message', { __packet_message });
    }

    socket.on('ezond message', function(msg) {
        if (typeof msg == "object") {
            if (typeof msg.msgType != "undefined") {
                if (msg.msgType == 1) {
                    var scope = angular.element($(".show-pop-user-panel")).scope();
                    if (typeof scope != "undefined") {
                        scope.$apply(function() {
                            scope.addNotification(msg.msgContent);
                        })
                    } else {
                        scope = angular.element($(".show-pop-user")).scope();
                        if (typeof scope != "undefined") {
                            scope.$apply(function() {
                                scope.addNotification(msg.msgContent);
                            })
                        }
                    }
                }
            }
        }
    });

    socket.on('connect_error', function(err) {
        // handle server error here
        console.log('Error connecting to server');
    });
    socket.on('connect', function(err) {
        // console.log('Server Connected');
        reconnect_session();
        setTimeout(function() {
            reconnect_session_2();
        }, 1000);
    });



});

ezondapp.filter("trust", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

ezondapp.config(['$qProvider', function($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);