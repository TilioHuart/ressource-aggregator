import {ng} from 'entcore';
import {Scope} from './main'
import {Frame, Resource} from '../model';

interface ViewModel {
    textbooks: Resource[];
}

interface EventResponses {
    textbooks_Result(frame: Frame): void;
}

export const homeController = ng.controller('HomeController', ['$scope', 'route', function ($scope: Scope) {
    const vm: ViewModel = this;
    vm.textbooks = [];

    $scope.ws.onmessage = (message) => {
        const {event, state, data, status} = JSON.parse(message.data);
        if ("ok" !== status) {
            throw data.error;
        }
        if (event in eventResponses) eventResponses[event](new Frame(event, state, data));
    };

    const eventResponses: EventResponses = {
        textbooks_Result: function (frame) {
            vm.textbooks = frame.data.textbooks;
            $scope.safeApply();
        }
    };

    function initHomePage() {
        $scope.ws.send(new Frame('textbooks', 'get', {}));
    }

    if ($scope.ws.connected) {
        initHomePage();
    } else {
        $scope.ws.onopen = initHomePage;
    }
}]);
