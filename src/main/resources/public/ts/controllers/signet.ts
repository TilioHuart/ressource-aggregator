import {idiom, model, ng, notify, template} from 'entcore';
import {Signet, Signets} from "../model/Signet";
import {FavoriteService} from "../services";
import {signetService} from "../services/SignetService";
import {Frame, Resource} from "../model";
import {hashCode} from "../utils";
import {ILocationService} from "angular";

interface ViewModel {
    signets: Signets;
    folder: string;
    allSignetsSelected: boolean;
    searchInput: string;
    pageSize: number;
    limitTo: number;
    display: {
        grid: boolean,
        lightbox: {
            properties: boolean;
            publishing: boolean;
            sending: boolean,
            sharing: boolean,
            archive: boolean,
            delete: boolean,
            reminder: boolean
        },
        warning: boolean
    };
    loading: boolean;
    mobile: boolean;

    openFolder(folderName: string) : void;
    switchAll(value: boolean) : void;
    openNavMySignets() : void;
    closeNavMySignets() : void;
    displayFilterName(name: string) : string;
    displayFolder() : string;
    getTitle(title: string): string;
    openSignet(signet: Signet) : void;
    openPropertiesSignet() : void;
    openPublishSignet(): void;
    shareSignet() : void;
    publishSignet(signet: Signet) : void;
    closeShareSignetLightbox() : void;
    closePublishSignetLightbox() : void;
    deleteSignets() : void;
    doDeleteSignets() : Promise<void>;
    archiveSignets() : void;
    doArchiveSignets() : Promise<void>;
    restoreSignets(): void;
    infiniteScroll() : void;
    addFavorite(signet: Signet, event: Event) : Promise<void>;
    removeFavorite(signet: Signet, event: Event) : Promise<void>;

}

