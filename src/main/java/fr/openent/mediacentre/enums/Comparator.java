package fr.openent.mediacentre.enums;

public enum Comparator {
    NONE("none"),
    AND("$and"),
    OR("$or");

    private String name;

    Comparator(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return this.name;
    }

    public boolean equals(String value) {
        return this.name.equals(value);
    }
}
