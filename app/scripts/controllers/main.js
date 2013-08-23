'use strict';

angular.module('megatypeaheadApp')
    .service('cpShortNamesService', function () {
        return {
            getShortName: function (name, len) {
                if (angular.isUndefined(name) || name === null || name === '') {
                    return;
                }
                if (!angular.isString(name)) {
                    name = name.toString();
                }
                len = len || 40;
                if (name && name.length <= len) {
                    return name;
                } else {
                    var eachSide = (len - 4) / 2;
                    var str1 = name.substr(0, eachSide),
                        str2 = '...',
                        str3 = name.substr(name.length - eachSide, name.length);
                    return String().concat(str1, str2, str3);
                }
            }
        };
    })
    .filter('cpShortListNames', function (cpShortNamesService) {
        return function (listName, len) {
          return cpShortNamesService.getShortName(listName, len);
        };
    })
    .controller('MainCtrl', function ($scope, $http, $filter) {
        var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
            cities = [{city: 'Atlanta', state: 'GA'}, {city: 'Boston', state: 'MA'}, {city: 'Denver', state: 'CO'}];
        $scope.states = states;
        $scope.cities = cities;
        $scope.selected = undefined;

        $scope.cities = function(cityName) {
            return $http.jsonp("http://gd.geobytes.com/AutoCompleteCity?callback=JSON_CALLBACK&filter=US&q="+cityName).then(function(response){
                return $filter('limitTo')(response.data, 150);
            });
        };
        $scope.newCities = function(cityName, limit, offset) {
            return $http.jsonp("http://localhost:3000/search?callback=JSON_CALLBACK&limit="+limit+"&offset="+offset+"&q="+cityName).then(function(response){
                var results = $filter('limitTo')(response.data.results, limit);
                results.matching_items = response.data.matching_items;
                return results;
            });
        };
        $scope.getCampaigns = function(cityName, limit, offset) {
            return $http.jsonp("http://localhost:3000/campaigns?callback=JSON_CALLBACK&limit="+limit+"&offset="+offset+"&q="+cityName).then(function(response){
                var results = $filter('limitTo')(response.data.results, limit);
                results.matching_items = response.data.matching_items;
                return results;
            });
        };

        $scope.typeaheadConfig = {
            minSearch: 1,
            waitTime: 0,
            multiple: true,
            aggregateTab: {
                tabName: 'All',
                paneUrl: "'views/all-pane.html'",
                maxCount: 5
            },
            sources: [
                {
                    tabName: 'Campaigns',
                    data: cities,
                    headerTemplateUrl: "'views/campaign-header.html'",
                    matchTemplateUrl: "'views/campaign-match.html'",
                    //controller: 'CitiesTabController',
                    controller: function ($scope) {
                        $scope.clickedIt = function (data) {
                            alert(data);
                        }
                        $scope.selectItem = function (type, data) {
                            console.log(type + ': ' + data);
                        }
                    },
                    limit: 20,
                    source: 'suggestion for suggestion in getCampaigns($viewValue, limit, offset)'
                },{
                    tabName: 'States-Cities',
                    data: cities,
                    headerTemplateUrl: "'views/city-header.html'",
                    matchTemplateUrl: "'views/city-match.html'",
                    //controller: 'CitiesTabController',
                    controller: function ($scope) {
                        $scope.clickedIt = function (data) {
                            alert(data);
                        }
                        $scope.selectItem = function (type, data) {
                            console.log(type + ': ' + data);
                        }
                    },
                    limit: 20,
                    source: 'suggestion for suggestion in newCities($viewValue, limit, offset)'
                },
                {
                    tabName: 'New Cities',
                    data: cities,
                    headerTemplateUrl: "'views/city-header.html'",
                    matchTemplateUrl: "'views/city-match.html'",
                    //controller: 'CitiesTabController',
                    controller: function ($scope) {
                        $scope.clickedIt = function (data) {
                            alert(data);
                        }
                        $scope.selectItem = function (type, data) {
                            console.log(type + ': ' + data);
                        }
                    },
                    limit: 20,
                    source: 'suggestion for suggestion in newCities($viewValue, limit, offset)'
                },

                {
                    tabName: 'Test',
                    data: cities,
                    headerTemplateUrl: "'views/city-header.html'",
                    matchTemplateUrl: "'views/city-match.html'",
                    //controller: 'CitiesTabController',
                    controller: function ($scope) {
                        $scope.clickedIt = function (data) {
                            alert(data);
                        }
                        $scope.selectItem = function (type, data) {
                            console.log(type + ': ' + data);
                        }
                    },
                    limit: 20,
                    source: 'suggestion for suggestion in newCities($viewValue, limit, offset)'
                },
                {
                    tabName: 'Cities',
                    data: cities,
                    headerTemplateUrl: "'views/city-header.html'",
                    templateUrl: "'views/city-match.html'",
                    //controller: 'CitiesTabController',
                    controller: function ($scope) {
                        $scope.clickedIt = function (data) {
                            alert(data);
                        }
                        $scope.selectItem = function (type, data) {
                            console.log(type + ': ' + data);
                        }
                    },
                    source: 'suggestion for suggestion in states | filter: $viewValue'
                },
                {
                    tabName: 'States',
                    data: states,
                    headerTemplateUrl: "'views/city-header.html'",
                    source: 'state for state in source.data | limitTo:20'
                }
            ]
        }

    });
