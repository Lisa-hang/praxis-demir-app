import Link from "next/link";
import { PatientIdentificationForm } from "./patient-identification-form";

export default function PatientIdentificationPage() {
  return (
    <main>
      <section>
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Patient:innendaten erfassen</h1>
        <p className="intro">
          Erfassen Sie hier Ihre Basis- und Kontaktdaten. Damit wird noch kein Termin gebucht.
        </p>
        <PatientIdentificationForm />
        <p className="back-link"><Link href="/">Zurück zur Startseite</Link></p>
      </section>
    </main>
  );
}
