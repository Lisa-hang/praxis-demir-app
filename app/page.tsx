import Link from "next/link";

const appointmentTypes = ["Vorsorge", "Beratung", "Standardimpfung", "Reiseimpfung"];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Praxis Demir &amp; Kollegen</p>
        <h1>Online-Terminportal</h1>
        <p className="intro">
          Hier entsteht die Online-Buchung für planbare Termine. Akute Beschwerden
          werden weiterhin telefonisch oder persönlich durch unser Praxisteam eingeschätzt.
        </p>
        <div className="notice" role="status">
          Die Terminbuchung ist noch nicht freigeschaltet.
        </div>
        <p className="primary-link"><Link href="/patient-identification">Basisdaten erfassen</Link></p>
      </section>

      <section aria-labelledby="appointment-types">
        <h2 id="appointment-types">Geplante Online-Termine</h2>
        <ul>
          {appointmentTypes.map((appointmentType) => (
            <li key={appointmentType}>{appointmentType}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
