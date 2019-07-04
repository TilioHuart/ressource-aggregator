export interface Frame {
    status: string;
    toJSON(): string;
}

export class Frame {
    private readonly _event: string;
    private readonly _data: any;

    constructor(event: string, data: any) {
        this._event = event;
        this._data = data;
    }

    toJSON(): string {
        return JSON.stringify({
            event: this._event,
            data: this._data
        });
    }

    get data() {
        return this._data
    }

    get event() {
        return this._event;
    }
}