package fr.openent.mediacentre.model;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.IModelHelper;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public abstract class Resource {
    private String _id;

    private String title;

    private List<String> plainText;

    private List<String> levels;

    private List<String> disciplines;

    private List<String> editors;

    private List<String> authors;

    private String image;

    private List<String> documentTypes;

    private String link;

    private String source;

    private boolean favorite;

    private JsonObject date;

    public Resource() {
    }

    public Resource(JsonObject resource) {
        this._id = resource.getString(Field._ID, null);
        this.title = resource.getString(Field.TITLE, null);
        this.plainText = IModelHelper.toStringList(resource.getJsonArray(Field.PLAIN_TEXT, new JsonArray()));
        this.levels = IModelHelper.toStringList(resource.getJsonArray(Field.LEVELS, new JsonArray()));
        this.disciplines = IModelHelper.toStringList(resource.getJsonArray(Field.DISCIPLINES, new JsonArray()));
        this.editors = IModelHelper.toStringList(resource.getJsonArray(Field.EDITORS, new JsonArray()));
        this.authors = IModelHelper.toStringList(resource.getJsonArray(Field.AUTHORS, new JsonArray()));
        this.image = resource.getString(Field.IMAGE, null);
        this.documentTypes = IModelHelper.toStringList(resource.getJsonArray(Field.DOCUMENT_TYPES, new JsonArray()));
        this.link = resource.getString(Field.LINK, null);
        this.source = resource.getString(Field.SOURCE, null);
        this.favorite = resource.getBoolean(Field.FAVORITE, false);
        this.date = resource.getJsonObject(Field.DATE, MongoDb.now());
    }

    public String get_id() {
        return _id;
    }

    public Resource set_id(String _id) {
        this._id = _id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Resource setTitle(String title) {
        this.title = title;
        return this;
    }

    public List<String> getPlainText() {
        return plainText;
    }

    public Resource setPlainText(List<String> plainText) {
        this.plainText = plainText;
        return this;
    }

    public List<String> getLevels() {
        return levels;
    }

    public Resource setLevels(List<String> levels) {
        this.levels = levels;
        return this;
    }

    public List<String> getDisciplines() {
        return disciplines;
    }

    public Resource setDisciplines(List<String> disciplines) {
        this.disciplines = disciplines;
        return this;
    }

    public List<String> getEditors() {
        return editors;
    }

    public Resource setEditors(List<String> editors) {
        this.editors = editors;
        return this;
    }

    public List<String> getAuthors() {
        return authors;
    }

    public Resource setAuthors(List<String> authors) {
        this.authors = authors;
        return this;
    }

    public String getImage() {
        return image;
    }

    public Resource setImage(String image) {
        this.image = image;
        return this;
    }

    public List<String> getDocumentTypes() {
        return documentTypes;
    }

    public Resource setDocumentTypes(List<String> documentTypes) {
        this.documentTypes = documentTypes;
        return this;
    }

    public String getLink() {
        return link;
    }

    public Resource setLink(String link) {
        this.link = link;
        return this;
    }

    public String getSource() {
        return source;
    }

    public Resource setSource(String source) {
        this.source = source;
        return this;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public Resource setFavorite(boolean favorite) {
        this.favorite = favorite;
        return this;
    }

    public JsonObject getDate() {
        return date;
    }

    public Resource setDate(JsonObject date) {
        this.date = date;
        return this;
    }

    public JsonObject toJson() {
        return new JsonObject()
                .put(Field._ID, this.get_id())
                .put(Field.TITLE, this.getTitle())
                .put(Field.PLAIN_TEXT, new JsonArray(this.getPlainText()))
                .put(Field.LEVELS, new JsonArray(this.getLevels()))
                .put(Field.DISCIPLINES, new JsonArray(this.getDisciplines()))
                .put(Field.EDITORS, new JsonArray(this.getEditors()))
                .put(Field.AUTHORS, new JsonArray(this.getAuthors()))
                .put(Field.IMAGE, this.getImage())
                .put(Field.DOCUMENT_TYPES, new JsonArray(this.getDocumentTypes()))
                .put(Field.LINK, this.getLink())
                .put(Field.SOURCE, this.getSource())
                .put(Field.FAVORITE, this.isFavorite());
    }
}