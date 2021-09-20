import {_, Behaviours} from 'entcore';

const rights = {
    resources: {
        view: {
            right: "fr-openent-mediacentre-controller-MediacentreController|initViewResourceRight"
        },
        manager: {
            right: "fr-openent-mediacentre-controller-MediacentreController|initManagerResourceRight"
        }
    },
    workflow: {
        creation: 'fr.openent.mediacentre.controller.SignetController|create'
    }
};

Behaviours.register('mediacentre', {
    rights: rights,
    dependencies: {},
    resourceRights: function () {
        return ['view', 'manager'];
    }
});