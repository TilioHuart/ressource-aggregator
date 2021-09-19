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
import static fr.wseduc.webutils.http.response.DefaultResponseHandler.arrayResponseHandler;
import static fr.wseduc.webutils.http.response.DefaultResponseHandler.defaultResponseHandler;

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
            int favoriteId = 0;
            if(favorite.getString("source").equals("fr.openent.mediacentre.source.Signet")) {
                favoriteId = Integer.parseInt(request.getParam("id"));
                favoriteService.updateSQL(favoriteId, user.getUserId(), true, false, defaultResponseHandler(request));
            }
            favoriteService.create(favorite, event -> {
                if(event.isRight()) {
                    log.info("Favorite creation successful");
                    request.response().setStatusCode(200).end();
                } else {
                    log.error("Favorite creation failed");
                }
            });

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
            favoriteService.delete(favoriteId, source, user.getUserId(), event -> {
                if(event.isRight()) {
                    log.info("Favorite delete successful");
                    request.response().setStatusCode(200).end();
                } else {
                    log.error("Favorite delete failed");
                }
            });
            // Update sql for signet
            if (source.equals("fr.openent.mediacentre.source.Signet")) {
                favoriteService.updateSQL(Integer.parseInt(favoriteId), user.getUserId(), false, false, defaultResponseHandler(request));
            }

        });
    }

}
