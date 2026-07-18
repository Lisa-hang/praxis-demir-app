import Link from "next/link";
import { getSelectedSlotSummary } from "@/lib/application/get-selected-slot-summary";

export const dynamic = "force-dynamic";

type SummaryPageProps = {
  searchParams: Promise<{
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
  const appointmentTypeId = singleValue(params.appointmentTypeId);
  const doctorId = singleValue(params.doctorId);
  const startTime = singleValue(params.startTime);
  const summary = appointmentTypeId && doctorId && startTime
    ? await getSelectedSlotSummary(appointmentTypeId, doctorId, startTime)
    : null;

  if (!summary) {
    return (
      <main><section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Auswahl nicht verfügbar</h1>
        <p className="intro">Das ausgewählte Zeitfenster ist unvollständig, ungültig oder inzwischen nicht mehr verfügbar. Bitte wählen Sie ein Zeitfenster erneut aus.</p>
        <p className="primary-link"><Link href="/appointment-types">Zur Terminart-Auswahl</Link></p>
      </section></main>
    );
  }

  return (
    <main><section>
      <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
      <h1>Ihre Auswahl</h1>
      <dl className="selection-summary">
        <div><dt>Terminart</dt><dd>{summary.appointmentType.name}</dd></div>
        <div><dt>Ärzt:in</dt><dd>{summary.doctor.name}</dd></div>
        <div><dt>Datum und Uhrzeit</dt><dd>{formatSlot(summary.startTime)} Uhr</dd></div>
      </dl>
      <p className="notice" role="status">Es wurde noch keine verbindliche Buchung gespeichert.</p>
      <p className="back-link"><Link href={`/appointment-types/slots?appointmentTypeId=${encodeURIComponent(appointmentTypeId!)}&doctorId=${encodeURIComponent(doctorId!)}`}>Zeitfenster ändern</Link></p>
    </section></main>
  );
}
