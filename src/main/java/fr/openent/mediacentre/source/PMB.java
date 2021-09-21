package fr.openent.mediacentre.source;

import fr.openent.mediacentre.helper.ElasticSearchHelper;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.elasticsearch.BulkRequest;
import org.entcore.common.elasticsearch.ElasticSearch;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.stream.Collectors;

public class PMB implements Source {
    private EventBus eb;
    private final Logger log = LoggerFactory.getLogger(PMB.class);

    @Override
    public void plainTextSearch(String query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.plainTextSearch(PMB.class, query, user.getUserId(), user.getStructures(), false, ElasticSearchHelper.searchHandler(PMB.class, null, handler));
    }

    @Override
    public void advancedSearch(JsonObject query, UserInfos user, Handler<Either<JsonObject, JsonObject>> handler) {
        ElasticSearchHelper.advancedSearch(PMB.class, query, user.getUserId(), user.getStructures(), ElasticSearchHelper.searchHandler(PMB.class, null, handler));
    }

    @Override
    public JsonObject format(JsonObject resource) {
        return new JsonObject()
                .put("title", resource.getString("title"))
                .put("authors", resource.getJsonArray("authors"))
                .put("editors", resource.getJsonArray("editors"))
                .put("image", resource.getString("image"))
                .put("disciplines", new JsonArray())
                .put("levels", new JsonArray())
                .put("document_types", resource.getJsonArray("document_types"))
                .put("link", resource.getString("link"))
                .put("source", PMB.class.getName())
                .put("id", resource.getString("id"))
                .put("date", System.currentTimeMillis())
                .put("plain_text", this.generatePlainText(resource).toLowerCase())
                .put("description", resource.getString("description"))
                .put("structure", resource.getString("structure"));
    }

    private String generatePlainText(JsonObject resource) {
        String FORMAT = ";%s";
        final StringBuilder plainText = new StringBuilder();
        resource.getJsonArray("authors").forEach(author -> plainText.append(String.format(FORMAT, author)));
        plainText.append(String.format(FORMAT, resource.getString("description")));
        resource.getJsonArray("document_types").forEach(type -> plainText.append(String.format(FORMAT, type)));
        resource.getJsonArray("editors").forEach(editor -> plainText.append(String.format(FORMAT, editor)));
        plainText.append(String.format(FORMAT, resource.getString("isbn")));
        resource.getJsonArray("metadata").forEach(data -> plainText.append(String.format(FORMAT, data)));
        plainText.append(String.format(FORMAT, resource.getString("title")));

        return plainText.toString();
    }

    @Override
    public void amass() {
        eb.send("fr.openent.pmb.controllers.PmbController|amass", null);
    }

    @Override
    public void setEventBus(EventBus eb) {
        this.eb = eb;
        eb.consumer(String.format("%s|records", PMB.class.getName()), this::processRecords);
    }

    private void processRecords(Message<JsonArray> message) {
        log.info(String.format("PMB sends %s records", message.body().size()));
        List<JsonObject> records = message.body().getList();
        List<JsonObject> bibliographicRecords = records.stream().map(this::format).collect(Collectors.toList());
        BulkRequest bulkRequest = ElasticSearch.getInstance().bulk(RESOURCE_TYPE_NAME, ar -> {
            if (ar.failed()) {
                log.error("Failed to send records to search engine", ar.cause().getMessage());
                return;
            }

            JsonArray items = ar.result().getJsonArray("items");
            log.info(String.format("%d records sent to search engine", items.size()));
        });

        for (JsonObject record : bibliographicRecords) {
            JsonObject metadata = new JsonObject()
                    .put("_id", String.format("%s$%s", PMB.class.getName(), record.getString("id")));
            bulkRequest.index(record, metadata);
        }

        bulkRequest.end();
    }

    @Override
    public void setConfig(JsonObject config) {
        log.info("PMB source does not need config");
    }
}
