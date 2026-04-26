import { PrismaClient } from "@prisma/client";
import { DISTRICTS } from "../lib/districts";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed districts
  for (const district of DISTRICTS) {
    await prisma.district.upsert({
      where: { code: district.code },
      update: {
        name: district.name,
        division: district.division,
        area: district.area,
        population: district.population,
        latitude: district.lat,
        longitude: district.lng,
      },
      create: {
        id: district.id,
        name: district.name,
        code: district.code,
        division: district.division,
        area: district.area,
        population: district.population,
        latitude: district.lat,
        longitude: district.lng,
      },
    });
  }

  // Seed a default admin user
  await prisma.user.upsert({
    where: { phone: "+919999999999" },
    update: {},
    create: {
      phone: "+919999999999",
      name: "System Admin",
      email: "admin@cascadecity.in",
      role: "SUPER_ADMIN",
    },
  });

  // Seed sample alerts
  const beedDistrict = await prisma.district.findFirst({ where: { code: "BED" } });
  const nagpurDistrict = await prisma.district.findFirst({ where: { code: "NGP" } });

  if (beedDistrict) {
    await prisma.alert.create({
      data: {
        title: "Drought Advisory - Marathwada",
        message: "Below-normal rainfall in Beed, Latur, Osmanabad. Activate water conservation.",
        type: "DROUGHT",
        severity: "HIGH",
        districtId: beedDistrict.id,
      },
    });
  }

  if (nagpurDistrict) {
    await prisma.alert.create({
      data: {
        title: "Extreme Heat Warning - Vidarbha",
        message: "Temperatures exceeding 44°C. Farmers avoid field work 11 AM - 4 PM.",
        type: "WEATHER",
        severity: "CRITICAL",
        districtId: nagpurDistrict.id,
      },
    });
  }

  // Seed sample policy
  await prisma.policy.create({
    data: {
      title: "Heat Wave Emergency Response Protocol 2024",
      content: "This protocol outlines emergency response measures during heat wave conditions in Maharashtra.",
      category: "Emergency Response",
      status: "PUBLISHED",
      aiGenerated: false,
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
