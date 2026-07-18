import { AppointmentSource, AppointmentStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { createOnlineAppointment } from "./create-online-appointment";

const input = { patientId: "patient-1", appointmentTypeId: "consultation", doctorId: "demir", startTime: "2026-07-20T09:00:00.000Z" };

function createDatabase({ patient = { id: "patient-1", name: "Ada", birthDate: new Date(), onlineBookingAllowed: true }, create = vi.fn().mockResolvedValue({ id: "appointment-1" }) } = {}) {
  const transaction = { patient: { findUnique: vi.fn().mockResolvedValue(patient) }, appointment: { create } };
  return { $transaction: vi.fn((operation) => operation(transaction)), transaction };
}

const availableSummary = vi.fn().mockResolvedValue({
  appointmentType: { name: "Beratung" }, doctor: { id: "demir", name: "Dr. Demir" },
  startTime: new Date("2026-07-20T09:00:00.000Z"), endTime: new Date("2026-07-20T09:20:00.000Z"),
});

describe("createOnlineAppointment", () => {
  it("stores a confirmed online appointment only after revalidating the patient and slot", async () => {
    const database = createDatabase();
    await expect(createOnlineAppointment(input, database as never, availableSummary)).resolves.toEqual({ success: true, appointmentId: "appointment-1" });
    expect(database.transaction.patient.findUnique).toHaveBeenCalledWith({
      where: { id: "patient-1" }, select: { id: true, name: true, birthDate: true, onlineBookingAllowed: true },
    });
    expect(database.transaction.appointment.create).toHaveBeenCalledWith({
      data: {
        patientId: "patient-1", appointmentTypeId: "consultation", doctorStaffUserId: "demir",
        startTime: new Date("2026-07-20T09:00:00.000Z"), endTime: new Date("2026-07-20T09:20:00.000Z"),
        status: AppointmentStatus.booked, source: AppointmentSource.online,
      }, select: { id: true },
    });
  });

  it("does not store an appointment for an invalid patient", async () => {
    const database = createDatabase({ patient: null });
    await expect(createOnlineAppointment(input, database as never, availableSummary)).resolves.toEqual({ success: false, reason: "invalid_selection" });
    expect(database.transaction.appointment.create).not.toHaveBeenCalled();
  });

  it("does not store an appointment when the slot is no longer available", async () => {
    const database = createDatabase();
    await expect(createOnlineAppointment(input, database as never, vi.fn().mockResolvedValue(null))).resolves.toEqual({ success: false, reason: "unavailable" });
    expect(database.transaction.appointment.create).not.toHaveBeenCalled();
  });

  it("treats the database overlap protection as an unavailable slot", async () => {
    const database = createDatabase({ create: vi.fn().mockRejectedValue(new Error("appointment_overlap")) });
    await expect(createOnlineAppointment(input, database as never, availableSummary)).resolves.toEqual({ success: false, reason: "unavailable" });
  });
});
