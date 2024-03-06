package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.service.StructureService;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;

public class DefaultStructureService implements StructureService {

    @Override
    public Future<JsonArray> getGarAffectedStructures() {
        Promise<JsonArray> promise = Promise.promise();

        String queryGroupsNeo4j = "MATCH(s:Structure) RETURN s";
        JsonObject params = new JsonObject().put("groupIds", groupIds);

        String errorMessage = "[Mediacentre@DefaultStructureService::getGarAffectedStructures] Failed to get users recently connected";
        Neo4j.getInstance().execute(queryGroupsNeo4j, params, Neo4jResult.validResultHandler(handler));

        return promise.future();
    }
}
