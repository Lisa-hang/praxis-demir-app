# Kalibrierung

## 1. Versicherungsabhängige Identifikation

- **Aussage:** Gesetzlich Versicherte benötigen eine Versichertennummer; Privat- und Selbstzahlende benötigen eine Praxis-Patientennummer. Ohne passende Nummer wird keine Patient:in gespeichert.
- **Konfidenz:** 9/10
- **Wie geprüft?** Domänenregel in `lib/domain/patient-identification.ts`; Durchsetzung in `lib/application/create-patient.ts`; Tests in `lib/domain/patient-identification.test.ts` und `lib/application/create-patient.test.ts`.

## 2. Verbindliche Online-Buchung und Doppelbuchungsschutz

- **Aussage:** Eine Online-Buchung wird erst nach expliziter Bestätigung gespeichert; vor dem Speichern werden Patient:in und Zeitfenster innerhalb einer Transaktion erneut validiert. Überlappende aktive Termine derselben Ärztin beziehungsweise desselben Arztes werden als nicht verfügbar behandelt.
- **Konfidenz:** 9/10
- **Wie geprüft?** `lib/application/create-online-appointment.ts` und zugehöriger Test; SQLite-Trigger in `prisma/migrations/20260718110000_prevent_appointment_overlaps/migration.sql`; Bestätigungsformular in `app/appointment-types/summary/page.tsx`.

## 3. Pflegbare n:m-Zuordnung von Terminarten und Ärzt:innen

- **Aussage:** `AppointmentTypeAssignment` modelliert die pflegbare n:m-Beziehung zwischen Terminarten und `StaffUser` als Ärzt:innen; die Kombination aus Terminart und StaffUser ist eindeutig.
- **Konfidenz:** 10/10
- **Wie geprüft?** `prisma/schema.prisma` mit Relationen und `@@unique([appointmentTypeId, staffUserId])`; Beispielzuordnungen im `prisma/seed.ts`; Abfrage aktiver Arzt-Zuordnungen in `lib/application/list-eligible-doctors-for-appointment-type.ts` samt Test.

## 4. Offene Entscheidung zu Reisedaten

- **Aussage:** Für Reiseziel und Reisedatum bei Reiseimpfungen ist noch nicht entschieden, an welchem V1-Kernobjekt die Daten gespeichert werden; deshalb werden sie im aktuellen Buchungsablauf nicht erfasst oder persistiert.
- **Konfidenz:** 9/10
- **Wie geprüft?** Offene Entscheidung O-007 in `docs/decisions.md` und Backlog-Markierung `[?]` in `docs/backlog.md`; keine entsprechenden Felder in `prisma/schema.prisma` oder `OnlineAppointmentInput` in `lib/application/create-online-appointment.ts`.

## 5. Rein lesende MFA-Terminübersicht

- **Aussage:** Die MFA-Übersicht unter `/mfa/appointments` ist rein lesend, zeigt ausschließlich online angelegte Termine nach Beginn sortiert und enthält derzeit keine Authentifizierung.
- **Konfidenz:** 9/10
- **Wie geprüft?** `app/mfa/appointments/page.tsx`; Abfrage in `lib/application/list-mfa-online-appointments.ts` und Test; Statusbeschreibung in `docs/backlog.md`.
