export type PatientIdentificationInput = {
  insuranceType: "statutory" | "private" | "self_pay";
  insuranceNumber?: string | null;
  practicePatientNumber?: string | null;
};

export function hasRequiredPatientIdentifier(input: PatientIdentificationInput): boolean {
  if (input.insuranceType === "statutory") {
    return Boolean(input.insuranceNumber?.trim());
  }

  return Boolean(input.practicePatientNumber?.trim());
}
