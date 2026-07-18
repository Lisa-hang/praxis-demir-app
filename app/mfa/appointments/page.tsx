import { listMfaOnlineAppointments } from "@/lib/application/list-mfa-online-appointments";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export default async function MfaAppointmentsPage() {
  const appointments = await listMfaOnlineAppointments();

  return (
    <main>
      <section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>MFA-Terminübersicht</h1>
        <p className="intro">Online gebuchte Termine, sortiert nach dem nächsten Termin.</p>

        {appointments.length === 0 ? (
          <p className="notice" role="status">Derzeit sind keine online gebuchten Termine vorhanden.</p>
        ) : (
          <div className="appointment-overview" role="region" aria-label="Online gebuchte Termine">
            <table>
              <thead>
                <tr>
                  <th scope="col">Datum und Uhrzeit</th>
                  <th scope="col">Patient:in</th>
                  <th scope="col">Terminart</th>
                  <th scope="col">Ärzt:in</th>
                  <th scope="col">Status</th>
                  <th scope="col">Quelle</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={`${appointment.startTime.toISOString()}-${appointment.patient.name}`}>
                    <td>{formatDateTime(appointment.startTime)} Uhr</td>
                    <td>{appointment.patient.name}</td>
                    <td>{appointment.appointmentType.name}</td>
                    <td>{appointment.doctor.name}</td>
                    <td>{appointment.status}</td>
                    <td>{appointment.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
