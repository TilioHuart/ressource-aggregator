import {IPlainTextSearchData} from "./searchData.model";
import {SEARCH_TYPE} from "../core/enum/search-type.enum";

export interface IPlainTextSearchBody {
    data: IPlainTextSearchData,
    sources: string[]
}

export class PlainTextSearchBody {
    private _state: string;
    private _data: IPlainTextSearchData;
    private _event: string;
    private _sources: string[];

    constructor(data: IPlainTextSearchBody) {
        this._state = SEARCH_TYPE.PLAIN_TEXT;
        this._data = data.data;
        this._event = "search";
        this._sources = data.sources;
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
}

export interface IAdvancedSearchBody {
    title?: FieldData;
    authors?: FieldData
    editors?: FieldData;
    disciplines?: FieldData;
    levels?: FieldData;
}

export class AdvancedSearchBody {
    private _title?: FieldData;
    private _authors?: FieldData
    private _editors?: FieldData;
    private _disciplines?: FieldData;
    private _levels?: FieldData;

    constructor(data: IAdvancedSearchBody) {
        this._title = data.title;
        this._authors = data.authors;
        this._editors = data.editors;
        this._disciplines = data.editors;
        this._levels = data.levels;
    }

    get title(): FieldData {
        return this._title;
    }

    set title(value: FieldData) {
        this._title = value;
    }

    get authors(): FieldData {
        return this._authors;
    }

    set authors(value: FieldData) {
        this._authors = value;
    }

    get editors(): FieldData {
        return this._editors;
    }

    set editors(value: FieldData) {
        this._editors = value;
    }

    get disciplines(): FieldData {
        return this._disciplines;
    }

    set disciplines(value: FieldData) {
        this._disciplines = value;
    }

    get levels(): FieldData {
        return this._levels;
    }

    set levels(value: FieldData) {
        this._levels = value;
    }

    /**
     * Returns true if the object contains the fields necessary to generate an advanced search body
     */
    static isIAdvancedSearchBody(object: any): boolean {
        return (!!object.title && !!object.title.value)
            || (!!object.authors && FieldData.isFieldData(object.authors))
            || (!!object.editors && FieldData.isFieldData(object.editors))
            || (!!object.disciplines && FieldData.isFieldData(object.disciplines))
            || (!!object.levels && FieldData.isFieldData(object.levels));
    }

}

export class FieldData {
    private _value: string;
    private _comparator: string;

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
    }

    get comparator(): string {
        return this._comparator;
    }

    set comparator(value: string) {
        this._comparator = value;
    }

    /**
     * Returns true if the object contains the fields of a FieldData
     */
    static isFieldData(object: any): boolean {
        return !!object.value && !!object.comparator;
    }
}