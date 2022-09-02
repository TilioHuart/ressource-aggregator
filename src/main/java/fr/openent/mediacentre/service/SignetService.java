package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;
import java.util.List;

public interface SignetService {
    /**
     * List all signets created by me or shared with me
     * @param groupsAndUserIds list of neo ids including the connected user
     * @param user user connected
     * @param handler function handler returning JsonArray data
     */
    void list(List<String> groupsAndUserIds, UserInfos user, Handler<Either<String, JsonArray>> handler);

    /**
     * List all the signets sent to me
     * @param user user connected
     * @param handler function handler returning JsonArray data
     */
    void listSentForms(UserInfos user, Handler<Either<String, JsonArray>> handler);

    /**
     * Get a specific signet by id
     * @param signetId signet identifier
     * @param handler function handler returning JsonObject data
     */
    void get(String signetId, Handler<Either<String, JsonObject>> handler);

    /**
     * Create a signet
     * @param signet JsonObject data
     * @param user user connected
     * @param handler function handler returning JsonObject data
     */
    void create(JsonObject signet, UserInfos user, Handler<Either<String, JsonObject>> handler);

    /**
     * Update a specific signet
     * @param signetId signet identifier
     * @param signet JsonObject data
     * @param handler function handler returning JsonObject data
     */
    void update(String signetId, JsonObject signet, Handler<Either<String, JsonObject>> handler);

    /**
     * Update a specific signet collab
     * @param signetId signet identifier
     * @param signet JsonObject data
     * @param handler function handler returning JsonObject data
     */
    void updateCollab(String signetId, JsonObject signet, Handler<Either<String, JsonObject>> handler);

    /**
     * Delete a specific signet
     * @param signetId signet identifier
     * @return Future with completed JsonObject
     */
    Future<JsonObject> delete(String signetId);

    /**
     * Delete a scpecific signet
     * @param signetId signet identifier
     * @param handler function handler returning JsonObject data
     */
    void delete(String signetId, Handler<Either<String, JsonObject>> handler);

    void search(List<String> groupsAndUserIds, UserInfos user, String query, Handler<Either<String, JsonArray>> handler);

    void advancedSearch(List<String> groupsAndUserIds, UserInfos user, Object query, Handler<Either<String, JsonArray>> arrayResponseHandler);

    /**
     * Get my rights for a specific signet
     * @param signetId signet identifier
     * @param groupsAndUserIds list of neo ids including the connected user
     * @param handler function handler returning JsonArray data
     */
    void getMySignetRights(String signetId, List<String> groupsAndUserIds, Handler<Either<String, JsonArray>> handler);

    /**
     * Set published value of a signet
     * @param signetId signet identifier
     * @param publishValue published value to set
     * @param handler function handler returning JsonObject data
     */
    void setPublishValueSignet(String signetId, boolean publishValue, Handler<Either<String, JsonObject>> handler);

    /**
     * Get my rights for all the signets
     * @param groupsAndUserIds list of neo ids including the connected user
     * @param handler function handler returning JsonArray data
     */
    void getAllMySignetRights(List<String> groupsAndUserIds, Handler<Either<String, JsonArray>> handler);

    void getPublicSignet(String userId, Handler<Either<JsonObject, JsonObject>> handler);

    void getMyPublishedSignet(String userId, Handler<Either<JsonObject, JsonObject>> handler);

    void searchMyPublishedSignet(String query, String userId, Handler<Either<JsonObject, JsonObject>> handler);

    void deleteMyPublishedSignet(String signetId, Handler<Either<JsonObject, JsonObject>> handler);

}
