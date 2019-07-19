import {idiom, ng, template} from 'entcore';
import {ILocationService, IRootScopeService} from "angular";
import {Frame, Resource, Socket} from '../model';

export interface Scope extends IRootScopeService {
	ws: Socket;
	loaders: any;
	idiom: any;
	safeApply(): void;

	mc: MainController;
}

export interface MainController {
	textbooks: Resource[];
	search: {
		plain_text: {
			text: string
		},
		advanced: {
			show: boolean,
			fields: Array<{ name: string, comparator: boolean }>,
			values: object
		}
	};

	plainTextSearch(): void;

	advancedSearch(): void;

	initField(field: { name: string, comparator: boolean }): void;

	openAdvancedSearch(): void;

	closeAdvancedSearch(): void;
}

export const mainController = ng.controller('MainController', ['$scope', 'route', '$location',
	function ($scope: Scope, route, $location: ILocationService) {
		const mc: MainController = this;
		mc.textbooks = [];
		mc.search = {
			plain_text: {
				text: ''
			},
			advanced: {
				show: false,
				fields: [
					{name: 'title', comparator: false},
					{name: 'authors', comparator: true},
					{name: 'editors', comparator: true},
					{name: 'disciplines', comparator: true},
					{name: 'levels', comparator: true}
				],
				values: {}
			}
		};
		$scope.idiom = idiom;
		$scope.ws = new Socket();
		$scope.ws.onopen = (event) => {
			console.info(`WebSocket opened on ${$scope.ws.host}`, event);
		};

		const startResearch = function (state: string, data: any) {
			$location.path(`/search/${state.toLowerCase()}`);
			$scope.ws.send(new Frame('search', state, data));
			$scope.$broadcast('search', {state, data});
		};

		mc.plainTextSearch = function () {
			if (mc.search.plain_text.text.trim() === '') return;
			startResearch('PLAIN_TEXT', {query: mc.search.plain_text.text});
		};

		mc.advancedSearch = function () {
			const {values} = mc.search.advanced;
			let data = {};
			mc.search.advanced.fields.forEach((field) => {
				let t = {};
				if (values[field.name].value.trim() !== '') {
					t[field.name] = values[field.name];
				}
				data = {
					...data,
					...t
				}
			});
			if (Object.keys(data).length === 0) return;
			startResearch('ADVANCED', data);
			mc.search.advanced.show = false;
		};

		mc.initField = function ({name, comparator}) {
			mc.search.advanced.values[name] = {
				value: '',
				...comparator ? {comparator: '$or'} : {}
			}
		};

		mc.openAdvancedSearch = function () {
			mc.search.advanced.fields.forEach((field) => mc.initField(field));
			mc.search.plain_text.text = '';
			mc.search.advanced.show = true;
		};

		mc.closeAdvancedSearch = function () {
			mc.search.advanced.show = false;
			mc.search.advanced.values = {};
		};

		route({
			home: () => {
				mc.search = {...mc.search, plain_text: {text: ''}};
				template.open('main', 'home');
			},
			searchPlainText: () => template.open('main', 'search'),
			searchAdvanced: () => template.open('main', 'search')
		});

		$scope.safeApply = function () {
			let phase = $scope.$root.$$phase;
			if (phase !== '$apply' && phase !== '$digest') {
				$scope.$apply();
			}
		}
	}]);
