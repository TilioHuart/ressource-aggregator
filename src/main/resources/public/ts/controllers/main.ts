import {idiom, ng, template} from 'entcore';
import {ILocationService, IRootScopeService} from "angular";
import {Frame, Resource, Socket} from '../model';

declare const window: any;

export interface Scope extends IRootScopeService {
	ws: Socket;
	loaders: any;
	idiom: any;

	safeApply(): void;

	mc: MainController;
}

export interface MainController {
	textbooks: Resource[];
	pageSize: number;
	limitTo: number;
	search: {
		plain_text: {
			text: string
		},
		advanced: {
			show: boolean,
			sources: any
			fields: Array<{ name: string, comparator: boolean }>,
			values: object
		}
	};

	plainTextSearch(): void;

	advancedSearch(): void;

	initField(field: { name: string, comparator: boolean }): void;

	openAdvancedSearch(): void;

	closeAdvancedSearch(): void;

	goHome(): void;
}

export const mainController = ng.controller('MainController', ['$scope', 'route', '$location',
	function ($scope: Scope, route, $location: ILocationService) {
		const mc: MainController = this;
		mc.textbooks = [];
		mc.pageSize = 10;
		mc.limitTo = mc.pageSize;
		mc.search = {
			plain_text: {
				text: ''
			},
			advanced: {
				show: false,
				sources: {},
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

		const startResearch = function (state: string, sources: string[], data: any) {
			mc.limitTo = mc.pageSize;
			$location.path(`/search/${state.toLowerCase()}`);
			$scope.ws.send(new Frame('search', state, sources, data));
			$scope.$broadcast('search', {state, data});
		};

		mc.plainTextSearch = function () {
			if (mc.search.plain_text.text.trim() === '') return;
			startResearch('PLAIN_TEXT', [], {query: mc.search.plain_text.text});
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
			let sources: string[] = [];
			Object.keys(mc.search.advanced.sources).forEach(key => {
				if (mc.search.advanced.sources[key]) sources.push(key);
			})
			startResearch('ADVANCED', sources, data);
			mc.search.advanced.show = false;
		};

		mc.initField = function ({name, comparator}) {
			mc.search.advanced.values[name] = {
				value: '',
				...comparator ? {comparator: '$or'} : {}
			}
		};

		mc.openAdvancedSearch = function () {
			mc.search.plain_text.text = '';
			mc.search.advanced.show = true;
			window.sources.forEach(source => mc.search.advanced.sources[source] = true);
		};

		mc.closeAdvancedSearch = function () {
			mc.search.advanced.show = false;
		};

		mc.goHome = function () {
			$location.path('/')
		};

		route({
			home: () => {
				mc.search = {...mc.search, plain_text: {text: ''}};
				mc.search.advanced.values = {};
				mc.search.advanced.fields.forEach((field) => mc.initField(field));
				template.open('main', 'home');
			},
			favorite: () => template.open('main', 'favorite'),
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
