package fr.openent.mediacentre.service.test.impl;

import fr.openent.mediacentre.service.impl.DefaultSignetService;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.sql.Sql;
import org.entcore.common.user.UserInfos;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import static fr.openent.mediacentre.Mediacentre.FAVORITES_TABLE;
import static fr.openent.mediacentre.Mediacentre.SIGNET_TABLE;
import static fr.openent.mediacentre.core.constants.Field.*;

@RunWith(VertxUnitRunner.class)
public class DefaultSignetServiceTest {
    private Vertx vertx;
    private DefaultSignetService defaultSignetService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        defaultSignetService = new DefaultSignetService();
        Sql.getInstance().init(vertx.eventBus(), MEDIACENTRE_ADDRESS);
    }

    @Test
    public void testRetrieveFavoriteSignets(TestContext ctx) {
        Async async = ctx.async();
        UserInfos user = new UserInfos();
        user.setUsername("GUZMAN Mohamed");
        user.setUserId("50251834-1745-4fb9-a3ad-cc034438c688");

        String expectedQuery = "SELECT s.* FROM " + FAVORITES_TABLE + " f " +
                "INNER JOIN " + SIGNET_TABLE + " s ON s.id = f.signet_id " +
                "WHERE user_id = ? AND favorite = ?;";
        JsonArray expectedParams = new JsonArray("[\"50251834-1745-4fb9-a3ad-cc034438c688\", true]");

        vertx.eventBus().consumer(MEDIACENTRE_ADDRESS, message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals(PREPARED, body.getString(ACTION));
            ctx.assertEquals(expectedQuery, body.getString(STATEMENT));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray(VALUES).toString());
            async.complete();
        });

        defaultSignetService.retrieveFavoriteSignets(user)
            .onSuccess(result -> async.complete());

        async.awaitSuccess(10000);
    }
}
