import { describe, expect, it, vi } from "vitest";
import { getSelectedSlotSummary } from "./get-selected-slot-summary";

const selectedStartTime = "2026-07-20T09:00:00.000Z";

describe("getSelectedSlotSummary", () => {
  it("returns a currently available selected slot without storing it", async () => {
    const lookup = vi.fn().mockResolvedValue({
      appointmentType: { name: "Beratung" },
      doctor: { id: "demir", name: "Dr. Demir" },
      slots: [{ startTime: new Date(selectedStartTime), endTime: new Date("2026-07-20T09:20:00.000Z") }],
    });

    await expect(getSelectedSlotSummary("consultation", "demir", selectedStartTime, lookup as never)).resolves.toEqual({
      appointmentType: { name: "Beratung" },
      doctor: { id: "demir", name: "Dr. Demir" },
      startTime: new Date(selectedStartTime),
      endTime: new Date("2026-07-20T09:20:00.000Z"),
    });
    expect(lookup).toHaveBeenCalledWith("consultation", "demir");
  });

  it("rejects an invalid timestamp before looking up slots", async () => {
    const lookup = vi.fn();

    await expect(getSelectedSlotSummary("consultation", "demir", "tomorrow", lookup as never)).resolves.toBeNull();
    expect(lookup).not.toHaveBeenCalled();
  });

  it("rejects a slot that is no longer available", async () => {
    const lookup = vi.fn().mockResolvedValue({
      appointmentType: { name: "Beratung" },
      doctor: { id: "demir", name: "Dr. Demir" },
      slots: [],
    });

    await expect(getSelectedSlotSummary("consultation", "demir", selectedStartTime, lookup as never)).resolves.toBeNull();
  });
});
