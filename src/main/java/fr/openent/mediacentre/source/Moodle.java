package fr.openent.mediacentre.source;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.elasticsearch.ElasticSearch;
import org.entcore.common.user.UserInfos;

public class Moodle implements Source {

    private final Logger log = LoggerFactory.getLogger(Moodle.class);

    private EventBus eb;
    private JsonObject config;
    private final ElasticSearch es = ElasticSearch.getInstance();
    private final String TYPE_NAME = "resources";
    public Moodle() {
        super();
    }

    @Override
    public void plainTextSearch(String search, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        JsonObject request = new JsonObject();
        JsonObject multi_match = new JsonObject();
        JsonArray fields = new JsonArray();
        JsonObject query = new JsonObject();
        fields.add("title")
                .add("authors")
                .add("editors")
                .add("disciplines")
                .add("levels");
        multi_match.put("query", search)
                .put("fields", fields);
        query.put("multi_match", multi_match);
        request.put("from", 0)
                .put("size", 10000)
                .put("query", query);
        es.search(TYPE_NAME, request, response -> {
            if (response.failed()) {
                log.error("Error search the text : " + search);
                handler.handle(new Either.Left<>(response.result()));
            }
            else {
                JsonObject finalResponse = new JsonObject()
                        .put("source", Moodle.class.getName())
                        .put("hits", response.result().getJsonObject("hits").getJsonArray("hits"));
                handler.handle(new Either.Right<>(finalResponse));
            }
        });
    }

    @Override
    public void advancedSearch(JsonObject search, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        JsonObject bool = new JsonObject();
        JsonArray must = new JsonArray();
        JsonArray should = new JsonArray();
        JsonObject query = new JsonObject();

        if (search.getJsonObject("title") != null)
            must.add(new JsonObject().put("term", new JsonObject().put("title", search.getJsonObject("title").getValue("value"))));

        if (search.getJsonObject("authors") != null)
            if (search.getJsonObject("authors").getString("comparator").equals("$and"))
                must.add(new JsonObject().put("term", new JsonObject().put("author", search.getJsonObject("authors").getValue("value"))));
            else
                should.add(new JsonObject().put("term", new JsonObject().put("author", search.getJsonObject("authors").getValue("value"))));

        if (search.getJsonObject("editors") != null)
            if (search.getJsonObject("editors").getString("comparator").equals("$and"))
                must.add(new JsonObject().put("term", new JsonObject().put("editor", search.getJsonObject("editors").getValue("value"))));
            else
                should.add(new JsonObject().put("term", new JsonObject().put("editor", search.getJsonObject("editors").getValue("value"))));

        if (search.getJsonObject("disciplines") != null)
            if (search.getJsonObject("disciplines").getString("comparator").equals("$and"))
                must.add(new JsonObject().put("term", new JsonObject().put("discipline", search.getJsonObject("disciplines").getValue("value"))));
            else
                should.add(new JsonObject().put("term", new JsonObject().put("discipline", search.getJsonObject("disciplines").getValue("value"))));

        if (search.getJsonObject("levels") != null)
            if (search.getJsonObject("levels").getString("comparator").equals("$and"))
                must.add(new JsonObject().put("term", new JsonObject().put("level", search.getJsonObject("levels").getValue("value"))));
            else
                should.add(new JsonObject().put("term", new JsonObject().put("level", search.getJsonObject("levels").getValue("value"))));

        bool.put("must", must)
                .put("should", should);

        query.put("from", 0)
                .put("size", 10000)
                .put("query", new JsonObject().put("bool", bool));
        es.search(TYPE_NAME, query, response -> {
            if (response.failed()) {
                log.error("Error search the text : " + search);
                handler.handle(new Either.Left<>(response.result()));
            }
            else if (response.succeeded()) {
                JsonObject finalResponse = new JsonObject()
                        .put("source", Moodle.class.getName())
                        .put("hits", response.result().getJsonObject("hits").getJsonArray("hits"));
                handler.handle(new Either.Right<>(finalResponse));
            }
        });
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
                .put("id", resource.getString("id")) 
                .put("image", resource.getString("image")) 
                .put("levels", resource.getJsonArray("levels"))
                .put("link", resource.getString("link")) 
                .put("plain_text", resource.getString("plain_text")) 
                .put("source", resource.getString("source")) 
                .put("title", resource.getString("title"));
    }

    @Override
    public void harvest() {

    }

    @Override
    public void setEventBus(EventBus eb) {
        eb = eb;
        eb.consumer("fr.openent.mediacentre.source.Moodle|create", this::create);
        eb.consumer("fr.openent.mediacentre.source.Moodle|update", this::update);
        eb.consumer("fr.openent.mediacentre.source.Moodle|delete", this::delete);
    }

    @Override
    public void setConfig(JsonObject config) {

    }

    public void create(Message<JsonObject> event) {
        es.create(TYPE_NAME, format(event.body()), Integer.parseInt(event.body().getString("id")), response -> {
            if (response.failed()) {
                JsonObject error = (new JsonObject()).put("status", "error").put("message", response.cause().getMessage());
                event.reply(error);
            } else {
                event.reply((new JsonObject()).put("status", "ok").put("result", response.result()));
            }
        });
    }

    public void update(Message<JsonObject> event) {
        es.update(TYPE_NAME, event.body().getJsonObject("query"), event.body().getInteger("id"), response -> {
            if (response.failed()) {
                JsonObject error = (new JsonObject()).put("status", "error").put("message", response.cause().getMessage());
                event.reply(error);
            } else {
                event.reply((new JsonObject()).put("status", "ok").put("result", response.result()));
            }
        });
    }

    public void delete(Message<JsonObject> event) {
        es.delete(TYPE_NAME, event.body(), response -> {
            if (response.failed()) {
                JsonObject error = (new JsonObject()).put("status", "error").put("message", response.cause().getMessage());
                event.reply(error);
            } else {
                event.reply((new JsonObject()).put("status", "ok")
                        .put("result", response.result())
                        .put("ids", event.body().getJsonObject("query").getJsonObject("bool").getJsonArray("should")));
            }
        });
    }
}
