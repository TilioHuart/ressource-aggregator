import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {Resource} from "../model";

export interface FavoriteService {
    create(bodyResource: Resource): Promise<AxiosResponse>;
    delete(id: string, source: string): Promise<AxiosResponse>;
}

export const FavoriteService = ng.service('FavoriteService', (): FavoriteService => ({
    create: async (bodyResource: Resource): Promise<AxiosResponse> => {
        return await http.post(`/mediacentre/favorites`, bodyResource);
    },

    delete: async (id: string, source: string): Promise<AxiosResponse> => {
        return await http.delete(`/mediacentre/favorites?id=${id}&source=${source}`);
    }
}));