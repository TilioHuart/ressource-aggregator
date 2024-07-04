package fr.openent.mediacentre.service.impl;

import com.mongodb.QueryBuilder;
import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.core.constants.MongoConstant;
import fr.openent.mediacentre.core.constants.SourceConstant;
import fr.openent.mediacentre.enums.Profile;
import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.helper.IModelHelper;
import fr.openent.mediacentre.model.GlobalResource;
import fr.openent.mediacentre.service.GlobalResourceService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.user.UserInfos;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static fr.openent.mediacentre.core.constants.Field.*;

public class GlobalResourceServiceMongoImpl extends MongoDbCrudService implements GlobalResourceService {

    private final String collection;
    private final MongoDb mongo;
    private static final Logger log = LoggerFactory.getLogger(GlobalResourceServiceMongoImpl.class);

    public GlobalResourceServiceMongoImpl(final String collection) {
        super(collection);
        this.collection = collection;
        this.mongo = MongoDb.getInstance();
    }

    @Override
    public Future<JsonObject> createGlobalResource(UserInfos user, JsonObject resource) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject now = MongoDb.now();
        resource.put(Field.DATE, now);
        resource.put(Field.AUTHORS, Collections.singletonList(user.getUsername()));
        GlobalResource globalResource = new GlobalResource(resource);

        if (globalResource.getProfiles().isEmpty()) {
            String errorMessage = "Profiles can not empty";
            log.error("[Mediacentre@GlobalResourceServiceMongoImpl::createGlobalResource] " + errorMessage);
            promise.fail(errorMessage);
            return promise.future();
        }

        this.getMaxIdValue()
            .onSuccess(maxIdValueJson -> {
                JsonArray firstBatch = maxIdValueJson.getJsonObject(CURSOR).getJsonArray(CAMEL_FIRST_BATCH);
                int maxIdValue = firstBatch != null && !firstBatch.isEmpty() ? firstBatch.getJsonObject(0).getInteger(CAMEL_MAX_VALUE) : 0;
                globalResource.setId(maxIdValue + 1);

                String errorMessage = "[Mediacentre@GlobalResourceServiceMongoImpl::createGlobalResource] Failed to create global resource : ";
                mongo.insert(collection, globalResource.toJson(), MongoDbResult.validResultHandler(FutureHelper.handlerJsonObject(promise, errorMessage)));
            })
            .onFailure(err -> {
                String errorMessage = "[Mediacentre@GlobalResourceServiceMongoImpl::createGlobalResource] Failed to get max id value from mongo";
                log.error(errorMessage + " : " + err.getMessage());
                promise.fail(err.getMessage());
            });

        return promise.future();
    }

    @Override
    public Future<List<GlobalResource>> list(Profile profile) {
        Promise<List<GlobalResource>> promise = Promise.promise();
        QueryBuilder query = QueryBuilder.start(Field.PROFILES).is(profile.getName());
        mongo.find(collection, MongoQueryBuilder.build(query), MongoDbResult.validResultsHandler(result -> {
            if (result.isLeft()) {
                log.error("[Mediacentre@GlobalResourceServiceMongoImpl::list] Can't find global resources : ", result.left().getValue());
                promise.fail(result.left().getValue());
                return;
            }
            promise.complete(IModelHelper.toList(result.right().getValue(), GlobalResource.class));

        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> deleteGlobalChannel(String idChannel) {
        Promise<JsonObject> promise = Promise.promise();
        mongo.delete(collection, new JsonObject().put(Field._ID, idChannel), MongoDbResult.validResultHandler(FutureHelper.handlerJsonObject(promise)));
        return promise.future();
    }

    @Override
    public Future<Optional<GlobalResource>> updateGlobalChannel(String id, JsonObject resource) {
        Promise<Optional<GlobalResource>> promise = Promise.promise();
        JsonObject query = new JsonObject().put(Field._ID, id);
        JsonObject update = new JsonObject().put(MongoConstant.MONGO_SET, resource);
        mongo.update(collection, query, update, MongoDbResult.validResultHandler(IModelHelper.uniqueResultToIModel(promise, GlobalResource.class)));
        return promise.future();
    }

    private Future<JsonObject> getMaxIdValue() {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject matcher = new JsonObject().put(SOURCE, SourceConstant.GLOBAL);
        JsonObject group = new JsonObject()
                .put(_ID, (String) null)
                .put(CAMEL_MAX_VALUE, new JsonObject().put(MongoConstant.MONGO_MAX, MongoConstant.MONGO_ID));
        JsonArray pipeline = new JsonArray()
                .add(new JsonObject().put(MongoConstant.MONGO_MATCH, matcher))
                .add(new JsonObject().put(MongoConstant.MONGO_GROUP, group));
        JsonObject request = new JsonObject()
                .put(AGGREGATE, collection)
                .put(CAMEL_ALLOW_DISK_USE, true)
                .put(CURSOR, new JsonObject().put(CAMEL_BATCH_SIZE, 2147483647))
                .put(PIPELINE, pipeline);

        String errorMessage = "[Mediacentre@GlobalResourceServiceMongoImpl::getMaxIdValue] Failed to get max id value from mongo : ";
        mongo.command(request.toString(), MongoDbResult.validResultHandler(FutureHelper.handlerJsonObject(promise, errorMessage)));

        return promise.future();
    }
}
