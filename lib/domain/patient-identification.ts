export type PatientIdentificationInput = {
  insuranceType: "statutory" | "private" | "self_pay";
  insuranceNumber?: string | null;
  practicePatientNumber?: string | null;
};

export const insuranceTypes = ["statutory", "private", "self_pay"] as const;

export function isInsuranceType(value: string): value is PatientIdentificationInput["insuranceType"] {
  return insuranceTypes.includes(value as PatientIdentificationInput["insuranceType"]);
}

export function hasRequiredPatientIdentifier(input: PatientIdentificationInput): boolean {
  if (input.insuranceType === "statutory") {
    return Boolean(input.insuranceNumber?.trim());
  }

  return Boolean(input.practicePatientNumber?.trim());
}
