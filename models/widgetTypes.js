/**
 * Network ids
 * 1 = Google analytics
 * 2 = Google Adwords
 */

var WidgetTypes = {

    getWidgetByName: function(name) {
        for (var key in this) {

            if (key === name) {
                return this[key];
            }
        }
        return false;
    },

    getAllWidgetInfo: function() {
        var widgets = [];
        for (var key in this) {
            if (key !== "getAllWidgetInfo" && key != "getWidgetByName" && key != "getPopularWidgets") {
                widgets.push({did: this[key].did, name: this[key].name, description: this[key].description, networkID: this[key].network});
            }
        }
        return widgets;
    },

    getPopularWidgets: function() {
        return [this.gaoverview, this.awconversions, this.awconverionrate, this.awcost, this.gauniquevisitors, this.gapageviews];
    },

    awconversions: {
        did: "awconversions",
        layout: "standard",
        name: "(AW) Conversions",
        description: "",
        size: "s",
        network: 2,
        data: [
            {conversions: "today", alias: "value"}
        ]
    },

    awconverionrate: {
        did: "awconverionrate",
        layout: "standard",
        name: "(AW) Conversion Rate",
        description: "",
        size: "s",
        network: 2,
        data: [
            {conversionRate: "today", alias: "value", "v:valuePostfix": "%"}
        ]
    },

    awcost: {
        did: "awcost",
        layout: "standard",
        name: "(AW) Cost",
        description: "",
        size: "s",
        network: 2,
        data: [
            {cost: "today", alias: "value", "v:valuePrefix": "$"}
        ]
    },

    testdashwidget: {
        did: "testdashwidget",
        layout: "standard",
        name: "Conversion Overview",
        description: "",
        size: "s",
        network: 2,
        data: [
            {people: "today", alias: "people"},
            {conversions: "today", alias: "conversions"},
            {conversionRate: "today", alias: "conversionRate"}
        ]
    },

    testfacebookwidget: {
        did: "testfacebookwidget",
        layout: "standard",
        name: "Facebook",
        icon: "facebook-icon.png",
        description: "",
        size: "s",
        network: 3,
        period: 100,
        data: [
            {reach: 300},
            {likes: 300}
        ]
    },

    testgawidget: {
        did: "testgawidget",
        layout: "standard",
        name: "Google analytics",
        icon: "google-analytics-small.png",
        description: "",
        size: "s",
        network: 1,
        period: 100,
        data: [
            {visits: 300},
            {bounces: 300}
        ]
    },

    testgawwidget: {
        did: "testgawwidget",
        layout: "standard",
        name: "Google Adwords",
        icon: "google-adwords-small.png",
        description: "",
        size: "s",
        network: 2,
        period: 100,
        data: [
            {conversions: 300},
            {cost: 300}
        ]
    },

    awcpc: {
        did: "awcpc",
        layout: "standard",
        name: "(AW) Cost Per Conversion",
        description: "",
        size: "s",
        network: 2,
        data: [
            {cpc: "today", alias: "value", "v:valuePrefix": "$"}
        ]
    },

    gaoverview: {
        did: "gaoverview",
        layout: "gaoverview",
        name: "(GA) Overview",
        description: "",
        size: "m",
        network: 1,
        data: [
            {visits: "today", alias: "value", "v:valuePrefix": "$"},
            {pageviews: "30", alias: "pageviewhistory"},
            {bounces: "7", alias: "bouncehistory"}
        ]
    },

    gavisits: {
        did: "gavisits",
        layout: "standard",
        name: "(GA) Visits",
        description: "",
        size: "s",
        network: 1,
        data: [
            {visits: "today", alias: "value"}
        ]
    },

    gapageviews: {
        did: "gapageviews",
        layout: "standard",
        name: "(GA) Page Views",
        description: "",
        size: "s",
        network: 1,
        data: [
            {pageViews: "today", alias: "value"}
        ]
    },

    gauniquevisitors: {
        did: "gauniquevisitors",
        layout: "standard",
        name: "(GA) Unique Visitors",
        description: "",
        size: "s",
        network: 1,
        data: [
            {uniqueVisitors: "today", alias: "value"}
        ]
    },

    gauniquepageviews: {
        did: "gauniquepageviews",
        layout: "standard",
        name: "(GA) Unique Page Views",
        description: "",
        size: "s",
        network: 1,
        data: [
            {uniquePageViews: "today", alias: "value"}
        ]
    },

    gabounces: {
        did: "gabounces",
        layout: "standard",
        name: "(GA) Bounces",
        description: "",
        size: "s",
        network: 1,
        data: [
            {bounces: "today", alias: "value"}
        ]
    },

    gaentrances: {
        did: "gaentrances",
        layout: "standard",
        name: "(GA) Entrances",
        description: "",
        size: "s",
        network: 1,
        data: [
            {entrances: "today", alias: "value"}
        ]
    },

    gaexits: {
        did: "gaexits",
        layout: "standard",
        name: "(GA) Exits",
        description: "",
        size: "s",
        network: 1,
        data: [
            {exits: "today", alias: "value"}
        ]
    },

    ganewvisits: {
        did: "ganewvisits",
        layout: "standard",
        name: "(GA) New Visits",
        description: "",
        size: "s",
        network: 1,
        data: [
            {newVisits: "today", alias: "value"}
        ]
    },

    gatimeonpage: {
        did: "gatimeonpage",
        layout: "standard",
        name: "(GA) Time On Page",
        description: "",
        size: "s",
        network: 1,
        data: [
            {timeOnPage: "today", alias: "value", "v:valuePostfix": "s"}
        ]
    },

    gatimeonsite: {
        did: "gatimeonsite",
        layout: "standard",
        name: "(GA) Time On Site",
        description: "",
        size: "s",
        network: 1,
        data: [
            {timeOnSite: "today", alias: "value", "v:valuePostfix": "s"}
        ]
    },

    fbcampaignname: {
        did: "fbcampaignname",
        layout: "standard",
        name: "(FB) Campaign Name",
        description: "",
        size: "s",
        network: 3,
        period: 100,
        data: [
            {campaignName: 300, alias: "value"}
        ]
    },

    fbcampaignreach: {
        did: "fbcampaignreach",
        layout: "standard",
        name: "(FB) Campaign Reach",
        description: "",
        size: "s",
        network: 3,
        period: 100,
        data: [
            {reach: 300, alias: "value"}
        ]
    },

    fbcampaignimpression: {
        did: "fbcampaignimpression",
        layout: "standard",
        name: "(FB) Campaign Impressions",
        description: "",
        size: "s",
        network: 3,
        period: 100,
        data: [
            {impressions: 300, alias: "value"}
        ]
    }

};

module.exports = WidgetTypes;
