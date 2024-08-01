package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.core.constants.SourceConstant;
import fr.openent.mediacentre.helper.APIHelper;
import fr.openent.mediacentre.helper.FavoriteHelper;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Future;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import static fr.openent.mediacentre.core.constants.Field.*;

public class FavoriteController extends ControllerHelper {

    private final EventBus eb;
    private final FavoriteService favoriteService;
    private final FavoriteHelper favoriteHelper;

    public FavoriteController(EventBus eb) {
        super();
        this.eb = eb;
        this.favoriteService = new DefaultFavoriteService();
        this.favoriteHelper = new FavoriteHelper();
    }

    @Get("/favorites")
    @ResourceFilter(ViewRight.class)
    @ApiDoc("Retrieve all the books from favorites")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getFavorites(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            favoriteHelper.favoritesRetrieve(user, favoriteService, new APIHelper(request));
        });
    }

    @Post("/favorites")
    @ApiDoc("Create favorites")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void createFavorites(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, favorite -> {
            if (!favorite.containsKey(ID)) {
                badRequest(request);
                return;
            }
            Object value = favorite.getValue(ID);
            if (value instanceof Number && Double.isNaN(((Number) value).doubleValue())) {
                badRequest(request);
                return;
            }
            UserUtils.getAuthenticatedUserInfos(eb, request)
                .compose(user -> {
                    favorite.put(USER, user.getUserId());
                    if (favorite.getString(SOURCE).equals(SourceConstant.SIGNET)) {
                        int favoriteId = Integer.parseInt(request.getParam(ID));
                        return favoriteService.updateSQL(favoriteId, user.getUserId(), true, false);
                    }
                    else {
                        return Future.succeededFuture();
                    }
                })
                .compose(SQLfavorite -> favoriteService.create(favorite))
                .onSuccess(mongoFavorite -> render(request, mongoFavorite))
                .onFailure(err -> {
                    String errorMessage = "[Mediacentre@FavoriteController::createFavorites] Failed to create a new favorite for resource " + favorite;
                    log.error(errorMessage + " : " + err.getMessage());
                    renderError(request);
                });
        });
    }

    @Delete("/favorites")
    @ApiDoc("Delete favorites")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void deleteFavorites(final HttpServerRequest request) {
        if (!request.params().contains(ID) && !request.params().contains(SOURCE)) {
            badRequest(request);
            return;
        }

        String favoriteId = request.getParam(ID);
        String source = request.getParam(SOURCE);
        JsonObject composeInfos = new JsonObject();

        UserUtils.getAuthenticatedUserInfos(eb, request)
            .compose(user -> {
                composeInfos.put(USER_ID, user.getUserId());
                return favoriteService.delete(favoriteId, source, user.getUserId());
            })
            .compose(voidResult -> source.equals(SourceConstant.SIGNET) ?
                favoriteService.updateSQL(Integer.parseInt(favoriteId), composeInfos.getString(USER_ID), false, false) :
                Future.succeededFuture())
            .onSuccess(voidResult -> ok(request))
            .onFailure(err -> {
                String errorMessage = "[Mediacentre@FavoriteController::deleteFavorites] Failed to delete favorite with id " + favoriteId;
                log.error(errorMessage + " : " + err.getMessage());
                renderError(request);
            });
    }
}
