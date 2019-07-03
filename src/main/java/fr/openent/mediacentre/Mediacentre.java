package fr.openent.mediacentre;

import fr.openent.mediacentre.controller.MediacentreController;
import fr.openent.mediacentre.controller.WebSocketController;
import fr.openent.mediacentre.source.Source;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.BaseServer;

import java.util.ArrayList;
import java.util.List;

public class Mediacentre extends BaseServer {

    public static int wsPort;

    @Override
	public void start() throws Exception {
		super.start();

        EventBus eb = getEventBus(vertx);
        wsPort = config.getInteger("wsPort", 3000);

        /* Add All sources based on module configuration */
        List<Source> sources = new ArrayList<>();
        JsonObject configSources = config.getJsonObject("sources");
        List<String> sourceNames = new ArrayList<>(configSources.fieldNames());
        for (String sourceName : sourceNames) {
            if (configSources.getBoolean(sourceName)) {
                Source source = (Source) Class.forName(sourceName).newInstance();
                source.setEventBus(eb);
                sources.add(source);
            }
        }

        addController(new MediacentreController(sources));

        HttpServerOptions options = new HttpServerOptions().setMaxWebsocketFrameSize(1024 * 1024);
        HttpServer server = vertx.createHttpServer(options).websocketHandler(new WebSocketController(eb, sources)).listen(wsPort);
        log.info("Websocket server listening on port " + server.actualPort());
    }

}
