import {idiom, model, ng, notify, template} from 'entcore';
import {Signet, Signets} from "../model/Signet";
import {FavoriteService} from "../services";
import {signetService} from "../services/SignetService";
import {Frame, IResourceBody, ResourceBody, Resource} from "../model";
import {hashCode} from "../utils";
import {ILocationService} from "angular";
import * as Clipboard from "clipboard";
import {ResourceCard} from "../directives";
import {Utils} from "../utils/Utils";

interface ViewModel {
    signetPopUpSharing: boolean;
    signets: Signets;
    folder: string;
    allSignetsSelected: boolean;
    searchInput: string;
    pageSize: number;
    limitTo: number;
    display: {
        grid: boolean,
        lightbox: {
            signet: boolean,
            overflow: boolean
        },
        warning: boolean
    };
    loading: boolean;
    mobile: boolean;

    openFolder(folderName: string) : void;
    search(folderName: string, query: string) : void;
    switchAll(value: boolean) : void;
    openNavMySignets() : void;
    closeNavMySignets() : void;

    displayFilterName(name: string) : string;
    displayFolder() : string;
    getTitle(title: string): string;

    openCreateSignet(): void;
    openPropertiesSignet() : void;
    openPublishSignet(): void;
    openShareSignet() : void;
    publishSignet(signet: Signet) : void;
    closeSignetLightbox(): void;

    selectSignet(signet: Signet): void;
    openSignet(signet: Signet) : void;
    openArchiveSignets() : void;
    openDeleteSignets() : void;

    deleteSignets() : Promise<void>;
    archiveSignets() : Promise<void>;
    restoreSignets(): void;

    infiniteScroll() : void;
    addFavorite(signet: Signet, event: Event) : Promise<void>;
    removeFavorite(signet: Signet, event: Event) : Promise<void>;
}

interface EventResponses {
    favorites_Result(frame: Frame): void;
}

