# Entscheidungen

Dieses Dokument hält richtungsweisende Entscheidungen knapp fest. Neue Einträge werden ergänzt, sobald eine offene Frage geklärt ist; bestehende Einträge werden nicht stillschweigend überschrieben.

## D-001 – SOLO-Projektstruktur

- **Status:** angenommen
- **Entscheidung:** Das Projekt nutzt `docs/spec.md` als fachliche Quelle sowie `docs/backlog.md`, `docs/architecture.md` und `docs/decisions.md` als schlanke Arbeitsdokumente. Es gibt keine Meetings- oder Results-Ordner.
- **Folge:** Fortschritt und Kontext müssen direkt in diesen Dokumenten nachvollziehbar bleiben.

## D-002 – Turbomed bleibt führend

- **Status:** angenommen
- **Entscheidung:** Die App ergänzt Turbomed und ersetzt es nicht. Buchungen werden über einen Integrationsadapter übergeben oder exportiert.
- **Folge:** Die App vermeidet doppelte fachliche Datenhaltung. Das konkrete Schnittstellenformat bleibt offen.

## D-003 – Eng begrenzte Datenspeicherung

- **Status:** angenommen
- **Entscheidung:** Gespeichert werden nur Prozessdaten für Buchung, Verfügbarkeit, Anfragen und Kommunikation. Medizinische Dokumentation bleibt ausschließlich in Turbomed.
- **Folge:** Neue Felder und Logs sind gegen diese Systemgrenze zu prüfen.

## D-004 – Planbare Termine bilden den V1-Scope

- **Status:** angenommen
- **Entscheidung:** V1 bietet Vorsorge (30 Minuten), Beratung (20 Minuten), Standardimpfung (15 Minuten) und Reiseimpfung (15 Minuten) online an.
- **Folge:** Rezept-, Wartelisten- und Benachrichtigungsworkflows werden erst nach dem Buchungskern umgesetzt.

## D-005 – Akutfälle bleiben im menschlichen Triageprozess

- **Status:** angenommen
- **Entscheidung:** Die App bewertet keine medizinische Dringlichkeit. Akutfälle werden telefonisch oder persönlich durch eine MFA eingeschätzt.
- **Folge:** Akutslots sind intern und werden ab V1 als `AvailabilityBlock.type = acute_block` gegen Doppelbuchungen gesperrt, aber Patient:innen nicht angezeigt.

## D-006 – Ärzt:innen sind StaffUser

- **Status:** angenommen
- **Entscheidung:** Ärzt:innen werden als `StaffUser` mit `role = doctor` und zusätzlichen Arztattributen modelliert, nicht als separate Hauptentität.
- **Folge:** Rollenprüfung und Arzt-Zuordnung verwenden dieselbe Benutzeridentität.

## D-007 – Terminart-Zuordnungen sind pflegbar

- **Status:** angenommen
- **Entscheidung:** Die n:m-Beziehung zwischen Terminarten und Ärzt:innen wird über `AppointmentTypeAssignment` modelliert.
- **Folge:** Reiseimpfung ist initial nur Dr. Demir, Standardimpfung allen drei Ärzt:innen zugeordnet; spätere Änderungen benötigen keine Codeänderung.

## D-008 – Kommunikation setzt Zustimmung voraus

- **Status:** angenommen
- **Entscheidung:** Automatische Nachrichten werden nur über einen ausdrücklich erlaubten Kanal versendet. Ohne Zustimmung entsteht eine Telefonaufgabe für die MFA.
- **Folge:** Der konkrete Kommunikationsanbieter kann später gewählt werden, die Einwilligungsprüfung gehört jedoch zur Domänenlogik.

## D-009 – Online-Fristen und No-Show-Sperre

- **Status:** angenommen
- **Entscheidung:** Online-Verschiebung ist bis 48 Stunden und Online-Absage bis 24 Stunden vor Beginn möglich. Nach drei No-Shows innerhalb von zwölf Monaten wird die Online-Buchung gesperrt und nur manuell mit dokumentierter Begründung wieder freigegeben.
- **Folge:** Fristen werden serverseitig geprüft; die vollständige No-Show-Automatik ist Phase 3.

## Offene Entscheidungen

| ID | Thema | Zu klären |
|---|---|---|
| O-001 | Turbomed | API, HL7 oder Export; Minimaldaten, Patientenabgleich und Fehlerprozess |
| O-002 | Sprechzeiten | Direkte Pflege in der App oder Übernahme aus einem vorhandenen Kalender |
| O-003 | Kommunikation | Kanäle in V1, Anbieter und belastbarer Einwilligungsnachweis |
| O-004 | Technik | Stack, Datenbank, Hosting und Betriebsmodell |
| O-005 | Datenschutzbetrieb | Verschlüsselung, Auditierung, Aufbewahrung, Löschung und Verantwortlichkeiten |
| O-006 | Rezept-Workflow | Aufnahme in V1 oder verbindliche Verschiebung in Phase 2 |

