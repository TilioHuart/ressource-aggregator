import {model} from "entcore";
import {Selection} from "entcore-toolkit";
import {Signet} from "./Signet";

export interface ISignetBody {
    archived: boolean;
    collab: boolean
    date_creation: string;
    date_modification: string;
    disciplines: Array<any>;
    favorite: boolean;
    id: number;
    image: string;
    levels: Array<any>;
    orientation: boolean;
    owner_id: string;
    owner_name: string;
    plain_text: Array<any>;
    published: boolean;
    resource_id: string;
    title: string;
    url: string;
}

export class SignetBody {
    private _archived: boolean;
    private _collab: boolean
    private _date_creation: string;
    private _date_modification: string;
    private _disciplines: Array<any>;
    private _favorite: boolean;
    private _id: number;
    private _image: string;
    private _levels: Array<any>;
    private _orientation: boolean;
    private _owner_id: string;
    private _owner_name: string;
    private _plain_text: Array<Array<number|string>>;
    private _published: boolean;
    private _resource_id: string;
    private _title: string;
    private _url: string;

    constructor(data: ISignetBody) {
        this._archived = data.archived;
        this._collab = data.collab
        this._date_creation = data.date_creation;
        this._date_modification = data.date_modification;
        this._disciplines = data.disciplines;
        this._favorite = data.favorite;
        this._id = data.id;
        this._image = data.image;
        this._levels = data.levels;
        this._orientation = data.orientation;
        this._owner_id = data.owner_id;
        this._owner_name = data.owner_name;
        this._plain_text = data.plain_text;
        this._published = data.published;
        this._resource_id = data.resource_id;
        this._title = data.title;
        this._url = data.url;
    }

    get archived(): boolean {
        return this._archived;
    }

    set archived(value: boolean) {
        this._archived = value;
    }

    get collab(): boolean {
        return this._collab;
    }

    set collab(value: boolean) {
        this._collab = value;
    }

    get date_creation(): string {
        return this._date_creation;
    }

    set date_creation(value: string) {
        this._date_creation = value;
    }

    get date_modification(): string {
        return this._date_modification;
    }

    set date_modification(value: string) {
        this._date_modification = value;
    }

    get disciplines(): Array<any> {
        return this._disciplines;
    }

    set disciplines(value: Array<any>) {
        this._disciplines = value;
    }

    get favorite(): boolean {
        return this._favorite;
    }

    set favorite(value: boolean) {
        this._favorite = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get image(): string {
        return this._image;
    }

    set image(value: string) {
        this._image = value;
    }

    get levels(): Array<any> {
        return this._levels;
    }

    set levels(value: Array<any>) {
        this._levels = value;
    }

    get orientation(): boolean {
        return this._orientation;
    }

    set orientation(value: boolean) {
        this._orientation = value;
    }

    get owner_id(): string {
        return this._owner_id;
    }

    set owner_id(value: string) {
        this._owner_id = value;
    }

    get owner_name(): string {
        return this._owner_name;
    }

    set owner_name(value: string) {
        this._owner_name = value;
    }

    get plain_text(): Array<any> {
        return this._plain_text;
    }

    set plain_text(value: Array<any>) {
        this._plain_text = value;
    }

    get published(): boolean {
        return this._published;
    }

    set published(value: boolean) {
        this._published = value;
    }

    get resource_id(): string {
        return this._resource_id;
    }

    set resource_id(value: string) {
        this._resource_id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this._url = value;
    }
}