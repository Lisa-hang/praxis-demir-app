import { db } from "../db";

type AppointmentTypeReader = Pick<typeof db.appointmentType, "findMany">;

/**
 * Returns only appointment types that may be offered in the patient portal.
 * This is deliberately limited to selection; it does not check availability
 * and does not create an appointment.
 */
export async function listOnlineAppointmentTypes(
  appointmentTypeReader: AppointmentTypeReader = db.appointmentType,
) {
  return appointmentTypeReader.findMany({
    where: {
      onlineBookable: true,
      visibleToPatient: true,
    },
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      requiredFields: true,
    },
    orderBy: { name: "asc" },
  });
}
