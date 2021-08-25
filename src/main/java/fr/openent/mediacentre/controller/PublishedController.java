package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.service.impl.DefaultModuleSQLRequestService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import static fr.wseduc.webutils.http.response.DefaultResponseHandler.arrayResponseHandler;

public class PublishedController extends ControllerHelper {

    private final fr.openent.mediacentre.service.moduleSQLRequestService moduleSQLRequestService;
    public PublishedController(EventBus eb) {
        super();
        this.moduleSQLRequestService = new DefaultModuleSQLRequestService(Mediacentre.mediacentreSchema, "signet");
    }

    @Get("/levels")
    @ApiDoc("get all levels")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void getLevels (HttpServerRequest request) {
        moduleSQLRequestService.getLevels(arrayResponseHandler(request));

    }


    @Get("/disciplines")
    @ApiDoc("get all disciplines")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void getDisciplines (HttpServerRequest request) {
        moduleSQLRequestService.getDisciplines(arrayResponseHandler(request));
    }

/*    @Post("/signet/publish")
    @ApiDoc("Publish a signet in BP")
    public void publish (HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "duplicate", duplicateCourse ->
                UserUtils.getUserInfos(eb, request, user -> {
                    duplicateCourse.put("userid", user.getUserId());
                    duplicateCourse.put("username", user.getFirstName().toUpperCase() + " " + user.getLastName());
                    duplicateCourse.put("author", duplicateCourse.getJsonArray("authors").getJsonObject(0).getString("firstname").toUpperCase() +
                            " " + duplicateCourse.getJsonArray("authors").getJsonObject(0).getString("lastname").toUpperCase());
                    duplicateCourse.put("author_id", duplicateCourse.getJsonArray("authors").getJsonObject(0).getString("entidnumber"));
                    moduleSQLRequestService.insertPublishedCourseMetadata(duplicateCourse, event -> {
                        if (event.isRight()) {
                            JsonObject signetToPublish = new JsonObject();
                            signetToPublish.put("userId", user.getUserId());
                            signetToPublish.put("signetid", duplicateCourse.getJsonArray("signetsId").getInteger(0));
                            signetToPublish.put("folderId", 0);
                            signetToPublish.put("status", WAITING);
                            signetToPublish.put("category_id", mediacentreConfig.getInteger("publicBankCategoryId"));
                            signetToPublish.put("auditeur_id", user.getUserId());
                            signetToPublish.put("publishFK", event.right().getValue().getInteger("id"));

                            moduleSQLRequestService.insertDuplicateTable(signetToPublish, new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> event) {
                                    if (event.isRight()) {
                                        request.response()
                                                .setStatusCode(200)
                                                .end();
                                    } else {
                                        handle(new Either.Left<>("Failed to insert in duplicate table"));
                                    }
                                }
                            });
                        } else {
                            log.error("Failed to insert in publication table");
                        }
                    });
                }));
    }

    @Post("/metadata/update")
    @ApiDoc("Update public signet metadata")
    @ResourceFilter(PublicateRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void updatePublicCourseMetadata(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, updateMetadata -> {
            Integer signet_id = updateMetadata.getJsonArray("signetsId").getInteger(0);
            JsonObject newMetadata = new JsonObject();

            JsonArray levelArray = new JsonArray();
            for (int i = 0; i < updateMetadata.getJsonArray("levels").size(); i++) {
                levelArray.add((updateMetadata.getJsonArray("levels").getJsonObject(i).getString("label")));
            }
            if(levelArray.isEmpty()) {
                levelArray.add("");
            }
            newMetadata.put("level_label", levelArray);

            JsonArray disciplineArray = new JsonArray();
            for (int i = 0; i < updateMetadata.getJsonArray("disciplines").size(); i++) {
                disciplineArray.add((updateMetadata.getJsonArray("disciplines").getJsonObject(i).getString("label")));
            }
            if(disciplineArray.isEmpty()) {
                disciplineArray.add("");
            }
            newMetadata.put("discipline_label", disciplineArray);

            JsonArray plainTextArray = new JsonArray();
            for (int i = 0; i < updateMetadata.getJsonArray("plain_text").size(); i++) {
                plainTextArray.add((updateMetadata.getJsonArray("plain_text").getJsonObject(i).getString("label")));
            }
            if(plainTextArray.isEmpty()) {
                plainTextArray.add("");
            }
            newMetadata.put("plain_text", plainTextArray);
            callMediacentreEventBusToUpdateMetadata(updateMetadata, mediacentreEventBus, ebEvent -> {
                if (ebEvent.isRight()) {
                    moduleSQLRequestService.updatePublicCourseMetadata(signet_id, newMetadata, event -> {
                        if (event.isRight()) {
                            request.response()
                                    .setStatusCode(200)
                                    .end();
                        } else {
                            log.error("Problem updating the public signet metadata : " + event.left().getValue());
                            unauthorized(request);
                        }
                    });
                } else {
                    log.error("Problem with ElasticSearch updating : " + ebEvent.left().getValue());
                    unauthorized(request);
                }
            });
        });
    }

    static public void callMediacentreEventBusForPublish(JsonArray id, fr.openent.mediacentre.service.mediacentreEventBus eventBus,
                                                         final Handler<Either<String, JsonObject>> handler) {
        eventBus.publishInMediacentre(id, handler);
    }

    static public void callMediacentreEventBusToDelete(HttpServerRequest request, fr.openent.mediacentre.service.mediacentreEventBus eventBus,
                                                       final Handler<Either<String, JsonObject>> handler) {
        RequestUtils.bodyToJson(request, deleteEvent -> eventBus.deleteResourceInMediacentre(deleteEvent, handler));
    }

    public void callMediacentreEventBusToUpdateMetadata(JsonObject updateMetadata, fr.openent.mediacentre.service.mediacentreEventBus eventBus,
                                                        final Handler<Either<String, JsonObject>> handler) {
        eventBus.updateResourceInMediacentre(updateMetadata, handler);
    }

    static public void callMediacentreEventBusToUpdate(JsonObject updateCourse, fr.openent.mediacentre.service.mediacentreEventBus eventBus,
                                                       final Handler<Either<String, JsonObject>> handler) {
        eventBus.updateInMediacentre(updateCourse, handler);
    }*/
}
