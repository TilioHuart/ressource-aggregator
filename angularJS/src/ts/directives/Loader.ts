import {ng} from 'entcore'

export const Loader = ng.directive('loader', function () {
    return {
        restrict: 'E',
        scope: {
            active: '=',
        },
        template: `
            <div class="loader" ng-class="{active: active}">
                 <div class="loader-bubble"></div>
                <div class="loader-bubble"></div>       
            </div>
        `,
        link: function (scope) {
            scope.$watch(() => scope.active, scope.$apply);
        }
    }
});