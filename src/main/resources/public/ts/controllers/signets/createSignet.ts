import {model, ng, notify, idiom as i18n, _, template} from "entcore";
import {Utils} from "../../utils/Utils";
import {Label, Labels} from "../../model/Label";
import {signetService} from "../../services/SignetService";

export const createSignetController = ng.controller('createSignetController', ['$scope', '$timeout',
    ($scope) => {
        $scope.levels = new Labels();
        $scope.levels.sync("levels");
        $scope.disciplines = new Labels();
        $scope.disciplines.sync("disciplines");
        $scope.signet.owner_id = model.me.userId;

        /**
         * Create a signet
         */
        $scope.createSignet = async (): Promise<void> => {
            if ($scope.signet.title.length >= 4) {
/*
                $scope.show.submitWait = true;

*/
                $scope.signet.plain_text = $scope.signet.plain_text.all;
                $scope.signet.id = uuidv();
                await signetService.create($scope.signet)
                    .then(async (): Promise<void> => {
                        $scope.showToaster();
/*
                        await $scope.signets.getCoursesByUser(model.me.userId); */
                        await $scope.vm.signets.sync();
                        $scope.mc.onCloseSignetPopUp();
                    })
                    .catch((): boolean => /*$scope.show.submitWait = */$scope.display.lightbox.signet = false);
            } else
                notify.error(i18n.translate("moodle.info.short.title"));
            await Utils.safeApply($scope);
        };

        $scope.removeLevelFromCourse = (level: Label) => {
            $scope.signet.levels = _.without($scope.signet.levels, level);
        };

        $scope.removeDisciplineFromCourse = (discipline: Label) => {
            $scope.signet.disciplines = _.without($scope.signet.disciplines, discipline);
        };

        $scope.addKeyWord = (event) => {
            if (event.keyCode == 59 || event.key == "Enter") {
                if ($scope.query.plain_text.trim()!= ""){
                    if (!!!$scope.signet.plain_text) {
                        $scope.signet.plain_text = new Labels();
                    }
                    $scope.signet.plain_text.all.push(new Label(undefined, $scope.query.plain_text.trim()));
                    $scope.query.plain_text = "";
                    Utils.safeApply($scope);
                }
            }
        };

        $scope.removeWordFromCourse = (word: Label) => {
            $scope.signet.plain_text = _.without($scope.signet.plain_text, word);
            if($scope.signet.plain_text.length == 0) {
                $scope.signet.plain_text = new Labels();
                $scope.signet.plain_text.all = [];
            }
        };
/*        /!**
         * get info image
         *!/
        $scope.getTypeImage = function () {
            if ($scope.signet.imageurl) {
                $scope.signet.setInfoImg();
                $timeout(() =>
                        $scope.show.imgCompatibleMoodle = $scope.signet.infoImg.compatibleMoodle
                    , 1000)
            }
            Utils.safeApply($scope);
        };*/
        function uuidv() {
            return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }]);
