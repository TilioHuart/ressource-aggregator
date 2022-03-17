package fr.openent.mediacentre.helper;

import fr.wseduc.webutils.http.Renders;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class APIHelper implements ResponseHandlerHelper{
    private Logger log = LoggerFactory.getLogger(APIHelper.class);
    private HttpServerRequest request;
    public APIHelper() {}
    public APIHelper(HttpServerRequest request) {
        this();
        setRequest(request);
    }

    public HttpServerRequest getRequest() {
        return request;
    }

    public void setRequest(HttpServerRequest request) {
        this.request = request;
    }

    @Override
    public void answerSuccess(String answer) {
        if (checkRequestSet (request))
            Renders.renderJson(request, new JsonObject(answer));
        else
            log.error("[APIHelper] Request null");

    }

    private boolean checkRequestSet(HttpServerRequest request) {
        return request != null;
    }

    @Override
    public void answerFailure(String answer) {
        if (checkRequestSet (request))
            Renders.renderError(request, new JsonObject(answer));
        else
            log.error("[APIHelper] Request null");
    }
}
