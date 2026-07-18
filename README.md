# Praxis Demir & Kollegen – Online-Terminportal

Lokale Webanwendung für die Online-Terminbuchung der Praxis Demir & Kollegen. Sie ist als vorgelagertes Portal konzipiert: Turbomed bleibt das führende Praxisverwaltungssystem. Die Anwendung speichert ausschließlich notwendige Prozessdaten für Buchungen und keine medizinische Dokumentation.

## Kontext

Die Praxis Demir & Kollegen möchte planbare Termine online anbieten, um die telefonische Terminbearbeitung zu entlasten. Akute Beschwerden werden weiterhin telefonisch oder persönlich durch das Praxisteam eingeschätzt; die Anwendung führt keine medizinische Dringlichkeitsbewertung durch.

## Tech Stack

- Next.js 16 mit App Router und React 19
- TypeScript
- Prisma ORM
- SQLite (lokale Datei-Datenbank)
- Vitest
- ESLint

## Lokales Setup

Voraussetzung sind eine aktuelle Node.js- und npm-Installation.

1. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

2. Eine `.env`-Datei im Projektstamm anlegen. Sie muss folgende Datenbankverbindung enthalten:

   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Datenbank und Prisma-Client erzeugen:

   ```bash
   npx prisma migrate dev
   ```

4. Beispieldaten einspielen:

   ```bash
   npm run db:seed
   ```

5. Entwicklungsserver starten:

   ```bash
   npm run dev
   ```

Die Anwendung ist anschließend lokal erreichbar. Es handelt sich um eine lokale SQLite-App; ein Deployment ist für die Abgabe nicht erforderlich.

## Qualitätssicherung

```bash
npm test
npm run lint
npm run build
```

## Umgesetzte Features

- Erfassung von Patient:innen-Basisdaten mit versicherungsabhängiger Identifikation: Versichertennummer für gesetzlich Versicherte, Praxis-Patientennummer für privat Versicherte und Selbstzahlende.
- Auswahl der vier online buchbaren Terminarten: Vorsorge, Beratung, Standardimpfung und Reiseimpfung.
- Pflegbare Zuordnung von Terminarten zu Ärzt:innen; Reiseimpfungen sind initial nur Dr. Demir zugeordnet.
- Anzeige freier Zeitfenster auf Grundlage sichtbarer regulärer Sprechzeiten, Termindauer, bestehender Termine und Sperrzeiten.
- Berücksichtigung von globalen und arztbezogenen Blockierungen einschließlich interner Akutblockierungen, die Patient:innen nicht sehen.
- Verbindliche Online-Buchung erst nach ausdrücklicher Bestätigung mit erneuter serverseitiger Prüfung.
- Atomarer Schutz gegen überlappende Termine derselben Ärztin beziehungsweise desselben Arztes durch Transaktion und SQLite-Trigger.
- Rein lesende MFA-Übersicht für online gebuchte Termine unter `/mfa/appointments`.
- Automatisierte Tests für zentrale Identifikations-, Auswahl-, Verfügbarkeits- und Buchungsregeln.

## Bewusst nicht umgesetzt / Grenzen

- Keine Authentifizierung, Rollenprüfung oder schreibende interne MFA-Verwaltung.
- Keine Online-Verschiebung oder -Absage von Terminen.
- Keine Turbomed-Integration oder Exportfunktion; Schnittstelle, Minimaldatensatz und Abgleich sind noch zu klären.
- Reiseziel und Reisedatum für Reiseimpfungen werden noch nicht erfasst oder gespeichert, weil die fachliche Ablageentscheidung offen ist.
- Keine Wiederholungsrezept-Anfragen, Warteliste, Benachrichtigungen, Kommunikationskanäle oder No-Show-Automatik.
- Kein Produktivbetriebs-, Datenschutz-, Aufbewahrungs- oder Löschkonzept.
- Keine Speicherung von Diagnosen, Befunden, Laborwerten, Krankengeschichte oder sonstiger medizinischer Dokumentation.

## KI-Unterstützung

Verwendetes KI-Tool und Modell: OpenAI Codex, `gpt-5.6-terra medium`.
