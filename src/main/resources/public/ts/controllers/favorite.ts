import {ng} from 'entcore';
import {Scope} from './main'
import {Filter, Frame, Resource} from '../model';
import {addFilters} from '../utils';

interface ViewModel {
    loaders: any;
    resources: Resource[];
    favorites: Resource[];
    displayedResources: Resource[];
    filters: {
        initial: {  source: Filter[], document_types: Filter[], levels: Filter[] }
        filtered: {  source: Filter[], document_types: Filter[], levels: Filter[] }
    };
    filteredFields: string[];
}

interface EventResponses {
    favorites_Result(frame: Frame): void;
}


export const favoriteController = ng.controller('FavoriteController', ['$scope', 'route', function ($scope: Scope) {
    const vm: ViewModel = this;

    vm.favorites = [];
    vm.filteredFields = [ 'document_types', 'levels'];

    $scope.$on('deleteFavorite', function(event, id) {
        vm.displayedResources = vm.favorites.filter(el => el.id !== id);
    });

    const initFavorite = function () {
        vm.displayedResources = [];
        vm.resources = [];
        vm.favorites = [];
        vm.filters = {
            initial: { source: [], document_types: [], levels: []},
            filtered: {source: [], document_types: [], levels: []}
        };
    };

    initFavorite();

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

    $scope.ws.onmessage = (message) => {
        const {event, state, data, status} = JSON.parse(message.data);
        if ("ok" !== status) {
            throw data.error;
        }
        if (event in eventResponses) eventResponses[event](new Frame(event, state, data));
    };

    const eventResponses: EventResponses = {
        favorites_Result: function (frame) {
            vm.resources = [...vm.resources, ...frame.data];
            vm.favorites = frame.data;
            frame.data.forEach((resource)=> addFilters(vm.filteredFields, vm.filters.initial, resource));
            filter();
            $scope.safeApply();
        }
    };

    function initFavoritePage() {
        $scope.ws.send(new Frame('favorites', 'get', {}));
    }

    if ($scope.ws.connected) {
        initFavoritePage();
    } else {
        $scope.ws.onopen = initFavoritePage;
    }
}]);
