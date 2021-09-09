import {model, ng, notify, idiom as i18n, _, template} from "entcore";
import {Utils} from "../../utils/Utils";
import {Label, Labels} from "../../model/Label";
import {signetService} from "../../services/SignetService";

export const createSignetController = ng.controller('createSignetController', ['$scope', '$timeout',
    ($scope) => {
        $scope.signet.owner_id = model.me.userId;

        /**
         * Create a signet
         */
        $scope.createSignet = async (): Promise<void> => {
            if ($scope.signet.title.length >= 4) {
                $scope.signet.plain_text = $scope.signet.plain_text.all;
                $scope.signet.id = uuidv();
                await signetService.create($scope.signet).then(async (): Promise<void> => {
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
                        Utils.safeApply($scope);
                        $scope.mc.onCloseSignetPopUp();
                    });
            } else {
                notify.error(i18n.translate("moodle.info.short.title"));
            }
            await Utils.safeApply($scope);
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
