import Link from "next/link";
import { listOnlineAppointmentTypes } from "@/lib/application/list-online-appointment-types";
import { AppointmentTypeSelection } from "./appointment-type-selection";

export const dynamic = "force-dynamic";

export default async function AppointmentTypesPage() {
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
