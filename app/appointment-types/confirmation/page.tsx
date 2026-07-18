import Link from "next/link";
import { db } from "@/lib/db";
import { getOnlineBookingPatient } from "@/lib/application/get-online-booking-patient";

export const dynamic = "force-dynamic";

type ConfirmationPageProps = { searchParams: Promise<{ patientId?: string | string[]; appointmentId?: string | string[] }> };
function singleValue(value: string | string[] | undefined) { return typeof value === "string" ? value : undefined; }
function formatSlot(date: Date) { return new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Berlin" }).format(date); }

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const patientId = singleValue(params.patientId);
  const appointmentId = singleValue(params.appointmentId);
  const patient = patientId ? await getOnlineBookingPatient(patientId) : null;
  const appointment = patient && appointmentId ? await db.appointment.findFirst({
    where: { id: appointmentId, patientId: patient.id, source: "online", status: "booked" },
    select: { startTime: true, appointmentType: { select: { name: true } }, doctor: { select: { name: true } } },
  }) : null;

  if (!patient || !appointment) return (
    <main><section>
      <p className="eyebrow">Praxis Demir &amp; Kollegen</p><h1>Bestätigung nicht verfügbar</h1>
      <p className="intro">Bitte wählen Sie einen Termin erneut aus oder erfassen Sie zunächst gültige Basisdaten.</p>
      <p className="primary-link"><Link href={patient ? `/appointment-types?patientId=${encodeURIComponent(patient.id)}` : "/patient-identification"}>Zur Auswahl</Link></p>
    </section></main>
  );

  return (
    <main><section>
      <p className="eyebrow">Praxis Demir &amp; Kollegen</p><h1>Termin verbindlich gebucht</h1>
      <p className="intro">Ihre Terminanfrage wurde gespeichert.</p>
      <dl className="selection-summary">
        <div><dt>Patient:in</dt><dd>{patient.name}</dd></div><div><dt>Terminart</dt><dd>{appointment.appointmentType.name}</dd></div>
        <div><dt>Ärzt:in</dt><dd>{appointment.doctor.name}</dd></div><div><dt>Datum und Uhrzeit</dt><dd>{formatSlot(appointment.startTime)} Uhr</dd></div>
      </dl>
    </section></main>
  );
}
