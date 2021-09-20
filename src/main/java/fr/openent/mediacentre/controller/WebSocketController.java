package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.enums.SearchState;
import fr.openent.mediacentre.helper.FavoriteHelper;
import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.helper.WorkflowHelper;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.service.TextBookService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.openent.mediacentre.service.impl.DefaultSignetService;
import fr.openent.mediacentre.service.impl.DefaultTextBookService;
import fr.openent.mediacentre.source.GAR;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.CookieHelper;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
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
import java.util.stream.Collectors;

import static fr.wseduc.webutils.request.filter.UserAuthFilter.SESSION_ID;

public class WebSocketController implements Handler<ServerWebSocket> {

    private final EventBus eb;
    private final List<Source> sources;
    private final Logger log = LoggerFactory.getLogger(WebSocketController.class);
    private final FavoriteService favoriteService = new DefaultFavoriteService();
    private final TextBookService textBookService = new DefaultTextBookService();
    private final SignetService signetService = new DefaultSignetService();
    private final FavoriteHelper favoriteHelper = new FavoriteHelper();


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
                    JsonArray sources = message.getJsonArray("sources");
                    JsonObject data = message.getJsonObject("data", new JsonObject());
                    switch (message.getString("event")) {
                        case "search": {
                            search(state, sources, data, userInfos, ws);
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
        if ("get".equals(state)) {
            favoriteService.get(null, user.getUserId(), event -> {
                if (event.isLeft()) {
                    log.error("[favorite@get] Failed to retrieve favorite", event.left());
                    ws.writeTextMessage(new JsonObject().put("error", "Fail to retrieve favorite").put("status", "ko").encode());
                    return;
                }
                JsonArray favorites = event.right().getValue();
                if (favorites.isEmpty()) {
                    JsonObject frame = new JsonObject()
                            .put("event", "favorites_Result")
                            .put("state", "initialization")
                            .put("status", "ok")
                            .put("data", new JsonObject());
                    ws.writeTextMessage(frame.encode());
                } else {
                    JsonObject frame = new JsonObject()
                            .put("event", "favorites_Result")
                            .put("state", state)
                            .put("status", "ok")
                            .put("data", event.right().getValue());
                    ws.writeTextMessage(frame.encode());
                }
            });
        } else {
            ws.writeTextMessage(new JsonObject().put("error", "Unknown favorite action").put("status", "ko").encode());
        }
    }

    /**
     * Execute sources search
     *
     * @param state           State request
     * @param expectedSources Source to search. Execute on those sources.
     * @param data            Frame message
     * @param ws              WebSocket
     */
    private void search(String state, JsonArray expectedSources, JsonObject data, UserInfos user, ServerWebSocket ws) {
        Handler<Either<JsonObject, JsonObject>> handler = event -> {
            if (event.isLeft()) {
                log.error("[WebSockerController@search] Failed to retrieve source resources.", event.left().getValue());
                ws.writeTextMessage(new JsonObject().put("error", event.left().getValue()).put("status", "ko").encode());
            } else {
                JsonObject frame = new JsonObject()
                        .put("event", "search_Result")
                        .put("state", state)
                        .put("status", "ok")
                        .put("data", event.right().getValue());
                ws.writeTextMessage(frame.encode());
            }
        };

        if (expectedSources.isEmpty()) {
            // If expected sources is empty. Search in all sources
            expectedSources = new JsonArray(sources.stream().map(source -> source.getClass().getName()).collect(Collectors.toList()));
        }

        if (SearchState.PLAIN_TEXT.toString().equals(state)) {
            String query = data.getString("query");
            for (Source source : sources) {
                if (expectedSources.contains(source.getClass().getName())) source.plainTextSearch(query, user, handler);
            }
        } else if (SearchState.ADVANCED.toString().equals(state)) {
            for (Source source : sources) {
                if (expectedSources.contains(source.getClass().getName()))
                    source.advancedSearch(data.copy(), user, handler);
            }
        } else {
            ws.writeTextMessage(new JsonObject().put("error", "Unknown search type").put("status", "ko").encode());
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
        switch (state) {
            case "get": {
                getTextbooks(state, user, ws);
            }
            break;
            case "refresh": {
                refreshTextBooks(state, user, ws);
            }
            break;
            default:
                ws.writeTextMessage(new JsonObject().put("error", "Unknown textbook action").put("status", "ko").encode());
        }
    }

    private void refreshTextBooks(String state, UserInfos user, ServerWebSocket ws) {
        textBookService.delete(user.getUserId(), event -> {
            if (event.isLeft()) {
                log.error("[WebSocketController@refreshTextBooks] Failed to delete user textbooks");
                ws.writeTextMessage(new JsonObject().put("error", "Failed to delete user textbooks").put("status", "ko").encode());
                return;
            }

            getTextbooks(state, user, ws);
        });
    }

    private void getTextbooks(String state, UserInfos user, ServerWebSocket ws) {
        Future<JsonArray> getTextBookFuture = Future.future();
        Future<JsonArray> getFavoritesResourcesFuture = Future.future();

        favoriteService.get(GAR.class.getName(), user.getUserId(), FutureHelper.handlerJsonArray(getFavoritesResourcesFuture));
        textBookService.get(user.getUserId(), FutureHelper.handlerJsonArray(getTextBookFuture));

        CompositeFuture.all(getTextBookFuture, getFavoritesResourcesFuture).setHandler(event -> {
            if (event.failed()) {
                log.error("[textBook@get] Failed to retrieve user textbooks", event.cause().toString());
                ws.writeTextMessage(new JsonObject().put("error", "Field to retrieve textbooks").put("status", "ko").encode());
                return;
            }

            JsonArray textBooks = getTextBookFuture.result();
            favoriteHelper.matchFavorite(getFavoritesResourcesFuture, textBooks);


            if (textBooks.isEmpty()) {
                initUserTextBooks(user, ws);
                JsonObject frame = new JsonObject()
                        .put("event", "textbooks_Result")
                        .put("state", "initialization")
                        .put("status", "ok")
                        .put("data", new JsonObject());
                ws.writeTextMessage(frame.encode());
            } else {
                JsonObject frame = new JsonObject()
                        .put("event", "textbooks_Result")
                        .put("state", state)
                        .put("status", "ok")
                        .put("data", new JsonObject().put("textbooks", textBooks));
                ws.writeTextMessage(frame.encode());
            }
        });
    }

    private void getSignet(String state, UserInfos user, ServerWebSocket ws) {
        Handler<Either<JsonObject, JsonObject>> handler = event -> {
            if (event.isLeft()) {
                log.error("[WebSockerController@getSignet] Failed to retrieve source resources.", event.left().getValue());
                ws.writeTextMessage(new JsonObject().put("error", event.left().getValue()).put("status", "ko").encode());
            } else {
                JsonObject frame = new JsonObject()
                        .put("event", "signets_Result")
                        .put("state", state)
                        .put("status", "ok")
                        .put("data", new JsonObject().put("signets", event.right().getValue()));
                ws.writeTextMessage(frame.encode());
            }
        };
         signetService.getPublicSignet(user.getUserId(), handler);
    }

    /**
     * Init user textbooks
     *
     * @param user Current user
     * @param ws   WebSocketServer used to send response
     */
    private void initUserTextBooks(UserInfos user, ServerWebSocket ws) {
        for (Source source : sources) {
            if (source instanceof GAR) {
                ((GAR) source).initTextBooks(user, event -> {
                    if (event.isLeft()) {
                        log.error("[WebSocketController] Failed to retrieve GAR textbooks", event.left().getValue());
                        ws.writeTextMessage(new JsonObject().put("error", "Failed to retrieve GAR textbooks").put("status", "ko").encode());
                        return;
                    }

                    JsonArray textbooks = event.right().getValue();
                    if (textbooks.isEmpty()) {
                        JsonObject frame = new JsonObject()
                                .put("event", "textbooks_Result")
                                .put("state", "get")
                                .put("status", "ok")
                                .put("data", new JsonObject().put("textbooks", textbooks));
                        ws.writeTextMessage(frame.encode());
                        return;
                    }
                    textBookService.insert(user.getUserId(), textbooks, either -> {
                        if (either.isLeft()) {
                            log.error("[WebSocketController] Failed to insert user textbooks", either.left().getValue());
                            ws.writeTextMessage(new JsonObject().put("error", "Failed to insert GAR textbooks").put("status", "ko").encode());
                            return;
                        }

                        JsonObject frame = new JsonObject()
                                .put("event", "textbooks_Result")
                                .put("state", "get")
                                .put("status", "ok")
                                .put("data", new JsonObject().put("textbooks", textbooks));
                        ws.writeTextMessage(frame.encode());
                    });
                });
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

