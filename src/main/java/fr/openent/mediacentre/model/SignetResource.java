package fr.openent.mediacentre.model;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.IModelHelper;
import io.vertx.core.json.JsonObject;

public class SignetResource extends Resource implements IModel<SignetResource> {
    private String description;

    public SignetResource(JsonObject resource) {
        super(resource);
        this.description = resource.getString(Field.DESCRIPTION, null);
    }

    public String getDescription() {
        return description;
    }

    public SignetResource setDescription(String description) {
        this.description = description;
        return this;
    }

    @Override
    public JsonObject toJson() {
        return super.toJson().mergeIn(IModelHelper.toJson(this, false, false));
    }
}
