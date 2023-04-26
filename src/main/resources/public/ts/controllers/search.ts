import {idiom, ng, toasts} from 'entcore';
import {MainScope} from './main'
import {Filter, Frame, Resource} from "../model";
import {IIntervalService, ILocationService} from "angular";
import {addFilters} from "../utils";
import {Signets} from "../model/Signet";
import {Utils} from "../utils/Utils";
import {ISearchService} from "../services/search.service";

declare let window: any;
declare var mediacentreUpdateFrequency: number;

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

    lang: typeof idiom;

    getSourcesLength(): number;
    formatClassName(className: string): string;
    isLoading(): boolean;
    getAdvancedSearchField(): string[];
    emptyAdvancedSearch(): boolean;
    showFilter(): void;
    search_Result(resources: Resource[]): void;
    initSources(value: boolean);
    fetchSearch(filteredResources?: Resource[]): Promise<void>;
    initSearch(): Promise<void>;
}

interface IHomeScope extends ng.IScope {
    vm: IViewModel;
    mainScope: MainScope;
}

class Controller implements IViewModel {
    mainScope: MainScope;
    updateFrequency: number;
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
    lang: typeof idiom = idiom;

    constructor(private $scope: IHomeScope,
                private $location: ILocationService,
                private searchService : ISearchService,
                private $interval: IIntervalService) {
        this.$scope.vm = this;
        this.mainScope = (<MainScope> this.$scope.$parent);
    }

    async $onInit() {
        this.updateFrequency = mediacentreUpdateFrequency;

        if (this.mainScope.mc.search.plain_text.text.trim().length === 0
            && Object.keys(this.mainScope.mc.search.advanced.values).length === 0) {
            this.$location.path('/');
        }

        this.mobile = screen.width < this.mainScope.mc.screenWidthLimit;
        this.displayFilter = !this.mobile;
        this.signets = new Signets();
        this.filteredFields = ['document_types', 'levels', 'source'];

        this.initSearch();

        let viewModel: IViewModel = this;
        let mainScopeModel : MainScope = this.mainScope;
        this.$scope.$on('search', function () {
            viewModel.initSearch();
        });

        this.$interval(async (): Promise<void> => {
            await this.fetchSearch();
        }, this.updateFrequency, 0, false);
    }

    initSources = (value: boolean): object => {
        const sources = {};
        window.sources.forEach((source) => sources[source] = value);
        return sources;
    }

    initSearch = async (): Promise<void> => {
        this.loaders = this.initSources(true);
        this.sources = this.initSources(false);
        this.displayedResources = [];

        this.filters = {
            initial: {document_types: [], levels: [], source: []},
            filtered: {document_types: [], levels: [], source: []}
        };

        this.resources = [];
        this.signets.all = [];
        await this.fetchSearch();

        Utils.safeApply(this.$scope);
    };

    fetchSearch = async (filteredResources?: Resource[]): Promise<void> => {
        try {
            let searchResources: Array<Resource> = await this.searchService.get(this.generatePlainTextSearchBody(this.mainScope.mc.search.plain_text.text));
            this.search_Result(searchResources);
            this.filter(searchResources);
            Utils.safeApply(this.$scope);
        } catch (e) {
            console.error("An error has occurred during fetching favorite ", e);
            toasts.warning(this.lang.translate("mediacentre.error.search.retrieval"));
        }
    }

    private filter = (searchResources: Array<Resource>): void => {
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

    search_Result = (resources: Resource[]): void => {
        this.resources = resources;
        this.resources = this.resources.sort((a: Resource, b: Resource) => a.title.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "").localeCompare(b.title.normalize('NFD').replace(/[\u0300-\u036f]/g, "")));
        resources.forEach((resource: Resource) => addFilters(this.filteredFields, this.filters.initial, resource));
        this.filter(this.resources);
        this.initSources(false);
        this.loaders = this.resources.length == 0 ? [] : this.initSources(true);
        Utils.safeApply(this.$scope);
    }

    getSourcesLength = (): number => {
        return Object.keys(this.loaders).length;
    };

    formatClassName = (className: string) => className.replace(new RegExp("\\.", 'g'), '-');

    isLoading = (): boolean => {
        let count: number = 0;
        let loaders: string[] = Object.keys(this.loaders);
        loaders.forEach((loader: string) => {
            if (this.loaders[loader]) {
                count++;
            }
        });
        return count > 0;
    };

    getAdvancedSearchField = (): string[] => {
        return Object.keys(this.mainScope.mc.search.advanced.values);
    };

    emptyAdvancedSearch = (): boolean => {
        let empty: boolean = true;
        Object.keys(this.mainScope.mc.search.advanced.values).forEach((field: string) => {
            empty = empty && (this.mainScope.mc.search.advanced.values[field].value.trim().length === 0)
        });

        return empty;
    };

    showFilter = (): void => {
        this.displayFilter = !this.displayFilter;
    }

    private generatePlainTextSearchBody = (query: string): object => {
        return {
            state: "PLAIN_TEXT",
            data: {
                query: query
            },
            event: "search",
            sources: window.sources
        };
    };

    private generateAdvancedSearchBody = (query: {title, authors, editors, disciplines, levels}, sources: String[]): object => {
        return {
            state: "PLAIN_TEXT",
            data: {

            },
            event: "search",
            sources: sources
        };
    };

    $onDestroy(): void {
    }
}

export const searchController = ng.controller('SearchController', ['$scope', '$location', 'SearchService',
    '$interval', Controller]);