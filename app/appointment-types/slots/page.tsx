import Link from "next/link";
import { listAvailableSlots } from "@/lib/application/list-available-slots";

export const dynamic = "force-dynamic";

type SlotsPageProps = {
  searchParams: Promise<{ appointmentTypeId?: string | string[]; doctorId?: string | string[] }>;
};

function formatSlot(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export default async function SlotsPage({ searchParams }: SlotsPageProps) {
  const { appointmentTypeId, doctorId } = await searchParams;
  const selectedTypeId = typeof appointmentTypeId === "string" ? appointmentTypeId : undefined;
  const selectedDoctorId = typeof doctorId === "string" ? doctorId : undefined;
  const result = selectedTypeId && selectedDoctorId
    ? await listAvailableSlots(selectedTypeId, selectedDoctorId)
    : null;

  if (!result) {
    return (
      <main><section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Auswahl unvollständig</h1>
        <p className="intro">Bitte wählen Sie zuerst eine planbare Terminart und eine passende Ärztin oder einen passenden Arzt aus.</p>
        <p className="primary-link"><Link href="/appointment-types">Zur Terminart-Auswahl</Link></p>
      </section></main>
    );
  }

  return (
    <main><section>
      <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
      <h1>Mögliche Zeitfenster</h1>
      <p className="intro">{result.appointmentType.name} bei {result.doctor.name}. Die Auswahl eines Zeitfensters und eine Buchung folgen erst in einem späteren Schritt.</p>

      {result.slots.length > 0 ? (
        <ul className="slot-list">
          {result.slots.map((slot) => <li key={slot.startTime.toISOString()}>{formatSlot(slot.startTime)} Uhr</li>)}
        </ul>
      ) : (
        <p className="notice" role="status">Derzeit sind keine planbaren Zeitfenster verfügbar. Bitte wählen Sie eine andere Ärztin oder einen anderen Arzt.</p>
      )}

      <p className="back-link"><Link href={`/appointment-types/doctors?appointmentTypeId=${encodeURIComponent(selectedTypeId!)}`}>Ärzt:in ändern</Link></p>
    </section></main>
  );
}
