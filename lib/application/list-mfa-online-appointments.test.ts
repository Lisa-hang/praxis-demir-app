import { AppointmentSource, AppointmentStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { listMfaOnlineAppointments } from "./list-mfa-online-appointments";

describe("listMfaOnlineAppointments", () => {
  it("reads online appointments with the overview data ordered by their start time", async () => {
    const appointments = [
      {
        startTime: new Date("2026-07-20T09:00:00.000Z"),
        patient: { name: "Ada Beispiel" },
        appointmentType: { name: "Beratung" },
        doctor: { name: "Dr. Demir" },
        status: AppointmentStatus.booked,
        source: AppointmentSource.online,
      },
    ];
    const reader = { findMany: vi.fn().mockResolvedValue(appointments) };

    await expect(listMfaOnlineAppointments(reader as never)).resolves.toEqual(appointments);
    expect(reader.findMany).toHaveBeenCalledWith({
      where: { source: AppointmentSource.online },
      select: {
        startTime: true,
        patient: { select: { name: true } },
        appointmentType: { select: { name: true } },
        doctor: { select: { name: true } },
        status: true,
        source: true,
      },
      orderBy: { startTime: "asc" },
    });
  });

  it("returns an empty result when no online appointments exist", async () => {
    const reader = { findMany: vi.fn().mockResolvedValue([]) };

    await expect(listMfaOnlineAppointments(reader as never)).resolves.toEqual([]);
  });
});
