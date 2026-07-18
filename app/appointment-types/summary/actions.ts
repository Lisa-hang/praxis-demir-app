"use server";

import { redirect } from "next/navigation";
import { createOnlineAppointment } from "@/lib/application/create-online-appointment";

export async function submitOnlineAppointment(formData: FormData) {
  const value = (name: string) => String(formData.get(name) ?? "");
  const input = { patientId: value("patientId"), appointmentTypeId: value("appointmentTypeId"), doctorId: value("doctorId"), startTime: value("startTime") };
  const result = await createOnlineAppointment(input);
  const params = new URLSearchParams(input);
  if (result.success) {
    params.set("appointmentId", result.appointmentId);
    redirect(`/appointment-types/confirmation?${params.toString()}`);
  }
  params.set("bookingError", result.reason);
  redirect(`/appointment-types/summary?${params.toString()}`);
}
