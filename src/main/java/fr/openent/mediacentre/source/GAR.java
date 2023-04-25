package fr.openent.mediacentre.source;

import fr.openent.mediacentre.enums.Comparator;
import fr.openent.mediacentre.helper.FavoriteHelper;
import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.security.WorkflowActionUtils;
import fr.openent.mediacentre.security.WorkflowActions;
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
    private final FavoriteService favoriteService = new DefaultFavoriteService();
    private final FavoriteHelper favoriteHelper = new FavoriteHelper();
    private static final String REGEXP_FORMAT = ".*%s.*";

    private final Logger log = LoggerFactory.getLogger(GAR.class);
    private EventBus eb;
    private JsonObject config;

    /**
     * Retrieve and format user GAR resources
     *
     * @param user      User that needs to retrieve GAR resources
     * @param structureId Structure identifier
     * @param handler     Function handler returning data
     */
    private void getData(UserInfos user, String structureId, Handler<Either<String, JsonArray>> handler) {

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

        getResources(user, structureId, FutureHelper.handlerJsonArray(getResourcesFuture));
        favoriteService.get(GAR.class.getName(), user.getUserId(), FutureHelper.handlerJsonArray(getFavoritesResourcesFuture));
    }

    /**
     * Get GAR resources
     *
     * @param user      User that needs to retrieve resources
     * @param structureId User structure identifier
     * @param handler     Function handler returning data
     */
    private void getResources(UserInfos user, String structureId, Handler<Either<String, JsonArray>> handler) {
        if(WorkflowActionUtils.hasRight(user, WorkflowActions.GAR_RIGHT.toString())) {
            JsonObject action = new JsonObject()
                    .put("action", "getResources")
                    .put("structure", structureId)
                    .put("user", user.getUserId())
                    .put("hostname", config.getString("host").split("//")[1]);

            String GAR_ADDRESS = "openent.mediacentre";
            eb.send(GAR_ADDRESS, action, handlerToAsyncHandler(event -> {
                if (!"ok".equals(event.body().getString("status"))) {
                    log.error("[Gar@search] Failed to retrieve gar resources", event.body().getString("message"));
                    handler.handle(new Either.Left<>(event.body().getString("message")));
                    return;
                }

                handler.handle(new Either.Right<>(event.body().getJsonArray("message")));
            }));
        } else {
            handler.handle(new Either.Right<>(new JsonArray()));
        }
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
            getData(user, structure, FutureHelper.handlerJsonArray(future));
        }

        CompositeFuture.join(futures).setHandler(handler);
    }

    @Override
    public void plainTextSearch(String query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        List<Future> futures = new ArrayList<>();
        getStructuresData(user, futures, event -> {
            JsonArray resources = new JsonArray();
            for (Future future : futures) {
                if (future.succeeded()) {
                    resources.addAll((JsonArray) future.result());
                }
            }

            if (resources.isEmpty()) {
                log.error("[GarSource@plainTextSearch] resources are empty");
                handler.handle(new Either.Left<>(new JsonObject().put("source", GAR.class.getName()).put("message", "[GAR] resources are empty")));
                return;
            }

            HashMap<String, String> ids = new HashMap<>();
            List<String> duplicateIds = new ArrayList<>();
            SortedMap<Integer, JsonArray> sortedMap = new TreeMap<>();
            for (int i = 0; i < resources.size(); i++) {
                JsonObject resource = resources.getJsonObject(i);
                if (checkDuplicateId(resources, ids, duplicateIds, resource)) continue;
                Integer count = 0;
                count += getOccurrenceCount(String.format(REGEXP_FORMAT, query.toLowerCase()), resource.getString("title"));
                count += getOccurrenceCount(String.format(REGEXP_FORMAT, query.toLowerCase()), resource.getString("plain_text"));
                count += getOccurrenceCount(String.format(REGEXP_FORMAT, query.toLowerCase()), resource.getJsonArray("levels"));
                count += getOccurrenceCount(String.format(REGEXP_FORMAT, query.toLowerCase()), resource.getJsonArray("disciplines"));
                count += getOccurrenceCount(String.format(REGEXP_FORMAT, query.toLowerCase()), resource.getJsonArray("editors"));
                count += getOccurrenceCount(String.format(REGEXP_FORMAT, query.toLowerCase()), resource.getJsonArray("authors"));

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
            JsonArray resources = new JsonArray();
            for (Future future : futures) {
                if (future.succeeded()) {
                    resources.addAll((JsonArray) future.result());
                }
            }

            if (resources.isEmpty()) {
                log.error("[GarSource@advancedSearch] Failed to retrieve GAR resources.", event.cause());
                handler.handle(new Either.Left<>(new JsonObject().put("source", GAR.class.getName()).put("message", "[GAR] " + event.cause().getMessage())));
                return;
            }

            JsonArray matches = new JsonArray();
            JsonObject searchFields = splitFields(fields, query);
            HashMap<String, String> ids = new HashMap<>();
            List<String> duplicateIds = new ArrayList<>();
            SortedMap<Integer, JsonArray> sortedMap = new TreeMap<>();
            for (int i = 0; i < resources.size(); i++) {
                JsonObject resource = resources.getJsonObject(i);
                if (checkDuplicateId(resources, ids, duplicateIds, resource)) continue;
                int count = 0;
                boolean match = true;
                List<Comparator> andList = Arrays.asList(Comparator.NONE, Comparator.AND);
                for (Comparator comp : andList) {
                    if (searchFields.containsKey(comp.toString())) {
                        JsonObject values = searchFields.getJsonObject(comp.toString());
                        for (String next : values.fieldNames()) {
                            String searchedValue = queryPattern(values.getString(next));
                            Integer occ = getOccurrenceCount(searchedValue, resource.getValue(next));
                            count += occ;
                            match = match && (occ > 0);
                        }
                    }
                }

                if (searchFields.containsKey(Comparator.OR.toString())) {
                    JsonObject values = searchFields.getJsonObject(Comparator.OR.toString());
                    for (String next : values.fieldNames()) {
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

    private boolean checkDuplicateId(JsonArray resources, HashMap<String, String> ids, List<String> duplicateIds, JsonObject resource) {
        String ressourceId = resource.getString("id");
        if (ids.containsKey(ressourceId)) {
            if (ids.get(ressourceId).equals(resource.getString("structure_uai"))) {
                return true;
            } else if (!duplicateIds.contains(ressourceId)) {
                for (int j = 0; j < resources.size(); j++) {
                    JsonObject resource2 = resources.getJsonObject(j);
                    if (ressourceId.equals(resource2.getString("id"))) {
                        resource2.put("display_structure_name", true);
                    }
                }
                duplicateIds.add(ressourceId);
            }
        }
        ids.put(ressourceId, resource.getString("structure_uai"));
        return false;
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

        return pattern.substring(0, pattern.toString().length() - 1);
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
                .put("date", System.currentTimeMillis())
                .put("structure_name",resource.getString("structure_name"))
                .put("structure_uai",resource.getString("structure_uai"));
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
    public void amass() {
        log.info("GAR source does not need amass");
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
            getResources(user, structure, FutureHelper.handlerJsonArray(future));
        }

        String pattern = queryPattern(config.getJsonArray("textbook_typology", new JsonArray()));
        Pattern regexp = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE);

        CompositeFuture.join(futures).setHandler(event -> {
            if(event.succeeded()) {
                JsonArray textBooks = new JsonArray();
                JsonArray resources = new JsonArray();
                List<String> list = new ArrayList<>();
                for (Future future : futures) {
                    if (future.succeeded()) {
                        resources.addAll((JsonArray) future.result());
                    }
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
            } else  {
                log.error("[Gar@initTextBooks] Failed to retrieve GAR resources", event.cause());
                handler.handle(new Either.Left<>(event.cause().toString()));
            }
        });
    }
}
