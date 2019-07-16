package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.enums.SearchState;
import fr.openent.mediacentre.helper.WorkflowHelper;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.CookieHelper;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.List;

import static fr.wseduc.webutils.request.filter.UserAuthFilter.SESSION_ID;

public class WebSocketController implements Handler<ServerWebSocket> {

    private final EventBus eb;
    private final List<Source> sources;
    private final Logger log = LoggerFactory.getLogger(WebSocketController.class);

    public WebSocketController(EventBus eb, List<Source> sources) {
        this.eb = eb;
        this.sources = sources;
    }

    @Override
    public void handle(ServerWebSocket ws) {
        ws.pause();
        String sessionId = CookieHelper.getInstance().getSigned(SESSION_ID, ws);
        UserUtils.getSession(eb, sessionId, user -> {
            UserInfos userInfos = new UserInfos();
            userInfos.setAuthorizedActions(getUserActions(user));
            userInfos.setUserId(user.getString("userId"));
            userInfos.setStructures(user.getJsonArray("structures").getList());
            if (!WorkflowHelper.hasRight(userInfos, Mediacentre.VIEW_RIGHT)) {
                ws.reject(401);
                return;
            }

            ws.frameHandler(frame -> {
                UserUtils.getSession(eb, sessionId, session -> {
                    if (session == null) {
                        ws.writeTextMessage(new JsonObject().put("error", "Unauthorized").put("status", "ko").encode());
                        return;
                    }
                    JsonObject message = new JsonObject(frame.textData());
                    switch (message.getString("event")) {
                        case "search": {
                            search(message.getString("state"), message.getJsonObject("data"), userInfos, ws);
                            break;
                        }
                        default:
                            ws.writeTextMessage(new JsonObject().put("error", "Unknown event").put("status", "ko").encode());
                    }
                });
            });
            ws.resume();
        });
    }

    /**
     * Execute sources search
     *
     * @param data Frame message
     * @param ws   WebSocket
     */
    private void search(String state, JsonObject data, UserInfos user, ServerWebSocket ws) {
        Handler<Either<String, JsonObject>> handler = event -> {
            if (event.isLeft()) {
                log.error("[WebSockerController@search] Failed to retrieve source resources.", event.left().getValue());
            } else {
                JsonObject frame = new JsonObject()
                        .put("event", "search_Result")
                        .put("status", "ok")
                        .put("data", event.right().getValue());
                ws.writeTextMessage(frame.encode());
            }
        };
        if (SearchState.PLAIN_TEXT.toString().equals(state)) {
            String query = data.getString("query");
            for (Source source : sources) {
                source.plainTextSearch(query, user, handler);
            }
        }
    }

    private List<UserInfos.Action> getUserActions(JsonObject user) {
        List<UserInfos.Action> actions = new ArrayList<>();
        JsonArray authorizedActions = user.getJsonArray("authorizedActions");
        for (int i = 0; i < authorizedActions.size(); i++) {
            JsonObject action = authorizedActions.getJsonObject(i);
            UserInfos.Action uact = new UserInfos.Action();
            uact.setName(action.getString("name"));
            uact.setDisplayName(action.getString("displayName"));
            uact.setType(action.getString("type"));
            actions.add(uact);
        }

        return actions;
    }
}

