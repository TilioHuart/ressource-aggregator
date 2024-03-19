package fr.openent.mediacentre.model;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.IModelHelper;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public class GarResource extends Resource implements IModel<GarResource> {
    private String structureUai;
    private String structureName;

    public GarResource() {
        super();
    }

    public GarResource(JsonObject resource) {
        super(resource);
        this.structureUai = resource.getString(Field.STRUCTURE_UAI, null);
        this.structureName = resource.getString(Field.STRUCTURE_NAME, null);
    }

    public String getStructureUai() {
        return structureUai;
    }

    public GarResource setStructureUai(String structureUai) {
        this.structureUai = structureUai;
        return this;
    }

    public String getStructureName() {
        return structureName;
    }

    public GarResource setStructureName(String structureName) {
        this.structureName = structureName;
        return this;
    }

    @Override
    public JsonObject toJson() {
        return super.toJson().mergeIn(IModelHelper.toJson(this, false, false));
    }
}
