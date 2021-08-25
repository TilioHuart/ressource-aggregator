package fr.openent.mediacentre.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface SignetSharesService {
    void getSharedWithMe(String formId, UserInfos user, Handler<Either<String, JsonArray>> handler);
}