package fr.openent.mediacentre.cron;

import fr.openent.mediacentre.service.NotifyService;
import fr.openent.mediacentre.service.impl.DefaultNotifyService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.notification.TimelineHelper;

public class NotifyCron extends ControllerHelper implements Handler<Long> {
    private static final Logger log = LoggerFactory.getLogger(NotifyCron.class);
    private final NotifyService notifyService;

    public NotifyCron(TimelineHelper timelineHelper) {
        this.notifyService = new DefaultNotifyService(timelineHelper);
    }

    @Override
    public void handle(Long event) {
        log.info("[Mediacentre@NotifyCron::handle] Mediacentre Notify cron started");
        launchNotifications(notificationsEvt -> {
            if (notificationsEvt.isLeft()) {
                log.error("[Mediacentre@NotifyCron::handle] Notify cron failed");
            }
            else {
                log.info("[Mediacentre@NotifyCron::handle] Notify cron launch successful");
            }
        });
    }

    public void launchNotifications(Handler<Either<String, JsonObject>> handler) {
        JsonObject composeInfos = new JsonObject();

        // TODO (example of Formulaire below)
//        formService.listSentFormsOpeningToday()
//            .compose(forms -> {
//                composeInfos.put(FORMS, forms);
//                JsonArray formIds = UtilsHelper.getIds(forms);
//                return distributionService.listByForms(formIds);
//            })
//            .onSuccess(distributions -> {
//                handler.handle(new Either.Right<>(new JsonObject()));
//            })
//            .onFailure(err -> {
//                log.error("[Mediacentre@NotifyCron::launchNotifications] Failed to send notifications to users with new resources.");
//                handler.handle(new Either.Left<>(err.getMessage()));
//            });
    }
}
