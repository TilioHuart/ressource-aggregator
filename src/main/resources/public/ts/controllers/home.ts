import {model, ng} from 'entcore';
import {Scope} from './main'
import {Frame, Resource} from '../model';
import {ILocationService} from "angular";
import {Signets} from "../model/Signet";

interface ViewModel {
    signetLimit: number;
    signets: Signets;
    mobile: boolean;
    resourceLimit: number;
    loaders: any;
    resources: Resource[];
    textbooks: Resource[];
    publicSignets: Resource[];
    sharedSignets: Resource[];
    orientationSignets: Resource[];
    displayedResources: Resource[];

    refreshTextBooks(): void;
    seeMyExternalResource(): void;
    goSignet(): void;
    filterArchivedSignets(signet: any): boolean;
}

interface EventResponses {
    favorites_Result(frame: Frame): void;
    textbooks_Result(frame: Frame): void;
    search_Result(frame: Frame): void;
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
        vm.displayedResources = [];
        vm.mobile = screen.width < $scope.mc.screenWidthLimit;
        vm.resourceLimit = vm.mobile ? 6 : 12;
        vm.signetLimit = vm.mobile ? 4 : 8;

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
                    $scope.mc.favorites = []
                } else {
                    $scope.mc.favorites = frame.data;
                    $scope.mc.favorites.map((favorite) => {
                        favorite.favorite = true;
                    });
                }
                $scope.safeApply();
            },
            search_Result: function (frame) {
                vm.displayedResources = frame.data.resources;
                $scope.safeApply();
            },
            signets_Result: async function (frame) {
                vm.signets.all = vm.publicSignets = vm.orientationSignets = vm.sharedSignets = [];
                await vm.signets.sync();
                vm.signets.all = vm.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
                vm.signets.formatSharedSignets(vm.sharedSignets);
                vm.publicSignets = frame.data.signets.resources.filter(el => el.document_types[0] === "Signet");
                vm.publicSignets = vm.publicSignets.concat(vm.sharedSignets.filter(el => el.document_types[0] === "Signet"));
                vm.orientationSignets = frame.data.signets.resources.filter(el => el.document_types[0] === "Orientation");
                vm.orientationSignets = vm.orientationSignets.concat(vm.sharedSignets.filter(el => el.document_types[0] === "Orientation"));
                $scope.safeApply();
            }
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
            $scope.ws.send(new Frame('textbooks', 'get', [], {}));
            $scope.ws.send(new Frame('favorites', 'get', [], {}));
            $scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
            $scope.ws.send(new Frame('signets', 'get', ['fr.openent.mediacentre.source.Signet'], {}));
            $scope.safeApply();
        }

        if ($scope.ws.connected) {
            initHomePage();
        } else {
            $scope.ws.onopen = initHomePage;
        }
    }]);
