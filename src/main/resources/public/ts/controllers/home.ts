import {ng, toasts} from 'entcore';
import {Frame, Resource} from '../model';
import {IIntervalService, ILocationService} from "angular";
import {Signet, Signets} from "../model/Signet";
import {Utils} from "../utils/Utils";
import {MainScope} from "./main";
import {FavoriteService, ITextbookService, SignetService} from "../services";
import {Label} from "../model/Label";
import {SignetBody} from "../model/signetBody.model";

declare var mediacentreUpdateFrequency: number;

interface IHomeViewModel extends ng.IController {
    signetLimit: number;
    signets: Signets;
    mobile: boolean;
    resourceLimit: number;
    loaders: any;
    resources: Resource[];
    textbooks: Resource[];
    publicSignets: Resource[];
    orientationSignets: Resource[];
    displayedResources: Resource[];

    updateFrequency: number;

    syncSignets(): Promise<void>;
    syncTextbooks(): Promise<void>;
    seeMyExternalResource(): void;
    goSignet(): void;
    filterArchivedSignets(signet: any): boolean;

    search_Result(frame: Frame): void;}

interface IHomeScope extends ng.IScope {
    hc: IHomeViewModel;
    mainScope: MainScope;
}

class Controller implements IHomeViewModel {
    signetLimit: number;
    signets: Signets;
    mobile: boolean;
    resourceLimit: number;
    loaders: any;
    resources: Resource[];
    textbooks: Resource[];
    publicSignets: Resource[];
    orientationSignets: Resource[];
    displayedResources: Resource[];
    mainScope: MainScope;
    updateFrequency: number;

    constructor(private $scope: IHomeScope,
                private route,
                private $location: ILocationService,
                private $interval: IIntervalService,
                private favoriteService: FavoriteService,
                private textbookService: ITextbookService,
                private signetService: SignetService) {
        this.$scope.hc = this;
        this.mainScope = (<MainScope> this.$scope.$parent);

        this.textbooks = [];
        this.publicSignets = [];
        this.signets = new Signets();
        this.displayedResources = [];
        this.mobile = screen.width < this.mainScope.mc.screenWidthLimit;
        this.resourceLimit = this.mobile ? 6 : 12;
        this.signetLimit = this.mobile ? 4 : 8;

    }

    async $onInit() {
        this.updateFrequency = mediacentreUpdateFrequency;

        try {
            await Promise.all([
                this.syncFavoriteResources(),
                this.syncTextbooks(),
                this.syncSignets()
            ])
            Utils.safeApply(this.$scope);
        } catch (e) {

        }

        // this.$scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));

        // this.$scope.vm.ws.onmessage = (message) => {
        //     const {event, state, data, status} = JSON.parse(message.data);
        //     if ("ok" !== status) {
        //         throw data.error;
        //     }
        //     if (event in eventResponses) eventResponses[event](new Frame(event, state, [], data));
        // };

        let viewModel: IHomeViewModel = this;
        let mainScopeModel : MainScope = this.mainScope;
        this.$scope.$on('deleteFavorite', async (event, id) => {
            await this.syncFavoriteResources();
        });

        this.$scope.$on('addFavorite', async (event, resource) => {
            await this.syncFavoriteResources();
        });

        this.$interval(async (): Promise<void> => {
                await this.syncFavoriteResources(),
                await this.syncTextbooks(),
                await this.syncSignets()
        }, this.updateFrequency, 0, false);

        Utils.safeApply(this.$scope);
    }

    private async syncFavoriteResources() {
        try {
            this.mainScope.mc.favorites = await this.favoriteService.get();
            this.mainScope.mc.favorites.forEach((resource: Resource) => {
                resource.favorite = true;
            });
            this.setFavoriteResources();
            Utils.safeApply(this.$scope);
        } catch (e) {
            console.error("An error has occurred during fetching favorite ", e);
            toasts.warning("mediacentre.error.favorite.retrieval");
        }
    }

    search_Result = (frame) => {
        this.displayedResources = frame.data.resources;
        Utils.safeApply(this.$scope);
    }
    async syncSignets(): Promise<void> {
        this.publicSignets = this.orientationSignets = [];
        try {
            let signets: SignetBody[] = (await this.signetService.list()).data;
            this.publicSignets = signets
                .filter((signet: SignetBody) => signet.orientation == false)
                .map((signet: SignetBody) => {
                    return this.signetBodyToResource(signet);
                });
            this.orientationSignets = signets
                .filter((signet: SignetBody) => signet.orientation == true)
                .map((signet: SignetBody) => {
                    return this.signetBodyToResource(signet);
                })
            this.setFavoriteResources();
            Utils.safeApply(this.$scope);
        } catch (e) {
            console.error("An error has occurred during fetching signets ", e);
            toasts.warning("mediacentre.error.signet.retrieval");
        }
    }

    async syncTextbooks(isRefreshButton?: boolean): Promise<void> {
        try {
            this.mainScope.mc.textbooks = await this.textbookService.get();
            this.setFavoriteResources();
            if (isRefreshButton) toasts.info("mediacentre.success.textbook.retrieval");
            Utils.safeApply(this.$scope);
        } catch (e) {
            console.error("An error has occurred during fetching textbooks ", e);
            toasts.warning("mediacentre.error.textbook.retrieval");
        }
    };

    private setFavoriteResources(): void {
        this.mainScope.mc.textbooks.forEach((resource: Resource) =>
            resource.favorite = !!this.mainScope.mc.favorites.find((favorite: Resource) => favorite.id == resource.id));
        this.publicSignets.forEach((resource: Resource) =>
            resource.favorite = !!this.mainScope.mc.favorites.find((favorite: Resource) => favorite.id_info == resource.id_info));
        this.orientationSignets.forEach((resource: Resource) =>
            resource.favorite = !!this.mainScope.mc.favorites.find((favorite: Resource) => favorite.id_info == resource.id_info));
    }

    seeMyExternalResource = (): void => {
        // this.$scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
        this.$location.path(`/search/plain_text`);
    };

    goSignet = (): void => {
        this.$location.path(`/signet/`);
    };

    filterArchivedSignets = (signet): boolean => {
        return !signet.archived;
    };

    private signetBodyToResource(signet: SignetBody): Resource {
        let resource = new Resource();
        resource.id_info = signet.id.toString();
        resource.disciplines = signet.disciplines.map((label: Label) => label[1]);
        resource.authors = resource.editors = [signet.owner_name];
        resource.date = new Date(signet.date_creation).valueOf();
        resource.description = null;
        resource.displayTitle = resource.title = signet.title;
        resource.document_types = signet.orientation ? ["Orientation"] : ["Signet"];
        resource.favorite = signet.favorite;
        resource.image = signet.image;
        resource.levels = signet.levels.map((label: Label) => label[1]);
        resource.link = signet.url;
        resource.plain_text = signet.plain_text.map((label: Label) => label[1]);
        resource.source = "fr.openent.mediacentre.source.Signet";
        resource.user = signet.owner_id;

        return resource;
    }

    $onDestroy(): void {
    }
}

export const homeController = ng.controller('HomeController', ['$scope', 'route', '$location', '$interval',
    'FavoriteService', 'TextbookService', 'SignetService', Controller]);

