package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.helper.APIHelper;
import fr.openent.mediacentre.helper.TextBookHelper;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

public class TextBooksController extends ControllerHelper {
    private final EventBus eb;
    private final List<Source> sources;
    private final TextBookHelper textBookHelper = new TextBookHelper();
    public TextBooksController(EventBus eb, List<Source> sources) {
        this.eb = eb;
        this.sources = sources;
    }

    @Get("/textbooks")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getGar(HttpServerRequest request) {
        String listIdStructuresParam = request.getParam(Field.STRUCTUREIDS);
        final List<String> listIdStructures = listIdStructuresParam != null ? Arrays.asList(listIdStructuresParam.split(",")) : new ArrayList<>();

        UserUtils.getUserInfos(eb, request, user -> {
            textBookHelper.retrieveTextBooks("get", user, sources, listIdStructures, new APIHelper(request));
        });
    }

    @Get("/textbooks/refresh")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void refreshGar(HttpServerRequest request) {
        String listIdStructuresParam = request.getParam(Field.STRUCTUREIDS);
        final List<String> listIdStructures = listIdStructuresParam != null ? Arrays.asList(listIdStructuresParam.split(",")) : new ArrayList<>();

        UserUtils.getUserInfos(eb, request, user -> {
            textBookHelper.refreshTextBooks("refresh", sources, user, listIdStructures, new APIHelper(request));
        });
    }
}
