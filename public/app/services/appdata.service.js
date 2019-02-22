/**
 * App Data service
 */
ezondapp.service('appDataService', function (userService,
                                             integrationProviders,
                                             $http,
                                             $q,
                                             subscriptionPlansProviders,
                                             widgetsService,
                                             dashboardService, $state) {
    var self = this;

    this.currentState = "inWidgetsView"; // other "inCampaignsView"
    this.openTaskmanagement = '';
    // Add Campaign Handler
    this.addCampaign = function (campaign) {
        if (typeof campaign.active == "undefined") campaign.active = 1;
        if (typeof campaign.campaignStatus == "undefined") campaign.campaignStatus = 1;

        self.appData.user.dashboards.push(campaign);
    }

    this.getImageForLogin = function (hostname) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            url: "user/getTitle",
            data: {wlName: hostname}
        }).then(function succ(response) {
            deferred.resolve(response.data.wlName)
        }, function bad(response) {
            deferred.resolve(response.data.wlName)
        })

        return deferred.promise
    }


    // Update Campaign Handler
    this.updateCampaignInControllPanel = function (campaign) {

        var idx = self.appData.user.dashboards.findIndex(x => x.id == campaign.id);

        self.appData.user.dashboards[idx].company_name = campaign.company_name;
        self.appData.user.dashboards[idx].description = campaign.description;
    }

    // Delete Widget In Dashboard Handler
    this.deleteWidgetInDashboard = function (resultData) {

        var idx = self.appData.user.dashboards.findIndex(x => x.id == resultData.id);

        self.appData.user.dashboards.splice(idx, 1);
    }

    // Delete Widget In Dashboard Handler
    this.deleteChildUserInDashboard = function (userId) {

        var idx = self.appData.user.childUsers.findIndex(x => x.id == userId);

        self.appData.user.childUsers.splice(idx, 1);
    }

    // Delete Widget In Dashboard Handler
    this.addChildUserToDashboard = function (userInfo) {

        self.appData.user.childUsers.push(userInfo);
    }


    // Get App-Related Data Handler
    this.getAppData = function () {

        var deferred = $q.defer();

        $http.get('/app/data')
        .then(function (response) {
            if (response.data.loggedIn) {


                if (typeof response.data.user.parent_id != 'undefined') {
                    response.data.user.providers_allowed = JSON.parse(response.data.user.providers_allowed);
                    response.data.user.campaigns_allowed = JSON.parse(response.data.user.campaigns_allowed);
                }
                subscriptionPlansProviders.activePlans = response.data.activePlans;
                userService.user = response.data.user;
                userService.planSubscribed = response.data.user.planSubscribed;

                self.appData = response.data;

                if (response.data.user.agencyID) {
                    deferred.reject(1)
                    return
                }

                deferred.resolve(self);
            } else {
                userService.user = false;
                self.appData = response.data;
                deferred.resolve();
                // deferred.reject(0);
            }
        });

        return deferred.promise;
    }
})