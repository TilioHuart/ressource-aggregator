package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.source.Source;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.List;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;

public class MediacentreController extends ControllerHelper {

    private List<Source> sources;

    public MediacentreController(List<Source> sources) {
        super();
        this.sources = sources;
    }

    @Get("")
    @ApiDoc("Render mediacentre view")
    @SecuredAction("mediacentre.view")
    public void view(HttpServerRequest request) {
        renderView(request);
    }

    @Get("/gar")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void getGar(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            JsonObject action = new JsonObject()
                    .put("action", "getResources")
                    .put("structure", user.getStructures().get(0))
                    .put("user", user.getUserId());

            eb.send("openent.gar", action, handlerToAsyncHandler(event -> {
                renderJson(request, event.body().getJsonArray("message"));
            }));
        });
    }

    @Get("/resources")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void getResources(HttpServerRequest request) {
        List<Future> futures = new ArrayList<>();
        request.response().setChunked(true);
        request.response().putHeader("content-type", "application/json");
        UserUtils.getUserInfos(eb, request, user -> {
            for (Source source : sources) {
                Future future = Future.future();
                futures.add(future);
                source.search(new JsonObject(), user, sourceHandler(request, future));
            }
            CompositeFuture.all(futures).setHandler(handler -> request.response().setStatusCode(200).end());
        });
    }

    private Handler<Either<String, JsonObject>> sourceHandler(HttpServerRequest request, Future future) {
        return event -> {
            if (event.isLeft()) {
                log.error("[MediaCentreController@getResources] Failed to retrieve resources", event.left().getValue());
                future.fail(event.left().getValue());
                return;
            }

            request.response().write(event.right().getValue().encodePrettily());
            future.complete();
        };
    }
}
