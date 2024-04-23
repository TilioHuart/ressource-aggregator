package fr.openent.mediacentre.helper;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public class HelperUtils {
    public static JsonObject frameLoad (String event, String state, String status, JsonArray jsonData) {
        return frameLoad(event, state, status).put("data", jsonData);
    }
    public static JsonObject frameLoad (String event, String state, String status, String stringData) {
        return frameLoad(event, state, status).put("data", stringData);
    }
    public static JsonObject frameLoad (String event, String state, String status, JsonObject jsonData) {
        return frameLoad(event, state, status).put("data", jsonData);
    }

    public static JsonObject frameLoad (String event, String state, String status) {
        return new JsonObject() .put("event", event)
                                .put("state", state)
                                .put("status", status);

    }

}
