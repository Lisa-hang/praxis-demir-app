import Link from "next/link";
import { getOnlineBookingPatient } from "@/lib/application/get-online-booking-patient";
import { getSelectedSlotSummary } from "@/lib/application/get-selected-slot-summary";

export const dynamic = "force-dynamic";

type SummaryPageProps = {
  searchParams: Promise<{
    patientId?: string | string[];
    appointmentTypeId?: string | string[];
    doctorId?: string | string[];
    startTime?: string | string[];
  }>;
};

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function formatSlot(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  const params = await searchParams;
  const patientId = singleValue(params.patientId);
  const appointmentTypeId = singleValue(params.appointmentTypeId);
  const doctorId = singleValue(params.doctorId);
  const startTime = singleValue(params.startTime);
  const patient = patientId ? await getOnlineBookingPatient(patientId) : null;
  const summary = patient && appointmentTypeId && doctorId && startTime
    ? await getSelectedSlotSummary(appointmentTypeId, doctorId, startTime)
    : null;

  if (!patient) {
    return (
      <main><section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Basisdaten erforderlich</h1>
        <p className="intro">Bitte erfassen Sie zuerst gültige Basisdaten, bevor Sie fortfahren. Wenn Ihre Online-Buchung gesperrt ist, rufen Sie uns bitte an.</p>
        <p className="primary-link"><Link href="/patient-identification">Basisdaten erfassen</Link></p>
      </section></main>
    );
  }

  if (!summary) {
    return (
      <main><section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Auswahl nicht verfügbar</h1>
        <p className="intro">Das ausgewählte Zeitfenster ist unvollständig, ungültig oder inzwischen nicht mehr verfügbar. Bitte wählen Sie ein Zeitfenster erneut aus.</p>
        <p className="primary-link"><Link href={`/appointment-types?patientId=${encodeURIComponent(patient.id)}`}>Zur Terminart-Auswahl</Link></p>
      </section></main>
    );
  }

  return (
    <main><section>
      <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
      <h1>Ihre Auswahl</h1>
      <dl className="selection-summary">
        <div><dt>Patient:in</dt><dd>{patient.name}</dd></div>
        <div><dt>Terminart</dt><dd>{summary.appointmentType.name}</dd></div>
        <div><dt>Ärzt:in</dt><dd>{summary.doctor.name}</dd></div>
        <div><dt>Datum und Uhrzeit</dt><dd>{formatSlot(summary.startTime)} Uhr</dd></div>
      </dl>
      <p className="notice" role="status">Es wurde noch keine verbindliche Buchung gespeichert.</p>
      <p className="back-link"><Link href={`/appointment-types/slots?patientId=${encodeURIComponent(patient.id)}&appointmentTypeId=${encodeURIComponent(appointmentTypeId!)}&doctorId=${encodeURIComponent(doctorId!)}`}>Zeitfenster ändern</Link></p>
    </section></main>
  );
}
