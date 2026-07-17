import { PrismaClient, StaffRole } from "@prisma/client";

const prisma = new PrismaClient();

const appointmentTypes = [
  { name: "Vorsorge", durationMinutes: 30, requiredFields: [] },
  { name: "Beratung", durationMinutes: 20, requiredFields: [] },
  { name: "Standardimpfung", durationMinutes: 15, requiredFields: [] },
  { name: "Reiseimpfung", durationMinutes: 15, requiredFields: ["travelDestination", "travelDate"] },
] as const;

async function main() {
  const doctors = await Promise.all(
    ["Dr. Demir", "Dr. Schäfer", "Dr. Yilmaz"].map((name) =>
      prisma.staffUser.upsert({
        where: { id: `seed-${name.toLowerCase().replaceAll(/[^a-zäöüß]+/g, "-")}` },
        update: { name, role: StaffRole.doctor, active: true },
        create: { id: `seed-${name.toLowerCase().replaceAll(/[^a-zäöüß]+/g, "-")}`, name, role: StaffRole.doctor },
      }),
    ),
  );

  const types = await Promise.all(
    appointmentTypes.map((type) =>
      prisma.appointmentType.upsert({
        where: { name: type.name },
        update: { ...type, requiredFields: [...type.requiredFields], onlineBookable: true, visibleToPatient: true },
        create: { ...type, requiredFields: [...type.requiredFields], onlineBookable: true, visibleToPatient: true },
      }),
    ),
  );

  const standardVaccination = types.find((type) => type.name === "Standardimpfung")!;
  const travelVaccination = types.find((type) => type.name === "Reiseimpfung")!;
  const demir = doctors.find((doctor) => doctor.name === "Dr. Demir")!;

  for (const doctor of doctors) {
    await prisma.appointmentTypeAssignment.upsert({
      where: { appointmentTypeId_staffUserId: { appointmentTypeId: standardVaccination.id, staffUserId: doctor.id } },
      update: { active: true },
      create: { appointmentTypeId: standardVaccination.id, staffUserId: doctor.id },
    });
  }

  await prisma.appointmentTypeAssignment.upsert({
    where: { appointmentTypeId_staffUserId: { appointmentTypeId: travelVaccination.id, staffUserId: demir.id } },
    update: { active: true },
    create: { appointmentTypeId: travelVaccination.id, staffUserId: demir.id },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
