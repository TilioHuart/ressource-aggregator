package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
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
     * @param favorite  favorite identifier as parameter
     * @param source    favorite source as parameter
     * @param handler   function handler returning da
     */
    void delete(String favorite, String source, Handler<Either<String, JsonObject>> handler);
}
