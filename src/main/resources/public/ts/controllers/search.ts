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
    width: number;
    mobile: boolean;
    displayFilter: boolean;
    loaders: any;
    resources: Resource[];
    displayedResources: Resource[];
    sources: any;
    filters: {
        initial: { document_types: Filter[], levels: Filter[], source: Filter[] }
        filtered: { document_types: Filter[], levels: Filter[], source: Filter[] }
    };
    filteredFields: string[];

    getSourcesLength(): number;

    formatClassName(className: string): string;

    filter(item: Resource);

    isLoading(): boolean;

    getAdvancedSearchField(): string[];

    emptyAdvancedSearch(): boolean;

    showFilter(): void;
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
        vm.mobile = screen.width < $scope.mc.screenWidthLimit;
        vm.displayFilter = !vm.mobile;
        vm.filteredFields = ['document_types', 'levels', 'source'];

        const initSearch = function () {
            vm.loaders = initSources(true);
            vm.sources = initSources(false);
            vm.displayedResources = [];
            vm.resources = [];
            vm.filters = {
                initial: {document_types: [], levels: [], source: []},
                filtered: {document_types: [], levels: [], source: []}
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
        $scope.$watch(() => vm.filters.filtered.source.length, filter);


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
            if (event in eventResponses) eventResponses[event](new Frame(event, state, [], data));
        };

        const eventResponses: EventResponses = {
            search_Result: function (frame) {
                vm.resources = [...vm.resources, ...frame.data.resources];
                vm.resources = vm.resources.sort((a, b) => a.title.localeCompare(b.title));
                frame.data.resources.forEach((resource) => addFilters(vm.filteredFields, vm.filters.initial, resource));
                filter();
                frame.data.resources = frame.data.resources.sort((a, b) => a.title.localeCompare(b.title));
                vm.loaders[frame.data.source] = false;
                $scope.safeApply();
            }
        };
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
        };

        vm.showFilter = function () {
            vm.displayFilter = !vm.displayFilter;
        }
    }]);
