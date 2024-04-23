package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

public interface moduleSQLRequestService {

    /**
     * get All Disciplines
     * @param handler function handler returning data
     */
    void getDisciplines (Handler<Either<String, JsonArray>> handler);

    /**
     * get All Levels
     * @param handler function handler returning data
     */
    void getLevels (Handler<Either<String, JsonArray>> handler) ;
}
