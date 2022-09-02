package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public interface FavoriteService {

    /**
     * Create favorite
     * @param favorite  body favorite
     * @param handler   function handler returning da
     */
    void create(JsonObject favorite, Handler<Either<String, JsonObject>> handler);

    /**
     * Get resource with favorite
     * @param source    source parameter
     * @param userId    User identifier
     * @param handler   function handler returning da
     */
    void get(String source, String userId, Handler<Either<String, JsonArray>> handler);

    /**
     * Delete favorite
     *
     * @param favoriteId    favorite identifier as parameter (could be signet identifier or resource identifier)
     * @param source        favorite source as parameter
     * @param userId        user identifier
     * @return Future JsonObject completed
     */
    Future<JsonObject> delete(String favoriteId, String source, String userId);

    /**
     * Delete favorite
     * @param favorite  favorite identifier as parameter
     * @param source    favorite source as parameter
     * @param userId
     * @param handler   function handler returning da
     */
    void delete(String favorite, String source, String userId, Handler<Either<String, JsonObject>> handler);

    void createSQL(JsonObject favorite, String userId, Handler<Either<String, JsonObject>> defaultResponseHandler);

    void updateSQL(int favoriteId, String userId, boolean isFavorite, boolean isShare, Handler<Either<String, JsonObject>> handler);

    void getDesactivated(String signetId, JsonArray responders, Handler<Either<String, JsonArray>> handler);
}