export const signetController = ng.controller('SignetController', ['$scope', 'FavoriteService', '$location',
    function ($scope, FavoriteService: FavoriteService, $location: ILocationService) {

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
                sending: false,
                properties: false,
                sharing: false,
                archive: false,
                delete: false,
                publishing: false,
                reminder: false
            },
            warning: false
        };
        vm.loading = true;
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
                case "archived":
                    vm.signets.all = vm.signets.all.filter(signet => signet.archived);
                    break;
                default : vm.openFolder('mine'); break;
            }

            vm.loading = false;
            $scope.safeApply();
        };


        // Global functions

        vm.openFolder = (folderName: string) : void => {
            vm.folder = folderName;
            init();
        };

        vm.switchAll = (value: boolean) : void => {
            value ? vm.signets.selectAll() : vm.signets.deselectAll();
            vm.allSignetsSelected = value;
        };

        vm.openNavMySignets = () : void => {
            let element = document.getElementById("mySidenavSignets") as HTMLDivElement;
                element.style.width = "200px";
        };

        vm.closeNavMySignets = () : void => {
            let element = document.getElementById("mySidenavSignets") as HTMLDivElement;
            element.style.width = "0";
        };

        // Display functions

        vm.displayFilterName = (name: string) : string => {
            return idiom.translate("signetulaire.filter." + name.toLowerCase());
        };

        vm.displayFolder = () : string => {
            return idiom.translate("signetulaire.signets." + vm.folder);
        };

        vm.getTitle = (title: string) : string => {
            return idiom.translate('signetulaire.' + title);
        };

        // Toaster

        vm.openSignet = (signet: Signet) : void => {
            $scope.signet = signet;
            $scope.redirectTo(`/signet/${signet.id}/edit`);
            $scope.safeApply();
        };

        vm.openPropertiesSignet = () : void => {
            $scope.signet = vm.signets.selected[0];
            let isDisabled = !$scope.hasShareRightManager(vm.signets.selected);
            if(isDisabled) {
                template.open('lightboxContainer', 'signets/lightbox/prop-signet-disabled');
            } else {
                template.open('lightboxContainer', 'signets/lightbox/prop-signet');
            }
            $scope.display.lightbox.properties = true;
        };

        vm.openPublishSignet = () : void => {
            $scope.signet = vm.signets.selected[0];
            template.open('lightboxContainer', 'signets/lightbox/publishSignetPopUp');
            vm.display.lightbox.publishing = true;
        };

        vm.shareSignet = (): void => {
            vm.signets.selected[0].generateShareRights();
            template.open('lightboxContainer', 'signets/lightbox/signet-sharing');
            vm.display.lightbox.sharing = true;
        };


        vm.closeShareSignetLightbox = () : void => {
            template.close('lightboxContainer');
            vm.display.lightbox.sharing = false;
            window.setTimeout(async function () { await init(); }, 100);
        };

        vm.closePublishSignetLightbox = () : void => {
            template.close('lightboxContainer');
            vm.display.lightbox.publishing = false;
        };

        vm.deleteSignets = () : void => {
            vm.display.warning = true;
            template.open('lightboxContainer', 'signets/lightbox/signet-confirm-delete');
            vm.display.lightbox.delete = true;
        };

        vm.doDeleteSignets = async () : Promise<void> => {
            try {
                for (let signet of vm.signets.selected) {
                    if ($scope.isStatusXXX(await signetService.unshare(signet.id), 200)) {
                        await signetService.delete(signet.id);
                    }
                }
                template.close('lightboxContainer');
                vm.display.lightbox.delete = false;
                vm.display.warning = false;
                notify.success(idiom.translate('mediacentre.success.signets.delete'));
                init();
                $scope.safeApply();
            }
            catch (e) {
                throw e;
            }
        };

        vm.archiveSignets = () : void => {
            vm.display.warning = !!vm.signets.selected.find(signet => signet.sent);
            template.open('lightboxContainer', 'signets/lightbox/signet-confirm-archive');
            vm.display.lightbox.archive = true;
        };

        vm.doArchiveSignets = async () : Promise<void> => {
            try {
                for (let signet of vm.signets.selected) {
                    await signetService.archive(signet);
                }
                template.close('lightboxContainer');
                vm.display.lightbox.archive = false;
                vm.display.warning = false;
                notify.success(idiom.translate('mediacentre.success.signets.archive'));
                init();
                $scope.safeApply();
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
                $scope.safeApply();
            }
            catch (e) {
                throw e;
            }
        };

        vm.addFavorite = async (signet, event) : Promise<void> => {
            event.stopPropagation();
            signet.hash = hashCode(signet.resource_id);
            signet.displayTitle = signet.title;
            signet.image = signet.imageurl;
            let signet_fav = <Resource> signet.toJson();
            let disciplinesArray:string[] = [];
            let levelsArray:string[] = [];
            let plaintextArray:string[] = [];
            if(!!signet.disciplines) {
                signet.disciplines.forEach(function (discipline) {
                    if(!!discipline[1]) {
                        disciplinesArray.push(discipline[1]);
                    }
                });
            }
            signet_fav.disciplines = disciplinesArray;
            if(!!signet.levels) {
                signet.levels.forEach(function (level) {
                    if(!!level[1]) {
                        levelsArray.push(level[1]);
                    }
                });
            }
            signet_fav.levels = levelsArray;
            if(!!signet.plain_text) {
                signet.plain_text.forEach(function (word) {
                    if(!!word[1]) {
                        plaintextArray.push(word[1]);
                    }
                });
            }
            signet_fav.plain_text = plaintextArray
            signet_fav.favorite = signet.favorite;
            delete signet.favorite;
            let response = await FavoriteService.create(signet_fav);
            if (response.status === 200) {
                signet.favorite = true;
                await FavoriteService.updateFavorite(signet_fav);
                $scope.$emit('addFavorite', signet);
            }
            $scope.safeApply();
        };

        vm.removeFavorite = async (signet, event) : Promise<void> => {
            event.stopPropagation();
            let signet_fav = <Resource> signet.toJson();
            signet_fav.favorite = signet.favorite;
            await FavoriteService.updateFavorite(signet_fav);
            let response = await FavoriteService.delete(signet_fav.id, signet_fav.source);
            if (response.status === 200) {
                signet.favorite = false;
                $scope.$emit('deleteFavorite', signet.resource_id);
            }
            $scope.safeApply();
        };

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