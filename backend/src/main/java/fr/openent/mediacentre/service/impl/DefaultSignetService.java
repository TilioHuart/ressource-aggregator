package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.helper.ElasticSearchHelper;
import fr.openent.mediacentre.helper.IModelHelper;
import fr.openent.mediacentre.model.SignetResource;
import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.source.Signet;
import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import java.util.List;

public class DefaultSignetService implements SignetService {

    private static final Logger log = LoggerFactory.getLogger(DefaultSignetService.class);

    @Override
    public void list(List<String> groupsAndUserIds, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray().add(user.getUserId()).add(user.getUserId()).add(user.getUserId());
        String query = "SELECT DISTINCT s.id, s.resource_id, discipline_label as disciplines, level_label as levels, key_words as plain_text, " +
                "title, imageurl as image, s.owner_name, s.owner_id, url, date_creation, date_modification, collab, archived, orientation, " +
                "CASE WHEN f.favorite = true and f.user_id = ? AND s.id = f.signet_id THEN true else false END as favorite, published " +
                "FROM " + Mediacentre.SIGNET_TABLE + " s " +
                "LEFT JOIN " + Mediacentre.SIGNET_SHARES_TABLE + " ss ON s.id = ss.resource_id " +
                "LEFT JOIN " + Mediacentre.MEMBERS_TABLE + " m ON (ss.member_id = m.id AND m.group_id IS NOT NULL) " +
                "LEFT JOIN " + Mediacentre.FAVORITES_TABLE + " f on (f.signet_id = s.id and f.user_id = ?) " +
                "WHERE f.user_id = ? AND s.owner_id = ? OR (ss.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray());
        for (String groupOrUser : groupsAndUserIds) {
            params.add(groupOrUser);
        }
        query += " AND (ss.action = ? OR ss.action = ?)) ORDER BY s.id desc;";
        params.add(user.getUserId()).add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR).add(Mediacentre.VIEW_RESOURCE_BEHAVIOUR);

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void listSentForms(UserInfos user, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT * FROM " + Mediacentre.SIGNET_TABLE +
                " ORDER BY title;";
        JsonArray params = new JsonArray().add(user.getUserId()).add(true);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void get(String signetId, Handler<Either<String, JsonObject>> handler) {
        String query = "SELECT id, resource_id, discipline_label as disciplines, level_label as levels, key_words as plain_text, "+
                "title, imageurl as image, owner_name, owner_id, url, date_creation, date_modification, collab, archived, orientation FROM " + Mediacentre.SIGNET_TABLE + " WHERE id = ?;";
        JsonArray params = new JsonArray().add(signetId);
        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void create(JsonObject signet, UserInfos user, Handler<Either<String, JsonObject>> handler) {

        JsonArray levelArray = new JsonArray();
        if(signet.containsKey("levels")) {
            for (int i = 0; i < signet.getJsonArray("levels").size(); i++) {
                levelArray.add((signet.getJsonArray("levels").getJsonObject(i).getString("label")));
            }
        }
        if(levelArray.isEmpty()) {
            levelArray.add("");
        }

        JsonArray disciplineArray = new JsonArray();
        if(signet.containsKey("disciplines")) {
            for (int i = 0; i < signet.getJsonArray("disciplines").size(); i++) {
                disciplineArray.add((signet.getJsonArray("disciplines").getJsonObject(i).getString("label")));
            }
        }
        if(disciplineArray.isEmpty()) {
            disciplineArray.add("");
        }

        JsonArray plainTextArray = new JsonArray();
        if(signet.containsKey("plain_text")) {
            for (int i = 0; i < signet.getJsonArray("plain_text").size(); i++) {
                plainTextArray.add((signet.getJsonArray("plain_text").getJsonObject(i).getString("label")));
            }
        }
        if(plainTextArray.isEmpty()) {
            plainTextArray.add("");
        }

        String query = "INSERT INTO " + Mediacentre.SIGNET_TABLE + " (resource_id, discipline_label, level_label, key_words, title, " +
                "imageurl, owner_name, owner_id, url, date_creation, date_modification, orientation) " +
                "VALUES (?, " + Sql.arrayPrepared(disciplineArray) + " ," + Sql.arrayPrepared(levelArray) + " ," + Sql.arrayPrepared(plainTextArray) + ", ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *;";
        JsonArray params = new JsonArray()
                .add(signet.getString("id"))
                .addAll(disciplineArray)
                .addAll(levelArray)
                .addAll(plainTextArray)
                .add(signet.getString("title", ""))
                .add(signet.getString("image", ""))
                .add(user.getLastName() + " " + user.getFirstName())
                .add(user.getUserId())
                .add(signet.getString("url"))
                .add("NOW()").add("NOW()")
                .add(signet.getBoolean("orientation", false));

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void update(String signetId, JsonObject signet, Handler<Either<String, JsonObject>> handler) {
        JsonArray levelArray = new JsonArray();
        if(signet.containsKey("levels")) {
            for (int i = 0; i < signet.getJsonArray("levels").size(); i++) {
                levelArray.add((signet.getJsonArray("levels").getJsonObject(i).getString("label")));
            }
        }
        if(levelArray.isEmpty()) {
            levelArray.add("");
        }

        JsonArray disciplineArray = new JsonArray();
        if(signet.containsKey("disciplines")) {
            for (int i = 0; i < signet.getJsonArray("disciplines").size(); i++) {
                disciplineArray.add((signet.getJsonArray("disciplines").getJsonObject(i).getString("label")));
            }
        }
        if(disciplineArray.isEmpty()) {
            disciplineArray.add("");
        }

        JsonArray plainTextArray = new JsonArray();
        if(signet.containsKey("plain_text")) {
            for (int i = 0; i < signet.getJsonArray("plain_text").size(); i++) {
                plainTextArray.add((signet.getJsonArray("plain_text").getJsonObject(i).getString("label")));
            }
        }
        if(plainTextArray.isEmpty()) {
            plainTextArray.add("");
        }

        String query = "UPDATE " + Mediacentre.SIGNET_TABLE + " SET title = ?, imageurl = ?, url = ?, date_modification = ?, " +
                "date_creation = ?, collab = ?, archived = ?, orientation = ?, discipline_label = " + Sql.arrayPrepared(disciplineArray) + ", " +
                "level_label = " + Sql.arrayPrepared(levelArray) +", key_words = "+ Sql.arrayPrepared(plainTextArray) +
                " WHERE id = ? RETURNING *;";

        JsonArray params = new JsonArray()
                .add(signet.getString("title", ""))
                .add(signet.getString("image", ""))
                .add(signet.getString("url", ""))
                .add("NOW()")
                .add(signet.getString("date_creation", "NOW()"))
                .add(signet.getBoolean("collab", false))
                .add(signet.getBoolean("archived", false))
                .add(signet.getBoolean("orientation", false))
                .addAll(disciplineArray)
                .addAll(levelArray)
                .addAll(plainTextArray)
                .add(signetId);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    public void updateCollab(String signetId, JsonObject signet, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Mediacentre.SIGNET_TABLE + " SET collab = ?" +
                " WHERE id = ? RETURNING *;";

        JsonArray params = new JsonArray()
                .add(signet.getBoolean("collab", false))
                .add(signetId);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void delete(String signetId, Handler<Either<String, JsonObject>> handler) {
        String query = "DELETE FROM " + Mediacentre.SIGNET_TABLE + " WHERE id = ?;";
        JsonArray params = new JsonArray().add(signetId);
        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void search(List<String> groupsAndUserIds, UserInfos user, String query, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray().add(user.getUserId()).add(user.getUserId()).add(query).add(user.getUserId());
        String sqlquery = "SELECT DISTINCT s.id, s.resource_id, discipline_label as disciplines, level_label as levels, key_words as plain_text, " +
                "title, imageurl as image, s.owner_name, s.owner_id, url, date_creation, date_modification, collab, archived, orientation, " +
                "CASE WHEN f.favorite = true and f.user_id = ? AND s.id = f.signet_id THEN true else false END as favorite" +
                " FROM " + Mediacentre.SIGNET_TABLE + " s" +
                " LEFT JOIN " + Mediacentre.SIGNET_SHARES_TABLE + " ss ON s.id = ss.resource_id " +
                " LEFT JOIN " + Mediacentre.MEMBERS_TABLE + " m ON (ss.member_id = m.id AND m.group_id IS NOT NULL) " +
                " LEFT JOIN " + Mediacentre.FAVORITES_TABLE + " f on (f.signet_id = s.id and f.user_id = ?) " +
                " WHERE s.title ~* ? AND f.user_id = ? AND (s.owner_id = ? OR (ss.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray());
        for (String groupOrUser : groupsAndUserIds) {
            params.add(groupOrUser);
        }
        sqlquery += " AND (ss.action = ? OR ss.action = ?))) ORDER BY s.id desc;";
        params.add(user.getUserId()).add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR).add(Mediacentre.VIEW_RESOURCE_BEHAVIOUR);

        Sql.getInstance().prepared(sqlquery, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void advancedSearch(List<String> groupsAndUserIds, UserInfos user, Object query, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray().add(user.getUserId()).add(user.getUserId()).add(user.getUserId());
        JsonObject q = ((JsonObject) query);
        String sqlquery = "SELECT DISTINCT s.id, s.resource_id, discipline_label as disciplines, level_label as levels, key_words as plain_text, " +
                "title, imageurl as image, s.owner_name, s.owner_id, url, date_creation, date_modification, collab, archived, orientation, " +
                "CASE WHEN f.favorite = true and f.user_id = ? AND s.id = f.signet_id THEN true else false END as favorite" +
                " FROM " + Mediacentre.SIGNET_TABLE + " s" +
                " LEFT JOIN " + Mediacentre.SIGNET_SHARES_TABLE + " ss ON s.id = ss.resource_id " +
                " LEFT JOIN " + Mediacentre.MEMBERS_TABLE + " m ON (ss.member_id = m.id AND m.group_id IS NOT NULL) " +
                " LEFT JOIN " + Mediacentre.FAVORITES_TABLE + " f on (f.signet_id = s.id and f.user_id = ?) " +
                " WHERE f.user_id = ? AND (s.owner_id = ? OR (ss.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray());
        for (String groupOrUser : groupsAndUserIds) {
            params.add(groupOrUser);
        }
        sqlquery += " AND (ss.action = ? OR ss.action = ?)))";
        params.add(user.getUserId()).add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR).add(Mediacentre.VIEW_RESOURCE_BEHAVIOUR);
        if(!(q.getJsonObject("title").getString("value")).equals("")) {
            sqlquery += " AND title ~* ?";
            params.add(q.getJsonObject("title").getString("value"));
        }

        if(!(q.getJsonObject("authors").getString("value")).equals("")) {
            String comparator = q.getJsonObject("authors").getString("comparator").equals("$or") ? " OR" : " AND";
            sqlquery += comparator +  " owner_name ~* ?";
            params.add(q.getJsonObject("authors").getString("value"));
        }

        if(!(q.getJsonObject("editors").getString("value")).equals("")) {
            String comparator = q.getJsonObject("editors").getString("comparator").equals("$or") ? " OR" : " AND";
            sqlquery += comparator +  " owner_name ~* ?";
            params.add(q.getJsonObject("editors").getString("value"));
        }

        if(!(q.getJsonObject("levels").getString("value")).equals("")) {
            String comparator = q.getJsonObject("levels").getString("comparator").equals("$or") ? " OR" : " AND";
            sqlquery += comparator +  " EXISTS ( SELECT * from unnest(level_label) as X where x ~* ? )";
            params.add(q.getJsonObject("levels").getString("value"));
        }

        if(!(q.getJsonObject("disciplines").getString("value")).equals("")) {
            String comparator = q.getJsonObject("disciplines").getString("comparator").equals("$or") ? " OR" : " AND";
            sqlquery += comparator +  " EXISTS ( SELECT * from unnest(discipline_label) as X where x ~* ? )";
            params.add(q.getJsonObject("disciplines").getString("value"));
        }

        sqlquery += "ORDER BY s.id desc;";
        Sql.getInstance().prepared(sqlquery, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void getMySignetRights(String signetId, List<String> groupsAndUserIds, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT action FROM " + Mediacentre.SIGNET_SHARES_TABLE +
                " WHERE resource_id = ? AND member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND action IN (?, ?);";
        JsonArray params = new JsonArray()
                .add(signetId)
                .addAll(new fr.wseduc.webutils.collections.JsonArray(groupsAndUserIds))
                .add(Mediacentre.VIEW_RESOURCE_BEHAVIOUR)
                .add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void getAllMySignetRights(List<String> groupsAndUserIds, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT resource_id, action FROM " + Mediacentre.SIGNET_SHARES_TABLE +
                " WHERE member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND action IN (?, ?);";
        JsonArray params = new JsonArray()
                .addAll(new fr.wseduc.webutils.collections.JsonArray(groupsAndUserIds))
                .add(Mediacentre.VIEW_RESOURCE_BEHAVIOUR)
                .add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    public void setPublishValueSignet(String signetId, boolean publishValue, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Mediacentre.SIGNET_TABLE + " SET published = ? WHERE id = ?;";
        JsonArray params = new JsonArray().add(publishValue).add(signetId);
        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    public void getPublicSignet(String userId, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.plainTextSearch(Signet.class, ".*", userId, null, false, ElasticSearchHelper.searchHandler(Signet.class, null, handler));
    }

    public void getMyPublishedSignet(String userId, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.plainTextSearch(Signet.class, ".*", userId, null, true, ElasticSearchHelper.searchHandler(Signet.class, null, handler));
    }

    public void searchMyPublishedSignet(String query, String userId, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.plainTextSearch(Signet.class, query, userId, null, true, ElasticSearchHelper.searchHandler(Signet.class, null, handler));
    }

    public void deleteMyPublishedSignet(String signetId, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.deletePublicSignets(signetId, ElasticSearchHelper.searchHandler(Signet.class, null, handler));
    }

    public Future<List<SignetResource>> retrieveFavoriteSignets(UserInfos user) {
        Promise<List<SignetResource>> promise = Promise.promise();
        String query = "SELECT s.* FROM " + Mediacentre.FAVORITES_TABLE + " f " +
                "INNER JOIN " + Mediacentre.SIGNET_TABLE + " s ON s.id = f.signet_id " +
                "WHERE user_id = ? AND favorite = ?;";
        JsonArray params = new JsonArray().add(user.getUserId()).add(true);

        String errorMessage = "[Mediacentre@DefaultSignetService::retrieveFavoriteSignets] Failed to retrieve favorite signets : ";
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(IModelHelper.resultToIModel(promise, SignetResource.class, errorMessage)));

        return promise.future();
    }
}
