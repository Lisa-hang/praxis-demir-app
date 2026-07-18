import { db } from "../db";

type AppointmentTypeReader = Pick<typeof db.appointmentType, "findFirst">;

/**
 * Returns active doctors assigned to a patient-visible online appointment
 * type. It deliberately does not check slots or create appointments.
 */
export async function listEligibleDoctorsForAppointmentType(
  appointmentTypeId: string,
  appointmentTypeReader: AppointmentTypeReader = db.appointmentType,
) {
  return appointmentTypeReader.findFirst({
    where: {
      id: appointmentTypeId,
      onlineBookable: true,
      visibleToPatient: true,
    },
    select: {
      name: true,
      assignments: {
        where: {
          active: true,
          staffUser: {
            role: "doctor",
            active: true,
          },
        },
        select: {
          staffUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          staffUser: {
            name: "asc",
          },
        },
      },
    },
  });
}
