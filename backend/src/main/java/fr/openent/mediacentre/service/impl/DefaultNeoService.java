package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.service.NeoService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;

public class DefaultNeoService implements NeoService {

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
}
