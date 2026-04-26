"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/heatmap", label: "Heatmap", icon: "🗺️" },
  { href: "/districts", label: "Districts", icon: "🏛️" },
  { href: "/policies", label: "Policies", icon: "📋" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/chat", label: "AI Chat", icon: "🤖" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌡️</span>
          <div>
            <h1 className="text-lg font-bold text-emerald-400">CascadeCity</h1>
            <p className="text-xs text-slate-400">Maharashtra Intel Platform</p>
          </div>
        </div>
      </div>
      <ul className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          Maharashtra Heat Intelligence v1.0
        </div>
      </div>
    </nav>
  );
}
