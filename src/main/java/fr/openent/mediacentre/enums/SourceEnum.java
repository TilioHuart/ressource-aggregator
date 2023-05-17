package fr.openent.mediacentre.enums;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.core.constants.SourceConstant;

public enum SourceEnum {
    SIGNET(SourceConstant.SIGNET),
    MOODLE(SourceConstant.MOODLE),
    GAR(SourceConstant.GAR),
    PMB(SourceConstant.PMB);

    private final String source;

    SourceEnum(String source) {
        this.source = source;
    }

    public String method() {
        return this.source;
    }
}
