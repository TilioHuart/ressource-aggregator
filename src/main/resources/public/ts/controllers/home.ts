import {_, model, ng} from 'entcore';
import {Scope} from './main'
import {Frame, Resource} from '../model';
import {ILocationService} from "angular";
import {Signets} from "../model/Signet";

interface ViewModel {
    signetLimit: number;
    signets: Signets;
    signetsWithoutFilter: Signets;
    mobile: boolean;
    resourceLimit: number;
    loaders: any;
    resources: Resource[];
    displayedResources: Resource[];
    textbooks: Resource[];
    publicSignets: Resource[];
    sharedSignets: Resource[];
    orientationSignets: Resource[];
    result: {
        textbooks_Result: boolean,
        signets_Result: boolean,
        search_Result: boolean,
        favorites_Result: boolean
    };
    favoritesNotFiltered: Resource[];

    refreshTextBooks(): void;
    seeMyExternalResource(): void;
    goSignet(): void;
    filterArchivedSignets(signet: any): boolean;
    launchFavoritesFilter(): void;
    removeFavorite(favorite: any): void;
}

interface EventResponses {
    textbooks_Result(frame: Frame): void;
    search_Result(frame: Frame): void;
    favorites_Result(frame: Frame): void;
    signets_Result(frame: Frame): void;
}


