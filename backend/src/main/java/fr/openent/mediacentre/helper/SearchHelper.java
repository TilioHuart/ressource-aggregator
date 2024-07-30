package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.enums.SearchState;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class SearchHelper extends ControllerHelper {

    public void searchRetrieve(              UserInfos user,
                                             JsonArray expectedSources,
                                             List<Source> sources,
                                             JsonObject data,
                                             String state,
                                             List<String> idStructures,
                                             Handler<Either<JsonObject, JsonObject>> handler) {

        if (expectedSources.isEmpty()) {
            // If expected sources is empty. Search in all sources
            expectedSources = new JsonArray(sources.stream().map(source -> source.getClass().getName()).collect(Collectors.toList()));
        }

        if (SearchState.PLAIN_TEXT.toString().equals(state)) {
            String query = data.getString("query");
            for (Source source : sources) {
                if (expectedSources.contains(source.getClass().getName())) source.plainTextSearch(query, user, idStructures, handler);
            }
        } else if (SearchState.ADVANCED.toString().equals(state)) {
            for (Source source : sources) {
                if (expectedSources.contains(source.getClass().getName()))
                    source.advancedSearch(data.copy(), user, handler);
            }
        }
    }

    public void search(     String state,
                            List<Source> sources,
                            JsonArray expectedSources,
                            JsonObject data,
                            UserInfos user,
                            List<String> idStructures,
                            ResponseHandlerHelper answer
    ) {
        Handler<Either<JsonObject, JsonObject>> handler = event -> {
            if (event.isLeft()) {
                log.error("[SearchController@search] Failed to retrieve source resources.", event.left().getValue());
                answer.storeMultiple(new JsonObject().put("error", event.left().getValue()).put("status", "ko"),
                        expectedSources.size());
            } else {
                answer.storeMultiple(HelperUtils
                        .frameLoad( "search_Result",
                                        state, "ok",
                                        event.right().getValue()),
                        expectedSources.size()
                );
            }
        };
        if (SearchState.PLAIN_TEXT.toString().equals(state) || SearchState.ADVANCED.toString().equals(state)){
            searchRetrieve(user, expectedSources, sources, data, state, idStructures, handler);
        }
        else
            answer.answerFailure(new JsonObject().put("error", "Unknown search type").put("status", "ko").encode());
    }

    public Future<JsonArray> search(String state,
                                    List<Source> sources,
                                    JsonArray expectedSources,
                                    JsonObject data,
                                    UserInfos user,
                                    List<String> idStructures
    ) {
        Promise<JsonArray> promise = Promise.promise();
        JsonArray combinedResults = new JsonArray();
        AtomicInteger counter = new AtomicInteger(expectedSources.size());
        Handler<Either<JsonObject, JsonObject>> handler = event -> {
            synchronized (counter) {
                if (event.isLeft()) {
                    log.error("[SearchController@search] Failed to retrieve source resources :" + event.left().getValue());
                } else {
                    JsonArray resources = event.right().getValue().getJsonArray(Field.RESOURCES);
                    if (resources != null && !resources.isEmpty())
                        combinedResults.addAll(resources);
                }
                if (counter.decrementAndGet() == 0) {
                    promise.complete(combinedResults);
                }
            }
        };

        if (SearchState.PLAIN_TEXT.toString().equals(state) || SearchState.ADVANCED.toString().equals(state)){
            searchRetrieve(user, expectedSources, sources, data, state, idStructures, handler);
        }

        return promise.future();
    }
}
