-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "insuranceType" TEXT NOT NULL,
    "insuranceNumber" TEXT,
    "practicePatientNumber" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "communicationConsentSms" BOOLEAN NOT NULL DEFAULT false,
    "communicationConsentEmail" BOOLEAN NOT NULL DEFAULT false,
    "onlineBookingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "noShowCountLast12Months" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "specialties" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "AppointmentType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "onlineBookable" BOOLEAN NOT NULL,
    "visibleToPatient" BOOLEAN NOT NULL,
    "requiresHumanTriage" BOOLEAN NOT NULL DEFAULT false,
    "requiresDoctorApproval" BOOLEAN NOT NULL DEFAULT false,
    "requiredFields" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "AppointmentTypeAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentTypeId" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    CONSTRAINT "AppointmentTypeAssignment_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppointmentTypeAssignment_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "appointmentTypeId" TEXT NOT NULL,
    "doctorStaffUserId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "source" TEXT NOT NULL,
    "createdByUserId" TEXT,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorStaffUserId_fkey" FOREIGN KEY ("doctorStaffUserId") REFERENCES "StaffUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "StaffUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AvailabilityBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffUserId" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "visibleToPatient" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AvailabilityBlock_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_insuranceNumber_key" ON "Patient"("insuranceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_practicePatientNumber_key" ON "Patient"("practicePatientNumber");

-- CreateIndex
CREATE INDEX "Patient_name_birthDate_idx" ON "Patient"("name", "birthDate");

-- CreateIndex
CREATE INDEX "StaffUser_role_active_idx" ON "StaffUser"("role", "active");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentType_name_key" ON "AppointmentType"("name");

-- CreateIndex
CREATE INDEX "AppointmentTypeAssignment_staffUserId_active_idx" ON "AppointmentTypeAssignment"("staffUserId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentTypeAssignment_appointmentTypeId_staffUserId_key" ON "AppointmentTypeAssignment"("appointmentTypeId", "staffUserId");

-- CreateIndex
CREATE INDEX "Appointment_doctorStaffUserId_startTime_endTime_idx" ON "Appointment"("doctorStaffUserId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Appointment_patientId_startTime_idx" ON "Appointment"("patientId", "startTime");

-- CreateIndex
CREATE INDEX "AvailabilityBlock_staffUserId_startTime_endTime_idx" ON "AvailabilityBlock"("staffUserId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "AvailabilityBlock_type_startTime_idx" ON "AvailabilityBlock"("type", "startTime");
