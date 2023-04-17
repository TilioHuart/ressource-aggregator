// import {idiom as lang, toasts} from 'entcore';
// import {Frame} from './index';
//
// declare const window: any;
//
// export interface Socket {
//     host: string;
//     connected: boolean;
//     callbacks: {
//         onmessage: any;
//         onerror: any;
//         onclose: any;
//         onopen: any;
//     }
//
//     send(frame: Frame): void;
// }
//
// export class Socket {
//     private _ws: WebSocket | null;
//
//     constructor() {
//         this.connected = false;
//         this._ws = null;
//         this.callbacks = {
//             onmessage: null,
//             onerror: null,
//             onclose: null,
//             onopen: null,
//         };
//         this._init();
//     }
//
//     _init() {
//         const endpoint = `${window.mode === 'dev' ? '' : '/mediacentre/ws'}`;
//         this.host = `${(window.location.protocol === 'https:' ? 'wss' : 'ws')}://${location.hostname}:${window.wsPort}${endpoint}`;
//         this._ws = new WebSocket(this.host);
//         this._ws.onclose = (event: CloseEvent) => {
//             toasts.info('mediacentre.socket.network.reconnect.in-progress');
//             setTimeout(() => this._init(), 1000);
//         };
//         this._ws.onmessage = (message: MessageEvent) => {
//             let {data} = message;
//             data = JSON.parse(data);
//             if ("ko" === data.status) {
//                 const message = lang.translate('mediacentre.socket.error');
//                 toasts.warning(message);
//             }
//
//             if ('onmessage' in this.callbacks && this.callbacks.onmessage !== undefined) {
//                 this.callbacks.onmessage(message);
//             }
//         };
//         // this._ws.onopen = (message: Event) => {
//         //     this.connected = true;
//         //     if ('onopen' in this.callbacks && this.callbacks.onopen !== undefined) {
//         //         this.callbacks.onopen(message);
//         //     }
//         // };
//         this._ws.onerror = (event: Event) => {
//             toasts.warning('mediacentre.socket.network.error');
//             if ('onerror' in this.callbacks && this.callbacks.onerror !== undefined) {
//                 this.callbacks.onerror(event);
//             }
//         };
//     }
//
//     send(frame) {
//         if (this._ws !== null) this._ws.send(frame.toJSON());
//     }
//
//     set onmessage(fn) {
//         if (this._ws === null) return;
//         this.callbacks.onmessage = fn;
//     }
//
//     set onopen(fn) {
//         if (this._ws === null) return;
//         this.callbacks.onopen = fn;
//     }
//
//     set onerror(fn) {
//         if (this._ws === null) return;
//         this.callbacks.onerror = fn;
//     }
// }