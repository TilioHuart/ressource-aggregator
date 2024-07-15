package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.service.FavoriteService;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;

import static fr.openent.mediacentre.helper.HelperUtils.frameLoad;

public class FavoriteHelper {

    private final Logger log = LoggerFactory.getLogger(FavoriteHelper.class);


    /* Assign favorite to true if resources match with mongoDb's resources
     * @param favoritesResourcesFuture  favorite's resource fetched from mongoDb
     * @param resourcesArray            resource requested to assign favorite
     */
    public void matchFavorite(Future<JsonArray> favoritesResourcesFuture, JsonArray resourcesArray) {
        for (int i = 0; i < resourcesArray.size(); i++) {
            for (int j = 0; j < favoritesResourcesFuture.result().size(); j++) {
                System.out.println(resourcesArray.getJsonObject(i).getString("id"));
                System.out.println(favoritesResourcesFuture.result().getJsonObject(j).getString("id"));
                if (resourcesArray.getJsonObject(i).getString("id")
                        .equals(favoritesResourcesFuture.result().getJsonObject(j).getString("id"))) {
                    resourcesArray.getJsonObject(i).put("favorite", true);
                }
            }
        }
    }

    public void favoritesRetrieve(              UserInfos user,
                                                FavoriteService favoriteService,
                                                ResponseHandlerHelper answer) {
        favoriteService.get(null, user.getUserId(), event -> {
            if (event.isLeft()) {
                log.error("[favorite@get] Failed to retrieve favorite", event.left());
                answer.answerFailure(new JsonObject()
                        .put("error", event.left().getValue())
                        .put("status", "ko")
                        .encode());
                return;
            }
            JsonArray favorites = event.right().getValue();
            if (favorites.isEmpty()) {
                answer.answerSuccess(
                        frameLoad(
                                "favorites_Result",
                                "initialization",
                                "ok",
                                new JsonObject()).encode()
                );
            } else {
                answer.answerSuccess(
                        frameLoad(
                                "favorites_Result",
                                "get",
                                "ok",
                                favorites).encode());
            }
        });
    }

}
