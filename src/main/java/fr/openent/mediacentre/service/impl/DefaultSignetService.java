package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.helper.ElasticSearchHelper;
import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.source.Signet;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import java.util.List;

public class DefaultSignetService implements SignetService {

    @Override
    public void list(List<String> groupsAndUserIds, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();
        String query = "SELECT DISTINCT s.id, s.resource_id, discipline_label as disciplines, level_label as levels, key_words as plain_text, " +
                "title, imageurl, s.owner_name, s.owner_id, url, date_creation, date_modification, favorite, collab, archived, orientation" +
                " FROM " + Mediacentre.SIGNET_TABLE + " s" +
                " LEFT JOIN " + Mediacentre.SIGNET_SHARES_TABLE + " ss ON s.id = ss.resource_id " +
                " LEFT JOIN " + Mediacentre.MEMBERS_TABLE + " m ON (ss.member_id = m.id AND m.group_id IS NOT NULL) " +
                " WHERE s.owner_id = ? OR (ss.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray());
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
                "title, imageurl as image, owner_name, owner_id, url, date_creation, date_modification, favorite, collab, archived, orientation FROM " + Mediacentre.SIGNET_TABLE + " WHERE id = ?;";
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
    public void getMyFormRights(String signetId, List<String> groupsAndUserIds, Handler<Either<String, JsonArray>> handler) {
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
    public void getAllMyFormRights(List<String> groupsAndUserIds, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT resource_id, action FROM " + Mediacentre.SIGNET_SHARES_TABLE +
                " WHERE member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND action IN (?, ?);";
        JsonArray params = new JsonArray()
                .addAll(new fr.wseduc.webutils.collections.JsonArray(groupsAndUserIds))
                .add(Mediacentre.VIEW_RESOURCE_BEHAVIOUR)
                .add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    public void getPublicSignet(String userId, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.filterSource(Signet.class, userId, ElasticSearchHelper.searchHandler(Signet.class, null, handler));
    }

}
