package fr.openent.mediacentre.model;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.enums.Profile;
import fr.openent.mediacentre.helper.IModelHelper;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class GlobalResource extends Resource implements IModel<GlobalResource> {

    private List<Profile> profiles;

    public List<Profile> getProfiles() {
        return profiles;
    }

    public GlobalResource setProfiles(List<Profile> profiles) {
        this.profiles = profiles;
        return this;
    }

    public GlobalResource() {
        super();
    }

    public GlobalResource(JsonObject resource) {
        super(resource);
        this.setSource(Field.GLOBAL_RESOURCE);
        this.setPlainText(Collections.singletonList(Field.GLOBAL));
        this.setDocumentTypes(Collections.singletonList(Field.DOCUMENT_TYPES_GLOBAL));
        JsonArray resourceProfiles = resource.getJsonArray(Field.PROFILES, new JsonArray());
        this.profiles = IModelHelper.toStringList(resourceProfiles).stream()
                .map(Profile::getProfile)
                .collect(Collectors.toList());
    }

    @Override
    public JsonObject toJson() {
        return super.toJson().mergeIn(IModelHelper.toJson(this, false, false));
    }
}
