package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.service.TextBookService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.mongodb.MongoDbResult;

public class DefaultTextBookService implements TextBookService {
    private String TEXTBOOK_COLLECTION = "mediacentre.textbooks";

    @Override
    public void get(String userId, Handler<Either<String, JsonArray>> handler) {
        JsonObject matcher = new JsonObject()
                .put("user", userId);

        MongoDb.getInstance().find(TEXTBOOK_COLLECTION, matcher, MongoDbResult.validResultsHandler(handler));
    }

    @Override
    public void insert(String userId, JsonArray textbooks, Handler<Either<String, JsonObject>> handler) {
        for (int i = 0; i < textbooks.size(); i++) {
            JsonObject textbook = textbooks.getJsonObject(i);
            textbook.put("user", userId);
        }

        MongoDb.getInstance().insert(TEXTBOOK_COLLECTION, textbooks, MongoDbResult.validResultHandler(handler));
    }
}
