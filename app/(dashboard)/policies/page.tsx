"use client";

import { useState, useEffect } from "react";

interface Policy {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  districtId: string | null;
  aiGenerated: boolean;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  REVIEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  APPROVED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUBLISHED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ARCHIVED: "bg-slate-600/20 text-slate-500 border-slate-600/30",
};

const CATEGORIES = [
  "Emergency Response",
  "Water Management",
  "Crop Insurance",
  "Pest Management",
  "Heat Mitigation",
  "Farmer Welfare",
  "Infrastructure",
  "Public Health",
];

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "Heat Mitigation",
    districtId: "",
    status: "DRAFT",
  });
  const [aiForm, setAiForm] = useState({
    category: "Heat Mitigation",
    districtId: "",
    prompt: "",
  });

  useEffect(() => {
    fetch("/api/policies")
      .then((r) => r.json())
      .then((d) => { setPolicies(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const { data } = await res.json();
      setPolicies((prev) => [data, ...prev]);
      setShowForm(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const res = await fetch("/api/policies/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiForm),
    });
    if (res.ok) {
      const data = await res.json();
      const newPolicy: Policy = {
        id: `policy-ai-${Date.now()}`,
        title: `AI: ${aiForm.category} Policy`,
        content: data.content,
        category: aiForm.category,
        status: "DRAFT",
        districtId: aiForm.districtId || null,
        aiGenerated: true,
        createdAt: new Date().toISOString(),
      };
      setPolicies((prev) => [newPolicy, ...prev]);
      setSelectedPolicy(newPolicy);
    }
    setGenerating(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Policies</h1>
          <p className="text-slate-400 text-sm mt-1">Government policies and advisories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Manual
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            🤖 AI Generate
          </button>
        </div>
      </div>

      {/* AI Generate Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">🤖 AI Policy Generator</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Category</label>
              <select
                value={aiForm.category}
                onChange={(e) => setAiForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">District (optional)</label>
              <input
                value={aiForm.districtId}
                onChange={(e) => setAiForm((f) => ({ ...f, districtId: e.target.value }))}
                placeholder="e.g. beed, nagpur"
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Additional Context</label>
              <input
                value={aiForm.prompt}
                onChange={(e) => setAiForm((f) => ({ ...f, prompt: e.target.value }))}
                placeholder="Focus on..."
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={generating}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {generating ? "⏳ Generating..." : "🤖 Generate Policy"}
          </button>
        </form>
      </div>

      {/* Manual Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Create Policy</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-400 block mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                >
                  {["DRAFT", "REVIEW", "APPROVED", "PUBLISHED"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-400 block mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  required
                  rows={5}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Create Policy
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Policies List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading policies...</div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <button
              key={policy.id}
              onClick={() => setSelectedPolicy(policy)}
              className="w-full bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl p-5 text-left transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{policy.title}</h3>
                    {policy.aiGenerated && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10">
                        🤖 AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[policy.status]}`}>
                      {policy.status}
                    </span>
                    <span className="text-xs text-slate-500">{policy.category}</span>
                    <span className="text-xs text-slate-500">{new Date(policy.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2">{policy.content}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPolicy(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedPolicy.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedPolicy.status]}`}>
                    {selectedPolicy.status}
                  </span>
                  <span className="text-xs text-slate-400">{selectedPolicy.category}</span>
                  {selectedPolicy.aiGenerated && <span className="text-xs text-purple-400">🤖 AI Generated</span>}
                </div>
              </div>
              <button onClick={() => setSelectedPolicy(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                {selectedPolicy.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
