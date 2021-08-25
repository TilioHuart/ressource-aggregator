package fr.openent.mediacentre.service.impl;


import fr.openent.mediacentre.Mediacentre;
import fr.openent.mediacentre.service.moduleSQLRequestService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;

import java.text.SimpleDateFormat;
import java.util.Date;

import static fr.openent.mediacentre.Mediacentre.*;

public class DefaultModuleSQLRequestService extends SqlCrudService implements moduleSQLRequestService {

    private final Logger log = LoggerFactory.getLogger(fr.openent.mediacentre.service.impl.DefaultModuleSQLRequestService.class);

    public DefaultModuleSQLRequestService(String schema, String table) {
        super(schema, table);
    }

    @Override
    public void createFolder(final JsonObject folder, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        Object parentId = folder.getValue("parentId");
        values.add(folder.getValue("userId"));
        values.add(folder.getValue("name"));
        String createFolder;
        if (!parentId.equals(0)) {
            values.add(folder.getValue("parentId"));
            createFolder = "INSERT INTO " + Mediacentre.mediacentreSchema + ".folder(user_id, name, parent_id)" +
                    " VALUES (?, ?, ?)";
        } else {
            createFolder = "INSERT INTO " + Mediacentre.mediacentreSchema + ".folder(user_id, name)" +
                    " VALUES (?, ?)";
        }
        sql.prepared(createFolder, values, SqlResult.validUniqueResultHandler(handler));
    }


