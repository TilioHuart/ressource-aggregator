package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.source.Source;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface ResponseHandlerHelper {
    void answerSuccess(String answer);
    void storeMultiple(JsonObject answer, int nbSource);
    void answerMultiple();
    void answerFailure (String answer);
}
