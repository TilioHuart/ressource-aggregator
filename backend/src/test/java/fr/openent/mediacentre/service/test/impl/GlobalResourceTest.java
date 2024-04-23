package fr.openent.mediacentre.service.test.impl;

import fr.openent.mediacentre.enums.Profile;
import fr.openent.mediacentre.service.GlobalResourceService;
import fr.openent.mediacentre.service.impl.GlobalResourceServiceMongoImpl;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.user.UserInfos;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.powermock.modules.junit4.PowerMockRunnerDelegate;
import static fr.openent.mediacentre.core.constants.Field.*;
import org.powermock.reflect.Whitebox;


import static org.mockito.Mockito.mock;


@RunWith(PowerMockRunner.class) //Using the PowerMock runner
@PowerMockRunnerDelegate(VertxUnitRunner.class) //And the Vertx runner
@PrepareForTest({MongoDb.class}) //Prepare the static class you want to test
public class GlobalResourceTest {
    private Vertx vertx;
    private MongoDb mongo = Mockito.mock(MongoDb.class);
    private GlobalResourceService globalResourceService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        globalResourceService = new GlobalResourceServiceMongoImpl(GLOBAL_COLLECTION);
        MongoDb.getInstance().init(vertx.eventBus(), "fr.openent.mediacentre");
        PowerMockito.spy(MongoDb.class);
        PowerMockito.when(MongoDb.getInstance()).thenReturn(mongo);
        mongo = Mockito.spy(MongoDb.getInstance());
        this.globalResourceService = Mockito.spy(new GlobalResourceServiceMongoImpl(GLOBAL_COLLECTION));
    }

    @Test
    public void testListGlobalResource(TestContext ctx) throws Exception {
        JsonObject expected = expectedTestList();

        Mockito.doAnswer(invocation -> {
            String query = invocation.getArgument(0);
            ctx.assertEquals(new JsonObject(query), expected);
            return null;
        }).when(mongo).command(Mockito.anyString(), Mockito.any(Handler.class));

        try {
            Whitebox.invokeMethod(globalResourceService, "list", Profile.RELATIVE);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testCreateGlobalResource(TestContext ctx) throws Exception {
        UserInfos user = new UserInfos();
        user.setUserId("e18e8c6e-3e3e-4e3e-8e3e-3e3e3e3e3e3e");
        user.setUsername("LACHISE Sarah");
        JsonObject resource = new JsonObject()
                .put("title", "title")
                .put("link", "link")
                .put("discipline", new JsonArray().add("agronomie"))
                .put("levels", new JsonArray().add("terminale"))
                .put("image", "image")
                .put("profiles", new JsonArray().add("RELATIVE"));

        String expectedCollection = "mediacentre.global";
        JsonObject expectedResource = new JsonObject()
                .put("title", "title")
                .put("link", "link")
                .put("discipline", new JsonArray().add("agronomie"))
                .put("levels", new JsonArray().add("terminale"))
                .put("image", "image")
                .put("profiles", new JsonArray().add("RELATIVE"))
                .put("date", new JsonObject().put("$date", 0))
                .put("authors", new JsonArray().add("LACHISE Sarah"));


        Mockito.doAnswer(invocation -> {
            String collection = invocation.getArgument(0);
            JsonObject newResource = invocation.getArgument(1);
            ctx.assertEquals(collection, expectedCollection);
            ctx.assertEquals(newResource, expectedResource);
            return null;
        }).when(mongo).insert(Mockito.anyString(), Mockito.any(JsonObject.class), Mockito.any(Handler.class));

        globalResourceService.createGlobalResource(user, resource);
    }

    @Test
    public void testDeleteGlobalResource(TestContext ctx) throws Exception {
        String id = "e18e8c6e-3e3e-4e3e-8e3e-3e3e3e3e3e3e";
        JsonObject expectedQuery = new JsonObject().put("_id", id);

        String expectedCollection = "mediacentre.global";

        Mockito.doAnswer(invocation -> {
            String collection = invocation.getArgument(0);
            JsonObject query = invocation.getArgument(1);
            ctx.assertEquals(collection, expectedCollection);
            ctx.assertEquals(query, expectedQuery);
            return null;
        }).when(mongo).delete(Mockito.anyString(), Mockito.any(JsonObject.class), Mockito.any(Handler.class));

        globalResourceService.deleteGlobalChannel(id);
    }

    @Test
    public void testUpdateGlobalResource(TestContext ctx) throws Exception {
        String id = "e18e8c6e-3e3e-4e3e-8e3e-3e3e3e3e3e3e";
        JsonObject resource = new JsonObject()
                .put("title", "title")
                .put("link", "link")
                .put("discipline", new JsonArray().add("agronomie"))
                .put("levels", new JsonArray().add("terminale"))
                .put("image", "image")
                .put("profiles", new JsonArray().add("RELATIVE"));

        JsonObject expectedQuery = new JsonObject().put("_id", id);
        JsonObject expectedUpdate = new JsonObject().put("$set", resource);

        String expectedCollection = "mediacentre.global";

        Mockito.doAnswer(invocation -> {
            String collection = invocation.getArgument(0);
            JsonObject query = invocation.getArgument(1);
            JsonObject update = invocation.getArgument(2);
            ctx.assertEquals(collection, expectedCollection);
            ctx.assertEquals(query, expectedQuery);
            ctx.assertEquals(update, expectedUpdate);
            return null;
        }).when(mongo).update(Mockito.anyString(), Mockito.any(JsonObject.class), Mockito.any(JsonObject.class), Mockito.any(Handler.class));

        globalResourceService.updateGlobalChannel(id, resource);
    }

    private JsonObject expectedTestList() {
        return new JsonObject()
                .put("find", "mediacentre.global")
                .put("filter", new JsonObject().put("profiles", "RELATIVE"));
    }
}