export const signetController = ng.controller('SignetController', ['$scope', 'FavoriteService', '$location', '$timeout',
    function ($scope, FavoriteService: FavoriteService, $location: ILocationService, $timeout) {

        const vm: ViewModel = this;
        vm.signets = new Signets();
        vm.folder = "mine";
        vm.searchInput = "";
        vm.allSignetsSelected = false;
        vm.pageSize = 30;
        vm.limitTo = vm.pageSize;
        vm.display = {
            grid: true,
            lightbox: {
                signet: false,
                overflow: true
            },
            warning: false
        };
        vm.loading = true;
        vm.signetPopUpSharing = false;
        vm.mobile = screen.width < $scope.mc.screenWidthLimit;

        const init = async () : Promise<void> => {
            await vm.signets.sync();
            // Check if the folder is ok
            switch (vm.folder) {
                case "mine":
                    vm.signets.all = vm.signets.all.filter(signet => !signet.archived && signet.owner_id === model.me.userId);
                    break;
                case "shared":
                    vm.signets.all = vm.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
                    break;
                case "published":
                    let { data } = await signetService.getAllMySignetPublished();
                    vm.signets.all = [];
                    for (let i = 0; i < data.resources.length; i++) {
                        let tempSignet = new Signet();
                        tempSignet.setFromJson(data.resources[i]);
                        tempSignet.owner_id = data.resources[i].authors[0];
                        tempSignet.owner_name = data.resources[i].editors[0];
                        tempSignet.url = data.resources[i].link;
                        tempSignet.date_creation = new Date(data.resources[i].date);
                        tempSignet.date_modification = new Date(data.resources[i].date);
                        tempSignet.published = true;
                        vm.signets.all.push(tempSignet);
                    }
                    vm.signets.all = vm.signets.all.sort( (signet1, signet2) =>
                        signet2.date_modification.getTime() - signet1.date_modification.getTime());
                    break;
                case "archived":
                    vm.signets.all = vm.signets.all.filter(signet => signet.archived);
                    break;
                default : vm.openFolder('mine'); break;
            }
            vm.loading = false;

            // Copy Link
            $scope.$watch('$viewContentLoaded', function(){
                $timeout(function() {
                    vm.signets.all.forEach(signet => {
                        let element = document.getElementsByClassName('clipboard signet-resource-' + signet.id);
                        new Clipboard(element[0])
                            .on('success', () => {
                                $scope.$apply();
                            })
                            .on('error', console.error);
                    });
                    Utils.safeApply($scope)
                },1000);

            });
            Utils.safeApply($scope)
        };


        // Global functions

        vm.openFolder = async (folderName: string): Promise<void> => {
            vm.folder = folderName;
            await init();
            vm.closeNavMySignets()
        };

        vm.switchAll = (value: boolean) : void => {
            value ? vm.signets.selectAll() : vm.signets.deselectAll();
            vm.allSignetsSelected = value;
        };

        vm.search = async (folderName: string, query: string): Promise<void> => {
            if (folderName == "published") {
                let {data} = await signetService.searchMySignetPublished(query);
                vm.signets.all = [];
                for (let i = 0; i < data.resources.length; i++) {
                    let tempSignet = new Signet();
                    tempSignet.setFromJson(data.resources[i]);
                    tempSignet.owner_id = data.resources[i].authors[0];
                    tempSignet.owner_name = data.resources[i].editors[0];
                    tempSignet.url = data.resources[i].link;
                    tempSignet.date_creation = new Date(data.resources[i].date);
                    tempSignet.date_modification = new Date(data.resources[i].date);
                    tempSignet.published = true;
                    vm.signets.all.push(tempSignet);
                }
            } else if (folderName == "shared") {
                let {data} = await signetService.searchMySignet(query);
                vm.signets.all = [];
                vm.signets.formatSignets(data);
                vm.signets.all = vm.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
            } else if (folderName == "mine") {
                let {data} = await signetService.searchMySignet(query);
                vm.signets.all = [];
                vm.signets.formatSignets(data);
                vm.signets.all = vm.signets.all.filter(signet => !signet.archived && signet.owner_id === model.me.userId);
            } else if (folderName == "archived") {
                let {data} = await signetService.searchMySignet(query);
                vm.signets.all = [];
                vm.signets.formatSignets(data);
                vm.signets.all = vm.signets.all.filter(signet => signet.archived);
            }
            Utils.safeApply($scope)
        }

        vm.openNavMySignets = () : void => {
            let element = document.getElementById("mySidenavSignets") as HTMLDivElement;
                element.style.width = "220px";
        };

        vm.closeNavMySignets = () : void => {
            let element = document.getElementById("mySidenavSignets") as HTMLDivElement;
            element.style.width = "0";
        };

        // Display functions

        vm.displayFilterName = (name: string) : string => {
            return idiom.translate("mediacentre.filter." + name.toLowerCase());
        };

        vm.displayFolder = () : string => {
            return idiom.translate("mediacentre.signets." + vm.folder);
        };

        vm.getTitle = (title: string) : string => {
            return idiom.translate('mediacentre.' + title);
        };

        // Lightbox

        vm.openCreateSignet = function () {
            $scope.signet = new Signet();
            Utils.safeApply($scope)
            vm.display.lightbox.signet = true;
            template.open('lightboxContainer', 'signets/lightbox/create-signet');
            Utils.safeApply($scope)
        };

        vm.openPropertiesSignet = () : void => {
            $scope.signet = vm.signets.selected[0];
            let isDisabled = !$scope.hasShareRightManager(vm.signets.selected);
            if(isDisabled) {
                template.open('lightboxContainer', 'signets/lightbox/prop-signet-disabled');
            } else {
                template.open('lightboxContainer', 'signets/lightbox/prop-signet');
            }
            vm.display.lightbox.signet = true;
        };

        vm.openPublishSignet = () : void => {
            $scope.signet = vm.signets.selected[0];
            template.open('lightboxContainer', 'signets/lightbox/publish-signet');
            vm.display.lightbox.signet = true;
        };

        vm.openShareSignet = (): void => {
            vm.signets.selected[0].generateShareRights();
            vm.signetPopUpSharing = true;
            template.open('lightboxContainer', 'signets/lightbox/share-signet');
            vm.display.lightbox.signet = true;
            vm.display.lightbox.overflow = false;
        };

        vm.openArchiveSignets = () : void => {
            vm.display.warning = !!vm.signets.selected.find(signet => signet.sent);
            template.open('lightboxContainer', 'signets/lightbox/signet-confirm-archive');
            vm.display.lightbox.signet = true;
        };

        vm.openDeleteSignets = () : void => {
            vm.display.warning = true;
            template.open('lightboxContainer', 'signets/lightbox/signet-confirm-delete');
            vm.display.lightbox.signet = true;
        };

        vm.closeSignetLightbox = async function () {
            vm.display.lightbox.signet = false;
            vm.display.lightbox.overflow = true;
            if (vm.signetPopUpSharing) {
                vm.signets.selected[0].myRights = $scope.getDataIf200(await signetService.getMySignetRights(vm.signets.selected[0].id)).map(right => right.action);
                vm.signetPopUpSharing = false;
            }
            template.close('lightboxContainer');
            Utils.safeApply($scope)
        };

        // Toaster

        vm.selectSignet = (signet: Signet) : void => {
            if (vm.folder == "archived" && !$scope.hasShareRightManager([signet])) {
                return;
            }

            if (vm.folder != "mine") {
                if (!signet.selected) {
                    vm.signets.deselectAll();
                    signet.selected = true;
                }
                else {
                    vm.signets.deselectAll();
                }
            }
            else {
                signet.selected = !signet.selected;
            }
        }

        vm.openSignet = (signet: Signet) : void => {
            $scope.signet = signet;
            $scope.redirectTo(`/signet/${signet.id}/edit`);
            Utils.safeApply($scope)
        };

        vm.archiveSignets = async () : Promise<void> => {
            try {
                for (let signet of vm.signets.selected) {
                    await signetService.archive(signet);
                }
                template.close('lightboxContainer');
                vm.closeSignetLightbox();
                vm.display.warning = false;
                notify.success(idiom.translate('mediacentre.success.signets.archive'));
                init();
                Utils.safeApply($scope)
            }
            catch (e) {
                throw e;
            }
        };

        vm.deleteSignets = async () : Promise<void> => {
            try {
                for (let signet of vm.signets.selected) {
                    if(signet.published) {
                        await signetService.deleteSignetPublished(signet.id);
                        vm.signets.all = vm.signets.all.filter(signetToRemove => signet.id !== signetToRemove.id);
                    } else {
                        if ($scope.isStatusXXX(await signetService.unshare(signet.id), 200)) {
                            await signetService.delete(signet.id);
                            vm.signets.all = vm.signets.all.filter(signetToRemove => signet.id !== signetToRemove.id);
                        }
                    }
                }
                template.close('lightboxContainer');
                vm.closeSignetLightbox();
                vm.display.warning = false;
                notify.success(idiom.translate('mediacentre.success.signets.delete'));
                Utils.safeApply($scope)
            }
            catch (e) {
                throw e;
            }
        };

        vm.restoreSignets = async () : Promise<void> => {
            try {
                for (let signet of vm.signets.selected) {
                    await signetService.restore(signet);
                }
                template.close('lightboxContainer');
                notify.success(idiom.translate('mediacentre.success.signets.restore'));
                init();
                Utils.safeApply($scope)
            }
            catch (e) {
                throw e;
            }
        };

        // Favorites

        vm.addFavorite = async (signet: Signet, event: Event) : Promise<void> => {
            event.stopPropagation();
            signet.hash = hashCode(signet.resource_id);
            let resourceBody: IResourceBody = new ResourceBody(signet).toJson();
            let disciplinesArray:string[] = [];
            let levelsArray: string[] = [];
            let plaintextArray:string[] = [];
            if(!!signet.disciplines) {
                signet.disciplines.forEach(function (discipline) {
                    if(!!discipline[1]) {
                        disciplinesArray.push(discipline[1]);
                    }
                });
            }
            resourceBody.disciplines = disciplinesArray;
            if(!!signet.levels) {
                signet.levels.forEach(function (level) {
                    if(!!level[1]) {
                        levelsArray.push(level[1]);
                    }
                });
            }
            resourceBody.levels = levelsArray;
            if(!!signet.plain_text) {
                signet.plain_text.forEach(function (word) {
                    if(!!word[1]) {
                        plaintextArray.push(word[1]);
                    }
                });
            }
            resourceBody.plain_text = plaintextArray
            resourceBody.document_types = signet.orientation ? ["Orientation"] : ["Signet"];
            resourceBody.date = new Date(signet.date_creation).valueOf();
            delete signet.favorite;
            let response = await FavoriteService.create(resourceBody, signet.id);
            if (response.status === 200) {
                signet.favorite = true;
                $scope.$emit('addFavorite', signet);
            }
            Utils.safeApply($scope)
        };

        vm.removeFavorite = async (signet, event) : Promise<void> => {
            event.stopPropagation();
            let resourceBody: IResourceBody = new ResourceBody(signet).toJson();
            let response = await FavoriteService.delete(resourceBody.id, resourceBody.source);
            if (response.status === 200) {
                signet.favorite = false;
                $scope.$emit('deleteFavorite', signet.id);
            }
            Utils.safeApply($scope)
        };

        // Websockets

        $scope.$on('deleteFavorite', function (event, id) {
            $scope.mc.favorites = $scope.mc.favorites.filter(el => el.id !== id);
            // $scope.mc.textbooks[$scope.mc.textbooks.findIndex(el => el.id == id)].favorite = false;
        });

        $scope.$on('addFavorite', function (event, resource) {
            $scope.mc.favorites.push(resource);
        });

        // Utils

        vm.infiniteScroll = () : void => {
            vm.limitTo += vm.pageSize;
        };

        init();
    }]);