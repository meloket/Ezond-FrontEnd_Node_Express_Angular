/**
 * Rating Pages providers list
 * Something Updates
 */
ezondapp.service('ratinggroupProviders', function() {

    var self = this;
    self.ratingsInfo = {};

    self.ratingsInfo.iconsAliases = {
        "Clicks": "fas fa-hand-pointer"
    };

    this.providers = [
        {
            name: 'Channels',
            networkID: 1,
            logo: '/images/logos/googleAnalyticsIcon.svg',
            logo_name: 'Google Analytics',
            menu: ['All', 'Organic Search', 'Paid Search', 'Social', 'Referrals', 'Display', 'Email', 'Other'],
            metric: ['Sessions', 'Users', 'Pageviews', 'Pages/Session', 'Avg. Session Duration', '% New Sessions', 'Bounce Rate', 'Goal Completions', 'Goal Value', 'Conversion Rate'],
            description: ['The total number of sessions', 'The total number of users', 'The total number of pageviews', 'The average number of pages viewed per session', 'The average length of a session', 'The ratio of new versus returning sessions', 'The percentage of single page session (ie. the visitor did not click to a second page)', 'The total number of conversions', 'The total value generated', 'The ratio between total goal completions and visitors to the website'],
            header: [
                [{'name': 'Channel', 'description': 'The default channel grouping shared within the View'}],
                [{'name': 'Keyword', 'description': 'The search term used to find this website'}],
                [{'name': 'Keyword', 'description': 'The search term used to find this website'}],
                [{'name': 'Social Network', 'description': 'The social network where the activity originated'}],
                [{'name': 'Source', 'description': 'The search engine used to find this website'}],
                [{'name': 'Source', 'description': 'The search engine used to find this website'}],
                [{'name': 'Source', 'description': 'The search engine used to find this website'}],
                [{'name': 'Source', 'description': 'The search engine used to find this website'}],
              ],
            metricSelect: [true, true, true, true, false, true, true, true, false, false],
            filters: [],
            id: 1
        },
        {
            name: 'Audience',
            networkID: 1,
            logo: '/images/logos/googleAnalyticsIcon.svg',
            logo_name: 'Google Analytics',
            menu: ['Local', 'Age', 'Gender', 'Devices'],
            metric: ['Sessions', 'Users', 'Pageviews', 'Pages/Session', 'Avg. Session Duration', '% New Sessions', 'Bounce Rate', 'Goal Completions', 'Goal Value', 'Conversion Rate'],
            description: ['The total number of sessions', 'The total number of users', 'The total number of pageviews', 'The average number of pages viewed per session', 'The average length of a session', 'The ratio of new versus returning sessions', 'The percentage of single page session (ie. the visitor did not click to a second page)', 'The total number of conversions', 'The total value generated', 'The ratio between total goal completions and visitors to the website'],
            header: [
                [{'name': 'Country', 'description': 'The geographic location by country'}],
                [],
                [],
                [{'name': 'Mobile Device Info', 'description': 'The branding, model, and marketing name used to identify the device'}],
                ],
            metricSelect: [true, true, true, true, false, true, true, true, false, false],
            filters: [],
            id: 2
        },
        {
            name: 'Conversions',
            networkID: 1,
            logo: '/images/logos/googleAnalyticsIcon.svg',
            logo_name: 'Google Analytics',
            menu: ['Goals', 'Ecommerce', 'Campaigns'],
            metric: [
                [
                    {
                        "metricName": "Goal Completions", "metricSelect": true,
                        "description": "The total number of conversions"
                    },
                    {
                        "metricName": "Goal Value", "metricSelect": true,
                        "description": "The total value generated"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": true,
                        "description": "The ratio between total goal completions and visitors to the website"
                    },
                    {
                        "metricName": "Abandonment Rate", "metricSelect": true,
                        "description": "The ratio between visitors that exit the goal process before completion and those that complete the goal"
                    },
                ],              
                [
                    {
                        "metricName": "Quantity", "metricSelect": true,
                        "description": "The numbers of units sold"
                    },
                    {
                        "metricName": "Unique Purchases", "metricSelect": true,
                        "description": "The total number of times a specified product (or set of products) was a part of a transaction"
                    },
                    {
                        "metricName": "Product Revenue", "metricSelect": true,
                        "description": "The revenue from individual products sales"
                    },
                    {
                        "metricName": "Revenue Per Product", "metricSelect": true,
                        "description": "The average revenue per product"
                    },
                    {
                        "metricName": "Products Per Purchase", "metricSelect": true,
                        "description": "The average number of products sold per transaction"
                    },
                    {
                        "metricName": "Transactions", "metricSelect": true,
                        "description": "The total number of transactions"
                    },
                    {
                        "metricName": "Revenue", "metricSelect": true,
                        "description": "The total sale revenue (excluding shipping and tax) of the transaction"
                    },
                    {
                        "metricName": "Average Order Value", "metricSelect": true,
                        "description": "The average revenue of an ecommerce transaction"
                    },
                ],
                [
                    {
                        "metricName": "Sessions", "metricSelect": true,
                        "description": "The total number of sessions"
                    },
                    {
                        "metricName": "Users", "metricSelect": true,
                        "description": "The total number of users"
                    },
                    {
                        "metricName": "Pageviews", "metricSelect": true,
                        "description": "The total number of pageviews"
                    },
                    {
                        "metricName": "Pages/Session", "metricSelect": true,
                        "description": "The average number of pages viewed per session"
                    },
                    {
                        "metricName": "Avg. Session Duration", "metricSelect": false,
                        "description": "The average length of a session"
                    },
                    {
                        "metricName": "% New Sessions", "metricSelect": true,
                        "description": "The ratio of new versus returning sessions"
                    },
                    {
                        "metricName": "Bounce Rate", "metricSelect": true,
                        "description": "The percentage of single page session (ie. the visitor did not click to a second page)"
                    },
                    {
                        "metricName": "Goal Completions", "metricSelect": true,
                        "description": "The total number of conversions"
                    },
                    {
                        "metricName": "Goal Value", "metricSelect": false,
                        "description": "The total value generated"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": false,
                        "description": "The ratio between total goal completions and visitors to the website"
                    },
                ],  
            ],
            header: [
                [{'name': 'Goal', 'description': 'The name of the given goal'}],
                [{'name': 'Channel', 'description': 'The default channel grouping shared within the View'}],
                [{'name': 'Campaign', 'description': 'The campaign where the activity originated'}],
                ],
            filters: [
                [
                    ['All Channels', 'Direct', 'Organic Search', 'Paid Search', 'Social', 'Referrals', 'Display', 'Email', 'Other']
                ],
                [
                    ['All Channels', 'Direct', 'Organic Search', 'Paid Search', 'Social', 'Referrals', 'Display', 'Email', 'Other']
                ],
                [],
            ],
            id: 3
        },
        {
            name: 'Pages',
            networkID: 1,
            logo: '/images/logos/googleAnalyticsIcon.svg',
            logo_name: 'Google Analytics',
            menu: ['All Pages', 'Landing Pages', 'Exit Pages'],
            metric: [
                [
                    {
                        "metricName": "Pageviews", "metricSelect": true,
                        "description": "The total number of pageviews"
                    },
                    {
                        "metricName": "Unique Pageviews", "metricSelect": true,
                        "description": "The number of views the page got"
                    },
                    {
                        "metricName": "Pages/Session", "metricSelect": true,
                        "description": "The average number of pages viewed per sessions"
                    },
                    {
                        "metricName": "Avg. Time on Page", "metricSelect": true,
                        "description": "The average amount of time users spent viewing a specified page"
                    },
                    {
                        "metricName": "Entrances", "metricSelect": true,
                        "description": "The number of times visitors entered your site through a specified page"
                    },
                    {
                        "metricName": "Bounce Rate", "metricSelect": true,
                        "description": "The percentage of single page session (ie. the visitor did not click to a second page)"
                    },
                    {
                        "metricName": "Exit Rate", "metricSelect": true,
                        "description": "Indicates how often users exit from that page"
                    },
                    {
                        "metricName": "Page Value", "metricSelect": true,
                        "description": "The average value of this page or set of pages"
                    },
                ],
                [
                    {
                        "metricName": "Sessions", "metricSelect": true,
                        "description": "The total number of sessions"
                    },
                    {
                        "metricName": "Users", "metricSelect": true,
                        "description": "The total number of users"
                    },
                    {
                        "metricName": "Pageviews", "metricSelect": true,
                        "description": "The total number of pageviews"
                    },
                    {
                        "metricName": "Pages/Session", "metricSelect": true,
                        "description": "The average number of pages viewed per session"
                    },
                    {
                        "metricName": "Avg. Session Duration", "metricSelect": false,
                        "description": "The average length of a session"
                    },
                    {
                        "metricName": "% New Sessions", "metricSelect": true,
                        "description": "The ratio of new versus returning sessions"
                    },
                    {
                        "metricName": "Bounce Rate", "metricSelect": true,
                        "description": "The percentage of single page session (ie. the visitor did not click to a second page)"
                    },
                    {
                        "metricName": "Goal Completions", "metricSelect": true,
                        "description": "The total number of conversions"
                    },
                    {
                        "metricName": "Goal Value", "metricSelect": false,
                        "description": "The total value generated"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": false,
                        "description": "The ratio between total goal completions and visitors to the website"
                    },
                ],                
                [
                    {
                        "metricName": "Exits", "metricSelect": true,
                        "description": "The numbers of times visitors exited your site from a specified page"
                    },
                    {
                        "metricName": "Pageviews", "metricSelect": true,
                        "description": "The number of views the page got"
                    },
                    {
                        "metricName": "Exit Rate", "metricSelect": true,
                        "description": "Indicates how often users exit from that page"
                    },
                ],
            ],
            header: [
                [{'name': 'Page', 'description': "The page's path"}],
                [{'name': 'Page', 'description': 'The page the visitor enters on from the search'}],
                [{'name': 'Page', 'description': "The page's path"}],
                ],
            filters: [
                [],
                [
                    ['All Channels', 'Direct', 'Organic Search', 'Paid Search', 'Social', 'Referrals', 'Display', 'Email', 'Other']
                ],
                [],
            ],
            id: 4
        },
        {
            name: 'Events',
            networkID: 1,
            logo: '/images/logos/googleAnalyticsIcon.svg',
            logo_name: 'Google Analytics',
            menu: ['Category', 'Action', 'Label'],
            metric: ['Total Events', 'Unique Events', 'Event Value', 'Avg. Value'],
            description: ['The number of times events occurred', 'The number of unique events per category, action, or label', 'The total value of an event or set of events', 'The average value of each event'],
            header: [
                [{'name': 'Category', 'description': 'The categories that were assigned to triggered events'}],
                [{'name': 'Action', 'description': 'The actions that were assigned to triggered events'}],
                [{'name': 'Label', 'description': 'The optional labels used to describe triggered events'}],
                ],
            metricSelect: [true, true, true, true],
            filters: [],
            id: 5
        },
        {
            name: 'Google Adwords',
            networkID: 2,
            logo: '/images/logos/googleAdwordsIcon.svg',
            logo_name: 'Google Adwords',
            menu: ['Campaigns', 'Ad Groups', 'Keywords', 'Ads', 'Conversions'],
            metric: [
                [
                    {
                        "metricName": "Clicks", "metricSelect": true,
                        "description": "The numbers of clickcs on an ad"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true,
                        "description": "The number of times an ad was displayed"
                    },
                    {
                        "metricName": "Cost", "metricSelect": true,
                        "description": "The total amount paid for an ad"
                    },
                    {
                        "metricName": "Average CPC", "metricSelect": true,
                        "description": "Cost-per-click is the average cost paid for each click on an ad"
                    },
                    {
                        "metricName": "CTR", "metricSelect": false,
                        "description": "Click-through-rate is the ratio of people that see an ad versus clicking on it"
                    },
                    {
                        "metricName": "Conversions", "metricSelect": false,
                        "description": "The percentage of clicks that resulted in a conversion"
                    },
                    {
                        "metricName": "Cost Per Conversion", "metricSelect": false,
                        "description": "The average cost per conversions"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": true,
                        "description": "How often, on avergae, an interaction leads to a conversion"
                    },
                    {
                        "metricName": "View-Through Conv.", "metricSelect": true,
                        "description": "Conversions that happen after an impression, without interaction with your Ad"
                    },
                    {
                        "metricName": "Avg. Position", "metricSelect": true,
                        "description": "How your ad typically ranks against other ads"
                    },
                    {
                        "metricName": "Search Impr. Share", "metricSelect": false,
                        "description": "Impressions you've received divided by the estimated number of impressions you were eligible to receive"
                    },
                    {
                        "metricName": "Status", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Network", "metricSelect": false,
                        "description": ""
                    },
                ],
                [
                    {
                        "metricName": "Campaign", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Clicks", "metricSelect": true,
                        "description": "The numbers of clickcs on an ad"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true,
                        "description": "The number of times an ad was displayed"
                    },
                    {
                        "metricName": "Cost", "metricSelect": true,
                        "description": "The total amount paid for an ad"
                    },
                    {
                        "metricName": "Average CPC", "metricSelect": true,
                        "description": "Cost-per-click is the average cost paid for each click on an ad"
                    },
                    {
                        "metricName": "CTR", "metricSelect": false,
                        "description": "Click-through-rate is the ratio of people that see an ad versus clicking on it"
                    },
                    {
                        "metricName": "Conversions", "metricSelect": false,
                        "description": "The percentage of clicks that resulted in a conversion"
                    },
                    {
                        "metricName": "Cost Per Conversion", "metricSelect": false,
                        "description": "The average cost per conversions"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": true,
                        "description": "How often, on avergae, an interaction leads to a conversion"
                    },
                    {
                        "metricName": "View-Through Conv.", "metricSelect": true,
                        "description": "Conversions that happen after an impression, without interaction with your Ad"
                    },
                    {
                        "metricName": "Avg. Position", "metricSelect": true,
                        "description": "How your ad typically ranks against other ads"
                    },
                    {
                        "metricName": "Search Impr. Share", "metricSelect": false,
                        "description": "Impressions you've received divided by the estimated number of impressions you were eligible to receive"
                    },
                    {
                        "metricName": "Status", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Network", "metricSelect": false,
                        "description": ""
                    },
                ],                
                [
                    {
                        "metricName": "Campaign", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Ad Group", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Clicks", "metricSelect": true,
                        "description": "The numbers of clickcs on an ad"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true,
                        "description": "The number of times an ad was displayed"
                    },
                    {
                        "metricName": "Cost", "metricSelect": true,
                        "description": "The total amount paid for an ad"
                    },
                    {
                        "metricName": "Average CPC", "metricSelect": true,
                        "description": "Cost-per-click is the average cost paid for each click on an ad"
                    },
                    {
                        "metricName": "CTR", "metricSelect": false,
                        "description": "Click-through-rate is the ratio of people that see an ad versus clicking on it"
                    },
                    {
                        "metricName": "Conversions", "metricSelect": false,
                        "description": "The percentage of clicks that resulted in a conversion"
                    },
                    {
                        "metricName": "Cost Per Conversion", "metricSelect": false,
                        "description": "The average cost per conversions"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": true,
                        "description": "How often, on avergae, an interaction leads to a conversion"
                    },
                    {
                        "metricName": "View-Through Conv.", "metricSelect": true,
                        "description": "Conversions that happen after an impression, without interaction with your Ad"
                    },
                    {
                        "metricName": "Avg. Position", "metricSelect": true,
                        "description": "How your ad typically ranks against other ads"
                    },
                    {
                        "metricName": "Search Impr. Share", "metricSelect": false,
                        "description": "Impressions you've received divided by the estimated number of impressions you were eligible to receive"
                    },
                    {
                        "metricName": "Status", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Network", "metricSelect": false,
                        "description": ""
                    },
                ],
                [
                    {
                        "metricName": "Campaign", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Ad Group", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Clicks", "metricSelect": true,
                        "description": "The numbers of clickcs on an ad"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true,
                        "description": "The number of times an ad was displayed"
                    },
                    {
                        "metricName": "Cost", "metricSelect": true,
                        "description": "The total amount paid for an ad"
                    },
                    {
                        "metricName": "Average CPC", "metricSelect": true,
                        "description": "Cost-per-click is the average cost paid for each click on an ad"
                    },
                    {
                        "metricName": "CTR", "metricSelect": false,
                        "description": "Click-through-rate is the ratio of people that see an ad versus clicking on it"
                    },
                    {
                        "metricName": "Conversions", "metricSelect": false,
                        "description": "The percentage of clicks that resulted in a conversion"
                    },
                    {
                        "metricName": "Cost Per Conversion", "metricSelect": false,
                        "description": "The average cost per conversions"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": true,
                        "description": "How often, on avergae, an interaction leads to a conversion"
                    },
                    {
                        "metricName": "View-Through Conv.", "metricSelect": true,
                        "description": "Conversions that happen after an impression, without interaction with your Ad"
                    },
                    {
                        "metricName": "Avg. Position", "metricSelect": true,
                        "description": "How your ad typically ranks against other ads"
                    },
                    {
                        "metricName": "Search Impr. Share", "metricSelect": false,
                        "description": "Impressions you've received divided by the estimated number of impressions you were eligible to receive"
                    },
                    {
                        "metricName": "Status", "metricSelect": false,
                        "description": ""
                    },
                    {
                        "metricName": "Network", "metricSelect": false,
                        "description": ""
                    },
                ],
                [
                    {
                        "metricName": "Conversions", "metricSelect": true,
                        "description": "The percentage of clicks that resulted in a conversion"
                    },
                    {
                        "metricName": "Cost Per Conversion", "metricSelect": true,
                        "description": "The average cost per conversions"
                    },
                    {
                        "metricName": "Conversion Rate", "metricSelect": true,
                        "description": "How often, on avergae, an interaction leads to a conversion"
                    },
                    {
                        "metricName": "View-Through Conv.", "metricSelect": true,
                        "description": "Conversions that happen after an impression, without interaction with your Ad"
                    },
                ],
            ],
            header: [
                [{'name': 'Campaign', 'description': ''}],
                [{'name': 'Ad Group', 'description': ''}],
                [{'name': 'Keyword', 'description': ''}],
                [{'name': 'Ad', 'description': ''}],
                [{'name': 'Conversion Name', 'description': ''}],
                ],
            filters: [
                [
                    ['All networks', 'Search Network', 'Display Network'],
                ],
                [
                    ['All Campaigns'],
                    ['All networks', 'Search Network', 'Display Network'],
                ],
                [
                    ['All Campaigns'],
                    ['All Adgroups'],
                    ['All networks', 'Search Network', 'Display Network'],
                ],
                [
                    ['All Campaigns'],
                    ['All Adgroups'],
                    ['All networks', 'Search Network', 'Display Network'],
                ],
                [
                    ['All Campaigns'],
                    ['All networks', 'Search Network', 'Display Network'],
                ],
            ],
            id: 6
        },
        {
            name: 'Facebook Ads',
            networkID: 7,
            logo: '/images/logos/facebookAdsIcon.svg',
            logo_name: 'Facebook Ads',
            menu: ['Campaigns', 'Ad Sets', 'Ads', 'das1'],
            metric: [
                [
                    {
                        "metricName": "Clicks", "metricSelect": true,
                        "description": "The numbers of clickcs on an ad"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true,
                        "description": "The number of times an ad was displayed"
                    },
                    {
                        "metricName": "Reach", "metricSelect": false,
                        "description": "The number of people who saw your ad at least once"
                    },
                    {
                        "metricName": "Amount Spent", "metricSelect": false,
                        "description": "The total amount paid for an ad"
                    },
                    {
                        "metricName": "Average CPC", "metricSelect": true,
                        "description": "Cost-per-click is the average cost paid for each click on ad ad"
                    },
                    {
                        "metricName": "Page Likes", "metricSelect": false,
                        "description": "The number of likes on your Page as a result of your ad"
                    },
                    {
                        "metricName": "Post Likes", "metricSelect": false,
                        "description": "The number of likes on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Website Conversions", "metricSelect": false,
                        "description": "The number of conversions that happened on your website as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Page Like", "metricSelect": false,
                        "description": "The cost per like on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Post Like", "metricSelect": false,
                        "description": "The cost per like on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Website Conversion", "metricSelect": false,
                        "description": "The cost per conversion that happened on your website as a result of your ad"
                    },
                    {
                        "metricName": "Unique Link Clicks", "metricSelect": false,
                        "description": "The number of people who clicked a link"
                    },
                    {
                        "metricName": "Unique CTR", "metricSelect": false,
                        "description": "The percentage of people who saw your ad and clicked a link"
                    },
                    {
                        "metricName": "Cost per Unique Link Click", "metricSelect": false,
                        "description": "The avergae cost for each unique link click"
                    },
                ],
                [
                    {
                        "metricName": "Campaign", "metricSelect": false,
                        "description": ""
                    },  
                    {
                        "metricName": "Clicks", "metricSelect": true,
                        "description": "The numbers of clickcs on an ad"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true,
                        "description": "The number of times an ad was displayed"
                    },
                    {
                        "metricName": "Reach", "metricSelect": false,
                        "description": "The number of people who saw your ad at least once"
                    },
                    {
                        "metricName": "Amount Spent", "metricSelect": false,
                        "description": "The total amount paid for an ad"
                    },
                    {
                        "metricName": "Average CPC", "metricSelect": true,
                        "description": "Cost-per-click is the average cost paid for each click on ad ad"
                    },
                    {
                        "metricName": "Page Likes", "metricSelect": false,
                        "description": "The number of likes on your Page as a result of your ad"
                    },
                    {
                        "metricName": "Post Likes", "metricSelect": false,
                        "description": "The number of likes on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Website Conversions", "metricSelect": false,
                        "description": "The number of conversions that happened on your website as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Page Like", "metricSelect": false,
                        "description": "The cost per like on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Post Like", "metricSelect": false,
                        "description": "The cost per like on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Website Conversion", "metricSelect": false,
                        "description": "The cost per conversion that happened on your website as a result of your ad"
                    },
                    {
                        "metricName": "Unique Link Clicks", "metricSelect": false,
                        "description": "The number of people who clicked a link"
                    },
                    {
                        "metricName": "Unique CTR", "metricSelect": false,
                        "description": "The percentage of people who saw your ad and clicked a link"
                    },
                    {
                        "metricName": "Cost per Unique Link Click", "metricSelect": false,
                        "description": "The avergae cost for each unique link click"
                    },                  
                ],
                [
                    {
                        "metricName": "Campaign", "metricSelect": false,
                        "description": ""
                    },  
                    {
                        "metricName": "Ad set", "metricSelect": false,
                        "description": ""
                    },   
                    {
                        "metricName": "Clicks", "metricSelect": true,
                        "description": "The numbers of clickcs on an ad"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true,
                        "description": "The number of times an ad was displayed"
                    },
                    {
                        "metricName": "Reach", "metricSelect": false,
                        "description": "The number of people who saw your ad at least once"
                    },
                    {
                        "metricName": "Amount Spent", "metricSelect": false,
                        "description": "The total amount paid for an ad"
                    },
                    {
                        "metricName": "Average CPC", "metricSelect": true,
                        "description": "Cost-per-click is the average cost paid for each click on ad ad"
                    },
                    {
                        "metricName": "Page Likes", "metricSelect": false,
                        "description": "The number of likes on your Page as a result of your ad"
                    },
                    {
                        "metricName": "Post Likes", "metricSelect": false,
                        "description": "The number of likes on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Website Conversions", "metricSelect": false,
                        "description": "The number of conversions that happened on your website as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Page Like", "metricSelect": false,
                        "description": "The cost per like on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Post Like", "metricSelect": false,
                        "description": "The cost per like on your Page's posts as a result of your ad"
                    },
                    {
                        "metricName": "Cost Per Website Conversion", "metricSelect": false,
                        "description": "The cost per conversion that happened on your website as a result of your ad"
                    },
                    {
                        "metricName": "Unique Link Clicks", "metricSelect": false,
                        "description": "The number of people who clicked a link"
                    },
                    {
                        "metricName": "Unique CTR", "metricSelect": false,
                        "description": "The percentage of people who saw your ad and clicked a link"
                    },
                    {
                        "metricName": "Cost per Unique Link Click", "metricSelect": false,
                        "description": "The avergae cost for each unique link click"
                    },                 
                ],
            ],
            header: [
                [{'name': 'Campaign', 'description': ''}],
                [{'name': 'Ad Set', 'description': ''}],
                [{'name': 'Ad', 'description': ''}],
                [{'name': 'dad2', 'description': ''}],
            ],
            filters: [
                [
                ],
                [
                    ['All Campaigns'],
                ],
                [
                    ['All Campaigns'],
                    ['All Ad Sets'],
                ],
            ],
            id: 7
        },
        {
            name: 'Facebook',
            networkID: 8,
            logo: '/images/logos/facebookIcon.svg',
            logo_name: 'Facebook',
            metric: ['Reach', 'Engaged Users', 'Talking About This'],
            description: ['The number of people who viewed the post', 'The number of people who clicked, liked, commented on or shared the post', 'The number of people who created a story about the post'],
            header: [
                {'name': 'Date', 'description': 'The date of the post'},
                {'name': 'Post', 'description': 'The title of the post'},
              ],
            metricSelect: [true, true, true],
            metricSelect2: [true, true, false],
            id: 8
        },
        {
            name: 'Youtube',
            networkID: 5,
            logo: '/images/logos/youtubeIcon.svg',
            logo_name: 'Youtube',
            menu: ['Views', 'Likes', 'Dislikes'],
            metric: ['Duration', 'Views', 'Likes', 'Dislikes'],
            description: ['The length of the video', 'The number of times the video has been watched', 'The number of people who have liked the video', 'The number of people who have not liked the video'],
            header: [
                {'name': 'Date', 'description': 'The date the video was uploaded'},
                {'name': 'Video', 'description': 'The title of the video'},
              ],
            metricSelect: [true, true, true, true],
            metricSelect2: [false, true, true, true],
            id: 9
        },
        {
            name: 'Google Search Console',
            networkID: 3,
            logo: '/images/logos/googleWebmasterToolsIcon.svg',
            logo_name: 'Google Search Console',
            menu: ['Top Queries', 'Top Pages', 'Crawl Errors'],
            metric: [
                [
                    {
                        "metricName": "Clicks", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The numbers of clickcs to this website from searching for the given keyword"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The number of times this website was shown from searching for the given keyword"
                    },
                    {
                        "metricName": "Avg Position", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The average ranking position for the given keyword"
                    },
                    {
                        "metricName": "CTR", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The click through rate displaying the amount of times the URL is shown versus clicked on"
                    },
                ],
                [
                    {
                        "metricName": "Clicks", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The numbers of clickcs from a search to the given page"
                    },
                    {
                        "metricName": "Impressions", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The number of times a SERP was shown containing the given page"
                    },
                    {
                        "metricName": "Avg Position", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The average ranking position that generated a visit to the given page"
                    },
                    {
                        "metricName": "CTR", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "The click through rate displaying the amount of times the URL is shown versus clicked on"
                    },               
                ],
                [
                    {
                        "metricName": "Not Found", "metricSelect": true, "metricDisplay": true, "recordDisplay": false,
                        "description": "Not Found errors"
                    },
                    {
                        "metricName": "Auth Permissions", "metricSelect": false, "metricDisplay": true, "recordDisplay": false,
                        "description": "Auth Permissions errors"
                    },
                    {
                        "metricName": "Flash Content", "metricSelect": false, "metricDisplay": true, "recordDisplay": false,
                        "description": "Flash Content errors"
                    },
                    {
                        "metricName": "Many To One", "metricSelect": false, "metricDisplay": true, "recordDisplay": false,
                        "description": "Many To One Redirect errors"
                    },
                    {
                        "metricName": "Not Followed", "metricSelect": false, "metricDisplay": true, "recordDisplay": false,
                        "description": "Not Followed errors"
                    },
                    {
                        "metricName": "Server Error", "metricSelect": true, "metricDisplay": true, "recordDisplay": false,
                        "description": "Server Error errors"
                    },
                    {
                        "metricName": "Other", "metricSelect": true, "metricDisplay": true, "recordDisplay": false,
                        "description": "Other errors"
                    },
                    {
                        "metricName": "Roboted", "metricSelect": false, "metricDisplay": true, "recordDisplay": false,
                        "description": "Roboted errors"
                    },
                    {
                        "metricName": "Soft 404", "metricSelect": false, "metricDisplay": true, "recordDisplay": false,
                        "description": "Total number of Soft 404 errors"
                    },
                    {
                        "metricName": "Page Url", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "Page url"
                    },
                    {
                        "metricName": "First Detected", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "First detected date"
                    },
                    {
                        "metricName": "Category", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "Error category type"
                    },  
                    {
                        "metricName": "Response Code", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "Error response code or page"
                    },                    
                ],
            ],
            header: [
                [{'name': 'Keyword', 'description': 'The search term used to find this website'}],
                [{'name': 'Page', 'description': 'The page the visitor enters on from the search'}],
                [{'name': 'Last Crawled', 'description': 'Last Crawled date'}],
            ],
            filters: [
                [],
                [],
                [
                    ['Not Found', 'Server Error', 'Auth Permissions', 'Flash Content', 'Many To One Redirect', 'Not Followed', 'Other', 'Roboted', 'soft404'],
                ],
            ],
            id: 10
        },
        {
            name: 'Call Tracking',
            networkID: 9,
            logo: '/images/logos/callrailIcon.svg',
            logo_name: 'Call Rail',
            menu: ['Call Rail'],
            metric: [
                [
                    {
                        "metricName": "Calls", "metricSelect": true, "metricDisplay": true, "recordDisplay": false,
                        "description": "The total numbers of calls"
                    },
                    {
                        "metricName": "Answered", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "Whether or not the given call was answered"
                    },
                    {
                        "metricName": "Missed", "metricSelect": true, "metricDisplay": true, "recordDisplay": false,
                        "description": "The total number of calls missed"
                    },
                    {
                        "metricName": "First Call", "metricSelect": true, "metricDisplay": true, "recordDisplay": true,
                        "description": "Whether or not it was the first time receiving a call from the given number"
                    },
                    {
                        "metricName": "Name", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "The name of the company that placed the call"
                    },
                    {
                        "metricName": "Source", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "The source that the caller originated from"
                    },
                    {
                        "metricName": "Source Type", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "The source type that the caller originated from"
                    },
                    {
                        "metricName": "Phone Number", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "The phone number of the given caller"
                    },
                    {
                        "metricName": "Duration", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "The duration for the given call"
                    },
                    {
                        "metricName": "Location", "metricSelect": true, "metricDisplay": false, "recordDisplay": true,
                        "description": "The geographic location of the given caller"
                    },
                ],
            ],
            header: [
                [{'name': 'Date', 'description': 'The date the call took place'}],
            ],
            filters: [
                [],
            ],
            id: 11
        },
        {
            name: 'Mail Chimp',
            networkID: 6,
            logo: '/images/logos/mailChimpIcon.svg',
            logo_name: 'Mail Chimp',
            menu: ['Campaigns', 'Lists'],
            header: [
                [
                    {'name': 'Name', 'description': 'The campaign name'},
                    {'name': 'Emails Sent', 'description': 'The total number of emails sent'},
                    {'name': 'Open Rate', 'description': 'The percentage of opened'},
                    {'name': 'Click Rate', 'description': 'The percentage of clicked'},
                    {'name': 'Unsubscribed', 'description': 'The percentage of unsubscribed'},
                    {'name': 'Bounced', 'description': 'The percentage of bounced'},
                ],
                [
                    {'name': 'Name', 'description': 'The campaign name'},
                    {'name': 'Rating', 'description': 'The total number of emails sent'},
                    {'name': 'Subscribers', 'description': 'The percentage of opened'},
                    {'name': 'Open Rate', 'description': 'The percentage of clicked'},
                    {'name': 'Click Rate', 'description': 'The percentage of unsubscribed'},
                ],
              ],
            id: 12
        },
        {
            name: 'AdRoll',
            networkID: 11,
            logo: '/images/logos/adrollIcon.svg',
            logo_name: 'AdRoll',
            menu: ['Campaigns', 'Ad Groups', 'Ads'],
            metric: [{"metricName": 'Clicks', "metricSelect": true, "metricKey": "clicks"},
                    {"metricName": 'Impressions', "metricSelect": true, "metricKey": "impressions"},
                    {"metricName": 'CTR', "metricSelect": false, "metricKey": "ctr"},
                    {"metricName": 'CPM', "metricSelect": true, "metricKey": "cpm"},
                    {"metricName": 'CPC', "metricSelect": true, "metricKey": "cpc"},
                    {"metricName": 'CPA', "metricSelect": false, "metricKey": "cpa"},
                    {"metricName": 'VTC', "metricSelect": true, "metricKey": "view_through_conversions"},
                    {"metricName": 'VTC Rate', "metricSelect": false, "metricKey": "view_through_ratio"},
                    {"metricName": 'Conversions', "metricSelect": true, "metricKey": "total_conversions"},
                    {"metricName": 'Conv. Rate', "metricSelect": false, "metricKey": "total_conversion_rate"},
                    {"metricName": 'Spend', "metricSelect": false, "metricKey": "cost"}
            ],
            header: [
                [
                    {'name': 'Campaign', 'description': 'The campaign name'},
                    {'name': 'Clicks', 'description': 'The total number of emails sent'},
                    {'name': 'Impressions', 'description': 'The percentage of opened'},
                    {'name': 'CTR', 'description': 'The percentage of clicked'},
                    {'name': 'Conversions', 'description': 'The percentage of unsubscribed'},
                    {'name': 'Spend', 'description': 'The percentage of bounced'},
                ],
                [
                    {'name': 'Name', 'description': 'The campaign name'},
                    {'name': 'Rating', 'description': 'The total number of emails sent'},
                    {'name': 'Subscribers', 'description': 'The percentage of opened'},
                    {'name': 'Open Rate', 'description': 'The percentage of clicked'},
                    {'name': 'Click Rate', 'description': 'The percentage of unsubscribed'},
                ],
              ],
            id: 13
        },
    ];


    this.menu_providers = [
        {
            name: 'Intel',
            id: 0
        },
        {
            name: 'Google Analytics',
            id: 1
        },
        {
            name: 'Google Adwords',
            id: 2
        },
        {
            name: 'Google Search Console',
            id: 3
        },
        {
            name: 'Google Sheet',
            id: 4
        },
        {
            name: 'Youtube',
            id: 5
        },
        {
            name: 'Mail Chimp',
            id: 6
        },
        {
            name: 'Facebook Ads',
            id: 7
        },
        {
            name: 'Facebook',
            id: 8
        },
        {
            name: 'Call Rail',
            id: 9
        },
        {
            name: 'Data studio',
            id: 10
        },
        {
            name: 'AdRoll',
            id: 11
        }


    ];
});