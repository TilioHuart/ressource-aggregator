import {ng} from 'entcore';
import {Scope} from './main'
import {Filter, Frame, Resource} from "../model";
import {ILocationService} from "angular";
import {addFilters} from "../utils";

declare let window: any;

function initSources(value: boolean) {
    const sources = {};
    window.sources.forEach((source) => sources[source] = value);
    return sources;
}

interface ViewModel {
    loaders: any;
    resources: Resource[];
    displayedResources: Resource[];
    sources: any;
    filters: {
        initial: { document_types: Filter[], levels: Filter[] }
        filtered: { document_types: Filter[], levels: Filter[] }
    };
    filteredFields: string[];

    getSourcesLength(): number;

    formatClassName(className: string): string;

    filter(item: Resource);

    isLoading(): boolean;

    getAdvancedSearchField(): string[];

    emptyAdvancedSearch(): boolean;

    //

    columns: number[];
    testbooks: Resource[];
}

interface EventResponses {
    search_Result(frame: Frame): void;
}

export const searchController = ng.controller('SearchController', ['$scope', '$location',
    function ($scope: Scope, $location: ILocationService) {
        if ($scope.mc.search.plain_text.text.trim().length === 0
            && Object.keys($scope.mc.search.advanced.values).length === 0) {
            $location.path('/');
        }
        const vm: ViewModel = this;
        vm.filteredFields = ['document_types', 'levels'];

        const initSearch = function () {
            vm.loaders = initSources(true);
            vm.sources = initSources(false);
            vm.displayedResources = [];
            vm.resources = [];
            vm.filters = {
                initial: {document_types: [], levels: []},
                filtered: {document_types: [], levels: []}
            };
        };

        initSearch();
        vm.loaders = initSources(true);

        const filter = function () {
            vm.displayedResources = [];
            vm.resources.forEach(function (resource: Resource) {
                let match = true;
                vm.filteredFields.forEach(function (field: string) {
                    vm.filters.filtered[field].forEach(function ({name}: Filter) {
                        match = match && resource[field].includes(name);
                    });
                });
                if (match) {
                    vm.displayedResources.push(resource);
                    // console.log(resource);
                }
            });

            $scope.safeApply();
        };

        $scope.$watch(() => vm.filters.filtered.document_types.length, filter);
        $scope.$watch(() => vm.filters.filtered.levels.length, filter);


        $scope.$on('search', function () {
            initSearch();
            $scope.safeApply();
        });

        $scope.ws.onmessage = (message) => {
            const {event, state, data, status, error} = JSON.parse(message.data);
            if ("ok" !== status) {
                vm.loaders[error.source] = false;
                $scope.safeApply();
                throw JSON.parse(message.data).error;
            }
            if (event in eventResponses) eventResponses[event](new Frame(event, state, data));
        };

        const eventResponses: EventResponses = {
            search_Result: function (frame) {
                if (frame.data.source == "fr.openent.mediacentre.source.Moodle") {
                    for (let i = 0; i < frame.data.hits.length; i++) {
                        let resource = frame.data.hits[i]._source;
                        resource.date = formateDate(resource.date);
                        vm.resources.push(resource);
                        addFilters(vm.filteredFields, vm.filters.initial, resource);
                    }
                }
                else {
                    vm.resources = [...vm.resources, ...frame.data.resources];
                    frame.data.resources.forEach((resource) => addFilters(vm.filteredFields, vm.filters.initial, resource));
                }
                filter();
                vm.loaders[frame.data.source] = false;
                $scope.safeApply();
            }
        };

        const formateDate = function (date:string) : string {
            let testDate = new Date(date);
            let dd = testDate.getDate();
            let mm = testDate.getMonth() + 1;
            let yyyy = testDate.getFullYear();
            let formatedDate = "";

            if (dd < 10) { formatedDate += '0'; }
            formatedDate += dd + '/';
            if (mm < 10) { formatedDate += '0'; }
            formatedDate += mm + '/' + yyyy;

            return formatedDate;
        }

        vm.getSourcesLength = function () {
            return Object.keys(vm.loaders).length;
        };

        vm.formatClassName = (className) => className.replace(new RegExp("\\.", 'g'), '-');

        vm.isLoading = function () {
            let count = 0;
            let loaders = Object.keys(vm.loaders);
            loaders.forEach((loader: string) => {
                if (vm.loaders[loader]) {
                    count++;
                }
            });
            return count > 0;
        };

        vm.getAdvancedSearchField = function () {
            return Object.keys($scope.mc.search.advanced.values);
        };

        vm.emptyAdvancedSearch = function () {
            let empty = true;
            Object.keys($scope.mc.search.advanced.values).forEach((field: string) => {
                empty = empty && ($scope.mc.search.advanced.values[field].value.trim().length === 0)
            });

            return empty;
        }

        //

        const nbColumns = 2;
        vm.columns = [];
        function calculColumns() {
            for (let i = 0; i < nbColumns; i++) {
                vm.columns.push(i);
            }
            // @ts-ignore
            // document.querySelector("body.mediacentre-v2.search-grid").style.cssText = "$mediacentre-nbColumns: 2;";
        }
        calculColumns();
        // vm.testbooks = [];
        // function fillTestbooks() {
        //     for (let i = 0; i < 10; i++) {
        //         vm.testbooks.push(new class implements Resource {
        //                 authors= ["M. Martin"];
        //                 date= 16042020;
        //                 description= "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere, turpis vitae hendrerit fermentum, turpis tellus varius velit, et varius ipsum risus nec nunc. Pellentesque commodo, nisi dictum finibus hendrerit, leo nisl pulvinar sapien, non sagittis lectus velit eget magna. Nam pulvinar consequat ipsum, sit amet sagittis enim mattis eget. Nulla at ultricies lorem, in vestibulum diam. Cras elementum urna non lectus aliquam eleifend. Curabitur vel tellus a velit consequat tincidunt ac ac sapien. Proin commodo libero ut tortor semper, vel auctor sapien congue. Praesent porttitor consequat erat ut cursus. Ut non lobortis odio, id rutrum arcu. Sed semper lacinia lacus, eu vestibulum massa mattis eu.";
        //                 disciplines= ["Histoire-Géographie", "EMC"];
        //                 displayTitle= "Enseigner le numérique";
        //                 document_types= [];
        //                 editors= ["A. Thomas"];
        //                 favorite= false;
        //                 hash= 0;
        //                 id= i.toString();
        //                 image= "string";
        //                 levels= ["Tous niveaux"];
        //                 link= "string";
        //                 plain_text= "string";
        //                 source= "fr.openent.mediacentre.source.Moodle";
        //                 title= "Enseigner le nuémrique";
        //             }
        //         );
        //     }
        // }
        // fillTestbooks();
    }]);
