import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {Resource} from "../model";

export interface FavoriteService {
    create(bodyResource: Resource, id:number): Promise<AxiosResponse>;
    delete(id: string, source: string): Promise<AxiosResponse>;
}

export const FavoriteService = ng.service('FavoriteService', (): FavoriteService => ({
    create: async (bodyResource: Resource, id:number): Promise<AxiosResponse> => {
        return await http.post(`/mediacentre/favorites?id=${id}`, bodyResource);
    },

    delete: async (id: string, source: string): Promise<AxiosResponse> => {
        return await http.delete(`/mediacentre/favorites?id=${id}&source=${source}`);
    },
}));