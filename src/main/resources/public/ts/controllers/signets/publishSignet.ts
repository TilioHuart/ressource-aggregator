import {model, ng, notify, idiom as i18n, _, template} from "entcore";
import {Utils} from "../../utils/Utils";
import {Label, Labels} from "../../model/Label";
import {signetService} from "../../services/SignetService";

export const publishSignetController = ng.controller('publishSignetController', ['$scope', '$timeout',
    ($scope) => {
        $scope.levels = new Labels();
        $scope.levels.sync("levels");
        $scope.disciplines = new Labels();
        $scope.disciplines.sync("disciplines");
        $scope.signet.owner_id = model.me.userId;

        /**
         * Create a signet
         */
        $scope.publishSignet = async (): Promise<void> => {
            if ($scope.signet.title.length >= 4) {
                $scope.signet.plain_text = $scope.signet.plain_text.all;
                await signetService.publish($scope.signet).then(async (): Promise<void> => {
                    await $scope.vm.signets.sync();
                    Utils.safeApply($scope);
                    $scope.vm.closePublishSignetLightbox();
                });
            } else {
                notify.error(i18n.translate("moodle.info.short.title"));
            }
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
    }]);
