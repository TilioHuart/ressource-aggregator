package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.service.StructureService;
import fr.openent.mediacentre.source.GAR;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;

import static fr.openent.mediacentre.core.constants.Field.EXPORT;

public class DefaultStructureService implements StructureService {

    @Override
    public Future<JsonArray> getGarAffectedStructures() {
        Promise<JsonArray> promise = Promise.promise();

        String queryGroupsNeo4j = "MATCH(s:Structure) WHERE {export} IN s.exports RETURN s";
        JsonObject params = new JsonObject().put(EXPORT, GAR.class.getName());

        String errorMessage = "[Mediacentre@DefaultStructureService::getGarAffectedStructures] Failed to get users recently connected";
        Neo4j.getInstance().execute(queryGroupsNeo4j, params, Neo4jResult.validResultHandler(handler));

        return promise.future();
    }
}
