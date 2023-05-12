import {Filter, Resource} from "../model";
import {idiom as lang} from "entcore";

function getFilterName(name: string) {
    switch (name) {
        case lang.translate("fr.openent.mediacentre.orientation"):
            return lang.translate("mediacentre.signets.create.orientation");
        case lang.translate("fr.openent.mediacentre.source.Signet"):
            return lang.translate("mediacentre.signets.mine");
        default:
            return name;
    }
}

export function addFilters(filteredFields: string[], initialFilter: object, resource: Resource) {


    filteredFields.forEach((filterName) => {
        if (!Array.isArray(resource[filterName])) {
            if (!initialFilter[filterName].find((el: Filter) => el.name === resource[filterName])) {
                initialFilter[filterName].push({
                    name: resource[filterName],
                    toString: function () {
                        return lang.translate(this.name);
                    }
                });
            }
        } else {
            (resource[filterName] as Array<string>).forEach((filterValue) => {
                if (!initialFilter[filterName].find((el: Filter) => el.name === filterValue)) {
                    initialFilter[filterName].push({
                        name: filterValue,
                        toString: function () {
                            return getFilterName(this.name)
                        }
                    });
                }
            });
        }
    });
}