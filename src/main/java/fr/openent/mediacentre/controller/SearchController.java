package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.helper.APIHelper;
import fr.openent.mediacentre.helper.SearchHelper;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
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

    @Get("/search")
    @ResourceFilter(ViewRight.class)
    @ApiDoc("Retrieve books from basic search")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getSearch(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (!request.params().contains("jsondata")) {
                badRequest(request);
                return;
            }
            JsonObject jsondata = new JsonObject(request.getParam("jsondata"));

            if (       !jsondata.containsKey("data")
                    || !jsondata.containsKey("state")
                    || !jsondata.containsKey("event")
                    || !jsondata.containsKey("sources")
            ) {
                badRequest(request);
                return;
            }

            String state = jsondata.getString("state");
            JsonArray expectedSources = new JsonArray(jsondata.getJsonArray("sources").toString());
            JsonObject data = jsondata.getJsonObject("data");
            searchHelper.search(state, sources, expectedSources, data, user, new APIHelper(request));
        });

    }

}
