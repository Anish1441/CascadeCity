"use client";

import { useState } from "react";
import { DISTRICTS, DIVISIONS, type Division } from "@/lib/districts";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : score >= 70
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : score >= 60
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {score}
    </span>
  );
}

function StressBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-red-500" : value >= 70 ? "bg-orange-500" : value >= 60 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="w-full bg-slate-700 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function DistrictsPage() {
  const [divisionFilter, setDivisionFilter] = useState<Division | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<(typeof DISTRICTS)[0] | null>(null);

  const filtered = DISTRICTS.filter((d) => {
    const matchDiv = divisionFilter === "All" || d.division === divisionFilter;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchDiv && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Maharashtra Districts</h1>
        <p className="text-slate-400 text-sm mt-1">All 36 districts with stress indicators</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search districts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 w-48"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDivisionFilter("All")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              divisionFilter === "All"
                ? "bg-emerald-500 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            All ({DISTRICTS.length})
          </button>
          {DIVISIONS.map((div) => (
            <button
              key={div}
              onClick={() => setDivisionFilter(div)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                divisionFilter === div
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {div} ({DISTRICTS.filter((d) => d.division === div).length})
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-sm">{filtered.length} districts</span>
      </div>

      {/* Districts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((district) => (
          <button
            key={district.id}
            onClick={() => setSelectedDistrict(district)}
            className="bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-left transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white text-sm leading-tight">{district.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{district.division} Division</p>
              </div>
              <ScoreBadge score={district.stressScore} />
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Heat Stress</span><span>{district.stressScore}</span>
                </div>
                <StressBar value={district.stressScore} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Water Stress</span><span>{district.waterStress}</span>
                </div>
                <StressBar value={district.waterStress} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Crop Risk</span><span>{district.cropDamageRisk}</span>
                </div>
                <StressBar value={district.cropDamageRisk} />
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>Pop: {(district.population / 1000000).toFixed(1)}M</span>
              <span>{district.talukas.length} talukas</span>
            </div>
          </button>
        ))}
      </div>

      {/* District Detail Modal */}
      {selectedDistrict && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDistrict(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedDistrict.name}</h2>
                <p className="text-slate-400 text-sm">{selectedDistrict.division} Division • Code: {selectedDistrict.code}</p>
              </div>
              <button onClick={() => setSelectedDistrict(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Heat Stress", value: selectedDistrict.stressScore },
                { label: "Water Stress", value: selectedDistrict.waterStress },
                { label: "Crop Risk", value: selectedDistrict.cropDamageRisk },
                { label: "Population", value: `${(selectedDistrict.population / 1000000).toFixed(2)}M` },
                { label: "Area", value: `${selectedDistrict.area.toLocaleString()} km²` },
                { label: "Coordinates", value: `${selectedDistrict.lat.toFixed(2)}, ${selectedDistrict.lng.toFixed(2)}` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Talukas ({selectedDistrict.talukas.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedDistrict.talukas.map((t) => (
                  <span key={t} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
