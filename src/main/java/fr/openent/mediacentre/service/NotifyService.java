package fr.openent.mediacentre.service;

import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface NotifyService {

    /**
     * Send notification when new resources has been affected to the current user
     * @param recipientId id of the user to notify
     * @param newResources new resources for this user
     */
    void notifyNewResourceFromCRON(String recipientId, List<JsonObject> newResources);
}
