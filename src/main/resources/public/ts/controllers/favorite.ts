import {ng, toasts, idiom} from 'entcore';
import {Filter, Resource} from '../model';
import {addFilters} from '../utils';
import {FavoriteService} from "../services";
import {IIntervalService} from "angular";
import {Utils} from "../utils/Utils";

declare var mediacentreUpdateFrequency: number;

interface IViewModel extends ng.IController {
    loaders: any;
    resources: Resource[];
    favorites: Resource[];
    displayFilter: boolean;
    filters: {
        initial: {  source: Filter[], document_types: Filter[], levels: Filter[] }
        filtered: {  source: Filter[], document_types: Filter[], levels: Filter[] }
    };
    filteredFields: string[];
    updateFrequency: number;
    lang: typeof idiom;

    showFilter() : void;
    fetchFavorites(filteredResources?: Resource[]): void;
}

interface IFavoriteScope extends ng.IScope {
    vm: IViewModel;
}

class Controller implements IViewModel {

    displayFilter: boolean;
    favorites: Resource[];
    filteredFields: string[];
    filters: { initial: { source: Filter[]; document_types: Filter[]; levels: Filter[] }; filtered: { source: Filter[]; document_types: Filter[]; levels: Filter[] } };
    loaders: any;
    resources: Resource[];
    updateFrequency: number;
    lang: typeof idiom = idiom;

    constructor(private $scope: IFavoriteScope, 
                private route,
                private favoriteService: FavoriteService,
                private $interval: IIntervalService) {
        this.$scope.vm = this;
        this.favorites = [];
        this.filteredFields = ['document_types', 'levels'];
        this.filters = {
            initial: { source: [], document_types: [], levels: []},
            filtered: {source: [], document_types: [], levels: []}
        };
    }

    async $onInit() {
        this.displayFilter = screen.width >= this.$scope['mc'].screenWidthLimit;
        this.updateFrequency = mediacentreUpdateFrequency;

        await this.fetchFavorites();

        let viewModel: IViewModel = this;
        this.$scope.$on('deleteFavorite', function (event, id) {
            viewModel.favorites = viewModel.favorites.filter(el => el.id !== id);
        });

        this.$interval(async (): Promise<void> => {
            await this.fetchFavorites();
        }, this.updateFrequency, 0, false);
    }

    showFilter(): void {
        this.displayFilter = !this.displayFilter;
    }

    async fetchFavorites(filteredResources?: Resource[]) {
        try {
            let favoriteResources: Array<Resource> = await this.favoriteService.get();
            this.addFavoriteFilter(favoriteResources);
            this.filter(favoriteResources);
        } catch (e) {
            console.error("An error has occurred during fetching favorite ", e);
            toasts.warning(this.lang.translate("mediacentre.error.favorite.retrieval"));
        }
    }

    private addFavoriteFilter(favoriteResources: Array<Resource>): void {
        favoriteResources.forEach((resource: Resource) => {
            resource.favorite = true;
            addFilters(this.filteredFields, this.filters.initial, resource);
        });
    }

    private filter(favoriteResources: Array<Resource>) {
        this.favorites = [];
        favoriteResources.forEach((resource: Resource) => {
            let match = true;
            this.filteredFields.forEach((field: string) => {
                let internalMatch = this.filters.filtered[field].length == 0;
                this.filters.filtered[field].forEach(({name}: Filter) => {
                    internalMatch = internalMatch || resource[field].includes(name);
                });
                match = match && internalMatch;
            });
            if (match) {
                this.favorites.push(resource);
            }
        });
        Utils.safeApply(this.$scope);
    };

    $onDestroy(): void {
    }

}

export const favoriteController = ng.controller('FavoriteController', ['$scope', 'route', 'FavoriteService',
    '$interval', Controller]);
