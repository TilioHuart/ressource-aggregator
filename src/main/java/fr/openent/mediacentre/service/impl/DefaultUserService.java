package fr.openent.mediacentre.service.impl;

import com.mongodb.QueryBuilder;
import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.service.UserService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;

import java.util.Date;
import java.util.List;

import static fr.openent.mediacentre.core.constants.Collections.MEDIACENTRE_USER_INFOS_COLLECTION;
import static fr.openent.mediacentre.core.constants.Collections.SESSION_COLLECTION;
import static fr.openent.mediacentre.core.constants.Field.CAMEL_LAST_USED;
import static net.atos.entng.calendar.core.constants.MongoField.$GREATER_OR_EQUAL;
import static org.entcore.common.mongodb.MongoDbResult.validResultsHandler;

public class DefaultUserService implements UserService {
    @Override
    public void getIdsFromBookMarks(final JsonArray bookmarksIds, Handler<Either<String, JsonArray>> handler) {
        JsonObject params = new JsonObject().put("bookmarksIds", bookmarksIds);

        String queryNeo4j = "WITH {bookmarksIds} AS shareBookmarkIds " +
                "UNWIND shareBookmarkIds AS shareBookmarkId " +
                "MATCH (u:User)-[:HAS_SB]->(sb:ShareBookmark) " +
                "UNWIND TAIL(sb[shareBookmarkId]) as vid MATCH (v:Visible {id : vid}) " +
                "WITH {ids: COLLECT(DISTINCT{id: v.id, name: v.name})} as sharedBookMark " +
                "RETURN COLLECT(sharedBookMark) as ids;";

        Neo4j.getInstance().execute(queryNeo4j, params, Neo4jResult.validResultHandler(handler));
    }

    @Override
    public void getUsersInfosFromIds(JsonArray groupIds, Handler<Either<String, JsonArray>> handler) {
        JsonObject params = new JsonObject()
                .put("groupIds", groupIds);
        String queryGroupsNeo4j = "MATCH(g:Group)-[:IN]-(ug:User) WHERE g.id IN {groupIds} WITH g, " +
                "collect({id: ug.id, username: ug.displayName}) AS users return users ";
        Neo4j.getInstance().execute(queryGroupsNeo4j, params, Neo4jResult.validResultHandler(handler));
    }

    @Override
    public Future<JsonArray> getUsersRecentlyConnected(Date dateLimit) {
        Promise<JsonArray> promise = Promise.promise();

        JsonObject matcher = new JsonObject().put(CAMEL_LAST_USED, new JsonObject().put($GREATER_OR_EQUAL, dateLimit));

        String errorMessage = "[Mediacentre@DefaultUserService::getUsersRecentlyConnected] Failed to get users recently connected";
        MongoDb.getInstance().find(SESSION_COLLECTION, matcher, validResultsHandler(event -> FutureHelper.handlerJsonArray(promise, errorMessage)));

        return promise.future();
    }

    @Override
    public Future<JsonArray> getUsersResourceInfos(List<String> usersIds) {
        Promise<JsonArray> promise = Promise.promise();

        QueryBuilder query = QueryBuilder.start("user_id").in(usersIds);

        String errorMessage = "[Mediacentre@DefaultUserService::getUsersResourceInfos] Failed to get users infos";
        MongoDb.getInstance().find(MEDIACENTRE_USER_INFOS_COLLECTION, MongoQueryBuilder.build(query), validResultsHandler(event -> FutureHelper.handlerJsonArray(promise, errorMessage)));

        return promise.future();
    }
}
