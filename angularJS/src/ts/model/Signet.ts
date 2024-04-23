import {Mix, Selectable, Selection} from "entcore-toolkit";
import {idiom, model, notify, Rights, Shareable} from "entcore";
import {signetService} from "../services/signet.service";
import {Label, Labels} from "./Label";
import {Resource} from "./resource.model";

export class Signet implements Selectable, Shareable  {
    shared: any;
    owner: {
        userId: string;
        displayName: string;
    };
    myRights: any;
    _id: number | undefined;

    id: number;
    title: string;
    url: string;
    owner_id: string;
    owner_name: string;
    date_creation: Date;
    date_modification: Date;
    orientation: boolean;
    sent: boolean;
    collab: boolean;
    published: boolean;
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
    status: string | undefined;
    favorite: boolean | undefined;
    hash: number;
    displayTitle: string;
    image: string;
    source: string;
    disciplines: Labels;
    levels: Labels;
    plain_text: Labels;
    resource_id: number;
    document_types: Array<String>;

    constructor() {
        this.owner = {userId: "", displayName: ""},
        this.id = 0;
        this.title = "";
        this.owner_id = "";
        this.owner_name = "";
        this.url = "";
        this.date_creation = new Date();
        this.date_modification = new Date();
        this.sent = false;
        this.collab = false;
        this.published = false;
        this.archived = false;
        this.multiple = false;
        this.anonymous = false;
        this.displayed = true;
        this.selected = false;
        this.orientation = false;
        this.hash = 0;
        this.resource_id = 0;
        this.displayTitle = "";
        this.image = "";
        this.source = "fr.openent.mediacentre.source.Signet",
        this.disciplines = new Labels(),
        this.levels = new Labels(),
        this.plain_text = new Labels(),
        this.document_types = []
    }

    toJson() : Object {
        return {
            id: this.id,
            resource_id: this.resource_id,
            title: this.title,
            image: this.image,
            link: this.url,
            url: this.url,
            owner_id: this.owner_id,
            owner_name: this.owner_name,
            date_creation: new Date(this.date_creation),
            sent: this.sent,
            collab: this.collab,
            published: this.published,
            archived: this.archived,
            multiple: this.multiple,
            anonymous: this.anonymous,
            selected: this.selected,
            hash: this.hash,
            orientation: this.orientation,
            displayTitle: this.displayTitle,
            source: this.source,
            disciplines: this.disciplines.all,
            levels: this.levels.all,
            plain_text: this.plain_text.all,
            document_types: this.document_types ? this.document_types : ["Signet"]
        }
    }

    setFromJson = (data: any) : void => {
        for (let key in data) {
            this[key] = data[key];
            if ((key === 'date_creation' || key === 'date_modification')
                && !!data[key]) {
                    this[key] = new Date(this[key]);
            }
            if (key === 'id' && !!data[key]) {
                this[key] =  Number(this[key].toString());
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
            notify.error(idiom.translate('mediacentre.error.signet.image'));
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
            this.formatSignets(data);
            await this.setResourceRights();
        } catch (e) {
            notify.error(idiom.translate('mediacentre.error.signet.sync'));
            throw e;
        }
    };

    formatSignets = (data) : void => {
        for (let i = 0; i < data.length; i++) {
            let tempSignet = new Signet();
            tempSignet.setFromJson(data[i]);
            let disciplinesArray = new Labels();
            let levelsArray = new Labels();
            let textArray = new Labels();
            if(!!tempSignet.disciplines) {
                tempSignet.disciplines.forEach(function (discipline) {
                    if(!!discipline[1]) {
                        disciplinesArray.all.push(new Label(undefined, discipline[1]));
                    }
                });
                tempSignet.disciplines.all = Mix.castArrayAs(Label, disciplinesArray.all);;
            }
            if(!!tempSignet.levels) {
                tempSignet.levels.forEach(function (level) {
                    if(!!level[1]) {
                        levelsArray.all.push(new Label(undefined, level[1]));
                    }
                });
                tempSignet.levels.all = Mix.castArrayAs(Label, levelsArray.all);
            }
            if(!!tempSignet.plain_text) {
                tempSignet.plain_text.forEach(function (word) {
                    if(!!word[1]) {
                        textArray.all.push(new Label(undefined, word[1]));
                    }
                });
                tempSignet.plain_text.all = Mix.castArrayAs(Label, textArray.all);
            }
            this.all.push(tempSignet);
        }
    }

    formatSharedSignets = (resources: Resource[]) : void => {
        this.all.forEach(signet => {
            if(!signet.archived && signet.collab && signet.owner_id != model.me.userId) {
                let signet_shared = <Resource>signet.toJson();
                let disciplinesArray: string[] = [];
                let levelsArray: string[] = [];
                let plaintextArray: string[] = [];
                if (!!signet.disciplines) {
                    signet.disciplines.forEach(function (discipline) {
                        if (!!discipline[1]) {
                            disciplinesArray.push(discipline[1]);
                        }
                    });
                }
                signet_shared.disciplines = disciplinesArray;
                if (!!signet.levels) {
                    signet.levels.forEach(function (level) {
                        if (!!level[1]) {
                            levelsArray.push(level[1]);
                        }
                    });
                }
                signet_shared.levels = levelsArray;
                if (!!signet.plain_text) {
                    signet.plain_text.forEach(function (word) {
                        if (!!word[1]) {
                            plaintextArray.push(word[1]);
                        }
                    });
                }
                signet_shared.plain_text = plaintextArray
                signet_shared.favorite = signet.favorite;
                signet_shared.document_types = [];
                signet_shared.authors = [];
                signet_shared.editors = [];
                signet_shared.authors.push(signet.owner_id);
                signet_shared.editors.push(signet.owner_name);
                signet_shared.document_types.push(signet.orientation ? "Orientation" : "Signet");
                resources.push((signet_shared));
            }
        });
    }

    setResourceRights = async () : Promise<void> => {
        let { data } = await signetService.getAllMySignetRights();
        let ids = this.all.map(signet => signet.id);
        for (let i = 0; i < ids.length; i++) {
            let signetId = ids[i];
            this.all.filter(signet => signet.id === signetId)[0].myRights = data.filter(right => right.resource_id === signetId).map(right => right.action);
        }
    };

}