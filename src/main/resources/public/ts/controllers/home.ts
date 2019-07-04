import {ng} from 'entcore';
import {Scope} from './main'

interface ViewModel {

}

export const homeController = ng.controller('HomeController', ['$scope', 'route', function ($scope: Scope) {
    const vm: ViewModel = this;
}]);
