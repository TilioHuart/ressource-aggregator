package fr.openent.mediacentre.helper;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;

public class FavoriteHelper {

    /* Assign favorite to true if resources match with mongoDb's resources
     * @param favoritesResourcesFuture  favorite's resource fetched from mongoDb
     * @param resourcesArray            resource requested to assign favorite
     */
    public void matchFavorite(Future<JsonArray> favoritesResourcesFuture, JsonArray resourcesArray) {
        for (int i = 0; i < resourcesArray.size(); i++) {
            for (int j = 0; j < favoritesResourcesFuture.result().size(); j++) {
                if (resourcesArray.getJsonObject(i).getString("id")
                        .equals(favoritesResourcesFuture.result().getJsonObject(j).getString("id"))) {
                    resourcesArray.getJsonObject(i).put("favorite", true);
                }
            }
        }
    }
}
