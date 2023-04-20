package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.APIHelper;
import fr.openent.mediacentre.helper.SearchHelper;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import java.util.List;

public class SearchController extends ControllerHelper {
    private final SearchHelper searchHelper;
    private final EventBus eb;
    private final List<Source> sources;
    public SearchController(EventBus eb, List<Source> sources) {
        this.eb = eb;
        this.sources = sources;
        this.searchHelper = new SearchHelper();
    }

    @Post("/search")
    @ResourceFilter(ViewRight.class)
    @ApiDoc("Retrieve books from basic search")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getSearch(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user == null) {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }

            RequestUtils.bodyToJson(request, body -> {
                if (!body.containsKey(Field.JSONDATA)) {
                    badRequest(request);
                    return;
                }
                JsonObject jsondata = body.getJsonObject(Field.JSONDATA, new JsonObject());

                if (       !jsondata.containsKey(Field.DATA)
                        || !jsondata.containsKey(Field.STATE)
                        || !jsondata.containsKey(Field.EVENT)
                        || !jsondata.containsKey(Field.SOURCES)
                ) {
                    badRequest(request);
                    return;
                }

                String state = jsondata.getString(Field.STATE);
                JsonArray expectedSources = new JsonArray(jsondata.getJsonArray(Field.SOURCES).toString());
                JsonObject data = jsondata.getJsonObject(Field.DATA);
                searchHelper.search(state, sources, expectedSources, data, user, new APIHelper(request));
            });
        });

    }

}
