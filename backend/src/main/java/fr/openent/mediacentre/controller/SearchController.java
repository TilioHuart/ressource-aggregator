package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.APIHelper;
import fr.openent.mediacentre.helper.SearchHelper;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
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
import java.util.Arrays;
import java.util.ArrayList;
import java.util.stream.Collectors;

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
        String listIdStructuresParam = request.getParam(Field.STRUCTUREIDS);
        final List<String> listIdStructures = listIdStructuresParam != null ? Arrays.asList(listIdStructuresParam.split(",")) : new ArrayList<>();
        UserUtils.getUserInfos(eb, request, user -> {
            if (user == null) {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }

            if (!request.params().contains(Field.JSONDATA)) {
                badRequest(request);
                String message = String.format("[Mediacentre@%s::getSearch] An error has occurred" +
                        " during research fetch: missing param in request", this.getClass().getSimpleName());
                log.error(message);
                return;
            }

            JsonObject jsondata = new JsonObject(request.getParam(Field.JSONDATA));

            if (       !jsondata.containsKey(Field.DATA)
                    || !jsondata.containsKey(Field.STATE)
                    || !jsondata.containsKey(Field.EVENT)
                    || !jsondata.containsKey(Field.SOURCES)
            ) {
                badRequest(request);
                String message = String.format("[Mediacentre@%s::getSearch] An error has occurred" +
                        " during research fetch: missing data in request param", this.getClass().getSimpleName());
                log.error(message);
                return;
            }

            String state = jsondata.getString(Field.STATE);
            JsonArray expectedSources = new JsonArray(jsondata.getJsonArray(Field.SOURCES).toString());
            // filter expectedSources with initialised sources
            expectedSources = new JsonArray(expectedSources.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .filter(expectedSource -> sources.stream()
                            .map(source -> source.getClass().getName())
                            .collect(Collectors.toList())
                            .contains(expectedSource)
                    )
                    .collect(Collectors.toList()));
            JsonObject data = jsondata.getJsonObject(Field.DATA);
            searchHelper.search(state, sources, expectedSources, data, user, listIdStructures, new APIHelper(request));
        });

    }

}
