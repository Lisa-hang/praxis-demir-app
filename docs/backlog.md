# Backlog

Grundlage dieses Backlogs ist `docs/spec.md`. Es wird von oben nach unten bearbeitet. Ein Eintrag gilt erst als erledigt, wenn Implementierung, Tests und betroffene Dokumentation aktualisiert sind.

Status: `[ ]` offen · `[~]` in Arbeit · `[x]` erledigt · `[?]` Klärung nötig

## Jetzt: V1-Kernmodell und Online-Buchung

- [x] Technisches Grundgerüst mit Next.js, TypeScript, Prisma, SQLite, initialer Migration, Seed, Testkonfiguration und Startseite anlegen.
- [~] Patient:innen-Identifikation umsetzen: Basisdaten werden gesetzlich über Versichertennummer und privat/selbstzahlend über Praxis-Patientennummer erfasst; der eindeutige Turbomed-Abgleich vor einer Buchung ist noch offen.
- [ ] `StaffUser` mit den Rollen `mfa`, `doctor` und `admin` einschließlich Berechtigungsprüfungen umsetzen.
- [x] `AppointmentType` mit festen V1-Dauern anlegen: Vorsorge 30, Beratung 20, Standardimpfung 15 und Reiseimpfung 15 Minuten; online sichtbare Terminarten können im Patientenportal ausgewählt werden, ohne bereits eine Buchung anzulegen.
- [ ] Pflegbare `AppointmentTypeAssignment` zwischen Terminarten und Ärzt:innen umsetzen; Reiseimpfung nur Dr. Demir, Standardimpfung alle drei Ärzt:innen.
- [ ] Sprechzeiten und `AvailabilityBlock` für reguläre Zeiten, Urlaub, Fortbildung, Krankheit, Praxisschließung und `acute_block` modellieren.
- [ ] Slot-Ermittlung implementieren: Arzt-Zuordnung, Dauer, bestehende Termine und sämtliche Blockierungen konfliktfrei berücksichtigen; interne Akutzeiten nie öffentlich anzeigen.
- [ ] Online-Buchungsablauf für die vier freigegebenen Terminarten implementieren; Reiseziel und Reisedatum bei Reiseimpfung verpflichtend erfassen.
- [?] Festlegen, an welchem V1-Kernobjekt Reiseziel und Reisedatum gespeichert werden; die Spec fordert beide Werte, führt sie aber in keinem Entitätsmodell als Attribute auf.
- [ ] Gleichzeitige Buchungen sicher behandeln und Doppelbuchungen atomar verhindern.
- [ ] Online-Verschiebung nur bis 48 Stunden vor Beginn umsetzen; alten Slot und neue Buchung konsistent in einer Transaktion ändern.
- [ ] Online-Absage nur bis 24 Stunden vor Beginn umsetzen; danach auf telefonischen Kontakt verweisen.
- [ ] MFA-Verwaltung für Anlegen, Verschieben, Absagen sowie kurzfristiges Sperren betroffener Slots bereitstellen.
- [ ] Rollen- und Regeltests für alle V1-Abläufe ergänzen.

## V1-Integration vor Produktionsbetrieb

- [?] Verfügbare Turbomed-Schnittstelle klären: API, HL7 oder definierter Export.
- [?] Minimalen Übergabedatensatz, Identifikatoren, Fehlerbehandlung und Verantwortlichkeit bei fehlgeschlagenen Übertragungen festlegen.
- [ ] Entkoppelte Turbomed-Übergabe hinter einem Adapter implementieren; Buchungen müssen nachvollziehbar exportiert beziehungsweise übertragen werden können.
- [?] Festlegen, ob Sprechzeiten in V1 direkt in der App gepflegt oder aus einem bestehenden Kalender übernommen werden.
- [ ] Datenschutz-, Berechtigungs-, Protokollierungs-, Aufbewahrungs- und Löschkonzept vor Produktivbetrieb fachlich/rechtlich prüfen.

## Danach: Phase 2 – Anfrage-Workflows

- [ ] Wiederholungsrezept-Anfragen mit ausschließlich ärztlicher Freigabe umsetzen.
- [ ] Warteliste nach Anfragezeit und Passung umsetzen, ohne automatische Dringlichkeitsbewertung.
- [ ] Benachrichtigungen und Telefonliste einführen; Kanalwahl an Kommunikationszustimmung binden.
- [?] Technische Kommunikationskanäle und Einwilligungsprozess festlegen.

## Später: Phase 3 – Komfort und Sonderfälle

- [ ] No-Show-Zählung für zwölf Monate, Brief nach zwei Fällen und manuell aufhebbare Buchungssperre ab dem dritten Fall umsetzen.
- [ ] Wartelistenangebote mit vier Stunden Annahmefrist automatisieren.
- [ ] Benachrichtigungsprozess bei Arztausfall einschließlich Telefonliste umsetzen.
- [ ] Turbomed-Integration nach Praxiserfahrung zur stabilen Schnittstelle ausbauen.
