# SPEC.md v1 – Praxis Demir & Kollegen

## 1. Kontext und Ziel

Die Praxis Demir & Kollegen ist eine hausärztliche Gemeinschaftspraxis mit drei Ärzt:innen. Das Hauptproblem ist die telefonische Termin- und Anfragebearbeitung. Ab ca. 7:30 Uhr klingelt das Telefon dauerhaft. MFAs müssen parallel Anrufe annehmen, Walk-ins einchecken und Zimmer vorbereiten.

Ziel der App ist ein vorgelagertes Online-Termin- und Anfrageportal. Die App ersetzt Turbomed nicht. Turbomed bleibt das führende Praxisverwaltungssystem.

Version 1 fokussiert auf die Online-Buchung planbarer Termine:

- Vorsorge
- Beratung
- Standardimpfung
- Reiseimpfung

Wenn diese Terminarten online buchbar sind, erwartet Dr. Demir eine Reduktion der Telefonanrufe um ca. 40–50 %.

---

## 2. Systemgrenze

### Die App verwaltet

- Online-Terminbuchungen
- planbare Terminarten
- Wiederholungsrezept-Anfragen
- Patient:innen-Identifikation für Buchungen
- Sprechzeiten und blockierte Zeiten
- Kommunikationszustimmungen
- einfache Benachrichtigungen
- Warteliste für frei werdende Slots
- No-Show-Zähler und Online-Buchungssperre

### Die App speichert nicht

- Diagnosen
- Befunde
- Laborwerte
- Krankengeschichte
- Krankschreibungen
- Überweisungen
- medizinische Dokumentation

Diese Inhalte bleiben ausschließlich in Turbomed.

### Turbomed

Turbomed bleibt die zentrale Datenbasis für Patient:innen, Termine, Rezepte und medizinische Dokumentation. Buchungsdaten aus der App müssen an Turbomed übergeben oder exportiert werden, damit MFAs keine doppelte Pflege leisten müssen.

---

## 3. Rollen

## 3.1 Patient:in

Patient:innen dürfen:

- freigegebene Terminarten online buchen
- Termine online verschieben
- Termine online absagen
- Wiederholungsrezepte online anfragen
- Wartelistenangebote annehmen
- Kommunikationszustimmungen erteilen

Patient:innen dürfen nicht:

- Akutslots sehen oder buchen
- gesperrte Online-Buchung umgehen
- medizinische Dringlichkeit durch die App bewerten lassen

---

## 3.2 MFA

MFAs dürfen:

- Termine anlegen, verschieben und absagen
- Patient:innen internen Akutslots zuweisen
- Wiederholungsrezept-Anfragen anlegen
- Rezeptstatus auf „abgeholt“ setzen
- No-Shows eintragen
- Online-Buchungssperren manuell aufheben
- Sprechzeiten kurzfristig anpassen
- betroffene Slots bei Arztausfall sperren

MFAs dürfen nicht:

- Wiederholungsrezepte freigeben
- medizinische Diagnosen oder Befunde dokumentieren
- Rezeptfreigaben auslösen

---

## 3.3 Ärzt:in / Admin

Ärzt:innen und Admins dürfen:

- Wiederholungsrezepte prüfen und freigeben
- medizinische Terminnotizen pflegen
- Sprechzeiten und Abwesenheiten festlegen
- interne Akutslot-Zeiten planen
- über Online-Buchungssperren entscheiden
- Terminarten und Ärzt:innen-Zuordnungen pflegen

Hinweis: Ärzt:innen sind keine separate Entität neben StaffUser. Sie sind StaffUser mit `role = doctor` und zusätzlichen Arzt-Attributen.

---

## 4. Entitäten

## 4.1 Patient

Attribute:

- id: string
- name: string
- birthDate: date
- insuranceType: gesetzlich | privat | selbstzahler
- insuranceNumber: string optional
- practicePatientNumber: string optional
- phone: string
- email: string optional
- communicationConsentSms: boolean
- communicationConsentEmail: boolean
- onlineBookingAllowed: boolean
- noShowCountLast12Months: number

Regeln:

- Gesetzlich Versicherte müssen eine Versichertennummer angeben.
- Privatpatient:innen und Selbstzahler:innen müssen eine Praxis-Patientennummer angeben.
- Ohne eindeutige Identifikation darf keine Online-Buchung erstellt werden.
- Bei `onlineBookingAllowed = false` darf Patient:in nicht online buchen und erhält den Hinweis: „Bitte rufen Sie uns an.“

