CREATE TABLE mediacentre.favorites
(
    signet_id integer NOT NULL,
    user_id character varying NOT NULL,
    favorite boolean NOT NULL default false,
    CONSTRAINT primarykey_favorites PRIMARY KEY (signet_id, user_id, favorite),
    CONSTRAINT foreignkey_favorites FOREIGN KEY (signet_id) REFERENCES mediacentre.signet(id) ON DELETE cascade,
    CONSTRAINT uniquepkey_favorites UNIQUE (signet_id, user_id)
);
