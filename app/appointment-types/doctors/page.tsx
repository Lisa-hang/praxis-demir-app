import Link from "next/link";
import { listEligibleDoctorsForAppointmentType } from "@/lib/application/list-eligible-doctors-for-appointment-type";

export const dynamic = "force-dynamic";

type DoctorsPageProps = {
  searchParams: Promise<{ appointmentTypeId?: string | string[] }>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const { appointmentTypeId } = await searchParams;
  const selectedId = typeof appointmentTypeId === "string" ? appointmentTypeId : undefined;
  const appointmentType = selectedId
    ? await listEligibleDoctorsForAppointmentType(selectedId)
    : null;

  if (!appointmentType) {
    return (
      <main>
        <section>
          <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
          <h1>Terminart auswählen</h1>
          <p className="intro">
            Bitte wählen Sie zuerst eine planbare Terminart aus, damit wir passende Ärzt:innen anzeigen können.
          </p>
          <p className="primary-link"><Link href="/appointment-types">Zur Terminart-Auswahl</Link></p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Passende Ärzt:innen</h1>
        <p className="intro">
          Diese Ärzt:innen dürfen {appointmentType.name} übernehmen. Es werden noch keine Termine oder Uhrzeiten angezeigt.
        </p>

        {appointmentType.assignments.length > 0 ? (
          <ul className="doctor-list">
            {appointmentType.assignments.map(({ staffUser }) => <li key={staffUser.id}>{staffUser.name}</li>)}
          </ul>
        ) : (
          <p className="notice" role="status">Für diese Terminart ist derzeit keine Ärztin und kein Arzt zugeordnet.</p>
        )}

        <p className="back-link"><Link href="/appointment-types">Terminart ändern</Link></p>
      </section>
    </main>
  );
}
