import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IResourceResponse, Resource} from "../model";

export interface ISearchService {
    get(): Promise<Array<Resource>>;
}

export const searchService: ISearchService = {
    get: async (): Promise<Array<Resource>> => {
        return http.get(`/mediacentre/textbooks`)
            .then((response: AxiosResponse) => response.data.data.textbooks.map((resource: IResourceResponse) => new Resource().build(resource)));
    }
};

export const SearchService = ng.service('SearchService', (): ISearchService => export const searchService: ISearchService = {
);