import {_, Behaviours} from 'entcore';
import http from "axios";

const rights = {
    resources: {
        view: {
            right: "fr-openent-mediacentre-controller-MediacentreController|initViewResourceRight"
        },
        manager: {
            right: "fr-openent-mediacentre-controller-MediacentreController|initManagerResourceRight"
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