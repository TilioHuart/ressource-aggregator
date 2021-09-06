import {_, Behaviours} from 'entcore';
import http from "axios";

const rights = {
    resources: {
        view: {
            right: "fr-openent-mediacentre-controllers-MediacentreController|initViewResourceRight"
        },
        manager: {
            right: "fr-openent-mediacentre-controllers-MediacentreController|initManagerResourceRight"
        }
    }
};

Behaviours.register('mediacentre', {
    rights: rights,
    dependencies: {},
    resourceRights: function () {
        return ['view', 'manager'];
    }
});