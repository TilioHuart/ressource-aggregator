package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.enums.Profile;
import fr.openent.mediacentre.helper.HelperUtils;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.service.GlobalResourceService;
import fr.openent.mediacentre.service.impl.GlobalResourceServiceMongoImpl;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;
import org.entcore.common.user.UserUtils;

public class GlobalResourceController extends ControllerHelper {

    private final EventBus eb;
    private final GlobalResourceService globalResourceService;

    public GlobalResourceController(EventBus eb) {
        super();
        this.eb = eb;
        this.globalResourceService = new GlobalResourceServiceMongoImpl(Field.GLOBAL_COLLECTION);
    }

    @Get("/global/resources")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getResources(HttpServerRequest request) {
        // get only resources for relative profile
        globalResourceService.list(Profile.RELATIVE)
            .onSuccess(resources -> renderJson(request, new JsonObject(HelperUtils.frameLoad(
                    Field.GLOBAL_RESULT,
                    Field.GET,
                    Field.OK,
                    new JsonObject().put(Field.GLOBAL, resources)).encode()))
            )
            .onFailure(error -> {
                String message = String.format("[GlobalResourceController@%s::getResources] Failed to get resources : %s",
                        this.getClass().getSimpleName(), error.getMessage());
                log.error(message);
                renderError(request);
            });
    }

    @Post("/global/resources")
    @ResourceFilter(SuperAdminFilter.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void createResource(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, resource -> UserUtils.getAuthenticatedUserInfos(eb, request)
            .compose(userInfos -> globalResourceService.createGlobalResource(userInfos, resource))
            .onSuccess(result -> ok(request))
            .onFailure(error -> {
                String message = String.format("[GlobalResourceController@%s::createResource] Failed to create resource : %s",
                        this.getClass().getSimpleName(), error.getMessage());
                log.error(message);
                renderError(request);
            }));
    }

    @Put("/global/resources/:id")
    @ResourceFilter(SuperAdminFilter.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void updateResource(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, resource -> globalResourceService.updateGlobalChannel(request.getParam("id"), resource)
            .onSuccess(result -> ok(request))
            .onFailure(error -> {
                String message = String.format("[GlobalResourceController@%s::updateResource] Failed to update resource : %s",
                        this.getClass().getSimpleName(), error.getMessage());
                log.error(message);
                renderError(request);
            }));
    }

    @Delete("/global/resources/:id")
    @ResourceFilter(SuperAdminFilter.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void deleteResource(HttpServerRequest request) {
        globalResourceService.deleteGlobalChannel(request.getParam(Field.ID))
            .onSuccess(result -> ok(request))
            .onFailure(error -> {
                String message = String.format("[GlobalResourceController@%s::deleteResource] Failed to delete resource : %s",
                        this.getClass().getSimpleName(), error.getMessage());
                log.error(message);
                renderError(request);
            });
    }
}
