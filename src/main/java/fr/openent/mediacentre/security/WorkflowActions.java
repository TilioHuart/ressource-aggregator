package fr.openent.mediacentre.security;

import fr.openent.mediacentre.Mediacentre;

public enum WorkflowActions {
    CREATION_RIGHT (Mediacentre.CREATION_RIGHT),
    SIGNET_RIGHT (Mediacentre.SIGNET_RIGHT),
    GAR_RIGHT (Mediacentre.GAR_RIGHT),
    VIEW_RIGHT (Mediacentre.VIEW_RIGHT);

    private final String actionName;

    WorkflowActions(String actionName) {
        this.actionName = actionName;
    }

    @Override
    public String toString () {
        return this.actionName;
    }
    }