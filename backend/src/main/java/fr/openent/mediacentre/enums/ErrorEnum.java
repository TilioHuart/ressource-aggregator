package fr.openent.mediacentre.enums;

public enum ErrorEnum {
    ERROR_FAVORITE_FETCH("error.favorite.fetch");

    private final String errorEnum;

    ErrorEnum(String errorEnum) {
        this.errorEnum = errorEnum;
    }

    public String method() {
        return this.errorEnum;
    }
}
