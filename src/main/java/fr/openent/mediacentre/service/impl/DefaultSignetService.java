package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.service.SignetService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import java.util.List;
import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;

public class DefaultSignetService implements SignetService {

    @Override
    public void list(List<String> groupsAndUserIds, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT * FROM " + Mediacentre.SIGNET_TABLE +
                " WHERE owner_id = ? ORDER BY fullname;";
        JsonArray params = new JsonArray().add(user.getUserId());
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void listSentForms(UserInfos user, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT * FROM " + Mediacentre.SIGNET_TABLE +
                " ORDER BY fullname;";
        JsonArray params = new JsonArray().add(user.getUserId()).add(true);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void get(String signetId, Handler<Either<String, JsonObject>> handler) {
        String query = "SELECT * FROM " + Mediacentre.SIGNET_TABLE + " WHERE id = ?;";
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

        JsonArray disciplineArray = new JsonArray();
        if(signet.containsKey("disciplines")) {
            for (int i = 0; i < signet.getJsonArray("disciplines").size(); i++) {
                disciplineArray.add((signet.getJsonArray("disciplines").getJsonObject(i).getString("label")));
            }
        }

        JsonArray plainTextArray = new JsonArray();
        if(signet.containsKey("plain_text")) {
            for (int i = 0; i < signet.getJsonArray("plain_text").size(); i++) {
                plainTextArray.add((signet.getJsonArray("plain_text").getJsonObject(i).getString("label")));
            }
        }

        String query = "INSERT INTO " + Mediacentre.SIGNET_TABLE + " (discipline_label, level_label, key_words, fullname, " +
                "imageurl, owner_name, owner_id, url, date_creation, date_modification) " +
                "VALUES (" + Sql.arrayPrepared(disciplineArray) + " ," + Sql.arrayPrepared(levelArray) + " ," + Sql.arrayPrepared(plainTextArray) + ", ?, ?, ?, ?, ?, ?, ?) RETURNING *;";
        JsonArray params = new JsonArray()
                .addAll(disciplineArray)
                .addAll(levelArray)
                .addAll(plainTextArray)
                .add(signet.getString("title", ""))
                .add(signet.getString("picture", ""))
                .add(user.getLastName() + " " + user.getFirstName())
                .add(user.getUserId())
                .add(signet.getString("url"))
                .add("NOW()").add("NOW()");

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void update(String signetId, JsonObject signet, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Mediacentre.SIGNET_TABLE + " SET title = ?, description = ?, picture = ?, date_modification = ?, " +
                "date_opening = ?, date_ending = ?, sent = ?, collab = ?, reminded = ?, archived = ?, " +
                "multiple = CASE (SELECT count > 0 FROM nbResponses) " +
                "WHEN false THEN ? WHEN true THEN (SELECT multiple FROM " + Mediacentre.SIGNET_TABLE +" WHERE id = ?) END, " +
                "anonymous = CASE (SELECT count > 0 FROM nbResponses) " +
                "WHEN false THEN ? WHEN true THEN (SELECT anonymous FROM " + Mediacentre.SIGNET_TABLE +" WHERE id = ?) END " +
                "WHERE id = ? RETURNING *;";

        JsonArray params = new JsonArray()
                .add(signetId)
                .add(signet.getString("title", ""))
                .add(signet.getString("description", ""))
                .add(signet.getString("picture", ""))
                .add("NOW()")
                .add(signet.getString("date_opening", "NOW()"))
                .add(signet.getString("date_ending", null))
                .add(signet.getBoolean("sent", false))
                .add(signet.getBoolean("collab", false))
                .add(signet.getBoolean("reminded", false))
                .add(signet.getBoolean("archived", false))
                .add(signet.getBoolean("multiple", false)).add(signetId)
                .add(signet.getBoolean("anonymous", false)).add(signetId)
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
                " WHERE resource_id = ? AND member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND action IN (?, ?, ?);";
        JsonArray params = new JsonArray()
                .add(signetId)
                .addAll(new fr.wseduc.webutils.collections.JsonArray(groupsAndUserIds))
                .add(Mediacentre.CONTRIB_RESOURCE_BEHAVIOUR)
                .add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR)
                .add(Mediacentre.RESPONDER_RESOURCE_BEHAVIOUR);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void getAllMyFormRights(List<String> groupsAndUserIds, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT resource_id, action FROM " + Mediacentre.SIGNET_SHARES_TABLE +
                " WHERE member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND action IN (?, ?, ?);";
        JsonArray params = new JsonArray()
                .addAll(new fr.wseduc.webutils.collections.JsonArray(groupsAndUserIds))
                .add(Mediacentre.CONTRIB_RESOURCE_BEHAVIOUR)
                .add(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR)
                .add(Mediacentre.RESPONDER_RESOURCE_BEHAVIOUR);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

}
