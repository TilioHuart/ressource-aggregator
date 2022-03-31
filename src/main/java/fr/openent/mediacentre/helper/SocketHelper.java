package fr.openent.mediacentre.helper;

import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.JsonObject;

public class SocketHelper implements ResponseHandlerHelper{
    private final ServerWebSocket ws;
    public SocketHelper(ServerWebSocket ws) {
        this.ws = ws;
    }

    @Override
    public void answerSuccess(String answer) {
        ws.writeTextMessage(answer);
    }

    @Override
    public void storeMultiple(JsonObject answer) {
        answerSuccess(answer.encode());
    }

    @Override
    public void answerMultiple() {

    }

    @Override
    public void answerFailure(String answer) {
        ws.writeTextMessage(answer);
    }
}
