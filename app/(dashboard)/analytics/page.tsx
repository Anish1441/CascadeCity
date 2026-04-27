import { DISTRICTS } from "@/lib/districts";

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const avgStress = Math.round(DISTRICTS.reduce((s, d) => s + d.stressScore, 0) / DISTRICTS.length);
  const avgWater = Math.round(DISTRICTS.reduce((s, d) => s + d.waterStress, 0) / DISTRICTS.length);
  const avgCrop = Math.round(DISTRICTS.reduce((s, d) => s + d.cropDamageRisk, 0) / DISTRICTS.length);

  const criticalCount = DISTRICTS.filter((d) => d.stressScore >= 80).length;
  const highCount = DISTRICTS.filter((d) => d.stressScore >= 70 && d.stressScore < 80).length;
  const mediumCount = DISTRICTS.filter((d) => d.stressScore >= 60 && d.stressScore < 70).length;
  const lowCount = DISTRICTS.filter((d) => d.stressScore < 60).length;

  const divisions = ["Konkan", "Nashik", "Pune", "Aurangabad", "Amravati", "Nagpur"].map((div) => {
    const dists = DISTRICTS.filter((d) => d.division === div);
    return {
      division: div,
      count: dists.length,
      avgStress: Math.round(dists.reduce((s, d) => s + d.stressScore, 0) / dists.length),
      avgWater: Math.round(dists.reduce((s, d) => s + d.waterStress, 0) / dists.length),
      avgCrop: Math.round(dists.reduce((s, d) => s + d.cropDamageRisk, 0) / dists.length),
      totalPop: dists.reduce((s, d) => s + d.population, 0),
    };
  });

  const topStress = [...DISTRICTS].sort((a, b) => b.stressScore - a.stressScore).slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Comprehensive district stress analysis</p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Heat Stress", value: avgStress, color: "text-orange-400" },
          { label: "Avg Water Stress", value: avgWater, color: "text-blue-400" },
          { label: "Avg Crop Risk", value: avgCrop, color: "text-yellow-400" },
          { label: "Districts Monitored", value: 36, color: "text-emerald-400" },
        ].map((item) => (
          <div key={item.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-slate-400 text-sm mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Stress Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Stress Level Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Critical (80+)", count: criticalCount, color: "bg-red-500", textColor: "text-red-400" },
            { label: "High (70-79)", count: highCount, color: "bg-orange-500", textColor: "text-orange-400" },
            { label: "Medium (60-69)", count: mediumCount, color: "bg-yellow-500", textColor: "text-yellow-400" },
            { label: "Low (<60)", count: lowCount, color: "bg-emerald-500", textColor: "text-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className={`mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl ${item.color}`}
                style={{ width: `${Math.max(48, item.count * 16)}px`, height: `${Math.max(48, item.count * 16)}px`, maxWidth: "96px", maxHeight: "96px" }}
              >
                {item.count}
              </div>
              <p className={`text-sm font-medium mt-2 ${item.textColor}`}>{item.label}</p>
              <p className="text-xs text-slate-500">{Math.round((item.count / 36) * 100)}% of districts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Division Comparison */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Division Comparison</h2>
        <div className="space-y-4">
          {divisions.map((div) => (
            <div key={div.division} className="border-b border-slate-700 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white text-sm">{div.division}</span>
                <span className="text-xs text-slate-400">{div.count} districts · Pop: {(div.totalPop / 1000000).toFixed(1)}M</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 mb-1">Heat Stress</p>
                  <Bar value={div.avgStress} color="bg-orange-500" />
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Water Stress</p>
                  <Bar value={div.avgWater} color="bg-blue-500" />
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Crop Risk</p>
                  <Bar value={div.avgCrop} color="bg-yellow-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 Stress Districts Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Top 10 Most Stressed Districts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">District</th>
                <th className="pb-3 font-medium">Division</th>
                <th className="pb-3 font-medium text-right">Heat</th>
                <th className="pb-3 font-medium text-right">Water</th>
                <th className="pb-3 font-medium text-right">Crop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {topStress.map((d, i) => (
                <tr key={d.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 text-slate-500">{i + 1}</td>
                  <td className="py-3 font-medium text-white">{d.name}</td>
                  <td className="py-3 text-slate-400">{d.division}</td>
                  <td className="py-3 text-right">
                    <span className={`font-semibold ${d.stressScore >= 80 ? "text-red-400" : d.stressScore >= 70 ? "text-orange-400" : "text-yellow-400"}`}>
                      {d.stressScore}
                    </span>
                  </td>
                  <td className="py-3 text-right text-blue-400">{d.waterStress}</td>
                  <td className="py-3 text-right text-yellow-400">{d.cropDamageRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
