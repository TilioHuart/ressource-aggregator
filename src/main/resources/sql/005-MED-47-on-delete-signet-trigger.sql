-- Delete signet based on its identifier favorite on table favorites
CREATE OR REPLACE FUNCTION mediacentre.delete_signet_favorite() RETURNS TRIGGER AS
    $BODY$
    DECLARE
structureId character varying;
BEGIN
    DELETE FROM mediacentre.favorites WHERE signet_id = OLD.id;
RETURN OLD;
END
    $BODY$
LANGUAGE plpgsql;

-- Trigger on delete signet
CREATE TRIGGER delete_signet_favorite
    AFTER DELETE
    ON mediacentre.signet
    FOR EACH ROW
EXECUTE PROCEDURE mediacentre.delete_signet_favorite();

