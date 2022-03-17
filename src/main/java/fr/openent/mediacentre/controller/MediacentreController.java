package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
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
import org.vertx.java.core.http.RouteMatcher;

import java.util.List;
import java.util.Map;

public class MediacentreController extends ControllerHelper {

    private final List<Source> sources;
    private final JsonObject config;

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
    public void initViewResourceRight() {
    }

    @SecuredAction(value = Mediacentre.MANAGER_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void initManagerResourceRight() {
    }

    @SecuredAction(Mediacentre.SIGNET_RIGHT)
    public void initSignetResourceRight() {
    }

    @SecuredAction(Mediacentre.GAR_RIGHT)
    public void initGarResourceRight() {
    }



}
