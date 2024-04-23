import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IResourceResponse, Resource} from "../model";

export interface ITextbookService {
    get(): Promise<Array<Resource>>;
    refresh(): Promise<Array<Resource>>;
}

export const textbookService: ITextbookService = {
    get: async (): Promise<Array<Resource>> => {
        return http.get(`/mediacentre/textbooks`)
            .then((response: AxiosResponse) => (response.data.data && response.data.data.textbooks && response.data.data.textbooks.length > 0) ? response.data.data.textbooks.map((resource: IResourceResponse) => new Resource().build(resource)) : []);
    },
    refresh: async (): Promise<Array<Resource>> => {
        let response = await http.get(`/mediacentre/textbooks/refresh`);
        return (response.data.data && response.data.data.textbooks && response.data.data.textbooks.length > 0)
            ? response.data.data.textbooks.map((resource: IResourceResponse) => new Resource().build(resource))
            : [];
    }
};

export const TextbookService = ng.service('TextbookService', (): ITextbookService => textbookService);