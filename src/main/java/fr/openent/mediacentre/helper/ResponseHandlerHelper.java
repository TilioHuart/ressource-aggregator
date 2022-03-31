package fr.openent.mediacentre.helper;

import io.vertx.core.json.JsonObject;

public interface ResponseHandlerHelper {
    void answerSuccess(String answer);
    void storeMultiple(JsonObject answer);
    void answerMultiple();
    void answerFailure (String answer);
}
