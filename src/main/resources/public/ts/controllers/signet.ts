import {angular, idiom, model, ng, notify, template} from 'entcore';
import {Signet, Signets} from "../model/Signet";
import {FavoriteService, signetService} from "../services";
import {IResourceBody, ResourceBody} from "../model";
import {hashCode} from "../utils";
import {ILocationService, ITimeoutService} from "angular";
import * as Clipboard from "clipboard";
import {Utils} from "../utils/Utils";
import {AxiosResponse} from "axios";
import {Labels} from "../model/Label";
import {MainScope} from "./main";

interface ISignetViewModel {
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
    levels: Labels;
    disciplines: Labels;

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

export interface ISignetScope extends ng.IScope {
    vm: ISignetViewModel;
    mainScope: MainScope;
}

class Controller implements ISignetViewModel {
    mainScope: MainScope;
    signets: Signets;
    folder: string;
    searchInput: string;
    allSignetsSelected: boolean;
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
    signetPopUpSharing: boolean;
    mobile: boolean;
    levels: Labels;
    disciplines: Labels;

    constructor(private $scope: ISignetScope,
                private FavoriteService: FavoriteService,
                private $location: ILocationService,
                private $timeout: ITimeoutService) {
        this.$scope.vm = this;
        this.mainScope = (<MainScope> angular.element(document.getElementsByClassName("mediacentre-v2")).scope());

        this.signets = new Signets();
        this.folder = "mine";
        this.searchInput = "";
        this.allSignetsSelected = false;
        this.pageSize = 30;
        this.limitTo = this.pageSize;
        this.display = {
            grid: true,
            lightbox: {
                signet: false,
                overflow: true
            },
            warning: false
        };
        this.loading = true;
        this.signetPopUpSharing = false;
        this.mobile = screen.width < this.mainScope.mc.screenWidthLimit;

        let mainScopeModel : MainScope = this.mainScope;
        this.$scope.$on('deleteFavorite', function (event, id) {
            mainScopeModel.mc.favorites = mainScopeModel.mc.favorites.filter(el => el.id !== id);
        });

        this.$scope.$on('addFavorite', function (event, resource) {
            mainScopeModel.mc.favorites.push(resource);
        });

        this.init();
    }


        init = async () : Promise<void> => {
            this.levels = new Labels();
            await this.levels.sync("levels");
            this.disciplines = new Labels();
            await this.disciplines.sync("disciplines");

            await this.signets.sync();
            // Check if the folder is ok
            switch (this.folder) {
                case "mine":
                    this.signets.all = this.signets.all.filter(signet => !signet.archived && signet.owner_id === model.me.userId);
                    break;
                case "shared":
                    this.signets.all = this.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
                    break;
                case "published":
                    let { data } = await signetService.getAllMySignetPublished();
                    this.signets.all = [];
                    for (let i = 0; i < data.resources.length; i++) {
                        let tempSignet = new Signet();
                        tempSignet.setFromJson(data.resources[i]);
                        tempSignet.owner_id = data.resources[i].authors[0];
                        tempSignet.owner_name = data.resources[i].editors[0];
                        tempSignet.url = data.resources[i].link;
                        tempSignet.date_creation = new Date(data.resources[i].date);
                        tempSignet.date_modification = new Date(data.resources[i].date);
                        tempSignet.published = true;
                        this.signets.all.push(tempSignet);
                    }
                    this.signets.all = this.signets.all.sort( (signet1, signet2) =>
                        signet2.date_modification.getTime() - signet1.date_modification.getTime());
                    break;
                case "archived":
                    this.signets.all = this.signets.all.filter(signet => signet.archived);
                    break;
                default : this.openFolder('mine'); break;
            }
            this.loading = false;

            // Copy Link
            this.$scope.$watch('$viewContentLoaded', function(){
                this.$timeout(function() {
                    this.signets.all.forEach(signet => {
                        let element = document.getElementsByClassName('clipboard signet-resource-' + signet.id);
                        new Clipboard(element[0])
                            .on('success', () => {
                                Utils.safeApply(this.$scope);
                            })
                            .on('error', console.error);
                    });
                    Utils.safeApply(this.$scope)
                },1000);

            });
            Utils.safeApply(this.$scope)
        };


