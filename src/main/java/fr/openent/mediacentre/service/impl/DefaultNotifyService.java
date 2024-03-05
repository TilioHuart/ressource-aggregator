package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.service.NotifyService;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.http.request.JsonHttpServerRequest;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.user.UserInfos;

import java.util.Collections;
import java.util.List;

import static fr.openent.mediacentre.core.constants.Field.*;

public class DefaultNotifyService implements NotifyService {
    private static final Logger log = LoggerFactory.getLogger(DefaultNotifyService.class);

    private final TimelineHelper timelineHelper;

    public DefaultNotifyService(TimelineHelper timelineHelper){
        this.timelineHelper = timelineHelper;
    }

    @Override
    public void notifyNewResourceFromCRON(String recipientId, List<JsonObject> newResources) {
        HttpServerRequest request = new JsonHttpServerRequest(new JsonObject());
        notifyNewResources(request, recipientId, newResources);
    }

    private void notifyNewResources(HttpServerRequest request, String recipientId, List<JsonObject> newResources) {
        int nbNewResources = newResources.size();
        if (nbNewResources < 1) return;
        String redirectionUri = nbNewResources > 1 ? MEDIACENTRE_URL : newResources.get(0).getString(LINK);

        JsonObject params = new JsonObject()
                .put(CAMEL_NB_NEW_RESOURCES, nbNewResources)
                .put(CAMEL_NEW_RESOURCES, newResources)
                .put(CAMEL_PUSH_NOTIF, new JsonObject().put(TITLE, "push.notif.mediacentre.newResource").put(BODY, ""))
                .put(CAMEL_REDIRECTION_URI, redirectionUri);
        UserInfos sender = new UserInfos();

        timelineHelper.notifyTimeline(request, "mediacentre.new_resources_notification", sender, Collections.singletonList(recipientId), params);
    }
}