package fr.openent.mediacentre.security;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import java.util.ArrayList;
import java.util.List;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

public class ShareAndOwner implements ResourcesProvider {
    public ShareAndOwner() {
    }

    public void authorize(final HttpServerRequest request, Binding binding, UserInfos user, final Handler<Boolean> handler) {
        SqlConf conf = SqlConfs.getConf(binding.getServiceMethod().substring(0, binding.getServiceMethod().indexOf(124)));
        String id = request.params().get(conf.getResourceIdLabel());
        if (id != null && !id.trim().isEmpty()) {
            request.pause();
            String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");
            List<String> gu = new ArrayList();
            gu.add(user.getUserId());
            if (user.getGroupsIds() != null) {
                gu.addAll(user.getGroupsIds());
            }

            Object[] groupsAndUserIds = gu.toArray();
            String query = "SELECT count(*) FROM " + conf.getSchema() + conf.getTable() + " LEFT JOIN " + conf.getSchema() + conf.getShareTable() + " ON id = resource_id WHERE ((member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND action = ?) OR owner_id = ?) AND id = ?";
            JsonArray values = (new fr.wseduc.webutils.collections.JsonArray(gu)).add(sharedMethod).add(user.getUserId()).add(Sql.parseId(id));
            Sql.getInstance().prepared(query, values, new Handler<Message<JsonObject>>() {
                public void handle(Message<JsonObject> message) {
                    request.resume();
                    Long count = SqlResult.countResult(message);
                    handler.handle(count != null && count > 0L);
                }
            });
        } else {
            handler.handle(false);
        }

    }
}
