package fr.openent.mediacentre.service.impl;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.service.mediacentreEventBus;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;


public class DefaultMediacentreEventBus extends ControllerHelper implements mediacentreEventBus {

    private final EventBus eb;
    private final SignetService signetService = new DefaultSignetService();

    public DefaultMediacentreEventBus(EventBus eb) {
        super();
        this.eb = eb;
    }

    @Override
    public void publishInMediacentre(JsonObject signet, final Handler<Either<String, JsonObject>> handler) {
                log.info("Event Bus launched");
                JsonObject resource = new JsonObject();
                resource.put("title", signet.getString("title"))
                        .put("authors",  new JsonArray().add(signet.getString("owner_name")))
                        .put("editors", new JsonArray().add(signet.getString("owner_name")))
                        .put("id", signet.getInteger("id"))
                        .put("image", signet.getString("image"))
                        .put("document_types", signet.getBoolean("orientation") ? new JsonArray().add("Orientation") : new JsonArray().add("Signet"))
                        .put("link", signet.getString("url"))
                        .put("date", System.currentTimeMillis())
                        .put("favorite", false)
                        .put("source", "fr.openent.mediacentre.source.Signet");

                JsonArray resourceLevels = new JsonArray();
                for (int i = 0; signet.getJsonArray("levels").size() > i; i++) {
                    resourceLevels.add(new JsonObject(signet.getJsonArray("levels").getValue(i).toString()).getString("label"));
                }
                resource.put("levels", resourceLevels);

                JsonArray resourceDiscipline = new JsonArray();
                for (int i = 0; signet.getJsonArray("disciplines").size() > i; i++) {
                    resourceDiscipline.add(new JsonObject(signet.getJsonArray("disciplines").getValue(i).toString()).getString("label"));
                }
                resource.put("disciplines", resourceDiscipline);

                JsonArray resourceKeyword = new JsonArray();
                for (int i = 0; signet.getJsonArray("plain_text").size() > i; i++) {
                    resourceKeyword.add(new JsonObject(signet.getJsonArray("plain_text").getValue(i).toString()).getString("label"));
                }
                resource.put("key_words", resourceKeyword);

                String action = signet.getBoolean("published", false) ? Mediacentre.MEDIACENTRE_UPDATE : Mediacentre.MEDIACENTRE_CREATE;
                eb.send(action, resource, handlerToAsyncHandler(event -> {
                    if ("ok".equals(event.body().getString("status"))) {
                        log.info("export succeeded");
                        handler.handle(new Either.Right<>(event.body().getJsonObject("result")));
                    } else {
                        log.error(event.body());
                        handler.handle(new Either.Left<>("Failed create public course"));
                    }
                }));
            }
}