---

## 4.2 StaffUser

Attribute:

- id: string
- name: string
- role: mfa | doctor | admin
- specialties: string[] optional
- active: boolean

Regeln:

- StaffUser mit `role = mfa` darf Termine verwalten, aber keine Rezepte freigeben.
- StaffUser mit `role = doctor` darf Wiederholungsrezepte prüfen und freigeben.
- StaffUser mit `role = admin` darf Sprechzeiten, Terminarten und Sperrzeiten verwalten.

Bekannte Arzt-Regeln:

- Dr. Demir ist für Reisemedizin zuständig.
- Standardimpfungen können alle drei Ärzt:innen durchführen.
- Dr. Schäfer arbeitet nicht freitagnachmittags.
- Dr. Yilmaz beginnt dienstags erst um 10 Uhr.

---

## 4.3 AppointmentType

Attribute:

- id: string
- name: string
- durationMinutes: number
- onlineBookable: boolean
- visibleToPatient: boolean
- requiresHumanTriage: boolean
- requiresDoctorApproval: boolean
- requiredFields: string[]

Terminarten:

| Terminart | Dauer | Online buchbar | Sichtbar für Patient:innen | Regel |
|---|---:|---|---|---|
| Vorsorge | 20–30 Min. | ja | ja | kein Walk-in |
| Beratung | 15–20 Min. | ja | ja | planbarer Standardtermin |
| Standardimpfung | 10–15 Min. | ja | ja | alle Ärzt:innen möglich |
| Reiseimpfung | 10–15 Min. | ja | ja | nur Dr. Demir, Reiseziel und Reisedatum Pflicht |
| Blutabnahme | 10 Min. | nein | nein | telefonisch, Vorbereitung durch MFA |
| Akutsprechstunde | 10 Min. | nein | nein | nur intern, nur am selben Tag |
| Erstgespräch | 20 Min. | nein | nein | telefonisch wegen Klärungsbedarf |
| Wiederholungsrezept-Abholung | 5 Min. | nein | nein | Workflow, kein klassischer Online-Termin |

Für Version 1 gelten feste Standarddauern, damit der Agent nicht raten muss:

- Vorsorge: 30 Minuten
- Beratung: 20 Minuten
- Standardimpfung: 15 Minuten
- Reiseimpfung: 15 Minuten
- Akutsprechstunde: 10 Minuten

Hinweis:

Akutslot ist keine eigene Hauptentität. Akutslots werden als interne blockierte Zeitfenster modelliert, z. B. über `AvailabilityBlock.type = acute_block`.

---

## 4.4 AppointmentTypeAssignment

Diese Beziehung bildet ab, welche Ärzt:innen welche Terminarten anbieten dürfen.

Attribute:

- id: string
- appointmentTypeId: string
- staffUserId: string
- active: boolean
- note: string optional

Regeln:

- Eine Terminart kann von mehreren Ärzt:innen angeboten werden.
- Eine Ärztin / ein Arzt kann mehrere Terminarten anbieten.
- Bei Reiseimpfung ist nur Dr. Demir aktiv zugeordnet.
- Bei Standardimpfung sind alle drei Ärzt:innen aktiv zugeordnet.
- Diese Zuordnung muss pflegbar sein, falls sich Zuständigkeiten ändern.

Diese Entität bildet die n:m-Beziehung zwischen `AppointmentType` und `StaffUser(role = doctor)` ab.

---

## 4.5 Appointment

Attribute:

- id: string
- patientId: string
- appointmentTypeId: string
- doctorStaffUserId: string
- startTime: datetime
- endTime: datetime
- status: booked | cancelled | rescheduled | no_show | blocked
- source: online | mfa | turbomed
- createdByUserId: string optional

Regeln:

- Online buchbare Termine dürfen nur für freigegebene Terminarten erstellt werden.
- Patient:innen sehen nur verfügbare Slots.
- Blockierte Zeiten dürfen nicht online angeboten werden.
- Akutsprechstunden-Slots dürfen Patient:innen nicht angezeigt werden.
- No-Show ist kein eigenes Objekt, sondern ein Terminstatus.

---

## 4.6 AvailabilityBlock

Attribute:

- id: string
- staffUserId: string optional
- startTime: datetime
- endTime: datetime
- type: regular | vacation | training | sick | practice_closed | acute_block
- visibleToPatient: boolean

Regeln:

