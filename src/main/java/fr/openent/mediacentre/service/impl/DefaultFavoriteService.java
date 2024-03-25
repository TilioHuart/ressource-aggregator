package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.enums.ErrorEnum;
import fr.openent.mediacentre.enums.SourceEnum;
import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.helper.IModelHelper;
import fr.openent.mediacentre.model.SignetResource;
import fr.openent.mediacentre.service.FavoriteService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Utils;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;

import java.util.Optional;

import static fr.openent.mediacentre.core.constants.Field.ID;

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
    public Future<JsonObject> create(JsonObject favoritesBody) {
        Promise<JsonObject> promise = Promise.promise();

        String errorMessage = "[Mediacentre@DefaultFavoriteService::create] Failed to create favorite in mongo database : ";
        MongoDb.getInstance().insert(TOKEN_COLLECTION, favoritesBody, MongoDbResult.validResultHandler(FutureHelper.handlerJsonObject(promise, errorMessage)));

        return promise.future();
    }

    @Override
    public Future<JsonArray> get(String source, String userId) {
        Promise<JsonArray> promise = Promise.promise();

        get(source, userId, event -> {
            if (event.isRight()) {
                promise.complete(event.right().getValue());
            } else {
                String message = String.format("[Mediacentre@%s::get] Error when fetching favorites: %s", this.getClass().getSimpleName(), event.left().getValue());
                log.error(message);
                promise.fail(ErrorEnum.ERROR_FAVORITE_FETCH.method());
            }
        });

        return promise.future();
    }

    @Override
    public void delete(String favoriteId, String source, String userId, Handler<Either<String, JsonObject>> handler) {
        JsonObject matcher = new JsonObject()
                .put(Field.USER, userId)
                .put(Field.SOURCE, source);

        if (source.equals(SourceEnum.SIGNET.method())) {
            matcher.put(ID, Integer.parseInt(favoriteId));
        } else {
            matcher.put(Field._ID, favoriteId);
        }

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
    public void updateSQL(int favoriteId, String userId, boolean isFavorite, boolean isShare, Handler<Either<String, JsonObject>> handler) {
        String query;
        JsonArray params = new JsonArray()
                .add(favoriteId)
                .add(userId)
                .add(isFavorite);
        if(isShare) {
            query = "INSERT INTO " + Mediacentre.FAVORITES_TABLE + " (signet_id, user_id, favorite) VALUES (?, ?, ?) " +
                    "ON CONFLICT (signet_id, user_id) DO NOTHING";
        } else {
            query = "INSERT INTO " + Mediacentre.FAVORITES_TABLE + " (signet_id, user_id, favorite) VALUES (?, ?, ?) " +
                    "ON CONFLICT (signet_id, user_id) DO UPDATE SET favorite = ?";
            params.add(isFavorite);
        }

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getDesactivated(String signetId, JsonArray responders, Handler<Either<String, JsonArray>> handler) {

        JsonArray params = new JsonArray().add(signetId).add(true);
        String query = "SELECT DISTINCT user_id FROM " + Mediacentre.FAVORITES_TABLE + " WHERE signet_id = ? and favorite = ? ";

        if (responders.size() > 0) {
            query += "AND user_id NOT IN (";
            for (Object id : responders) {
                query += "?, ";
                params.add(id.toString());
            }
            query = query.substring(0, query.length() - 2) + ");";
        }

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public Future<Optional<SignetResource>> createSQL(JsonObject favoritesBody, String userId) {
        Promise<Optional<SignetResource>> promise = Promise.promise();

        String query = "INSERT INTO " + Mediacentre.FAVORITES_TABLE + " (signet_id, user_id, favorite) VALUES (?, ?, ?) RETURNING *";
        JsonArray params = new JsonArray()
                .add(favoritesBody.getInteger(ID))
                .add(userId)
                .add(false);

        String errorMessage = "[Mediacentre@DefaultFavoriteService::createSQL] Failed to create new favorite in SQL database : ";
        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(IModelHelper.uniqueResultToIModel(promise, SignetResource.class, errorMessage)));

        return promise.future();
    }

    @Override
    public Future<Optional<SignetResource>> updateSQL(int signetId, String userId, boolean isFavorite, boolean isShare) {
        Promise<Optional<SignetResource>> promise = Promise.promise();

        String query;
        JsonArray params = new JsonArray()
                .add(signetId)
                .add(userId)
                .add(isFavorite);
        if (isShare) {
            query = "INSERT INTO " + Mediacentre.FAVORITES_TABLE + " (signet_id, user_id, favorite) VALUES (?, ?, ?) " +
                    "ON CONFLICT (signet_id, user_id) DO NOTHING" +
                    "RETURNING *";
        }
        else {
            query = "INSERT INTO " + Mediacentre.FAVORITES_TABLE + " (signet_id, user_id, favorite) VALUES (?, ?, ?) " +
                    "ON CONFLICT (signet_id, user_id) DO UPDATE SET favorite = ?" +
                    "RETURNING *";
            params.add(isFavorite);
        }

        String errorMessage = "[Mediacentre@DefaultFavoriteService::updateSQL] Failed to update favorite in SQL database : ";
        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(IModelHelper.uniqueResultToIModel(promise, SignetResource.class, errorMessage)));

        return promise.future();
    }

    @Override
    public Future<JsonObject> delete(String favoriteId, String source, String userId) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject matcher = new JsonObject()
                .put(Field.USER, userId)
                .put(Field.SOURCE, source);

        if (source.equals(SourceEnum.SIGNET.method())) {
            matcher.put(ID, Integer.parseInt(favoriteId));
        }
        else {
            matcher.put(Field._ID, favoriteId);
        }

        String errorMessage = "[Mediacentre@DefaultFavoriteService::delete] Failed to delete favorite in mongo database : ";
        MongoDb.getInstance().delete(TOKEN_COLLECTION, matcher, MongoDbResult.validResultHandler(FutureHelper.handlerJsonObject(promise, errorMessage)));

        return promise.future();
    }
}
