import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IResourceResponse, Resource} from "../model";
import {SearchResponse} from "../model/searchResponse";

export interface ISearchService {
    get(query: object): Promise<Array<Resource>>;
}

export const searchService: ISearchService = {
    get: async (query: object): Promise<Array<Resource>> => {
        let urlParam: string = `?jsondata=` + encodeURI(JSON.stringify(query));
        return http.get(`/mediacentre/search${urlParam}`)
            .then((response: AxiosResponse) => {
                return response.data.flatMap((sourceResource: SearchResponse) => (sourceResource.data && sourceResource.data.resources && sourceResource.data.resources.length > 0) ?
                    sourceResource.data.resources.map((resource: IResourceResponse) => new Resource().build(resource)) : []);
            });
    }
};

export const SearchService = ng.service('SearchService', (): ISearchService => searchService);