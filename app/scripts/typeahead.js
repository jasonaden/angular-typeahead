angular.module('mega.typeahead', ['ui.bootstrap.position'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
    .factory('megaTypeaheadParser', ['$parse', function ($parse) {

        //                      00000111000000000000022200000000000000003333333333333330000000000044000
        var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

        return {
            parse: function (input) {

                var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
                if (!match) {
                    throw new Error(
                        "Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
                            " but got '" + input + "'.");
                }

                return {
                    itemName: match[3],
                    source: $parse(match[4]),
                    viewMapper: $parse(match[2] || match[1]),
                    modelMapper: $parse(match[1])
                };
            }
        };
    }])

    .directive('megaTypeaheadWrapper', ['$compile', '$parse', '$q', '$timeout', '$document', '$position',
        function ($compile, $parse, $q, $timeout, $document, $position) {
            var HOT_KEYS = [9, 13, 27, 38, 40];
            return {
                require: 'ngModel',
                link: function (originalScope, element, attrs, modelCtrl) {


                    var $setSelectionValue = $parse(attrs.megaTypeaheadSelection).assign;
                    var $setModelValue = $parse(attrs.ngModel).assign;

                    //create a child scope for the typeahead directive so we are not polluting original scope
                    //with typeahead-specific data (matches, query etc.)
                    var scope = originalScope.$new();
                    originalScope.$on('$destroy', function () {
                        scope.$destroy();
                    });
                    var options = $parse(attrs.megaTypeaheadWrapper)(originalScope),
                        sources = options.sources,
                        //minimal no of characters that needs to be entered before typeahead kicks-in
                        minSearch = options.minSearch || 1,
                        //minimal wait time after last character typed before typehead kicks-in
                        waitTime = options.waitTime || 0,
                        selection = options.multiple ? [] : undefined,
                        i;


                    angular.forEach(sources, function (source, idx) {
                        source.controller = source.controller || angular.noop;
                        source.limit = source.limit || 20;
                        source.offset = source.offset || 0;
                    });

                    // Setup scope for proper prototypical inheritance
                    scope.master = {};
                    angular.extend(scope.master, {
                        query: undefined,
                        sources: sources,
                        aggregateTab: options.aggregateTab,
                        tab: -1,
                        activeIdx: -1,
                        // TODO: need to adjust the select method
                        select: 'select(activeIdx)'
                    });

                    var resetMatches = function () {
                        scope.master.query = undefined;
                        angular.forEach(sources, function (source, idx) {
                            source.matches = [];
                            source.aggregateMatches = [];
                            source.pageCount = undefined;
                            source.offset = 0;
                        });

                        $setModelValue(originalScope, '');
                    };
                    //pop-up element used to display matches
                    var popUpEl = angular.element('<div data-mega-typeahead-popup></div>'),
                        updateSearch = function (inputValue) {

                            scope.master.activeIdx = -1;
                            scope.master.query = inputValue;
                            //position pop-up with matches - we need to re-calculate its position each time we are opening a window
                            //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
                            //due to other elements being rendered
                            scope.master.position = $position.position(element);
                            scope.master.position.top = scope.master.position.top + element.prop('offsetHeight');

                        },
                        //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later
                        timeoutPromise;

                    //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
                    //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
                    modelCtrl.$parsers.push(function (inputValue) {

                        if (inputValue && inputValue.length >= minSearch) {
                            if (waitTime > 0) {
                                if (timeoutPromise) {
                                    $timeout.cancel(timeoutPromise);//cancel previous timeout
                                }
                                timeoutPromise = $timeout(function () {
                                    updateSearch(inputValue);
                                }, waitTime);
                            } else {
                                updateSearch(inputValue);
                            }
                        } else {
                            scope.master.query = undefined;
                        }

                        return undefined;
                        //return isEditable ? inputValue : undefined;
                    });

//                    modelCtrl.$formatters.push(function (modelValue) {
//
//                        var candidateViewValue, emptyViewValue;
//                        var locals = {};
//
//                        if (inputFormatter) {
//
//                            locals['$model'] = modelValue;
//                            return inputFormatter(originalScope, locals);
//
//                        } else {
//
//                            //it might happen that we don't have enough info to properly render input value
//                            //we need to check for this situation and simply return model value if we can't apply custom formatting
//                            locals[parserResult.itemName] = modelValue;
//                            candidateViewValue = parserResult.viewMapper(originalScope, locals);
//                            locals[parserResult.itemName] = undefined;
//                            emptyViewValue = parserResult.viewMapper(originalScope, locals);
//
//                            return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
//                        }
//                    });

                    // TODO: Rework this to deal with tabs
                    //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
                    element.bind('keydown', function (evt) {

                        //typeahead is open and an "interesting" key was pressed
                        if (HOT_KEYS.indexOf(evt.which) === -1) {
                            return;
                        }

                        evt.preventDefault();


                        // TODO: WORK IN WRAPPING AROUND AFTER DOING PAGING
                        if (evt.which === 40) {
                            scope.master.activeIdx = (scope.master.activeIdx + 1);
                            scope.$digest();

                        } else if (evt.which === 38) {
                            scope.master.activeIdx = (scope.master.activeIdx >= 0 ? scope.master.activeIdx : 0) - 1;
                            scope.$digest();

                        } else if (evt.which === 13 || evt.which === 9) {
                            scope.$apply(function () {
                                scope.select(scope.master.activeIdx);
                            });

                        } else if (evt.which === 27) {
                            evt.stopPropagation();

                            resetMatches();
                            scope.$digest();
                        }
                    });
                    // TODO: Write this method
                    scope.select = function (idx, match) {
                        if (options.multiple){
                            if(match) {
                                selection.push(match);
                            } else {
                                selection.push(scope.master.currentSource.matches[idx]);
                            }
                            element[0].focus();
                        } else {
                            if(match) {
                                selection = match
                            } else {
                                selection = scope.master.currentSource.matches[idx];
                            }
                            resetMatches();
                        }
                        $setSelectionValue(originalScope, selection);
                    };

                    scope.pageNext = function(){
                        scope.master.currentSource.offset = scope.master.currentSource.offset + 1
                    };

                    scope.pagePrev = function(){
                        scope.master.currentSource.offset = scope.master.currentSource.offset - 1
                    };

                    // Set the current tab so we know where we are. Change selected index to -1 when changing tabs.
                    scope.currentTab = function (idx, source) {
                        if(scope.master.currentSource)
                            scope.master.currentSource.active = false;
                        source.active = true;
                        scope.master.tab = angular.isUndefined(idx) ? -1 : idx;
                        scope.master.activeIdx = -1;
                        scope.master.currentSource = source;
                        scope.master.activeIdx = -1;
                        element[0].focus();
                    };



                    $document.bind('click', function (e) {
                        if($.contains(document.getElementsByClassName('megatypeahead')[0], e.target )){ return; }
                        resetMatches();
                        scope.$digest();
                    });

                    element.after($compile(popUpEl)(scope));
                    //scope.master.currentSource = sources[0];
                    //scope.master.matches = {};
                    //sources[0].active = true;
                }
            }
        }])

    .directive('megaTypeaheadPane', ['$compile', '$parse', '$q', '$timeout', '$document', '$position', '$http', '$templateCache', 'megaTypeaheadParser',
        function ($compile, $parse, $q, $timeout, $document, $position, $http, $templateCache, megaTypeaheadParser) {
        return {
            scope: true,
            link: function (scope, element, attrs) {

                //SUPPORTED ATTRIBUTES (OPTIONS)
                //should it restrict model values to the ones selected from the popup only?
                var isEditable = scope.$eval(attrs.typeaheadEditable) !== false;

                //binding to a variable that indicates if matches are being retrieved asynchronously
                var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

                //INTERNAL VARIABLES
                //expressions used by typeahead
                scope.source = $parse(attrs.megaTypeaheadPane)(scope);

                var parserResult;
                if(scope.source.source) {
                    parserResult = megaTypeaheadParser.parse(scope.source.source);
                }
                //custom item template
                if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
                    popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
                }

                var resetMatches = function () {
                    scope.source.matches = [];
                    scope.source.aggregateMatches = [];
                    //scope.master.matches[tabName] = [];
                    scope.activeIdx = -1;
                };

                resetMatches();
                var getMatchesAsync = function (inputValue) {

                    if(!parserResult) return;
                    var locals = {$viewValue: inputValue, limit: scope.source.limit || 20, offset: scope.source.offset || 0};
                    isLoadingSetter(scope, true);
                    $q.when(parserResult.source(scope, locals)).then(function (matches) {

                        resetMatches();

                        //it might happen that several async queries were in progress if a user were typing fast
                        //but we are interested only in responses that correspond to the current view value
                        if (inputValue === scope.master.query) {
                            if (matches.length > 0) {

                                scope.source.activeIdx = -1;
                                scope.source.matches = [];

                                //transform labels
                                for (var i = 0; i < matches.length; i++) {
                                    locals[parserResult.itemName] = matches[i];
                                    scope.source.matches.push({
                                        data: parserResult.viewMapper(scope, locals),
                                        model: matches[i]
                                    });
                                    if (i < 5) {
                                        scope.source.aggregateMatches.push({
                                            data: parserResult.viewMapper(scope, locals),
                                            model: matches[i]
                                        });
                                    }
                                }
                                scope.source.matching_items = matches.matching_items;
                                scope.source.pageCount = Math.ceil(matches.matching_items / scope.source.limit);
                                //scope.master.matches[tabName].matching_items = matches.matching_items;
                                //scope.master.matches[tabName].pageCount = Math.ceil(matches.matching_items / locals.limit);
                            } else {
                                resetMatches();
                            }
                            isLoadingSetter(scope, false);
                        }
                    }, function () {
                        resetMatches();
                        isLoadingSetter(scope, false);
                    });
                };

                //resetMatches();
                scope.$watch('source.offset', function (val, prev) {
                    if(val === prev){ return; }
                    getMatchesAsync(scope.master.query)
                });

                //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
                scope.$watch('master.query', function (val, prev) {
                    if(val === prev){ return; }
                    //resetMatches();
                    if (val && val.length) {
                        getMatchesAsync(val);
                    }
                    return undefined;
                });

                var tplUrl = $parse(scope.source.paneUrl)(scope) || 'views/typeahead-pane.html';
                $http.get(tplUrl, {cache: $templateCache}).success(function (tplContent) {
                    element.append($compile(tplContent.trim())(scope));
                });
                //element.after($compile(popUpEl)(scope));
            }
        };

    }])
    .directive('megaTypeaheadPopup', function () {
        return {
            restrict: 'A',
            scope: true,
            replace: true,
            templateUrl: 'views/mega-typeahead-popup.html',
            link: function (scope, element, attrs) {
                scope.templateUrl = attrs.templateUrl;

                scope.isOpen = function () {
                    return scope.master.query && scope.master.query.length > 0;
                };

                scope.isActive = function (matchIdx) {
                    return scope.master.activeIdx == matchIdx;
                };

                scope.isActiveAllTab = function (matchIdx, parentIdx, sources) {
                    var cnt = -1;
                    for(var i = 0 ; i < sources.length ; i++) {
                        var source = sources[i];
                        for(var j = 0 ; j < source.aggregateMatches.length ; j++) {
                            cnt++;
                            if (scope.master.activeIdx === cnt) {
                                if (i === parentIdx && matchIdx === j)
                                    return true;
                            }


                        }
                    }
                    return false;
                };

                scope.selectActive = function (matchIdx, source) {
                    if(source)
                        source.activeIdx = matchIdx;
                };

                scope.selectMatch = function (matchIdx, match) {
                    scope.select(matchIdx, match);
                };
            }
        };
    })
    .directive('megaTypeaheadMatch', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attrs) {
                var tplUrl = $parse(scope.source.matchTemplateUrl)(scope) || 'views/typeahead-match.html';
                $http.get(tplUrl, {cache: $templateCache}).success(function (tplContent) {
                    element.replaceWith($compile(tplContent.trim())(scope));
                });
            }
        };
    }])
    .directive('megaTypeaheadHeader', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attrs) {
                var tplUrl = $parse(scope.source.headerTemplateUrl)(scope) || 'views/typeahead-header.html';
                $http.get(tplUrl, {cache: $templateCache}).success(function (tplContent) {
                    element.replaceWith($compile(tplContent.trim())(scope));
                });
            }
        };
    }])
    .filter('megaTypeaheadHighlight', function () {

        function escapeRegexp(queryToEscape) {
            return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }

        return function (matchItem, query) {
            return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : query;
        };
    })
    .filter('pages', function() {
        return function(input, params) {
            var total = params.total,
                offset = params.offset,
                start = Math.floor(offset/5) * 5,
                end = total-start > 5 ? start+5 : total,
                i;

            for(i=start;i<end;i++){
                input.push(i);
            }

            return input;
        };
    });