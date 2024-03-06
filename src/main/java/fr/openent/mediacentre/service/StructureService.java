package fr.openent.mediacentre.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;

import java.util.Date;

public interface StructureService {
    Future<JsonArray> getGarAffectedStructures();
}
