import {ng} from 'entcore';

declare const window: any;

export const mainController = ng.controller('MainController', ['$scope', 'route', ($scope, route) => {
	const wsHost = `${(window.location.protocol === 'https:' ? 'wss' : 'ws')}://${location.hostname}:${window.wsPort}`;
	const ws = new WebSocket(wsHost);
	ws.onopen = (event) => {
		console.log('OPENED WS', event);
	};

}]);
