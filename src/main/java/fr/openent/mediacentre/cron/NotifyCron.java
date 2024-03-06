package fr.openent.mediacentre.cron;

import fr.openent.mediacentre.helper.FutureHelper;
import fr.openent.mediacentre.service.NotifyService;
import fr.openent.mediacentre.service.StructureService;
import fr.openent.mediacentre.service.UserService;
import fr.openent.mediacentre.service.impl.DefaultNotifyService;
import fr.openent.mediacentre.service.impl.DefaultStructureService;
import fr.openent.mediacentre.service.impl.DefaultUserService;
import fr.openent.mediacentre.source.GAR;
import fr.openent.mediacentre.source.Source;
import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.stream.Collectors;

import static fr.openent.mediacentre.core.constants.Field.*;

public class NotifyCron extends ControllerHelper implements Handler<Long> {
    private static final Logger log = LoggerFactory.getLogger(NotifyCron.class);
    private final List<Source> sources;
    private final Integer lastConnectionDelay;
    private final NotifyService notifyService;
    private final StructureService structureService;
    private final UserService userService;

    public NotifyCron(List<Source> sources, TimelineHelper timelineHelper, Integer lastConnectionDelay) {
        this.sources = sources;
        this.lastConnectionDelay = lastConnectionDelay;
        this.notifyService = new DefaultNotifyService(timelineHelper);
        this.structureService = new DefaultStructureService();
        this.userService = new DefaultUserService();
    }

    @Override
    public void handle(Long event) {
        log.info("[Mediacentre@NotifyCron::handle] Mediacentre Notify cron started");
        launchNotifications()
            .onSuccess(userIds -> log.info("[Mediacentre@NotifyCron::handle] Notify cron launch successful"))
            .onFailure(err -> log.error("[Mediacentre@NotifyCron::handle] Notify cron failed : " + err.getMessage()));
    }

    public Future<Void> launchNotifications() {
        Promise<Void> promise = Promise.promise();

        GAR garSource = this.sources.stream()
                .filter(GAR.class::isInstance)
                .map(GAR.class::cast)
                .findFirst()
                .orElse(null);

        if (garSource == null) {
            String errMessage = "Failed to get GAR source class";
            log.error("[Mediacentre@NotifyCron::launchNotifications] " + errMessage);
            promise.fail(errMessage);
            return promise.future();
        }

        Map<String, List<String>> mapUserResourceIds = new HashMap<>();
        List<UserInfos> users = new ArrayList<>();

        filterUsers()
            .compose(usersInfos -> {
                users.addAll(usersInfos);
                return userService.getUsersResourceInfos(users.stream().map(UserInfos::getUserId).collect(Collectors.toList()));
            })
            .onSuccess(usersResourceInfos -> {
                usersResourceInfos.stream()
                    .filter(JsonObject.class::isInstance)
                    .map(JsonObject.class::cast)
                    .filter(userResourceInfos -> userResourceInfos.getString(USER_ID) != null && !userResourceInfos.getString(USER_ID).isEmpty())
                    .forEach(userResourceInfos -> {
                        List<String> resourceIds = userResourceInfos.getJsonArray(RESOURCES_IDS).stream()
                                .filter(String.class::isInstance)
                                .map(String.class::cast)
                                .collect(Collectors.toList());
                        mapUserResourceIds.put(userResourceInfos.getString(USER_ID), resourceIds);
                    });

                // TODO foreach user of usersInfos :
                //      List<JsonObject> garResources = garSource.getAllUserResources(user);
                //      List<String> garResourcesIds = garResources.stream()
                //          .map(garResource -> garResource.getString(ID))
                //          .collect(Collectors.toList());
                //      garResourcesIds.removeAll(mapUserResourceIds.get(user));
                //      List<JsonObject> newResources = garResources.stream()
                //          .filter(garResource -> garResourcesIds.contains(garResource.getString(ID)))
                //          .collect(Collectors.toList());
                //      notifyService.notifyNewResourceFromCRON(user.getUserId(), newResources);

                promise.complete();
            })
            .onFailure(err -> {
                String errMessage = "[Mediacentre@NotifyCron::launchNotifications] Failed to send notifications to users with new resources";
                log.error(errMessage + " : " + err);
                promise.fail(err.getMessage());
            });

        return promise.future();
    }

    private Future<List<UserInfos>> filterUsers() {
        Promise<List<UserInfos>> promise = Promise.promise();
        Date dateLimit = new Date(System.currentTimeMillis() - lastConnectionDelay * 60 * 60 * 1000);
        JsonObject composeInfos = new JsonObject();

        structureService.getGarAffectedStructures()
            .compose(structures -> {
                composeInfos.put(STRUCTURES, structures);
                return userService.getUsersRecentlyConnected(dateLimit);
            })
            .compose(this::getUsersInfos)
            .onSuccess(usersInfos -> {
                List<String> structures = composeInfos.getJsonArray(STRUCTURES).stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .collect(Collectors.toList());

                // Keep users not "Parent" and part of structure with GAR
                usersInfos = usersInfos.stream()
                    .filter(userInfo -> !userInfo.getType().equals(PARENT) && Collections.disjoint(userInfo.getStructures(), structures))
                    .collect(Collectors.toList());

                promise.complete(usersInfos);
            })
            .onFailure(err -> {
                log.error("[Mediacentre@NotifyCron::filterUsers] Failed to filter users before sending notifications.");
                promise.fail(err.getMessage());
            });

        return promise.future();
    }

    private Future<List<UserInfos>> getUsersInfos(JsonArray userIds) {
        Promise<List<UserInfos>> promise = Promise.promise();

        List<Future<UserInfos>> futures = new ArrayList<>();
        userIds.stream()
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .forEach(userId -> {
                Future<UserInfos> future = Future.future();
                futures.add(future);
                UserUtils.getUserInfos(eb, userId, userInfos -> future.complete());
            });

        FutureHelper.join(futures)
            .onSuccess(result -> {
                List<UserInfos> usersInfos = new ArrayList<>();
                for (Future future : futures) {
                    if (future.succeeded()) {
                        usersInfos.add((UserInfos) future.result());
                    }
                }
                promise.complete(usersInfos);
            })
            .onFailure(err -> {
                log.error("[Mediacentre@NotifyCron::getUsersInfos] Failed to get users infos before sending notifications.");
                promise.fail(err.getMessage());
            });

        return promise.future();
    }
}
