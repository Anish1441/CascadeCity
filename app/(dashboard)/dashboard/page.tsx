import { DISTRICTS } from "@/lib/districts";

async function getWeatherData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/weather`,
      { next: { revalidate: 1800 } }
    );
    if (res.ok) return res.json();
  } catch {
    // ignore
  }
  return null;
}

function StressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value >= 75 ? "bg-red-500" : value >= 60 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-start gap-4`}>
      <div className={`${color} rounded-lg p-2 text-2xl`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const weatherRes = await getWeatherData();
  const weatherData = weatherRes?.data || [];

  const highStress = DISTRICTS.filter((d) => d.stressScore >= 75);
  const criticalDistricts = DISTRICTS.filter((d) => d.stressScore >= 80);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Maharashtra Heat & Agricultural Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time monitoring across 36 districts • Last updated:{" "}
          {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Districts" value={36} sub="6 divisions" icon="🏛️" color="bg-blue-500/20" />
        <StatCard label="Active Alerts" value={5} sub="2 critical" icon="🔔" color="bg-red-500/20" />
        <StatCard label="Active Policies" value={12} sub="3 pending review" icon="📋" color="bg-emerald-500/20" />
        <StatCard label="Farmers Reached" value="42.8L" sub="SMS alerts sent" icon="👨‍🌾" color="bg-yellow-500/20" />
      </div>

      {/* Critical Alert Banner */}
      {criticalDistricts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-400">Critical Heat Stress Alert</p>
            <p className="text-sm text-slate-300 mt-1">
              {criticalDistricts.map((d) => d.name).join(", ")} showing critical stress levels (80+/100).
              Immediate intervention required.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Summary */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>🌡️</span> Live Weather - Key Cities
          </h2>
          {weatherData.length > 0 ? (
            <div className="space-y-3">
              {weatherData.map(
                (w: {
                  city: string;
                  temperature: number;
                  humidity: number;
                  windSpeed: number;
                  condition: string;
                  heatIndex: number;
                }) => (
                  <div key={w.city} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="font-medium text-white text-sm">{w.city}</p>
                      <p className="text-xs text-slate-400">{w.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-semibold">{Math.round(w.temperature)}°C</p>
                      <p className="text-xs text-slate-400">
                        HI: {Math.round(w.heatIndex)}°C | {Math.round(w.humidity)}% RH
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Loading weather data...</p>
          )}
        </div>

        {/* High Stress Districts */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔥</span> High Stress Districts (70+)
          </h2>
          <div className="space-y-3">
            {highStress.slice(0, 8).map((d) => (
              <div key={d.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{d.name}</span>
                  <span
                    className={`font-semibold ${
                      d.stressScore >= 80 ? "text-red-400" : "text-yellow-400"
                    }`}
                  >
                    {d.stressScore}/100
                  </span>
                </div>
                <StressBar value={d.stressScore} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Stress Overview */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span>📊</span> District Stress Overview - All 36 Districts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {DISTRICTS.map((d) => {
            const color =
              d.stressScore >= 80
                ? "border-red-500/50 bg-red-500/10"
                : d.stressScore >= 70
                ? "border-orange-500/50 bg-orange-500/10"
                : d.stressScore >= 60
                ? "border-yellow-500/50 bg-yellow-500/10"
                : "border-emerald-500/50 bg-emerald-500/10";
            const textColor =
              d.stressScore >= 80
                ? "text-red-400"
                : d.stressScore >= 70
                ? "text-orange-400"
                : d.stressScore >= 60
                ? "text-yellow-400"
                : "text-emerald-400";
            return (
              <div key={d.id} className={`border rounded-lg p-3 ${color}`}>
                <p className="text-xs text-slate-300 font-medium truncate">{d.name}</p>
                <p className={`text-lg font-bold ${textColor}`}>{d.stressScore}</p>
                <p className="text-xs text-slate-500">{d.division}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block" />Critical (80+)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded-full inline-block" />High (70-79)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded-full inline-block" />Medium (60-69)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" />Low (&lt;60)</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/alerts"
            className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔔 Create Alert
          </a>
          <a
            href="/policies"
            className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📋 New Policy
          </a>
          <a
            href="/heatmap"
            className="bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🗺️ View Heatmap
          </a>
          <a
            href="/chat"
            className="bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🤖 AI Advisor
          </a>
        </div>
      </div>
    </div>
  );
}
