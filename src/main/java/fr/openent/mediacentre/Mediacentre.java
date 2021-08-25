package fr.openent.mediacentre;

import fr.openent.mediacentre.controller.*;
import fr.openent.mediacentre.source.Source;
import fr.openent.mediacentre.tasks.AmassTask;
import fr.wseduc.cron.CronTrigger;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.BaseServer;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

public class Mediacentre extends BaseServer {

    public static int wsPort;
    public static final String VIEW_RIGHT = "mediacentre.view";
    public static String mediacentreSchema;
    public static String SIGNET_SHARES_TABLE;
    public static String SIGNET_TABLE;

    public static final String CONTRIB_RESOURCE_RIGHT = "mediacentre.contrib";
    public static final String MANAGER_RESOURCE_RIGHT = "mediacentre.manager";
    public static final String RESPONDER_RESOURCE_RIGHT = "mediacentre.comment";

    public static final String CONTRIB_RESOURCE_BEHAVIOUR = "fr-openent-mediacentre-controllers-SignetController|initContribResourceRight";
    public static final String MANAGER_RESOURCE_BEHAVIOUR = "fr-openent-mediacentre-controllers-SignetController|initManagerResourceRight";
    public static final String RESPONDER_RESOURCE_BEHAVIOUR = "fr-openent-mediacentre-controllers-SignetController|initResponderResourceRight";

    @Override
	public void start() throws Exception {
		super.start();

        EventBus eb = getEventBus(vertx);
        wsPort = config.getInteger("wsPort", 3000);
        mediacentreSchema = config.getString("db-schema");
        SIGNET_SHARES_TABLE = mediacentreSchema + ".signet_shares";
        SIGNET_TABLE = mediacentreSchema + ".signet";

        /* Add All sources based on module configuration */
        List<Source> sources = new ArrayList<>();
        JsonObject configSources = config.getJsonObject("sources");
        List<String> sourceNames = new ArrayList<>(configSources.fieldNames());
        for (String sourceName : sourceNames) {
            if (configSources.getBoolean(sourceName)) {
                Source source = (Source) Class.forName(sourceName).newInstance();
                source.setEventBus(eb);
                source.setConfig(config);
                sources.add(source);
            }
        }

        addController(new MediacentreController(sources, config));
        addController(new FavoriteController(eb));
        addController(new PublishedController(eb));
        addController(new SignetController(eb));
        HttpServerOptions options = new HttpServerOptions().setMaxWebsocketFrameSize(1024 * 1024);
        HttpServer server = vertx.createHttpServer(options).websocketHandler(new WebSocketController(eb, sources)).listen(wsPort);
        log.info("Websocket server listening on port " + server.actualPort());

        try {
            AmassTask amassTask = new AmassTask(sources);
            new CronTrigger(vertx, config.getString("amass-cron", "0 1 * * * ? *")).schedule(amassTask);
        } catch (ParseException e) {
            log.fatal("Unable to parse amass cron expression");
            throw e;
        }
    }

}
