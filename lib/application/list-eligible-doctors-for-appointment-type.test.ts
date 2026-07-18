import { describe, expect, it, vi } from "vitest";
import { listEligibleDoctorsForAppointmentType } from "./list-eligible-doctors-for-appointment-type";

describe("listEligibleDoctorsForAppointmentType", () => {
  it("reads active doctor assignments for a public online appointment type", async () => {
    const appointmentTypeReader = {
      findFirst: vi.fn().mockResolvedValue({
        name: "Standardimpfung",
        assignments: [
          { staffUser: { id: "demir", name: "Dr. Demir" } },
          { staffUser: { id: "yilmaz", name: "Dr. Yilmaz" } },
        ],
      }),
    };

    const result = await listEligibleDoctorsForAppointmentType("standard-vaccination", appointmentTypeReader as never);

    expect(appointmentTypeReader.findFirst).toHaveBeenCalledWith({
      where: {
        id: "standard-vaccination",
        onlineBookable: true,
        visibleToPatient: true,
      },
      select: {
        name: true,
        assignments: {
          where: {
            active: true,
            staffUser: { role: "doctor", active: true },
          },
          select: {
            staffUser: {
              select: { id: true, name: true },
            },
          },
          orderBy: { staffUser: { name: "asc" } },
        },
      },
    });
    expect(result).toEqual({
      name: "Standardimpfung",
      assignments: [
        { staffUser: { id: "demir", name: "Dr. Demir" } },
        { staffUser: { id: "yilmaz", name: "Dr. Yilmaz" } },
      ],
    });
  });

  it("returns no appointment type when the selected type is not public and online bookable", async () => {
    const appointmentTypeReader = { findFirst: vi.fn().mockResolvedValue(null) };

    await expect(
      listEligibleDoctorsForAppointmentType("internal-type", appointmentTypeReader as never),
    ).resolves.toBeNull();
  });
});
