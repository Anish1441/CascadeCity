"use client";

import { useState, useEffect } from "react";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  districtId: string | null;
  isActive: boolean;
  sentAt: string | null;
  createdAt: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const TYPE_ICONS: Record<string, string> = {
  WEATHER: "🌡️",
  FLOOD: "🌊",
  DROUGHT: "🏜️",
  PEST: "🐛",
  DISEASE: "🦠",
  MARKET: "💰",
  GOVERNMENT: "🏛️",
  EMERGENCY: "🚨",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "WEATHER",
    severity: "HIGH",
    districtId: "",
  });

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => { setAlerts(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const { data } = await res.json();
      setAlerts((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ title: "", message: "", type: "WEATHER", severity: "HIGH", districtId: "" });
    }
  };

  const handleSend = async (id: string) => {
    setSending(id);
    const res = await fetch(`/api/alerts/${id}`, { method: "POST" });
    if (res.ok) {
      const { sentAt } = await res.json();
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, sentAt } : a)));
    }
    setSending(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and broadcast district alerts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Create Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">New Alert</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                >
                  {["WEATHER", "FLOOD", "DROUGHT", "PEST", "DISEASE", "MARKET", "GOVERNMENT", "EMERGENCY"].map((t) => (
                    <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                >
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">District (optional)</label>
                <input
                  value={form.districtId}
                  onChange={(e) => setForm((f) => ({ ...f, districtId: e.target.value }))}
                  placeholder="District ID or leave blank"
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Create Alert
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading alerts...</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl leading-none mt-0.5">{TYPE_ICONS[alert.type] || "📢"}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white">{alert.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_COLORS[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-slate-600 text-slate-400">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(alert.createdAt).toLocaleString("en-IN")}
                      {alert.sentAt && (
                        <span className="text-emerald-400 ml-2">✓ Sent {new Date(alert.sentAt).toLocaleString("en-IN")}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  {!alert.sentAt ? (
                    <button
                      onClick={() => handleSend(alert.id)}
                      disabled={sending === alert.id}
                      className="bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {sending === alert.id ? "Sending..." : "📤 Send SMS"}
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-xs">✓ Sent</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
