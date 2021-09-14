package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.source.GAR;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.http.RouteMatcher;

import java.util.List;
import java.util.Map;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class MediacentreController extends ControllerHelper {

    private List<Source> sources;
    private JsonObject config;

    public MediacentreController(List<Source> sources, JsonObject config) {
        super();
        this.sources = sources;
        this.config = config;
    }
    private EventStore eventStore;
    private enum MediacentreEvent { ACCESS }


    @Override
    public void init(Vertx vertx, JsonObject config, RouteMatcher rm,
                     Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
        super.init(vertx, config, rm, securedActions);
        eventStore = EventStoreFactory.getFactory().getEventStore(Mediacentre.class.getSimpleName());
    }
    @Get("")
    @ApiDoc("Render mediacentre view")
    @SecuredAction(Mediacentre.VIEW_RIGHT)
    public void view(HttpServerRequest request) {
        JsonArray sourceList = new JsonArray();
        for (Source source : this.sources) {
            sourceList.add(source.getClass().getName());
        }

        JsonObject params = new JsonObject()
                .put("wsPort", "dev".equals(config.getString("mode")) ? Mediacentre.wsPort : "")
                .put("mode", config.getString("mode"))
                .put("sources", sourceList);
        renderView(request, params);
        eventStore.createAndStoreEvent(MediacentreEvent.ACCESS.name(), request);

    }

    @SecuredAction(value = Mediacentre.VIEW_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void initViewResourceRight(final HttpServerRequest request) {
    }

    @SecuredAction(value = Mediacentre.MANAGER_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void initManagerResourceRight(final HttpServerRequest request) {
    }

    @SecuredAction(Mediacentre.CREATION_RIGHT)
    public void initCreationRight(final HttpServerRequest request) {
    }

    @Get("/textbooks")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void getGar(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            for (Source source : this.sources) {
                if (source instanceof GAR) {
                    ((GAR) source).initTextBooks(user, arrayResponseHandler(request));
                }
            }
        });
    }
}
