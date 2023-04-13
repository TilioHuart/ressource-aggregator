import {model, ng, toasts} from 'entcore';
import {Frame, Resource} from '../model';
import {IIntervalService, ILocationService} from "angular";
import {Signet, Signets} from "../model/Signet";
import {Utils} from "../utils/Utils";
import {MainScope} from "./main";
import {FavoriteService, ITextbookService} from "../services";

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
    sharedSignets: Resource[];
    orientationSignets: Resource[];
    displayedResources: Resource[];

    updateFrequency: number;

    syncTextbooks(): Promise<void>;
    seeMyExternalResource(): void;
    goSignet(): void;
    filterArchivedSignets(signet: any): boolean;

    search_Result(frame: Frame): void;
    signets_Result(frame: Frame): void;
}

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
    sharedSignets: Resource[];
    orientationSignets: Resource[];
    displayedResources: Resource[];
    mainScope: MainScope;
    updateFrequency: number;

    constructor(private $scope: IHomeScope,
                private route,
                private $location: ILocationService,
                private $interval: IIntervalService,
                private favoriteService: FavoriteService,
                private textbookService: ITextbookService) {
        this.$scope.hc = this;
        this.mainScope = (<MainScope> this.$scope.$parent);

        this.textbooks = [];
        this.publicSignets = [];
        this.sharedSignets = [];
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
                this.syncTextbooks()
            ])
            Utils.safeApply(this.$scope);
        } catch (e) {

        }

        // this.$scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
        // this.$scope.ws.send(new Frame('signets', 'get', ['fr.openent.mediacentre.source.Signet'], {}));
        //
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
            await Promise.all([
                this.syncFavoriteResources(),
                this.syncTextbooks()
            ]);
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
    signets_Result = async (frame) => {
        this.signets.all = this.publicSignets = this.orientationSignets = this.sharedSignets = [];
        await this.signets.sync();
        this.signets.all = this.signets.all.filter((signet: Signet) => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
        this.signets.formatSharedSignets(this.sharedSignets);
        this.publicSignets = frame.data.signets.resources.filter((el: Resource) => el.document_types[0] === "Signet");
        this.publicSignets = this.publicSignets.concat(this.sharedSignets.filter((el: Resource) => el.document_types[0] === "Signet"));
        this.orientationSignets = frame.data.signets.resources.filter(el => el.document_types[0] === "Orientation");
        this.orientationSignets = this.orientationSignets.concat(this.sharedSignets.filter((el: Resource) => el.document_types[0] === "Orientation"));
        Utils.safeApply(this.$scope);
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

    $onDestroy(): void {
    }
}

export const homeController = ng.controller('HomeController', ['$scope', 'route', '$location', '$interval',
    'FavoriteService', 'TextbookService', Controller]);

