# Architektur

## Ziel und Systemgrenze

Die Anwendung ist ein vorgelagertes Online-Portal für die Praxis Demir & Kollegen. V1 ermöglicht die Identifikation von Patient:innen und die Buchung, Verschiebung und Absage planbarer Termine. Turbomed bleibt das führende System für Patient:innen, Termine, Rezepte und medizinische Dokumentation.

Die App speichert ausschließlich notwendige Prozessdaten für Buchung, Verfügbarkeit, Anfrage und Kommunikation. Diagnosen, Befunde, Laborwerte, Krankengeschichte und andere medizinische Dokumentation liegen außerhalb der Systemgrenze.

## Logischer Aufbau

Das technische Grundgerüst verwendet Next.js mit App Router und TypeScript. Prisma bildet den Persistenzzugriff auf SQLite ab. Diese lokale, dateibasierte Datenbank ist für das Grundgerüst und den zunächst begrenzten Betrieb festgelegt; Hosting und Betriebsmodell bleiben vor einem Produktivbetrieb zu klären.

Die Anwendung wird in klar getrennte Verantwortungsbereiche gegliedert:

1. **Oberflächen:** Patientenportal und geschützter interner Bereich für MFA, Ärzt:innen und Admins.
2. **Anwendungsfälle:** Identifizieren, Slots suchen, buchen, verschieben, absagen, Zeiten sperren und Daten an Turbomed übergeben.
3. **Domäne:** Entitäten und zentrale Regeln aus `docs/spec.md`; diese Regeln sind unabhängig von UI und Integrationen testbar.
4. **Persistenz und Integrationen:** Datenbankzugriff sowie austauschbare Adapter für Turbomed und spätere Kommunikationsdienste.

Externe Systeme dürfen nur über definierte Adapter angesprochen werden. Dadurch kann die noch offene Turbomed-Übergabe gewählt oder geändert werden, ohne Buchungsregeln umzubauen.

## V1-Domänenmodell

- `Patient` identifiziert Buchende, enthält Kommunikationszustimmungen, No-Show-Zähler und die Online-Buchungsfreigabe.
- `StaffUser` repräsentiert MFA, Ärzt:innen und Admins. Ärzt:innen sind keine separate Hauptentität.
- `AppointmentType` beschreibt Terminart, feste Dauer, Sichtbarkeit und Pflichtfelder.
- `AppointmentTypeAssignment` bildet die pflegbare n:m-Zuordnung zwischen Ärzt:innen und Terminarten ab.
- `Appointment` verbindet Patient:in, Terminart, Ärzt:in, Zeitraum, Status und Quelle.
- `AvailabilityBlock` beschreibt reguläre Verfügbarkeit und Sperrzeiten einschließlich interner `acute_block`-Zeiten.

`PrescriptionRequest`, `WaitlistEntry` und `Notification` folgen in späteren Phasen und werden nicht für den V1-Buchungskern vorausgesetzt.

Das initiale Prisma-Schema bildet ausschließlich diese sechs V1-Kernmodelle ab. Listenartige Metadaten wie Fachgebiete und Pflichtfelder werden in SQLite als strukturierte JSON-Werte gespeichert. Eine öffentliche Erfassungsseite nimmt die Basisdaten von Patient:innen entgegen. Eine Server Action übergibt sie an einen Anwendungsfall, der die unabhängig testbare Identifikationsregel anwendet, Eingaben normalisiert und Patient:innen über Prisma in SQLite speichert. Dies ist noch kein Turbomed-Abgleich und erlaubt noch keine Buchung.

## Zentrale Abläufe

### Freie Slots ermitteln

Ein Slot ist nur verfügbar, wenn die Terminart online buchbar und der Ärztin beziehungsweise dem Arzt aktiv zugeordnet ist, in die Sprechzeit passt und weder mit einem aktiven Termin noch mit einer Sperrzeit kollidiert. `acute_block` wird wie eine Sperrzeit behandelt und niemals Patient:innen angezeigt.

### Buchen

Die Anwendung identifiziert zuerst die Patientin oder den Patienten, prüft `onlineBookingAllowed`, Pflichtfelder, Terminart, Zuordnung und Verfügbarkeit und legt anschließend den Termin atomar an. Ein Datenbankmechanismus beziehungsweise eine gleichwertige Nebenläufigkeitskontrolle muss verhindern, dass zwei Anfragen denselben Arztzeitraum buchen.

Nach erfolgreicher lokaler Buchung wird die Übergabe an Turbomed nachvollziehbar angestoßen. Die konkrete Transportform bleibt bis zur Schnittstellenklärung offen; Fehler dürfen nicht unbemerkt bleiben oder zu einer zweiten Buchung führen.

