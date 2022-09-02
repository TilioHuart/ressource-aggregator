package fr.openent.mediacentre.helper;

import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class FutureHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(FutureHelper.class);

    private FutureHelper() {
    }

    public static Handler<Either<String, JsonArray>> handlerJsonArray(Future<JsonArray> future) {
        return event -> {
            if (event.isRight()) {
                future.complete(event.right().getValue());
            } else {
                LOGGER.error(event.left().getValue());
                future.fail(event.left().getValue());
            }
        };
    }

    public static Handler<Either<String, JsonArray>> handlerJsonArray(Promise<JsonArray> promise) {
        return event -> {
            if (event.isRight()) {
                promise.complete(event.right().getValue());
            } else {
                LOGGER.error(event.left().getValue());
                promise.fail(event.left().getValue());
            }
        };
    }

    public static Handler<Either<String, JsonObject>> handlerJsonObject(Future<JsonObject> future) {
        return event -> {
            if (event.isRight()) {
                future.complete(event.right().getValue());
            } else {
                LOGGER.error(event.left().getValue());
                future.fail(event.left().getValue());
            }
        };
    }

    public static <L, R> Handler<Either<L, R>> handlerEitherPromise(Promise<R> promise) {
        return handlerEitherPromise(promise, null);
    }

    public static <L, R> Handler<Either<L, R>> handlerEitherPromise(Promise<R> promise, String extraMessagesLogs) {
        return event -> {
            if (event.isRight()) {
                promise.complete(event.right().getValue());
            } else {
                String message = String.format("[Mediacentre@%s::handlerEitherPromise]: %s ",
                        FutureHelper.class.getSimpleName(), event.left().getValue());
                LOGGER.error(message + (extraMessagesLogs != null ? extraMessagesLogs : ""));
                promise.fail(event.left().getValue().toString());
            }
        };
    }

}
