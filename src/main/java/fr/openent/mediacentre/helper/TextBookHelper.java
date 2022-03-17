package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.TextBookService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.openent.mediacentre.service.impl.DefaultTextBookService;
import fr.openent.mediacentre.source.GAR;
import fr.openent.mediacentre.source.Source;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.stream.Collectors;


public class TextBookHelper {

    private final FavoriteService favoriteService = new DefaultFavoriteService();
    private final TextBookService textBookService = new DefaultTextBookService();
    private final Logger log = LoggerFactory.getLogger(TextBookHelper.class);
    private final FavoriteHelper favoriteHelper = new FavoriteHelper();

    public void retrieveTextBooks(String state, UserInfos user, List<Source> sources, ResponseHandlerHelper answer) {
        Future<JsonArray> getTextBookFuture = getTextBooks(user.getUserId());
        Future<JsonArray> getFavoritesResourcesFuture = getFavorite(GAR.class.getName(), user.getUserId());

        CompositeFuture.all(getTextBookFuture, getFavoritesResourcesFuture).setHandler(event -> {
            if (event.failed()) {
                log.error("[textBook@get] Failed to retrieve user textbooks", event.cause().toString());
                answer.answerFailure(new JsonObject().put("error", "Field to retrieve textbooks").put("status", "ko").encode());
                return;
            }

            JsonArray textBooks = getTextBookFuture.result();
            favoriteHelper.matchFavorite(getFavoritesResourcesFuture, textBooks);


            if (textBooks.isEmpty()) {
                initUserTextBooks(state, user, sources, answer);
            } else {
                answer.answerSuccess(HelperUtils.frameLoad(
                        "textbooks_Result",
                        state,
                        "ok",
                        new JsonObject().put("textbooks", textBooks)
                ).encode());
            }
        });
    }

    private Future<JsonArray> getTextBooks(String userId) {
        Promise<JsonArray> promise = Promise.promise();
        textBookService.get(userId, FutureHelper.handlerJsonArray(promise));
        return promise.future();
    }

    private Future<JsonArray> getFavorite(String source, String userId) {
        Promise<JsonArray> promise = Promise.promise();
        favoriteService.get(source.getClass().getName(), userId, FutureHelper.handlerJsonArray(promise));
        return promise.future();
    }

    public void initUserTextBooks(String state, UserInfos user, List<Source> sources, ResponseHandlerHelper answer) {
        sources = sources.stream().filter(source -> source instanceof GAR).collect(Collectors.toList());
        if (sources.isEmpty()) {
            answer.answerFailure("[WebSocketController] Failed to retrieve GAR textbooks\"");
        } else {
            retrieveUserTextbooks(state, user, sources.get(0), answer);
        }
    }

    private void retrieveUserTextbooks(String state, UserInfos user, Source source, ResponseHandlerHelper answer) {
        ((GAR) source).initTextBooks(user, event -> {
            if (event.isLeft()) {
                log.error("[TextBookHelper] Failed to retrieve GAR textbooks", event.left().getValue());
                answer.answerSuccess(new JsonObject().put("error", "Failed to retrieve GAR textbooks").put("status", "ko").encode());
                return;
            }
            JsonArray textbooks = event.right().getValue();
            if (textbooks.isEmpty()) {
                answer.answerSuccess(HelperUtils.frameLoad("textbooks_Result",
                        state,
                        "ok",
                        new JsonObject().put("textbooks", textbooks)).encode());
                return;
            }
            textBookService.insert(user.getUserId(), textbooks, either -> {
                if (either.isLeft()) {
                    log.error("[WebSocketController] Failed to insert user textbooks", either.left().getValue());
                    answer.answerFailure(new JsonObject()
                            .put("error", "Failed to insert GAR textbooks")
                            .put("status", "ko")
                            .encode());
                    return;
                }

                JsonObject frame = new JsonObject();
                HelperUtils.frameLoad("textbooks_Result", "get", "ok");
                frame.put("data", new JsonObject().put("textbooks", textbooks));
                answer.answerSuccess(HelperUtils.frameLoad("textbooks_Result",
                        state,
                        "ok",
                        new JsonObject().put("textbooks", textbooks)).encode()
                );
            });
        });
    }

    public void refreshTextBooks(String state,List<Source> sources, UserInfos user, ResponseHandlerHelper answer) {
        textBookService.delete(user.getUserId(), event -> {
            if (event.isLeft()) {
                log.error("[WebSocketController@refreshTextBooks] Failed to delete user textbooks");
                answer.answerFailure(new JsonObject()
                        .put("error", "Failed to delete user textbooks")
                        .put("status", "ko").encode());
                return;
            }
            retrieveTextBooks(state, user, sources, answer);
        });
    }
}
