import {IResourceResponse, Resource} from "../model";
import http, {AxiosResponse} from "axios";
import {ng} from "entcore";

export interface IGlobalService {
    get(): Promise<Array<Resource>>;
}

export const globalService: IGlobalService = {
    get: async (): Promise<Array<Resource>> => {
        return http.get(`/mediacentre/global/resources`)
            .then((response: AxiosResponse) => (response.data.data?.global && response.data.data?.global.length > 0) ?
                response.data.data?.global.map((resource: IResourceResponse) => new Resource().build(resource)) : []);
    }
};

export const GlobalService = ng.service('GlobalService', (): IGlobalService => globalService);