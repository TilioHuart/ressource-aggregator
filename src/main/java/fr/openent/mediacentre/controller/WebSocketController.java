package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.helper.*;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.openent.mediacentre.source.Source;
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

public class WebSocketController implements Handler<ServerWebSocket>{

    private final EventBus eb;
    private final List<Source> sources;
    private final Logger log = LoggerFactory.getLogger(WebSocketController.class);
    private final FavoriteService favoriteService = new DefaultFavoriteService();
    private final FavoriteHelper favoriteHelper = new FavoriteHelper();
    private final SignetHelper signetHelper = new SignetHelper();
    private final SearchHelper searchHelper = new SearchHelper();
    private final TextBookHelper textBookHelper = new TextBookHelper();

    public WebSocketController(EventBus eb, List<Source> sources) {
        this.eb = eb;
        this.sources = sources;
    }

    @Override
    public void handle(ServerWebSocket ws) {
        ws.pause();
        String sessionId = CookieHelper.getInstance().getSigned(SESSION_ID, ws);
        UserUtils.getSession(eb, sessionId, user -> {
            if (user == null) {
                ws.reject(401);
                return;
            }
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
                    if (!frame.isText()) return;
                    JsonObject message = new JsonObject(frame.textData());
                    String state = message.getString("state");
                    JsonArray expectedSources = message.getJsonArray("sources");
                    JsonObject data = message.getJsonObject("data", new JsonObject());
                    switch (message.getString("event")) {
                        case "search": {
                            searchHelper.search(state, sources, expectedSources, data, userInfos, new SocketHelper(ws));
                            break;
                        }
                        case "favorites": {
                            favorites(state, userInfos, ws);
                            break;
                        }
                        case "textbooks": {
                            textBooks(state, userInfos, ws);
                            break;
                        }
                        case "signets": {
                            getSignet(state, userInfos, ws);
                            break;
                        }
                        default:
                            ws.writeTextMessage(new JsonObject().put("error", "Unknown event").put("status", "ko").encode());
                    }
                });
            });
            ws.closeHandler(event -> log.info("Closed WebSocket"));
            ws.resume();
        });
    }

    private void favorites(String state, UserInfos user, ServerWebSocket ws) {
        SocketHelper socketHelper = new SocketHelper(ws);
        if ("get".equals(state)) {
            favoriteHelper.favoritesRetrieve(user, favoriteService, socketHelper);
        }
        else {
           socketHelper.answerFailure(new JsonObject().put("error", "Unknown favorite action").put("status", "ko").encode());
        }
    }



    /**
     * Text book management
     *
     * @param state State request
     * @param user  Current user
     * @param ws    WebSocket server
     */
    private void textBooks(String state, UserInfos user, ServerWebSocket ws) {
        SocketHelper socketHelper = new SocketHelper(ws);
        switch (state) {
            case "get": {
                textBookHelper.retrieveTextBooks(state, user, sources, socketHelper);
            }
            break;
            case "refresh": {
                textBookHelper.refreshTextBooks(state, sources, user, socketHelper);
            }
            break;
            default:
                socketHelper.answerFailure(new JsonObject().put("error", "Unknown textbook action").put("status", "ko").encode());
        }
    }

    private void getSignet(String state, UserInfos user, ServerWebSocket ws) {
        signetHelper.signetRetrieve(user, state, new SocketHelper(ws));
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

