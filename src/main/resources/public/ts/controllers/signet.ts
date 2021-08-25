import {idiom, model, ng, notify, template} from 'entcore';
import {Signet, Signets} from "../model/Signet";
import {signetService} from "../services/SignetService";

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
            sending: boolean,
            sharing: boolean,
            archive: boolean,
            delete: boolean,
            reminder: boolean
        },
        warning: boolean
    };
    loading: boolean;

    openFolder(folderName: string) : void;
    switchAll(value: boolean) : void;
    openNavMySignets() : void;
    closeNavMySignets() : void;
    displayFilterName(name: string) : string;
    displayFolder() : string;
    getTitle(title: string): string;
    openSignet(signet: Signet) : void;
    openPropertiesSignet() : void;
    shareSignet() : void;
    closeShareSignetLightbox() : void;
    deleteSignets() : void;
    doDeleteSignets() : Promise<void>;
    infiniteScroll() : void;
}


export const signetController = ng.controller('SignetController', ['$scope',
    function ($scope) {

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
                sharing: false,
                archive: false,
                delete: false,
                reminder: false
            },
            warning: false
        };
        vm.loading = true;

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
            $scope.redirectTo(`/signet/${vm.signets.selected[0].id}/properties`);
            $scope.safeApply();
        };

        vm.shareSignet = () : void => {
            vm.signets.selected[0].generateShareRights();
            template.open('lightbox', 'lightbox/signet-sharing');
            vm.display.lightbox.sharing = true;
        };

        vm.closeShareSignetLightbox = () : void => {
            template.close('lightbox');
            vm.display.lightbox.sharing = false;
            window.setTimeout(async function () { await init(); }, 100);
        };

        vm.deleteSignets = () : void => {
            vm.display.warning = true;
            template.open('lightbox', 'lightbox/signet-confirm-delete');
            vm.display.lightbox.delete = true;
        };

        vm.doDeleteSignets = async () : Promise<void> => {
            try {
                for (let signet of vm.signets.selected) {
                    if ($scope.isStatusXXX(await signetService.unshare(signet.id), 200)) {
                        await signetService.delete(signet.id);
                    }
                }
                template.close('lightbox');
                vm.display.lightbox.delete = false;
                vm.display.warning = false;
                notify.success(idiom.translate('signetulaire.success.signets.delete'));
                init();
                $scope.safeApply();
            }
            catch (e) {
                throw e;
            }
        };

        // Utils

        vm.infiniteScroll = () : void => {
            vm.limitTo += vm.pageSize;
        };


        init();
    }]);