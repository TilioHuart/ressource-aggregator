package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.source.GAR;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserUtils;

import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class MediacentreController extends ControllerHelper {

    private List<Source> sources;

    public MediacentreController(List<Source> sources) {
        super();
        this.sources = sources;
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
                .put("wsPort", Mediacentre.wsPort)
                .put("sources", sourceList);
        renderView(request, params);
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
