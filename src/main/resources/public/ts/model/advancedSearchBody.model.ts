import {SEARCH_TYPE} from "../core/enum/search-type.enum";
import {IResourceBody} from "./resourceBody.model";

export interface IAdvancedSearchBody {
    title?: IFieldData;
    authors?: IFieldData
    editors?: IFieldData;
    disciplines?: IFieldData;
    levels?: IFieldData;
}

export class AdvancedSearchBody implements IAdvancedSearchBody{
    private _title?: IFieldData;
    private _authors?: IFieldData
    private _editors?: IFieldData;
    private _disciplines?: IFieldData;
    private _levels?: IFieldData;

    build(data: IAdvancedSearchBody): AdvancedSearchBody {
        this._title = data.title;
        this._authors = data.authors;
        this._editors = data.editors;
        this._disciplines = data.editors;
        this._levels = data.levels;

        return this;
    }

    toJson(): IAdvancedSearchBody {
        let jsonAdvancedSearch: IAdvancedSearchBody = {};

        if (this._title) jsonAdvancedSearch.title = this.title.toJson();
        if (this._authors) jsonAdvancedSearch.authors = this.authors.toJson();
        if (this._editors) jsonAdvancedSearch.editors = this.editors.toJson();
        if (this._disciplines) jsonAdvancedSearch.disciplines = this.disciplines.toJson();
        if (this._levels) jsonAdvancedSearch.levels = this.levels.toJson();

        return jsonAdvancedSearch;
    }

    get title(): IFieldData {
        return this._title;
    }

    set title(value: IFieldData) {
        this._title = value;
    }

    get authors(): IFieldData {
        return this._authors;
    }

    set authors(value: IFieldData) {
        this._authors = value;
    }

    get editors(): IFieldData {
        return this._editors;
    }

    set editors(value: IFieldData) {
        this._editors = value;
    }

    get disciplines(): IFieldData {
        return this._disciplines;
    }

    set disciplines(value: IFieldData) {
        this._disciplines = value;
    }

    get levels(): IFieldData {
        return this._levels;
    }

    set levels(value: IFieldData) {
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

    static generateAdvancedSearchParam = (query: IAdvancedSearchBody, sources: String[]): object => {
        return {
            state: SEARCH_TYPE.ADVANCED,
            data: query,
            event: "search",
            sources: sources
        };
    };
}

export interface IFieldData {
    value: string;
    comparator?: string;

    toJson?(): IFieldData;
}

export class FieldData implements IFieldData{
    private _value: string;
    private _comparator?: string;

    build(data: IFieldData): FieldData {
        this._value = data.value;
        this._comparator = data.comparator;

        return this;
    }

    toJson(): IFieldData {
        let jsonFieldData: IFieldData = {value : this.value};
        if (this._comparator) jsonFieldData.comparator = this._comparator;
        return jsonFieldData;
    }

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