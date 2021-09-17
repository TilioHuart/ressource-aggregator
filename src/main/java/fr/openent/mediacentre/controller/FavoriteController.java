package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

import static fr.openent.mediacentre.helper.FutureHelper.handlerJsonObject;

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
            int favoriteId = Integer.parseInt(request.getParam("id"));
            Future<JsonObject> createFavoriteSql = Future.future();
            Future<JsonObject> createFavorite = Future.future();

            CompositeFuture.all(createFavorite, createFavoriteSql).setHandler(event -> {
                if(event.succeeded()) {
                    log.info("Favorite creation successful");
                    request.response().setStatusCode(200).end();
                } else {
                    log.error("Favorite creation failed");
                }
            });
            favoriteService.updateSQL(favoriteId, user.getUserId(), true, handlerJsonObject(createFavoriteSql));
            favoriteService.create(favorite, handlerJsonObject(createFavorite));
        }));
    }

    @Delete("/favorites")
    @ApiDoc("Delete favorites")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void deleteFavorites(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user ->  {
            if (!request.params().contains("id") && !request.params().contains("source")) {
                badRequest(request);
                return;
            }
            String favoriteId = request.getParam("id");
            String source = request.getParam("source");

            Future<JsonObject> deleteFavoriteSql = Future.future();
            Future<JsonObject> deleteFavorite = Future.future();

            CompositeFuture.all(deleteFavorite, deleteFavoriteSql).setHandler(event -> {
                if(event.succeeded()) {
                    log.info("Favorite delete successful");
                    request.response().setStatusCode(200).end();
                } else {
                    log.error("Favorite delete failed");
                }
            });
            favoriteService.updateSQL(Integer.parseInt(favoriteId), user.getUserId(), false, handlerJsonObject(deleteFavoriteSql));
            favoriteService.delete(favoriteId, source, user.getUserId(), handlerJsonObject(deleteFavorite));
        });
    }

}
