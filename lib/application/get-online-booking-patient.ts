import { db } from "../db";

export type OnlineBookingPatient = {
  id: string;
  name: string;
  birthDate: Date;
};

type PatientReader = Pick<typeof db.patient, "findUnique">;

/** Loads the patient context for the read-only online selection flow. */
export async function getOnlineBookingPatient(
  patientId: string,
  patientReader: PatientReader = db.patient,
): Promise<OnlineBookingPatient | null> {
  if (!patientId.trim()) return null;

  const patient = await patientReader.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, birthDate: true, onlineBookingAllowed: true },
  });

  if (!patient?.onlineBookingAllowed) return null;

  return { id: patient.id, name: patient.name, birthDate: patient.birthDate };
}
