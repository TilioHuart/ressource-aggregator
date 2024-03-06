package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

import java.util.Date;
import java.util.List;

public interface UserService {

    void getIdsFromBookMarks(JsonArray bookmarksIds, Handler<Either<String, JsonArray>> handler);

    void getUsersInfosFromIds(JsonArray groupIds, Handler<Either<String, JsonArray>> handler);

    Future<JsonArray> getUsersRecentlyConnected(Date dateLimit);

    Future<JsonArray> getUsersResourceInfos(List<String> usersIds);
}
