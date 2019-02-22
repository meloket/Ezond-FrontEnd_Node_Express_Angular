/**
 * WidgetGroup providers list
 * Something Updates
 */
ezondapp.service('widgetgroupProviders', function() {

    this.providers = [
        {
            name: 'Google Analytics',
            logo: '/images/logos/googleAnalyticsIcon.svg',
            metrics: ['Sessions','Users','Pageviews','Pages/Session','Avg.Session Duration','% New Session','Bounce Rate','Goal Completetions','Goal Value','Conversion Rate'],
            id: 1
        },
        {
            name: 'Google Adwords',
            logo: '/images/logos/googleAdwordsIcon.svg',
            metrics: ['Clicks','Impressions','Cost','Average CPC','Conversions','CTR','Conversion Value','CostPer Conversion'],
            id: 2
        },
        {
            name: 'Google Search Console',
            logo: '/images/logos/googleWebmasterToolsIcon.svg',
            metrics: ['Clicks','Impressions','CTR'],
            id: 3
        },
        {
            name: 'Youtube',
            logo: '/images/logos/youtubeIcon.svg',
            metrics: ['Views','Likes','Dislikes'],
            id: 5
        },
        {
            name: 'Facebook Ads',
            logo: '/images/logos/facebookAdsIcon.svg',
            metrics: ['Clicks', 'Impressions', 'Amount Spent', 'Average CPC', 'CTR', 'CPP', 'CPM', 'Reach'],
            id: 7
        },
        {
            name: 'Facebook',
            logo: '/images/logos/facebookIcon.svg',
            metrics: ['Likes', 'Reach', 'Engaged Users'],
            id: 8
        },
        {
            name: 'Call Rail',
            logo: '/images/logos/callrailIcon.svg',
            metrics: ['Calls', 'Answered', 'Missed'],
            id: 9
        },
        {
            name: 'AdRoll',
            logo: '/images/logos/adrollIcon.svg',
            metrics: ['Clicks', 'Impressions', 'CTR', 'CPM', 'CPC', 'CPA', 'VTC', 'VTC Rate', 'Conversions', 'Conv. Rate', 'Spend'],
            id: 11
        }


    ];
});