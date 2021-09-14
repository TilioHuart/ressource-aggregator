package fr.openent.mediacentre.security;

import fr.openent.mediacentre.Mediacentre;

public enum WorkflowActions {
    CREATION_RIGHT (Mediacentre.CREATION_RIGHT);

    private final String actionName;

    WorkflowActions(String actionName) {
        this.actionName = actionName;
    }

    @Override
    public String toString () {
        return this.actionName;
    }
    }