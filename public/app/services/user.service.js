/**
 * All data about current user (actually, all data that needs)
 */
ezondapp.service('userService', function($http, $q, $resource, $location, $localStorage) {

    var self = this;
    this.user = {};
    this.timereport = new Date().toString().replace(/ /g, "");

    this.notice_count = 0;
    this.notifications = [];

    this.planSubscribed = '';

    this.updateLocation = function(){
        $localStorage.location_path = $location.path();
    };
    
    this.isEditor = function () {
        return this.user.role !== 'client';
    };

    this.isOwner = function () {
        return typeof this.user.parent_id === 'undefined';
    };

    var ajaxRes =  $resource('', null, {
        update: {
            url: '/user/update',
            method: 'POST'
        },
        updateProfile: {
            url: '/user/updateProfile',
            method: 'POST'
        },
        login: {
            url: 'user/auth',
            method: 'POST'
        },
        resendConfirmEmail: {
            url: '/user/resendemail',
            method: 'POST'
        },
        logout: {
            url: '/user/logout'
        },
        addCampaign: {
            url: '/user/addcampaign',
            method: 'POST'
        },
        addUsers: {
            url: '/user/addUsers',
            method: 'POST'
        },
        removeChildUser: {
            url: '/user/removeChildUser',
            method: 'POST'
        },
        editChildUser: {
            url: '/user/editChildUser',
            method: 'POST'
        },
        getDashboardFollowers: {
            url: '/user/getDashboardFollowers',
            method: 'POST'
        },
        setDashboardFollowers: {
            url: '/user/setDashboardFollowers',
            method: 'POST'
        }
    });

    Object.assign(self, ajaxRes);
});