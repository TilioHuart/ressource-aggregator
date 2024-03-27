package fr.openent.mediacentre.model;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.core.constants.SourceConstant;
import fr.openent.mediacentre.enums.Profile;
import fr.openent.mediacentre.helper.IModelHelper;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static fr.openent.mediacentre.core.constants.Field.ID;

public class GlobalResource extends Resource implements IModel<GlobalResource> {
    private Integer id;
    private List<Profile> profiles;

    public GlobalResource() {
        super();
    }

    public GlobalResource(JsonObject resource) {
        super(resource);
        this.id = resource.getInteger(ID, null);
        this.setSource(SourceConstant.GLOBAL);
        this.setPlainText(Collections.singletonList(Field.GLOBAL));
        this.setDocumentTypes(Collections.singletonList(Field.DOCUMENT_TYPES_GLOBAL));
        JsonArray resourceProfiles = resource.getJsonArray(Field.PROFILES, new JsonArray());
        this.profiles = IModelHelper.toStringList(resourceProfiles).stream()
                .map(Profile::getProfile)
                .collect(Collectors.toList());
    }


    // Getter

    public Integer getId() {
        return id;
    }

    public List<Profile> getProfiles() {
        return profiles;
    }


    // Setter

    public GlobalResource setId(Integer id) {
        this.id = id;
        return this;
    }

    public GlobalResource setProfiles(List<Profile> profiles) {
        this.profiles = profiles;
        return this;
    }


    // Functions

    @Override
    public JsonObject toJson() {
        return super.toJson().mergeIn(IModelHelper.toJson(this, false, false));
    }
}
