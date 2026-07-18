import { AppointmentStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { listAvailableSlots } from "./list-available-slots";

const now = new Date("2026-07-20T08:00:00.000Z");
const regularBlock = { startTime: new Date("2026-07-20T09:00:00.000Z"), endTime: new Date("2026-07-20T10:00:00.000Z") };

function createReader({
  appointmentType = { name: "Beratung", durationMinutes: 20, assignments: [{ staffUser: { id: "demir", name: "Dr. Demir" } }] },
  regularBlocks = [regularBlock],
  blockingBlocks = [],
  appointments = [],
} = {}) {
  return {
    appointmentType: { findFirst: vi.fn().mockResolvedValue(appointmentType) },
    availabilityBlock: { findMany: vi.fn().mockResolvedValueOnce(regularBlocks).mockResolvedValueOnce(blockingBlocks) },
    appointment: { findMany: vi.fn().mockResolvedValue(appointments) },
  };
}

describe("listAvailableSlots", () => {
  it("returns duration-aligned slots from patient-visible regular availability", async () => {
    const reader = createReader();

    const result = await listAvailableSlots("consultation", "demir", now, reader as never);

    expect(result).toEqual({
      appointmentType: { name: "Beratung" },
      doctor: { id: "demir", name: "Dr. Demir" },
      slots: [
        { startTime: new Date("2026-07-20T09:00:00.000Z"), endTime: new Date("2026-07-20T09:20:00.000Z") },
        { startTime: new Date("2026-07-20T09:20:00.000Z"), endTime: new Date("2026-07-20T09:40:00.000Z") },
        { startTime: new Date("2026-07-20T09:40:00.000Z"), endTime: new Date("2026-07-20T10:00:00.000Z") },
      ],
    });
    expect(reader.availabilityBlock.findMany).toHaveBeenNthCalledWith(1, {
      where: { staffUserId: "demir", type: "regular", visibleToPatient: true, endTime: { gt: now } },
      select: { startTime: true, endTime: true },
      orderBy: { startTime: "asc" },
    });
    expect(reader.appointment.findMany).toHaveBeenCalledWith({
      where: {
        doctorStaffUserId: "demir",
        status: { in: [AppointmentStatus.booked, AppointmentStatus.rescheduled, AppointmentStatus.blocked] },
        endTime: { gt: now },
      },
      select: { startTime: true, endTime: true },
    });
  });

  it("excludes slots that overlap appointments and non-regular blocks", async () => {
    const reader = createReader({
      blockingBlocks: [
        { startTime: new Date("2026-07-20T09:00:00.000Z"), endTime: new Date("2026-07-20T09:20:00.000Z") },
        { startTime: new Date("2026-07-20T09:40:00.000Z"), endTime: new Date("2026-07-20T10:00:00.000Z") },
      ],
      appointments: [{ startTime: new Date("2026-07-20T09:20:00.000Z"), endTime: new Date("2026-07-20T09:40:00.000Z") }],
    });

    const result = await listAvailableSlots("consultation", "demir", now, reader as never);

    expect(result?.slots).toEqual([]);
    expect(reader.availabilityBlock.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        type: { not: "regular" },
        endTime: { gt: now },
        OR: [{ staffUserId: "demir" }, { staffUserId: null }],
      },
      select: { startTime: true, endTime: true },
    });
  });

  it("returns no result when the type and doctor are not a public active assignment", async () => {
    const reader = createReader({ appointmentType: null });

    await expect(listAvailableSlots("internal", "mfa", now, reader as never)).resolves.toBeNull();
    expect(reader.availabilityBlock.findMany).not.toHaveBeenCalled();
    expect(reader.appointment.findMany).not.toHaveBeenCalled();
  });
});