        // Global functions

        openFolder = async (folderName: string): Promise<void> => {
            this.folder = folderName;
            await this.init();
            this.closeNavMySignets()
        };

        switchAll = (value: boolean) : void => {
            value ? this.signets.selectAll() : this.signets.deselectAll();
            this.allSignetsSelected = value;
        };

        search = async (folderName: string, query: string): Promise<void> => {
            if (folderName == "published") {
                let {data} = await signetService.searchMySignetPublished(query);
                this.signets.all = [];
                for (let i = 0; i < data.resources.length; i++) {
                    let tempSignet = new Signet();
                    tempSignet.setFromJson(data.resources[i]);
                    tempSignet.owner_id = data.resources[i].authors[0];
                    tempSignet.owner_name = data.resources[i].editors[0];
                    tempSignet.url = data.resources[i].link;
                    tempSignet.date_creation = new Date(data.resources[i].date);
                    tempSignet.date_modification = new Date(data.resources[i].date);
                    tempSignet.published = true;
                    this.signets.all.push(tempSignet);
                }
            } else if (folderName == "shared") {
                let {data} = await signetService.searchMySignet(query);
                this.signets.all = [];
                this.signets.formatSignets(data);
                this.signets.all = this.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
            } else if (folderName == "mine") {
                let {data} = await signetService.searchMySignet(query);
                this.signets.all = [];
                this.signets.formatSignets(data);
                this.signets.all = this.signets.all.filter(signet => !signet.archived && signet.owner_id === model.me.userId);
            } else if (folderName == "archived") {
                let {data} = await signetService.searchMySignet(query);
                this.signets.all = [];
                this.signets.formatSignets(data);
                this.signets.all = this.signets.all.filter(signet => signet.archived);
            }
            Utils.safeApply(this.$scope)
        }

        openNavMySignets = () : void => {
            let element = document.getElementById("mySidenavSignets") as HTMLDivElement;
                element.style.width = "220px";
        };

        closeNavMySignets = () : void => {
            let element = document.getElementById("mySidenavSignets") as HTMLDivElement;
            element.style.width = "0";
        };

        // Display functions

        displayFilterName = (name: string) : string => {
            return idiom.translate("mediacentre.filter." + name.toLowerCase());
        };

        displayFolder = () : string => {
            return idiom.translate("mediacentre.signets." + this.folder);
        };

        getTitle = (title: string) : string => {
            return idiom.translate('mediacentre.' + title);
        };

        // Lightbox

        openCreateSignet = function () {
            this.mainScope.signet = new Signet();
            Utils.safeApply(this.$scope)
            this.display.lightbox.signet = true;
            template.open('lightboxContainer', 'signets/lightbox/create-signet');
            Utils.safeApply(this.$scope)
        };

        openPropertiesSignet = () : void => {
            this.mainScope.signet = this.signets.selected[0];
            let isDisabled = !this.mainScope.mc.hasShareRightManager(this.signets.selected);
            if(isDisabled) {
                template.open('lightboxContainer', 'signets/lightbox/prop-signet-disabled');
            } else {
                template.open('lightboxContainer', 'signets/lightbox/prop-signet');
            }
            this.display.lightbox.signet = true;
        };

        openPublishSignet = () : void => {
            this.mainScope.signet = this.signets.selected[0];
            template.open('lightboxContainer', 'signets/lightbox/publish-signet');
            this.display.lightbox.signet = true;
        };

        openShareSignet = (): void => {
            this.signets.selected[0].generateShareRights();
            this.signetPopUpSharing = true;
            template.open('lightboxContainer', 'signets/lightbox/share-signet');
            this.display.lightbox.signet = true;
            this.display.lightbox.overflow = false;
        };

        openArchiveSignets = () : void => {
            this.display.warning = !!this.signets.selected.find(signet => signet.sent);
            template.open('lightboxContainer', 'signets/lightbox/signet-confirm-archive');
            this.display.lightbox.signet = true;
        };

