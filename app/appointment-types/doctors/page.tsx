import Link from "next/link";
import { getOnlineBookingPatient } from "@/lib/application/get-online-booking-patient";
import { listEligibleDoctorsForAppointmentType } from "@/lib/application/list-eligible-doctors-for-appointment-type";

export const dynamic = "force-dynamic";

type DoctorsPageProps = {
  searchParams: Promise<{ patientId?: string | string[]; appointmentTypeId?: string | string[] }>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const { patientId, appointmentTypeId } = await searchParams;
  const selectedPatientId = typeof patientId === "string" ? patientId : undefined;
  const selectedId = typeof appointmentTypeId === "string" ? appointmentTypeId : undefined;
  const patient = selectedPatientId ? await getOnlineBookingPatient(selectedPatientId) : null;
  const appointmentType = selectedId
    ? await listEligibleDoctorsForAppointmentType(selectedId)
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

  if (!appointmentType) {
    return (
      <main><section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Terminart auswählen</h1>
        <p className="intro">Bitte wählen Sie zuerst eine planbare Terminart aus, damit wir passende Ärzt:innen anzeigen können.</p>
        <p className="primary-link"><Link href={`/appointment-types?patientId=${encodeURIComponent(patient.id)}`}>Zur Terminart-Auswahl</Link></p>
      </section></main>
    );
  }

  return (
    <main><section>
      <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
      <h1>Passende Ärzt:innen</h1>
      <p className="intro">Wählen Sie eine Ärztin oder einen Arzt aus, um mögliche Zeitfenster für {appointmentType.name} zu sehen.</p>

      {appointmentType.assignments.length > 0 ? (
        <ul className="doctor-list">
          {appointmentType.assignments.map(({ staffUser }) => (
            <li key={staffUser.id}>
              <Link href={`/appointment-types/slots?patientId=${encodeURIComponent(patient.id)}&appointmentTypeId=${encodeURIComponent(selectedId!)}&doctorId=${encodeURIComponent(staffUser.id)}`}>
                {staffUser.name}: Zeitfenster anzeigen
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="notice" role="status">Für diese Terminart ist derzeit keine Ärztin und kein Arzt zugeordnet.</p>
      )}

      <p className="back-link"><Link href={`/appointment-types?patientId=${encodeURIComponent(patient.id)}`}>Terminart ändern</Link></p>
    </section></main>
  );
}
