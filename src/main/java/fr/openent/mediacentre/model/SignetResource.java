package fr.openent.mediacentre.model;

import fr.openent.mediacentre.helper.IModelHelper;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

import static fr.openent.mediacentre.core.constants.Field.*;

public class SignetResource implements IModel<SignetResource> {
    private Integer id;
    private String resourceId;
    private List<String> disciplineLabel;
    private List<String> levelLabel;
    private List<String> keyWords;
    private String title;
    private String imageurl;
    private String ownerName;
    private String ownerId;
    private String url;
    private Boolean collab;
    private Boolean archive;
    private Boolean orientation;
    private String dateCreation;
    private String dateModification;
    private Boolean published;

    public SignetResource(JsonObject resource) {
        this.id = resource.getInteger(ID, null);
        this.resourceId = resource.getString(RESOURCE_ID, null);
        this.disciplineLabel = IModelHelper.toStringList(resource.getJsonArray(DISCIPLINE_LABEL, new JsonArray()));
        this.levelLabel = IModelHelper.toStringList(resource.getJsonArray(LEVEL_LABEL, new JsonArray()));
        this.keyWords = IModelHelper.toStringList(resource.getJsonArray(KEY_WORDS, new JsonArray()));
        this.title = resource.getString(TITLE, null);
        this.imageurl = resource.getString(IMAGEURL, null);
        this.ownerName = resource.getString(OWNER_NAME, null);
        this.ownerId = resource.getString(OWNER_ID, null);
        this.url = resource.getString(URL, null);
        this.collab = resource.getBoolean(COLLAB, null);
        this.archive = resource.getBoolean(ARCHIVE, null);
        this.orientation = resource.getBoolean(ORIENTATION, null);
        this.dateCreation = resource.getString(DATE_CREATION, null);
        this.dateModification =  resource.getString(DATE_MODIFICATION, null);
        this.published = resource.getBoolean(PUBLISHED, null);
    }

    // Getter
    public Integer getId() {
        return id;
    }

    public String getResourceId() {
        return resourceId;
    }

    public List<String> getDisciplineLabel() {
        return disciplineLabel;
    }

    public List<String> getLevelLabel() {
        return levelLabel;
    }

    public List<String> getKeyWords() {
        return keyWords;
    }

    public String getTitle() {
        return title;
    }

    public String getImageurl() {
        return imageurl;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getUrl() {
        return url;
    }

    public Boolean getCollab() {
        return collab;
    }

    public Boolean getArchive() {
        return archive;
    }

    public Boolean getOrientation() {
        return orientation;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public String getDateModification() {
        return dateModification;
    }

    public Boolean getPublished() {
        return published;
    }


    // Setter
    public SignetResource setId(Integer id) {
        this.id = id;
        return this;
    }

    public SignetResource setResourceId(String resourceId) {
        this.resourceId = resourceId;
        return this;
    }

    public SignetResource setDisciplineLabel(List<String> disciplineLabel) {
        this.disciplineLabel = disciplineLabel;
        return this;
    }

    public SignetResource setLevelLabel(List<String> levelLabel) {
        this.levelLabel = levelLabel;
        return this;
    }

    public SignetResource setKeyWords(List<String> keyWords) {
        this.keyWords = keyWords;
        return this;
    }

    public SignetResource setTitle(String title) {
        this.title = title;
        return this;
    }

    public SignetResource setImageurl(String imageurl) {
        this.imageurl = imageurl;
        return this;
    }

    public SignetResource setOwnerName(String ownerName) {
        this.ownerName = ownerName;
        return this;
    }

    public SignetResource setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        return this;
    }

    public SignetResource setUrl(String url) {
        this.url = url;
        return this;
    }

    public SignetResource setCollab(Boolean collab) {
        this.collab = collab;
        return this;
    }

    public SignetResource setArchive(Boolean archive) {
        this.archive = archive;
        return this;
    }

    public SignetResource setOrientation(Boolean orientation) {
        this.orientation = orientation;
        return this;
    }

    public SignetResource setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
        return this;
    }

    public SignetResource setDateModification(String dateModification) {
        this.dateModification = dateModification;
        return this;
    }

    public SignetResource setPublished(Boolean published) {
        this.published = published;
        return this;
    }

    @Override
    public JsonObject toJson() {
        return IModelHelper.toJson(this, false, false);
    }
}
