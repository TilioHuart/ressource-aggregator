package fr.openent.mediacentre.source;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.Arrays;
import java.util.List;

public interface Source {
    String RESOURCE_TYPE_NAME = "_doc";

    List<String> PLAIN_TEXT_FIELDS = Arrays.asList("title", "plain_text", "levels", "disciplines", "editors", "authors", "description");

    /**
     * Plain text search
     *
     * @param query   String query
     * @param user    Current user
     * @param handler Function handler returning data
     */
    void plainTextSearch(String query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler);

    /**
     * Plain text search
     *
     * @param query   String query
     * @param user    Current user
     * @param idStructures List of structures id
     * @param handler Function handler returning data
     */
    default void plainTextSearch(String query, UserInfos user, List<String> idStructures, Handler<Either<JsonObject, JsonObject>> handler){
        plainTextSearch(query, user, handler);
    }

    /**
     * Advanced search
     *
     * @param query   Object query
     * @param user    Current user
     * @param handler Function handler returning data
     */
    void advancedSearch(JsonObject query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler);

    /**
     * Format resource
     *
     * @param resource resource to format
     * @return formatted resource
     */
    JsonObject format(JsonObject resource);

    /**
     * Amass resources.
     */
    void amass();

    /**
     * Set EventBus
     *
     * @param eb event bus
     */
    void setEventBus(EventBus eb);

    /**
     * Set module configuration
     *
     * @param config Module configuration
     */
    void setConfig(JsonObject config);
}
