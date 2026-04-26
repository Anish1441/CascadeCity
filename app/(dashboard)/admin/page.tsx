import { DISTRICTS } from "@/lib/districts";

const MOCK_USERS = [
  { id: "u1", name: "Rajesh Patil", phone: "+919876543210", role: "ADMIN", isActive: true, lastLogin: new Date(Date.now() - 3600000).toISOString() },
  { id: "u2", name: "Sunita Deshmukh", phone: "+919988776655", role: "OFFICER", isActive: true, lastLogin: new Date(Date.now() - 7200000).toISOString() },
  { id: "u3", name: "Prakash Shinde", phone: "+918877665544", role: "OFFICER", isActive: true, lastLogin: new Date(Date.now() - 86400000).toISOString() },
  { id: "u4", name: "Kavita Jadhav", phone: "+917766554433", role: "USER", isActive: false, lastLogin: null },
];

const MOCK_AUDIT_LOGS = [
  { id: "a1", action: "CREATE", entity: "Alert", entityId: "alert-1", details: "Created heat wave warning for Nagpur", createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "a2", action: "PUBLISH", entity: "Policy", entityId: "policy-1", details: "Published heat wave emergency protocol", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "a3", action: "SEND", entity: "Alert", entityId: "alert-2", details: "SMS alerts sent to 4,280 farmers in Beed", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "a4", action: "LOGIN", entity: "User", entityId: "u1", details: "Admin login from Pune", createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: "a5", action: "GENERATE", entity: "Policy", entityId: "policy-4", details: "AI policy generated for Akola pest management", createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
  OFFICER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USER: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-400",
  PUBLISH: "text-blue-400",
  SEND: "text-yellow-400",
  LOGIN: "text-slate-400",
  GENERATE: "text-purple-400",
  DELETE: "text-red-400",
};

export default function AdminPage() {
  const totalPopulation = DISTRICTS.reduce((s, d) => s + d.population, 0);
  const avgStress = Math.round(DISTRICTS.reduce((s, d) => s + d.stressScore, 0) / DISTRICTS.length);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-slate-400 text-sm mt-1">System management and audit logs</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Districts", value: 36, icon: "🏛️", color: "bg-blue-500/20" },
          { label: "Total Population", value: `${(totalPopulation / 10000000).toFixed(1)}Cr`, icon: "👥", color: "bg-emerald-500/20" },
          { label: "Avg Heat Stress", value: `${avgStress}/100`, icon: "🌡️", color: "bg-orange-500/20" },
          { label: "System Users", value: MOCK_USERS.length, icon: "👤", color: "bg-purple-500/20" },
        ].map((item) => (
          <div key={item.label} className={`${item.color} border border-slate-700 rounded-xl p-5`}>
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="text-slate-400 text-sm">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 font-medium text-white">{user.name}</td>
                  <td className="py-3 text-slate-400 font-mono text-xs">{user.phone}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs ${user.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                      {user.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-xs">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString("en-IN")
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Audit Log</h2>
        <div className="space-y-3">
          {MOCK_AUDIT_LOGS.map((log) => (
            <div key={log.id} className="flex items-start gap-3 border-b border-slate-700 pb-3 last:border-0 last:pb-0">
              <span className={`font-mono text-xs font-bold mt-0.5 w-16 shrink-0 ${ACTION_COLORS[log.action] || "text-slate-400"}`}>
                {log.action}
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-300">{log.details}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {log.entity} · {new Date(log.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Status */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Environment Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            { label: "Database", status: process.env.DATABASE_URL ? "Connected" : "Not configured", ok: !!process.env.DATABASE_URL },
            { label: "Groq AI", status: process.env.GROQ_API_KEY ? "Configured" : "Using mock", ok: !!process.env.GROQ_API_KEY },
            { label: "Twilio SMS", status: process.env.TWILIO_ACCOUNT_SID ? "Configured" : "Simulated", ok: !!process.env.TWILIO_ACCOUNT_SID },
            { label: "Weather API", status: "OpenMeteo (Free)", ok: true },
          ].map((item) => (
            <div key={item.label} className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">{item.label}</p>
              <p className={`font-medium ${item.ok ? "text-emerald-400" : "text-yellow-400"}`}>
                {item.ok ? "✓" : "⚠"} {item.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
