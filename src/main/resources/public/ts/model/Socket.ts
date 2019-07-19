import {toasts} from 'entcore';
import {Frame} from './index';

declare const window: any;

export interface Socket {
    host: string;
    connected: boolean;

    send(frame: Frame): void;
}

export class Socket {
    private _ws: WebSocket;

    constructor() {
        this.connected = false;
        this.host = `${(window.location.protocol === 'https:' ? 'wss' : 'ws')}://${location.hostname}:${window.wsPort}`;
        this._ws = new WebSocket(this.host);
        this._ws.onclose = function (event: CloseEvent) {
            toasts.warning('mediacentre.socket.closed');
            throw event;
        };
    }

    send(frame) {
        this._ws.send(frame.toJSON());
    }

    set onmessage(fn) {
        this._ws.onmessage = function (message: MessageEvent) {
            let {data} = message;
            data = JSON.parse(data);
            if ("ko" === data.status) {
                toasts.warning('mediacentre.socket.error');
                throw data.error;
            }

            fn(message);
        }
    }

    set onopen(fn) {
        this._ws.onopen = (message: Event) => {
            this.connected = true;
            fn(message);
        };
    }

    set onerror(fn) {
        this._ws.onerror = function (event: Event) {
            fn(event);
            toasts.warning('mediacentre.socket.error');
            throw event;
        };
    }
}