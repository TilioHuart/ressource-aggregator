import {_, Behaviours, idiom, model, ng, template} from 'entcore';
import {ILocationService, IRootScopeService} from "angular";
import {Resource} from '../model';
import {Signet, Signets} from "../model/Signet";
import {Label, Labels} from "../model/Label";
import http, {AxiosResponse} from "axios";
import {Utils} from "../utils/Utils";

declare const window: any;
declare var mediacentreUpdateFrequency: number;

export interface MainScope extends IRootScopeService {
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
	loaders: any;
	idiom: typeof idiom;
	signet: Signet;
	safeApply(): void;
	redirectTo(path: string): void;
	mc: MainController;
}

export interface MainController extends ng.IController {
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
	getImgLink(imgId: string): Promise<boolean>;
	startResearch(state: string, sources: string[], data: any): Promise<void>;

}

class Controller implements MainController {
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

	query: any;
	disciplines: Labels;
	levels: Labels;
	loaders: any;
	idiom: typeof idiom = idiom;
	signet: Signet;


	constructor(private $scope: MainScope,
				private route,
				private $location: ILocationService,
				private $timeout) {
		this.$scope.mc = this;

		this.favorites = [];
		this.textbooks = [];
		this.pageSize = 10;
		this.limitTo = this.pageSize;
		this.displayFavorites = false;
		this.search = {
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
		this.idiom = idiom;

		this.screenWidthLimit = 600;
		this.favoriteLimit = screen.width < this.screenWidthLimit ? 2 : 7;
		this.signet = new Signet();
		this.levels = new Labels();
		this.levels.sync("levels");
		this.disciplines = new Labels();
		this.disciplines.sync("disciplines");
	}



	$onInit = async () => {
		this.route({
			home: () => {
				this.search = {...this.search, plain_text: {text: ''}};
				this.search.advanced.values = {};
				this.search.advanced.fields.forEach((field) => this.initField(field));
				this.displayFavorites = true;
				template.open('main', 'home');
			},
			favorite: () => {
				this.displayFavorites = false;
				template.open('main', 'favorite')
			},
			signet: () => {
				this.displayFavorites = true;
				template.open('main', 'signet')
			},
			searchPlainText: () => {
				this.displayFavorites = false;
				template.open('main', 'search')
			},
			searchAdvanced: () => {
				this.displayFavorites = false;
				template.open('main', 'search')
			},
		});
	};


		redirectToReactSearch = () => {
			if(this.search.plain_text.text.trim() !== ''){
				window.location.href = "/mediacentre#/search?query=" + encodeURIComponent(this.search.plain_text.text);
			}
		};

		startResearch = async (state: string, sources: string[], data: any): Promise<void> => {
			this.limitTo = this.pageSize;
			this.$location.path(`/search/${state.toLowerCase()}`);
			this.$timeout(() => {
				this.$scope.$broadcast('search', {state, data, sources: sources});
			}, 300);
		};

		getImgLink = async (imgId) : Promise<boolean> => {
			try{
				let data = await http.get(`${imgId}`);
				console.log(imgId, data.status);
				return data.status < 400;
			}
			catch (err)
			{
				console.log(imgId, err);
				return false;
			}

		}

		infiniteScroll = () => {
			this.limitTo += this.pageSize;
		};

		plainTextSearch = () => {
			if (this.search.plain_text.text.trim() === '') return;
			this.startResearch('PLAIN_TEXT', [], {query: this.search.plain_text.text});
		};

		goSignet = (): void => {
			this.$location.path(`/signet/`);
		};

		advancedSearch = () => {
			const {values} = this.search.advanced;
			let data = {};
			this.search.advanced.fields.forEach((field) => {
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
			Object.keys(this.search.advanced.sources).forEach(key => {
				if (this.search.advanced.sources[key]) sources.push(key);
			});
			this.startResearch('ADVANCED', sources, data);
			this.search.advanced.show = false;
		};

		initField = ({name, comparator}) => {
			this.search.advanced.values[name] = {
				value: '',
				...comparator ? {comparator: '$or'} : {}
			}
		};

		initHeader = () => {
			let accueil = document.getElementById('item_1');
			let signets = document.getElementById('item_2');
			if(accueil && signets){
				accueil["checked"] = this.$location.url() !=  '/signet';
				signets["checked"] = this.$location.url() ==  '/signet';
			}
		};

		openAdvancedSearch = () => {
			this.search.plain_text.text = '';
			this.search.advanced.show = true;
			window.sources.forEach(source => this.search.advanced.sources[source] = true);
		};

		closeAdvancedSearch = () => {
			this.search.advanced.show = false;
		};

		goHome = () => {
			this.$location.path('/')
		};

		goFavorites = (): void => {
			this.$location.path(`/favorite`);
		};

		displayDate = (dateToFormat: Date) : string => {
			return new Date(dateToFormat).toLocaleString([], {day: '2-digit', month: '2-digit', year:'numeric'});
		};

		removeLevelFromCourse = (level: Label) => {
			this.signet.levels = _.without(this.signet.levels, level);
		};

		removeDisciplineFromCourse = (discipline: Label) => {
			this.signet.disciplines = _.without(this.signet.disciplines, discipline);
		};

		removeWordFromCourse = (word: Label) => {
			this.signet.plain_text = _.without(this.signet.plain_text, word);
			if(this.signet.plain_text.length == 0) {
				this.signet.plain_text = new Labels();
				this.signet.plain_text.all = [];
			}
		};


		redirectTo = (path: string) => {
			this.$location.path(path);
			Utils.safeApply(this.$scope);
		};

		hasShareRightManager = (signets : Signet[]) => {
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

		hasShareRightView = (signets : Signet[]) => {
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

		hasSignetRight = () => {
			return model.me.hasWorkflow(Behaviours.applicationsBehaviours.mediacentre.rights.workflow.signets);
		};

		getDataIf200 = (response: AxiosResponse) : any => {
			if (this.isStatusXXX(response, 200)) { return response.data; }
			else { return null; }
		};

		isStatusXXX = (response: AxiosResponse, status: number) : any => {
			return response.status === status;
		};

	$onDestroy(): void {
	}

	addKeyWord(event: any): void {
	}
};

export const mainController = ng.controller('MainController', ['$scope', 'route', '$location', '$timeout',
	Controller]);