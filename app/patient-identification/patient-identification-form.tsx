"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitPatient, type PatientFormState } from "./actions";

const initialState: PatientFormState = { success: false, errors: {} };

export function PatientIdentificationForm() {
  const [state, formAction, pending] = useActionState(submitPatient, initialState);
  const [insuranceType, setInsuranceType] = useState("statutory");
  const error = (field: string) => state.errors[field];

  return (
    <form action={formAction} className="patient-form">
      {state.success && (
        <div className="success" role="status">
          Ihre Basisdaten wurden gespeichert. <Link href={`/appointment-types?patientId=${encodeURIComponent(state.patientId!)}`}>Terminart auswählen</Link>
          <span> Eine Terminbuchung ist noch nicht erfolgt.</span>
        </div>
      )}
      {error("identifier") && <div className="form-error" role="alert">{error("identifier")}</div>}

      <label htmlFor="name">Name</label>
      <input id="name" name="name" required aria-invalid={Boolean(error("name"))} />
      {error("name") && <p className="field-error">{error("name")}</p>}

      <label htmlFor="birthDate">Geburtsdatum</label>
      <input id="birthDate" name="birthDate" type="date" required aria-invalid={Boolean(error("birthDate"))} />
      {error("birthDate") && <p className="field-error">{error("birthDate")}</p>}

      <label htmlFor="insuranceType">Versicherungsstatus</label>
      <select
        id="insuranceType"
        name="insuranceType"
        value={insuranceType}
        onChange={(event) => setInsuranceType(event.target.value)}
        required
      >
        <option value="statutory">Gesetzlich versichert</option>
        <option value="private">Privat versichert</option>
        <option value="self_pay">Selbstzahler:in</option>
      </select>

      {insuranceType === "statutory" ? (
        <>
          <label htmlFor="insuranceNumber">Versichertennummer</label>
          <input id="insuranceNumber" name="insuranceNumber" required aria-invalid={Boolean(error("insuranceNumber"))} />
          {error("insuranceNumber") && <p className="field-error">{error("insuranceNumber")}</p>}
        </>
      ) : (
        <>
          <label htmlFor="practicePatientNumber">Praxis-Patientennummer</label>
          <input id="practicePatientNumber" name="practicePatientNumber" required aria-invalid={Boolean(error("practicePatientNumber"))} />
          {error("practicePatientNumber") && <p className="field-error">{error("practicePatientNumber")}</p>}
        </>
      )}

      <label htmlFor="phone">Telefonnummer</label>
      <input id="phone" name="phone" type="tel" required aria-invalid={Boolean(error("phone"))} />
      {error("phone") && <p className="field-error">{error("phone")}</p>}

      <label htmlFor="email">E-Mail-Adresse (optional)</label>
      <input id="email" name="email" type="email" aria-invalid={Boolean(error("email"))} />
      {error("email") && <p className="field-error">{error("email")}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Basisdaten speichern"}
      </button>
    </form>
  );
}
