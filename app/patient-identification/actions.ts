"use server";

import { createPatient } from "@/lib/application/create-patient";

export type PatientFormState = {
  success: boolean;
  errors: Record<string, string>;
  patientId?: string;
};

export async function submitPatient(
  _previousState: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const value = (name: string) => String(formData.get(name) ?? "");
  const result = await createPatient({
    name: value("name"),
    birthDate: value("birthDate"),
    insuranceType: value("insuranceType"),
    insuranceNumber: value("insuranceNumber"),
    practicePatientNumber: value("practicePatientNumber"),
    phone: value("phone"),
    email: value("email"),
  });

  return result.success
    ? { success: true, errors: {}, patientId: result.patientId }
    : { success: false, errors: result.errors };
}
