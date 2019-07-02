package fr.openent.mediacentre.source;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;

public class GAR implements Source {
    private static String GAR_ADDRESS = "openent.gar";
    private final Logger log = LoggerFactory.getLogger(GAR.class);
    private EventBus eb;

    @Override
    public void search(JsonObject query, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        //TODO need multi structure refactoring
        JsonObject action = new JsonObject()
                .put("action", "getResources")
                .put("structure", user.getStructures().get(0))
                .put("user", user.getUserId());

        eb.send(GAR_ADDRESS, action, handlerToAsyncHandler(event -> {
            if (!"ok" .equals(event.body().getString("status"))) {
                log.error("[Gar@search] Failed to retrieve gar resources", event.body().getString("message"));
                handler.handle(new Either.Left<>(event.body().getString("message")));
                return;
            }

            JsonArray garResources = event.body().getJsonArray("message");
            JsonArray formattedResources = new JsonArray();
            for (int i = 0; i < garResources.size(); i++) {
                formattedResources.add(format(garResources.getJsonObject(i)));
            }

            JsonObject response = new JsonObject()
                    .put("source", "GAR")
                    .put("resources", formattedResources);
            handler.handle(new Either.Right<>(response));
        }));
    }

    @Override
    public JsonObject format(JsonObject resource) {
        JsonObject formatted = new JsonObject()
                .put("title", resource.getString("nomRessource"))
                .put("editors", new JsonArray().add(resource.getString("nomEditeur")))
                .put("authors", new JsonArray())
                .put("image", resource.getString("urlVignette"))
                .put("disciplines", new JsonArray())
                .put("levels", getNames("niveauEducatif", resource))
                .put("document_types", getNames("typologieDocument", resource))
                .put("link", resource.getString("urlAccesRessource"))
                .put("source", "GAR")
                .put("plain_text", createPlainText(resource))
                .put("_id", resource.getString("idRessource"))
                .put("date", System.currentTimeMillis());
        return formatted;
    }

    private String createPlainText(JsonObject resource) {
        StringBuilder plain = new StringBuilder();
        JsonArray domaineEnseignement = resource.getJsonArray("domaineEnseignement");
        for (int i = 0; i < domaineEnseignement.size(); i++) {
            plain.append(domaineEnseignement.getJsonObject(i).getString("nom"))
                    .append(" ");
        }

        JsonArray typePedagogique = resource.getJsonArray("typePedagogique");
        for (int i = 0; i < typePedagogique.size(); i++) {
            plain.append(typePedagogique.getJsonObject(i).getString("nom"))
                    .append(" ");
        }

        return plain.toString();
    }

    private JsonArray getNames(String key, JsonObject resource) {
        JsonArray names = new JsonArray();
        JsonArray values = resource.getJsonArray(key);

        for (int i = 0; i < values.size(); i++) {
            names.add(values.getJsonObject(i).getString("nom"));
        }

        return names;
    }

    @Override
    public void harvest() {
    }

    @Override
    public void setEventBus(EventBus eb) {
        this.eb = eb;
    }
}
