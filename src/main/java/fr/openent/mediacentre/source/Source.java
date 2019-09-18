package fr.openent.mediacentre.source;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface Source {
    // Boolean defining if the source needs to be harvested. By default false.
    boolean harvest = false;

    /**
     * Plain text search
     *
     * @param query   String query
     * @param user    Current user
     * @param handler Function handler returning data
     */
    void plainTextSearch(String query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler);

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
     * Harvest resources.
     */
    void harvest();

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
