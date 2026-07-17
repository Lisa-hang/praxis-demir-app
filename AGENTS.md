# Arbeitsanweisung für dieses Repository

Dieses Repository wird als SOLO-Projekt geführt. Es gibt keine Rollenzeremonien, Meetings-Protokolle oder separaten Results-Ordner.

## Verbindliche Grundlage

- `docs/spec.md` ist die zentrale fachliche Quelle und bestimmt Scope, Begriffe, Regeln und Build-Reihenfolge.
- Bei Widersprüchen zwischen Implementierung und Spezifikation gilt zunächst die Spezifikation. Die Abweichung muss vor einer Umsetzung in `docs/decisions.md` geklärt werden.
- Fehlende fachliche Details dürfen nicht stillschweigend erfunden werden. Sie werden als offene Frage in `docs/backlog.md` oder als noch offene Entscheidung in `docs/decisions.md` festgehalten.

## Arbeitsweise

1. Vor einer Änderung die relevanten Abschnitte in `docs/spec.md`, `docs/architecture.md`, `docs/decisions.md` und `docs/backlog.md` lesen.
2. Immer nur ein kleines, prüfbares Backlog-Element bearbeiten; V1 hat Vorrang vor späteren Phasen.
3. Geschäftsregeln in der Domänen- beziehungsweise Anwendungsschicht durchsetzen, nicht nur in der Oberfläche.
4. Änderungen mit passenden automatisierten Tests prüfen; besonders Rollenrechte, Zeitgrenzen, Identifikation und Doppelbuchungsschutz abdecken.
5. Nach jedem Feature `docs/backlog.md`, `docs/architecture.md` und bei neuen Richtungsentscheidungen `docs/decisions.md` aktualisieren, bevor committed wird.

## Leitplanken

- Turbomed bleibt das führende Praxisverwaltungssystem; diese App ist ein vorgelagertes Portal.
- Keine Diagnosen, Befunde, Laborwerte, Krankengeschichten, Krankschreibungen, Überweisungen oder sonstige medizinische Dokumentation in dieser App speichern.
- Keine automatische medizinische Dringlichkeitsbewertung implementieren. Akutfälle bleiben telefonisch oder persönlich bei der MFA.
- Akutzeiten ab V1 als nicht öffentlich sichtbare Blockierungen berücksichtigen.
- Automatische Kommunikation nur bei passender Einwilligung; andernfalls einen telefonischen Folgeprozess vorsehen.
- Keine Erweiterung des V1-Scopes ohne dokumentierte Entscheidung.

## Dokumentationsstruktur

- `docs/spec.md`: fachliche Quelle und Scope
- `docs/backlog.md`: priorisierte nächste Arbeit
- `docs/architecture.md`: aktuelles Architektur- und Systembild
- `docs/decisions.md`: getroffene und offene Richtungsentscheidungen

