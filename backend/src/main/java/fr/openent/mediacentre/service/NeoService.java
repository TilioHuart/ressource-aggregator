package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

public interface NeoService {

    void getIdsFromBookMarks(JsonArray bookmarksIds, Handler<Either<String, JsonArray>> handler);

    void getUsersInfosFromIds(JsonArray groupIds, Handler<Either<String, JsonArray>> handler);
}
