package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.service.FavoriteService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Utils;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class DefaultFavoriteService implements FavoriteService {

    private final Logger log = LoggerFactory.getLogger(DefaultFavoriteService.class);
    private String TOKEN_COLLECTION = "mediacentre.favorite";

    @Override
    public void create(JsonObject favoritesBody, Handler<Either<String, JsonObject>> handler) {
        MongoDb.getInstance().insert(TOKEN_COLLECTION, favoritesBody, message -> {
            Either<String, JsonObject> either = Utils.validResult(message);
            if (either.isRight()) {
                handler.handle(new Either.Right<>(favoritesBody));
            } else {
                String err = "[DefaultFavoriteService@create] Failed to add favorite";
                log.error(err);
                handler.handle(new Either.Left<>(err));
            }
        });

    }

    @Override
    public void get(String source, Handler<Either<String, JsonArray>> handler) {
        JsonObject matcher = new JsonObject().put("source", source);
        MongoDb.getInstance().find(TOKEN_COLLECTION, matcher, message -> handler.handle(Utils.validResults(message)));
    }

    @Override
    public void delete(String favoriteId, String source, Handler<Either<String, JsonObject>> handler) {
        JsonObject matcher = new JsonObject()
                .put("id", favoriteId)
                .put("source", source);
        MongoDb.getInstance().delete(TOKEN_COLLECTION, matcher, message -> handler.handle(Utils.validResult(message)));
    }
}
