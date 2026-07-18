"use client";

import Link from "next/link";
import { useState } from "react";

type AppointmentTypeOption = {
  id: string;
  name: string;
  durationMinutes: number;
  hasRequiredFields: boolean;
};

export function AppointmentTypeSelection({
  appointmentTypes,
  patientId,
}: {
  appointmentTypes: AppointmentTypeOption[];
  patientId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedType = appointmentTypes.find((appointmentType) => appointmentType.id === selectedId);

  return (
    <>
      <fieldset className="appointment-type-list">
        <legend className="visually-hidden">Online planbare Terminarten</legend>
        {appointmentTypes.map((appointmentType) => (
          <label key={appointmentType.id} className="appointment-type-card">
            <input
              type="radio"
              name="appointmentType"
              value={appointmentType.id}
              checked={selectedId === appointmentType.id}
              onChange={() => setSelectedId(appointmentType.id)}
            />
            <span>
              <strong>{appointmentType.name}</strong>
              <span>{appointmentType.durationMinutes} Minuten</span>
              {appointmentType.hasRequiredFields && (
                <span className="appointment-type-note">
                  Angaben zu Reiseziel und Reisedatum werden im späteren Buchungsschritt abgefragt.
                </span>
              )}
            </span>
          </label>
        ))}
      </fieldset>

      {selectedType && (
        <div className="notice" role="status">
          <p>{selectedType.name} wurde ausgewählt. Eine Terminbuchung ist noch nicht erfolgt.</p>
          <p className="primary-link">
            <Link href={`/appointment-types/doctors?patientId=${encodeURIComponent(patientId)}&appointmentTypeId=${encodeURIComponent(selectedType.id)}`}>
              Ärzt:innen anzeigen
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
