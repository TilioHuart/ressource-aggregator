import {_, idiom as idiom, model, ng, notify, angular} from "entcore";
import {Utils} from "../../utils/Utils";
import {Label, Labels} from "../../model/Label";
import {signetService} from "../../services";
import {MainScope} from "../main";
import {ITimeoutService} from "angular";
import {ISignetScope} from "../signet";
import {SignetBody} from "../../model/signetBody.model";
import {Signet} from "../../model/Signet";

interface IViewModel extends ng.IController {
    publishSignet(): Promise<void>;
    addSingleKeyWord(): void;
    addKeyWord(event): void;
    removeLevelFromCourse(level: Label): void;
    removeDisciplineFromCourse(discipline: Label): void;
    removeWordFromCourse(word: Label): void;
    fieldsAllFilled(): boolean;

    idiom: typeof idiom;
    filterChoice : {
        levels: Label[],
        disciplines: Label[]
    };
    query: { plain_text : any };
    signet: Signet;
}

interface IPublishSignetScope extends ng.IScope {
    vm: IViewModel;
    mainScope: MainScope;
    signetScope: ISignetScope;
}


class Controller implements IViewModel {
    mainScope: MainScope;
    signetScope: ISignetScope;
    idiom: typeof idiom;
    filterChoice : {
        levels : Label[],
        disciplines : Label[]
    }
    query: { plain_text : any };
    signet: Signet;

    constructor(private $scope: IPublishSignetScope,
                private $timeout: ITimeoutService) {
        this.$scope.vm = this;
        let mediacentreScope : any = angular.element(document.getElementsByClassName("mediacentre-v2")).scope();
        this.mainScope = (<MainScope> mediacentreScope['mc']);
        this.signet = mediacentreScope['signet'];
        this.signetScope = (<ISignetScope> angular.element(document.getElementById("signet-controller")).scope());

        this.idiom = idiom;
        this.signet.owner_id = model.me.userId;
        this.filterChoice = {
            levels : [],
            disciplines : []
        };

    }

    $onInit = () : void => {
        this.mainScope.levels.all.forEach((level: Label) => {
            this.signet.levels.all.forEach((level_signet: Label) => {
                if(level.label == level_signet.label)
                    this.filterChoice.levels.push(level);
            });
        });
        this.mainScope.disciplines.all.forEach((level: Label) => {
            this.signet.disciplines.all.forEach((level_signet: Label) => {
                if(level.label == level_signet.label)
                    this.filterChoice.disciplines.push(level);
            });
        });
        Utils.safeApply(this.$scope);
    };

    /**
     * Create a signet
     */
    publishSignet = async (): Promise<void> => {
        if (this.fieldsAllFilled()) {
            if (this.mainScope.query && this.mainScope.query.plain_text.length > 0) {
                this.addSingleKeyWord();
            }
            let finalSignet = new SignetBody(this.signet);
            finalSignet.plain_text = this.signet.plain_text.all;
            finalSignet.disciplines = this.filterChoice.disciplines;
            finalSignet.levels = this.filterChoice.levels;
            finalSignet.published = !!this.signet.published;
            try {
                await signetService.publish(finalSignet.toJson());
                await this.signetScope.vm.signets.sync();
                switch (this.signetScope.vm.folder) {
                    case "mine":
                        this.signetScope.vm.signets.all = this.signetScope.vm.signets.all.filter(signet => !signet.archived && signet.owner_id === model.me.userId);
                        break;
                    case "shared":
                        this.signetScope.vm.signets.all = this.signetScope.vm.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
                        break;
                    case "archived":
                        this.signetScope.vm.signets.all = this.signetScope.vm.signets.all.filter(signet => signet.archived);
                        break;
                    default : this.signetScope.vm.openFolder('mine'); break;
                }
                this.signetScope.vm.closeSignetLightbox();

            } catch (e) {
                console.log("erreur", e.data.message);
            }
            Utils.safeApply(this.$scope);
        } else {
            notify.error(idiom.translate("mediacentre.error.info"));
        }
        Utils.safeApply(this.$scope);
    };

    addSingleKeyWord = () : void => {
        if (this.mainScope.query.plain_text.trim()!= ""){
            if (!this.mainScope.query.plain_text) {
                this.mainScope.query.plain_text = new Labels();
            }
            this.signet.plain_text.push(new Label(undefined, this.mainScope.query.plain_text.trim()));
            Utils.safeApply(this.$scope);
        }
    };

    addKeyWord = (event) : void => {
        if ((event.keyCode == 59 || event.key == "Enter") && this.query.plain_text.trim()!= "") {
            if (!this.signet.plain_text) {
                this.signet.plain_text = new Labels();
            }
            this.signet.plain_text.all.push(new Label(undefined, this.query.plain_text.trim()));
            this.query.plain_text = "";
            Utils.safeApply(this.$scope);
        }
    };
    removeLevelFromCourse = (level: Label) : void => {
        this.filterChoice.levels = _.without(this.filterChoice.levels, level);
    };

    removeDisciplineFromCourse = (discipline: Label) : void => {
        this.filterChoice.disciplines = _.without(this.filterChoice.disciplines, discipline);
    };

    removeWordFromCourse = (word: Label) : void => {
        this.signet.plain_text.all = _.without(this.signet.plain_text.all, word);
        if(this.signet.plain_text.all.length == 0) {
            this.signet.plain_text = new Labels();
            this.signet.plain_text.all = [];
        }
    };

    fieldsAllFilled = () : boolean =>{
        return this.filterChoice.disciplines.length > 0 && this.filterChoice.levels.length > 0;
    }

    $onDestroy = () : void => {
        this.filterChoice = {
            levels : [],
            disciplines : []
        };
        this.signet.plain_text.all = [];


        Utils.safeApply(this.$scope);
    };

};

export const publishSignetController = ng.controller('publishSignetController', ['$scope', '$timeout', Controller]);