package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.service.UserService;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;
import org.entcore.common.user.UserInfos;

import java.util.*;

public class DefaultUserService implements UserService {

    private final EventBus eb;
    private final Neo4j neo = Neo4j.getInstance();

    public DefaultUserService(EventBus eb) {
        this.eb = eb;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Future<List<String>> getSubstructureIds(String idStructure) {
        Promise<List<String>> promise = Promise.promise();
        getSubstructureIdsRequest(idStructure)
                .onFailure(promise::fail)
                .onSuccess(structureIds -> promise.complete(structureIds
                        .getJsonArray(Field.STRUCTUREIDS, new JsonArray()).getList()));
        return promise.future();
    }

    private Future<JsonObject> getSubstructureIdsRequest(String idStructure) {
        Promise<JsonObject> promise = Promise.promise();

        String query = String.format("MATCH (struct:Structure)-[r:HAS_ATTACHMENT*1..]->(s:Structure)  " +
                        " WHERE s.id IN {%s} " +
                        " RETURN COLLECT(DISTINCT struct.id) AS %s",
                Field.STRUCTUREIDS, Field.STRUCTUREIDS);

        JsonObject params = new JsonObject();
        params.put(Field.STRUCTUREIDS, Collections.singletonList(idStructure));

        neo.execute(query, params, Neo4jResult.validUniqueResultHandler(FutureHelper.handlerJsonObject(promise)));

        return promise.future();
    }
}
