package fr.openent.mediacentre.service.impl;


import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.service.moduleSQLRequestService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.SqlResult;

public class DefaultModuleSQLRequestService extends SqlCrudService implements moduleSQLRequestService {

    public DefaultModuleSQLRequestService(String schema, String table) {
        super(schema, table);
    }

    @Override
    public void getLevels(Handler<Either<String, JsonArray>> handler) {
        String query = "Select * From " + Mediacentre.mediacentreSchema + ".levels;";
        sql.prepared(query, new JsonArray(), SqlResult.validResultHandler(handler));
    }

    @Override
    public void getDisciplines(Handler<Either<String, JsonArray>> handler) {
        String query = "Select * From " + Mediacentre.mediacentreSchema + ".disciplines;";
        sql.prepared(query, new JsonArray(), SqlResult.validResultHandler(handler));
    }
}
