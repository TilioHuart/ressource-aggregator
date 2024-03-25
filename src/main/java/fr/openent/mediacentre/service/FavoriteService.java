package fr.openent.mediacentre.service;

import fr.openent.mediacentre.model.SignetResource;
import fr.openent.mediacentre.source.Signet;
import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.Optional;

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
     * Create favorite
     * @param favorite  body favorite
     */
    Future<JsonObject> create(JsonObject favorite);

    /**
     * Get resource with favorite
     * @param source    source parameter
     * @param userId    User identifier
     * @return {@link Future<JsonArray>} the favorites of the user
     */
    Future<JsonArray> get(String source, String userId);

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

    Future<Optional<SignetResource>> createSQL(JsonObject favorite, String userId);

    Future<Optional<SignetResource>> updateSQL(int signetId, String userId, boolean isFavorite, boolean isShare);

    /**
     * Delete favorite
     * @param favorite  favorite identifier as parameter
     * @param source    favorite source as parameter
     * @param userId    id of the connected user
     */
    Future<JsonObject> delete(String favorite, String source, String userId);
}
