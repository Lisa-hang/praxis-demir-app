import { listAvailableSlots } from "./list-available-slots";

type SlotLookup = typeof listAvailableSlots;

export type SelectedSlotSummary = {
  appointmentType: { name: string };
  doctor: { id: string; name: string };
  startTime: Date;
  endTime: Date;
};

/** Validates a selected public slot without reserving or storing anything. */
export async function getSelectedSlotSummary(
  appointmentTypeId: string,
  doctorId: string,
  startTimeValue: string,
  slotLookup: SlotLookup = listAvailableSlots,
): Promise<SelectedSlotSummary | null> {
  const startTime = new Date(startTimeValue);

  if (Number.isNaN(startTime.getTime()) || startTime.toISOString() !== startTimeValue) return null;

  const availableSlots = await slotLookup(appointmentTypeId, doctorId);
  const selectedSlot = availableSlots?.slots.find((slot) => slot.startTime.getTime() === startTime.getTime());

  if (!availableSlots || !selectedSlot) return null;

  return {
    appointmentType: availableSlots.appointmentType,
    doctor: availableSlots.doctor,
    startTime: selectedSlot.startTime,
    endTime: selectedSlot.endTime,
  };
}
