import { NextResponse } from "next/server";
import { DISTRICTS } from "@/lib/districts";

export async function GET() {
  const totalDistricts = DISTRICTS.length;
  const avgStress = Math.round(DISTRICTS.reduce((s, d) => s + d.stressScore, 0) / totalDistricts);
  const avgWater = Math.round(DISTRICTS.reduce((s, d) => s + d.waterStress, 0) / totalDistricts);
  const avgCrop = Math.round(DISTRICTS.reduce((s, d) => s + d.cropDamageRisk, 0) / totalDistricts);
  const criticalCount = DISTRICTS.filter((d) => d.stressScore >= 75).length;
  const highCount = DISTRICTS.filter((d) => d.stressScore >= 60 && d.stressScore < 75).length;

  const divisionStats = ["Konkan", "Nashik", "Pune", "Aurangabad", "Amravati", "Nagpur"].map(
    (div) => {
      const dists = DISTRICTS.filter((d) => d.division === div);
      return {
        division: div,
        count: dists.length,
        avgStress: Math.round(dists.reduce((s, d) => s + d.stressScore, 0) / dists.length),
        avgWater: Math.round(dists.reduce((s, d) => s + d.waterStress, 0) / dists.length),
      };
    }
  );

  const topStressDistricts = [...DISTRICTS]
    .sort((a, b) => b.stressScore - a.stressScore)
    .slice(0, 10)
    .map((d) => ({ name: d.name, division: d.division, stressScore: d.stressScore, waterStress: d.waterStress, cropDamageRisk: d.cropDamageRisk }));

  return NextResponse.json({
    summary: {
      totalDistricts,
      avgStress,
      avgWater,
      avgCrop,
      criticalCount,
      highCount,
      farmersReached: 4280000,
      activePolicies: 12,
      activeAlerts: 5,
    },
    divisionStats,
    topStressDistricts,
    districts: DISTRICTS.map((d) => ({
      id: d.id,
      name: d.name,
      division: d.division,
      stressScore: d.stressScore,
      waterStress: d.waterStress,
      cropDamageRisk: d.cropDamageRisk,
    })),
  });
}
