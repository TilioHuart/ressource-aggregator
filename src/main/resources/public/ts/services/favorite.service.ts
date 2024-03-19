import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IResourceBody, IResourceResponse, ResourceBody, Resource} from "../model";
import {Signet} from "../model/Signet";

export interface FavoriteService {
    create(bodyResource: IResourceBody, id:number): Promise<AxiosResponse>;
    delete(id: string, source: string): Promise<AxiosResponse>;
    get(): Promise<Array<Resource>>;
}

export const FavoriteService = ng.service('FavoriteService', (): FavoriteService => ({
    create: async (bodyResource: IResourceBody, id:number): Promise<AxiosResponse> => {
        return await http.post(`/mediacentre/favorites?id=${id}`, bodyResource);
    },

    delete: async (id: string, source: string): Promise<AxiosResponse> => {
        return await http.delete(`/mediacentre/favorites?id=${id}&source=${source}`);
    },

    get: async (): Promise<Array<Resource>> => {
        return http.get(`/mediacentre/favorites`)
            .then((response: AxiosResponse) => (response.data.data.global && response.data.data.global.length > 0) ?
                response.data.data.global.map((resource: IResourceResponse) => new Resource().build(resource)) : []);
    }
}));