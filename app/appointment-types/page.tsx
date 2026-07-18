import Link from "next/link";
import { getOnlineBookingPatient } from "@/lib/application/get-online-booking-patient";
import { listOnlineAppointmentTypes } from "@/lib/application/list-online-appointment-types";
import { AppointmentTypeSelection } from "./appointment-type-selection";

export const dynamic = "force-dynamic";

type AppointmentTypesPageProps = {
  searchParams: Promise<{ patientId?: string | string[] }>;
};

export default async function AppointmentTypesPage({ searchParams }: AppointmentTypesPageProps) {
  const { patientId } = await searchParams;
  const selectedPatientId = typeof patientId === "string" ? patientId : undefined;
  const patient = selectedPatientId ? await getOnlineBookingPatient(selectedPatientId) : null;

  if (!patient) {
    return (
      <main><section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Basisdaten erforderlich</h1>
        <p className="intro">Bitte erfassen Sie zuerst gültige Basisdaten, bevor Sie eine Terminart auswählen. Wenn Ihre Online-Buchung gesperrt ist, rufen Sie uns bitte an.</p>
        <p className="primary-link"><Link href="/patient-identification">Basisdaten erfassen</Link></p>
      </section></main>
    );
  }

  const appointmentTypes = await listOnlineAppointmentTypes();

  return (
    <main>
      <section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Terminart auswählen</h1>
        <p className="intro">
          Wählen Sie eine planbare Terminart aus. In diesem Schritt wird noch kein Termin gebucht.
        </p>

        <AppointmentTypeSelection
          patientId={patient.id}
          appointmentTypes={appointmentTypes.map((appointmentType) => ({
            id: appointmentType.id,
            name: appointmentType.name,
            durationMinutes: appointmentType.durationMinutes,
            hasRequiredFields: Array.isArray(appointmentType.requiredFields) && appointmentType.requiredFields.length > 0,
          }))}
        />

        {appointmentTypes.length === 0 && (
          <p className="notice" role="status">Derzeit sind keine Terminarten online verfügbar.</p>
        )}

        <p className="back-link"><Link href="/">Zurück zur Startseite</Link></p>
      </section>
    </main>
  );
}
