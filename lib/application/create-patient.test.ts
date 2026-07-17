import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { createPatient } from "./create-patient";

const statutoryInput = {
  name: "  Erika Muster  ",
  birthDate: "1980-02-29",
  insuranceType: "statutory",
  insuranceNumber: "  A123  ",
  practicePatientNumber: "IGNORED",
  phone: " 030 123456 ",
  email: " erika@example.de ",
};

function writer() {
  return { create: vi.fn().mockResolvedValue({ id: "patient-1" }) };
}

describe("createPatient", () => {
  it("normalizes and persists a statutory patient through the patient writer", async () => {
    const patientWriter = writer();
    const result = await createPatient(statutoryInput, patientWriter as never);

    expect(result).toEqual({ success: true, patientId: "patient-1" });
    expect(patientWriter.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Erika Muster",
        birthDate: new Date("1980-02-29T00:00:00.000Z"),
        insuranceType: "statutory",
        insuranceNumber: "A123",
        practicePatientNumber: null,
        phone: "030 123456",
        email: "erika@example.de",
      }),
      select: { id: true },
    });
  });

  it.each(["private", "self_pay"])("uses the practice number for %s patients", async (insuranceType) => {
    const patientWriter = writer();
    await createPatient({
      ...statutoryInput,
      insuranceType,
      insuranceNumber: "IGNORED",
      practicePatientNumber: " P456 ",
      email: " ",
    }, patientWriter as never);

    expect(patientWriter.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        insuranceNumber: null,
        practicePatientNumber: "P456",
        email: null,
      }),
    }));
  });

  it("rejects invalid fields without writing", async () => {
    const patientWriter = writer();
    const result = await createPatient({
      name: " ", birthDate: "2024-02-30", insuranceType: "unknown",
      phone: " ", email: "invalid",
    }, patientWriter as never);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toMatchObject({
        name: expect.any(String), birthDate: expect.any(String), insuranceType: expect.any(String),
        phone: expect.any(String), email: expect.any(String),
      });
    }
    expect(patientWriter.create).not.toHaveBeenCalled();
  });

  it("requires the identifier matching the insurance type", async () => {
    const patientWriter = writer();
    const result = await createPatient({ ...statutoryInput, insuranceNumber: " " }, patientWriter as never);
    expect(result).toEqual({ success: false, errors: { insuranceNumber: expect.any(String) } });
    expect(patientWriter.create).not.toHaveBeenCalled();
  });

  it("turns a Prisma unique conflict into a form error", async () => {
    const patientWriter = {
      create: vi.fn().mockRejectedValue(new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002", clientVersion: "test", meta: { target: ["insuranceNumber"] },
      })),
    };
    const result = await createPatient(statutoryInput, patientWriter as never);
    expect(result).toEqual({ success: false, errors: { identifier: expect.any(String) } });
  });
});
