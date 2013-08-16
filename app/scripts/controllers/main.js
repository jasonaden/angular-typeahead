'use strict';

angular.module('megatypeaheadApp')
    .controller('MainCtrl', function ($scope) {
        var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
            cities = ['Atlanta', 'Boston', 'Colorado'];
        $scope.states = states;
        $scope.cities = cities;
        $scope.selected = undefined;

        $scope.typeaheadConfig = {
            sources: [
                {
                    tabName: 'States',
                    data: states,
                    source: 'state for state in source | filter:$viewValue | limitTo:20'
                },
                {
                    tabName: 'Cities',
                    data: cities,
                    source: 'city for city in source | filter:$viewValue | limitTo:20'
                }
            ]
        }

    });
