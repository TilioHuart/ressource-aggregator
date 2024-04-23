import {IResourceResponse} from "./resource.model";

export interface ISearchResponse {
    data: SearchResponseData;
    event: string;
    state: string;
    status: string;
}

export class SearchResponse {
    private _data: SearchResponseData;
    private _event: string;
    private _state: string;
    private _status: string;

    constructor(data: ISearchResponse) {
        this._data = data.data;
        this._event = data.event;
        this._state = data.state;
        this._status = data.status;
    }

    get data(): SearchResponseData {
        return this._data;
    }

    set data(value: SearchResponseData) {
        this._data = value;
    }

    get event(): string {
        return this._event;
    }

    set event(value: string) {
        this._event = value;
    }

    get state(): string {
        return this._state;
    }

    set state(value: string) {
        this._state = value;
    }

    get status(): string {
        return this._status;
    }

    set status(value: string) {
        this._status = value;
    }
}

export class SearchResponseData {
    private _resources: IResourceResponse[];
    private _source: string;

    get resources(): IResourceResponse[] {
        return this._resources;
    }

    set resources(value: IResourceResponse[]) {
        this._resources = value;
    }

    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
    }
}
