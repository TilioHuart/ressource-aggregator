package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

public class FavoriteController extends ControllerHelper {

    private EventBus eb;
    private FavoriteService favoriteService;

    public FavoriteController(EventBus eb) {
        super();
        this.eb = eb;
        this.favoriteService = new DefaultFavoriteService();
    }

    @Post("/favorites")
    @ApiDoc("Create favorites")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void createFavorites(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, favorite -> {
            favorite.put("user", user.getUserId());
            favoriteService.create(favorite, DefaultResponseHandler.defaultResponseHandler(request));
        }));
    }

    @Delete("/favorites")
    @ApiDoc("Delete favorites")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void deleteFavorites(final HttpServerRequest request) {
        if (!request.params().contains("id") && !request.params().contains("source")) {
            badRequest(request);
            return;
        }
        String favoriteId = request.getParam("id");
        String source = request.getParam("source");
        favoriteService.delete(favoriteId, source, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Post("/update/favorites")
    @ApiDoc("Create favorites")
    @SecuredAction(Mediacentre.VIEW_RIGHT)
    public void updateFavorites(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, favorite -> {
            favoriteService.update(favorite, DefaultResponseHandler.defaultResponseHandler(request));
        }));
    }

}