    @Override
    public void renameFolder(final JsonObject folder, final Handler<Either<String, JsonObject>> handler){

        String renameFolder = "UPDATE " + Mediacentre.mediacentreSchema + ".folder SET name='"+folder.getValue("name")+"' WHERE id="+folder.getValue("id");
        sql.raw(renameFolder , SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteFolders(final JsonObject folder, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        JsonArray folders = folder.getJsonArray("foldersId");

        for (int i = 0; i < folders.size(); i++) {
            values.add(folders.getValue(i));
        }

        String deleteFolders = "DELETE FROM " + Mediacentre.mediacentreSchema + ".folder" + " WHERE id IN " + Sql.listPrepared(folders.getList());

        sql.prepared(deleteFolders, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void moveFolder(final JsonObject folder, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        JsonArray folders = folder.getJsonArray("foldersId");
        if (folder.getInteger("parentId") == 0) {
            values.addNull();
        } else {
            values.add(folder.getValue("parentId"));
        }

        for (int i = 0; i < folders.size(); i++) {
            values.add(folders.getValue(i));
        }

        String moveFolder = "UPDATE " + Mediacentre.mediacentreSchema + ".folder SET parent_id = ? WHERE id IN " + Sql.listPrepared(folders.getList());

        sql.prepared(moveFolder, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void createCourse(final JsonObject course, final Handler<Either<String, JsonObject>> handler) {
        String createCourse = "INSERT INTO " + Mediacentre.mediacentreSchema + ".course(moodle_id, user_id)" +
                " VALUES (?, ?) RETURNING moodle_id as id;";

        JsonArray values = new JsonArray();
        values.add(course.getValue("moodleid"));
        values.add(course.getString("userid"));

        sql.prepared(createCourse, values, SqlResult.validUniqueResultHandler(event -> {
            if (event.isRight()) {
                if (!course.getValue("folderId").equals(0)) {
                    createRelCourseFolder(course.getValue("moodleid"), course.getValue("folderId"), handler);
                } else {
                    handler.handle(new Either.Right<>(course));
                }

            } else {
                log.error("Error when inserting new courses before inserting rel_course_folders elements ");
            }

        }));

    }

    private void createRelCourseFolder(Object moodleid, Object folderId, Handler<Either<String, JsonObject>> handler) {
        String createCourse = "INSERT INTO " + Mediacentre.mediacentreSchema + ".rel_course_folder(course_id, folder_id)" +
                " VALUES (?, ?) RETURNING course_id as id;";

        JsonArray values = new JsonArray();
        values.add(moodleid);
        values.add(folderId);

        sql.prepared(createCourse, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getPreferences(String id_user, final Handler<Either<String, JsonArray>> handler) {
        String getCoursesPreferences = "SELECT moodle_id, masked, favorites FROM " + Mediacentre.mediacentreSchema + ".preferences" + " WHERE user_id = ?;";
        JsonArray value = new JsonArray();
        value.add(id_user);
        sql.prepared(getCoursesPreferences, value, SqlResult.validResultHandler(handler));
    }

    @Override
    public void setPreferences(final JsonObject course, final Handler<Either<String, JsonObject>> handler) {
        String query = "INSERT INTO " + Mediacentre.mediacentreSchema + ".preferences (moodle_id, user_id, masked, favorites)" +
                " VALUES (?, ?, ?, ?) ON CONFLICT (moodle_id, user_id) DO UPDATE SET masked =" + course.getBoolean("masked") +
                ", favorites =" + course.getBoolean("favorites") + " ; " +
                "DELETE FROM " + Mediacentre.mediacentreSchema + ".preferences WHERE masked = false AND favorites = false;";

        JsonArray values = new JsonArray();
        values.add(course.getInteger("courseid"));
        values.add(course.getString("userId"));
        values.add(course.getBoolean("masked"));
        values.add(course.getBoolean("favorites"));


        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void checkIfCoursesInRelationTable(final JsonObject course, final Handler<Either<String, Boolean>> handler) {
        JsonArray values = new JsonArray();
        JsonArray courses = course.getJsonArray("coursesId");
        for (int i = 0; i < courses.size(); i++) {
            values.add(courses.getValue(i));
        }

        String selectCourse = "SELECT COUNT(course_id) " +
                "FROM " + Mediacentre.mediacentreSchema + ".rel_course_folder " +
                "WHERE course_id IN " + Sql.listPrepared(courses.getList());

        sql.prepared(selectCourse, values, res -> {
            Long count = SqlResult.countResult(res);
            if (count > 0) handler.handle(new Either.Right<>(count == courses.size()));
            else handler.handle(new Either.Left<>("Courses present in relation table"));
        });
    }

    @Override
    public void insertCourseInRelationTable(final JsonObject course, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();

        String insertMoveCourse = "INSERT INTO " + Mediacentre.mediacentreSchema + ".rel_course_folder (folder_id, course_id) VALUES ";
        JsonArray courses = course.getJsonArray("coursesId");

        for (int i = 0; i < courses.size() - 1; i++) {
            values.add(course.getValue("folderId"));
            values.add(courses.getValue(i));
            insertMoveCourse += "(?, ?), ";
        }

        values.add(course.getValue("folderId"));
        values.add(courses.getValue(courses.size() - 1));
        insertMoveCourse += "(?, ?);";

        sql.prepared(insertMoveCourse, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updateCourseIdInRelationTable(final JsonObject course, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        JsonArray courses = course.getJsonArray("coursesId");
        values.add(course.getValue("folderId"));
        for (int i = 0; i < courses.size(); i++) {
            values.add(courses.getValue(i));
        }

        String updateMoveCourse = "UPDATE " + Mediacentre.mediacentreSchema + ".rel_course_folder SET folder_id = ?" +
                " WHERE course_id IN " + Sql.listPrepared(courses.getList());

        sql.prepared(updateMoveCourse, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteCourseInRelationTable(final JsonObject course, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        JsonArray courses = course.getJsonArray("coursesId");
        for (int i = 0; i < courses.size(); i++) {
            values.add(courses.getValue(i));
        }

        String deleteMoveCourse = "DELETE FROM " + Mediacentre.mediacentreSchema + ".rel_course_folder" +
                " WHERE course_id IN " + Sql.listPrepared(courses.getList());

        sql.prepared(deleteMoveCourse, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteCourse(final JsonObject course, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        JsonArray courses = course.getJsonArray("coursesId");

        for (int i = 0; i < courses.size(); i++) {
            values.add(courses.getValue(i));
        }
        String deleteCourse = "DELETE FROM " + Mediacentre.mediacentreSchema + ".course " +
                "WHERE moodle_id IN " + Sql.listPrepared(courses.getList());

        sql.prepared(deleteCourse, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getFoldersInEnt(String id_user, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT id,  " +
                "CASE WHEN parent_id IS NULL then 0 ELSE parent_id END" +
                ", user_id, name " +
                "FROM " + Mediacentre.mediacentreSchema + ".folder " +
                "WHERE user_id = ?;";

        JsonArray values = new JsonArray();
        values.add(id_user);
        sql.prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void countItemInFolder(long id_folder, String userId, Handler<Either<String, JsonObject>> defaultResponseHandler) {
        String query = "SELECT  count(*) " +
                "FROM " + Mediacentre.mediacentreSchema + ".folder " +
                "WHERE user_id = ? AND parent_id = ?;";
        JsonArray values = new JsonArray();
        values.add(userId).add(id_folder);
        sql.prepared(query, values, SqlResult.validUniqueResultHandler(defaultResponseHandler));
    }

    @Override
    public void getCoursesByUserInEnt(String userId, Handler<Either<String, JsonArray>> eitherHandler) {
        String query = "SELECT moodle_id,CASE WHEN folder_id IS NULL THEN 0 else folder_id end " +
                ", null as disciplines, null as levels, null as plain_text, null as fullname, null as imageurl, " +
                "null as summary, null as author, null as author_id, null as user_id, null as username, null as license " +
                "FROM " + Mediacentre.mediacentreSchema + ".course " +
                "LEFT JOIN " + mediacentreSchema + ".rel_course_folder " +
                "ON course.moodle_id = rel_course_folder.course_id " +
                "WHERE course.user_id = ? AND NOT EXISTS (SELECT course_id FROM " + Mediacentre.mediacentreSchema + ".publication WHERE course_id = moodle_id) " +
                "UNION SELECT course_id as moodle_id, 0 as folder_id, discipline_label as disciplines, level_label as levels, key_words as plain_text, fullname, " +
                "imageurl, summary, author, author_id, user_id, username, license " +
                "FROM " + Mediacentre.mediacentreSchema + ".publication WHERE publication.user_id = ? AND course_id is not null;";

        JsonArray values = new JsonArray();
        values.add(userId);
        values.add(userId);
        sql.prepared(query, values, SqlResult.validResultHandler(eitherHandler));
    }

    @Override
    public void getChoices(String userId, final Handler<Either<String, JsonArray>> eitherHandler) {
        String query = "SELECT * " +
                "FROM " + Mediacentre.mediacentreSchema + ".choices " +
                "WHERE user_id = ?;";

        JsonArray values = new JsonArray();
        values.add(userId);
        sql.prepared(query, values, SqlResult.validResultHandler(eitherHandler));
    }

    @Override
    public void setChoice(final JsonObject courses, String view, Handler<Either<String, JsonObject>> handler) {
        String query = "INSERT INTO " + Mediacentre.mediacentreSchema + ".choices (user_id, lastcreation, todo, tocome, coursestodosort, coursestocomesort)" +
                " VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (user_id) DO UPDATE SET " + view + "='" + courses.getValue(view) + "'; " +
                "DELETE FROM " + Mediacentre.mediacentreSchema + ".choices WHERE lastcreation = true AND todo = true AND tocome = true " +
                "AND coursestodosort = 'doing' AND coursestocomesort = 'all';";

        JsonArray values = new JsonArray();
        values.add(courses.getString("userId"));
        values.add(courses.getBoolean("lastCreation",true));
        values.add(courses.getBoolean("toDo",true));
        values.add(courses.getBoolean("toCome",true));
        values.add(courses.getString("coursestodosort","all"));
        values.add(courses.getString("coursestocomesort","doing"));

        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void insertDuplicateTable (JsonObject courseToDuplicate, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO " + Mediacentre.mediacentreSchema + ".duplication (id_course, id_folder, id_users, status, category_id";

        if (courseToDuplicate.getInteger("publishFK") != null) {
            query += ", auditeur, publishFK) VALUES (?, ?, ?, ?, ?, ?, ?);";
            values.add(courseToDuplicate.getInteger("courseid"))
                    .add(courseToDuplicate.getInteger("folderId"))
                    .add(courseToDuplicate.getString("userId"))
                    .add(courseToDuplicate.getString("status"))
                    .add(courseToDuplicate.getInteger("category_id"))
                    .add(courseToDuplicate.getString("auditeur_id"))
                    .add(courseToDuplicate.getInteger("publishFK"));

        } else {
            query += ") VALUES (?, ?, ?, ?, ?);";
            values.add(courseToDuplicate.getInteger("courseid"))
                    .add(courseToDuplicate.getInteger("folderId"))
                    .add(courseToDuplicate.getString("userId"))
                    .add(courseToDuplicate.getString("status"))
                    .add(courseToDuplicate.getInteger("category_id"));
        }

        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getUserCourseToDuplicate (String userId, final Handler<Either<String, JsonArray>> handler){
        String query = "SELECT * FROM " + Mediacentre.mediacentreSchema + ".duplication WHERE id_users = ? ;";

        JsonArray values = new JsonArray();
        values.add(userId);

        sql.prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void insertPublishedCourseMetadata (JsonObject courseToPublish, Handler<Either<String, JsonObject>> handler){
        JsonArray values = new JsonArray();

        SimpleDateFormat formater;
        Date now = new Date();
        formater = new SimpleDateFormat("_yyyy-MM-dd");
        courseToPublish.put("title", courseToPublish.getString("title") + formater.format(now));

        JsonArray levelArray = new JsonArray();
        if(courseToPublish.containsKey("levels")) {
            for (int i = 0; i < courseToPublish.getJsonArray("levels").size(); i++) {
                levelArray.add((courseToPublish.getJsonArray("levels").getJsonObject(i).getString("label")));
            }
        }

        JsonArray disciplineArray = new JsonArray();
        if(courseToPublish.containsKey("disciplines")) {
            for (int i = 0; i < courseToPublish.getJsonArray("disciplines").size(); i++) {
                disciplineArray.add((courseToPublish.getJsonArray("disciplines").getJsonObject(i).getString("label")));
            }
        }

        JsonArray plainTextArray = new JsonArray();
        if(courseToPublish.containsKey("plain_text")) {
            for (int i = 0; i < courseToPublish.getJsonArray("plain_text").size(); i++) {
                plainTextArray.add((courseToPublish.getJsonArray("plain_text").getJsonObject(i).getString("label")));
            }
        }

        String test = "";
        if (disciplineArray.isEmpty())
            disciplineArray.add(test);
        if (levelArray.isEmpty())
            levelArray.add(test);
        if (plainTextArray.isEmpty())
            plainTextArray.add(test);

        String query = "INSERT INTO " + Mediacentre.mediacentreSchema + ".publication (discipline_label, level_label, key_words, " +
                "fullname, imageurl, summary, author, author_id, user_id, username, license) " +
                "VALUES (" + Sql.arrayPrepared(disciplineArray) + " ," + Sql.arrayPrepared(levelArray) +
                ", " + Sql.arrayPrepared(plainTextArray) + ", ?, ?, ?, ?, ?, ?, ?, ?) RETURNING publication.id AS id;";

        values.addAll(disciplineArray)
                .addAll(levelArray)
                .addAll(plainTextArray)
                .add(courseToPublish.getString("title"))
                .add(courseToPublish.getString("urlImage"))
                .add(courseToPublish.getString("description"))
                .add(courseToPublish.getString("author"))
                .add(courseToPublish.getString("author_id"))
                .add(courseToPublish.getString("userid"))
                .add(courseToPublish.getString("username"))
                .add(true);

        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updatePublishedCourseId (JsonObject createCourseDuplicate, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Mediacentre.mediacentreSchema + ".publication SET course_id = ? WHERE id = ?";

        JsonArray values = new JsonArray();
        values.add(createCourseDuplicate.getInteger("moodleid"));
        values.add(createCourseDuplicate.getInteger("duplicationFK"));

        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updatePublicCourseMetadata(Integer course_id, JsonObject newMetadata, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Mediacentre.mediacentreSchema + ".publication SET discipline_label = " +
                Sql.arrayPrepared(newMetadata.getJsonArray("discipline_label"))
                + ", level_label = " + Sql.arrayPrepared(newMetadata.getJsonArray("level_label")) + ", key_words = " +
                Sql.arrayPrepared(newMetadata.getJsonArray("plain_text")) + " WHERE course_id = ?";

        JsonArray values = new JsonArray();
        values.addAll(newMetadata.getJsonArray("discipline_label"));
        values.addAll(newMetadata.getJsonArray("level_label"));
        values.addAll(newMetadata.getJsonArray("plain_text"));
        values.add(course_id);

        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updatePublicCourse(JsonObject newCourse, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Mediacentre.mediacentreSchema + ".publication SET fullname = ?, imageurl = ?, summary = ? " +
                "WHERE course_id = ?";

        JsonArray values = new JsonArray();
        values.add(newCourse.getString("fullname"));
        values.add(newCourse.getString("imageurl"));
        values.add(newCourse.getString("summary"));
        values.add(newCourse.getInteger("courseid"));

        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deletePublicCourse(JsonArray idsToDelete, Handler<Either<String, JsonObject>> handler) {
        String deleteCourse = "DELETE FROM " + Mediacentre.mediacentreSchema + ".publication " +
                "WHERE course_id IN " + Sql.listPrepared(idsToDelete.getList());

        sql.prepared(deleteCourse, idsToDelete, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getDuplicationId(JsonArray publicationId, Handler<Either<String, JsonObject>> handler) {
        String getId = "SELECT publishfk FROM " + Mediacentre.mediacentreSchema + ".duplication " +
        "WHERE id = ?";

        sql.prepared(getId, publicationId, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getPublicCourseData(JsonArray id, final Handler<Either<String, JsonObject>> handler) {
        String selectCourse = "SELECT * FROM " + Mediacentre.mediacentreSchema + ".publication " +
                "WHERE course_id = ?";

        sql.prepared(selectCourse, id, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getLevels(Handler<Either<String, JsonArray>> handler) {
        String query = "Select * From " + Mediacentre.mediacentreSchema + ".levels;";
        sql.prepared(query, new JsonArray(), SqlResult.validResultHandler(handler));
    }

    @Override
    public void getDisciplines(Handler<Either<String, JsonArray>> handler) {
        String query = "Select * From " + Mediacentre.mediacentreSchema + ".disciplines;";
        sql.prepared(query, new JsonArray(), SqlResult.validResultHandler(handler));
    }
}