        openDeleteSignets = () : void => {
            this.display.warning = true;
            template.open('lightboxContainer', 'signets/lightbox/signet-confirm-delete');
            this.display.lightbox.signet = true;
        };

        closeSignetLightbox = async function () {
            this.display.lightbox.signet = false;
            this.display.lightbox.overflow = true;
            if (this.signetPopUpSharing) {
                this.signets.selected[0].myRights = this.mainScope.mc.getDataIf200(await signetService.getMySignetRights(this.signets.selected[0].id))
                    .map(right => right.action);
                this.signetPopUpSharing = false;
            }
            template.close('lightboxContainer');
            Utils.safeApply(this.$scope)
        };

        // Toaster

        selectSignet = (signet: Signet) : void => {
            if (this.folder == "archived" && !this.mainScope.mc.hasShareRightManager([signet])) {
                return;
            }

            if (this.folder != "mine") {
                if (!signet.selected) {
                    this.signets.deselectAll();
                    signet.selected = true;
                }
                else {
                    this.signets.deselectAll();
                }
            }
            else {
                signet.selected = !signet.selected;
            }
        }

        openSignet = (signet: Signet) : void => {
            this.mainScope.signet = signet;
            this.mainScope.mc.redirectTo(`/signet/${signet.id}/edit`);
            Utils.safeApply(this.$scope)
        };

        archiveSignets = async () : Promise<void> => {
            try {
                for (let signet of this.signets.selected) {
                    await signetService.archive(signet);
                }
                template.close('lightboxContainer');
                this.closeSignetLightbox();
                this.display.warning = false;
                notify.success(idiom.translate('mediacentre.success.signets.archive'));
                this.init();
                Utils.safeApply(this.$scope)
            }
            catch (e) {
                throw e;
            }
        };

        deleteSignets = async () : Promise<void> => {
            try {
                for (let signet of this.signets.selected) {
                    if(signet.published) {
                        await signetService.deleteSignetPublished(signet.id);
                        this.signets.all = this.signets.all.filter(signetToRemove => signet.id !== signetToRemove.id);
                    } else {
                        if (this.mainScope.mc.isStatusXXX(await signetService.unshare(signet.id), 200)) {
                            await signetService.delete(signet.id);
                            this.signets.all = this.signets.all.filter(signetToRemove => signet.id !== signetToRemove.id);
                        }
                    }
                }
                template.close('lightboxContainer');
                this.closeSignetLightbox();
                this.display.warning = false;
                notify.success(idiom.translate('mediacentre.success.signets.delete'));
                Utils.safeApply(this.$scope)
            }
            catch (e) {
                throw e;
            }
        };

        restoreSignets = async () : Promise<void> => {
            try {
                for (let signet of this.signets.selected) {
                    await signetService.restore(signet);
                }
                template.close('lightboxContainer');
                notify.success(idiom.translate('mediacentre.success.signets.restore'));
                this.init();
                Utils.safeApply(this.$scope)
            }
            catch (e) {
                throw e;
            }
        };

        // Favorites

        addFavorite = async (signet: Signet, event: Event) : Promise<void> => {
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
            let response = await this.FavoriteService.create(resourceBody, signet.id);
            if (response.status === 200) {
                signet.favorite = true;
                this.$scope.$emit('addFavorite', signet);
            }
            Utils.safeApply(this.$scope)
        };

        removeFavorite = async (signet, event) : Promise<void> => {
            event.stopPropagation();
            let resourceBody: IResourceBody = new ResourceBody(signet).toJson();
            let signetId: string = resourceBody.id.toString();
            let response: AxiosResponse = await this.FavoriteService.delete(signetId, resourceBody.source);
            if (response.status === 200) {
                signet.favorite = false;
                this.$scope.$emit('deleteFavorite', signet.id);
            }
            Utils.safeApply(this.$scope)
        };

        // Utils

        infiniteScroll = () : void => {
            this.limitTo += this.pageSize;
        };
    };

export const signetController = ng.controller('SignetController', ['$scope', 'FavoriteService', '$location',
    '$timeout', Controller]);