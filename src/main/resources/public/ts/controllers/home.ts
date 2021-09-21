import {model, ng} from 'entcore';
import {Scope} from './main'
import {Frame, Resource} from '../model';
import {ILocationService} from "angular";
import {Signets} from "../model/Signet";

interface ViewModel {
    signetLimit: number;
    signets: Signets;
    mobile: boolean;
    resourceLimit: number;
    loaders: any;
    resources: Resource[];
    textbooks: Resource[];
    publicSignets: Resource[];
    sharedSignets: Resource[];
    orientationSignets: Resource[];
    displayedResources: Resource[];

    refreshTextBooks(): void;
    seeMyExternalResource(): void;
    goSignet(): void;
}

interface EventResponses {
    favorites_Result(frame: Frame): void;
    textbooks_Result(frame: Frame): void;
    search_Result(frame: Frame): void;
    signets_Result(frame: Frame): void;
}


export const homeController = ng.controller('HomeController', ['$scope', 'route', '$location',
    function ($scope: Scope, route, $location: ILocationService) {
        const vm: ViewModel = this;
        $scope.safeApply();
        vm.textbooks = [];
        vm.publicSignets = [];
        vm.sharedSignets = [];
        vm.signets = new Signets();
        vm.displayedResources = JSON.parse("[ { \"authors\": [ \"SUZETTE DIE\" ], \"date\": 1627466191009, \"description\": \"\", \"disciplines\": [ \"\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZETTE DIE\" ], \"favorite\": false, \"id\": \"1386\", \"image\": \"-\", \"levels\": [ \"\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1386\", \"plain_text\": [ \"\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"Cours de mathématiques_2021-07-28\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1386\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"Cours de mathématiques_2021-07-28\", \"hash\": 1510560 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1610114581044, \"description\": \"Duplication test\", \"disciplines\": [ \"\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1213\", \"image\": \"https://moodle-dev.support-ent.fr/pluginfile.php/2686/course/overviewfiles/e53bf490-a003-4548-96b4-ccae6bf35d62.jpg\", \"levels\": [ \"\" ], \"link\": \"https://ng1.support-ent.fr/moodle/course/share/BP/1213\", \"plain_text\": [ \"test\", \"samuel\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"Disney_2021-01-08\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1213\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"Disney_2021-01-08\", \"hash\": 1509379 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1620982051067, \"description\": \"\", \"disciplines\": [ \"activités pluridisciplinaires\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1292\", \"image\": \"https://moodle-dev.support-ent.fr/pluginfile.php/3012/course/overviewfiles/03592773-53b9-46a4-ab44-dc0ea606a3ff\", \"levels\": [ \"1re générale et technologique\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1292\", \"plain_text\": [ \"test\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"image3_2021-05-14\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1292\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"image3_2021-05-14\", \"hash\": 1509626 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1622110470797, \"description\": \"vdf\", \"disciplines\": [ \"agroéquipements\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1300\", \"image\": \"https://moodle-dev.support-ent.fr/pluginfile.php/3050/course/overviewfiles/08645290-cc48-451d-b888-a554889d61f3\", \"levels\": [ \"2de générale et technologique\", \"voie BP\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1300\", \"plain_text\": [ \"test\", \"samuel\", \"coucou\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"imagetes_2021-05-27\", \"key_words\": [], \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1300\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"imagetes_2021-05-27\", \"hash\": 1510306 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1622110440724, \"description\": \"vdf\", \"disciplines\": [], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1299\", \"image\": \"https://moodle-dev.support-ent.fr/pluginfile.php/3048/course/overviewfiles/08645290-cc48-451d-b888-a554889d61f3\", \"levels\": [ \"2de professionnelle\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1299\", \"plain_text\": [ \"\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"imagetes_2021-05-27\", \"key_words\": [], \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1299\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"imagetes_2021-05-27\", \"hash\": 1509633 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1622195850701, \"description\": \"vdf\", \"disciplines\": [ \"agroéquipements\", \"aide individuelle en mathématiques\", \"aménagement paysager\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1306\", \"image\": \"https://moodle-dev.support-ent.fr/pluginfile.php/3066/course/overviewfiles/08645290-cc48-451d-b888-a554889d61f3\", \"levels\": [ \"1re générale et technologique\", \"1re professionnelle\", \"2de professionnelle\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1306\", \"plain_text\": [ \"samu\", \"test\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"imagetes_2021-05-28\", \"key_words\": [], \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1306\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"imagetes_2021-05-28\", \"hash\": 1510312 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1620721621112, \"description\": \"les crêpes c'est la vie\", \"disciplines\": [ \"aménagement paysager\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1280\", \"image\": \"-\", \"levels\": [ \"voie BEP\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1280\", \"plain_text\": [ \"ts\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"Nouveau cours_2021-05-11\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1280\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"Nouveau cours_2021-05-11\", \"hash\": 1509593 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1622464860651, \"description\": \"blabla\", \"disciplines\": [ \"\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1312\", \"image\": \"https://moodle-dev.support-ent.fr/pluginfile.php/3081/course/overviewfiles/c91e766a-6b4f-4417-bdbe-83148f9ce162\", \"levels\": [ \"\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1312\", \"plain_text\": [ \"\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"Parcours Mobile_2021-05-31\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1312\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"Parcours Mobile_2021-05-31\", \"hash\": 1510339 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1622194500648, \"description\": \"\", \"disciplines\": [ \"français\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1305\", \"image\": \"https://moodle-dev.support-ent.fr/pluginfile.php/3064/course/overviewfiles/91d57079-4adc-4021-93b9-db777c62e130\", \"levels\": [ \"1re générale et technologique\", \"1re professionnelle\", \"2de générale et technologique\", \"2de professionnelle\", \"terminale générale et technologique\", \"terminale professionnelle\", \"voie BEP\", \"voie BMA\", \"voie BP\", \"voie BT\", \"voie BTM\", \"voie CAP\", \"voie FC\", \"voie MC\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1305\", \"plain_text\": [ \"toto\", \"tutu\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"Publication_2021-05-28\", \"key_words\": [ \"test,\", \"test;\", \"test;te\", \"t,\" ], \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1305\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"Publication_2021-05-28\", \"hash\": 1510311 }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1620651270732, \"description\": \"test\", \"disciplines\": [ \"activités pluridisciplinaires\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1278\", \"image\": \"-\", \"levels\": [ \"1re générale et technologique\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1278\", \"plain_text\": [ \"t\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"test image_2021-05-10\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1278\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } }, \"displayTitle\": \"test image_2021-05-10\", \"hash\": 1509570 }, { \"authors\": [ \"SOFIANE TEST\" ], \"date\": 1623069330840, \"description\": \"\", \"disciplines\": [ \"\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SOFIANE TEST\" ], \"favorite\": false, \"id\": \"1330\", \"image\": \"-\", \"levels\": [ \"\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1330\", \"plain_text\": [ \"\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"Test_2021-06-07\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1330\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } } }, { \"authors\": [ \"WIDED BAAZIZ\" ], \"date\": 1622733420873, \"description\": \"\", \"disciplines\": [ \"\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"WIDED BAAZIZ\" ], \"favorite\": false, \"id\": \"1317\", \"image\": \"-\", \"levels\": [ \"\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1317\", \"plain_text\": [ \"\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"Test_delete_2021-06-03\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1317\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } } }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1610117070669, \"description\": \"\", \"disciplines\": [ \"\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1214\", \"image\": \"-\", \"levels\": [ \"\" ], \"link\": \"https://ng1.support-ent.fr/moodle/course/share/BP/1214\", \"plain_text\": [ \"\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"testDupliA_2021-01-08\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1214\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } } }, { \"authors\": [ \"SUZIE DIE\" ], \"date\": 1622126010763, \"description\": \"\", \"disciplines\": [ \"activités pluridisciplinaires\", \"agronomie\", \"agroéquipements\", \"aide individuelle en français\", \"aide individuelle en mathématiques\", \"aménagement paysager\", \"aménagements des espaces naturels\", \"animalerie\", \"aquaculture\", \"arts\", \"biochimie\", \"biochimie-microbiologie\", \"biochimie-microbiologie-biotechnologie\", \"biologie\", \"biologie animale\", \"biologie végétale\", \"biologie-écologie\", \"chimie\", \"comptabilité-bureautique\", \"documentation\", \"E.P.S.\", \"enseignement technologique et professionnel\", \"français\", \"français-documentation\", \"français-philosophie\", \"gestion\", \"grec\", \"génie alimentaire\", \"génie des procédés (IAA)\", \"génie industriel\", \"géographie\", \"heures de vie de classe\", \"hippologie\", \"hippologie-équitation\", \"histoire, géographie, instruction civique\", \"histoire-géographie\", \"histoire-géographie-éducation civique\", \"hygiène-prévention-secourisme\", \"informatique\", \"langues vivantes de l'enseignement agricole\", \"latin\", \"machinisme\", \"maréchalerie\", \"mathématiques\", \"mathématiques-informatique\", \"mercatique\", \"microbiologie\", \"philosophie\", \"physique\", \"physique appliquée\", \"physique-chimie\", \"pratiques professionnelles\", \"pratiques sociales et culturelles\", \"productions animales\", \"productions horticoles\", \"productions végétales\", \"projet professionnel\", \"prévention santé environnementale\", \"sciences et techniques\", \"sciences et techniques aquacoles\", \"sciences et techniques des agroéquipements\", \"sciences et techniques horticoles\", \"sciences et technologie des équipements\", \"sciences économiques\", \"sciences économiques et humaines\", \"sciences économiques et sociales\", \"sciences économiques et sociales, gestion\", \"secrétariat-bureautique\", \"statistiques\", \"SVT\", \"techniques animalières\", \"techniques commerciales\", \"techniques de communication\", \"techniques de documentation\", \"techniques forestières\", \"techniques économiques\", \"technologie aquacole\", \"technologie informatique et de communication\", \"tourisme innovation management (TIM)\", \"viticulture\", \"viticulture-œnologie\", \"zootechnie\", \"zootechnie-hippologie\", \"écologie\", \"écologie, agronomie, territoire et développement durable\", \"économie d'entreprise\", \"économie sociale et familiale\", \"économie-droit\", \"éducation civique, juridique et sociale\", \"éducation socioculturelle\", \"équipements agroalimentaires\", \"équipements hydrauliques\", \"équitation\", \"œnologie\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"SUZIE DIE\" ], \"favorite\": false, \"id\": \"1304\", \"image\": \"-\", \"levels\": [ \"1re générale et technologique\", \"1re professionnelle\", \"2de générale et technologique\", \"2de professionnelle\", \"terminale générale et technologique\", \"terminale professionnelle\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1304\", \"plain_text\": [ \"test\", \"test2\", \"test3\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"titi_2021-05-27\", \"key_words\": [], \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1304\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } } }, { \"authors\": [ \"YASAMINA MURCIA\" ], \"date\": 1620319650678, \"description\": \"bfdxgcf\", \"disciplines\": [ \"aménagement paysager\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"YASAMINA MURCIA\" ], \"favorite\": true, \"id\": \"1258\", \"image\": \"-\", \"levels\": [ \"terminale professionnelle\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1258\", \"plain_text\": [ \"test\", \"soirée\", \"lol\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"vdffg_2021-05-06_2021-05-06\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1258\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } } }, { \"authors\": [ \"YASAMINA MURCIA\" ], \"date\": 1620313950630, \"description\": \"bfdxgcf\", \"disciplines\": [ \"\" ], \"document_types\": [ \"Parcours Moodle\" ], \"editors\": [ \"YASAMINA MURCIA\" ], \"favorite\": false, \"id\": \"1257\", \"image\": \"-\", \"levels\": [ \"\" ], \"link\": \"https://ng2.support-ent.fr/moodle/course/share/BP/1257\", \"plain_text\": [ \"\" ], \"source\": \"fr.openent.mediacentre.source.Moodle\", \"title\": \"vdffg_2021-05-06_2021-05-06\", \"action\": { \"label\": \"fr.openent.mediacentre.source.Moodle.action.duplicate\", \"url\": \"/moodle/course/duplicate/BP/1257\", \"method\": \"POST\", \"message\": { \"success\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.success\", \"error\": \"fr.openent.mediacentre.source.Moodle.action.duplicate.error\" } } } ]");
        vm.mobile = screen.width < $scope.mc.screenWidthLimit;
        vm.resourceLimit = vm.mobile ? 6 : 12;
        vm.signetLimit = vm.mobile ? 4 : 8;

        $scope.$on('deleteFavorite', function (event, id) {
            $scope.mc.favorites = $scope.mc.favorites.filter(el => el.id !== id);
            if(vm.textbooks.findIndex(el => el.id == id) != -1) {
                vm.textbooks[vm.textbooks.findIndex(el => el.id == id)].favorite = false;
            } else if(vm.publicSignets.findIndex(el => el.id == id) != -1) {
                vm.publicSignets[vm.publicSignets.findIndex(el => el.id == id)].favorite = false;
            } else if(vm.orientationSignets.findIndex(el => el.id == id) != -1) {
                vm.orientationSignets[vm.orientationSignets.findIndex(el => el.id == id)].favorite = false;
            }
        });

        $scope.$on('addFavorite', function (event, resource) {
            $scope.mc.favorites.push(resource);
        });

        $scope.ws.onmessage = (message) => {
            const {event, state, data, status} = JSON.parse(message.data);
            if ("ok" !== status) {
                throw data.error;
            }
            if (event in eventResponses) eventResponses[event](new Frame(event, state, [], data));
        };

        const eventResponses: EventResponses = {
            textbooks_Result: function (frame) {
                vm.textbooks = frame.data.textbooks;
                $scope.safeApply();
            },
            favorites_Result: function (frame) {
                if (Object.keys(frame.data).length === 0) {
                    $scope.mc.favorites = []
                } else {
                    $scope.mc.favorites = frame.data;
                    $scope.mc.favorites.map((favorite) => {
                        favorite.favorite = true;
                    });
                }
                $scope.safeApply();
            },
            search_Result: function (frame) {
                vm.displayedResources = frame.data.resources;
                $scope.safeApply();
            },
            signets_Result: async function (frame) {
                await vm.signets.sync();
                vm.signets.all = vm.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
                vm.signets.all.forEach(signet => {
                    let signet_shared = <Resource> signet.toJson();
                    let disciplinesArray:string[] = [];
                    let levelsArray:string[] = [];
                    let plaintextArray:string[] = [];
                    if(!!signet.disciplines) {
                        signet.disciplines.forEach(function (discipline) {
                            if(!!discipline[1]) {
                                disciplinesArray.push(discipline[1]);
                            }
                        });
                    }
                    signet_shared.disciplines = disciplinesArray;
                    if(!!signet.levels) {
                        signet.levels.forEach(function (level) {
                            if(!!level[1]) {
                                levelsArray.push(level[1]);
                            }
                        });
                    }
                    signet_shared.levels = levelsArray;
                    if(!!signet.plain_text) {
                        signet.plain_text.forEach(function (word) {
                            if(!!word[1]) {
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
                    vm.sharedSignets.push((signet_shared));
                });
                vm.publicSignets = frame.data.signets.resources.filter(el => el.document_types[0] === "Signet");
                vm.publicSignets = vm.publicSignets.concat(vm.sharedSignets.filter(el => el.document_types[0] === "Signet"));
                vm.orientationSignets = frame.data.signets.resources.filter(el => el.document_types[0] === "Orientation");
                vm.orientationSignets = vm.orientationSignets.concat(vm.sharedSignets.filter(el => el.document_types[0] === "Orientation"));
                $scope.safeApply();
            }
        };

        vm.refreshTextBooks = (): void => {
            vm.textbooks = [];
            $scope.safeApply();
            $scope.ws.send(new Frame('textbooks', 'refresh', [], {}));
        };

        vm.seeMyExternalResource = (): void => {
            $scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
            $location.path(`/search/plain_text`);
        };

        vm.goSignet = (): void => {
            $location.path(`/signet/`);
        };

        function initHomePage() {
            $scope.ws.send(new Frame('textbooks', 'get', [], {}));
            $scope.ws.send(new Frame('favorites', 'get', [], {}));
            $scope.ws.send(new Frame('search', 'PLAIN_TEXT', ['fr.openent.mediacentre.source.GAR'], {"query": ".*"}));
            $scope.ws.send(new Frame('signets', 'get', ['fr.openent.mediacentre.source.Signet'], {}));
            $scope.safeApply();
        }

        if ($scope.ws.connected) {
            initHomePage();
        } else {
            $scope.ws.onopen = initHomePage;
        }
    }]);
