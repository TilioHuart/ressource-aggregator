package fr.openent.mediacentre.controller;

import fr.openent.mediacentre.source.Source;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.ServerWebSocket;

import java.util.List;

public class WebSocketController implements Handler<ServerWebSocket> {

    private final EventBus eb;
    private final List<Source> sources;

    public WebSocketController(EventBus eb, List<Source> sources) {
        this.eb = eb;
        this.sources = sources;
    }

    @Override
    public void handle(ServerWebSocket ws) {

    }
}
