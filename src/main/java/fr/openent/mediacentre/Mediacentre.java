package fr.openent.mediacentre;

import fr.openent.mediacentre.controller.MediacentreController;
import fr.openent.mediacentre.source.Source;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.BaseServer;

import java.util.ArrayList;
import java.util.List;

public class Mediacentre extends BaseServer {

    @Override
	public void start() throws Exception {
		super.start();

        EventBus eb = getEventBus(vertx);

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
    }

}