- Urlaub, Krankheit, Fortbildung und Praxisschließung sperren Slots automatisch.
- Wenn eine Ärztin ausfällt, müssen alle betroffenen Slots auf einmal gesperrt werden können.
- Kurzfristig freigegebene Zeiten müssen sofort oder nahezu in Echtzeit buchbar sein.
- Akutslot-Blockierungen sind intern sichtbar, aber nicht für Patient:innen.
- Akutslot-Blockierungen müssen ab Version 1 berücksichtigt werden, damit keine Doppelbuchungen entstehen.

---

## 4.7 PrescriptionRequest

Attribute:

- id: string
- patientId: string
- medicationName: string
- dosage: string
- lastIssuedDate: date
- status: requested | in_review | approved | rejected | ready_for_pickup | picked_up
- approvedByStaffUserId: string optional
- createdAt: datetime

Regeln:

- Wiederholungsrezepte können online angefragt werden.
- Wiederholungsrezepte werden nie automatisch freigegeben.
- Ärzt:innen prüfen und geben frei.
- MFAs dürfen nur anlegen und den Status „abgeholt“ setzen.
- Bei Unklarheiten wird Patient:in telefonisch kontaktiert.

---

## 4.8 WaitlistEntry

Attribute:

- id: string
- patientId: string
- appointmentTypeId: string
- desiredTimeRange: string
- requestedAt: datetime
- status: waiting | offered | accepted | expired | cancelled
- offerExpiresAt: datetime optional

Regeln:

- Warteliste wird nach Anfragezeit sortiert.
- Wer zuerst angefragt hat, bekommt zuerst ein Angebot.
- Dringlichkeit wird nicht automatisch bewertet.
- Wenn ein Slot frei wird, wird die erste passende Person benachrichtigt.
- Wird das Angebot nicht innerhalb von vier Stunden angenommen, wird die nächste Person kontaktiert.

---

## 4.9 Notification

Attribute:

- id: string
- patientId: string
- appointmentId: string optional
- channel: sms | email | app | phone_required
- reason: appointment_cancelled | doctor_unavailable | waitlist_offer | reminder
- status: pending | sent | failed
- createdAt: datetime

Regeln:

- Automatische Nachrichten dürfen nur mit Zustimmung verschickt werden.
- Bei kurzfristigem Arztausfall ist SMS bevorzugt.
- Patient:innen ohne Zustimmung müssen telefonisch kontaktiert werden.
- Die App soll eine Liste erzeugen, wer automatisch benachrichtigt wurde und wer angerufen werden muss.

---

## 5. Beziehungen

- Patient 1:n Appointment
- Patient 1:n PrescriptionRequest
- Patient 1:n WaitlistEntry
- Patient 1:n Notification
- StaffUser(role = doctor) 1:n Appointment
- StaffUser 1:n AvailabilityBlock
- AppointmentType 1:n Appointment
- AppointmentType n:m StaffUser(role = doctor) über AppointmentTypeAssignment
- StaffUser 1:n Appointment über createdByUserId
- Appointment 0:n Notification

Wichtig:

- No-Show wird nicht als eigene Beziehung modelliert.
- No-Show ist `Appointment.status = no_show`.
- Der Patient speichert zusätzlich `noShowCountLast12Months`.

---

## 6. Geschäftsregeln

## 6.1 Online-Buchung

- Nur Vorsorge, Beratung, Standardimpfung und Reiseimpfung sind online buchbar.
- Patient:innen müssen sich eindeutig identifizieren.
- Patient:innen wählen Terminart, Datum und optional Ärzt:in.
- Patient:innen sehen nur freie Slots.
- Gesperrte Zeiten werden nicht angezeigt.
- Akutslots werden nicht angezeigt.
- Buchungsdaten müssen an Turbomed übergeben oder exportiert werden.

---

## 6.2 Impfungen

- Patient:innen wählen bei Impfung zwischen Standardimpfung und Reiseimpfung.
- Bei Standardimpfung sind alle drei Ärzt:innen möglich.
- Bei Reiseimpfung wird nur Dr. Demir angezeigt.
- Bei Reiseimpfung sind Reiseziel und Reisedatum Pflichtfelder.
- Welche Terminart bei welchen Ärzt:innen buchbar ist, muss pflegbar sein.

---

## 6.3 Akutfälle

