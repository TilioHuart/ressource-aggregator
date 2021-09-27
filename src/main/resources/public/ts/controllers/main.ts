import {_, Behaviours, idiom, model, ng, template} from 'entcore';
import {ILocationService, IRootScopeService} from "angular";
import {Frame, Resource, Socket} from '../model';
import {Signet} from "../model/Signet";
import {signetService} from "../services/SignetService";
import {Label, Labels} from "../model/Label";
import {AxiosResponse} from "axios";

declare const window: any;

export interface Scope extends IRootScopeService {
	isStatusXXX(response: any, status: number): any;
	getDataIf200(response: any): any;
    hasShareRightView(signet: Signet[]): boolean;
    hasShareRightManager(signet: Signet[]): boolean;
	hasSignetRight(): boolean;
    removeLevelFromCourse(level: Label): void;
	removeDisciplineFromCourse(discipline: Label): void;
	removeWordFromCourse(word: Label): void;
    query: any;
    addKeyWord(event: any): void;
    disciplines: Labels;
    levels: Labels;
    displayDate (dateToFormat: Date): string;
	ws: Socket;
	loaders: any;
	idiom: any;
	signet: Signet;
	safeApply(): void;
	redirectTo(path: string): void;
	getSignetWithRights(signetId : number): void;
	mc: MainController;
}

export interface MainController {
	favorites: Resource[];
	textbooks: Resource[];
	pageSize: number;
	limitTo: number;
	displayFavorites: boolean;
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
	columns: number[];
	screenWidthLimit: number;
	favoriteLimit: number;

	infiniteScroll(): void;
	plainTextSearch(): void;
	advancedSearch(): void;
	initField(field: { name: string, comparator: boolean }): void;
	initHeader(): void;
	openAdvancedSearch(): void;
	closeAdvancedSearch(): void;
	goHome(): void;
	goFavorites(): void;
	goSignet(): void;
}

export const mainController = ng.controller('MainController', ['$scope', 'route', '$location', '$timeout',
	function ($scope: Scope, route, $location: ILocationService, $timeout) {
		const mc: MainController = this;
		mc.favorites = [];
		mc.textbooks = [];
		mc.pageSize = 10;
		mc.limitTo = mc.pageSize;
		mc.displayFavorites = false;
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
			$scope.ws.send(new Frame('favorites', 'get', [], {}));
		};
		mc.screenWidthLimit = 600;
		mc.favoriteLimit = screen.width < mc.screenWidthLimit ? 2 : 7;
		$scope.signet = new Signet();
		$scope.levels = new Labels();
		$scope.levels.sync("levels");
		$scope.disciplines = new Labels();
		$scope.disciplines.sync("disciplines");

		const startResearch = async function (state: string, sources: string[], data: any) {
			mc.limitTo = mc.pageSize;
			$location.path(`/search/${state.toLowerCase()}`);
			$timeout(() => {
				$scope.ws.send(new Frame('search', state, sources, data));
				$scope.$broadcast('search', {state, data});
			}, 300);
		};

		mc.infiniteScroll = function () {
			mc.limitTo += mc.pageSize;
		};

		mc.plainTextSearch = function () {
			if (mc.search.plain_text.text.trim() === '') return;
			startResearch('PLAIN_TEXT', [], {query: mc.search.plain_text.text});
		};

		mc.goSignet = (): void => {
			$location.path(`/signet/`);
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
			});
			startResearch('ADVANCED', sources, data);
			mc.search.advanced.show = false;
		};

		mc.initField = function ({name, comparator}) {
			mc.search.advanced.values[name] = {
				value: '',
				...comparator ? {comparator: '$or'} : {}
			}
		};

		mc.initHeader = function () {
			let accueil = document.getElementById('item_1');
			let signets = document.getElementById('item_2');
			if(accueil && signets){
				accueil["checked"] = $location.url() !=  '/signet';
				signets["checked"] = $location.url() ==  '/signet';
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

		mc.goFavorites = (): void => {
			$location.path(`/favorite`);
		};

		route({
			home: () => {
				mc.search = {...mc.search, plain_text: {text: ''}};
				mc.search.advanced.values = {};
				mc.search.advanced.fields.forEach((field) => mc.initField(field));
				mc.displayFavorites = true;
				template.open('main', 'home');
			},
			favorite: () => {
				mc.displayFavorites = false;
				template.open('main', 'favorite')
			},
			signet: () => {
				mc.displayFavorites = true;
				template.open('main', 'signet')
			},
			searchPlainText: () => {
				mc.displayFavorites = false;
				template.open('main', 'search')
			},
			searchAdvanced: () => {
				mc.displayFavorites = false;
				template.open('main', 'search')
			},
		});

		$scope.getSignetWithRights = async (signetId : number) : Promise<void> => {
			$scope.signet.setFromJson(await signetService.get(signetId));
			$scope.signet.myRights = $scope.getDataIf200(await signetService.getMySignetRights(signetId)).map(right => right.action);
		};

		$scope.displayDate = (dateToFormat: Date) : string => {
			return new Date(dateToFormat).toLocaleString([], {day: '2-digit', month: '2-digit', year:'numeric'});
		};

		$scope.removeLevelFromCourse = (level: Label) => {
			$scope.signet.levels = _.without($scope.signet.levels, level);
		};

		$scope.removeDisciplineFromCourse = (discipline: Label) => {
			$scope.signet.disciplines = _.without($scope.signet.disciplines, discipline);
		};

		$scope.removeWordFromCourse = (word: Label) => {
			$scope.signet.plain_text = _.without($scope.signet.plain_text, word);
			if($scope.signet.plain_text.length == 0) {
				$scope.signet.plain_text = new Labels();
				$scope.signet.plain_text.all = [];
			}
		};

		// Utils

		$scope.safeApply = function () {
			let phase = $scope.$root.$$phase;
			if (phase !== '$apply' && phase !== '$digest') {
				$scope.$apply();
			}
		};

		$scope.redirectTo = (path: string) => {
			$location.path(path);
			$scope.safeApply();
		};

		$scope.hasShareRightManager = (signets : Signet[]) => {
			let hasRight = false;
			signets.forEach(signet => {
				hasRight = signet.owner_id === model.me.userId ||
					(signet.myRights && signet.myRights.includes(Behaviours.applicationsBehaviours.mediacentre.rights.resources.manager.right));
				if(!hasRight) {
					return false;
				}
			});
			return hasRight;
		};

		$scope.hasShareRightView = (signets : Signet[]) => {
			let hasRight = false;
			signets.forEach(signet => {
				hasRight = signet.owner_id === model.me.userId ||
					(signet.myRights && signet.myRights.includes(Behaviours.applicationsBehaviours.mediacentre.rights.resources.contrib.right));
				if(!hasRight) {
					return false;
				}
			});
			return hasRight;
		};

		$scope.hasSignetRight = () => {
			return model.me.hasWorkflow(Behaviours.applicationsBehaviours.mediacentre.rights.workflow.signets);
		};

		$scope.getDataIf200 = (response: AxiosResponse) : any => {
			if ($scope.isStatusXXX(response, 200)) { return response.data; }
			else { return null; }
		};

		$scope.isStatusXXX = (response: AxiosResponse, status: number) : any => {
			return response.status === status;
		};

	}]);
