package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.Impl.DefaultFavoriteService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.response.DefaultResponseHandler;

public class FavoriteController extends ControllerHelper {

    private FavoriteService favoriteService;

    public FavoriteController() {
        super();
        this.favoriteService = new DefaultFavoriteService();
    }

    @Post("/favorites")
    @ApiDoc("Create favorites")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void createFavorites(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, favorite -> {
            favoriteService.create(favorite, DefaultResponseHandler.defaultResponseHandler(request));
        });
    }

    @Delete("/favorites")
    @ApiDoc("Delete favorites")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void deleteFavorites(final HttpServerRequest request) {
        if (!request.params().contains("id") && !request.params().contains("source")) {
            badRequest(request);
            return;
        }
        String favoriteId = request.getParam("id");
        String source = request.getParam("source");
        favoriteService.delete(favoriteId, source, DefaultResponseHandler.defaultResponseHandler(request));
    }

}
