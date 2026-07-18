import { AppointmentSource, AppointmentStatus } from "@prisma/client";
import { db } from "../db";
import { getOnlineBookingPatient } from "./get-online-booking-patient";
import { getSelectedSlotSummary, type SelectedSlotSummary } from "./get-selected-slot-summary";
import { listAvailableSlots } from "./list-available-slots";

type BookingTransaction = Pick<typeof db, "patient" | "appointmentType" | "availabilityBlock" | "appointment">;
type BookingDatabase = { $transaction<T>(operation: (transaction: BookingTransaction) => Promise<T>): Promise<T> };
type SelectedSlotLookup = (
  appointmentTypeId: string,
  doctorId: string,
  startTime: string,
  slotLookup: (appointmentTypeId: string, doctorId: string) => Promise<Awaited<ReturnType<typeof listAvailableSlots>>>,
) => Promise<SelectedSlotSummary | null>;

export type OnlineAppointmentInput = { patientId: string; appointmentTypeId: string; doctorId: string; startTime: string };
export type CreateOnlineAppointmentResult =
  | { success: true; appointmentId: string }
  | { success: false; reason: "invalid_selection" | "unavailable" };

/** Revalidates a public selection and stores it only after explicit confirmation. */
export async function createOnlineAppointment(
  input: OnlineAppointmentInput,
  bookingDatabase: BookingDatabase = db as unknown as BookingDatabase,
  selectedSlotLookup: SelectedSlotLookup = getSelectedSlotSummary,
): Promise<CreateOnlineAppointmentResult> {
  try {
    return await bookingDatabase.$transaction(async (transaction) => {
      const patient = await getOnlineBookingPatient(input.patientId, transaction.patient);
      if (!patient) return { success: false, reason: "invalid_selection" } as const;

      const summary = await selectedSlotLookup(
        input.appointmentTypeId,
        input.doctorId,
        input.startTime,
        (appointmentTypeId, doctorId) => listAvailableSlots(appointmentTypeId, doctorId, new Date(), transaction),
      );
      if (!summary) return { success: false, reason: "unavailable" } as const;

      const appointment = await transaction.appointment.create({
        data: {
          patientId: patient.id,
          appointmentTypeId: input.appointmentTypeId,
          doctorStaffUserId: input.doctorId,
          startTime: summary.startTime,
          endTime: summary.endTime,
          status: AppointmentStatus.booked,
          source: AppointmentSource.online,
        },
        select: { id: true },
      });
      return { success: true, appointmentId: appointment.id } as const;
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("appointment_overlap")) {
      return { success: false, reason: "unavailable" };
    }
    throw error;
  }
}
