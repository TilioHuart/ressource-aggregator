import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IResourceResponse, Resource} from "../model";
import {SearchResponse} from "../model/searchResponse";

export interface ISearchService {
    get(query: object): Promise<Array<Resource>>;
}

export const searchService: ISearchService = {
    get: async (query: object): Promise<Array<Resource>> => {
        let body = {jsondata : query};
        return http.post(`/mediacentre/search`, body)
            .then((response: AxiosResponse) => {
                return response.data.flatMap((sourceResource: SearchResponse) => sourceResource.data.resources
                    .map((resource: IResourceResponse) => new Resource().build(resource)));
            });
    }
};

export const SearchService = ng.service('SearchService', (): ISearchService => searchService);