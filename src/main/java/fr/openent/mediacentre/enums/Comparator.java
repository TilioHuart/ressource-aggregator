package fr.openent.mediacentre.enums;

import java.util.HashMap;
import java.util.Map;

public enum Comparator {
    NONE("none"),
    AND("$and"),
    OR("$or");

    private String name;
    private static final Map<String, Comparator> lookup = new HashMap<>();

    Comparator(String name) {
        this.name = name;
    }

    static {
        for (Comparator u : Comparator.values()) {
            lookup.put(u.toString(), u);
        }
    }

    public static Comparator get(String value) {
        return lookup.get(value);
    }

    @Override
    public String toString() {
        return this.name;
    }

    public boolean equals(String value) {
        return this.name.equals(value);
    }
}
