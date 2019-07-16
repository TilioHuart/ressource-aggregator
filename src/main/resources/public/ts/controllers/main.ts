import {idiom, ng, template, toasts} from 'entcore';
import {ILocationService, IRootScopeService} from "angular";
import {Frame, Resource, Socket} from '../model';

export interface Scope extends IRootScopeService {
	ws: Socket;
	loaders: any;
	resources: Resource[];
	idiom: any;
	safeApply(): void;
}

export interface ViewModel {
	search: {
		text: string
	};

	plainTextSearch(): void;
}

export const mainController = ng.controller('MainController', ['$scope', 'route', '$location',
	function ($scope: Scope, route, $location: ILocationService) {
		const vm: ViewModel = this;
		vm.search = {
			text: ''
		};
		$scope.idiom = idiom;
		$scope.ws = new Socket();
		$scope.ws.onopen = (event) => console.info(`WebSocket opened on ${$scope.ws.host}`, event);
		$scope.ws.onerror = function (event) {
			toasts.warning('mediacentre.socket.error');
			throw event;
		};

		vm.plainTextSearch = function () {
			if (vm.search.text.trim() === '') return;
			$location.path('/search/simple');
			$scope.ws.send(new Frame('search', 'PLAIN_TEXT', {query: vm.search.text}));
			$scope.$broadcast('search', {state: 'PLAIN_TEXT', data: {query: vm.search.text}});
		};

		route({
			home: () => {
				vm.search = {...vm.search, text: ''};
				template.open('main', 'home');
			},
			searchSimple: () => template.open('main', 'search'),
			searchAdvanced: () => template.open('main', 'search')
		});

		$scope.safeApply = function () {
			let phase = $scope.$root.$$phase;
			if (phase !== '$apply' && phase !== '$digest') {
				$scope.$apply();
			}
		}
	}]);
