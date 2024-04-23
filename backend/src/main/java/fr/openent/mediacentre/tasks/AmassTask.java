package fr.openent.mediacentre.tasks;

import fr.openent.mediacentre.source.Source;
import io.vertx.core.Handler;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.List;

public class AmassTask implements Handler<Long> {
    Logger log = LoggerFactory.getLogger(AmassTask.class);
    private final List<Source> sources;

    public AmassTask(List<Source> sources) {
        this.sources = sources;
    }

    @Override
    public void handle(Long event) {
        log.info("Starting amass task");
        for (Source source: sources) {
            source.amass();
        }
    }
}
