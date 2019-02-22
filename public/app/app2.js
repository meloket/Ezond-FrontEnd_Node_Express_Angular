/**
 * Main angular app file
 */
'use strict';

var ezondapp = angular.module('ezondapp', ['ui.router', 'gridster', 'ngResource', 'ngIdle', 'ngStorage', 'ngMaterial', 'ngMessages']);

/**
 * Appconfig
 */
ezondapp.config(function($urlRouterProvider, $stateProvider, KeepaliveProvider) {

        KeepaliveProvider.interval(1 * 60); // 5 minute keep-alive ping

        $urlRouterProvider.otherwise('/app/campaigns');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'login/login.html',
                controller: 'loginController'
            })
            .state('app', {
                url: '/app',
                templateUrl: 'commons/global.html',
                controller: 'globalController',
                resolve: {
                    appData: function(appDataService) {
                        return appDataService.getAppData();
                    }
                },
                redirectTo: 'app.campaigns'
            })
            .state('app.controlpanel.pleasesubscribe', {
                url: '/pleaseSubscribe',
                controller: 'subscribePlease',
                templateUrl: 'subscriptions/subscribePlease.html',

            })
            .state('app.dashboard', {

                templateUrl: 'pages/index.html',
            })
            .state('app.dashboard.home', {

                url: '/dashboard/:id',
                controller: 'dashboardController',
                templateUrl: 'dashboard/dashboard.html',
                resolve: {
                    dashboardInfo: function(dashboardService, appDataService, $stateParams) {
                        appDataService.currentState = "inWidgetsView";

                        if ($stateParams.id) {
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
                templateUrl: 'intel/intel.html',
                resolve: {}
            })
            .state('app.dashboard.data_studio', {
                url: '/data_studio',
                controller: 'datastudioController',
                templateUrl: 'data_studio/data_studio.html',
                resolve: {}
            })
            .state('app.dashboard.seo_ratings', {
                url: '/seo_ratings/:kind/:id',
                controller: 'seoRatingsController',
                templateUrl: 'seo/ratings.html',
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
                templateUrl: 'analytics_ratings/ratings.html',
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
                templateUrl: 'adword/ratings.html',
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
                templateUrl: 'fbad/ratings.html',
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
                templateUrl: 'fb/ratings.html',
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
                templateUrl: 'youtube/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.dashboard.console_ratings', {
                url: '/console_ratings/:kind/:id',
                controller: 'consoleRatingsController',
                templateUrl: 'console/ratings.html',
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
                templateUrl: 'callrail/ratings.html',
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
                templateUrl: 'mailchimp/ratings.html',
                resolve: {
                    ratingsInfo: function(appDataService, ratinggroupProviders, $stateParams, $filter) {
                        appDataService.currentState = "inDedicatedView";
                        ratinggroupProviders.ratingsInfo = $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                        return $filter('filter')(ratinggroupProviders.providers, { 'id': $stateParams.kind })[0];
                    }
                }
            })
            .state('app.controlpanel', {
                templateUrl: 'controlpanel/controlpanel.html',
                controller: 'controlpanelController'
            })
            .state('app.showcampaign', {
                url: '/campaignmanagement/:id',
                controller: 'showcampaignController',
                resolve: {
                    openTaskManagement: function(appDataService, $stateParams) {
                        console.log($stateParams.id)
                        appDataService.openTaskmanagement = $stateParams.id
                    }
                }
            })
            .state('app.controlpanel.campaigns', {

                url: '/campaigns',
                templateUrl: 'campaigns/campaigns.html',
                controller: 'campaignsController',

                resolve: {
                    campaignsList: function(appDataService) {
                        appDataService.currentState = "inCampaignsView";
                        if (typeof appDataService.appData == "undefined")
                            return false;
                        return appDataService.appData.user.dashboards;
                    }
                    // openTaskManagement: function(appDataService, $stateParams) {
                    // console.log($stateParams.id)
                    // appDataService.openTaskmanagement = $stateParams.id
                    // }
                }
            })
            // .state('app.controlpanel.campaigns', {

            //     url: '/campaigns:id',
            //     templateUrl: 'campaigns/campaigns.html',
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
            .state('app.controlpanel.users', {

                url: '/users',
                templateUrl: 'users/users.html',
                controller: 'usersController',

                resolve: {
                    usersList: function(appDataService) {
                        appDataService.currentState = "inUsersView";
                        if (appDataService.appData)
                            return appDataService.appData.user.childUsers;
                        else
                            return {}
                    }
                }
            })
            .state('chat', {
                url: '/chat',
                templateUrl: '/test.htm'
            })
            .state('app.setup', {

                url: '/setup',
                templateUrl: 'setupwizard/setupwizard.html',
                controller: 'setupWizardController',

                onEnter: function() {
                    document.body.classList.add('setupwizard-body');
                },
                onExit: function() {

                    document.body.classList.remove('setupwizard-body');
                }
            });
    })
    .run(function($state, $rootScope, Idle, $http, $location) {

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

function userprofile() {
    displayAppPopups()
    var scope = angular.element($("#control-panel-logout2")).scope();
    scope.$apply(function() {
        scope.userprofile();
    })
}


function logout3() {
    var scope = angular.element($("#logout-subscribe-panel")).scope();
    scope.$apply(function() {
        scope.logout();
    })
}


function logout2() {
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
    var scope = angular.element($(".show-pop-user")).scope();
    if (typeof scope != "undefined") {
        scope.$apply(function() {
            scope.reconnectSession();
        })
    }
}

function reconnect_session_2() {
    var scope = angular.element($(".show-pop-user-panel")).scope();
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
        console.log('Server Connected');
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