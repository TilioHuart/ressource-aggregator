import {Selectable, Selection} from "entcore-toolkit";
import {http, idiom, notify, Rights, Shareable} from "entcore";
import {signetService} from "../services/SignetService";

export class Signet implements Selectable, Shareable  {
    shared: any;
    owner!: {
        userId: string;
        displayName: string;
    };
    myRights: any;
    _id: number | undefined;

    id: number;
    title: string;
    picture: string;
    url: string;
    owner_id: string;
    owner_name: string;
    date_creation: Date;
    sent: boolean;
    collab: boolean;
    reminded: boolean;
    archived: boolean;
    multiple: boolean;
    anonymous: boolean;
    displayed: boolean;
    selected: boolean;
    infoImg: {
        name: string;
        type: string;
        compatible: boolean;
    } | undefined;
    nb_responses: number | undefined;
    status: string | undefined;

    constructor() {
        this.id = 0;
        this.title = "";
        this.picture = "";
        this.owner_id = "";
        this.owner_name = "";
        this.url = "";
        this.date_creation = new Date();
        this.sent = false;
        this.collab = false;
        this.reminded = false;
        this.archived = false;
        this.multiple = false;
        this.anonymous = false;
        this.displayed = true;
        this.selected = false;
    }

    toJson() : Object {
        return {
            id: this.id,
            title: this.title,
            picture: this.picture,
            url: this.url,
            owner_id: this.owner_id,
            owner_name: this.owner_name,
            date_creation: new Date(this.date_creation),
            sent: this.sent,
            collab: this.collab,
            reminded: this.reminded,
            archived: this.archived,
            multiple: this.multiple,
            anonymous: this.anonymous,
            selected: this.selected
        }
    }

    setFromJson = (data: any) : void => {
        for (let key in data) {
            this[key] = data[key];
            if (key === 'nb_responses' && !!!data[key]) { this[key] = 0; }
            if ((key === 'date_creation' || key === 'date_modification' || key === 'date_opening' || key === 'date_ending')
                && !!data[key]) {
                    this[key] = new Date(this[key]);
            }
        }
    };

    generateShareRights = () : void => {
        this._id = this.id;
        this.owner = {userId: this.owner_id, displayName: this.owner_name};
        this.myRights = new Rights<Signet>(this);
    };

    setInfoImage = async () : Promise<void> => {
        const typesImgNoSend = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
        try {
            let { data: { metadata } } = await signetService.getInfoImage(this);
            this.infoImg = {
                name: metadata.filename,
                type: metadata["content-type"],
                compatible: !typesImgNoSend.some(type => type === metadata["content-type"]),
            };
        } catch (e) {
            notify.error(idiom.translate('formulaire.error.form.image'));
            throw e;
        }
    };
}

export class Signets extends Selection<Signet> {
    all: Signet[] = [];
    constructor() {
        super([]);
    }

    sync = async () : Promise<void> => {
        this.all = [];
        try {
            let { data } = await signetService.list();
            for (let i = 0; i < data.length; i++) {
                let tempSignet = new Signet();
                tempSignet.setFromJson(data[i]);
                this.all.push(tempSignet);
            }
            await this.setResourceRights();
        } catch (e) {
            notify.error(idiom.translate('formulaire.error.form.sync'));
            throw e;
        }
    };

    setResourceRights = async () : Promise<void> => {
        let { data } = await signetService.getAllMySignetRights();
        let ids = this.all.map(form => form.id);
        for (let i = 0; i < ids.length; i++) {
            let formId = ids[i];
            let rights = data.filter(right => right.resource_id === formId).map(right => right.action);
            this.all.filter(form => form.id === formId)[0].myRights = rights;
        }
    };

/*    async setInfoImg() {
        const typesImgNoSend = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
        try {
            const {data: {metadata}} = await http.get(`/moodle/info/image/${this.imageurl ? this.imageurl.split("/").slice(-1)[0] : null}`);
            this.infoImg = {
                name: metadata.filename,
                type: metadata["content-type"],
                compatibleMoodle: !typesImgNoSend.some(type => type === metadata["content-type"]),
            };
        } catch (e) {
            notify.error("info img function didn't work");
            throw e;
        }
    }*/

}