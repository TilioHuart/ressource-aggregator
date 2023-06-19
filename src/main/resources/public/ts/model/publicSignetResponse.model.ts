export interface IPublicSignetResponse {
    authors: string[];
    date: number;
    description: string;
    disciplines: string[];
    document_types: string[];
    editors: string[];
    id: string;
    favorite?: boolean;
    image: string;
    levels: string[];
    link: string;
    plain_text: string[];
    source: string;
    title: string;
}

export class PublicSignetResponse {
    private _authors: string[];
    private _date: number;
    private _description: string;
    private _disciplines: string[];
    private _document_types: string[];
    private _editors: string[];
    private _id_info: string;
    private _favorite?: boolean;
    private _image: string;
    private _levels: string[];
    private _link: string;
    private _plain_text: string[];
    private _source: string;
    private _title: string;


    constructor() {
        this._authors = null;
        this._date = null;
        this._description = null;
        this._disciplines = null;
        this._document_types = null;
        this._editors = null;
        this._favorite = null;
        this._image = null;
        this._levels = null;
        this._link = null;
        this._plain_text = null;
        this._source = null;
        this._title = null;
        this._id_info = null;
    }

    build(data: IPublicSignetResponse): PublicSignetResponse {
        this._authors = data.authors ? data.authors : [];
        this._date = data.date;
        this._description = data.description;
        this._disciplines = data.disciplines;
        this._document_types = data.document_types;
        this._editors = data.editors;
        this._favorite = data.favorite;
        this._image = data.image;
        this._levels = data.levels;
        this._link = data.link;
        this._plain_text = data.plain_text;
        this._source = data.source;
        this._title = data.title;
        this._id_info = data.id;

        return this;
    }

    get authors(): string[] {
        return this._authors;
    }

    set authors(value: string[]) {
        this._authors = value;
    }

    get date(): number {
        return this._date;
    }

    set date(value: number) {
        this._date = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get disciplines(): string[] {
        return this._disciplines;
    }

    set disciplines(value: string[]) {
        this._disciplines = value;
    }

    get document_types(): string[] {
        return this._document_types;
    }

    set document_types(value: string[]) {
        this._document_types = value;
    }

    get editors(): string[] {
        return this._editors;
    }

    set editors(value: string[]) {
        this._editors = value;
    }

    get favorite(): boolean {
        return this._favorite;
    }

    set favorite(value: boolean) {
        this._favorite = value;
    }

    get image(): string {
        return this._image;
    }

    set image(value: string) {
        this._image = value;
    }

    get levels(): string[] {
        return this._levels;
    }

    set levels(value: string[]) {
        this._levels = value;
    }

    get link(): string {
        return this._link;
    }

    set link(value: string) {
        this._link = value;
    }

    get plain_text(): string[] {
        return this._plain_text;
    }

    set plain_text(value: string[]) {
        this._plain_text = value;
    }

    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get id_info(): string {
        return this._id_info;
    }

    set id_info(value: string) {
        this._id_info = value;
    }
}