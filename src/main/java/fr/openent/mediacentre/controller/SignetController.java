package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.helper.APIHelper;
import fr.openent.mediacentre.helper.SignetHelper;
import fr.openent.mediacentre.security.ShareAndOwner;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.UserService;
import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.service.SignetSharesService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.openent.mediacentre.service.impl.DefaultUserService;
import fr.openent.mediacentre.service.impl.DefaultSignetService;
import fr.openent.mediacentre.service.impl.DefaultSignetSharesService;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.AsyncResult;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static fr.openent.mediacentre.helper.FutureHelper.handlerJsonObject;
import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;

public class SignetController extends ControllerHelper {
    private static final Logger log = LoggerFactory.getLogger(SignetController.class);
    private final SignetService signetService;
    private final SignetSharesService signetShareService;
    private final UserService userService;
    private final FavoriteService favoriteService;
    private final SignetHelper signetHelper;

    public SignetController(EventBus eb) {
        super();
        this.eb = eb;
        this.signetService = new DefaultSignetService();
        this.signetShareService = new DefaultSignetSharesService();
        this.userService = new DefaultUserService();
        this.favoriteService = new DefaultFavoriteService();
        this.signetHelper = new SignetHelper();
    }

    @Get("/signets")
    @ApiDoc("Retrieve all the public signets")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getPublicSignets(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            signetHelper.signetRetrieve(user, "get", new APIHelper(request));
        });
    }

    @Get("/mysignets")
    @ApiDoc("List all the signets created by me or shared with me")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void list(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                final List<String> groupsAndUserIds = new ArrayList<>();
                groupsAndUserIds.add(user.getUserId());
                if (user.getGroupsIds() != null) {
                    groupsAndUserIds.addAll(user.getGroupsIds());
                }
                signetService.list(groupsAndUserIds, user, arrayResponseHandler(request));
            } else {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }
        });
    }

    @Get("/signets/:id")
    @ApiDoc("Get a specific signet by id")
    @ResourceFilter(ShareAndOwner.class)
    @SecuredAction(value = Mediacentre.VIEW_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void get(HttpServerRequest request) {
        String signetId = request.getParam("id");
        signetService.get(signetId, defaultResponseHandler(request));
    }

    @Get("/signets/public/")
    @ApiDoc("Get all my published signets")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getPublic(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
                signetService.getMyPublishedSignet(user.getLastName() + " " + user.getFirstName(), event -> {
                    if(event.isRight()) {
                        renderJson(request, event.right().getValue());;
                    } else {
                        log.error("Public signet not found");
                    }
                });
        });
    }

    @Post("/signets")
    @ApiDoc("Create a signet")
    @SecuredAction(Mediacentre.CREATION_RIGHT)
    public void create(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                RequestUtils.bodyToJson(request, signet -> {
                    signetService.create(signet, user, event -> {
                        JsonObject new_signet = event.right().getValue();
                        favoriteService.createSQL(new_signet, user.getUserId(), defaultResponseHandler(request));
                    });
                });
            } else {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }
        });
    }

    @Put("/signets/:id")
    @ApiDoc("Update a specific signet")
    @ResourceFilter(ShareAndOwner.class)
    @SecuredAction(value = Mediacentre.MANAGER_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void update(HttpServerRequest request) {
        String signetId = request.getParam("id");
        RequestUtils.bodyToJson(request, signet -> {
            signetService.update(signetId, signet, defaultResponseHandler(request));
        });
    }

    @Delete("/signets/:id")
    @ApiDoc("Delete a specific signet")
    @ResourceFilter(ShareAndOwner.class)
    @SecuredAction(value = Mediacentre.MANAGER_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void delete(HttpServerRequest request) {
        String signetId = request.getParam("id");
        signetService.delete(signetId, defaultResponseHandler(request));
    }

    @Delete("/signets/public/:id")
    @ApiDoc("Delete a specific signet")
    @ResourceFilter(ShareAndOwner.class)
    @SecuredAction(value = Mediacentre.MANAGER_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void deletePublic(HttpServerRequest request) {
        String signetId = request.getParam("id");
        signetService.deleteMyPublishedSignet(signetId, deleteEvt -> {
            if (deleteEvt.isLeft()) {
                String message = "[Médiacentre@deletePublic] Failed to delete publish signet with id " + signetId + " : " + deleteEvt.left().getValue();
                log.error(message);
                renderError(request, new JsonObject().put("message", message));
                return;
            }

            signetService.get(signetId, getEvt -> {
                if (getEvt.isLeft()) {
                    String message = "[Médiacentre@deletePublic] Failed to get signet with id " + signetId + " : " + getEvt.left().getValue();
                    log.error(message);
                    renderError(request, new JsonObject().put("message", message));
                    return;
                }

                if (getEvt.right().getValue().size() <= 0) {
                    log.info("[Médiacentre@deletePublic] The signet with id " + signetId + " has already been deleted");
                    noContent(request);
                    return;
                }

                signetService.setPublishValueSignet(signetId, false, defaultResponseHandler(request));
            });

        });
    }

    @Get("/signets/search")
    @ApiDoc("Search in the signets created by me or shared with me")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void searchSignet(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                String query = request.getParam("query");
                final List<String> groupsAndUserIds = new ArrayList<>();
                groupsAndUserIds.add(user.getUserId());
                if (user.getGroupsIds() != null) {
                    groupsAndUserIds.addAll(user.getGroupsIds());
                }
                signetService.search(groupsAndUserIds, user, query, arrayResponseHandler(request));
            } else {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }
        });
    }

    @Post("/signets/advanced")
    @ApiDoc("Advanced search in the signets created by me or shared with me")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void advancedSearchSignet(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                RequestUtils.bodyToJson(request, query -> {
                    final List<String> groupsAndUserIds = new ArrayList<>();
                    groupsAndUserIds.add(user.getUserId());
                    if (user.getGroupsIds() != null) {
                        groupsAndUserIds.addAll(user.getGroupsIds());
                    }
                    signetService.advancedSearch(groupsAndUserIds, user, query, arrayResponseHandler(request));
                });
            } else {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }
        });
    }

    @Get("/signets/search/public")
    @ApiDoc("Search in my published signets")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void searchSignetPublic(HttpServerRequest request) {
        String query = request.getParam("query");
        UserUtils.getUserInfos(eb, request, user -> {
            signetService.searchMyPublishedSignet(query, user.getLastName() + " " + user.getFirstName(), event -> {
                if(event.isRight()) {
                    renderJson(request, event.right().getValue());;
                } else {
                    log.error("Searching public signet not found");
                }
            });
        });
    }


    @Get("/signets/:signetId/rights")
    @ApiDoc("Get my rights for a specific signet")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getMySignetRights(HttpServerRequest request) {
        String signetId = request.getParam("signetId");
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                List<String> groupsAndUserIds = new ArrayList();
                groupsAndUserIds.add(user.getUserId());
                if (user.getGroupsIds() != null) {
                    groupsAndUserIds.addAll(user.getGroupsIds());
                }
                signetService.getMySignetRights(signetId, groupsAndUserIds, arrayResponseHandler(request));
            } else {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }
        });
    }

    @Get("/signets/rights/all")
    @ApiDoc("Get my rights for all the signets")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllMySignetRights(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                List<String> groupsAndUserIds = new ArrayList();
                groupsAndUserIds.add(user.getUserId());
                if (user.getGroupsIds() != null) {
                    groupsAndUserIds.addAll(user.getGroupsIds());
                }
                signetService.getAllMySignetRights(groupsAndUserIds, arrayResponseHandler(request));
            } else {
                log.error("User not found in session.");
                Renders.unauthorized(request);
            }
        });
    }



    // Share/Sending functions

    @Override
    @Get("/share/json/:id")
    @ApiDoc("List rights for a given signet")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareJson(final HttpServerRequest request) {
        super.shareJson(request, false);
    }

    @Put("/share/json/:id")
    @ApiDoc("Add rights for a given signet")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareSubmit(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                request.pause();
                final String signetId = request.params().get("id");
                signetService.get(signetId, getSignetHandler -> {
                    request.resume();
                    JsonObject params = new fr.wseduc.webutils.collections.JsonObject();
                    SignetController.super.shareJsonSubmit(request, null, false, params,
                            null);
                });
            }
            else {
                log.error("User not found in session.");
                unauthorized(request);
            }
        });
    }

    @Put("/share/resource/:id")
    @ApiDoc("Add rights for a given signet")
    @ResourceFilter(ShareAndOwner.class)
    @SecuredAction(value = Mediacentre.MANAGER_RESOURCE_RIGHT, type = ActionType.RESOURCE)
    public void shareResource(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "share", shareSignetObject -> {
            UserUtils.getUserInfos(eb, request, user -> {
                if (user != null) {
                    // Get all ids, filter the one about sending (response right)
                    final String signetId = request.params().get("id");
                    Map<String, Object> idUsers = shareSignetObject.getJsonObject("users").getMap();
                    Map<String, Object> idGroups = shareSignetObject.getJsonObject("groups").getMap();
                    Map<String, Object> idBookmarks = shareSignetObject.getJsonObject("bookmarks").getMap();

                    JsonArray usersIds = new JsonArray();
                    JsonArray groupsIds = new JsonArray();
                    JsonArray bookmarksIds = new JsonArray();

                    // Get group ids and users ids from bookmarks and add them to previous lists
                    userService.getIdsFromBookMarks(bookmarksIds, eventBookmarks -> {
                        if (eventBookmarks.isRight()) {
                            JsonArray ids = eventBookmarks.right().getValue().getJsonObject(0)
                                    .getJsonArray("ids").getJsonObject(0).getJsonArray("ids");
                            for (int i = 0; i < ids.size(); i++) {
                                JsonObject id = ids.getJsonObject(i);
                                boolean isGroup = id.getString("name") != null;
                                (isGroup ? groupsIds : usersIds).add(id.getString("id"));
                            }
                        } else {
                            log.error("[Mediacentre@getUserIds] Fail to get ids from bookmarks' ids");
                        }
                    });

                    // Update 'collab' property as needed
                    List<Map<String, Object>> idsObjects = new ArrayList<>();
                    idsObjects.add(idUsers);
                    idsObjects.add(idGroups);
                    idsObjects.add(idBookmarks);
                    updateSignetCollabProp(signetId, user, idsObjects);
                    // Fix bug auto-unsharing
                    signetShareService.getSharedWithMe(signetId, user, event -> {
                        if (event.isRight() && event.right().getValue() != null) {
                            JsonArray rights = event.right().getValue();
                            String id = user.getUserId();
                            shareSignetObject.getJsonObject("users").put(id, new JsonArray());
                            JsonArray allUsersIds = new JsonArray();
                            for (int i = 0; i < rights.size(); i++) {
                                JsonObject right = rights.getJsonObject(i);
                                shareSignetObject.getJsonObject("users").getJsonArray(id).add(right.getString("action"));
                            }
                            //List user to create signet favorite
                            Object[] listUser = shareSignetObject.getJsonObject("users").fieldNames().toArray();
                            for(int j = 0; j < listUser.length -1; j++ ) {
                                usersIds.add(String.valueOf(listUser[j]));
                                favoriteService.updateSQL(Integer.parseInt(signetId), String.valueOf(listUser[j]),
                                        false, true, defaultResponseHandler(request));
                            }
                            allUsersIds = allUsersIds.addAll(usersIds).add(String.valueOf(listUser[listUser.length - 1]));
                            //List group to create signet favorite
                            Object[] listGroup = shareSignetObject.getJsonObject("groups").fieldNames().toArray();
                            for (Object o : listGroup) {
                                groupsIds.add(String.valueOf(o));
                            }
                            JsonArray finalAllUsersIds = allUsersIds;
                            userService.getUsersInfosFromIds(groupsIds, event_user -> {
                                if(!event_user.right().getValue().isEmpty()) {
                                    JsonArray users_group = event_user.right().getValue().getJsonObject(0)
                                            .getJsonArray("users");
                                    for(int l = 0; l< users_group.size(); l++) {
                                        favoriteService.updateSQL(Integer.parseInt(signetId),
                                                String.valueOf(users_group.getJsonObject(l).getString("id")),
                                                false, true, defaultResponseHandler(request));
                                    }
                                }
                                this.getShareService().share(user.getUserId(), signetId, shareSignetObject, (r) -> {
                                    if (r.isRight()) {
                                        syncFavorites(signetId, groupsIds.addAll(finalAllUsersIds));
                                        this.doShareSucceed(request, signetId, user, shareSignetObject, r.right().getValue(),
                                                false);
                                    } else {
                                        JsonObject error = (new JsonObject()).put("error", r.left().getValue());
                                        Renders.renderJson(request, error, 400);
                                    }
                                });                            });

                            // Classic sharing stuff (putting or removing ids from signet_shares table accordingly)
                        }
                        else {
                            log.error("[Mediacentre@getSharedWithMe] Fail to get user's shared rights");
                        }
                    });
                } else {
                    log.error("User not found in session.");
                    unauthorized(request);
                }
            });
        });
    }

    private void updateSignetCollabProp(String signetId, UserInfos user, List<Map<String, Object>> idsObjects) {
        signetService.get(signetId, getEvent -> {
            if (getEvent.isRight()) {
                JsonObject signet = getEvent.right().getValue();
                boolean isShared = false;
                int i = 0;
                while (!isShared && i < idsObjects.size()) { // Iterate over "users", "groups", "bookmarks"
                    int j = 0;
                    Map<String, Object> o = idsObjects.get(i);
                    List<Object> values = new ArrayList<Object>(o.values());
                    while (!isShared && j < values.size()) { // Iterate over each pair id-actions
                        List<String> actions = (ArrayList)(values.get(j));

                        int k = 0;
                        while (!isShared && k < actions.size()) { // Iterate over each action for an id
                            if (actions.get(k).equals(Mediacentre.VIEW_RESOURCE_BEHAVIOUR) ||
                                    actions.get(k).equals(Mediacentre.MANAGER_RESOURCE_BEHAVIOUR)) {
                                isShared = true;
                            }
                            k++;
                        }
                        j++;
                    }
                    i++;
                }

                if (!isShared && !signet.getString("owner_id").equals(user.getUserId())) {
                    isShared = true;
                }

                signet.put("collab", isShared);
                signetService.updateCollab(signetId, signet, updateEvent -> {
                    if (updateEvent.isLeft()) {
                        log.error("[Mediacentre@updateSignetCollabProp] Fail to update signet : " + updateEvent.left().getValue());
                    }
                });
            } else {
                log.error("[Mediacentre@updateSignetCollabProp] Fail to get signet : " + getEvent.left().getValue());
            }
        });
    }

    private void syncFavorites(String formId, JsonArray responders) {
        removeDeletedFavorites(formId, responders, removeEvt -> {
            if (removeEvt.failed()) log.error(removeEvt.cause());
        });
    }

    private void removeDeletedFavorites(String signetId, JsonArray responders, Handler<AsyncResult<String>> handler) {
        favoriteService.getDesactivated(signetId, responders, filteringEvent -> {
            if (filteringEvent.isRight()) {
                JsonArray deactivated = filteringEvent.right().getValue();
                if (!deactivated.isEmpty()) {
                    List<Future> futures = new ArrayList<>();
                    for(int i = 0; i < deactivated.size(); i++) {
                        Future<JsonObject> removeFavoriteFuture = Future.future();
                        Future<JsonObject> removeFavoriteSQLFuture = Future.future();
                        futures.add(removeFavoriteFuture);
                        futures.add(removeFavoriteSQLFuture);
                        favoriteService.delete(signetId,"fr.openent.mediacentre.source.Signet" ,
                                deactivated.getJsonObject(i).getString("user_id"),
                                handlerJsonObject(removeFavoriteFuture));
                        favoriteService.updateSQL(Integer.parseInt(signetId), deactivated.getJsonObject(i).getString("user_id"),
                                false, false, handlerJsonObject(removeFavoriteSQLFuture));
                    }
                    CompositeFuture.all(futures).setHandler(event -> {
                                if (event.succeeded()) {
                                    log.info("ok");
                                }
                            });
                }
                handler.handle(Future.succeededFuture());
            } else {
                handler.handle(Future.failedFuture(filteringEvent.left().getValue()));
                log.error("[Mediacentre@removeDeletedSignets] Fail to filter signets to remove");
            }
        });
    }

}