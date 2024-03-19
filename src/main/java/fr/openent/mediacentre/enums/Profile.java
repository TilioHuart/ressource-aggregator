package fr.openent.mediacentre.enums;

import java.util.Arrays;

public enum Profile {
    PERSONNEL("PERSONNEL"),
    RELATIVE("RELATIVE"),
    STUDENT("STUDENT"),
    TEACHER("TEACHER"),
    ADMIN("ADMIN");

    private String name;

    Profile(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public static Profile getProfile(String name) {
        return Arrays.stream(Profile.values())
                .filter(formElementType -> formElementType.getName().equals(name))
                .findFirst()
                .orElse(null);
    }
}