export const homeController = ng.controller('HomeController', ['$scope', 'route', '$location',
    function ($scope: Scope, route, $location: ILocationService) {
        const vm: ViewModel = this;
        $scope.safeApply();
        vm.textbooks = [];
        vm.publicSignets = [];
        vm.sharedSignets = [];
        vm.signets = new Signets();
        vm.signetsWithoutFilter = new Signets();
        vm.displayedResources = [];
        vm.mobile = screen.width < $scope.mc.screenWidthLimit;
        vm.resourceLimit = vm.mobile ? 6 : 12;
        vm.signetLimit = vm.mobile ? 4 : 8;
        vm.result = {
            textbooks_Result: false,
            signets_Result: false,
            search_Result: false,
            favorites_Result: false
        };
        vm.favoritesNotFiltered = [];

        $scope.$on('deleteFavorite', function (event, id) {
            $scope.mc.favorites = $scope.mc.favorites.filter(el => el.id !== id);
            if(vm.textbooks.findIndex(el => el.id == id) != -1) {
                vm.textbooks[vm.textbooks.findIndex(el => el.id == id)].favorite = false;
            } else if(vm.publicSignets.findIndex(el => el.id == id) != -1) {
                vm.publicSignets[vm.publicSignets.findIndex(el => el.id == id)].favorite = false;
            } else if(vm.orientationSignets.findIndex(el => el.id == id) != -1) {
                vm.orientationSignets[vm.orientationSignets.findIndex(el => el.id == id)].favorite = false;
            }
        });

        $scope.$on('addFavorite', function (event, resource) {
            $scope.mc.favorites.push(resource);
        });


        $scope.ws.onmessage = (message) => {
            const {event, state, data, status} = JSON.parse(message.data);
            vm.result[event] = true;
            if ("ok" !== status) {
                throw data.error;
            }
            if (event in eventResponses) eventResponses[event](new Frame(event, state, [], data));
        };

        const eventResponses: EventResponses = {
            textbooks_Result: function (frame) {
                vm.textbooks = frame.data.textbooks;
                vm.launchFavoritesFilter();
                $scope.safeApply();
            },
            signets_Result: async function (frame) {
                vm.signets.all = vm.publicSignets = vm.orientationSignets = vm.sharedSignets = [];
                await vm.signets.sync();
                vm.signetsWithoutFilter = vm.signets;
                vm.signets.all = vm.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
                vm.signets.formatSharedSignets(vm.sharedSignets);
                vm.publicSignets = frame.data.signets.resources.filter(el => el.document_types[0] === "Signet");
                vm.publicSignets = vm.publicSignets.concat(vm.sharedSignets.filter(el => el.document_types[0] === "Signet"));
                vm.orientationSignets = frame.data.signets.resources.filter(el => el.document_types[0] === "Orientation");
                vm.orientationSignets = vm.orientationSignets.concat(vm.sharedSignets.filter(el => el.document_types[0] === "Orientation"));
                vm.launchFavoritesFilter();
                $scope.safeApply();
            },
            search_Result: function (frame) {
                vm.displayedResources = frame.data.resources;
                vm.launchFavoritesFilter();
                $scope.safeApply();
            },
            favorites_Result: function (frame) {
                if (Object.keys(frame.data).length === 0) {
                    $scope.mc.favorites = []
                } else {
                    vm.favoritesNotFiltered = frame.data;
                    vm.favoritesNotFiltered.map((favorite:Resource) => {
                        favorite.favorite = true;
                    });
                }
                vm.launchFavoritesFilter();
                $scope.safeApply();
            },
        };

        vm.launchFavoritesFilter = (): void => {
            if (vm.result.favorites_Result) {
                if(vm.result.search_Result && vm.result.textbooks_Result){
                    for (let i = 0; i < vm.favoritesNotFiltered.length ; i++) {
                        let found = false;
                        if(vm.favoritesNotFiltered[i].source === "fr.openent.mediacentre.source.GAR") {
                            for(let h = 0; h < vm.displayedResources.length; h++) {
                                if(vm.favoritesNotFiltered[i].id == vm.displayedResources[h].id && vm.displayedResources[h].favorite) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) { continue; }
                            for(let j = 0; j < vm.textbooks.length; j++) {
                                if(vm.favoritesNotFiltered[i].id == vm.textbooks[j].id && vm.textbooks[j].favorite) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) { continue; }
                            vm.removeFavorite(vm.favoritesNotFiltered[i]);
                        }
                    }
                }
                if(vm.result.signets_Result){
                    for(let i = 0; i < vm.favoritesNotFiltered.length ; i++) {
                        let found = false;
                        if (vm.favoritesNotFiltered[i].document_types[0] === "Orientation") {
                            for(let k = 0; k < vm.orientationSignets.length; k++) {
                                if(vm.favoritesNotFiltered[i].id.toString() == vm.orientationSignets[k].id) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) { continue; }
                            vm.removeFavorite(vm.favoritesNotFiltered[i]);
                        } else if (vm.favoritesNotFiltered[i].document_types[0] === "Signet") {
                            for(let k = 0; k < vm.publicSignets.length; k++) {
                                if(vm.favoritesNotFiltered[i].id.toString() == vm.publicSignets[k].id) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) { continue; }
                            vm.removeFavorite(vm.favoritesNotFiltered[i]);
                        } else if (vm.favoritesNotFiltered[i].source === "fr.openent.mediacentre.source.Signet") {
                            for(let k = 0; k < vm.signetsWithoutFilter.length; k++) {
                                if(vm.favoritesNotFiltered[i].id == vm.signetsWithoutFilter[k].id) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) { continue; }
                            vm.removeFavorite(vm.favoritesNotFiltered[i]);
                        }
                    }
                }
                if(vm.result.search_Result && vm.result.textbooks_Result && vm.result.signets_Result){
                    $scope.mc.favorites = vm.favoritesNotFiltered;
                    vm.result = {
                        textbooks_Result: false,
                        signets_Result: false,
                        search_Result: false,
                        favorites_Result: false
                    };
                }
            }
        }

        vm.removeFavorite = async (favorite): Promise<void> => {
            vm.favoritesNotFiltered = _.without(vm.favoritesNotFiltered, favorite);
            favorite.id = typeof favorite.id == 'string' && favorite.source == "fr.openent.mediacentre.source.Signet" ?
                parseInt(favorite.id) : favorite.id;
            //let response = await FavoriteService.delete(favorite.id, favorite.source);
            //if (response.status === 200) {
            favorite.favorite = false;
            $scope.$emit('deleteFavorite', favorite.id);
            //}
            $scope.safeApply();
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

        vm.goSignet = (): void => {
            $location.path(`/signet/`);
        };

        vm.filterArchivedSignets = (signet): boolean => {
            return !signet.archived;
        };

        function initHomePage() {
            vm.result = {
                textbooks_Result: false,
                signets_Result: false,
                search_Result: false,
                favorites_Result: false
            };
            $scope.ws.send(new Frame('textbooks', 'get', [], {}));
            $scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
            $scope.ws.send(new Frame('signets', 'get', ['fr.openent.mediacentre.source.Signet'], {}));
            $scope.ws.send(new Frame('favorites', 'get', [], {}));
            $scope.safeApply();
        }


        if ($scope.ws.connected) {
            initHomePage();
        } else {
            $scope.ws.onopen = initHomePage;
        }
    }]);