- Akuteinschätzung erfolgt telefonisch oder persönlich durch MFA.
- Die App darf keine medizinische Dringlichkeit automatisch bewerten.
- Akutsprechstunden-Slots sind intern sichtbar, aber nicht für Patient:innen.
- Akutsprechstunden-Slots müssen als blockierte Zeiten berücksichtigt werden.
- Wenn alle Akutslots voll sind, prüft die MFA freie Slots bei anderen Ärzt:innen.
- Wenn nichts frei ist, wird Patient:in an Notaufnahme oder 116 117 verwiesen.

---

## 6.4 Verschieben und Absagen

- Online-Verschiebung ist bis 48 Stunden vor Termin möglich.
- Unter 48 Stunden ist Verschieben nur telefonisch möglich.
- Online-Absage ist bis 24 Stunden vor Termin möglich.
- Unter 24 Stunden ist Absage nur telefonisch möglich.
- Bei Online-Verschiebung wird der alte Slot sofort freigegeben und der neue Slot gebucht.

---

## 6.5 No-Show

- Wenn Patient:in nicht erscheint und nicht absagt, wird `Appointment.status = no_show` gesetzt.
- Nach zwei No-Shows innerhalb eines Jahres erhält Patient:in einen Brief.
- Beim dritten No-Show wird `Patient.onlineBookingAllowed = false`.
- Die Sperre wird nicht automatisch aufgehoben.
- MFA oder Ärzt:in kann die Sperre manuell aufheben.
- Beim Aufheben der Sperre muss eine Begründung dokumentiert werden.
- Gesperrte Patient:innen sehen beim Login einen klaren Hinweis: „Bitte rufen Sie uns an.“

---

## 6.6 Wiederholungsrezepte

- Wiederholungsrezepte werden online angefragt.
- Pflichtangaben: Medikamentenname, Dosierung, zuletzt ausgestellt.
- Ärzt:in prüft die Anfrage.
- Es gibt keine automatische Freigabe.
- Nach Freigabe kann Patient:in das Rezept abholen.
- Der Workflow ist Priorität 2, nicht Version-1-kritisch.

---

## 6.7 Warteliste

- Warteliste ersetzt die bisherige Excel-Zettelwirtschaft.
- Warteliste wird nach Anfragezeit sortiert.
- Dringlichkeit spielt keine automatische Rolle.
- Bei frei werdendem Slot wird die erste passende Person benachrichtigt.
- Annahmefrist beträgt vier Stunden.
- Danach wird die nächste Person kontaktiert.

---

## 6.8 Datenschutz

- Die App speichert keine medizinischen Inhalte im engeren Sinne.
- Diagnosen, Befunde, Laborwerte und Krankengeschichte bleiben in Turbomed.
- Die App speichert nur Prozessdaten für Buchung, Anfrage und Kommunikation.
- Doppelte Datenhaltung muss vermieden werden.

---

## 7. Echte Widersprüche aus dem Gespräch und Auflösung

## 7.1 Wiederholungsrezepte: „ohne großes Zutun“ vs. „interne Prüfung“

Aussage A:

Dr. Demir ordnet Wiederholungsrezepte zuerst den klaren Online-Fällen zu: Patient stellt online eine Anfrage, Ärztin prüft kurz und gibt frei.

Aussage B:

Direkt danach stellt sie klar, dass Wiederholungsrezepte online mit interner Prüfung laufen und kein Automatismus sind.

Auflösung:

Wiederholungsrezepte sind online anfragbar, aber nicht automatisch abgeschlossen. Die App erfasst die Anfrage. Die Freigabe bleibt zwingend ärztlich.

---

## 7.2 Akutslots in Version 1: „kein Showstopper“ vs. „muss von Tag eins funktionieren“

Aussage A:

Dr. Demir sagt zunächst, dass Akutslots in Version 1 in Turbomed bleiben können, wenn die Online-Buchung sauber funktioniert.

Aussage B:

Kurz danach stellt sie fest, dass Akutslots zumindest als blockierte Zeiten in der App bekannt sein müssen, sonst entstehen Doppelbuchungen.

Auflösung:

Die vollständige Akutslot-Verwaltung ist nicht Version-1-kritisch. Aber Akutslot-Blockierungen müssen ab Version 1 berücksichtigt werden, damit keine Online-Termine auf intern reservierte Akutzeiten gelegt werden.

---

## 8. Designentscheidungen / Systemgrenzen

## 8.1 Akutfälle bleiben telefonisch

Planbare Termine gehen online. Akutfälle bleiben telefonisch oder persönlich, da eine MFA einschätzen muss.

## 8.2 Turbomed bleibt führend

Die App ersetzt Turbomed nicht. Sie ist ein vorgelagertes Portal. Buchungsdaten müssen an Turbomed übergeben oder exportiert werden.

