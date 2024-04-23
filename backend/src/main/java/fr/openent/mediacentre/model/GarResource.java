package fr.openent.mediacentre.model;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.IModelHelper;
import io.vertx.core.json.JsonObject;

public class GarResource extends Resource implements IModel<GarResource> {
    private String id;
    private String structureUai;
    private String structureName;

    public GarResource() {
        super();
    }

    public GarResource(JsonObject resource) {
        super(resource);
        this.id = resource.getString(Field.ID, null);
        this.structureUai = resource.getString(Field.STRUCTURE_UAI, null);
        this.structureName = resource.getString(Field.STRUCTURE_NAME, null);
    }


    // Getter

    public String getId() {
        return id;
    }

    public String getStructureUai() {
        return structureUai;
    }

    public String getStructureName() {
        return structureName;
    }


    // Setter

    public GarResource setId(String id) {
        this.id = id;
        return this;
    }

    public GarResource setStructureUai(String structureUai) {
        this.structureUai = structureUai;
        return this;
    }

    public GarResource setStructureName(String structureName) {
        this.structureName = structureName;
        return this;
    }


    // Functions

    @Override
    public JsonObject toJson() {
        return super.toJson().mergeIn(IModelHelper.toJson(this, false, false));
    }
}
