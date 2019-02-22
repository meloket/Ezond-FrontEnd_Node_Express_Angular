/**
 * Integratable providers list
 */
ezondapp.service('integrationProviders', function() {

    this.providers = [
        {
            name: 'Google Analytics',
            logo: '/images/logos/googleAnalyticsIcon.svg',
            metrics: ['Sessions','Users','Pageviews','Pages/Session','Avg.Session Duration','% New Session','Bounce Rate','Goal Completetions','Goal Value','Conversion Rate'],
            description: "",
            id: 1
        },
        {
            name: 'Google Adwords',
            logo: '/images/logos/googleAdwordsIcon.svg',
            metrics: ['Clicks','Impressions','Cost','Average CPC','Conversions','CTR','Conversion Value','CostPer Conversion'],
            description: "",
            id: 2
        },
        {
            name: 'Google Search Console',
            logo: '/images/logos/googleWebmasterToolsIcon.svg',
            metrics: ['Clicks','Impressions','CTR'],
            description: "",
            id: 3
        },
        {
            name: 'Google Sheet',
            logo: '/images/logos/googleSheetsIcon.svg',
            metrics: [],
            description: "",
            id: 4
        },
        {
            name: 'Youtube',
            logo: '/images/logos/youtubeIcon.svg',
            metrics: ['Views','Likes','Dislikes'],
            description: "",
            id: 5
        },
        {
            name: 'Mail Chimp',
            logo: '/images/logos/mailChimpIcon.svg',
            metrics: [],
            description: "",
            id: 6
        },
        {
            name: 'Facebook Ads',
            logo: '/images/logos/facebookAdsIcon.svg',
            metrics: [],
            description: "",
            id: 7
        },
        {
            name: 'Facebook',
            logo: '/images/logos/facebookIcon.svg',
            metrics: [],
            description: "",
            id: 8
        },
        {
            name: 'Call Rail',
            logo: '/images/logos/callrailIcon.svg',
            metrics: [],
            description: 'To obtain your CallRail API Key, follow these instructions: From your CallRail dashboard, in the top right corner select Account -> Security. Click the button on the middle left that says "Create API V2 Key". Your API Key will now appear in the table.',
            id: 9
        },
        {
            name: 'Google Data Studio',
            logo: '/images/logos/data_studio.svg',
            metrics: [],
            description: 'Google Data Studio description.',
            id: 10
        },
        {
            name: 'AdRoll',
            logo: '/images/logos/adrollIcon.svg',
            metrics: [],
            description: 'AdRoll advertisments',
            id: 11

        }


    ];
});