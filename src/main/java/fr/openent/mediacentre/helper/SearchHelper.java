package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.enums.SearchState;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.stream.Collectors;

public class SearchHelper extends ControllerHelper {

    public void searchRetrieve(              UserInfos user,
                                             JsonArray expectedSources,
                                             List<Source> sources,
                                             JsonObject data,
                                             String state,
                                             Handler<Either<JsonObject, JsonObject>> handler) {


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
        }
    }

    public void search(     String state,
                            List<Source> sources,
                            JsonArray expectedSources,
                            JsonObject data,
                            UserInfos user,
                            ResponseHandlerHelper answer
    ) {
        Handler<Either<JsonObject, JsonObject>> handler = event -> {
            if (event.isLeft()) {
                log.error("[SearchController@search] Failed to retrieve source resources.", event.left().getValue());
                answer.answerFailure(new JsonObject().put("error", event.left().getValue()).put("status", "ko").encode());
            } else {
                answer.answerSuccess(HelperUtils
                        .frameLoad( "search_Result",
                                        state, "ok",
                                        event.right().getValue())
                        .encode());
            }
        };

        if (expectedSources.isEmpty()) {
            // If expected sources is empty. Search in all sources
            expectedSources = new JsonArray(sources.stream().map(source -> source.getClass().getName()).collect(Collectors.toList()));
        }

        if (SearchState.PLAIN_TEXT.toString().equals(state) || SearchState.ADVANCED.toString().equals(state))
            searchRetrieve(user, expectedSources, sources, data, state, handler);
        else
            answer.answerFailure(new JsonObject().put("error", "Unknown search type").put("status", "ko").encode());
    }
}
