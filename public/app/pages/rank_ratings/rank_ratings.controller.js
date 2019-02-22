/**
 * Ratings controller
 */
ezondapp.controller('rankratingsController', function ($scope, $cookies, $timeout, $state, $cookies, $http, $q, $mdDialog, userService, appDataService, dashboardService, config) {
    $scope.soloList = [];
    $scope.searchEgines = ['google', 'bing', 'yahoo'];
    $scope.mapPackEngine = 'map_pack';
    $scope.activeEngine = $scope.searchEgines[0];

    setDatesForStatisticByMoment(currentMoment());
    $scope.grab_startdate = angular.copy(dashboardService.rankTrackingStartDate)
    $scope.grab_enddate = angular.copy(dashboardService.endDate)

    $scope.getranks = function () {
        $scope.tableloading = true
        $http.post('/user/get_rank_results', {
            id: dashboardService.dashboard.id,
            startDate: $scope.grab_startdate,
            endDate: $scope.grab_enddate
        }).then(function (response) {
            $scope.resultat = response.data
            $scope.tableloading = false
            $scope.resultat = $scope.resultat.sort(function compare(a, b) {
                if (moment(a.dated).isAfter(moment(b.dated)))
                    return -1
                else if (moment(a.dated).isBefore(moment(b.dated)))
                    return 1
                else
                    return 0
            })
            oneValueKeyword(angular.copy($scope.resultat));
            calculateTop($scope.soloList);
            $scope.dataForMultipleChart();
            $scope.drawChartFunction($scope.activeEngine);
        }, function (response) {
            $scope.tableloading = false
        })
    }

    $scope.getranks()


    $scope.dash_keywords = dashboardService.dashboard.keywords
    $scope.wordForChart = '';

    $scope.rankStatus = function (keyword) {
        let summed = 0;
        let count = 0
        for (var i = $scope.resultat.length - 1; i >= 0; i--) {
            if ($scope.resultat[i].keyword == keyword.keyword && $scope.resultat[i].dated != keyword.dated) {
                summed += $scope.resultat[i].position
                count++
            }
        }
        let variable = (summed / count - keyword.position) * (-1)
        if (!isNaN(variable)) {
            return "(" + variable.toFixed(0) + (variable < 0 ? "-" : "+") + ")"
        }
        else {
            return ""
        }
    }

    $scope.emptykeywords = function () {
        return $scope.dash_keywords == '[""]'
    }

    $scope.emptyresult = function () {
        return $scope.dateAndValue == 'Day'
    }

    function calculateChangePosition(position, currentPosition) {
        if ((position < 0 && currentPosition < 0) || (position == null || currentPosition == null) || isNaN(currentPosition)) {
            return 0;
        } else if (position < 0) {
            return 100 - currentPosition;
        } else if (currentPosition < 0) {
            return position - 100;
        } else {
            return position - currentPosition;
        }
    }

    function calculateTop(keywords) {
        $scope.topData = {};

        $scope.searchEgines.forEach(function (engine) {
            $scope.topData[engine] = {
                up: {title: 'Keywords UP', value: 0},
                3: {title: 'Top 3', value: 0},
                10: {title: 'Top 10', value: 0},
                20: {title: 'Top 20', value: 0},
                100: {title: 'Top 100', value: 0}
            };
        });

        keywords.forEach(function (keyword) {
            $scope.searchEgines.forEach(function (engine) {
                if(engine in keyword) {
                    let position = keyword[engine].currentPosition;

                    for (let key in $scope.topData[engine]) {
                        if (isNaN(key) && keyword[engine].oneDayChange > 0) {
                            $scope.topData[engine].up.value++;
                            continue;
                        }
                        if(position <= key && position > 0) {
                            $scope.topData[engine][key].value++;
                        }
                    }
                }
            })
        });
    }

    function initDefaultEnginesData(searchEngines, source) {
        let defaultEnginesData = {};
        searchEngines.forEach(function (engine) {
            defaultEnginesData[engine] = {};
            for (let key in source) {
                defaultEnginesData[engine][key + 'Position'] = null;
                defaultEnginesData[engine][key + 'Change'] = 0;
            }
        });

        return defaultEnginesData;
    }

    function currentMoment() {
        return moment().tz(config.defaultTimeZone);
    }

    function setDatesForStatisticByMoment(moment) {
        $scope.currentDate = angular.copy(moment).format('YYYY-MM-DD');
        $scope.oneDayAgoDate = angular.copy(moment).subtract(1, 'days').format('YYYY-MM-DD');
        $scope.sevenDaysAgoDate = angular.copy(moment).subtract(6, 'days').format('YYYY-MM-DD');
        $scope.thirtyDaysAgoDate = angular.copy(moment).subtract(29, 'days').format('YYYY-MM-DD');
    }

    function oneValueKeyword(keywords) {
        $scope.soloList = [];
        const dates = {
            current: $scope.currentDate,
            oneDay: $scope.oneDayAgoDate,
            sevenDays:  $scope.sevenDaysAgoDate,
            thirtyDays: $scope.thirtyDaysAgoDate
        };

        const calculatedData = {};

        keywords.forEach(function (keyword) {
            let id = keyword.keyword_id;
            let date = keyword.dated;
            let position = keyword.position;

            let searchEngines = angular.copy($scope.searchEgines);
            searchEngines.push($scope.mapPackEngine);

            let engine = keyword.se_name;

            if($scope.currentDate == keyword.dated && !engine) {
                let rawSearchEngine = keyword.post_id.split(':')[1] || '';

                if(rawSearchEngine) {
                    engine = rawSearchEngine.replace(/_se_id/g, '');
                }
            }
            if (!engine) {
                return;
            }

            if (!(id in calculatedData)) {
                calculatedData[id] = initDefaultEnginesData(searchEngines, dates);
            }

            for (let key in dates) {
                if(date == dates[key]) {
                    if(date == dates.current && position === null) {
                        calculatedData[id][engine][key + 'Position'] = 'Crawl pending';
                        continue;
                    }
                    calculatedData[id][engine][key + 'Position'] = position;
                }
            }

            let allowpush = true;
            $scope.soloList.forEach(function (item, key, soloList) {
                if(item.keyword_id == keyword.keyword_id) {
                    if(moment(item.dated).isAfter(moment(keyword.dated))) {
                        allowpush = false;
                    } else {
                        soloList.splice(key, 1);
                    }
                }
            });

            if(allowpush) {
                let resultKeywordsData = Object.assign({}, keyword, calculatedData[keyword.keyword_id]);
                $scope.soloList.push(resultKeywordsData);
            }
        });

        for (let key in calculatedData) {
            for (let engine in calculatedData[key]) {
                let engineData = calculatedData[key][engine];
                let currentPosition = engineData.currentPosition;

                for (let index in dates) {
                    let changeKey = index + 'Change';
                    if (changeKey in engineData) {
                        engineData[changeKey] = calculateChangePosition(engineData[index + 'Position'], currentPosition);
                    }
                }
            }
        }
    }

    $scope.dataForMultipleChart = function () {
        $scope.dateAndValue = {};
        let keywords = {};
        let dates = {};

        $scope.searchEgines.forEach(function (searchEngine) {
            $scope.dateAndValue[searchEngine] = 'Day';
            keywords[searchEngine] = [];
            dates[searchEngine] = [];
        });

        let result = angular.copy($scope.resultat);

        result.forEach(function (record) {
            let engine = record.se_name;
            if (!engine || engine == $scope.mapPackEngine) {
                return;
            }

            let keyword = record.keyword + ' (' + record.location.replace(/,/g, '') + ')';
            let date = record.dated;

            if (keywords[engine].indexOf(keyword) == -1) {
                keywords[engine].push(keyword);
                $scope.dateAndValue[engine] += ',' + keyword;
            }

            if (dates[engine].indexOf(date) == -1) {
                dates[engine].push(date);
            }

        });

        for (let engine in dates) {
            dates[engine].sort(function (a, b) {
                if (moment(a).isBefore(moment(b))) return -1;
                else if (moment(a).isAfter(moment(b))) return 1;
                else return 0;
            });

            dates[engine].forEach(function (date) {
                $scope.dateAndValue[engine] += "\n" + date;

                keywords[engine].forEach(function (keyword) {
                    let found = false;

                    result.forEach(function (record) {
                        let keywordEngine = record.se_name && $scope.searchEgines.indexOf(record.se_name) >= 0 ? record.se_name : null;
                        let keywordWithLocation = record.keyword + ' (' + record.location.replace(/,/g, '') + ')';

                        if (keywordWithLocation == keyword && record.dated == date && engine == keywordEngine) {
                            found = true;
                            let position;

                            switch (record.position) {
                                case null:
                                    position = 0;
                                    break;
                                case -1:
                                    position = '';
                                    break;
                                default:
                                    position = record.position;
                            }
                            $scope.dateAndValue[engine] += ',' + position
                        }
                    });

                    if (!found) {
                        $scope.dateAndValue[engine] += ',' + '';
                    }
                })
            })
        }
    }

    $scope.toggleSearchEngine = function (searchEngine) {
        $scope.activeEngine = searchEngine;
        $scope.drawChartFunction($scope.activeEngine)
    }

    $scope.ucFirst = function (string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    $scope.drawChartFunction = function (activeEngine) {

        chart_datas = angular.copy($scope.dateAndValue[activeEngine])
        multdata = angular.copy($scope.dateAndValue[activeEngine])

        Highcharts.chart('chart-container', {
            data: {
                csv: multdata
            },
            yAxis: {
                min: 1,
                title: {
                    text: 'Position'
                },
                reversed: true,
                showLastLabel: true
            },
            title: {
                text: ''
            },
            lang: {
                noData: "Currently no data available for this time range by selected search engine"
            },
        });
    }

    $scope.managekeywords = function () {

        $mdDialog.show({
            locals: {
                words: dashboardService.dashboard.keywords
            },
            onComplete: function ($scope) {
                var autocomplete = new google.maps.places.Autocomplete(document.getElementById('keywordslocation'));
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    $scope.getKeywordsLocation(autocomplete.getPlace());
                });
            },
            template:
                `<md-dialog style="width: 50%; height: auto"> 
                        <md-toolbar class="md-padding" layout="row" layout-align="center center"> 
                            <span class="white-c">Add keywords</span> 
                            <span flex=""></span> 
                            <md-button ng-click="close()" class="md-icon-button">
                                <i class="white-c ion ion-close md-subhead"></i>
                            </md-button> </md-toolbar> 
                            <md-dialog-content class="md-padding"> 
                                <div layout="row" layout-align="center center"> 
                                    <label for="" >Keywords</label> 
                                    <span flex=""></span> 
                                    <md-button style="margin: 0 0 5px 0" ng-click="getsuggestions()">Get suggestions</md-button> 
                                </div> 
                                <div style="width: 100%" ng-class="{\'loading\': loads}"> 
                                    <textarea style="min-height: 300px;" name="" id="" cols="30"  ng-model="newWords"></textarea> 
                                </div> 
                                <input type="text" id="keywordslocation" ng-model="keywordslocation" placeholder="Location">
                            </md-dialog-content> 
                            <md-dialog-actions class="md-padding"> 
                                <md-button ng-click="updatewords()" class="md-primary md-raised">Add Keywords</md-button> 
                            </md-dialog-actions> 
                      </md-dialog>`,
            controller: function ($scope, words, $http, $mdToast) {
                $scope.showSimpleToast = function (message) {
                    $mdToast.show($mdToast.simple().textContent(message).toastClass("md-center-toast").hideDelay(5000))
                };

                $scope.close = function () {
                    $mdDialog.cancel()
                }
                $scope.keywordslocation = JSON.parse(dashboardService.dashboard.description).location;

                $scope.getKeywordsLocation = function (place) {
                    let location = {
                        countryIsoCode: '',
                        country: '',
                        city: '',
                        region: '',
                        address: '',
                    };

                    place.address_components.forEach(function (component) {
                        let type = component.types[0];

                        location.countryIsoCode = type == 'country' ? component.short_name : location.countryIsoCode;
                        location.country = type == 'country' ? component.long_name : location.country;
                        location.region = type == 'administrative_area_level_1' ? component.long_name : location.region;
                        location.city = type == 'locality' ? component.long_name : location.city;
                    });
                    location.address = place.formatted_address;
                    $scope.keywordsLocation = location;
                };


                $scope.getsuggestions = function () {

                    $scope.loads = true

                    $http.get(appDataService.appData.backendUrl + 'dataforseo/cmn_locations.php?location=' + JSON.parse(dashboardService.dashboard.description).location).then(function (response) {

                        var loc_id = response.data.split(":")[0],
                            loc_iso = response.data.split(":")[1]

                        $scope.loc_id = loc_id

                        $http.post('/user/kwrd_suggestions', {
                            url: JSON.parse(dashboardService.dashboard.description).url,
                            iso: loc_iso,
                            dashboard_id: dashboardService.dashboard.id
                        }).then(function (response) {
                            $scope.loads = false
                            let resp = response.data.sts.substring(1, response.data.sts.length - 1)
                            resp = JSON.parse(JSON.parse(response.data.sts))
                            $scope.newWords += resp.join("\n")
                        }, function (re) {
                            $scope.loads = false
                        })
                    })

                    $scope.loads = true
                }

                $scope.postkeywords = function (ids) {
                    $http({
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                        },
                        url: appDataService.appData.backendUrl + 'dataforseo/srp_tasks_post.php',
                        data: {
                            keywordsIds: JSON.stringify(ids),
                            dashId: dashboardService.dashboard.id,
                            ownerId: dashboardService.dashboard.ownerID,
                            url: JSON.parse(dashboardService.dashboard.description).url
                        }
                    }).then(function (response) {
                        console.log(response)
                    }, function (response) {
                        console.log(response)
                    })
                };

                function diffKeywords(oldKeywords, newKeywords) {
                    let data = [];
                    let deletedKeywords = 0;
                    let createdKeywords = 0;
                    let limitOfKeywords = userService.user.limits.keywords;
                    let usedKeywordsNumber = userService.user.usedOptions.keywords;

                    oldKeywords.forEach(function (value) {
                        let index = newKeywords.indexOf(value.keyword);
                        if (index == -1) {
                            data.push({
                                keyword: value.keyword,
                                address: value.address,
                                country_iso_code: value.country_iso_code,
                                country: value.country,
                                region: value.region,
                                city: value.city,
                                deleted_at: currentMoment().format('YYYY-MM-DD')
                            });
                            deletedKeywords++;
                        } else {
                            newKeywords.splice(index, 1);
                        }
                    });

                    newKeywords.forEach(function (value) {
                        data.push({
                            keyword: value,
                            address: $scope.keywordsLocation.address,
                            country_iso_code: $scope.keywordsLocation.countryIsoCode,
                            country: $scope.keywordsLocation.country,
                            region: $scope.keywordsLocation.region,
                            city: $scope.keywordsLocation.city,
                            deleted_at: null
                        });
                        createdKeywords++
                    });

                    let addingKeywordsNumber = createdKeywords - deletedKeywords;
                    let isAllowedAddingKeywords = (usedKeywordsNumber + addingKeywordsNumber) <= limitOfKeywords;

                    return isAllowedAddingKeywords ? data : [];
                }

                $scope.updatewords = async function () {
                    $scope.loads = true;

                    let allWords = angular.copy($scope.newWords).split("\n").filter(word => word != '');

                    if ($scope.keywordsLocation == undefined) {
                        let address = document.getElementById('keywordslocation').value.replace(/ /g, '+');
                        let response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?&address=' + address + '&language=en&key=' + appDataService.appData.googleMapKey);
                        let result = await response.json();

                        if (result.status == 'OK' && result.results) {
                            $scope.getKeywordsLocation(result.results[0]);
                        }
                    }

                    let diff = diffKeywords(words, allWords);
                    if(diff.length == 0) {
                        alert('You have exceeded the limit for the number of keywords.');
                        initNewWords(words);
                        $scope.loads = false;
                        return false;
                    }

                    $http.post('/user/managekeywords', {
                        id: dashboardService.dashboard.id,
                        words: JSON.stringify(diff)
                    }).then(function (response) {
                        let message = 'Your keywords have been added successfully. Please allow few hours for ezond bots to collect this data.';
                        $scope.showSimpleToast(message);
                        dashboardService.getDashboard(dashboardService.dashboard.id).then(function (resp) {
                            let newKeywords = [];
                            let newKeywordsIds = [];
                            diff.forEach(function (value) {
                                if (value.deleted_at == null) {
                                    newKeywords.push(value.keyword + ':' + value.address);
                                }
                            });

                            dashboardService.dashboard.keywords.forEach(function (value) {
                                let uniqueValue = value.keyword + ':' + value.address;
                                if (newKeywords.indexOf(uniqueValue) >= 0) {
                                    newKeywordsIds.push(value.id);
                                }
                            });

                            if (newKeywordsIds.length > 0) {
                                $scope.postkeywords(newKeywordsIds)
                            }
                        });

                        $scope.loads = false
                    }, function (response) {
                        $scope.loads = false
                        $scope.showSimpleToast("Error while keywords update!")
                    })
                    $mdDialog.hide()
                }

                function initNewWords(words) {
                    $scope.newWords = '';
                    words.forEach(function (word) {
                        $scope.newWords += (word.keyword + '\n');
                    });
                }

                initNewWords(words);
            },
            escapeToClose: false
        }).then(function (closed) {
            $timeout(function () {
                $scope.getranks()
            }, 2000)

        }).then(function () {
            appDataService.getAppData();
        })
    }

    $scope.found = function (value, message) {
        let result = message || 'Not found in top 100';

        return value == -1 ? result : value;
    }

    let today = currentMoment();
    let yesterday = currentMoment().subtract(1, 'days');
    let last7days = currentMoment().subtract(6, 'days');
    let last30days = currentMoment().subtract(29, 'days');
    let startThisMonth = currentMoment().startOf('month');
    let endThisMonth = currentMoment().endOf('month');
    let startLastMonth = currentMoment().subtract(1, 'month').startOf('month');
    let endLastMonth = currentMoment().subtract(1, 'month').endOf('month');

    if ($scope.grab_startdate == dashboardService.rankTrackingStartDate && today.format('YYYY-MM-DD') == dashboardService.endDate) {
        $scope.calendarLabel = "All Time";
    } else if (today.format('YYYY-MM-DD') == dashboardService.startDate && today.format('YYYY-MM-DD') == dashboardService.endDate) {
        $scope.calendarLabel = "Today";
    } else if (yesterday.format('YYYY-MM-DD') == dashboardService.startDate && yesterday.format('YYYY-MM-DD') == dashboardService.endDate) {
        $scope.calendarLabel = "Yesterday";
    } else if (last7days.format('YYYY-MM-DD') == dashboardService.startDate && today == dashboardService.endDate) {
        $scope.calendarLabel = "Last 7 Days";
    } else if (last30days.format('YYYY-MM-DD') == dashboardService.startDate && today == dashboardService.endDate) {
        $scope.calendarLabel = "Last 30 Days";
    } else if (startThisMonth.format('YYYY-MM-DD') == dashboardService.startDate && endThisMonth.format('YYYY-MM-DD') == dashboardService.endDate) {
        $scope.calendarLabel = "This Month";
    } else if (startLastMonth.format('YYYY-MM-DD') == dashboardService.startDate && endLastMonth.format('YYYY-MM-DD') == dashboardService.endDate) {
        $scope.calendarLabel = "Last Month";
    } else {
        $scope.calendarLabel = moment(dashboardService.startDate).format('MMMM D YYYY') + " - " + moment(dashboardService.endDate).format('MMMM D YYYY');
    }


    $(function () {
        $('.daterangepicker').remove()

        $('#CalendarText2').daterangepicker({
            "autoApply": true,
            "ranges": {
                'Today': [today, today],
                'Yesterday': [yesterday, yesterday],
                'Last 7 Days': [last7days, today],
                'Last 30 Days': [last30days, today],
                'All Time': [moment(dashboardService.rankTrackingStartDate), today],
                'This Month': [startThisMonth, endThisMonth],
                'Last Month': [startLastMonth, endLastMonth]
            },
            "startDate": moment(dashboardService.rankTrackingStartDate),
            "endDate": moment(dashboardService.endDate),
            "dateFormat": "yy-mm-dd",
            "opens": "left"
        }, function (start, end, label) {

            $scope.calendarLabel = label
        });


        $('#CalendarText2').on('apply.daterangepicker', function (ev, picker) {
            $scope.grab_startdate = picker.startDate.format('YYYY-MM-DD');
            $scope.grab_enddate = picker.endDate.format('YYYY-MM-DD');

            dashboardService.startDate = picker.startDate.format('YYYY-MM-DD');
            dashboardService.endDate = picker.endDate.format('YYYY-MM-DD');

            setDatesForStatisticByMoment(picker.endDate);
            $scope.getranks();
            console.log("Date Range Selected is " + $scope.grab_startdate + " ~ " + $scope.grab_enddate);
        })

        $("#CalendarTextBtn2").click(function () {
            $("#CalendarText2").click();
        })
    });

});