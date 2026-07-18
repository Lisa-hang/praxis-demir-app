-- Active appointments for the same doctor must never overlap.
CREATE TRIGGER "Appointment_prevent_overlap_on_insert"
BEFORE INSERT ON "Appointment"
WHEN NEW."status" IN ('booked', 'rescheduled', 'blocked')
  AND EXISTS (
    SELECT 1 FROM "Appointment" AS existing
    WHERE existing."doctorStaffUserId" = NEW."doctorStaffUserId"
      AND existing."status" IN ('booked', 'rescheduled', 'blocked')
      AND NEW."startTime" < existing."endTime" AND existing."startTime" < NEW."endTime"
  )
BEGIN SELECT RAISE(ABORT, 'appointment_overlap'); END;

CREATE TRIGGER "Appointment_prevent_overlap_on_update"
BEFORE UPDATE OF "doctorStaffUserId", "startTime", "endTime", "status" ON "Appointment"
WHEN NEW."status" IN ('booked', 'rescheduled', 'blocked')
  AND EXISTS (
    SELECT 1 FROM "Appointment" AS existing
    WHERE existing."id" != NEW."id" AND existing."doctorStaffUserId" = NEW."doctorStaffUserId"
      AND existing."status" IN ('booked', 'rescheduled', 'blocked')
      AND NEW."startTime" < existing."endTime" AND existing."startTime" < NEW."endTime"
  )
BEGIN SELECT RAISE(ABORT, 'appointment_overlap'); END;
