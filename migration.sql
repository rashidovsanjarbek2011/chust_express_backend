-- trigger.sql
CREATE OR REPLACE FUNCTION update_worker_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Worker"
    SET 
        "rating" = (SELECT COALESCE(AVG(rating), 0) FROM "WorkerRating" WHERE "workerId" = NEW."workerId"),
        "reviewCount" = (SELECT COUNT(*) FROM "WorkerRating" WHERE "workerId" = NEW."workerId")
    WHERE "id" = NEW."workerId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_worker_rating ON "WorkerRating";
CREATE TRIGGER trigger_update_worker_rating
    AFTER INSERT OR UPDATE OR DELETE ON "WorkerRating"
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_avg_rating();
