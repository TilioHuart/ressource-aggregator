package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public interface TextBookService {

    /**
     * Get user textbooks
     *
     * @param userId  User that needs to retrieve textbooks
     * @param handler Function handler returning data
     */
    void get(String userId, Handler<Either<String, JsonArray>> handler);

    /**
     * Insert multiple textbooks. Used by textbooks initialization
     *
     * @param userId    User that needs to insert textbooks
     * @param textbooks Textbook list to insert
     * @param handler   Function handler returning data
     */
    void insert(String userId, JsonArray textbooks, Handler<Either<String, JsonObject>> handler);

    /**
     * Drop all user textbooks
     *
     * @param userId  User identifier we drop textbooks
     * @param handler Function handler returning data
     */
    void delete(String userId, Handler<Either<String, JsonObject>> handler);
}
