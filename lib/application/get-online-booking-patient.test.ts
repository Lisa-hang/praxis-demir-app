import { describe, expect, it, vi } from "vitest";
import { getOnlineBookingPatient } from "./get-online-booking-patient";

function reader(patient: unknown) {
  return { findUnique: vi.fn().mockResolvedValue(patient) };
}

describe("getOnlineBookingPatient", () => {
  it("returns only display data for an existing patient allowed to book online", async () => {
    const patientReader = reader({
      id: "patient-1", name: "Erika Muster", birthDate: new Date("1980-02-29T00:00:00.000Z"), onlineBookingAllowed: true,
    });

    await expect(getOnlineBookingPatient("patient-1", patientReader as never)).resolves.toEqual({
      id: "patient-1", name: "Erika Muster", birthDate: new Date("1980-02-29T00:00:00.000Z"),
    });
    expect(patientReader.findUnique).toHaveBeenCalledWith({
      where: { id: "patient-1" },
      select: { id: true, name: true, birthDate: true, onlineBookingAllowed: true },
    });
  });

  it("rejects an empty or unknown patient ID", async () => {
    const patientReader = reader(null);
    await expect(getOnlineBookingPatient("", patientReader as never)).resolves.toBeNull();
    expect(patientReader.findUnique).not.toHaveBeenCalled();
    await expect(getOnlineBookingPatient("unknown", patientReader as never)).resolves.toBeNull();
  });

  it("rejects a patient whose online booking is disabled", async () => {
    const patientReader = reader({
      id: "patient-1", name: "Erika Muster", birthDate: new Date("1980-02-29T00:00:00.000Z"), onlineBookingAllowed: false,
    });
    await expect(getOnlineBookingPatient("patient-1", patientReader as never)).resolves.toBeNull();
  });
});
