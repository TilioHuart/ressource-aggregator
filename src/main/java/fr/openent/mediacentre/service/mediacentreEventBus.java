package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

public interface mediacentreEventBus {

    /**
     * Create resources in Mediacentre
     * @param signet JsonObject with the id to publish
     * @param handler function handler returning data
     */

    void publishInMediacentre(JsonObject signet, final Handler<Either<String, JsonObject>> handler);

}
