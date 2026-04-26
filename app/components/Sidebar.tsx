"use client";

import { useState } from "react";
import Navbar from "./Navbar";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${collapsed ? "hidden" : "block"}`}
        onClick={() => setCollapsed(true)}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 bg-slate-800 border-r border-slate-700 transition-all duration-300 ${
          collapsed ? "w-0 overflow-hidden" : "w-64"
        } lg:relative lg:block`}
      >
        <div className="h-full flex flex-col">
          <Navbar />
        </div>
      </aside>
      {/* Toggle button for mobile */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed bottom-4 right-4 z-40 lg:hidden bg-emerald-500 text-white p-3 rounded-full shadow-lg"
      >
        {collapsed ? "☰" : "✕"}
      </button>
    </>
  );
}
