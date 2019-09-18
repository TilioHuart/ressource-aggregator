package fr.openent.mediacentre.source;

import fr.openent.mediacentre.enums.Comparator;
import fr.openent.mediacentre.helper.FavoriteHelper;
import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.wseduc.webutils.Either;
import io.vertx.core.AsyncResult;
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
    private static String GAR_ADDRESS = "openent.mediacentre";
    private FavoriteService favoriteService = new DefaultFavoriteService();
    private FavoriteHelper favoriteHelper = new FavoriteHelper();

    private final Logger log = LoggerFactory.getLogger(GAR.class);
    private EventBus eb;
    private JsonObject config;

    /**
     * Retrieve and format user GAR resources
     *
     * @param userId      User that needs to retrieve GAR resources
     * @param structureId Structure identifier
     * @param handler     Function handler returning data
     */
    private void getData(String userId, String structureId, Handler<Either<String, JsonArray>> handler) {

        Future<JsonArray> getResourcesFuture = Future.future();
        Future<JsonArray> getFavoritesResourcesFuture = Future.future();

        CompositeFuture.all(getResourcesFuture, getFavoritesResourcesFuture).setHandler(event -> {
            if (event.failed()) {
                handler.handle(new Either.Left<>(event.cause().getMessage()));
            } else {
                JsonArray formattedResources = new JsonArray();

                for (int i = 0; i < getResourcesFuture.result().size(); i++) {
                    formattedResources.add(format(getResourcesFuture.result().getJsonObject(i)));
                }

                /* Assign favorite to true if resources match with mongoDb's resources */
                favoriteHelper.matchFavorite(getFavoritesResourcesFuture, formattedResources);
                handler.handle(new Either.Right<>(formattedResources));
            }
        });

        getResources(userId, structureId, FutureHelper.handlerJsonArray(getResourcesFuture));
        favoriteService.get(GAR.class.getName(), userId, FutureHelper.handlerJsonArray(getFavoritesResourcesFuture));
    }

    /**
     * Get GAR resources
     *
     * @param userId      User that needs to retrieve resources
     * @param structureId User structure identifier
     * @param handler     Function handler returning data
     */
    private void getResources(String userId, String structureId, Handler<Either<String, JsonArray>> handler) {
        JsonObject action = new JsonObject()
                .put("action", "getResources")
                .put("structure", structureId)
                .put("user", userId);

        eb.send(GAR_ADDRESS, action, handlerToAsyncHandler(event -> {
            if (!"ok".equals(event.body().getString("status"))) {
                log.error("[Gar@search] Failed to retrieve gar resources", event.body().getString("message"));
                handler.handle(new Either.Left<>(event.body().getString("message")));
                return;
            }

            handler.handle(new Either.Right<>(event.body().getJsonArray("message")));
        }));
    }

    /**
     * Retrieve all structures GAR resources
     *
     * @param user    User that needs resources
     * @param futures Future list
     * @param handler Function handler returning data
     */
    private void getStructuresData(UserInfos user, List<Future> futures, Handler<AsyncResult<CompositeFuture>> handler) {
        List<String> structures = user.getStructures();
        for (String structure : structures) {
            Future<JsonArray> future = Future.future();
            futures.add(future);
            getData(user.getUserId(), structure, FutureHelper.handlerJsonArray(future));
        }

        CompositeFuture.all(futures).setHandler(handler);
    }

    @Override
    public void plainTextSearch(String query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        List<Future> futures = new ArrayList<>();
        getStructuresData(user, futures, event -> {
            if (event.failed()) {
                log.error("[GarSource@plainTextSearch] Failed to retrieve GAR resources.", event.cause());
                handler.handle(new Either.Left<>(new JsonObject().put("source", GAR.class.getName()).put("message", "[GAR] " + event.cause().getMessage())));
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
                if (ids.containsKey(resource.getString("id"))) {
                    continue;
                }
                ids.put(resource.getString("id"), true);
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

    private Integer getOccurrenceCount(String query, Object value) {
        return value instanceof JsonArray ? getOccurrenceCount(query, (JsonArray) value) : getOccurrenceCount(query, (String) value);
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
        Pattern regexp = Pattern.compile(query, Pattern.CASE_INSENSITIVE);
        Matcher matcher = regexp.matcher(value);
        while (matcher.find()) {
            count++;
        }

        return count;
    }

    @Override
    public void advancedSearch(JsonObject query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        List<String> fields = Arrays.asList("title", "authors", "editors", "disciplines", "levels");
        List<Future> futures = new ArrayList<>();
        getStructuresData(user, futures, event -> {
            if (event.failed()) {
                log.error("[GarSource@advancedSearch] Failed to retrieve GAR resources.", event.cause());
                handler.handle(new Either.Left<>(new JsonObject().put("source", GAR.class.getName()).put("message", "[GAR] " + event.cause().getMessage())));
                return;
            }

            JsonArray resources = new JsonArray();
            for (Future future : futures) {
                resources.addAll((JsonArray) future.result());
            }

            HashMap<String, Boolean> ids = new HashMap<>();
            SortedMap<Integer, JsonArray> sortedMap = new TreeMap<>();
            JsonArray matches = new JsonArray();
            JsonObject searchFields = splitFields(fields, query);
            for (int i = 0; i < resources.size(); i++) {
                JsonObject resource = resources.getJsonObject(i);
                if (ids.containsKey(resource.getString("id"))) {
                    continue;
                }

                ids.put(resource.getString("id"), true);
                int count = 0;
                boolean match = true;
                List<Comparator> andList = Arrays.asList(Comparator.NONE, Comparator.AND);
                for (Comparator comp : andList) {
                    if (searchFields.containsKey(comp.toString())) {
                        JsonObject values = searchFields.getJsonObject(comp.toString());
                        Iterator<String> keys = values.fieldNames().iterator();
                        while (keys.hasNext()) {
                            String next = keys.next();
                            String searchedValue = queryPattern(values.getString(next));
                            Integer occ = getOccurrenceCount(searchedValue, resource.getValue(next));
                            count += occ;
                            match = match && (occ > 0);
                        }
                    }
                }

                if (searchFields.containsKey(Comparator.OR.toString())) {
                    JsonObject values = searchFields.getJsonObject(Comparator.OR.toString());
                    Iterator<String> keys = values.fieldNames().iterator();
                    while (keys.hasNext()) {
                        String next = keys.next();
                        String searchedValue = queryPattern(values.getString(next));
                        Integer occ = getOccurrenceCount(searchedValue, resource.getValue(next));
                        count += occ;
                        match = match || (occ > 0);
                    }
                }

                if (count > 0 && match) {
                    if (!sortedMap.containsKey(count)) {
                        sortedMap.put(count, new JsonArray());
                    }
                    sortedMap.get(count).add(resource);
                }
            }

            List<Integer> keys = new ArrayList<>(sortedMap.keySet());
            Collections.reverse(keys);

            for (Integer key : keys) {
                matches.addAll(sortedMap.get(key));
            }

            JsonObject response = new JsonObject()
                    .put("source", GAR.class.getName())
                    .put("resources", matches);
            handler.handle(new Either.Right<>(response));
        });
    }

    private String queryPattern(String value) {
        return value.replaceAll(",\\s?|;\\s?", "|");
    }

    private String queryPattern(JsonArray values) {
        StringBuilder pattern = new StringBuilder();
        for (int i = 0; i < values.size(); i++) {
            pattern.append(queryPattern(values.getString(i)))
                    .append("|");
        }

        return pattern.toString().substring(0, pattern.toString().length() - 1);
    }

    private JsonObject splitFields(List<String> fields, JsonObject query) {
        JsonObject split = new JsonObject();
        for (String field : fields) {
            if (!query.containsKey(field)) continue;
            JsonObject objectField = query.getJsonObject(field);
            String comparator = objectField.containsKey("comparator") ? objectField.getString("comparator") : "none";
            if (!split.containsKey(comparator)) split.put(comparator, new JsonObject());
            split.getJsonObject(comparator).put(field, objectField.getString("value"));
        }

        return split;
    }

    @Override
    public JsonObject format(JsonObject resource) {
        return new JsonObject()
                .put("title", resource.getString("nomRessource"))
                .put("editors", new JsonArray().add(resource.getString("nomEditeur")))
                .put("authors", new JsonArray())
                .put("image", resource.getString("urlVignette"))
                .put("disciplines", getNames("domaineEnseignement", resource))
                .put("levels", getNames("niveauEducatif", resource))
                .put("document_types", getNames("typologieDocument", resource))
                .put("link", resource.getString("urlAccesRessource"))
                .put("source", GAR.class.getName())
                .put("plain_text", createPlainText(resource))
                .put("id", resource.getString("idRessource"))
                .put("favorite", false)
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
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void setEventBus(EventBus eb) {
        this.eb = eb;
    }

    @Override
    public void setConfig(JsonObject config) {
        this.config = config;
    }

    public void initTextBooks(UserInfos user, Handler<Either<String, JsonArray>> handler) {
        List<Future> futures = new ArrayList<>();
        List<String> structures = user.getStructures();
        for (String structure : structures) {
            Future<JsonArray> future = Future.future();
            futures.add(future);
            getResources(user.getUserId(), structure, FutureHelper.handlerJsonArray(future));
        }

        String pattern = queryPattern(config.getJsonArray("textbook_typology", new JsonArray()));
        Pattern regexp = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE);

        CompositeFuture.all(futures).setHandler(event -> {
            if (event.failed()) {
                log.error("[Gar@initTextBooks] Failed to retrieve GAR resources", event.cause());
                handler.handle(new Either.Left<>(event.cause().toString()));
                return;
            }

            JsonArray textBooks = new JsonArray();
            JsonArray resources = new JsonArray();
            List<String> list = new ArrayList<>();
            for (Future future : futures) {
                resources.addAll((JsonArray) future.result());
            }

            for (int i = 0; i < resources.size(); i++) {
                JsonObject resource = resources.getJsonObject(i);
                JsonObject type = resource.getJsonObject("typePresentation");
                Matcher matcher = regexp.matcher(type.getString("code"));
                if (matcher.find() && !list.contains(resource.getString("idRessource"))) {
                    list.add(resource.getString("idRessource"));
                    textBooks.add(format(resource));
                }
            }

            handler.handle(new Either.Right<>(textBooks));
        });
    }
}
