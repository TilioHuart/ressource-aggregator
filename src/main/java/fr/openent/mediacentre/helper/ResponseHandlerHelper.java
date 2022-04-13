package fr.openent.mediacentre.helper;

import fr.openent.mediacentre.source.Source;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface ResponseHandlerHelper {
    void answerSuccess(String answer);
    void storeMultiple(JsonObject answer, List<Source> sources);
    void answerMultiple();
    void answerFailure (String answer);
}
