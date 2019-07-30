import {toasts} from 'entcore';
import {Frame} from './index';

declare const window: any;

export interface Socket {
    host: string;
    connected: boolean;
    callbacks: {
        onmessage: any;
        onerror: any;
        onclose: any;
        onopen: any;
    }

    send(frame: Frame): void;
}

export class Socket {
    private _ws: WebSocket | null;

    constructor() {
        this.connected = false;
        this._ws = null;
        this.callbacks = {
            onmessage: null,
            onerror: null,
            onclose: null,
            onopen: null,
        };
        this._init();
    }

    _init() {
        const endpoint = `${window.mode === 'dev' ? '' : '/mediacentre/ws'}`;
        this.host = `${(window.location.protocol === 'https:' ? 'wss' : 'ws')}://${location.hostname}:${window.wsPort}${endpoint}`;
        this._ws = new WebSocket(this.host);
        this._ws.onclose = (event: CloseEvent) => {
            toasts.warning('mediacentre.socket.closed');
            this._init();
            throw event;
        };
        this._ws.onmessage = (message: MessageEvent) => {
            let {data} = message;
            data = JSON.parse(data);
            if ("ko" === data.status) {
                toasts.warning('mediacentre.socket.error');
                throw data.error;
            }

            this.callbacks.onmessage(message);
        };
        this._ws.onopen = (message: Event) => {
            this.connected = true;
            this.callbacks.onopen(message);
        };
        this._ws.onerror = (event: Event) => {
            this.callbacks.onerror(event);
            toasts.warning('mediacentre.socket.error');
            throw event;
        };
    }

    send(frame) {
        if (this._ws !== null) this._ws.send(frame.toJSON());
    }

    set onmessage(fn) {
        if (this._ws === null) return;
        this.callbacks.onmessage = fn;
    }

    set onopen(fn) {
        if (this._ws === null) return;
        this.callbacks.onopen = fn;
    }

    set onerror(fn) {
        if (this._ws === null) return;
        this.callbacks.onerror = fn;
    }
}