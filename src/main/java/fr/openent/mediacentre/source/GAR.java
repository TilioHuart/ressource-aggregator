package fr.openent.mediacentre.source;

import fr.openent.mediacentre.helper.FutureHelper;
import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;

public class GAR implements Source {
    private static String GAR_ADDRESS = "openent.gar";
    private final Logger log = LoggerFactory.getLogger(GAR.class);
    private EventBus eb;

    private void getData(String userId, String structureId, Handler<Either<String, JsonArray>> handler) {
        JsonObject action = new JsonObject()
                .put("action", "getResources")
                .put("structure", structureId)
                .put("user", userId);

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

            handler.handle(new Either.Right<>(formattedResources));
        }));
    }

    @Override
    public void plainTextSearch(String query, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        List<Future> futures = new ArrayList<>();
        List<String> structures = user.getStructures();
        for (String structure : structures) {
            Future<JsonArray> future = Future.future();
            futures.add(future);
            getData(user.getUserId(), structure, FutureHelper.handlerJsonArray(future));
        }

        CompositeFuture.all(futures).setHandler(event -> {
            if (event.failed()) {
                log.error("[GarSource@plainTextSearch] Failed to retrieve GAR resources.", event.cause());
                handler.handle(new Either.Left<>(event.cause().toString()));
                return;
            }

            JsonArray resources = new JsonArray();
            HashMap<String, Boolean> ids = new HashMap<>();
            SortedMap<Integer, JsonArray> sortedMap = new TreeMap<>();
            for (Future future : futures) {
                resources.addAll((JsonArray) future.result());
            }

            for (int i = 0; i < resources.size(); i++) {
                JsonObject resource = resources.getJsonObject(i);
                if (ids.containsKey(resource.getString("_id"))) {
                    continue;
                }
                ids.put(resource.getString("_id"), true);
                Integer count = 0;
                count += getOccurrenceCount(query, resource.getString("title"));
                count += getOccurrenceCount(query, resource.getString("plain_text"));
                count += getOccurrenceCount(query, resource.getJsonArray("levels"));
                count += getOccurrenceCount(query, resource.getJsonArray("disciplines"));
                count += getOccurrenceCount(query, resource.getJsonArray("editors"));
                count += getOccurrenceCount(query, resource.getJsonArray("authors"));

                if (count > 0) {
                    if (!sortedMap.containsKey(count)) {
                        sortedMap.put(count, new JsonArray());
                    }
                    sortedMap.get(count).add(resource);
                }
            }

            List<Integer> keys = new ArrayList<>(sortedMap.keySet());
            Collections.reverse(keys);

            JsonArray filteredResources = new JsonArray();
            for (Integer key : keys) {
                filteredResources.addAll(sortedMap.get(key));
            }

            JsonObject response = new JsonObject()
                    .put("source", GAR.class.getName())
                    .put("resources", filteredResources);
            handler.handle(new Either.Right<>(response));
        });
    }

    private Integer getOccurrenceCount(String query, JsonArray values) {
        Integer count = 0;
        for (int i = 0; i < values.size(); i++) {
            count += getOccurrenceCount(query, values.getString(i));
        }

        return count;
    }

    private Integer getOccurrenceCount(String query, String value) {
        Integer count = 0;
        Pattern regexp = Pattern.compile(query);
        Matcher matcher = regexp.matcher(value);
        while (matcher.find()) {
            count++;
        }

        return count;
    }

    @Override
    public void advancedSearch(JsonObject query, UserInfos user, Handler<Either<String, JsonObject>> handler) {

    }

    @Override
    public JsonObject format(JsonObject resource) {
        return new JsonObject()
                .put("title", resource.getString("nomRessource"))
                .put("editors", new JsonArray().add(resource.getString("nomEditeur")))
                .put("authors", new JsonArray())
                .put("image", resource.getString("urlVignette"))
                .put("disciplines", new JsonArray())
                .put("levels", getNames("niveauEducatif", resource))
                .put("document_types", getNames("typologieDocument", resource))
                .put("link", resource.getString("urlAccesRessource"))
                .put("source", GAR.class.getName())
                .put("plain_text", createPlainText(resource))
                .put("_id", resource.getString("idRessource"))
                .put("date", System.currentTimeMillis());
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
