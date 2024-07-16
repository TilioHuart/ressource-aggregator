package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.IModelHelper;
import fr.openent.mediacentre.helper.TextBookHelper;
import fr.openent.mediacentre.model.GarResource;
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
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.http.RouteMatcher;

import java.io.UnsupportedEncodingException;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static fr.openent.mediacentre.core.constants.Field.*;

public class MediacentreController extends ControllerHelper {

    private final List<Source> sources;
    private final JsonObject config;
    private EventStore eventStore;
    private enum MediacentreEvent { ACCESS }
    private final TextBookHelper textBookHelper = new TextBookHelper();

    public MediacentreController(List<Source> sources, JsonObject config) {
        super();
        this.sources = sources;
        this.config = config;
    }

    @Override
    public void init(Vertx vertx, JsonObject config, RouteMatcher rm, Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
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
                .put("sources", sourceList)
                .put(Field.MEDIACENTREUPDATEFREQUENCY, config.getInteger(Field.MEDIACENTREUPDATEFREQUENCY, 60000));
        final String view = request.params().get("view");
        if ("angular".equals(view)) {
            renderView(request, params, "mediacentre.html", null);
        } else {
            renderView(request, params, "index.html", null);
        }
        eventStore.createAndStoreEvent(MediacentreEvent.ACCESS.name(), request);
    }

    @Get("/resource/open")
    @ApiDoc("Open a resource")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void openResource(HttpServerRequest request) {
        String targetUrl = request.getParam(Field.URL);

        if (targetUrl == null || targetUrl.isEmpty()) {
            log.error("[Mediacentre@openResource] No URL where redirect to.");
            noContent(request);
            return;
        }

        // Convert to URL type
        URL url;
        try {
            String decodedURL = URLDecoder.decode(targetUrl, StandardCharsets.UTF_8.name());
            url = new URL(decodedURL);
        }
        catch (UnsupportedEncodingException | MalformedURLException e) {
            String message = "[Mediacentre@openResource] Failed to convert targeted source into URL type : " + e.getMessage();
            log.error(message);
            badRequest(request, message);
            return;
        }

        // Check WhiteList
        JsonArray whiteList = config.getJsonArray("whitelist-sources");
        if (whiteList == null || whiteList.isEmpty()) {
            log.error("[Mediacentre@openResource] No sources in whitelist.");
            noContent(request);
            return;
        }

        if (!whiteList.contains(url.getHost())) {
            String message = "[Mediacentre@openResource] You cannot access host " + url.getHost();
            log.error(message);
            unauthorized(request, message);
            return;
        }

        // Redirect if everything is ok
        request.response().setStatusCode(302);
        request.response().putHeader("Location", targetUrl);
        request.response().putHeader("Access-Control-Allow-Origin", getScheme(request) + "://" + getHost(request));
        request.response().end();
    }

    @Get("/resource/universalis")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void getUniversalis(HttpServerRequest request) {
        GAR garSource = this.sources.stream()
                .filter(GAR.class::isInstance)
                .map(GAR.class::cast)
                .findFirst()
                .orElse(null);

        if (garSource == null) {
            renderJson(request, (JsonObject) null);
            return;
        }

        UserUtils.getAuthenticatedUserInfos(eb, request)
            .compose(garSource::getAllUserResources)
            .onSuccess(resources -> {
                JsonObject universalisJson = resources.stream()
                    .filter(JsonObject.class::isInstance)
                    .map(JsonObject.class::cast)
                    .filter(resource -> resource.getString(ID_RESSOURCE, "").equals(UNIVERSALIS_ARK))
                    .findFirst()
                    .orElse(null);
                Optional<GarResource> universalis = universalisJson != null ? IModelHelper.toModel(universalisJson, GarResource.class) : Optional.empty();
                renderJson(request, universalis.map(GarResource::toJson).orElse(null));
            })
            .onFailure(err -> {
                String errMessage = "[Mediacentre@MediacentreController::getUniversalis] Failed to get Universalis resource from GAR";
                log.error(errMessage + err.getMessage());
                renderError(request);
            });
    }

    @Get("/config")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SuperAdminFilter.class)
    public void getConfig(final HttpServerRequest request) {
        JsonObject safeConfig = config.copy();

        JsonObject elasticsearchConfig = safeConfig.getJsonObject("elasticsearchConfig", null);
        if (elasticsearchConfig != null) {
            if (elasticsearchConfig.getString("username", null) != null) elasticsearchConfig.put("username", "**********");
            if (elasticsearchConfig.getString("password", null) != null) elasticsearchConfig.put("password", "**********");
        }

        renderJson(request, safeConfig);
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

    @SecuredAction(Mediacentre.PIN_MANAGER_RIGHT)
    public void initPinManagerResourceRight() {
    }
}
