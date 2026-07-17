import { describe, expect, it, vi } from "vitest";
import { listOnlineAppointmentTypes } from "./list-online-appointment-types";

describe("listOnlineAppointmentTypes", () => {
  it("reads only online-bookable appointment types visible to patients", async () => {
    const appointmentTypeReader = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "travel-vaccination",
          name: "Reiseimpfung",
          durationMinutes: 15,
          requiredFields: ["travelDestination", "travelDate"],
        },
      ]),
    };

    const result = await listOnlineAppointmentTypes(appointmentTypeReader as never);

    expect(appointmentTypeReader.findMany).toHaveBeenCalledWith({
      where: { onlineBookable: true, visibleToPatient: true },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        requiredFields: true,
      },
      orderBy: { name: "asc" },
    });
    expect(result).toEqual([
      {
        id: "travel-vaccination",
        name: "Reiseimpfung",
        durationMinutes: 15,
        requiredFields: ["travelDestination", "travelDate"],
      },
    ]);
  });
});
