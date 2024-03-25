package fr.openent.mediacentre.service;

import fr.openent.mediacentre.enums.Profile;
import fr.openent.mediacentre.model.GlobalResource;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Optional;

public interface GlobalResourceService {
    /**
     * create global ressource
     * @param user         User session token
     * @param resource    Ressource to create
     */
    public Future<JsonObject> createGlobalResource(UserInfos user, JsonObject resource);

    /**
     * list all globals channels
     * @return Future of all globals ressources
     * @param profile   list all global ressources who match with this profile
     */
    public Future<List<GlobalResource>> list(Profile profile);

    /**
     * delete a global ressource
     * @param idChannel   global ressource id
     */
    public Future<JsonObject> deleteGlobalChannel(String idChannel);

    /**
     * update a global ressource
     * @param id   global ressource id
     * @param resource    Ressource to update
     */
    public Future<Optional<GlobalResource>> updateGlobalChannel(String id, JsonObject resource);
}
