# Praxis Demir & Kollegen

Technisches Grundgerüst für das vorgelagerte Online-Terminportal. Turbomed bleibt das führende Praxisverwaltungssystem; diese Anwendung speichert keine medizinische Dokumentation.

## Lokale Entwicklung

Voraussetzungen: Node.js und npm.

1. Abhängigkeiten installieren: `npm install`
2. `.env.example` nach `.env` kopieren.
3. Prisma-Client und Datenbank erzeugen: `npm run db:migrate -- --name init`
4. Initialdaten einspielen: `npm run db:seed`
5. Entwicklungsserver starten: `npm run dev`

## Prüfung

- `npm test`
- `npm run lint`
- `npm run build`

Der aktuelle Stand enthält das Next.js-Grundgerüst, das V1-Datenmodell und eine Startseite. Ein Buchungsablauf ist noch nicht implementiert.
