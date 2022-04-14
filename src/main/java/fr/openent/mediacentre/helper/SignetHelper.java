package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.service.SignetService;
import fr.openent.mediacentre.service.impl.DefaultSignetService;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;

public class SignetHelper {

    private final Logger log = LoggerFactory.getLogger(SignetHelper.class);
    private final SignetService signetService;

    public SignetHelper() {
        signetService = new DefaultSignetService();
    }

    public void signetRetrieve(UserInfos user, String state, ResponseHandlerHelper answer) {
        signetService.getPublicSignet(user.getLastName() + " " + user.getFirstName(),
                event -> {
                    if (event.isLeft()) {
                        log.error(  "[SignetHelper@signetRetrieve] Failed to retrieve source resources.",
                                            event.left().getValue()
                        );
                        answer.answerFailure(new JsonObject()
                                .put("error", event.left().getValue().toString())
                                .put("status", "ko")
                                .encode());
                    } else {
                        answer.answerSuccess(
                                HelperUtils.frameLoad("signets_Result",
                                        state,
                                        "ok",
                                        new JsonObject().put("signets", event.right().getValue())).encode()
                        );
                    }
                }
        );
    }
}
