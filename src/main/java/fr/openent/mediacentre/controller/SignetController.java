package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.security.CreationRight;
import fr.openent.mediacentre.security.ShareAndOwner;
import fr.openent.mediacentre.security.ViewRight;
import fr.openent.mediacentre.service.FavoriteService;
import fr.openent.mediacentre.service.NeoService;
import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.service.SignetSharesService;
import fr.openent.mediacentre.service.impl.DefaultFavoriteService;
import fr.openent.mediacentre.service.impl.DefaultNeoService;
import fr.openent.mediacentre.service.impl.DefaultSignetService;
import fr.openent.mediacentre.service.impl.DefaultSignetSharesService;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
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
    private final NeoService neoService;
    private FavoriteService favoriteService;

    public SignetController(EventBus eb) {
        super();
        this.eb = eb;
        this.signetService = new DefaultSignetService();
        this.signetShareService = new DefaultSignetSharesService();
        this.neoService = new DefaultNeoService();
        this.favoriteService = new DefaultFavoriteService();
    }

    // API

    @Get("/signets")
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
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void get(HttpServerRequest request) {
        String signetId = request.getParam("id");
        signetService.get(signetId, defaultResponseHandler(request));
    }

    @Post("/signets")
    @ApiDoc("Create a signet")
    @ResourceFilter(CreationRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
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

    @Get("/signets/:signetId/rights")
    @ApiDoc("Get my rights for a specific signet")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getMyFormRights(HttpServerRequest request) {
        String signetId = request.getParam("signetId");
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                List<String> groupsAndUserIds = new ArrayList();
                groupsAndUserIds.add(user.getUserId());
                if (user.getGroupsIds() != null) {
                    groupsAndUserIds.addAll(user.getGroupsIds());
                }
                signetService.getMyFormRights(signetId, groupsAndUserIds, arrayResponseHandler(request));
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
    public void getAllMyFormRights(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                List<String> groupsAndUserIds = new ArrayList();
                groupsAndUserIds.add(user.getUserId());
                if (user.getGroupsIds() != null) {
                    groupsAndUserIds.addAll(user.getGroupsIds());
                }
                signetService.getAllMyFormRights(groupsAndUserIds, arrayResponseHandler(request));
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
                signetService.get(signetId, getFormHandler -> {
                    request.resume();
                    final String signetName = getFormHandler.right().getValue().getString("title");
                    JsonObject params = new fr.wseduc.webutils.collections.JsonObject();
                    SignetController.super.shareJsonSubmit(request, null, false, params, null);
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
        RequestUtils.bodyToJson(request, pathPrefix + "share", shareFormObject -> {
            UserUtils.getUserInfos(eb, request, user -> {
                if (user != null) {
                    // Get all ids, filter the one about sending (response right)
                    final String signetId = request.params().get("id");
                    Map<String, Object> idUsers = shareFormObject.getJsonObject("users").getMap();
                    Map<String, Object> idGroups = shareFormObject.getJsonObject("groups").getMap();
                    Map<String, Object> idBookmarks = shareFormObject.getJsonObject("bookmarks").getMap();

                    JsonArray usersIds = new JsonArray();
                    JsonArray groupsIds = new JsonArray();
                    JsonArray bookmarksIds = new JsonArray();

                    // Get group ids and users ids from bookmarks and add them to previous lists
                    neoService.getIdsFromBookMarks(bookmarksIds, eventBookmarks -> {
                        if (eventBookmarks.isRight()) {
                            JsonArray ids = eventBookmarks.right().getValue().getJsonObject(0).getJsonArray("ids").getJsonObject(0).getJsonArray("ids");
                            for (int i = 0; i < ids.size(); i++) {
                                JsonObject id = ids.getJsonObject(i);
                                boolean isGroup = id.getString("name") != null;
                                (isGroup ? groupsIds : usersIds).add(id.getString("id"));
                            }
                        } else {
                            log.error("[Formulaire@getUserIds] Fail to get ids from bookmarks' ids");
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
                            shareFormObject.getJsonObject("users").put(id, new JsonArray());

                            for (int i = 0; i < rights.size(); i++) {
                                JsonObject right = rights.getJsonObject(i);
                                shareFormObject.getJsonObject("users").getJsonArray(id).add(right.getString("action"));
                            }
                            //List user to create signet favorite
                            Object[] listUser = shareFormObject.getJsonObject("users").fieldNames().toArray();
                            for(int j = 0; j < listUser.length -1; j++ ) {
                                favoriteService.updateSQL(Integer.parseInt(signetId), String.valueOf(listUser[j]), false, defaultResponseHandler(request));
                            }
                            //List group to create signet favorite
                            Object[] listGroup = shareFormObject.getJsonObject("groups").fieldNames().toArray();
                            for(int k = 0; k < listGroup.length; k++ ) {
                                groupsIds.add(String.valueOf(listGroup[k]));
                            }
                            neoService.getUsersInfosFromIds(groupsIds, event_user -> {
                                if(!event_user.right().getValue().isEmpty()) {
                                    JsonArray users_group = event_user.right().getValue().getJsonObject(0).getJsonArray("users");
                                    for(int l = 0; l< users_group.size(); l++) {
                                        favoriteService.updateSQL(Integer.parseInt(signetId), String.valueOf(users_group.getJsonObject(l).getString("id")),
                                                false, defaultResponseHandler(request));
                                    }
                                }
                                this.getShareService().share(user.getUserId(), signetId, shareFormObject, (r) -> {
                                    if (r.isRight()) {
                                        this.doShareSucceed(request, signetId, user, shareFormObject, (JsonObject)r.right().getValue(), false);
                                    } else {
                                        JsonObject error = (new JsonObject()).put("error", (String)r.left().getValue());
                                        Renders.renderJson(request, error, 400);
                                    }
                                });                            });

                            // Classic sharing stuff (putting or removing ids from signet_shares table accordingly)
                        }
                        else {
                            log.error("[Formulaire@getSharedWithMe] Fail to get user's shared rights");
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
                        log.error("[Formulaire@updateFormCollabProp] Fail to update signet : " + updateEvent.left().getValue());
                    }
                });
            } else {
                log.error("[Formulaire@updateFormCollabProp] Fail to get signet : " + getEvent.left().getValue());
            }
        });
    }

}