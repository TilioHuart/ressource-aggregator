import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {signetService} from "../signet.service";

describe('Signet Service', () => {

    it('returns data when retrieve request signet service list is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {response: true};
        mock.onGet(`/mediacentre/mysignets`).reply(200, data);
        signetService.list().then(response => {
            expect(response.data).toEqual(data);
            done();
        });
    });
});