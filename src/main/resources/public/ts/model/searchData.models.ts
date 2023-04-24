export interface IPlainTextSearchData {
    query: string;
}

export class PlainTextSearchData {
    private _query: string;

    constructor(data: IPlainTextSearchData) {
        this._query = data.query;
    }
}

export interface IAdvancedSearchData {
    title?: FieldData;
    authors?: FieldData
    editors?: FieldData;
    disciplines?: FieldData;
    levels?: FieldData;
}

export class AdvancedSearchData {
    private _title?: FieldData;
    private _authors?: FieldData
    private _editors?: FieldData;
    private _disciplines?: FieldData;
    private _levels?: FieldData;

    constructor(data: IAdvancedSearchData) {
        this._title = data.title;
        this._authors = data.authors;
        this._editors = data.editors;
        this._disciplines = data.editors;
        this._levels = data.levels;
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
}