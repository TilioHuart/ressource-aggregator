package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.core.constants.Field;
import fr.openent.mediacentre.core.constants.SourceConstant;
import fr.openent.mediacentre.enums.Comparator;
import fr.openent.mediacentre.enums.SourceEnum;
import fr.openent.mediacentre.helper.elasticsearch.ElasticSearch;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.openent.mediacentre.source.Signet;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.webutils.Either;
import io.vertx.core.AsyncResult;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class ElasticSearchHelper {

    private static final Logger log = LoggerFactory.getLogger(ElasticSearchHelper.class);

    private static final String REGEXP_FORMAT = ".*%s.*";
    private static final Integer PAGE_SIZE = 10000;
    private static final FavoriteService favoriteService = new DefaultFavoriteService();

    private ElasticSearchHelper() {
        throw new IllegalStateException("Utility class");
    }

    private static String formatRegexp(String query) {
        return String.format(REGEXP_FORMAT, query.toLowerCase());
    }

    private static void search(Class<?> source, String userId, JsonObject query, Handler<AsyncResult<JsonArray>> handler) {
        Future<JsonArray> esFuture = Future.future();
        Future<List<JsonObject>> favoriteFuture = Future.future();

        executeEsSearch(source, query, esFuture);
        retrieveFavorites(source, userId, favoriteFuture);

        CompositeFuture.all(esFuture, favoriteFuture)
                .onSuccess(ar -> {
                    List<JsonObject> resources = esFuture.result().stream()
                            .filter(JsonObject.class::isInstance)
                            .map(JsonObject.class::cast)
                            .collect(Collectors.toList());
                    List<JsonObject> favorites = favoriteFuture.result();
                    List<String> favoriteMatcher = getFavoriteMatcher(source.getName());
                    resources = resourcesWithFavoritesData(resources, favorites, favoriteMatcher);
                    handler.handle(Future.succeededFuture(new JsonArray(resources)));
                })
                .onFailure(error -> {
                    handler.handle(Future.failedFuture(error.getMessage()));
                    String message = String.format("[Mediacentre@%s::search] Error while getting structures data: %s", ElasticSearchHelper.class.getSimpleName(), error.getMessage());
                    log.error(message);
                });
    }

    private static List<JsonObject> resourcesWithFavoritesData(List<JsonObject> resources, List<JsonObject> favorites, List<String> favoriteMatcher) {
        resources = resources
                .parallelStream()
                .map(resource -> {
                    JsonObject favorite = favorites.stream()
                            .filter(favoriteItem ->
                                    favoriteMatcher.stream().allMatch(favMatcher ->
                                            // in each matched field favorite, we check if each field is present in favorite item and also in resource item
                                            // we then check if their value matched together in order to consider this resource has one favorite
                                            favoriteItem.containsKey(favMatcher) && resource.containsKey(favMatcher) &&
                                                    favoriteItem.getValue(favMatcher).equals(resource.getValue(favMatcher)))
                            )
                            .findFirst()
                            .orElse(new JsonObject());

                    // if we found one favorite, assigning it
                    if (!favorite.isEmpty()) {
                        resource.put(Field.FAVORITE, true);
                        resource.put(Field.FAVORITEID, favorite.getString(Field._ID));
                    }
                    return resource;
                })
                .collect(Collectors.toList());
        return resources;
    }

    private static void retrieveFavorites(Class<?> source, String userId, Handler<AsyncResult<List<JsonObject>>> handler) {
        favoriteService.get(source.getName(), userId, ar -> {
            if (ar.isLeft()) {
                handler.handle(Future.failedFuture(ar.left().getValue()));
                String message = String.format("[Mediacentre@%s::retrieveFavorites] Error retrieving favorites: %s", ElasticSearchHelper.class.getSimpleName(), ar.left().getValue());
                log.error(message);
            } else {
                List<JsonObject> favorites = ar.right().getValue().stream()
                        .filter(JsonObject.class::isInstance)
                        .map(JsonObject.class::cast)
                        .collect(Collectors.toList());

                for (JsonObject favorite : favorites) {
                    String sourceValue = favorite.getString(Field.SOURCE, null);
                    if (sourceValue.equals(SourceEnum.SIGNET.method()))
                        favorite.put(Field.ID, String.valueOf(favorite.getInteger(Field.ID)));
                }
                handler.handle(Future.succeededFuture(favorites));
            }
        });
    }

    private static List<String> getFavoriteMatcher(String source) {
        List<String> matcherList = new ArrayList<>();
        switch (source) {
            case SourceConstant.SIGNET:
            case SourceConstant.MOODLE:
            case SourceConstant.PMB:
                matcherList.add(Field.ID);
                break;
            default:
        }
        return matcherList;
    }

    public static void plainTextSearch(Class<?> source, String query, String userId, List<String> structures, boolean myPublishedSignets, Handler<AsyncResult<JsonArray>> handler) {
        JsonArray should = new JsonArray();
        for (String field : Source.PLAIN_TEXT_FIELDS) {
            JsonObject regexp = new JsonObject()
                    .put(field, formatRegexp(query));
            should.add(new JsonObject().put("regexp", regexp));
        }

        JsonArray must = new JsonArray();
        if(myPublishedSignets) {
            JsonObject term = new JsonObject()
                    .put("authors", userId);
            must.add(new JsonObject().put("term", term));
        }
        must.add(sourceFilter(source));
        if (Objects.nonNull(structures) && !structures.isEmpty()) {
            must.add(structureFilter(structures));
        }

        JsonObject regexpBool = new JsonObject()
                .put("should", should);
        must.add(new JsonObject().put("bool", regexpBool));

        JsonObject bool = new JsonObject()
                .put("must", must);
        JsonObject queryObject = new JsonObject()
                .put("bool", bool);

        search(source, userId, esQueryObject(queryObject), handler);
    }

    private static void executeEsSearch(Class<?> source, JsonObject query, Handler<AsyncResult<JsonArray>> handler) {
        ElasticSearch.getInstance().search(Source.RESOURCE_TYPE_NAME, query, search -> {
            if (search.failed()) {
                handler.handle(Future.failedFuture(search.cause()));
                String message = String.format("[Mediacentre@%s::executeEsSearch] Error while executingEsSearch: %s",
                        ElasticSearchHelper.class.getSimpleName(), search.cause().getMessage());
                log.error(message);
            } else {
                List<JsonObject> resources = parseEsResponse(search.result(), source);
                handler.handle(Future.succeededFuture(new JsonArray(resources)));

            }
        });
    }

    public static void deletePublicSignets(String signetId, Handler<AsyncResult<JsonArray>> handler) {
        JsonObject term = new JsonObject()
                .put("id", signetId);
        JsonObject query = new JsonObject().put("term", term);
        JsonObject object = new JsonObject().put("query", query);

        ElasticSearch.getInstance().delete(object, delete -> {
            if (delete.failed()) {
                handler.handle(Future.failedFuture(delete.cause()));
            } else {
                handler.handle(Future.succeededFuture(new JsonArray().add(delete.result())));
            }
        });
    }

    public static void filterSource(Class<?> source, String userId, Handler<AsyncResult<JsonArray>> handler) {
        JsonArray must = new JsonArray();
        must.add(sourceFilter(source));
        JsonObject bool = new JsonObject()
                .put("must", must);
        JsonObject queryObject = new JsonObject()
                .put("bool", bool);

        search(source, userId, esQueryObject(queryObject), handler);
    }

    public static void myPublishedSignets(String userId, Handler<AsyncResult<JsonArray>> handler) {
        JsonArray must = new JsonArray();
        must.add(sourceFilter(Signet.class));
        JsonObject term = new JsonObject()
                .put("authors", userId);
        must.add(new JsonObject().put("term", term));
        JsonObject bool = new JsonObject()
                .put("must", must);
        JsonObject queryObject = new JsonObject()
                .put("bool", bool);

        search(Signet.class, userId, esQueryObject(queryObject), handler);
    }


    public static void advancedSearch(Class<?> source, JsonObject query, String userId, List<String> structures, Handler<AsyncResult<JsonArray>> handler) {
        boolean hasStructures = Objects.nonNull(structures) && !structures.isEmpty();
        Map<Comparator, List<Map<String, String>>> comparators = sortComparators(query);
        JsonArray should = new JsonArray();

        if (!comparators.get(Comparator.AND).isEmpty()) {
            JsonArray $andMust = new JsonArray();
            $andMust.add(sourceFilter(source));

            if (hasStructures) $andMust.add(structureFilter(structures));

            for (Map<String, String> $andFields : comparators.get(Comparator.AND)) {
                $andMust.add(regexpField($andFields.get("field"), $andFields.get("value")));
            }

            JsonObject $andShouldObject = new JsonObject()
                    .put("bool", new JsonObject().put("must", $andMust));

            should.add($andShouldObject);
        }

        if (!comparators.get(Comparator.OR).isEmpty()) {
            JsonArray $orMust = new JsonArray();
            $orMust.add(sourceFilter(source));

            if (hasStructures) $orMust.add(structureFilter(structures));

            JsonArray $orShould = new JsonArray();
            for (Map<String, String> $orFields : comparators.get(Comparator.OR)) {
                $orShould.add(regexpField($orFields.get("field"), $orFields.get("value")));
            }
            JsonObject $orMustBoolObject = new JsonObject()
                    .put("bool", new JsonObject().put("should", $orShould));
            $orMust.add($orMustBoolObject);

            JsonObject $orShouldObject = new JsonObject()
                    .put("bool", new JsonObject().put("must", $orMust));

            should.add($orShouldObject);
        }

        if (should.isEmpty()) {
            handler.handle(Future.succeededFuture(new JsonArray()));
            return;
        }

        JsonObject bool = new JsonObject()
                .put("should", should);

        JsonObject queryObject = new JsonObject()
                .put("bool", bool);

        search(source, userId, esQueryObject(queryObject), handler);

    }

    private static JsonObject sourceFilter(Class<?> source) {
        JsonObject term = new JsonObject()
                .put("source", source.getName());

        return new JsonObject()
                .put("term", term);
    }

    private static List<JsonObject> parseEsResponse(JsonObject esResponse, Class<?> source) {
        return esResponse
                .getJsonObject("hits", new JsonObject())
                .getJsonArray("hits", new JsonArray())
                .stream()
                .map(ElasticSearchHelper::extractSourceObject)
                .map(resource -> resource.put("source", source.getName()))
                .collect(Collectors.toList());
    }

    private static JsonObject esQueryObject(JsonObject query) {
        return new JsonObject()
                .put("query", query)
                .put("from", 0)
                .put("size", PAGE_SIZE);
    }

    private static JsonObject regexpField(String field, String query) {
        JsonObject regexp = new JsonObject()
                .put(field, formatRegexp(query));

        return new JsonObject().put("regexp", regexp);
    }

    private static Map<Comparator, List<Map<String, String>>> sortComparators(JsonObject query) {
        Map<Comparator, List<Map<String, String>>> res = new HashMap();
        res.put(Comparator.AND, new ArrayList<>());
        res.put(Comparator.OR, new ArrayList<>());
        if (query.containsKey("title")) {
            Map<String, String> field = new HashMap<>();
            field.put("field", "title");
            field.put("value", query.getJsonObject("title", new JsonObject()).getString("value", ""));
            res.get(Comparator.AND).add(field);
            query.remove("title");
        }

        for (String field : query.fieldNames()) {
            JsonObject searchQuery = query.getJsonObject(field);
            Comparator comparator = Comparator.get(searchQuery.getString("comparator"));
            Map<String, String> searchField = new HashMap<>();
            searchField.put("field", field);
            searchField.put("value", searchQuery.getString("value"));
            res.get(comparator).add(searchField);
        }

        return res;
    }

    private static JsonObject extractSourceObject(Object resource) {
        return ((JsonObject) resource).getJsonObject("_source");
    }

    private static JsonObject structureFilter(List<String> structures) {
        JsonObject terms = new JsonObject()
                .put("structure", new JsonArray(structures));

        return new JsonObject().put("terms", terms);
    }

    public static Handler<AsyncResult<JsonArray>> searchHandler(Class<?> source, Function<JsonObject, JsonObject> actionProvider, Handler<Either<JsonObject, JsonObject>> handler) {
        return ar -> {
            if (ar.failed())
                handler.handle(new Either.Left<>(new JsonObject().put("source", source.getName()).put("error", "[" + source.getName() + "] " + ar.cause().getMessage())));
            else {
                List<JsonObject> resources = ((List<JsonObject>) ar.result().getList());
                if (Objects.nonNull(actionProvider)) {
                    resources = resources
                            .stream()
                            .map(actionProvider)
                            .collect(Collectors.toList());
                }
                JsonObject response = new JsonObject()
                        .put("source", source.getName())
                        .put("resources", new JsonArray(resources));
                handler.handle(new Either.Right<>(response));
            }
        };
    }

}