Die Zusammenfassung bleibt bis zum ausdrücklichen Klick rein lesend. Erst die Server Action führt die vollständige Prüfung innerhalb einer Prisma-Transaktion erneut aus und speichert `Appointment.status = booked` sowie `Appointment.source = online`. SQLite-Trigger verweigern als zweite Schutzschicht das Einfügen oder Aktivieren überlappender Termine derselben Ärztin beziehungsweise desselben Arztes. Ein dadurch abgewiesener Termin wird nicht gespeichert und zur erneuten Auswahl zurückgeleitet. Der Schritt versendet keine Benachrichtigung und löst keine Turbomed-Übergabe aus.

### Verschieben und absagen

Verschieben ist online nur mindestens 48 Stunden, Absagen nur mindestens 24 Stunden vor Terminbeginn erlaubt. Beim Verschieben werden erneute Verfügbarkeitsprüfung, neue Reservierung und Freigabe des alten Slots konsistent ausgeführt.

## Berechtigungen und Datenschutz

- Patient:innen greifen nur auf eigene Vorgänge und öffentlich freigegebene Slots zu.
- MFA verwalten Termine und Sperrzeiten, geben aber keine Rezepte frei.
- Ärzt:innen dürfen spätere Rezeptanfragen prüfen und freigeben.
- Admins pflegen Terminarten, Zuordnungen und Verfügbarkeiten.
- Berechtigungen werden serverseitig pro Anwendungsfall geprüft.
- Es gilt Datenminimierung; sensible Aktionen und Integrationsfehler müssen nachvollziehbar protokolliert werden, ohne medizinische Inhalte in Logs abzulegen.
- Konkrete Anforderungen an Betrieb, Verschlüsselung, Aufbewahrung und Löschung sind vor Produktivbetrieb festzulegen.

## Qualitätsanforderungen

- Zeitberechnungen verwenden eine explizite Praxis-Zeitzone und klar definierte Zeitpunkte.
- Kritische Zustandsänderungen sind transaktional und idempotent, soweit externe Übergaben beteiligt sind.
- Geschäftsregeln erhalten automatisierte Unit- und Integrationstests.
- Monitoring macht fehlgeschlagene Turbomed-Übergaben und technische Buchungsfehler für zuständige Mitarbeitende sichtbar.

## Aktueller Implementierungsstand

- Next.js-Grundgerüst mit App Router, TypeScript und einer informierenden Startseite
- Prisma-Schema und initiale SQLite-Migration für die sechs V1-Kernmodelle
- wiederholbar ausführbarer Seed für die vier Terminarten, drei Ärzt:innen und die festgelegten Impfzuordnungen
- Vitest als Testgrundlage mit ersten Tests der Patient:innen-Identifikationsregel
- öffentliche Erfassung von Patient:innen-Basisdaten mit versicherungsabhängiger Identifikationsnummer und Prisma-Persistenz
- öffentliche Auswahlseite für online buchbare und sichtbare Terminarten; sie liest die Seed-Daten über einen Anwendungsfall, speichert noch keine Auswahl und ermittelt keine Slots
- öffentliche Ärzt:innen-Auswahlseite nach Terminart; sie liest ausschließlich aktive `AppointmentTypeAssignment`-Zuordnungen zu aktiven `StaffUser` mit `role = doctor` und ermittelt weder Slots noch Uhrzeiten oder Buchungen
- noch keine Authentifizierung, Slot-Ermittlung, Buchung oder interne Verwaltungsoberfläche

- Öffentliche Zeitfensterseite nach Terminart und Ärzt:in: Der lesende Anwendungsfall erzeugt aus sichtbaren regulären `AvailabilityBlock`-Zeiten dauerbasierte Slots und schließt bestehende Termine sowie nicht reguläre, arztbezogene oder globale Sperrblöcke aus. Er erstellt keine Reservierung oder Buchung.
- Öffentlicher, rein lesender Termin-Auswahlfluss nach der Basisdatenerfassung: Ausschließlich die `patientId` wird zusammen mit Terminart-ID, Ärzt:innen-ID und ISO-Startzeit als URL-Parameter weitergegeben. Jede Auswahlseite lädt die Patient:in serverseitig über Prisma erneut und lässt nur existierende Patient:innen mit `onlineBookingAllowed = true` weiter; die Zusammenfassung zeigt ihren Namen sowie die weiterhin serverseitig validierte Auswahl. Sie speichert oder reserviert nichts.

## Noch offene Architekturfragen

- Hosting und Betriebsmodell
- Turbomed-Transport, Minimaldatensatz und Abgleich der Patient:innen-IDs
- Quelle und Pflege der Sprechzeiten
- Kommunikationsanbieter und Einwilligungsnachweis
- Ablage von Reiseziel und Reisedatum im V1-Datenmodell
- Betriebs-, Datenschutz-, Aufbewahrungs- und Löschkonzept
