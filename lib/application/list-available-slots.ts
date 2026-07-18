import { AppointmentStatus } from "@prisma/client";
import { db } from "../db";

type SlotReader = Pick<typeof db, "appointmentType" | "availabilityBlock" | "appointment">;

export type AvailableSlot = {
  startTime: Date;
  endTime: Date;
};

/** Lists possible slots without identifying patients, reserving time, or creating appointments. */
export async function listAvailableSlots(
  appointmentTypeId: string,
  doctorId: string,
  now: Date = new Date(),
  slotReader: SlotReader = db,
) {
  const appointmentType = await slotReader.appointmentType.findFirst({
    where: {
      id: appointmentTypeId,
      onlineBookable: true,
      visibleToPatient: true,
      assignments: {
        some: {
          staffUserId: doctorId,
          active: true,
          staffUser: { role: "doctor", active: true },
        },
      },
    },
    select: {
      name: true,
      durationMinutes: true,
      assignments: {
        where: {
          staffUserId: doctorId,
          active: true,
          staffUser: { role: "doctor", active: true },
        },
        select: { staffUser: { select: { id: true, name: true } } },
      },
    },
  });

  const doctor = appointmentType?.assignments[0]?.staffUser;
  if (!appointmentType || !doctor) return null;

  const [regularBlocks, blockingBlocks, appointments] = await Promise.all([
    slotReader.availabilityBlock.findMany({
      where: {
        staffUserId: doctorId,
        type: "regular",
        visibleToPatient: true,
        endTime: { gt: now },
      },
      select: { startTime: true, endTime: true },
      orderBy: { startTime: "asc" },
    }),
    slotReader.availabilityBlock.findMany({
      where: {
        type: { not: "regular" },
        endTime: { gt: now },
        OR: [{ staffUserId: doctorId }, { staffUserId: null }],
      },
      select: { startTime: true, endTime: true },
    }),
    slotReader.appointment.findMany({
      where: {
        doctorStaffUserId: doctorId,
        status: { in: [AppointmentStatus.booked, AppointmentStatus.rescheduled, AppointmentStatus.blocked] },
        endTime: { gt: now },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  const conflicts = [...blockingBlocks, ...appointments];
  const slots = regularBlocks.flatMap((block) => createSlots(block, appointmentType.durationMinutes, now))
    .filter((slot) => !conflicts.some((conflict) => overlaps(slot, conflict)));

  return { appointmentType: { name: appointmentType.name }, doctor, slots };
}

function createSlots(
  block: { startTime: Date; endTime: Date },
  durationMinutes: number,
  now: Date,
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const durationMilliseconds = durationMinutes * 60_000;

  for (let start = block.startTime.getTime(); start + durationMilliseconds <= block.endTime.getTime(); start += durationMilliseconds) {
    const startTime = new Date(start);
    const endTime = new Date(start + durationMilliseconds);
    if (startTime >= now) slots.push({ startTime, endTime });
  }

  return slots;
}

function overlaps(slot: AvailableSlot, period: { startTime: Date; endTime: Date }) {
  return slot.startTime < period.endTime && period.startTime < slot.endTime;
}
