import {ng} from 'entcore';
import {Scope} from './main'
import {Filter, Frame, Resource} from "../model";

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
}

interface EventReponses {
    search_Result(frame: Frame): void;
}

export const searchController = ng.controller('SearchController', ['$scope', function ($scope: Scope) {
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
        const {event, data, status} = JSON.parse(message.data);
        if ("ok" !== status) {
            throw JSON.parse(message.data).error;
        }
        if (event in eventResponses) eventResponses[event](new Frame(event, data));
    };

    function addFilters(resource: Resource) {
        vm.filteredFields.forEach((filterName) => {
            (resource[filterName] as Array<string>).forEach((filterValue) => {
                if (!vm.filters.initial[filterName].find((el: Filter) => el.name === filterValue)) {
                    vm.filters.initial[filterName].push({
                        name: filterValue,
                        toString: function () {
                            return this.name
                        }
                    });
                }
            });
        });
    }

    const eventResponses: EventReponses = {
        search_Result: function (frame) {
            vm.resources = [...vm.resources, ...frame.data.resources];
            frame.data.resources.forEach(addFilters);
            filter();
            vm.loaders[frame.data.source] = false;
            $scope.safeApply();
        }
    };

    vm.getSourcesLength = function () {
        return Object.keys(vm.loaders).length;
    };

    vm.formatClassName = (className) => className.replace(new RegExp("\\.", 'g'), '-');
}]);
