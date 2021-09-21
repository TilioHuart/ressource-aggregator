package fr.openent.mediacentre.source;

import fr.openent.mediacentre.helper.ElasticSearchHelper;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.elasticsearch.ElasticSearch;
import org.entcore.common.user.UserInfos;

import java.util.function.UnaryOperator;

public class Signet implements Source {

    private final Logger log = LoggerFactory.getLogger(Signet.class);

    private final ElasticSearch es = ElasticSearch.getInstance();

    private final UnaryOperator<JsonObject> actionProvider = resource -> {
        JsonObject message = new JsonObject()
                .put("success", String.format("%s.action.duplicate.success", Signet.class.getName()))
                .put("error", String.format("%s.action.duplicate.error", Signet.class.getName()));

        JsonObject action = new JsonObject()
                .put("label", String.format("%s.action.duplicate", Signet.class.getName()))
                .put("url", String.format("/moodle/course/duplicate/BP/%s", resource.getString("id")))
                .put("method", HttpMethod.POST)
                .put("message", message);

        return resource.put("action", action);
    };

    public Signet() {
        super();
    }

    @Override
    public void plainTextSearch(String query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.plainTextSearch(Signet.class, query, user.getUserId(), null, false, ElasticSearchHelper.searchHandler(Signet.class, actionProvider, handler));
    }

    @Override
    public void advancedSearch(JsonObject query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.advancedSearch(Signet.class, query, user.getUserId(), null, ElasticSearchHelper.searchHandler(Signet.class, actionProvider, handler));
    }

    @Override
    public JsonObject format(JsonObject resource) {
        return new JsonObject()
                .put("authors", resource.getJsonArray("authors"))
                .put("date", resource.getLong("date"))
                .put("description", resource.getString("description"))
                .put("disciplines", resource.getJsonArray("disciplines"))
                .put("document_types", resource.getJsonArray("document_types"))
                .put("editors", resource.getJsonArray("editors"))
                .put("favorite", resource.getBoolean("favorite"))
                .put("id", resource.getInteger("id").toString())
                .put("image", resource.getString("image"))
                .put("levels", resource.getJsonArray("levels"))
                .put("link", resource.getString("link"))
                .put("plain_text", resource.getJsonArray("key_words"))
                .put("source", resource.getString("source"))
                .put("title", resource.getString("title"));
    }

    @Override
    public void amass() {
        log.info("Moodle source does not need amass");
    }

    @Override
    public void setEventBus(EventBus eb) {
        eb.consumer("fr.openent.mediacentre.source.Signet|create", this::create);
        eb.consumer("fr.openent.mediacentre.source.Signet|update", this::update);
        eb.consumer("fr.openent.mediacentre.source.Signet|delete", this::delete);
    }

    @Override
    public void setConfig(JsonObject config) {
        log.info("setConfig not implemented in Signet source");
    }

    public void create(Message<JsonObject> event) {
        es.create(RESOURCE_TYPE_NAME, format(event.body()), event.body().getInteger("id"), response -> {
            if (response.failed()) {
                JsonObject error = (new JsonObject()).put("status", "error").put("message", response.cause().getMessage());
                event.reply(error);
            } else {
                event.reply((new JsonObject()).put("status", "ok").put("result", response.result()));
            }
        });
    }

    public void update(Message<JsonObject> event) {
        es.update(RESOURCE_TYPE_NAME, event.body().getJsonObject("query"), event.body().getInteger("id"), response -> {
            if (response.failed()) {
                JsonObject error = (new JsonObject()).put("status", "error").put("message", response.cause().getMessage());
                event.reply(error);
            } else {
                event.reply((new JsonObject()).put("status", "ok").put("result", response.result()));
            }
        });
    }

    public void delete(Message<JsonObject> event) {
        es.delete(RESOURCE_TYPE_NAME, event.body(), response -> {
            if (response.failed()) {
                JsonObject error = (new JsonObject()).put("status", "error").put("message", response.cause().getMessage());
                event.reply(error);
            } else {
                event.reply((new JsonObject()).put("status", "ok")
                        .put("result", response.result()));
            }
        });
    }
}
