import { AvailabilityBlockType, PrismaClient, StaffRole } from "@prisma/client";

const prisma = new PrismaClient();

const appointmentTypes = [
  { name: "Vorsorge", durationMinutes: 30, requiredFields: [] },
  { name: "Beratung", durationMinutes: 20, requiredFields: [] },
  { name: "Standardimpfung", durationMinutes: 15, requiredFields: [] },
  { name: "Reiseimpfung", durationMinutes: 15, requiredFields: ["travelDestination", "travelDate"] },
] as const;

function nextWeekdayAt(hour: number, durationHours: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  while (date.getDay() === 0 || date.getDay() === 6 || date <= new Date()) date.setDate(date.getDate() + 1);
  return { startTime: date, endTime: new Date(date.getTime() + durationHours * 60 * 60 * 1000) };
}

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

  const preventiveCare = types.find((type) => type.name === "Vorsorge")!;
  const consultation = types.find((type) => type.name === "Beratung")!;
  const standardVaccination = types.find((type) => type.name === "Standardimpfung")!;
  const travelVaccination = types.find((type) => type.name === "Reiseimpfung")!;
  const demir = doctors.find((doctor) => doctor.name === "Dr. Demir")!;

  for (const appointmentType of [preventiveCare, consultation, standardVaccination]) {
    for (const doctor of doctors) {
      await prisma.appointmentTypeAssignment.upsert({
        where: { appointmentTypeId_staffUserId: { appointmentTypeId: appointmentType.id, staffUserId: doctor.id } },
        update: { active: true },
        create: { appointmentTypeId: appointmentType.id, staffUserId: doctor.id },
      });
    }
  }

  await prisma.appointmentTypeAssignment.upsert({
    where: { appointmentTypeId_staffUserId: { appointmentTypeId: travelVaccination.id, staffUserId: demir.id } },
    update: { active: true },
    create: { appointmentTypeId: travelVaccination.id, staffUserId: demir.id },
  });

  for (const [index, doctor] of doctors.entries()) {
    const { startTime, endTime } = nextWeekdayAt(9 + index, 3);
    await prisma.availabilityBlock.upsert({
      where: { id: `seed-regular-availability-${doctor.id}` },
      update: { staffUserId: doctor.id, startTime, endTime, type: AvailabilityBlockType.regular, visibleToPatient: true },
      create: { id: `seed-regular-availability-${doctor.id}`, staffUserId: doctor.id, startTime, endTime, type: AvailabilityBlockType.regular, visibleToPatient: true },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
