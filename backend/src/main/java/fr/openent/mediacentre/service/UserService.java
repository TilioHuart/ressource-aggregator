package fr.openent.mediacentre.service;

import io.vertx.core.Future;

import java.util.List;

public interface UserService {

    /**
     * get list of structures and substructures Ids from current structure
     *
     * @param idStructure structure id
     * @return return future containing list of structures and substructures Ids
     */
    Future<List<String>> getSubstructureIds(String idStructure);
}
