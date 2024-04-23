CREATE TABLE mediacentre.users (
	id          VARCHAR(36) NOT NULL PRIMARY KEY,
	username    VARCHAR
);

CREATE TABLE mediacentre.groups (
	id      VARCHAR(36) NOT NULL PRIMARY KEY,
	name    VARCHAR
);

CREATE TABLE mediacentre.members (
	id          VARCHAR(36) NOT NULL PRIMARY KEY,
	user_id     VARCHAR(36),
	group_id    VARCHAR(36),
	CONSTRAINT user_fk FOREIGN KEY(user_id) REFERENCES mediacentre.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT group_fk FOREIGN KEY(group_id) REFERENCES mediacentre.groups(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE mediacentre.signet_shares (
	member_id       VARCHAR(36) NOT NULL,
	resource_id     bigint NOT NULL,
	action          VARCHAR NOT NULL,
	CONSTRAINT resource_share PRIMARY KEY (member_id, resource_id, action),
	CONSTRAINT signet_shares_member_fk FOREIGN KEY(member_id) REFERENCES mediacentre.members(id) ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE OR REPLACE FUNCTION mediacentre.merge_users(key VARCHAR, data VARCHAR) RETURNS VOID AS $$
    BEGIN
        LOOP
            UPDATE mediacentre.users SET username = data WHERE id = key;
            IF found THEN
                RETURN;
            END IF;
            BEGIN
                INSERT INTO mediacentre.users(id,username) VALUES (key, data);
                RETURN;
            EXCEPTION WHEN unique_violation THEN
            END;
        END LOOP;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mediacentre.insert_users_members() RETURNS TRIGGER AS $$
    BEGIN
		IF (TG_OP = 'INSERT') THEN
            INSERT INTO mediacentre.members(id, user_id) VALUES (NEW.id, NEW.id);
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mediacentre.insert_groups_members() RETURNS TRIGGER AS $$
    BEGIN
		IF (TG_OP = 'INSERT') THEN
            INSERT INTO mediacentre.members(id, group_id) VALUES (NEW.id, NEW.id);
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_trigger
AFTER INSERT ON mediacentre.users
    FOR EACH ROW EXECUTE PROCEDURE mediacentre.insert_users_members();

CREATE TRIGGER groups_trigger
AFTER INSERT ON mediacentre.groups
    FOR EACH ROW EXECUTE PROCEDURE mediacentre.insert_groups_members();

CREATE TYPE mediacentre.share_tuple as (member_id VARCHAR(36), action VARCHAR);
