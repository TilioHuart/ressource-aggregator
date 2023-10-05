import {model, ng, toasts} from 'entcore';
import {Frame, Resource} from '../model';
import {IIntervalService, ILocationService, ITimeoutService} from "angular";
import {Signet, Signets} from "../model/Signet";
import {Utils} from "../utils/Utils";
import {MainScope} from "./main";
import {FavoriteService, ISearchService, ITextbookService, SignetService} from "../services";
import {Label} from "../model/Label";
import {ISignetBody, SignetBody} from "../model/signetBody.model";
import {SOURCES} from "../core/enum/sources.enum";
import {SEARCH_TYPE} from "../core/enum/search-type.enum";
import {PlainTextSearchBody, PlainTextSearchData} from "../model/plainTextSearchBody.model";
import {IPublicSignetResponse, PublicSignetResponse} from "../model/publicSignetResponse.model";
import {SIGNET_TYPE} from "../core/enum/signetType.enum";


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
    externalResources: Resource[];

    updateFrequency: number;

    syncSignets(): Promise<void>;
    syncTextbooks(): Promise<void>;
    seeMyExternalResource(): Promise<void>;
    goSignet(): void;
    filterArchivedSignets(signet: any): boolean;
    syncExternalResources(frame: Frame): void;}

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
    externalResources: Resource[];
    mainScope: MainScope;
    updateFrequency: number;

    constructor(private $scope: IHomeScope,
                private route,
                private $location: ILocationService,
                private $interval: IIntervalService,
                private $timeout: ITimeoutService,
                private favoriteService: FavoriteService,
                private textbookService: ITextbookService,
                private signetService: SignetService,
                private searchService: ISearchService) {
        this.$scope.hc = this;
        this.mainScope = (<MainScope> this.$scope.$parent);

        this.textbooks = [];
        this.publicSignets = [];
        this.signets = new Signets();
        this.externalResources = [];
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
                this.syncSignets(),
                this. syncExternalResources()
            ])
            Utils.safeApply(this.$scope);
        } catch (e) {

        }

        let viewModel: IHomeViewModel = this;
        let mainScopeModel : MainScope = this.mainScope;
        this.$scope.$on('deleteFavorite', async (event, id) => {
            await this.syncFavoriteResources();
            await this.syncExternalResources();
        });

        this.$scope.$on('addFavorite', async (event, resource) => {
            await this.syncFavoriteResources();
            await this.syncExternalResources();
        });

        this.$interval(async (): Promise<void> => {
                await this.syncFavoriteResources(),
                await this.syncTextbooks(),
                await this.syncSignets(),
                await this.syncExternalResources()
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

    async syncExternalResources(): Promise<void> {
        this.externalResources = await this.searchService.get(this.generateExternalResourceRequestBody());
        Utils.safeApply(this.$scope);
    }

    private generateExternalResourceRequestBody() {
        let plainTextSearch: PlainTextSearchData = new PlainTextSearchData().build({query: ".*"});
        return PlainTextSearchBody.generatePlainTextSearchParam(plainTextSearch.toJson(), [SOURCES.GAR]);
    }

    async syncSignets(): Promise<void> {
        this.publicSignets = this.orientationSignets = [];
        try {
            let publishedSignets: Resource[] = (await this.signetService.getPublishedSignets()).map((signet: IPublicSignetResponse) => this.publishedSignetResponseToResource(new PublicSignetResponse().build(signet)));
            let signetSharedWithMe: Resource[] = (await this.signetService.list()).data.filter((signet: SignetBody) => signet.owner_id != model.me.userId).map((signet: ISignetBody) => this.signetBodyToResource(signet));
            let signets = [...publishedSignets, ...signetSharedWithMe];
            this.publicSignets = signets
                .filter((signet: Resource) => signet.document_types && signet.document_types[0] != SIGNET_TYPE.ORIENTATION);
            this.orientationSignets = signets
                .filter((signet: Resource) => signet.document_types && signet.document_types[0] == SIGNET_TYPE.ORIENTATION);
            this.setFavoriteResources();
            Utils.safeApply(this.$scope);
        } catch (e) {
            console.error("An error has occurred during fetching signets ", e);
            toasts.warning("mediacentre.error.signet.retrieval");
        }
    }

    async syncTextbooks(isRefreshButton?: boolean): Promise<void> {
        try {
            if (isRefreshButton) {
                this.mainScope.mc.textbooks = await this.textbookService.refresh();
                toasts.info("mediacentre.success.textbook.retrieval")
            }
            else {
                this.mainScope.mc.textbooks = await this.textbookService.get();
            }
            this.setFavoriteResources();
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

    seeMyExternalResource = async (): Promise<void> => {
        let data: object = new PlainTextSearchData().build({query: ".*"}).toJson();
        this.$location.path(`/search/plain_text`);
        await this.mainScope.mc.startResearch(SEARCH_TYPE.PLAIN_TEXT, [SOURCES.GAR], data);
    };

    goSignet = (): void => {
        this.$location.path(`/signet/`);
    };

    filterArchivedSignets = (signet): boolean => {
        return !signet.archived;
    };

    private signetBodyToResource(signet: ISignetBody): Resource {
        let resource = new Resource();
        resource.id_info = signet.id ? signet.id.toString() : signet.resource_id;
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

    private publishedSignetResponseToResource(signet: PublicSignetResponse): Resource {
        let resource = new Resource();

        resource.authors = signet.authors;
        resource.description = signet.description;
        resource.date = signet.date;
        resource.displayTitle = resource.title = signet.title;
        resource.disciplines = signet.disciplines;
        resource.favorite = signet.favorite;
        resource.image = signet.image;
        resource.levels = signet.levels;
        resource.document_types = signet.document_types;
        resource.plain_text = signet.plain_text;
        resource.id_info = signet.id_info;
        resource.link = signet.link;
        resource.source = "fr.openent.mediacentre.source.Signet";

        return resource;
    }


    $onDestroy(): void {
    }
}

export const homeController = ng.controller('HomeController', ['$scope', 'route', '$location', '$interval', '$timeout',
    'FavoriteService', 'TextbookService', 'SignetService', 'SearchService', Controller]);