## 8.3 Benachrichtigungen nur mit Zustimmung

Automatische Nachrichten werden nur mit Zustimmung verschickt. Ohne Zustimmung erzeugt die App eine Telefonliste für MFAs.

---

## 9. Offene Fragen

- Welche konkrete Turbomed-Schnittstelle oder Exportform ist realistisch?
- Welche Minimaldaten müssen an Turbomed übergeben werden?
- Soll HL7 genutzt werden oder reicht ein Export?
- Soll Outlook angebunden werden oder werden Sprechzeiten direkt in der App gepflegt?
- Welche Kommunikationskanäle werden technisch in Version 1 umgesetzt?
- Soll SMS direkt integriert oder nur als späterer Schritt geplant werden?
- Wie wird die Kommunikationszustimmung eingeholt?
- Soll Wiederholungsrezept-Workflow in Version 1 oder Version 2 umgesetzt werden?
- Wie genau werden Akutslot-Blockierungen aus Turbomed oder internem Kalender übernommen?
- Wie werden Patient:innen eindeutig mit Turbomed-Datensätzen abgeglichen?
- Bleibt die No-Show-Sperre dauerhaft manuell, oder soll später doch eine automatische Entsperr-Regel definiert werden?
- Wer darf dauerhaft Arzt-Terminart-Zuordnungen ändern?

---

## 10. Version-1-Scope

Für Version 1 werden zuerst nur diese Kernobjekte benötigt:

- Patient
- StaffUser
- AppointmentType
- AppointmentTypeAssignment
- Appointment
- AvailabilityBlock

PrescriptionRequest, WaitlistEntry und Notification sind fachlich modelliert, aber für spätere Phasen vorgesehen.

Version 1 enthält:

- Patient:innen-Identifikation
- Online-Buchung für Vorsorge
- Online-Buchung für Beratung
- Online-Buchung für Standardimpfung
- Online-Buchung für Reiseimpfung
- Arzt-Zuordnung nach Terminart
- Sprechzeiten und Abwesenheiten
- blockierte Zeiten inklusive Akutslot-Blockierungen
- Online-Absage bis 24 Stunden
- Online-Verschiebung bis 48 Stunden
- Übergabe oder Export an Turbomed
- Rollenrechte für Patient:in, MFA und Ärzt:in

Version 1 enthält nicht zwingend:

- vollständige Rezeptfreigabe
- vollständige Akutslot-Verwaltung
- vollständige Wartelistenautomatik
- SMS-Versand
- vollständiges No-Show-Briefsystem
---

## 11. Build-Reihenfolge für den Agenten

Der Agent soll nicht die ganze App auf einmal bauen. Die Features sollen klein und nacheinander umgesetzt werden.

### Phase 1 – Kernmodell und Online-Buchung

Zuerst bauen:

1. Patient:innen-Identifikation
2. StaffUser mit Rollen `mfa`, `doctor`, `admin`
3. AppointmentType für Vorsorge, Beratung, Standardimpfung, Reiseimpfung und interne/blockierte Typen
4. AppointmentTypeAssignment für die n:m-Zuordnung zwischen Terminart und Ärzt:in
5. AvailabilityBlock für Sprechzeiten, Urlaub, Krankheit, Fortbildung, Praxisschließung und `acute_block`
6. Appointment für Online-Buchungen
7. Online-Buchung für Vorsorge, Beratung, Standardimpfung und Reiseimpfung
8. Regelprüfung: blockierte Zeiten und Akutslot-Blockierungen dürfen nicht als freie Slots angezeigt werden
9. Online-Absage bis 24 Stunden und Online-Verschiebung bis 48 Stunden
10. Vorbereitung eines Turbomed-Exports oder einer Übergabelogik

### Phase 2 – Anfrage-Workflows

Danach bauen:

1. PrescriptionRequest für Wiederholungsrezepte
2. WaitlistEntry für Warteliste
3. Notification für SMS/E-Mail/App/Telefonliste

### Phase 3 – Komfort und Sonderfälle

Später bauen:

1. No-Show-Zählung und Online-Sperre
2. Wartelisten-Angebote mit 4-Stunden-Frist
3. Benachrichtigungen bei Arztausfall
4. vollständige Turbomed-Schnittstelle oder stabiler Export

### Wichtige Arbeitsregel

Nach jedem Feature muss der Agent Dokumentation und Backlog aktualisieren, bevor committed wird.
