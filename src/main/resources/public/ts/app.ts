import {ng, routes} from 'entcore';
import * as controllers from './controllers';
import * as directives from './directives';

for(let controller in controllers){
    ng.controllers.push(controllers[controller]);
}

for (let directive in directives) {
	ng.directives.push(directives[directive]);
}

routes.define(function($routeProvider){
	$routeProvider
		.when('/', {
			action: 'home'
		})
		.when('/search/plain_text', {
			action: 'searchPlainText'
		})
		.when('/search/advanced', {
			action: 'searchAdvanced'
		})
		.otherwise({
			redirectTo: '/'
		});
});