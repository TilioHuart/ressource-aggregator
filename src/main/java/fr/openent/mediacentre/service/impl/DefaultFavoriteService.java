package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.service.FavoriteService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Utils;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;

public class DefaultFavoriteService implements FavoriteService {

    private final Logger log = LoggerFactory.getLogger(DefaultFavoriteService.class);
    private final String TOKEN_COLLECTION = "mediacentre.favorite";

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
    public void get(String source, String userId, Handler<Either<String, JsonArray>> handler) {
        JsonObject matcher = new JsonObject().put("user", userId);
        if (source != null) matcher.put("source", source);
        MongoDb.getInstance().find(TOKEN_COLLECTION, matcher, message -> handler.handle(Utils.validResults(message)));
    }

    @Override
    public void delete(String favoriteId, String source, Handler<Either<String, JsonObject>> handler) {
        JsonObject matcher = new JsonObject()
                .put("id", source.equals("fr.openent.mediacentre.source.Signet") ? Integer.parseInt(favoriteId) : favoriteId)
                .put("source", source);
        MongoDb.getInstance().delete(TOKEN_COLLECTION, matcher, message -> handler.handle(Utils.validResult(message)));
    }

    @Override
    public void createSQL(JsonObject favoritesBody, String userId, Handler<Either<String, JsonObject>> handler) {
        String query = "INSERT INTO " + Mediacentre.FAVORITES_TABLE + " (signet_id, user_id, favorite) VALUES (?, ?, ?) ";
        JsonArray params = new JsonArray()
                .add(favoritesBody.getInteger("id"))
                .add(userId)
                .add(false);
        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updateSQL(int favoriteId, String userId, boolean isFavorite, Handler<Either<String, JsonObject>> handler) {
        String query = "INSERT INTO " + Mediacentre.FAVORITES_TABLE + " (signet_id, user_id, favorite) VALUES (?, ?, ?) " +
                "ON CONFLICT (signet_id, user_id) DO UPDATE SET favorite = ?";
        JsonArray params = new JsonArray()
                .add(favoriteId)
                .add(userId)
                .add(isFavorite)
                .add(isFavorite);
        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }
}
