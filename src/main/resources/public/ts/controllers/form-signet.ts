import {idiom, ng, notify} from 'entcore';
import {Signet} from "../model/Signet";
import {signetService} from "../services/SignetService";

interface ViewModel {
    signet: Signet;
    save() : Promise<void>;
    getImage() : void;
}


export const signetPropController = ng.controller('signetPropController', ['$scope', 'SignetService',
    function ($scope) {

        const vm: ViewModel = this;
        vm.signet = new Signet();

        const init = async () : Promise<void> => {
            vm.signet = $scope.signet;
            $scope.safeApply();
        };

        // Functions

        vm.save = async () : Promise<void> => {
            let signet = new Signet();
            signet.setFromJson(await signetService.save(vm.signet));
            $scope.redirectTo(`/signet/${signet.id}/edit`);
            $scope.safeApply();
        };

        vm.getImage = async () : Promise<void> => {
            if (vm.signet.image) {
                await vm.signet.setInfoImage();
                // window.setTimeout(function() {
                //     if(!vm.signet.infoImg.compatible) {
                //         notify.error(idiom.translate('signetulaire.image.incompatible'));
                //     }
                // }, 2000)
            }
            $scope.safeApply();
        };

        init();
    }]);