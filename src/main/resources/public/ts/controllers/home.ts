import {ng} from 'entcore';
import {Scope} from './main'
import {Frame, Resource} from '../model';
import {ILocationService} from "angular";

interface ViewModel {
    mobile: boolean;
    favoriteLimit: number;
    resourceLimit: number;
    loaders: any;
    resources: Resource[];
    favorites: Resource[];
    textbooks: Resource[];
    displayedResources: Resource[];

    seeMyFavorite(): void;

    refreshTextBooks(): void;

    seeMyExternalResource(): void;
}

interface EventResponses {
    favorites_Result(frame: Frame): void;

    textbooks_Result(frame: Frame): void;

    search_Result(frame: Frame): void;
}


export const homeController = ng.controller('HomeController', ['$scope', 'route', '$location',
    function ($scope: Scope, route, $location: ILocationService) {
        const vm: ViewModel = this;
        vm.favorites = [];
        vm.textbooks = [];
        vm.displayedResources = [];
        vm.mobile = screen.width < $scope.mc.screenWidthLimit;
        vm.resourceLimit = vm.mobile ? 6 : 12;
        vm.favoriteLimit = vm.mobile ? 2 : 4;

        $scope.$on('deleteFavorite', function (event, id) {
            vm.favorites = vm.favorites.filter(el => el.id !== id);
            vm.textbooks[vm.textbooks.findIndex(el => el.id == id)].favorite = false;
        });

        $scope.$on('addFavorite', function (event, resource) {
            vm.favorites.push(resource);
        });

        $scope.ws.onmessage = (message) => {
            const {event, state, data, status} = JSON.parse(message.data);
            if ("ok" !== status) {
                throw data.error;
            }
            if (event in eventResponses) eventResponses[event](new Frame(event, state, [], data));
        };

        const eventResponses: EventResponses = {
            textbooks_Result: function (frame) {
                vm.textbooks = frame.data.textbooks;
                $scope.safeApply();
            },
            favorites_Result: function (frame) {
                if (Object.keys(frame.data).length === 0) {
                    vm.favorites = []
                } else {
                    vm.favorites = frame.data;
                    vm.favorites.map((favorite) => {
                        favorite.favorite = true;
                    });
                }
                $scope.safeApply();
            },
            search_Result: function (frame) {
                vm.displayedResources = frame.data.resources;
                $scope.safeApply();
            }
        };

        vm.seeMyFavorite = (): void => {
            $location.path(`/favorite`);
        };

        vm.refreshTextBooks = (): void => {
            vm.textbooks = [];
            $scope.safeApply();
            $scope.ws.send(new Frame('textbooks', 'refresh', [], {}));
        };

        vm.seeMyExternalResource = (): void => {
            $scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
            $location.path(`/search/plain_text`);
        };

        function initHomePage() {
            $scope.ws.send(new Frame('textbooks', 'get', [], {}));
            $scope.ws.send(new Frame('favorites', 'get', [], {}));
            $scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
        }

        if ($scope.ws.connected) {
            initHomePage();
        } else {
            $scope.ws.onopen = initHomePage;
        }
    }]);
