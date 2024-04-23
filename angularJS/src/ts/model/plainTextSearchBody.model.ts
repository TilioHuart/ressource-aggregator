import {SEARCH_TYPE} from "../core/enum/search-type.enum";
import {SOURCES} from "../core/enum/sources.enum";
import {IAdvancedSearchBody} from "./advancedSearchBody.model";
import {themeService} from "entcore/types/src/ts/theme";

export interface IPlainTextSearchData {
    query: string;
}

export class PlainTextSearchData implements IPlainTextSearchData{
    private _query: string;

    build(data: IPlainTextSearchData): PlainTextSearchData {
        this._query = data.query;
        return this;
    }

    toJson(): IPlainTextSearchData {
        return {
            query: this.query
        }
    }

    get query(): string {
        return this._query;
    }

    set query(value: string) {
        this._query = value;
    }
}

export interface IPlainTextSearchBody {
    data: IPlainTextSearchData,
    sources?: string[]
}

export class PlainTextSearchBody implements IPlainTextSearchBody{
    private _state: string;
    private _data: IPlainTextSearchData;
    private _event: string;
    private _sources: string[];

    build(data: IPlainTextSearchBody) {
        this._state = SEARCH_TYPE.PLAIN_TEXT;
        this._data = data.data;
        this._event = "search";
        this._sources = data.sources && data.sources.length > 0 ?
            data.sources : [SOURCES.GAR, SOURCES.MOODLE, SOURCES.PMB, SOURCES.SIGNET];

        return this;
    }

    get state(): string {
        return this._state;
    }

    get data(): IPlainTextSearchData {
        return this._data;
    }

    set data(value: IPlainTextSearchData) {
        this._data = value;
    }

    get event(): string {
        return this._event;
    }

    get sources(): string[] {
        return this._sources;
    }

    set sources(value: string[]) {
        this._sources = value;
    }

    static generatePlainTextSearchParam = (query: IPlainTextSearchData, sources?: string[]): object => {
        return {
            state: SEARCH_TYPE.PLAIN_TEXT,
            data: query,
            event: "search",
            sources: (sources && sources.length != 0) ? sources : [SOURCES.GAR, SOURCES.MOODLE, SOURCES.PMB, SOURCES.SIGNET]
        };
    };
}