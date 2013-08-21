'use strict';

angular.module('megatypeaheadApp')
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
                return $filter('limitTo')(response.data, 150);
            });
        };

        $scope.typeaheadConfig = {
            minSearch: 1,
            waitTime: 0,
            multiple: true,
            sources: [
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
                    limit: 15,
                    source: 'suggestion for suggestion in newCities($viewValue, limit, offset)'
                },
                {
                    tabName: 'Cities',
                    data: cities,
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
                    source: 'suggestion for suggestion in cities($viewValue, limit, offset)'
                },
                {
                    tabName: 'States',
                    data: states,
                    source: 'state for state in source.data | limitTo:20'
                }
            ]
        }

    });
