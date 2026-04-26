import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar - always visible on desktop */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex-col">
        <Navbar />
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
