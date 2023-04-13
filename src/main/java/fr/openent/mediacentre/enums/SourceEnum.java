package fr.openent.mediacentre.enums;

public enum SourceEnum {
    SIGNET("fr.openent.mediacentre.source.Signet");

    private final String source;

    SourceEnum(String source) {
        this.source = source;
    }

    public String method() {
        return this.source;
    }
}
