import Navbar from "../components/Navbar";
import MobileHeader from "../components/MobileHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex-col">
        <Navbar />
      </aside>
      {/* Main area: mobile header + scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
