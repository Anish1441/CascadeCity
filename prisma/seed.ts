import { PrismaClient } from "@prisma/client";
import { MAHARASHTRA_DISTRICTS, TALUKA_DATA } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌾 Seeding CascadeCity database...");

  // Seed all 36 districts
  for (const district of MAHARASHTRA_DISTRICTS) {
    const created = await prisma.district.upsert({
      where: { name: district.name },
      update: { ...district },
      create: { ...district },
    });

    // Seed talukas for districts with data
    const talukas = TALUKA_DATA[district.name];
    if (talukas) {
      for (const taluka of talukas) {
        const createdTaluka = await prisma.taluka.upsert({
          where: { id: `taluka-${district.name}-${taluka.name}`.replace(/\s+/g, "-").toLowerCase() },
          update: { ...taluka, districtId: created.id },
          create: {
            id: `taluka-${district.name}-${taluka.name}`.replace(/\s+/g, "-").toLowerCase(),
            ...taluka,
            districtId: created.id,
          },
        });

        // Add sample farmers for key districts
        if (["Nagpur", "Yavatmal", "Aurangabad"].includes(district.name)) {
          const farmerCount = Math.floor(Math.random() * 5) + 2;
          for (let i = 1; i <= farmerCount; i++) {
            const phone = `+91${9000000000 + Math.floor(Math.random() * 999999999)}`;
            try {
              await prisma.farmer.create({
                data: {
                  phone,
                  name: `Farmer ${taluka.name} ${i}`,
                  talukaId: createdTaluka.id,
                  crop: taluka.crop,
                  landSize: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
                  language: Math.random() > 0.5 ? "mr" : "en",
                },
              });
            } catch {
              // Skip duplicate phone
            }
          }
        }
      }
    }
  }

  // Create admin user
  await prisma.user.upsert({
    where: { phone: "+919000000001" },
    update: {},
    create: {
      phone: "+919000000001",
      name: "Admin User",
      email: "admin@cascadecity.in",
      role: "admin",
      status: "active",
    },
  });

  // Create a lawmaker
  await prisma.user.upsert({
    where: { phone: "+919000000002" },
    update: {},
    create: {
      phone: "+919000000002",
      name: "Rajesh Patil (Lawmaker)",
      role: "lawmaker",
      status: "active",
    },
  });

  // Sample alerts
  const nagpur = await prisma.district.findUnique({ where: { name: "Nagpur" } });
  const yavatmal = await prisma.district.findUnique({ where: { name: "Yavatmal" } });

  if (nagpur) {
    await prisma.alert.create({
      data: {
        districtId: nagpur.id,
        type: "heat",
        severity: "critical",
        message: "CRITICAL HEAT ALERT: Temperature forecast 46°C+ for next 3 days in Nagpur. Avoid field work 11am-4pm.",
        farmerMessage: "Heat alert Nagpur: Temperature 46°C+. Do not work in fields 11am-4pm. Water crops early morning.",
        officerMessage: "Critical heat alert Nagpur district. Deploy mobile health units. Coordinate with KVK for farmer advisories.",
        channel: "both",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    });

    await prisma.policy.create({
      data: {
        districtId: nagpur.id,
        title: "Emergency Water Conservation - Nagpur 2024",
        description: "Implement immediate drip irrigation subsidies for cotton farmers facing severe water stress. Priority allocation from Totladoh reservoir for irrigation.",
        status: "in_progress",
        benefitScore: 88,
        costScore: 42,
        feasibilityScore: 78,
        impactDescription: "Expected to benefit 45,000 cotton farmers, reduce water consumption by 35%",
      },
    });
  }

  if (yavatmal) {
    await prisma.alert.create({
      data: {
        districtId: yavatmal.id,
        type: "water",
        severity: "high",
        message: "Water stress alert: Groundwater levels at 40% capacity in Yavatmal. Shift to deficit irrigation immediately.",
        farmerMessage: "पाणी संकट: यवतमाळ - भूजल पातळी कमी. तातडीने ठिबक सिंचन वापरा.",
        officerMessage: "Groundwater depletion critical in Yavatmal. Initiate emergency water tanker allocation for livestock.",
        channel: "whatsapp",
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`   - ${MAHARASHTRA_DISTRICTS.length} districts`);
  console.log(`   - ${Object.values(TALUKA_DATA).flat().length} talukas`);
  console.log(`   - Sample farmers, alerts, and policies created`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
