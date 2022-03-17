package fr.openent.mediacentre.helper;

import io.vertx.core.http.ServerWebSocket;

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
    public void answerFailure(String answer) {
        answerSuccess(answer);
    }
}
