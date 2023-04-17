import {model, ng} from 'entcore';
import {MainController, MainScope} from './main'
import {Filter, Frame, Resource} from "../model";
import {IIntervalService, ILocationService} from "angular";
import {addFilters} from "../utils";
import {Signets} from "../model/Signet";
import {signetService} from "../services/signet.service";
import {Utils} from "../utils/Utils";
import {FavoriteService, ITextbookService} from "../services";

declare let window: any;
interface IViewModel extends ng.IController {
    signets: Signets;
    width: number;
    mobile: boolean;
    displayFilter: boolean;
    loaders: any;
    resources: Resource[];
    displayedResources: Resource[];
    sources: any;
    filters: {
        initial: { document_types: Filter[], levels: Filter[], source: Filter[] }
        filtered: { document_types: Filter[], levels: Filter[], source: Filter[] }
    };
    filteredFields: string[];

    getSourcesLength(): number;
    formatClassName(className: string): string;
    isLoading(): boolean;
    getAdvancedSearchField(): string[];
    emptyAdvancedSearch(): boolean;
    showFilter(): void;
    search_Result(frame: Frame): void;
    initSources(value: boolean); //todo typage
}

interface IHomeScope extends ng.IScope {
    vm: IViewModel;
    mainScope: MainScope;
}

class Controller implements IViewModel {
    mainScope: MainScope;
    displayFilter: boolean;
    displayedResources: Resource[];
    filteredFields: string[];
    filters: { initial: { document_types: Filter[]; levels: Filter[]; source: Filter[] }; filtered: { document_types: Filter[]; levels: Filter[]; source: Filter[] } };
    loaders: any;
    mobile: boolean;
    resources: Resource[];
    signets: Signets;
    sources: any;
    width: number;

    constructor(private $scope: IHomeScope,
                private $location: ILocationService) {
        this.$scope.vm = this;
        this.mainScope = (<MainScope> this.$scope.$parent);
    }

    async $onInit() {
        if (this.mainScope.mc.search.plain_text.text.trim().length === 0
            && Object.keys(this.mainScope.mc.search.advanced.values).length === 0) {
            this.$location.path('/');
        }

        this.mobile = screen.width < this.mainScope.mc.screenWidthLimit;
        this.displayFilter = !this.mobile;
        this.signets = new Signets();
        this.filteredFields = ['document_types', 'levels', 'source'];

        this.initSearch();
        this.loaders = this.initSources(true);

        this.$scope.$watch(() => this.filters.filtered.document_types.length, this.filter);
        this.$scope.$watch(() => this.filters.filtered.levels.length, this.filter);
        this.$scope.$watch(() => this.filters.filtered.source.length, this.filter);

        let viewModel: IViewModel = this;
        let mainScopeModel : MainScope = this.mainScope;
        this.$scope.$on('search', function () {
            viewModel.vm.initSearch();
        });
    }

    initSources = (value: boolean) => {
        const sources = {};
        window.sources.forEach((source) => sources[source] = value);
        return sources;
    }

    initSearch = async () => {
        this.loaders = this.initSources(true);
        this.sources = this.initSources(false);
        this.displayedResources = [];

        this.filters = {
            initial: {document_types: [], levels: [], source: []},
            filtered: {document_types: [], levels: [], source: []}
        };

        this.resources = [];
        this.signets.all = [];
        if(!!this.mainScope.mc.search.plain_text.text) {
            let {data} = await signetService.searchMySignet(this.mainScope.mc.search.plain_text.text);
            this.signets.formatSignets(data);
            this.signets.formatSharedSignets(this.resources);
        } else {
            let {data} = await signetService.advancedSearchMySignet(this.mainScope.mc.search.advanced.values);
            this.signets.formatSignets(data);
            this.signets.formatSharedSignets(this.resources);
        }
        this.filter(this.resources);
        Utils.safeApply(this.$scope);
    };

    fetchSearch = (filteredResources?: Resource[]) => {
        try {
            let favoriteResources: Array<Resource> = await this.favoriteService.get();
            this.addFavoriteFilter(favoriteResources);
            this.filter(favoriteResources);
        } catch (e) {
            console.error("An error has occurred during fetching favorite ", e);
            toasts.warning(lang.translate("mediacentre.error.favorite.retrieval"));
        }
    }

    private filter = (searchResources: Array<Resource>) => {
        this.displayedResources = [];
        searchResources.forEach((resource: Resource) => {
            let match = true;
            this.filteredFields.forEach((field: string) => {
                let internalMatch = this.filters.filtered[field].length == 0;
                this.filters.filtered[field].forEach(({name}: Filter) => {
                    internalMatch = internalMatch || resource[field].includes(name);
                });
                match = match && internalMatch;
            });
            if (match) {
                this.displayedResources.push(resource);
            }
        });

        Utils.safeApply(this.$scope);
    };

    search_Result = (frame) => {
        this.resources = [...this.resources, ...frame.data.resources];
        this.resources = this.resources.sort((a, b) => a.title.normalize('NFD').replace(/[\u0300-\u036f]/g, "").localeCompare(b.title.normalize('NFD').replace(/[\u0300-\u036f]/g, "")));
        frame.data.resources.forEach((resource) => addFilters(this.filteredFields, this.filters.initial, resource));
        this.filter(this.resources);
        frame.data.resources = frame.data.resources.sort((a, b) => a.title.localeCompare(b.title));
        this.loaders[frame.data.source] = false;
        Utils.safeApply(this.$scope);
    }

    getSourcesLength = () => {
        return Object.keys(this.loaders).length;
    };

    formatClassName = (className) => className.replace(new RegExp("\\.", 'g'), '-');

    isLoading = () => {
        let count = 0;
        let loaders = Object.keys(this.loaders);
        loaders.forEach((loader: string) => {
            if (this.loaders[loader]) {
                count++;
            }
        });
        return count > 0;
    };

    getAdvancedSearchField = () => {
        return Object.keys(this.mainScope.mc.search.advanced.values);
    };

    emptyAdvancedSearch = () => {
        let empty = true;
        Object.keys(this.mainScope.mc.search.advanced.values).forEach((field: string) => {
            empty = empty && (this.mainScope.mc.search.advanced.values[field].value.trim().length === 0)
        });

        return empty;
    };

    showFilter = () => {
        this.displayFilter = !this.displayFilter;
    }

    $onDestroy(): void {
    }
}

export const searchController = ng.controller('SearchController', ['$scope', '$location',
    Controller]);