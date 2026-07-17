# Architektur

## Ziel und Systemgrenze

Die Anwendung ist ein vorgelagertes Online-Portal für die Praxis Demir & Kollegen. V1 ermöglicht die Identifikation von Patient:innen und die Buchung, Verschiebung und Absage planbarer Termine. Turbomed bleibt das führende System für Patient:innen, Termine, Rezepte und medizinische Dokumentation.

Die App speichert ausschließlich notwendige Prozessdaten für Buchung, Verfügbarkeit, Anfrage und Kommunikation. Diagnosen, Befunde, Laborwerte, Krankengeschichte und andere medizinische Dokumentation liegen außerhalb der Systemgrenze.

## Logischer Aufbau

Die konkrete Technologie ist noch nicht festgelegt. Unabhängig davon wird die Anwendung in klar getrennte Verantwortungsbereiche gegliedert:

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

## Zentrale Abläufe

### Freie Slots ermitteln

Ein Slot ist nur verfügbar, wenn die Terminart online buchbar und der Ärztin beziehungsweise dem Arzt aktiv zugeordnet ist, in die Sprechzeit passt und weder mit einem aktiven Termin noch mit einer Sperrzeit kollidiert. `acute_block` wird wie eine Sperrzeit behandelt und niemals Patient:innen angezeigt.

### Buchen

Die Anwendung identifiziert zuerst die Patientin oder den Patienten, prüft `onlineBookingAllowed`, Pflichtfelder, Terminart, Zuordnung und Verfügbarkeit und legt anschließend den Termin atomar an. Ein Datenbankmechanismus beziehungsweise eine gleichwertige Nebenläufigkeitskontrolle muss verhindern, dass zwei Anfragen denselben Arztzeitraum buchen.

Nach erfolgreicher lokaler Buchung wird die Übergabe an Turbomed nachvollziehbar angestoßen. Die konkrete Transportform bleibt bis zur Schnittstellenklärung offen; Fehler dürfen nicht unbemerkt bleiben oder zu einer zweiten Buchung führen.

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

## Noch offene Architekturfragen

- Technologie-Stack, Hosting und Datenbank
- Turbomed-Transport, Minimaldatensatz und Abgleich der Patient:innen-IDs
- Quelle und Pflege der Sprechzeiten
- Kommunikationsanbieter und Einwilligungsnachweis
- Betriebs-, Datenschutz-, Aufbewahrungs- und Löschkonzept

