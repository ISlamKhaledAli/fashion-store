import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-surface min-h-screen">
      <AdminSidebar />
      <main className="ml-64 flex-1 flex flex-col">
        {/* Admin Top Nav */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 w-full border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-on-surface">Overview</h1>
            <div className="h-4 w-px bg-outline-variant/30"></div>
            <nav className="flex gap-6">
              <span className="text-on-surface font-semibold border-b-2 border-primary pb-1 text-sm tracking-tight cursor-pointer">
                Real-time
              </span>
              <span className="text-on-surface-variant hover:opacity-70 transition-opacity text-sm tracking-tight cursor-pointer">
                Historical
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-on-surface-variant hover:opacity-70 transition-opacity flex items-center justify-center">
              <Bell size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
