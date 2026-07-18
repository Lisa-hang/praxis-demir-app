import { AppointmentSource } from "@prisma/client";
import { db } from "../db";

type AppointmentReader = Pick<typeof db.appointment, "findMany">;

/**
 * Lists appointments created through the online portal for the internal MFA
 * overview. This is a read-only query and deliberately does not enforce
 * authentication or modify appointment data.
 */
export async function listMfaOnlineAppointments(
  appointmentReader: AppointmentReader = db.appointment,
) {
  return appointmentReader.findMany({
    where: { source: AppointmentSource.online },
    select: {
      startTime: true,
      patient: { select: { name: true } },
      appointmentType: { select: { name: true } },
      doctor: { select: { name: true } },
      status: true,
      source: true,
    },
    orderBy: { startTime: "asc" },
  });
}
