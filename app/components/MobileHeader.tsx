"use client";

import { useState } from "react";
import Navbar from "./Navbar";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar — hidden on lg+ */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌡️</span>
          <span className="text-base font-bold text-emerald-400">CascadeCity</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-300 hover:text-white p-1"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Mobile overlay drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌡️</span>
                <span className="font-bold text-emerald-400">CascadeCity</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto"
              onClick={() => setOpen(false)}
            >
              <Navbar />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
