import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IResourceResponse, Resource} from "../model";

export interface FavoriteService {
    create(bodyResource: Resource, id:number): Promise<AxiosResponse>;
    delete(id: string, source: string): Promise<AxiosResponse>;
    get(): Promise<Array<Resource>>;
}

export const FavoriteService = ng.service('FavoriteService', (): FavoriteService => ({
    create: async (bodyResource: Resource, id:number): Promise<AxiosResponse> => {
        return await http.post(`/mediacentre/favorites?id=${id}`, bodyResource);
    },

    delete: async (id: string, source: string): Promise<AxiosResponse> => {
        return await http.delete(`/mediacentre/favorites?id=${id}&source=${source}`);
    },

    get: async (): Promise<Array<Resource>> => {
        return http.get(`/mediacentre/favorites`)
            .then((response: AxiosResponse) => response.data.data.map((resource: IResourceResponse) => new Resource().build(resource)));
    }
}));