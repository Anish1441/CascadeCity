"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function HeatmapPage() {
  const [layer, setLayer] = useState<"stress" | "water" | "crop">("stress");

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Maharashtra Heatmap</h1>
          <p className="text-sm text-slate-400">Interactive district-level stress visualization</p>
        </div>
        <div className="flex gap-2">
          {(["stress", "water", "crop"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                layer === l
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {l === "stress" ? "🔥 Heat Index" : l === "water" ? "💧 Water Stress" : "🌾 Crop Risk"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative">
        <MapComponent layer={layer} />
        {/* Legend */}
        <div className="absolute bottom-6 right-4 bg-slate-800/95 border border-slate-700 rounded-xl p-3 text-xs z-[1000]">
          <p className="font-semibold text-white mb-2">Stress Level</p>
          {[
            { color: "#ef4444", label: "Critical (80-100)" },
            { color: "#f97316", label: "High (70-79)" },
            { color: "#eab308", label: "Medium (60-69)" },
            { color: "#10b981", label: "Low (< 60)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-3 rounded"
                style={{ backgroundColor: item.color, opacity: 0.7 }}
              />
              <span className="text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
