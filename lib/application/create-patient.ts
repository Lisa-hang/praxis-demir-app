import { Prisma } from "@prisma/client";
import { db } from "../db";
import {
  hasRequiredPatientIdentifier,
  isInsuranceType,
  type PatientIdentificationInput,
} from "../domain/patient-identification";

export type CreatePatientInput = {
  name: string;
  birthDate: string;
  insuranceType: string;
  insuranceNumber?: string | null;
  practicePatientNumber?: string | null;
  phone: string;
  email?: string | null;
};

export type CreatePatientResult =
  | { success: true; patientId: string }
  | { success: false; errors: Record<string, string> };

type PatientWriter = Pick<typeof db.patient, "create">;

function optionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseBirthDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

export async function createPatient(
  input: CreatePatientInput,
  patientWriter: PatientWriter = db.patient,
): Promise<CreatePatientResult> {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = optionalText(input.email);
  const birthDate = parseBirthDate(input.birthDate);

  if (!name) errors.name = "Bitte geben Sie Ihren Namen an.";
  if (!birthDate) errors.birthDate = "Bitte geben Sie ein gültiges Geburtsdatum an.";
  if (!phone) errors.phone = "Bitte geben Sie eine Telefonnummer an.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  }

  if (!isInsuranceType(input.insuranceType)) {
    errors.insuranceType = "Bitte wählen Sie einen Versicherungsstatus aus.";
  }

  const identification: PatientIdentificationInput | null = isInsuranceType(input.insuranceType)
    ? {
        insuranceType: input.insuranceType,
        insuranceNumber: input.insuranceNumber,
        practicePatientNumber: input.practicePatientNumber,
      }
    : null;

  if (identification && !hasRequiredPatientIdentifier(identification)) {
    const field = identification.insuranceType === "statutory"
      ? "insuranceNumber"
      : "practicePatientNumber";
    errors[field] = field === "insuranceNumber"
      ? "Bitte geben Sie Ihre Versichertennummer an."
      : "Bitte geben Sie Ihre Praxis-Patientennummer an.";
  }

  if (Object.keys(errors).length || !birthDate || !identification) {
    return { success: false, errors };
  }

  try {
    const patient = await patientWriter.create({
      data: {
        name,
        birthDate,
        insuranceType: identification.insuranceType,
        insuranceNumber: identification.insuranceType === "statutory"
          ? optionalText(input.insuranceNumber)
          : null,
        practicePatientNumber: identification.insuranceType === "statutory"
          ? null
          : optionalText(input.practicePatientNumber),
        phone,
        email,
      },
      select: { id: true },
    });
    return { success: true, patientId: patient.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        errors: { identifier: "Diese Identifikationsnummer ist bereits erfasst." },
      };
    }
    throw error;
  }
}
