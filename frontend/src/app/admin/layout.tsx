"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
  ];

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="flex bg-surface min-h-screen font-inter text-zinc-950">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
        
        <motion.main 
          initial={false}
          animate={{ marginLeft: isCollapsed ? 60 : 240 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col min-w-0"
        >
          {/* TopNavBar Component */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-10 py-5 w-full border-b border-zinc-100">
            <div className="flex items-center gap-10">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 pr-4">Dashboard</h1>
              <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block"></div>
              <nav className="hidden lg:flex gap-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm tracking-tight transition-all pb-1 border-b-2 font-medium",
                      pathname === link.href 
                        ? "text-zinc-950 border-zinc-950" 
                        : "text-zinc-500 border-transparent hover:text-zinc-950 hover:border-zinc-200"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-6">
              <Button 
                variant="icon" 
                size="none" 
                onClick={() => router.push("/admin/notifications")}
                className="text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 p-2.5 rounded-full transition-all"
                icon={<Bell size={20} />}
              />
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                <span className="text-xs font-bold text-zinc-600">JD</span>
              </div>
            </div>
          </header>

          <div className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </motion.main>
      </div>
    </ProtectedRoute>
  );
}
