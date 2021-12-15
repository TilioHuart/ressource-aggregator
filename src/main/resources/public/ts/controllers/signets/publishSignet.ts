import {model, ng, notify, idiom as i18n, _, template} from "entcore";
import {Utils} from "../../utils/Utils";
import {Label, Labels} from "../../model/Label";
import {signetService} from "../../services/SignetService";

export const publishSignetController = ng.controller('publishSignetController', ['$scope', '$timeout',
    ($scope) => {
        $scope.signet.owner_id = model.me.userId;
        $scope.filterChoice = {
            levels : [],
            disciplines : []
        };

        const init = async () : Promise<void> => {
            $scope.levels.all.forEach(level => {
                $scope.signet.levels.all.forEach(level_signet => {
                    if(level.label == level_signet.label)
                        $scope.filterChoice.levels.push(level);
                });
            });
            $scope.disciplines.all.forEach(level => {
                $scope.signet.disciplines.all.forEach(level_signet => {
                    if(level.label == level_signet.label)
                        $scope.filterChoice.disciplines.push(level);
                });
            });
            $scope.safeApply();
        };

        /**
         * Create a signet
         */
        $scope.publishSignet = async (): Promise<void> => {
            if ($scope.fieldsAllFilled()) {
                $scope.signet.plain_text = $scope.signet.plain_text.all;
                $scope.signet.disciplines = $scope.filterChoice.disciplines;
                $scope.signet.levels = $scope.filterChoice.levels;
                await signetService.publish($scope.signet).then(async (): Promise<void> => {
                    await $scope.vm.signets.sync();
                    switch ($scope.vm.folder) {
                        case "mine":
                            $scope.vm.signets.all = $scope.vm.signets.all.filter(signet => !signet.archived && signet.owner_id === model.me.userId);
                            break;
                        case "shared":
                            $scope.vm.signets.all = $scope.vm.signets.all.filter(signet => !signet.archived && signet.collab && signet.owner_id != model.me.userId);
                            break;
                        case "archived":
                            $scope.vm.signets.all = $scope.vm.signets.all.filter(signet => signet.archived);
                            break;
                        default : $scope.vm.openFolder('mine'); break;
                    }
                    $scope.vm.closeSignetLightbox();
                    await Utils.safeApply($scope);
                });
            } else {
                notify.error(i18n.translate("mediacentre.error.info"));
            }
            await Utils.safeApply($scope);
        };


        $scope.addKeyWord = (event) => {
            if (event.keyCode == 59 || event.key == "Enter") {
                if ($scope.query.plain_text.trim()!= ""){
                    if (!$scope.signet.plain_text) {
                        $scope.signet.plain_text = new Labels();
                    }
                    $scope.signet.plain_text.all.push(new Label(undefined, $scope.query.plain_text.trim()));
                    $scope.query.plain_text = "";
                    Utils.safeApply($scope);
                }
            }
        };
        $scope.removeLevelFromCourse = (level: Label) => {
            $scope.filterChoice.levels = _.without($scope.filterChoice.levels, level);
        };

        $scope.removeDisciplineFromCourse = (discipline: Label) => {
            $scope.filterChoice.disciplines = _.without($scope.filterChoice.disciplines, discipline);
        };

        $scope.removeWordFromCourse = (word: Label) => {
            $scope.signet.plain_text.all = _.without($scope.signet.plain_text.all, word);
            if($scope.signet.plain_text.all.length == 0) {
                $scope.signet.plain_text = new Labels();
                $scope.signet.plain_text.all = [];
            }
        };

        $scope.fieldsAllFilled = () => {
            return $scope.signet.plain_text.all.length > 0 &&
                   $scope.filterChoice.disciplines.length > 0 && $scope.filterChoice.levels.length > 0;
        }

        init();
    }]);
